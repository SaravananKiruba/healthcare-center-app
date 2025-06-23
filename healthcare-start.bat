@echo off
echo ===================================================
echo Healthcare Center App - Starting Application
echo ===================================================
echo.

title Healthcare Center App - Running

:: Check if ports are available
echo Checking if required ports are available...

:: Check port 3000 (React frontend)
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% equ 0 (
    echo ERROR: Port 3000 is already in use.
    echo Please close the application using this port and try again.
    echo Frontend requires port 3000 to be available.
    echo.
    pause
    exit /b 1
)

:: Check port 8000 (FastAPI backend)
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% equ 0 (
    echo ERROR: Port 8000 is already in use.
    echo Please close the application using this port and try again.
    echo Backend requires port 8000 to be available.
    echo.
    pause
    exit /b 1
)

echo All required ports are available!
echo.

:: Create a temporary batch file for the backend process
echo @echo off > temp_backend.bat
echo cd backend >> temp_backend.bat
echo title Healthcare Center - Backend Server >> temp_backend.bat
echo python -c "from app.init_db import init_db; init_db()" >> temp_backend.bat
echo python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 >> temp_backend.bat
echo pause >> temp_backend.bat

:: Start the backend in a new window
echo Starting backend server...
start "" temp_backend.bat

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start the frontend
echo Starting frontend server...
echo.
echo ===================================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Default login credentials:
echo   Admin: admin@healthcare.com / admin123
echo   Doctor: doctor@healthcare.com / doctor123
echo ===================================================
echo.
echo Press Ctrl+C in this window to stop both servers
echo.

:: Save current directory
set "CURRENT_DIR=%CD%"

:: Start the frontend server in the current window
npm start

:: When npm start is terminated, also terminate the backend processes
echo.
echo Shutting down application...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq Healthcare Center - Backend Server" >nul 2>&1

:: Clean up temporary file
del temp_backend.bat >nul 2>&1

echo.
echo Application stopped.
pause
