"""Pydantic request/response models."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class DocumentUploadResponse(BaseModel):
    document_id: UUID
    upload_status: str
    message: str


class ExtractedField(BaseModel):
    field_name: str
    raw_ocr_text: Optional[str]
    normalized_value: Optional[str]
    confidence_score: float
    bounding_box: Optional[dict]


class LandRecordOut(BaseModel):
    record_id: UUID
    khasra_number: Optional[str]
    khata_number: Optional[str]
    landowner_name: Optional[str]
    plot_area_value: Optional[float]
    village: Optional[str]
    overall_confidence: float
    validation_status: str
    fields: list[ExtractedField] = []


class FieldCorrection(BaseModel):
    field_name: str
    corrected_value: str
    corrected_by: UUID


class RecordApproval(BaseModel):
    record_id: UUID
    action: str          # 'approve' | 'flag' | 'reject'
    reviewer_id: UUID
    notes: Optional[str] = None


class DashboardStats(BaseModel):
    total_documents: int
    digitized: int
    pending_verification: int
    overall_accuracy: float
    district_progress: list[dict]
