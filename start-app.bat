@echo off
echo ===================================================
echo Healthcare Center App - Starting Application
echo ===================================================

:: Set window title
title Healthcare Center App

:: Check if application ports are available
echo Checking if required ports are available...
set PORT_CONFLICT=0

:: Check port 3000 (React frontend)
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% equ 0 (
    echo ERROR: Port 3000 is already in use.
    set PORT_CONFLICT=1
)

:: Check port 8000 (FastAPI backend)
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% equ 0 (
    echo ERROR: Port 8000 is already in use.
    set PORT_CONFLICT=1
)

if %PORT_CONFLICT% equ 1 (
    echo Please close the applications using these ports and try again.
    echo Frontend uses port 3000, Backend uses port 8000.
    pause
    exit /b 1
)

echo All required ports are available!
echo.

:: Start the backend server in a new window
echo Starting backend server...
start "Healthcare Backend" cmd /k "cd backend && python -c "from app.init_db import init_db; init_db()" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start the frontend in this window
echo Starting frontend server...
echo.
echo ===================================================
echo Frontend server starting at http://localhost:3000
echo Backend API running at http://localhost:8000
echo API Documentation at http://localhost:8000/docs
echo.
echo Close this window to stop both servers
echo ===================================================
echo.

npm start

:: When npm start is terminated, also terminate the backend process
taskkill /fi "WindowTitle eq Healthcare Backend" /f >nul 2>nul
echo Application stopped.
