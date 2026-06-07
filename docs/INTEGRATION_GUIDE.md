# Integration Guide - Walleo API

## API Base URL
- Production: `https://api.walleo.com`
- Development: `http://localhost:8000`

## Authentication

All API endpoints (except register/login) require JWT token:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### Auth

#### POST `/api/v1/auth/register`

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### POST `/api/v1/auth/login`

Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Campaigns

#### GET `/api/v1/campaigns`

Get all active campaigns.

**Response:**
```json
[
  {
    "id": 1,
    "merchant_name": "Brew Haven Coffee",
    "merchant_name_ar": "مقهى بريو هيفن",
    "coupon_title": "Free Double Espresso",
    "coupon_title_ar": "إسبريسو مضاعف مجاني",
    "discount_code": "BREWHAVENFREE",
    "latitude": 180.0,
    "longitude": 160.0,
    "geofence_radius": 100.0,
    "color_hex": "#D4A373"
  }
]
```

### Coupons

#### POST `/api/v1/coupons/claim`

Claim a coupon by scanning QR code.

**Request:**
```json
{
  "campaign_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": 123,
    "campaign_id": 1,
    "coupon_code": "COUPON_1_12345",
    "status": "scanned"
  }
}
```

#### POST `/api/v1/coupons/redeem`

Redeem a coupon and add loyalty stamps.

**Request:**
```json
{
  "campaign_id": 1,
  "coupon_code": "COUPON_1_12345"
}
```

**Response:**
```json
{
  "success": true,
  "loyalty_card": {
    "campaign_id": 1,
    "stamps_count": 1,
    "max_stamps": 5,
    "points": 100,
    "triggered_reward": false
  }
}
```

### Geofencing

#### POST `/api/v1/geofencing/check`

Check if user is within campaign geofence.

**Request:**
```json
{
  "latitude": 185.0,
  "longitude": 165.0,
  "campaign_id": 1
}
```

**Response:**
```json
{
  "within_geofence": true,
  "campaign_name": "Brew Haven Coffee",
  "campaign_name_ar": "مقهى بريو هيفن"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (already exists) |
| 500 | Internal Server Error |

---

## Loyalty Engine Logic

```
Each redeem:
  - +1 stamp
  - +100 points

When stamps reach 6 (exceeds 5):
  - Reset to 1 stamp
  - +250 bonus points
```

---

## Offline-First Architecture

The Android app uses Room database for local storage and WorkManager for background sync:

1. User actions save to local database immediately
2. WorkManager syncs with cloud when online
3. UI updates from local database (Flow)
