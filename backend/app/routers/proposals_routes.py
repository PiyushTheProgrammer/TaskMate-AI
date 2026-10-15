from typing import List, Optional
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Client, Proposal, Invoice
from ..schemas import ProposalGenerateRequest, ProposalUpdate, ProposalResponse, InvoiceCreate, InvoiceResponse
from ..auth import get_current_user
from ..ai_service import generate_proposal_content
from ..pdf_service import generate_proposal_pdf, generate_invoice_pdf

router = APIRouter(prefix="/api/proposals", tags=["Proposals & Invoices"])

@router.get("", response_model=List[ProposalResponse])
def list_proposals(
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Proposal).filter(Proposal.user_id == current_user.id)
    if client_id:
        query = query.filter(Proposal.client_id == client_id)
    return query.order_by(Proposal.created_at.desc()).all()

@router.post("/generate", response_model=ProposalResponse)
def generate_proposal(
    req: ProposalGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == req.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    scope = req.project_scope or "Design and full-stack software development tailored to client specifications."
    deliverables = req.deliverables or "• Production web deployment\n• Automated tests\n• Comprehensive documentation"
    timeline = req.timeline or "3 to 4 weeks"
    budget = req.total_budget or (current_user.hourly_rate * 40)

    content = generate_proposal_content(
        client_name=client.name,
        title=req.title,
        template_type=req.template_type or "Standard",
        scope=scope,
        deliverables=deliverables,
        timeline=timeline,
        total_budget=budget,
        freelancer_name=current_user.full_name
    )

    proposal = Proposal(
        user_id=current_user.id,
        client_id=client.id,
        requirement_id=req.requirement_id,
        title=req.title,
        template_type=req.template_type or "Standard",
        content=content,
        total_budget=budget,
        status="Draft"
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal

@router.get("/{proposal_id}", response_model=ProposalResponse)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.user_id == current_user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@router.put("/{proposal_id}", response_model=ProposalResponse)
def update_proposal(
    proposal_id: int,
    req: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.user_id == current_user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if req.title is not None:
        proposal.title = req.title
    if req.content is not None:
        proposal.content = req.content
    if req.total_budget is not None:
        proposal.total_budget = req.total_budget
    if req.status is not None:
        proposal.status = req.status

    db.commit()
    db.refresh(proposal)
    return proposal

@router.delete("/{proposal_id}")
def delete_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.user_id == current_user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    db.delete(proposal)
    db.commit()
    return {"message": "Proposal deleted successfully"}

@router.get("/{proposal_id}/pdf")
def download_proposal_pdf(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id, Proposal.user_id == current_user.id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    client = db.query(Client).filter(Client.id == proposal.client_id).first()
    client_name = client.name if client else "Valued Client"

    pdf_data = generate_proposal_pdf(
        title=proposal.title,
        client_name=client_name,
        content=proposal.content,
        total_budget=proposal.total_budget
    )

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="Proposal-{proposal.id}.pdf"'}
    )

# INVOICES
@router.get("/invoices/all", response_model=List[InvoiceResponse])
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Invoice).filter(Invoice.user_id == current_user.id).order_by(Invoice.created_at.desc()).all()

@router.post("/invoices/create", response_model=InvoiceResponse)
def create_invoice(
    req: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == req.client_id, Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    total = sum([item.total for item in req.items])
    inv_num = req.invoice_number or f"INV-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

    invoice = Invoice(
        user_id=current_user.id,
        client_id=client.id,
        proposal_id=req.proposal_id,
        invoice_number=inv_num,
        items_json=json.dumps([item.dict() for item in req.items]),
        total_amount=total,
        status=req.status or "Pending",
        due_date=req.due_date
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/invoices/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    client = db.query(Client).filter(Client.id == invoice.client_id).first()
    client_name = client.name if client else "Valued Client"

    pdf_data = generate_invoice_pdf(
        invoice_number=invoice.invoice_number,
        client_name=client_name,
        items_json=invoice.items_json,
        total_amount=invoice.total_amount,
        due_date_str=invoice.due_date.strftime("%B %d, %Y")
    )

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="Invoice-{invoice.invoice_number}.pdf"'}
    )

@router.put("/invoices/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = status
    db.commit()
    return {"message": "Invoice status updated", "status": invoice.status}
