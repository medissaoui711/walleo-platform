def test_register(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "password": "password123",
    })
    resp = client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "password": "password123",
    })
    assert resp.status_code == 409
    assert "already" in resp.json()["detail"].lower()


def test_login(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@test.com",
        "password": "password123",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wp@test.com",
        "password": "password123",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "wp@test.com",
        "password": "wrongpass",
    })
    assert resp.status_code == 401


def test_login_nonexistent(client):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nobody@test.com",
        "password": "password123",
    })
    assert resp.status_code == 401
