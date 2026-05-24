@echo off
REM Railway Booking Backend Setup Script for Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║  Railway Booking Backend Setup         ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%

REM Check if npm is installed
npm -v >nul 2>&1
if errorlevel 1 (
    echo ✗ npm is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✓ npm found: %NPM_VERSION%

REM Install dependencies
echo.
echo → Installing dependencies...
call npm install

if errorlevel 1 (
    echo ✗ Failed to install dependencies
    exit /b 1
)

echo ✓ Dependencies installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo.
    echo → Creating .env file...
    copy .env.example .env
    echo ✓ .env file created
    echo Note: Please update .env with your MongoDB URI if needed
) else (
    echo ✓ .env file already exists
)

echo.
echo ✓ Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your MongoDB URI (if needed)
echo 2. Run: npm run seed (to seed dummy data)
echo 3. Run: npm run dev (to start development server)
echo.
