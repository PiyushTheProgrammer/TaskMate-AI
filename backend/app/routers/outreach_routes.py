from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Client, OutreachMessage
from ..schemas import OutreachGenerateRequest, OutreachCreate, OutreachResponse
from ..auth import get_current_user
from ..ai_service import generate_outreach_message

router = APIRouter(prefix="/api/outreach", tags=["Outreach Automation"])

@router.post("/generate")
def generate_message(
    req: OutreachGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == req.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    content = generate_outreach_message(
        client_name=client.name,
        purpose=req.purpose,
        tone=req.tone or "Professional",
        channel=req.channel or "Email",
        freelancer_name=current_user.full_name
    )
    return {
        "client_id": client.id,
        "client_name": client.name,
        "channel": req.channel,
        **content
    }

@router.post("/send", response_model=OutreachResponse)
def send_or_schedule_message(
    req: OutreachCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == req.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    status = req.status or "Sent"
    sent_time = datetime.utcnow() if status == "Sent" else None

    # update client's last interaction
    client.last_interaction = datetime.utcnow()

    msg = OutreachMessage(
        user_id=current_user.id,
        client_id=client.id,
        channel=req.channel,
        subject=req.subject,
        message_body=req.message_body,
        status=status,
        scheduled_time=req.scheduled_time,
        sent_time=sent_time
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.get("/history", response_model=List[OutreachResponse])
def get_outreach_history(
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(OutreachMessage).filter(OutreachMessage.user_id == current_user.id)
    if client_id:
        query = query.filter(OutreachMessage.client_id == client_id)
    return query.order_by(OutreachMessage.created_at.desc()).all()

@router.delete("/{message_id}")
def cancel_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = db.query(OutreachMessage).filter(OutreachMessage.id == message_id, OutreachMessage.user_id == current_user.id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(msg)
    db.commit()
    return {"message": "Message removed / cancelled"}
