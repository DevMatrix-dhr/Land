"""
Intelligent Land Record Digitization and Validation System
FastAPI backend entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import documents, records, verification, dashboard, auth

app = FastAPI(
    title="Land Record Digitization API",
    description="AI-powered OCR, NLP extraction, and validation pipeline for legacy land records.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # restrict to frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document Ingestion"])
app.include_router(records.router, prefix="/api/records", tags=["Land Records"])
app.include_router(verification.router, prefix="/api/verification", tags=["Human Verification"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Analytics Dashboard"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "land-record-digitization"}
