from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Client, Proposal, Invoice, ScheduleEvent, AgentTask, FinancialRecord
from ..schemas import FinancialCreate, FinancialResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Business Analytics"])

@router.get("/dashboard")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_clients = db.query(Client).filter(Client.user_id == current_user.id).count()
    lead_clients = db.query(Client).filter(Client.user_id == current_user.id, Client.status == "Lead").count()
    active_clients = db.query(Client).filter(Client.user_id == current_user.id, Client.status == "Active").count()
    completed_clients = db.query(Client).filter(Client.user_id == current_user.id, Client.status == "Completed").count()

    total_proposals = db.query(Proposal).filter(Proposal.user_id == current_user.id).count()
    accepted_proposals = db.query(Proposal).filter(Proposal.user_id == current_user.id, Proposal.status == "Accepted").count()

    # Invoices & Cashflow
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).all()
    pending_invoices_amount = sum([inv.total_amount for inv in invoices if inv.status == "Pending"])
    paid_invoices_amount = sum([inv.total_amount for inv in invoices if inv.status == "Paid"])

    # Finances
    finances = db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).all()
    total_income = sum([f.amount for f in finances if f.type == "Income"]) + paid_invoices_amount
    total_expenses = sum([f.amount for f in finances if f.type == "Expense"])
    net_profit = total_income - total_expenses

    # Tasks
    tasks_count = db.query(AgentTask).filter(AgentTask.user_id == current_user.id).count()
    completed_tasks = db.query(AgentTask).filter(AgentTask.user_id == current_user.id, AgentTask.status == "Completed").count()

    # Upcoming events
    upcoming_events = db.query(ScheduleEvent).filter(
        ScheduleEvent.user_id == current_user.id,
        ScheduleEvent.start_time >= datetime.utcnow() - timedelta(hours=1)
    ).order_by(ScheduleEvent.start_time.asc()).limit(5).all()

    return {
        "clients": {
            "total": total_clients,
            "leads": lead_clients,
            "active": active_clients,
            "completed": completed_clients
        },
        "proposals": {
            "total": total_proposals,
            "accepted": accepted_proposals,
            "conversion_rate": round((accepted_proposals / total_proposals * 100), 1) if total_proposals > 0 else 0
        },
        "finances": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "pending_payments": pending_invoices_amount
        },
        "tasks": {
            "total": tasks_count,
            "completed": completed_tasks,
            "completion_rate": round((completed_tasks / tasks_count * 100), 1) if tasks_count > 0 else 0
        },
        "upcoming_events": [
            {
                "id": ev.id,
                "title": ev.title,
                "event_type": ev.event_type,
                "start_time": ev.start_time.isoformat(),
                "end_time": ev.end_time.isoformat()
            } for ev in upcoming_events
        ]
    }

@router.get("/finances", response_model=List[FinancialResponse])
def get_financial_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(FinancialRecord).filter(FinancialRecord.user_id == current_user.id).order_by(FinancialRecord.record_date.desc()).all()

@router.post("/finances", response_model=FinancialResponse)
def log_financial_record(
    req: FinancialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = FinancialRecord(
        user_id=current_user.id,
        type=req.type,
        category=req.category,
        amount=req.amount,
        description=req.description,
        record_date=req.record_date or datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
