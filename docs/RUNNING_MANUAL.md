# Running Manual - Walleo Platform

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 10 GB | 20 GB |
| OS | Ubuntu 20.04+ / macOS / Windows 11 | - |

---

## Development Environment Setup

### 1. Install Prerequisites

#### Ubuntu/Debian
```bash
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Python
sudo apt install python3.11 python3.11-venv

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Android Studio
# Download from https://developer.android.com/studio
```

#### macOS
```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Docker
brew install --cask docker

# Python
brew install python@3.11

# Node.js
brew install node@18

# Android Studio
brew install --cask android-studio
```

### 2. Clone Repository

```bash
git clone https://github.com/your-username/qr-loyalty.git
cd qr-loyalty
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e ".[dev]"

cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL with Docker
docker-compose up -d

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload --port 8000
```

### 4. Web Dashboard Setup

```bash
cd web/merchant-dashboard
npm install
npm run dev
```

### 5. Android Setup

1. Open Android Studio
2. Open project: `qr-loyalty/Android`
3. Wait for Gradle sync
4. Update `BASE_URL` in `ApiClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://10.0.2.2:8000/"
   ```
5. Run the app (Shift + F10)

---

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Android Tests
```bash
cd Android
./gradlew test
./gradlew connectedAndroidTest
```

---

## Building for Production

### Backend Docker Build
```bash
cd backend
docker build -t walleo-backend .
docker tag walleo-backend your-registry/walleo-backend:latest
docker push your-registry/walleo-backend:latest
```

### Web Production Build
```bash
cd web/merchant-dashboard
npm run build
# Output in 'dist' folder
```

### Android Release Build
```bash
cd Android
./gradlew assembleRelease
# APK at app/build/outputs/apk/release/
```

---

## Deployment

### Deploy to Railway
```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Deploy
cd backend
railway up
```

### Deploy to Render
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set environment variables
5. Deploy

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/walleo
JWT_SECRET=your-super-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
APP_PORT=8000
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
```

---

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart container
docker-compose restart db
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
kill -9 <PID>
```

### Android Build Error
```bash
# Clean and rebuild
cd Android
./gradlew clean
./gradlew build
```

---

## Support

For issues, contact: support@walleo.com
