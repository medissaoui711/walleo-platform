from datetime import datetime, timezone
from sqlalchemy import (
    Integer, String, Float, Boolean, DateTime,
    ForeignKey, UniqueConstraint, Enum as SAEnum, Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from src.core.database import Base


class CouponStatus(str, enum.Enum):
    scanned = "scanned"
    added_to_wallet = "added_to_wallet"
    redeemed = "redeemed"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    fcm_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    referral_code: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    coupons: Mapped[list["UserCoupon"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    loyalty_cards: Mapped[list["LoyaltyCard"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="free_trial")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="merchant", cascade="all, delete-orphan")
    settings: Mapped["MerchantSettings"] = relationship(back_populates="merchant", uselist=False, cascade="all, delete-orphan")


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    merchant_id: Mapped[int] = mapped_column(ForeignKey("merchants.id"), nullable=True)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    merchant_name_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    coupon_title: Mapped[str] = mapped_column(String(255), nullable=False)
    coupon_title_ar: Mapped[str] = mapped_column(String(255), nullable=False)
    coupon_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    coupon_description_ar: Mapped[str | None] = mapped_column(Text, nullable=True)
    discount_code: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geofence_radius: Mapped[float] = mapped_column(Float, default=100.0)
    color_hex: Mapped[str] = mapped_column(String(10), default="#D4A373")
    points_per_redeem: Mapped[int] = mapped_column(Integer, default=1)
    start_date: Mapped[str] = mapped_column(String(20), nullable=False)
    end_date: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    coupons: Mapped[list["UserCoupon"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    loyalty_cards: Mapped[list["LoyaltyCard"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    merchant: Mapped["Merchant"] = relationship(back_populates="campaigns")


class UserCoupon(Base):
    __tablename__ = "user_coupons"

    __table_args__ = (
        UniqueConstraint("user_id", "campaign_id", "status", name="uq_active_coupon"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), nullable=False)
    coupon_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    status: Mapped[CouponStatus] = mapped_column(SAEnum(CouponStatus), default=CouponStatus.scanned)
    scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    redeemed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="coupons")
    campaign: Mapped["Campaign"] = relationship(back_populates="coupons")


class LoyaltyCard(Base):
    __tablename__ = "loyalty_cards"

    __table_args__ = (
        UniqueConstraint("user_id", "campaign_id", name="uq_loyalty_card"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), nullable=False)
    stamps_count: Mapped[int] = mapped_column(Integer, default=0)
    max_stamps: Mapped[int] = mapped_column(Integer, default=5)
    points: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship(back_populates="loyalty_cards")
    campaign: Mapped["Campaign"] = relationship(back_populates="loyalty_cards")


class GeofenceLog(Base):
    __tablename__ = "geofence_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"), nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    message_ar: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship()
    campaign: Mapped["Campaign"] = relationship()


class MerchantSettings(Base):
    __tablename__ = "merchant_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    merchant_id: Mapped[int] = mapped_column(ForeignKey("merchants.id"), unique=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    email_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    weekly_report: Mapped[bool] = mapped_column(Boolean, default=True)
    geofence_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    language: Mapped[str] = mapped_column(String(10), default="ar")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    merchant: Mapped["Merchant"] = relationship(back_populates="settings")
