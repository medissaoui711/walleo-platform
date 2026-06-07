from src.core.loyalty_engine import process_redeem


def test_process_redeem_basic():
    r = process_redeem(0, 0)
    assert r.stamps_count == 1
    assert r.points == 100
    assert r.triggered_reward == False
    assert r.bonus_points_earned == 0


def test_process_redeem_full_cycle():
    r = process_redeem(5, 500)
    assert r.stamps_count == 1
    assert r.points == 850  # 500 + 100 + 250
    assert r.triggered_reward == True
    assert r.bonus_points_earned == 250


def test_process_redeem_mid_cycle():
    r = process_redeem(2, 200)
    assert r.stamps_count == 3
    assert r.points == 300
    assert r.triggered_reward == False


def test_process_redeem_multiple_cycles():
    r = process_redeem(5, 500)
    assert r.stamps_count == 1
    r = process_redeem(5, r.points)
    assert r.stamps_count == 1
    assert r.points == 1200
    assert r.triggered_reward == True


def test_claim_coupon(client):
    client.post("/api/v1/auth/register", json={
        "email": "claim@test.com",
        "password": "password123",
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "claim@test.com",
        "password": "password123",
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/coupons/claim", json={"campaign_id": 1}, headers=headers)
    assert resp.status_code == 404  # no campaign exists


def test_redeem_coupon_missing(client):
    client.post("/api/v1/auth/register", json={
        "email": "redeem@test.com",
        "password": "password123",
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "redeem@test.com",
        "password": "password123",
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/coupons/redeem", json={
        "campaign_id": 1,
        "coupon_code": "NONEXISTENT",
    }, headers=headers)
    assert resp.status_code == 404
