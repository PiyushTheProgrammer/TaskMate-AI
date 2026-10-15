from typing import Optional
from sqlalchemy.orm import Session
from .models import AuditLog

def log_audit(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[str] = None
):
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to record audit log: {e}")
        db.rollback()
