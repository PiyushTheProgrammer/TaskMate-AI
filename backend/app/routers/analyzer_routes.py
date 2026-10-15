from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Requirement, Client
from ..schemas import RequirementAnalyzeRequest, RequirementResponse
from ..auth import get_current_user
from ..ai_service import analyze_requirements

router = APIRouter(prefix="/api/analyzer", tags=["Requirement Analyzer"])

@router.post("/analyze-text")
def analyze_text_requirements(
    req: RequirementAnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    if not req.raw_text or len(req.raw_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Input text is too short. Please provide meaningful project requirements.")
    
    extracted = analyze_requirements(req.raw_text)
    return {
        "title": req.title or "Project Requirement Analysis",
        "client_id": req.client_id,
        "raw_text": req.raw_text,
        **extracted
    }

@router.post("/upload-doc")
async def upload_document_requirement(
    file: UploadFile = File(...),
    client_id: Optional[int] = Form(None),
    title: Optional[str] = Form("Uploaded Requirement Document"),
    current_user: User = Depends(get_current_user)
):
    content = ""
    filename = file.filename.lower()
    file_bytes = await file.read()

    try:
        if filename.endswith(".txt"):
            content = file_bytes.decode("utf-8", errors="ignore")
        elif filename.endswith(".pdf"):
            import pymupdf
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                content += page.get_text() + "\n"
        elif filename.endswith(".docx"):
            import docx
            import io
            doc = docx.Document(io.BytesIO(file_bytes))
            content = "\n".join([p.text for p in doc.paragraphs])
        else:
            # Fallback treat as text
            content = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Document appears to be empty or unreadable.")

    extracted = analyze_requirements(content)
    return {
        "title": title or file.filename,
        "client_id": client_id,
        "raw_text": content[:2000], # preview snippet
        **extracted
    }

@router.post("/save", response_model=RequirementResponse)
def save_analyzed_requirement(
    req: RequirementResponse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requirement = Requirement(
        user_id=current_user.id,
        client_id=req.client_id,
        title=req.title,
        raw_input=req.raw_input,
        scope=req.scope,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        timeline=req.timeline,
        deliverables=req.deliverables,
        tech_stack=req.tech_stack
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement

@router.get("/history", response_model=List[RequirementResponse])
def get_requirement_history(
    client_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Requirement).filter(Requirement.user_id == current_user.id)
    if client_id:
        query = query.filter(Requirement.client_id == client_id)
    return query.order_by(Requirement.created_at.desc()).all()
