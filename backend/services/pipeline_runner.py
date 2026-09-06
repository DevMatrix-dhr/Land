"""
Orchestrates the full document -> structured, validated record flow.
Called as a background task after upload.
"""
from services import ai_pipeline
import database as db


async def process_document_pipeline(document_id: str, storage_path: str):
    await db.update_document_status(document_id, "processing")

    # Tier 1: Forensics preprocessing
    processed_path = ai_pipeline.preprocess_document(storage_path)
    await db.set_processed_path(document_id, processed_path)

    # Tier 2: OCR + NLP field extraction
    ocr_spans = ai_pipeline.run_ocr(processed_path)
    fields = ai_pipeline.extract_structured_fields(ocr_spans)
    overall_confidence = ai_pipeline.compute_overall_confidence(fields)

    record_id = await db.create_land_record(document_id, fields, overall_confidence)

    # Tier 3: Deterministic validation
    record = await db.get_land_record(record_id)
    validation_results = ai_pipeline.run_validation_rules(record)
    await db.save_validation_results(record_id, validation_results)

    # Routing: high confidence -> auto-approve, else -> human review queue
    if overall_confidence >= 95.0 and all(r["passed"] for r in validation_results):
        await db.set_validation_status(record_id, "auto_approved")
    else:
        await db.set_validation_status(record_id, "needs_review")
        await db.add_to_review_queue(record_id)

    await db.update_document_status(document_id, "validated")
