"""Land record read/search/update endpoints."""
from fastapi import APIRouter, HTTPException
from schemas import LandRecordOut, FieldCorrection
import database as db

router = APIRouter()


@router.get("/{record_id}", response_model=LandRecordOut)
async def get_record(record_id: str):
    record = await db.get_land_record_with_fields(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/")
async def search_records(
    village: str | None = None,
    khasra_number: str | None = None,
    validation_status: str | None = None,
    min_confidence: float | None = None,
    limit: int = 50,
):
    """Powers search/filter on the verification dashboard and public lookup."""
    return await db.search_land_records(
        village=village,
        khasra_number=khasra_number,
        validation_status=validation_status,
        min_confidence=min_confidence,
        limit=limit,
    )


@router.patch("/{record_id}/field")
async def correct_field(record_id: str, correction: FieldCorrection):
    """
    Applies a manual correction from the side-by-side verification UI
    and writes an audit-log entry.
    """
    await db.update_extracted_field(record_id, correction.field_name, correction.corrected_value)
    await db.write_audit_log(
        record_id=record_id,
        user_id=correction.corrected_by,
        action="field_corrected",
        new_value={correction.field_name: correction.corrected_value},
    )
    await db.recompute_record_confidence(record_id)
    return {"status": "updated", "field_name": correction.field_name}
