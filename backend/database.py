"""
Async data-access layer over PostgreSQL (asyncpg), matching database/schema.sql.
Every function used by the routers/services is implemented here.
"""
import asyncpg
import hashlib
import json
from datetime import datetime

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(dsn="postgresql://user:pass@localhost:5432/land_records")
    return _pool


# --- Documents -------------------------------------------------------
async def insert_document(document_id, filename, storage_path, file_hash):
    pool = await get_pool()
    await pool.execute(
        """INSERT INTO documents (document_id, original_filename, storage_path, file_hash, upload_status)
           VALUES ($1, $2, $3, $4, 'queued')""",
        document_id, filename, storage_path, file_hash,
    )


async def find_document_by_hash(file_hash):
    pool = await get_pool()
    return await pool.fetchrow("SELECT * FROM documents WHERE file_hash = $1", file_hash)


async def get_document(document_id):
    pool = await get_pool()
    return await pool.fetchrow("SELECT * FROM documents WHERE document_id = $1", document_id)


async def list_documents(status_filter=None, limit=50):
    pool = await get_pool()
    if status_filter:
        return await pool.fetch(
            "SELECT * FROM documents WHERE upload_status = $1 ORDER BY uploaded_at DESC LIMIT $2",
            status_filter, limit,
        )
    return await pool.fetch("SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT $1", limit)


async def update_document_status(document_id, status):
    pool = await get_pool()
    await pool.execute(
        "UPDATE documents SET upload_status = $1, processed_at = now() WHERE document_id = $2",
        status, document_id,
    )


async def set_processed_path(document_id, processed_path):
    pool = await get_pool()
    await pool.execute(
        "UPDATE documents SET processed_path = $1 WHERE document_id = $2", processed_path, document_id
    )


# --- Land records ------------------------------------------------------
async def create_land_record(document_id, fields: dict, overall_confidence: float):
    pool = await get_pool()
    record = await pool.fetchrow(
        """INSERT INTO land_records (document_id, khasra_number, khata_number, overall_confidence)
           VALUES ($1, $2, $3, $4) RETURNING record_id""",
        document_id,
        fields.get("khasra_number", {}).get("value"),
        fields.get("khata_number", {}).get("value"),
        overall_confidence,
    )
    record_id = record["record_id"]

    for field_name, data in fields.items():
        await pool.execute(
            """INSERT INTO extracted_fields (record_id, field_name, normalized_value, confidence_score)
               VALUES ($1, $2, $3, $4)""",
            record_id, field_name, data.get("value"), data.get("confidence", 0.0),
        )
    return record_id


async def get_land_record(record_id):
    pool = await get_pool()
    return await pool.fetchrow("SELECT * FROM land_records WHERE record_id = $1", record_id)


async def get_land_record_with_fields(record_id):
    pool = await get_pool()
    record = await pool.fetchrow("SELECT * FROM land_records WHERE record_id = $1", record_id)
    if not record:
        return None
    fields = await pool.fetch("SELECT * FROM extracted_fields WHERE record_id = $1", record_id)
    return {**dict(record), "fields": [dict(f) for f in fields]}


async def search_land_records(village=None, khasra_number=None, validation_status=None,
                               min_confidence=None, limit=50):
    pool = await get_pool()
    conditions, params = [], []
    if khasra_number:
        params.append(khasra_number)
        conditions.append(f"khasra_number = ${len(params)}")
    if validation_status:
        params.append(validation_status)
        conditions.append(f"validation_status = ${len(params)}")
    if min_confidence is not None:
        params.append(min_confidence)
        conditions.append(f"overall_confidence >= ${len(params)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params.append(limit)
    query = f"SELECT * FROM land_records {where_clause} ORDER BY created_at DESC LIMIT ${len(params)}"
    return await pool.fetch(query, *params)


async def update_extracted_field(record_id, field_name, corrected_value):
    pool = await get_pool()
    await pool.execute(
        """UPDATE extracted_fields SET normalized_value = $1, is_manually_corrected = TRUE,
           corrected_at = now(), confidence_score = 100
           WHERE record_id = $2 AND field_name = $3""",
        corrected_value, record_id, field_name,
    )


async def recompute_record_confidence(record_id):
    pool = await get_pool()
    avg_conf = await pool.fetchval(
        "SELECT AVG(confidence_score) FROM extracted_fields WHERE record_id = $1", record_id
    )
    await pool.execute(
        "UPDATE land_records SET overall_confidence = $1, updated_at = now() WHERE record_id = $2",
        round(avg_conf or 0, 2), record_id,
    )


async def set_validation_status(record_id, status):
    pool = await get_pool()
    await pool.execute(
        "UPDATE land_records SET validation_status = $1, updated_at = now() WHERE record_id = $2",
        status, record_id,
    )


# --- Validation rules ----------------------------------------------------
async def save_validation_results(record_id, results: list[dict]):
    pool = await get_pool()
    for r in results:
        await pool.execute(
            """INSERT INTO validation_results (record_id, passed, details)
               VALUES ($1, $2, $3)""",
            record_id, r["passed"], json.dumps(r["details"]),
        )


async def get_validation_failure_breakdown():
    pool = await get_pool()
    return await pool.fetch(
        """SELECT vr.rule_id, COUNT(*) AS failure_count
           FROM validation_results vr WHERE vr.passed = FALSE
           GROUP BY vr.rule_id ORDER BY failure_count DESC"""
    )


# --- Review queue ----------------------------------------------------
async def add_to_review_queue(record_id, priority="normal"):
    pool = await get_pool()
    await pool.execute(
        "INSERT INTO review_queue (record_id, priority) VALUES ($1, $2)", record_id, priority
    )


async def get_review_queue(assigned_to=None, priority=None):
    pool = await get_pool()
    conditions, params = ["status = 'pending'"], []
    if assigned_to:
        params.append(assigned_to)
        conditions.append(f"assigned_to = ${len(params)}")
    if priority:
        params.append(priority)
        conditions.append(f"priority = ${len(params)}")
    query = f"SELECT * FROM review_queue WHERE {' AND '.join(conditions)} ORDER BY created_at ASC"
    return await pool.fetch(query, *params)


async def resolve_review_queue_item(record_id, notes):
    pool = await get_pool()
    await pool.execute(
        """UPDATE review_queue SET status = 'resolved', review_notes = $1, resolved_at = now()
           WHERE record_id = $2""",
        notes, record_id,
    )


# --- Audit log (hash-chained) ------------------------------------------
async def write_audit_log(record_id, user_id, action, old_value=None, new_value=None):
    pool = await get_pool()
    previous_hash = await pool.fetchval(
        "SELECT current_hash FROM audit_log WHERE record_id = $1 ORDER BY log_id DESC LIMIT 1",
        record_id,
    ) or "genesis"
    payload = f"{previous_hash}{action}{json.dumps(new_value or {})}{datetime.utcnow().isoformat()}"
    current_hash = hashlib.sha256(payload.encode()).hexdigest()

    await pool.execute(
        """INSERT INTO audit_log (record_id, user_id, action, old_value, new_value, previous_hash, current_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7)""",
        record_id, user_id, action,
        json.dumps(old_value) if old_value else None,
        json.dumps(new_value) if new_value else None,
        previous_hash, current_hash,
    )


# --- External sync (DILRMP/LRMS/GIS) -----------------------------------
async def queue_external_sync(record_id, target_system):
    pool = await get_pool()
    await pool.execute(
        "INSERT INTO external_sync_log (record_id, target_system) VALUES ($1, $2)",
        record_id, target_system,
    )


# --- Dashboard ---------------------------------------------------------
async def get_dashboard_summary():
    pool = await get_pool()
    row = await pool.fetchrow(
        """SELECT
             (SELECT COUNT(*) FROM documents) AS total_documents,
             (SELECT COUNT(*) FROM land_records WHERE validation_status IN ('approved','auto_approved')) AS digitized,
             (SELECT COUNT(*) FROM review_queue WHERE status = 'pending') AS pending_verification,
             (SELECT ROUND(AVG(overall_confidence), 2) FROM land_records) AS overall_accuracy"""
    )
    district_progress = await pool.fetch("SELECT * FROM dashboard_summary")
    return {**dict(row), "district_progress": [dict(d) for d in district_progress]}


async def get_district_progress():
    pool = await get_pool()
    return await pool.fetch("SELECT * FROM dashboard_summary")


# --- Users / auth --------------------------------------------------------
async def get_user_by_username(username):
    pool = await get_pool()
    return await pool.fetchrow(
        """SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id
           WHERE u.username = $1""",
        username,
    )


async def get_user_by_id(user_id):
    pool = await get_pool()
    return await pool.fetchrow(
        """SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id
           WHERE u.user_id = $1""",
        user_id,
    )


async def update_last_login(user_id):
    pool = await get_pool()
    await pool.execute("UPDATE users SET last_login = now() WHERE user_id = $1", user_id)
