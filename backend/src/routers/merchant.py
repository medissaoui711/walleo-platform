from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from src.core.database import get_db
from src.core.security import hash_password, verify_password, create_token, get_current_merchant_id
from src.models.db_models import Merchant, Campaign, UserCoupon, LoyaltyCard, MerchantSettings
from src.schemas.api_models import (
    MerchantRegisterRequest, CampaignCreateRequest, CampaignResponse,
    MerchantProfileResponse, MerchantSettingsUpdate, PasswordChangeRequest
)
from typing import List

router = APIRouter(prefix="/api/v1/merchant", tags=["merchant"])


@router.post("/register")
def register_merchant(body: MerchantRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Merchant).filter(Merchant.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    merchant = Merchant(
        name=body.name,
        name_ar=body.name_ar,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    token = create_token(user_id=merchant.id, merchant_id=merchant.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": merchant.id,
            "name": merchant.name,
            "name_ar": merchant.name_ar,
            "email": merchant.email
        }
    }


@router.post("/login")
def login_merchant(email: str, password: str, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter(Merchant.email == email).first()
    if not merchant or not verify_password(password, merchant.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user_id=merchant.id, merchant_id=merchant.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": merchant.id,
            "name": merchant.name,
            "name_ar": merchant.name_ar,
            "email": merchant.email
        }
    }


@router.get("/campaigns", response_model=List[CampaignResponse])
def get_merchant_campaigns(
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
) -> List[CampaignResponse]:
    campaigns = db.query(Campaign).filter(Campaign.merchant_id == merchant_id).all()
    return [CampaignResponse.model_validate(c) for c in campaigns]


@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
def create_campaign(
    body: CampaignCreateRequest,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
) -> CampaignResponse:
    campaign = Campaign(
        merchant_id=merchant_id,
        merchant_name=body.merchant_name,
        merchant_name_ar=body.merchant_name_ar,
        coupon_title=body.coupon_title,
        coupon_title_ar=body.coupon_title_ar,
        coupon_description=body.coupon_description,
        coupon_description_ar=body.coupon_description_ar,
        discount_code=body.discount_code,
        latitude=body.latitude,
        longitude=body.longitude,
        geofence_radius=body.geofence_radius,
        color_hex=body.color_hex,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return CampaignResponse.model_validate(campaign)


@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    body: CampaignCreateRequest,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
) -> CampaignResponse:
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.merchant_id == merchant_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for key, value in body.model_dump().items():
        setattr(campaign, key, value)
    db.commit()
    db.refresh(campaign)
    return CampaignResponse.model_validate(campaign)


@router.delete("/campaigns/{campaign_id}")
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.merchant_id == merchant_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(campaign)
    db.commit()
    return {"success": True, "message": "Campaign deleted"}


@router.get("/settings")
def get_settings(
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    settings = db.query(MerchantSettings).filter(
        MerchantSettings.merchant_id == merchant_id
    ).first()
    if not settings:
        settings = MerchantSettings(merchant_id=merchant_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "name": merchant.name,
        "name_ar": merchant.name_ar,
        "email": merchant.email,
        "phone": settings.phone or "",
        "address": settings.address or "",
        "email_alerts": settings.email_alerts,
        "push_notifications": settings.push_notifications,
        "weekly_report": settings.weekly_report,
        "geofence_alerts": settings.geofence_alerts,
        "language": settings.language,
    }


@router.put("/settings/profile")
def update_profile(
    body: dict,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if "name" in body:
        merchant.name = body["name"]
    if "name_ar" in body:
        merchant.name_ar = body["name_ar"]
    if "email" in body:
        merchant.email = body["email"]
    settings = db.query(MerchantSettings).filter(
        MerchantSettings.merchant_id == merchant_id
    ).first()
    if settings:
        if "phone" in body:
            settings.phone = body["phone"]
        if "address" in body:
            settings.address = body["address"]
    db.commit()
    return {"success": True}


@router.put("/settings/notifications")
def update_notification_settings(
    body: dict,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    settings = db.query(MerchantSettings).filter(
        MerchantSettings.merchant_id == merchant_id
    ).first()
    if not settings:
        settings = MerchantSettings(merchant_id=merchant_id)
        db.add(settings)
    if "email_alerts" in body:
        settings.email_alerts = body["email_alerts"]
    if "push_notifications" in body:
        settings.push_notifications = body["push_notifications"]
    if "weekly_report" in body:
        settings.weekly_report = body["weekly_report"]
    if "geofence_alerts" in body:
        settings.geofence_alerts = body["geofence_alerts"]
    db.commit()
    return {"success": True}


@router.put("/settings/language")
def update_language(
    body: dict,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    settings = db.query(MerchantSettings).filter(
        MerchantSettings.merchant_id == merchant_id
    ).first()
    if not settings:
        settings = MerchantSettings(merchant_id=merchant_id)
        db.add(settings)
    settings.language = body.get("language", "ar")
    db.commit()
    return {"success": True}


@router.put("/settings/password")
def change_password(
    body: PasswordChangeRequest,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if not verify_password(body.current_password, merchant.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    merchant.hashed_password = hash_password(body.new_password)
    db.commit()
    return {"success": True}


@router.get("/stats")
def get_merchant_stats(
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    campaigns = db.query(Campaign).filter(Campaign.merchant_id == merchant_id).all()
    campaign_ids = [c.id for c in campaigns]
    total_scans = db.query(func.count(UserCoupon.id)).filter(
        UserCoupon.campaign_id.in_(campaign_ids)
    ).scalar() or 0
    thirty_days_ago = datetime.now() - timedelta(days=30)
    active_users = db.query(func.count(func.distinct(UserCoupon.user_id))).filter(
        and_(
            UserCoupon.campaign_id.in_(campaign_ids),
            UserCoupon.scanned_at >= thirty_days_ago
        )
    ).scalar() or 0
    redeemed = db.query(func.count(UserCoupon.id)).filter(
        and_(
            UserCoupon.campaign_id.in_(campaign_ids),
            UserCoupon.status == "redeemed"
        )
    ).scalar() or 0
    conversion_rate = (redeemed / total_scans * 100) if total_scans > 0 else 0
    expected_revenue = redeemed * 35
    return {
        "total_campaigns": len(campaigns),
        "total_scans": total_scans,
        "active_users": active_users,
        "conversion_rate": round(conversion_rate, 1),
        "expected_revenue": expected_revenue,
    }


@router.get("/recent-activity")
def get_recent_activity(
    days: int = 7,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    campaigns = db.query(Campaign).filter(Campaign.merchant_id == merchant_id).all()
    campaign_ids = [c.id for c in campaigns]
    dates = [(datetime.now() - timedelta(days=i)).date() for i in range(days)]
    dates.reverse()
    activity = []
    for date in dates:
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        scans = db.query(func.count(UserCoupon.id)).filter(
            and_(
                UserCoupon.campaign_id.in_(campaign_ids),
                UserCoupon.scanned_at.between(start, end)
            )
        ).scalar() or 0
        points = db.query(func.sum(LoyaltyCard.points)).filter(
            and_(
                LoyaltyCard.campaign_id.in_(campaign_ids),
                LoyaltyCard.updated_at.between(start, end)
            )
        ).scalar() or 0
        activity.append({
            "date": date.strftime("%Y-%m-%d"),
            "scans": scans,
            "points": points,
        })
    return activity


@router.get("/top-campaigns")
def get_top_campaigns(
    limit: int = 5,
    db: Session = Depends(get_db),
    merchant_id: int = Depends(get_current_merchant_id),
):
    campaigns = db.query(Campaign).filter(Campaign.merchant_id == merchant_id).all()
    result = []
    for campaign in campaigns[:limit]:
        scans = db.query(func.count(UserCoupon.id)).filter(
            UserCoupon.campaign_id == campaign.id
        ).scalar() or 0
        redemptions = db.query(func.count(UserCoupon.id)).filter(
            and_(
                UserCoupon.campaign_id == campaign.id,
                UserCoupon.status == "redeemed"
            )
        ).scalar() or 0
        result.append({
            "name": campaign.merchant_name,
            "scans": scans,
            "redemptions": redemptions,
        })
    return result
