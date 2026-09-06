"""
Document ingestion endpoints.
Handles drag-and-drop upload, duplicate detection, and kicks off the
async AI pipeline (preprocess -> OCR -> extract -> validate).
"""
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException

from services import ai_pipeline
from services.pipeline_runner import process_document_pipeline
import database as db

router = APIRouter()

UPLOAD_DIR = "/data/uploads"


@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Accepts a single scanned document (PDF/JPEG/TIFF), stores it,
    checks for duplicates via hash, and queues background processing.
    """
    contents = await file.read()
    file_hash = ai_pipeline.compute_file_hash(contents)

    existing = await db.find_document_by_hash(file_hash)
    if existing:
        raise HTTPException(status_code=409, detail="Duplicate document already ingested")

    document_id = str(uuid.uuid4())
    storage_path = f"{UPLOAD_DIR}/{document_id}_{file.filename}"
    with open(storage_path, "wb") as f:
        f.write(contents)

    await db.insert_document(document_id, file.filename, storage_path, file_hash)

    # Runs preprocessing/OCR/extraction/validation off the request thread
    background_tasks.add_task(process_document_pipeline, document_id, storage_path)

    return {"document_id": document_id, "upload_status": "queued",
            "message": "Document received and queued for AI processing."}


@router.post("/upload-batch")
async def upload_batch(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    """Bulk ingestion for folder-watcher style batch uploads (100+ docs)."""
    queued = []
    for file in files:
        result = await upload_document(background_tasks, file)
        queued.append(result)
    return {"queued_count": len(queued), "documents": queued}


@router.get("/{document_id}/status")
async def get_document_status(document_id: str):
    doc = await db.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/")
async def list_documents(status: str | None = None, limit: int = 50):
    """Powers the ingestion dashboard's document list/queue view."""
    return await db.list_documents(status_filter=status, limit=limit)
