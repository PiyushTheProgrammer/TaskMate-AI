import os
import psutil
import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db, DB_PATH
from ..models import User, AuditLog, SystemConfig
from ..auth import get_current_user
from ..audit import log_audit

router = APIRouter(prefix="/api/admin", tags=["Administrator Functions"])

SERVER_START_TIME = time.time()

class ConfigUpdate(BaseModel):
    openai_api_key: Optional[str] = None
    ai_model: Optional[str] = "gpt-4o-mini"
    temperature: Optional[float] = 0.5
    ai_mode: Optional[str] = "hybrid" # hybrid, simulation, openai_only

@router.get("/users")
def list_system_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "hourly_rate": u.hourly_rate,
            "skills": u.skills,
            "company": u.company,
            "created_at": u.created_at
        } for u in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    target.role = role
    db.commit()
    log_audit(db, "ROLE_UPDATE", current_user.id, "User", user_id, f"Changed role to {role}")
    return {"message": "Role updated", "user_id": user_id, "role": role}

@router.get("/config")
def get_ai_and_system_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    key_cfg = db.query(SystemConfig).filter(SystemConfig.key == "OPENAI_API_KEY").first()
    model_cfg = db.query(SystemConfig).filter(SystemConfig.key == "AI_MODEL").first()
    temp_cfg = db.query(SystemConfig).filter(SystemConfig.key == "TEMPERATURE").first()
    mode_cfg = db.query(SystemConfig).filter(SystemConfig.key == "AI_MODE").first()

    raw_key = key_cfg.value if key_cfg else os.getenv("OPENAI_API_KEY", "")
    masked_key = f"{raw_key[:7]}...{raw_key[-4:]}" if len(raw_key) > 12 else ("Configured" if raw_key else "Not Configured")

    return {
        "openai_key_configured": bool(raw_key),
        "openai_key_masked": masked_key,
        "ai_model": model_cfg.value if model_cfg else "gpt-4o-mini",
        "temperature": float(temp_cfg.value) if temp_cfg else 0.5,
        "ai_mode": mode_cfg.value if mode_cfg else "hybrid (OpenAI with Intelligent Local Fallback)"
    }

@router.post("/config")
def update_ai_configuration(
    req: ConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.openai_api_key is not None:
        cfg = db.query(SystemConfig).filter(SystemConfig.key == "OPENAI_API_KEY").first()
        if not cfg:
            cfg = SystemConfig(key="OPENAI_API_KEY", value=req.openai_api_key)
            db.add(cfg)
        else:
            cfg.value = req.openai_api_key
            cfg.updated_at = datetime.utcnow()
        os.environ["OPENAI_API_KEY"] = req.openai_api_key

    if req.ai_model:
        cfg = db.query(SystemConfig).filter(SystemConfig.key == "AI_MODEL").first()
        if not cfg:
            cfg = SystemConfig(key="AI_MODEL", value=req.ai_model)
            db.add(cfg)
        else:
            cfg.value = req.ai_model
            cfg.updated_at = datetime.utcnow()

    if req.temperature is not None:
        cfg = db.query(SystemConfig).filter(SystemConfig.key == "TEMPERATURE").first()
        if not cfg:
            cfg = SystemConfig(key="TEMPERATURE", value=str(req.temperature))
            db.add(cfg)
        else:
            cfg.value = str(req.temperature)
            cfg.updated_at = datetime.utcnow()

    db.commit()
    log_audit(db, "CONFIG_UPDATE", current_user.id, "SystemConfig", None, "Updated AI model configuration")
    return {"message": "Configuration updated successfully"}

@router.get("/audit-logs")
def get_audit_trail(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "timestamp": l.timestamp
        } for l in logs
    ]

@router.get("/health-metrics")
def get_system_health(
    current_user: User = Depends(get_current_user)
):
    uptime_sec = int(time.time() - SERVER_START_TIME)
    db_size_kb = 0
    if os.path.exists(DB_PATH):
        db_size_kb = round(os.path.getsize(DB_PATH) / 1024, 2)

    return {
        "status": "Operational",
        "uptime_seconds": uptime_sec,
        "database_size_kb": db_size_kb,
        "cpu_usage_percent": psutil.cpu_percent(),
        "memory_usage_percent": psutil.virtual_memory().percent,
        "active_processes": len(psutil.pids())
    }
