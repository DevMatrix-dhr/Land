"""Human verification queue: assign, review, approve/flag records."""
from fastapi import APIRouter, HTTPException
from schemas import RecordApproval
import database as db

router = APIRouter()


@router.get("/queue")
async def get_review_queue(assigned_to: str | None = None, priority: str | None = None):
    """Backs the Tehsildar Verification UI's pending-cases list."""
    return await db.get_review_queue(assigned_to=assigned_to, priority=priority)


@router.post("/decide")
async def decide_record(decision: RecordApproval):
    """
    Applies an approve/flag/reject decision from the side-by-side
    verification dashboard, updates status, and logs to the audit trail.
    """
    if decision.action not in ("approve", "flag", "reject"):
        raise HTTPException(status_code=400, detail="Invalid action")

    status_map = {"approve": "approved", "flag": "flagged", "reject": "rejected"}
    await db.set_validation_status(decision.record_id, status_map[decision.action])
    await db.resolve_review_queue_item(decision.record_id, decision.notes)
    await db.write_audit_log(
        record_id=decision.record_id,
        user_id=decision.reviewer_id,
        action=decision.action,
        new_value={"notes": decision.notes},
    )

    if decision.action == "approve":
        await db.queue_external_sync(decision.record_id, target_system="DILRMP")

    return {"record_id": decision.record_id, "new_status": status_map[decision.action]}


@router.post("/{record_id}/rescan")
async def flag_for_rescan(record_id: str, reviewer_id: str):
    """'Flag for Re-scan' button on the verification desk."""
    await db.set_validation_status(record_id, "flagged")
    await db.write_audit_log(record_id=record_id, user_id=reviewer_id, action="flagged_for_rescan")
    return {"record_id": record_id, "status": "flagged_for_rescan"}
