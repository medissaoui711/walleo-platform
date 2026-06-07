import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.main import app
from src.core.database import Base, get_db
from src.models.db_models import User, Campaign, Merchant

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_user():
    response = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_login_user():
    client.post("/api/v1/auth/register", json={
        "email": "test2@example.com",
        "password": "password123"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "test2@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_get_campaigns_requires_auth():
    response = client.get("/api/v1/campaigns")
    assert response.status_code == 401


def test_register_merchant():
    response = client.post("/api/v1/merchant/register", json={
        "name": "Test Cafe",
        "name_ar": "مقهى تجريبي",
        "email": "merchant@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "merchant" in response.json()


def test_merchant_login():
    client.post("/api/v1/merchant/register", json={
        "name": "Test Cafe 2",
        "name_ar": "مقهى تجريبي 2",
        "email": "merchant2@example.com",
        "password": "password123"
    })
    response = client.post("/api/v1/merchant/login", params={
        "email": "merchant2@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_create_campaign():
    register_response = client.post("/api/v1/merchant/register", json={
        "name": "Campaign Cafe",
        "name_ar": "مقهى الحملات",
        "email": "campaign@example.com",
        "password": "password123"
    })
    token = register_response.json()["access_token"]

    response = client.post("/api/v1/merchant/campaigns",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "merchant_name": "Campaign Cafe",
            "merchant_name_ar": "مقهى الحملات",
            "coupon_title": "Free Coffee",
            "coupon_title_ar": "قهوة مجانية",
            "coupon_description": "Get one free coffee",
            "coupon_description_ar": "احصل على قهوة مجانية",
            "discount_code": "FREECOFFEE",
            "latitude": 180.0,
            "longitude": 160.0,
            "geofence_radius": 100.0,
            "color_hex": "#D4A373",
            "start_date": "2026-06-01",
            "end_date": "2026-06-30"
        }
    )
    assert response.status_code == 201
    assert response.json()["discount_code"] == "FREECOFFEE"


def test_loyalty_engine_logic():
    from src.core.loyalty_engine import process_redeem

    result1 = process_redeem(0, 0)
    assert result1.stamps_count == 1
    assert result1.points == 100
    assert result1.triggered_reward == False

    result5 = process_redeem(4, 400)
    assert result5.stamps_count == 5
    assert result5.points == 500
    assert result5.triggered_reward == False

    result6 = process_redeem(5, 500)
    assert result6.stamps_count == 1
    assert result6.points == 850
    assert result6.triggered_reward == True
    assert result6.bonus_points_earned == 250


def test_claim_coupon_anti_cheat():
    user_response = client.post("/api/v1/auth/register", json={
        "email": "user@example.com",
        "password": "password123"
    })
    user_token = user_response.json()["access_token"]

    merchant_response = client.post("/api/v1/merchant/register", json={
        "name": "Test Cafe",
        "name_ar": "مقهى تجريبي",
        "email": "merchant_claim@example.com",
        "password": "password123"
    })
    merchant_token = merchant_response.json()["access_token"]

    campaign_response = client.post("/api/v1/merchant/campaigns",
        headers={"Authorization": f"Bearer {merchant_token}"},
        json={
            "merchant_name": "Test Cafe",
            "merchant_name_ar": "مقهى تجريبي",
            "coupon_title": "Free Coffee",
            "coupon_title_ar": "قهوة مجانية",
            "discount_code": "CLAIMTEST",
            "latitude": 180.0,
            "longitude": 160.0,
            "geofence_radius": 100.0,
            "color_hex": "#D4A373",
            "start_date": "2026-06-01",
            "end_date": "2026-06-30"
        }
    )
    campaign_id = campaign_response.json()["id"]

    claim1 = client.post("/api/v1/coupons/claim",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"campaign_id": campaign_id}
    )
    assert claim1.status_code == 201

    claim2 = client.post("/api/v1/coupons/claim",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"campaign_id": campaign_id}
    )
    assert claim2.status_code == 409


def test_redeem_coupon():
    user_response = client.post("/api/v1/auth/register", json={
        "email": "redeem_user@example.com",
        "password": "password123"
    })
    user_token = user_response.json()["access_token"]

    merchant_response = client.post("/api/v1/merchant/register", json={
        "name": "Redeem Cafe",
        "name_ar": "مقهى الاسترداد",
        "email": "merchant_redeem@example.com",
        "password": "password123"
    })
    merchant_token = merchant_response.json()["access_token"]

    campaign_response = client.post("/api/v1/merchant/campaigns",
        headers={"Authorization": f"Bearer {merchant_token}"},
        json={
            "merchant_name": "Redeem Cafe",
            "merchant_name_ar": "مقهى الاسترداد",
            "coupon_title": "Free Coffee",
            "coupon_title_ar": "قهوة مجانية",
            "discount_code": "REDEEMTEST",
            "latitude": 180.0,
            "longitude": 160.0,
            "geofence_radius": 100.0,
            "color_hex": "#D4A373",
            "start_date": "2026-06-01",
            "end_date": "2026-06-30"
        }
    )
    campaign_id = campaign_response.json()["id"]

    claim_response = client.post("/api/v1/coupons/claim",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"campaign_id": campaign_id}
    )
    coupon_code = claim_response.json()["coupon"]["coupon_code"]

    redeem_response = client.post("/api/v1/coupons/redeem",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "campaign_id": campaign_id,
            "coupon_code": coupon_code
        }
    )
    assert redeem_response.status_code == 200
    assert redeem_response.json()["success"] == True
    assert redeem_response.json()["loyalty_card"]["stamps_count"] == 1
    assert redeem_response.json()["loyalty_card"]["points"] == 100


def test_geofence_check():
    user_response = client.post("/api/v1/auth/register", json={
        "email": "geofence_user@example.com",
        "password": "password123"
    })
    user_token = user_response.json()["access_token"]

    merchant_response = client.post("/api/v1/merchant/register", json={
        "name": "Geofence Cafe",
        "name_ar": "مقهى الجغرافي",
        "email": "merchant_geo@example.com",
        "password": "password123"
    })
    merchant_token = merchant_response.json()["access_token"]

    campaign_response = client.post("/api/v1/merchant/campaigns",
        headers={"Authorization": f"Bearer {merchant_token}"},
        json={
            "merchant_name": "Geofence Cafe",
            "merchant_name_ar": "مقهى الجغرافي",
            "coupon_title": "Free Coffee",
            "coupon_title_ar": "قهوة مجانية",
            "discount_code": "GEOTEST",
            "latitude": 180.0,
            "longitude": 160.0,
            "geofence_radius": 100.0,
            "color_hex": "#D4A373",
            "start_date": "2026-06-01",
            "end_date": "2026-06-30"
        }
    )
    campaign_id = campaign_response.json()["id"]

    response = client.post("/api/v1/geofencing/check",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "latitude": 150.0,
            "longitude": 150.0,
            "campaign_id": campaign_id
        }
    )
    assert response.status_code == 200
