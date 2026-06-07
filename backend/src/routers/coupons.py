import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.core.database import get_db
from src.core.security import get_current_user_id
from src.core.loyalty_engine import process_redeem
from src.models.db_models import UserCoupon, LoyaltyCard, Campaign, CouponStatus
from src.models.schemas import (
    ClaimRequest, ClaimResponse, CouponResponse,
    RedeemRequest, RedeemResponse, LoyaltyCardResponse,
)

router = APIRouter(prefix="/api/v1/coupons", tags=["coupons"])


def _generate_coupon_code(campaign_id: int) -> str:
    return f"COUPON_{campaign_id}_{secrets.randbelow(99999)}"


@router.post("/claim", response_model=ClaimResponse, status_code=201)
def claim_coupon(
    body: ClaimRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> ClaimResponse:
    campaign = db.query(Campaign).filter(
        Campaign.id == body.campaign_id,
        Campaign.is_active == True,
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    active_coupon = db.query(UserCoupon).filter(
        UserCoupon.user_id == user_id,
        UserCoupon.campaign_id == body.campaign_id,
        UserCoupon.status.in_([CouponStatus.scanned, CouponStatus.added_to_wallet]),
    ).first()

    if active_coupon:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active coupon for this campaign. Redeem it first.",
        )

    coupon = UserCoupon(
        user_id=user_id,
        campaign_id=body.campaign_id,
        coupon_code=_generate_coupon_code(body.campaign_id),
        status=CouponStatus.scanned,
    )

    try:
        db.add(coupon)
        db.commit()
        db.refresh(coupon)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Coupon already exists")

    return ClaimResponse(
        success=True,
        coupon=CouponResponse.model_validate(coupon),
    )


@router.post("/redeem", response_model=RedeemResponse)
def redeem_coupon(
    body: RedeemRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> RedeemResponse:
    coupon = db.query(UserCoupon).filter(
        UserCoupon.coupon_code == body.coupon_code,
        UserCoupon.campaign_id == body.campaign_id,
        UserCoupon.user_id == user_id,
    ).first()

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    if coupon.status == CouponStatus.redeemed:
        raise HTTPException(status_code=409, detail="Coupon already redeemed")

    coupon.status = CouponStatus.redeemed
    coupon.redeemed_at = datetime.now(timezone.utc)

    loyalty_card = db.query(LoyaltyCard).filter(
        LoyaltyCard.user_id == user_id,
        LoyaltyCard.campaign_id == body.campaign_id,
    ).first()

    if not loyalty_card:
        loyalty_card = LoyaltyCard(
            user_id=user_id,
            campaign_id=body.campaign_id,
            stamps_count=0,
            points=0,
        )
        db.add(loyalty_card)

    result = process_redeem(loyalty_card.stamps_count, loyalty_card.points)
    loyalty_card.stamps_count = result.stamps_count
    loyalty_card.points = result.points

    db.commit()
    db.refresh(loyalty_card)

    return RedeemResponse(
        success=True,
        loyalty_card=LoyaltyCardResponse(
            campaign_id=body.campaign_id,
            stamps_count=result.stamps_count,
            max_stamps=result.max_stamps,
            points=result.points,
            triggered_reward=result.triggered_reward,
        ),
    )
