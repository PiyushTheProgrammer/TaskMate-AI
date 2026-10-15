from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Client
from ..schemas import ClientCreate, ClientUpdate, ClientResponse
from ..auth import get_current_user
from ..ai_service import get_crm_followup_suggestions

router = APIRouter(prefix="/api/clients", tags=["CRM Clients"])

@router.get("", response_model=List[ClientResponse])
def list_clients(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Client).filter(Client.user_id == current_user.id)
    if status:
        query = query.filter(Client.status == status)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            (Client.name.ilike(s)) | (Client.email.ilike(s)) | (Client.company.ilike(s))
        )
    return query.order_by(Client.created_at.desc()).all()

@router.post("", response_model=ClientResponse)
def create_client(
    req: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = Client(
        user_id=current_user.id,
        name=req.name,
        email=req.email,
        phone=req.phone,
        company=req.company,
        status=req.status or "Lead",
        notes=req.notes,
        last_interaction=datetime.utcnow()
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    req: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if req.name is not None:
        client.name = req.name
    if req.email is not None:
        client.email = req.email
    if req.phone is not None:
        client.phone = req.phone
    if req.company is not None:
        client.company = req.company
    if req.status is not None:
        client.status = req.status
    if req.notes is not None:
        client.notes = req.notes

    db.commit()
    db.refresh(client)
    return client

@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully", "id": client_id}

@router.get("/{client_id}/ai-suggestions")
def get_ai_suggestions(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    days = 0
    if client.last_interaction:
        days = (datetime.utcnow() - client.last_interaction).days
    
    suggestion = get_crm_followup_suggestions(client.name, client.status, days)
    return {
        "client_id": client.id,
        "client_name": client.name,
        "status": client.status,
        "days_inactive": days,
        "recommendation": suggestion
    }
