@echo off
echo 🚀 Starting RFQ Backend with Docker...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Build and start containers
echo 📦 Building and starting containers...
docker-compose up -d --build

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run migrations
echo 🔄 Running database migrations...
docker-compose exec -T app npx prisma migrate deploy

REM Ask about seeding
echo.
set /p SEED="Do you want to seed the database with initial data? (y/n): "
if /i "%SEED%"=="y" (
    echo 🌱 Seeding database...
    docker-compose exec -T app npm run seed
)

REM Show status
echo.
echo ✅ RFQ Backend is running!
echo.
echo 📊 Service Status:
docker-compose ps
echo.
echo 🌐 Access Points:
echo    - API: http://localhost:3000
echo    - Health: http://localhost:3000/health
echo    - Database: localhost:5432
echo    - Redis: localhost:6379
echo.
echo 📝 Useful Commands:
echo    - View logs: docker-compose logs -f app
echo    - Stop services: docker-compose down
echo    - Restart: docker-compose restart app
echo.
pause
