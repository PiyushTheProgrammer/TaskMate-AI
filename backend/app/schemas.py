from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str
    hourly_rate: Optional[float] = 45.0
    skills: Optional[str] = "Python, React, UI/UX"
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    hourly_rate: Optional[float] = None
    skills: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    hourly_rate: float
    bio: Optional[str] = None
    skills: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Client Schemas
class ClientCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = "Lead"
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    status: str
    notes: Optional[str]
    last_interaction: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Requirement Analyzer Schemas
class RequirementAnalyzeRequest(BaseModel):
    client_id: Optional[int] = None
    raw_text: str
    title: Optional[str] = "Client Project Requirement"

class RequirementResponse(BaseModel):
    id: int
    user_id: int
    client_id: Optional[int]
    title: str
    raw_input: str
    scope: Optional[str]
    budget_min: Optional[float]
    budget_max: Optional[float]
    timeline: Optional[str]
    deliverables: Optional[str]
    tech_stack: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Proposal Schemas
class ProposalGenerateRequest(BaseModel):
    client_id: int
    requirement_id: Optional[int] = None
    title: str
    template_type: Optional[str] = "Standard"
    project_scope: Optional[str] = None
    deliverables: Optional[str] = None
    timeline: Optional[str] = None
    total_budget: Optional[float] = None
    notes: Optional[str] = None

class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    total_budget: Optional[float] = None
    status: Optional[str] = None

class ProposalResponse(BaseModel):
    id: int
    user_id: int
    client_id: int
    requirement_id: Optional[int]
    title: str
    template_type: str
    content: str
    total_budget: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Invoice Schemas
class InvoiceLineItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    total: float

class InvoiceCreate(BaseModel):
    client_id: int
    proposal_id: Optional[int] = None
    invoice_number: Optional[str] = None
    items: List[InvoiceLineItem]
    due_date: datetime
    status: Optional[str] = "Pending"

class InvoiceResponse(BaseModel):
    id: int
    user_id: int
    client_id: int
    proposal_id: Optional[int]
    invoice_number: str
    items_json: str
    total_amount: float
    status: str
    due_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Outreach Schemas
class OutreachGenerateRequest(BaseModel):
    client_id: int
    purpose: str # follow_up, proposal_submission, milestone_check, payment_reminder
    tone: Optional[str] = "Professional"
    channel: Optional[str] = "Email"

class OutreachCreate(BaseModel):
    client_id: int
    channel: str
    subject: Optional[str] = None
    message_body: str
    status: Optional[str] = "Draft"
    scheduled_time: Optional[datetime] = None

class OutreachResponse(BaseModel):
    id: int
    user_id: int
    client_id: int
    channel: str
    subject: Optional[str]
    message_body: str
    status: str
    scheduled_time: Optional[datetime]
    sent_time: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Schedule Schemas
class ScheduleCreate(BaseModel):
    client_id: Optional[int] = None
    title: str
    event_type: str = "Meeting" # Meeting, Deadline, Task
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None

class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    client_id: Optional[int]
    title: str
    event_type: str
    start_time: datetime
    end_time: datetime
    description: Optional[str]
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Multi-Agent Task Schemas
class TaskCreate(BaseModel):
    client_id: Optional[int] = None
    title: str
    task_type: str = "Developer Task" # Developer Task, Design Task
    description: str
    input_payload: Optional[str] = None

class TaskReviewRequest(BaseModel):
    action: str # accept, rework, cancel
    feedback: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    user_id: int
    client_id: Optional[int]
    title: str
    task_type: str
    assigned_agent: str
    status: str
    description: str
    input_payload: Optional[str]
    generated_output: Optional[str]
    client_feedback: Optional[str]
    revision_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Financial Schemas
class FinancialCreate(BaseModel):
    type: str # Income, Expense
    category: str
    amount: float
    description: Optional[str] = None
    record_date: Optional[datetime] = None

class FinancialResponse(BaseModel):
    id: int
    user_id: int
    type: str
    category: str
    amount: float
    description: Optional[str]
    record_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
