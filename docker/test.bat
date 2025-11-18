@echo off
echo 🧪 Testing RFQ Backend Docker Setup...
echo.

REM Test 1: Check if Docker is running
echo [1/5] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running
    pause
    exit /b 1
) else (
    echo ✅ Docker is running
)

REM Test 2: Check if services are running
echo.
echo [2/5] Checking services...
docker-compose ps

REM Test 3: Check database connection
echo.
echo [3/5] Testing database connection...
docker-compose exec -T db pg_isready -U rfq_user
if errorlevel 1 (
    echo ❌ Database is not ready
) else (
    echo ✅ Database is ready
)

REM Test 4: Check Redis connection
echo.
echo [4/5] Testing Redis connection...
docker-compose exec -T redis redis-cli ping
if errorlevel 1 (
    echo ❌ Redis is not ready
) else (
    echo ✅ Redis is ready
)

REM Test 5: Check API health
echo.
echo [5/5] Testing API health...
curl -s http://localhost:3000/health
if errorlevel 1 (
    echo ❌ API is not responding
) else (
    echo.
    echo ✅ API is responding
)

echo.
echo 🎉 All tests completed!
echo.
pause
