from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.security import get_current_user_id
from src.models.db_models import Campaign
from src.models.schemas import CampaignResponse

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])


@router.get("", response_model=list[CampaignResponse])
def get_campaigns(
    db: Session = Depends(get_db),
    _user_id: int = Depends(get_current_user_id),
) -> list[CampaignResponse]:
    campaigns = db.query(Campaign).filter(Campaign.is_active == True).all()
    return [CampaignResponse.model_validate(c) for c in campaigns]
