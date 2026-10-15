from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Client, AgentTask
from ..schemas import TaskCreate, TaskReviewRequest, TaskResponse
from ..auth import get_current_user
from ..ai_service import execute_agent_task

router = APIRouter(prefix="/api/tasks", tags=["Multi-Agent Orchestrator"])

@router.get("", response_model=List[TaskResponse])
def list_tasks(
    status: Optional[str] = None,
    task_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AgentTask).filter(AgentTask.user_id == current_user.id)
    if status:
        query = query.filter(AgentTask.status == status)
    if task_type:
        query = query.filter(AgentTask.task_type == task_type)
    return query.order_by(AgentTask.created_at.desc()).all()

@router.post("", response_model=TaskResponse)
def create_task(
    req: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assigned = "Developer Agent" if "Dev" in req.task_type else "Design Agent"

    task = AgentTask(
        user_id=current_user.id,
        client_id=req.client_id,
        title=req.title,
        task_type=req.task_type,
        assigned_agent=assigned,
        status="Queued",
        description=req.description,
        input_payload=req.input_payload
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.post("/{task_id}/process", response_model=TaskResponse)
def process_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(AgentTask).filter(AgentTask.id == task_id, AgentTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Run agent execution
    result = execute_agent_task(
        task_type=task.assigned_agent,
        title=task.title,
        description=task.description,
        input_payload=task.input_payload,
        feedback=task.client_feedback
    )

    task.generated_output = result
    task.status = "Reviewing" # Waiting for client / freelancer review
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.post("/{task_id}/review", response_model=TaskResponse)
def review_task(
    task_id: int,
    req: TaskReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(AgentTask).filter(AgentTask.id == task_id, AgentTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.action == "accept":
        task.status = "Completed"
        task.client_feedback = req.feedback or "Approved without revisions."
    elif req.action == "rework":
        task.status = "Reworking"
        task.revision_count += 1
        task.client_feedback = req.feedback or "Please adjust deliverables based on client comments."
        # Auto-reprocess with revision feedback
        revised_result = execute_agent_task(
            task_type=task.assigned_agent,
            title=task.title,
            description=task.description,
            input_payload=task.input_payload,
            feedback=task.client_feedback
        )
        task.generated_output = revised_result
        task.status = "Reviewing"
    elif req.action == "cancel":
        task.status = "Cancelled"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'accept', 'rework', or 'cancel'.")

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(AgentTask).filter(AgentTask.id == task_id, AgentTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task removed"}
