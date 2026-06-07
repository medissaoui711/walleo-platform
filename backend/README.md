# Walleo - QR Loyalty Backend API

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)

### Run with Docker

```bash
cp .env.example .env
docker-compose up -d
curl http://localhost:8000/health
```

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Test Data

```sql
INSERT INTO campaigns (
    merchant_name, merchant_name_ar, coupon_title, coupon_title_ar,
    coupon_description, coupon_description_ar, discount_code,
    latitude, longitude, geofence_radius, color_hex, start_date, end_date
) VALUES (
    'Brew Haven Coffee', 'مقهى بريو هيفن',
    'Free Double Espresso Shot', 'إسبريسو مضاعف مجاني',
    'Get a free luxury double shot espresso', 'احصل على كوب إسبريسو مضاعف مجاناً',
    'BREWHAVENFREE', 180.0, 160.0, 100.0, '#D4A373', '2026-06-01', '2026-06-30'
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/campaigns` | List campaigns |
| POST | `/api/v1/coupons/claim` | Claim coupon |
| POST | `/api/v1/coupons/redeem` | Redeem coupon |
| POST | `/api/v1/geofencing/check` | Check geofence |
| POST | `/api/v1/merchant/register` | Merchant registration |
| POST | `/api/v1/merchant/campaigns` | Create campaign |

### Project Structure

```
backend/
├── src/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── loyalty_engine.py
│   ├── models/
│   │   ├── db_models.py
│   │   └── schemas.py
│   └── routers/
│       ├── auth.py
│       ├── campaigns.py
│       ├── coupons.py
│       ├── geofencing.py
│       ├── analytics.py
│       └── merchant.py
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
└── .env.example
```
