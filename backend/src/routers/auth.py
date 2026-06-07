from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.security import hash_password, verify_password, create_token, get_current_user_id
from src.models.db_models import User
from src.models.schemas import RegisterRequest, LoginRequest, TokenResponse
import secrets

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    referral_code = secrets.token_urlsafe(8).upper()

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        referral_code=referral_code,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user_id=user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(user_id=user.id)
    return TokenResponse(access_token=token)


@router.post("/fcm-token")
def register_fcm_token(
    fcm_token: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.fcm_token = fcm_token
        db.commit()
    return {"success": True}
