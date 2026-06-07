from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from src.core.database import get_db
from src.core.security import get_current_merchant_id
from src.models.db_models import UserCoupon, LoyaltyCard, Campaign

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/merchant/stats")
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
            UserCoupon.scanned_at >= thirty_days_ago,
        )
    ).scalar() or 0

    redeemed = db.query(func.count(UserCoupon.id)).filter(
        and_(
            UserCoupon.campaign_id.in_(campaign_ids),
            UserCoupon.status == "redeemed",
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
