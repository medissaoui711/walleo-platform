def test_get_campaigns_requires_auth(client):
    resp = client.get("/api/v1/campaigns")
    assert resp.status_code == 401


def test_get_campaigns_empty(client):
    client.post("/api/v1/auth/register", json={
        "email": "c@test.com",
        "password": "password123",
    })
    login = client.post("/api/v1/auth/login", json={
        "email": "c@test.com",
        "password": "password123",
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/campaigns", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []
