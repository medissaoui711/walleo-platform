# Setup Guide

## Prerequisites

- Docker & Docker Compose
- Python 3.12+
- Android Studio (latest)
- JDK 17+

## Backend

```bash
cd backend
docker-compose up --build
```

## Android

1. Open `android/` in Android Studio
2. Sync Gradle
3. Run on emulator or device

## Environment Variables

| Variable     | Description        | Default     |
|-------------|--------------------|-------------|
| DB_PASSWORD | PostgreSQL password | changeme    |
| SECRET_KEY  | JWT signing key    | dev-secret  |
