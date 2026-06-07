from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CampaignResponse(BaseModel):
    id: int
    merchant_name: str
    merchant_name_ar: str
    coupon_title: str
    coupon_title_ar: str
    coupon_description: Optional[str] = None
    coupon_description_ar: Optional[str] = None
    discount_code: str
    latitude: float
    longitude: float
    geofence_radius: float
    color_hex: str
    points_per_redeem: int = 1
    start_date: str
    end_date: str

    model_config = {"from_attributes": True}


class CampaignCreateRequest(BaseModel):
    merchant_name: str
    merchant_name_ar: str
    coupon_title: str
    coupon_title_ar: str
    coupon_description: Optional[str] = None
    coupon_description_ar: Optional[str] = None
    discount_code: str
    latitude: float
    longitude: float
    geofence_radius: float = 100.0
    color_hex: str = "#D4A373"
    start_date: str
    end_date: str


class ClaimRequest(BaseModel):
    campaign_id: int


class CouponResponse(BaseModel):
    id: int
    campaign_id: int
    coupon_code: str
    status: str
    scanned_at: datetime

    model_config = {"from_attributes": True}


class ClaimResponse(BaseModel):
    success: bool
    coupon: CouponResponse


class RedeemRequest(BaseModel):
    campaign_id: int
    coupon_code: str


class LoyaltyCardResponse(BaseModel):
    campaign_id: int
    stamps_count: int
    max_stamps: int
    points: int
    triggered_reward: bool

    model_config = {"from_attributes": True}


class RedeemResponse(BaseModel):
    success: bool
    loyalty_card: LoyaltyCardResponse


class GeofenceCheckRequest(BaseModel):
    latitude: float
    longitude: float
    campaign_id: int


class GeofenceCheckResponse(BaseModel):
    within_geofence: bool
    campaign_name: str
    campaign_name_ar: str


class MerchantRegisterRequest(BaseModel):
    name: str
    name_ar: str
    email: EmailStr
    password: str


class MerchantStatsResponse(BaseModel):
    total_campaigns: int
    total_scans: int
    active_users: int
    conversion_rate: float
    expected_revenue: int
