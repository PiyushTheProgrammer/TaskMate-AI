import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="freelancer") # freelancer, admin
    hourly_rate = Column(Float, default=45.0)
    bio = Column(Text, nullable=True)
    skills = Column(String(500), default="Python, React, FastApi, UI/UX")
    company = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    clients = relationship("Client", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("AgentTask", back_populates="owner", cascade="all, delete-orphan")
    events = relationship("ScheduleEvent", back_populates="owner", cascade="all, delete-orphan")
    finances = relationship("FinancialRecord", back_populates="owner", cascade="all, delete-orphan")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    company = Column(String(255), nullable=True)
    status = Column(String(50), default="Lead") # Lead, Active, Completed
    notes = Column(Text, nullable=True)
    last_interaction = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="clients")
    requirements = relationship("Requirement", back_populates="client", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="client", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="client", cascade="all, delete-orphan")
    outreach_messages = relationship("OutreachMessage", back_populates="client", cascade="all, delete-orphan")

class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    title = Column(String(255), nullable=False)
    raw_input = Column(Text, nullable=False)
    scope = Column(Text, nullable=True)
    budget_min = Column(Float, default=0.0)
    budget_max = Column(Float, default=0.0)
    timeline = Column(String(100), nullable=True)
    deliverables = Column(Text, nullable=True) # JSON or newline string
    tech_stack = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client", back_populates="requirements")

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    title = Column(String(255), nullable=False)
    template_type = Column(String(50), default="Standard") # Standard, Modern, Formal
    content = Column(Text, nullable=False)
    total_budget = Column(Float, default=0.0)
    status = Column(String(50), default="Draft") # Draft, Sent, Accepted, Declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client", back_populates="proposals")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    items_json = Column(Text, nullable=False) # JSON string of line items
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default="Pending") # Pending, Paid, Overdue
    due_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client", back_populates="invoices")

class OutreachMessage(Base):
    __tablename__ = "outreach_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    channel = Column(String(50), default="Email") # Email, WhatsApp
    subject = Column(String(255), nullable=True)
    message_body = Column(Text, nullable=False)
    status = Column(String(50), default="Draft") # Draft, Scheduled, Sent, Failed
    scheduled_time = Column(DateTime, nullable=True)
    sent_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client", back_populates="outreach_messages")

class ScheduleEvent(Base):
    __tablename__ = "schedule_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    title = Column(String(255), nullable=False)
    event_type = Column(String(50), default="Meeting") # Meeting, Deadline, Task
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="events")

class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    title = Column(String(255), nullable=False)
    task_type = Column(String(50), default="Developer Task") # Developer Task, Design Task
    assigned_agent = Column(String(100), default="Developer Agent") # Developer Agent, Design Agent
    status = Column(String(50), default="Drafting") # Drafting, Validating, Queued, Processing, Reviewing, Reworking, Completed, Cancelled
    description = Column(Text, nullable=False)
    input_payload = Column(Text, nullable=True)
    generated_output = Column(Text, nullable=True)
    client_feedback = Column(Text, nullable=True)
    revision_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="tasks")

class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False) # Income, Expense
    category = Column(String(100), nullable=False) # Development, Design, Hosting, Software, Retainer
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    record_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="finances")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
