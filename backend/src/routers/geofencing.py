from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.security import get_current_user_id
from src.models.db_models import Campaign, GeofenceLog
from src.models.schemas import GeofenceCheckRequest, GeofenceCheckResponse
from math import radians, sin, cos, sqrt, atan2

router = APIRouter(prefix="/api/v1/geofencing", tags=["geofencing"])


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def is_within_geofence(user_lat: float, user_lon: float, campaign_lat: float,
                       campaign_lon: float, radius: float) -> bool:
    distance = calculate_distance(user_lat, user_lon, campaign_lat, campaign_lon)
    return distance <= radius


@router.post("/check", response_model=GeofenceCheckResponse)
def check_geofence(
    location: GeofenceCheckRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
) -> GeofenceCheckResponse:
    campaign = db.query(Campaign).filter(Campaign.id == location.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    within = is_within_geofence(
        location.latitude, location.longitude,
        campaign.latitude, campaign.longitude,
        campaign.geofence_radius,
    )

    log = GeofenceLog(
        user_id=user_id,
        campaign_id=location.campaign_id,
        merchant_name=campaign.merchant_name,
        message=f"You are {'within' if within else 'outside'} {campaign.merchant_name} geofence",
        message_ar=f"أنت {'داخل' if within else 'خارج'} نطاق {campaign.merchant_name_ar}",
    )
    db.add(log)
    db.commit()

    return GeofenceCheckResponse(
        within_geofence=within,
        campaign_name=campaign.merchant_name,
        campaign_name_ar=campaign.merchant_name_ar,
    )
