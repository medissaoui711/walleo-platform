from pydantic import BaseModel, EmailStr
from typing import Optional


class MerchantRegisterRequest(BaseModel):
    name: str
    name_ar: str
    email: EmailStr
    password: str


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


class MerchantProfileResponse(BaseModel):
    id: int
    name: str
    name_ar: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    plan: str


class MerchantSettingsUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    email_alerts: Optional[bool] = None
    push_notifications: Optional[bool] = None
    weekly_report: Optional[bool] = None
    geofence_alerts: Optional[bool] = None
    language: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
