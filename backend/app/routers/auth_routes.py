from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, UserProfileUpdate, UserResponse, TokenResponse
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = User(
        email=req.email.lower(),
        full_name=req.full_name,
        password_hash=hash_password(req.password),
        hourly_rate=req.hourly_rate or 45.0,
        skills=req.skills or "Python, React, UI/UX",
        company=req.company
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.email)
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token(user.id, user.email)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(req: UserProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.hourly_rate is not None:
        current_user.hourly_rate = req.hourly_rate
    if req.skills is not None:
        current_user.skills = req.skills
    if req.bio is not None:
        current_user.bio = req.bio
    if req.company is not None:
        current_user.company = req.company
    
    db.commit()
    db.refresh(current_user)
    return current_user
