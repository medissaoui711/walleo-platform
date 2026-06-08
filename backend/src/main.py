from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.database import Base, engine
from src.core.config import settings
from src.core.exceptions import setup_exception_handlers
from src.routers import auth, campaigns, coupons, geofencing, analytics, merchant
import json

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Walleo - QR Loyalty API",
    description="Backend API for QR Loyalty Android App - Walleo",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=json.loads(settings.CORS_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(campaigns.router)
app.include_router(coupons.router)
app.include_router(geofencing.router)
app.include_router(analytics.router)
app.include_router(merchant.router)


@app.get("/")
def root() -> dict:
    return {
        "name": "Walleo API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "qr-loyalty-backend"}
