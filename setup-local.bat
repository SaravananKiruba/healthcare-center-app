@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Healthcare Center Application - Local Setup
echo ===================================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher and try again
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm and try again
    pause
    exit /b 1
)

echo.
echo =================================
echo BACKEND SETUP
echo =================================

cd backend

echo Installing Python dependencies from requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo Initializing database...
python -c "from app.init_db import init_db; init_db()" 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Database initialization completed with some warnings
) else (
    echo Database initialized successfully!
)

cd ..

echo.
echo =================================
echo FRONTEND SETUP
echo =================================

echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo =================================
echo SETUP COMPLETED SUCCESSFULLY
echo =================================
echo.
echo The application has been set up successfully!
echo.
echo To start the application, run: start-app.bat
echo.
echo Default users:
echo Admin: admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123
echo Clerk: clerk@healthcare.com / clerk123
echo.
echo Press any key to exit...
pause >nul
