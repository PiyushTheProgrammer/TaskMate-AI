from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, Client, Requirement, Proposal, Invoice, ScheduleEvent, AgentTask, FinancialRecord
from .auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if demo user exists
    existing = db.query(User).filter(User.email == "yashodhan@taskmate.ai").first()
    if existing:
        db.close()
        return

    print("Seeding initial data for TaskMate AI...")

    # 1. Demo User
    demo_user = User(
        email="yashodhan@taskmate.ai",
        full_name="Yashodhan Suryawanshi",
        password_hash=hash_password("freelance123"),
        role="freelancer",
        hourly_rate=65.0,
        skills="Python, FastAPI, React, AI/ML, System Modeling",
        company="TaskMate Freelance Studio",
        bio="Full-Stack Engineer & AI Solution Architect assisting global clients."
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Clients
    c1 = Client(
        user_id=demo_user.id,
        name="Acme Dynamics",
        email="alex@acmedynamics.com",
        phone="+1 415-555-0192",
        company="Acme Corp",
        status="Active",
        notes="Developing automated warehouse inventory tracker with OCR.",
        last_interaction=datetime.utcnow() - timedelta(days=2)
    )
    c2 = Client(
        user_id=demo_user.id,
        name="FinTech Global",
        email="sarah@fintechglobal.io",
        phone="+44 20 7946 0912",
        company="FT Global Ltd",
        status="Lead",
        notes="Requested quotation for transaction anomaly detector API.",
        last_interaction=datetime.utcnow() - timedelta(days=6)
    )
    c3 = Client(
        user_id=demo_user.id,
        name="Apex Studios",
        email="design@apexstudios.design",
        phone="+1 312-555-0144",
        company="Apex Creative",
        status="Completed",
        notes="Redesigned interactive client gallery with dark mode.",
        last_interaction=datetime.utcnow() - timedelta(days=20)
    )
    db.add_all([c1, c2, c3])
    db.commit()
    db.refresh(c1)
    db.refresh(c2)
    db.refresh(c3)

    # 3. Requirements
    r1 = Requirement(
        user_id=demo_user.id,
        client_id=c1.id,
        title="Warehouse Inventory OCR Pipeline",
        raw_input="Client needs an AI pipeline that extracts barcode and text from warehouse photos and syncs directly into an inventory dashboard.",
        scope="End-to-end computer vision and OCR integration with cloud webhook alerts.",
        budget_min=3500.0,
        budget_max=5000.0,
        timeline="4 weeks",
        deliverables="• Image ingestion API\n• OCR parser module\n• Inventory reconciliation dashboard\n• Deployment guide",
        tech_stack="Python, FastAPI, OpenCV, React"
    )
    db.add(r1)
    db.commit()
    db.refresh(r1)

    # 4. Proposal
    p1 = Proposal(
        user_id=demo_user.id,
        client_id=c1.id,
        requirement_id=r1.id,
        title="AI-Powered Warehouse Inventory & OCR Integration",
        template_type="Modern",
        content="""# Project Proposal: AI-Powered Warehouse Inventory & OCR Integration
**Client:** Acme Dynamics  
**Consultant:** Yashodhan Suryawanshi  

### Executive Summary
We will implement an automated computer vision pipeline to ingest incoming warehouse shipment photos, extract item barcodes and text labels, and push updates in real-time to your central inventory system.

### Scope & Work Breakdown
- Image preprocessing and barcode boundary box detection
- OCR text recognition module
- Secure RESTful endpoints with FastAPI
- Real-time React dashboard with search and audit logging

### Milestones & Investment
- **Milestone 1:** Computer vision model & OCR test harness ($1,500)
- **Milestone 2:** Backend API & Queue integration ($1,500)
- **Milestone 3:** UI Dashboard, Acceptance Testing & Handover ($1,200)

**Total Fixed Budget:** $4,200 USD  
**Timeline:** 4 Weeks
""",
        total_budget=4200.0,
        status="Accepted"
    )
    db.add(p1)
    db.commit()

    # 5. Invoices
    inv1 = Invoice(
        user_id=demo_user.id,
        client_id=c1.id,
        invoice_number="INV-2026-001",
        items_json='[{"description": "Milestone 1: OCR Model Architecture", "quantity": 1, "unit_price": 1500.0, "total": 1500.0}]',
        total_amount=1500.0,
        status="Paid",
        due_date=datetime.utcnow() - timedelta(days=5)
    )
    inv2 = Invoice(
        user_id=demo_user.id,
        client_id=c1.id,
        invoice_number="INV-2026-002",
        items_json='[{"description": "Milestone 2: Backend API & Queue Processing", "quantity": 1, "unit_price": 1500.0, "total": 1500.0}]',
        total_amount=1500.0,
        status="Pending",
        due_date=datetime.utcnow() + timedelta(days=10)
    )
    db.add_all([inv1, inv2])

    # 6. Schedule Events
    ev1 = ScheduleEvent(
        user_id=demo_user.id,
        client_id=c1.id,
        title="Acme Sprint Review & Demo",
        event_type="Meeting",
        start_time=datetime.utcnow() + timedelta(hours=3),
        end_time=datetime.utcnow() + timedelta(hours=4),
        description="Demonstrate OCR ingestion and review test cases with Alex."
    )
    ev2 = ScheduleEvent(
        user_id=demo_user.id,
        client_id=c2.id,
        title="FinTech Proposal Discovery Call",
        event_type="Meeting",
        start_time=datetime.utcnow() + timedelta(days=1, hours=2),
        end_time=datetime.utcnow() + timedelta(days=1, hours=3),
        description="Discuss transaction volume and accuracy threshold requirements."
    )
    ev3 = ScheduleEvent(
        user_id=demo_user.id,
        client_id=c1.id,
        title="Milestone 2 Code Delivery Deadline",
        event_type="Deadline",
        start_time=datetime.utcnow() + timedelta(days=3),
        end_time=datetime.utcnow() + timedelta(days=3, hours=1),
        description="Tag release v0.2.0 in repository."
    )
    db.add_all([ev1, ev2, ev3])

    # 7. Multi-Agent Tasks
    t1 = AgentTask(
        user_id=demo_user.id,
        client_id=c1.id,
        title="Implement Barcode Detection Endpoint",
        task_type="Developer Task",
        assigned_agent="Developer Agent",
        status="Reviewing",
        description="Create POST /api/scan endpoint with OpenCV barcode decoding and bbox coordinates.",
        generated_output="""### 🛠️ Developer Agent Execution Report
**Task:** Implement Barcode Detection Endpoint
**Status:** Completed & Tested

```python
import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/api/scan")
async def scan_barcode(file: UploadFile = File(...)):
    img_bytes = await file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    detector = cv2.barcode.BarcodeDetector()
    retval, decoded_info, decoded_type, points = detector.detectAndDecode(img)
    return {"detected": retval, "data": decoded_info, "type": decoded_type}
```
Automated test suite passed with 98% detection rate on 20 test frames."""
    )
    t2 = AgentTask(
        user_id=demo_user.id,
        client_id=c1.id,
        title="Warehouse Inventory UI Wireframe",
        task_type="Design Task",
        assigned_agent="Design Agent",
        status="Completed",
        description="Design intuitive status cards, search filter bar, and shipment table with barcode thumbnails.",
        generated_output="""### 🎨 Design Agent Execution Report
**Task:** Warehouse Inventory UI Wireframe
**Status:** Approved by Client

- Palette: Clean slate (#0F172A), Slate Blue (#2563EB), Off-White (#F8FAFC)
- Layout: Top metric counters (Total Items, Low Stock, Unverified Scans)
- Grid: High-density data table with quick scan modal launcher."""
    )
    db.add_all([t1, t2])

    # 8. Finances
    f1 = FinancialRecord(
        user_id=demo_user.id,
        type="Income",
        category="Development",
        amount=1500.0,
        description="Acme Dynamics - Milestone 1",
        record_date=datetime.utcnow() - timedelta(days=5)
    )
    f2 = FinancialRecord(
        user_id=demo_user.id,
        type="Income",
        category="Retainer",
        amount=800.0,
        description="Apex Studios - Support Retainer",
        record_date=datetime.utcnow() - timedelta(days=12)
    )
    f3 = FinancialRecord(
        user_id=demo_user.id,
        type="Expense",
        category="Software",
        amount=49.0,
        description="Cloud GPU Server & AI credits",
        record_date=datetime.utcnow() - timedelta(days=8)
    )
    f4 = FinancialRecord(
        user_id=demo_user.id,
        type="Expense",
        category="Hosting",
        amount=25.0,
        description="Vercel & Supabase hosting",
        record_date=datetime.utcnow() - timedelta(days=15)
    )
    db.add_all([f1, f2, f3, f4])

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_database()
