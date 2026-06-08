# Walleo - QR Loyalty Platform

## Overview

Walleo is a complete loyalty and digital wallet platform for multi-merchant businesses. It enables:

- **QR Code Scanning** - Instant coupon claiming
- **Digital Wallet** - Store and manage coupons
- **Loyalty Stamps** - Collect stamps, earn rewards
- **Geofencing** - Proximity-based push notifications
- **Merchant Dashboard** - Campaign management & analytics
- **Offline-First** - Works without internet, syncs automatically

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Android   │────▶│   Backend   │────▶│  Database   │
│     App     │◀────│  (FastAPI)  │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │     Web     │
                    │  Dashboard  │
                    └─────────────┘
```

## Project Structure

```
Walleo-platform/
├── Android/     # Kotlin + Jetpack Compose
├── backend/     # Python + FastAPI + PostgreSQL
├── web/         # React + TypeScript + MUI
└── docs/        # Documentation
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for Web)
- Android Studio (for Android)

### 1. Backend

```bash
cd backend
cp .env.example .env
docker-compose up -d
alembic upgrade head
```

### 2. Web Dashboard

```bash
cd web/merchant-dashboard
npm install
npm run dev
```

### 3. Android App

```bash
# Open in Android Studio
# Update BASE_URL in ApiClient.kt to your backend URL
# Run the app
```

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| QR Scanner | ✅ | Scan QR codes to claim coupons |
| Digital Wallet | ✅ | Store and manage coupons |
| Loyalty Stamps | ✅ | 5 stamps = bonus reward |
| Geofencing | ✅ | Proximity-based notifications |
| Merchant Dashboard | ✅ | Manage campaigns & analytics |
| Offline-First | ✅ | Works without internet |
| Push Notifications | 🔄 | Coming soon |

## Tech Stack

| Component | Technology |
|-----------|------------|
| Android | Kotlin, Jetpack Compose, Room, Retrofit, WorkManager |
| Backend | Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic |
| Web | React, TypeScript, Material UI, Recharts, Vite |
| Infrastructure | Docker, Nginx, GitHub Actions |

## License

Private - All rights reserved
