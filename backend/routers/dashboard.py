"""Aggregate stats for the state/district-level analytics dashboard."""
from fastapi import APIRouter
from schemas import DashboardStats
import database as db

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Total documents, digitized count, pending verification, accuracy."""
    return await db.get_dashboard_summary()


@router.get("/district-progress")
async def get_district_progress():
    """State-wise / district-wise digitization progress for the map view."""
    return await db.get_district_progress()


@router.get("/error-stats")
async def get_error_stats():
    """Breakdown of validation-rule failures for the error-statistics panel."""
    return await db.get_validation_failure_breakdown()
