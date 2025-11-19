@echo off
echo 🚀 Starting RFQ Backend Locally (No Docker)
echo.

REM Stop any running node processes first
echo [1/7] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ Ready to start

REM Check if node_modules exists
echo.
if not exist "node_modules" (
    echo [2/7] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [2/7] ✅ Dependencies already installed
)

REM Generate Prisma client
echo.
echo [3/7] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    echo.
    echo 💡 Try running this manually:
    echo    1. Close all terminals
    echo    2. Run: npx prisma generate
    echo.
    pause
    exit /b 1
)

REM Check if database is accessible
echo.
echo [4/7] Checking database connection...
call npx prisma db pull --force >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Database not accessible. Make sure PostgreSQL is running.
    echo.
    echo 💡 Quick setup:
    echo    1. Install PostgreSQL
    echo    2. Create database: CREATE DATABASE rfq_platform;
    echo    3. Create user: CREATE USER rfq_user WITH PASSWORD 'simplepass123';
    echo    4. Grant privileges: GRANT ALL PRIVILEGES ON DATABASE rfq_platform TO rfq_user;
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" (
        pause
        exit /b 1
    )
)

REM Run migrations
echo.
echo [5/7] Running database migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo ⚠️  Migration failed. Trying dev mode...
    call npx prisma migrate dev
)

REM Ask about seeding
echo.
echo [6/7] Database seeding...
set /p SEED="Do you want to seed the database? (y/n): "
if /i "%SEED%"=="y" (
    call npm run seed
)

REM Start the server
echo.
echo [7/7] Starting development server...
echo.
echo ✅ RFQ Backend is starting!
echo.
echo 🌐 Access Points:
echo    - API: http://localhost:3000
echo    - Health: http://localhost:3000/health
echo    - Prisma Studio: Run 'npx prisma studio' in another terminal
echo.
echo 📝 Press Ctrl+C to stop the server
echo.

call npm run dev
