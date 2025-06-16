@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Healthcare Center Application - Starting App
echo ===================================================
echo.

REM Check for previous instances and offer to terminate them
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find "node.exe" >nul
set NODE_RUNNING=%errorlevel%

tasklist /FI "WINDOWTITLE eq Healthcare*" 2>nul | find "cmd.exe" >nul
set CMD_RUNNING=%errorlevel%

if %NODE_RUNNING% equ 0 (
    echo WARNING: Node.js processes are already running
    choice /C YN /M "Do you want to stop existing processes before continuing"
    if !errorlevel! equ 1 (
        echo Stopping Node.js processes...
        taskkill /f /im node.exe 2>nul
    )
)

REM Start the backend server
echo.
echo =================================
echo STARTING BACKEND SERVER
echo =================================
echo.

echo Starting Backend Server on port 8000...
start "Healthcare Backend" cmd /k "cd /d "%CD%\backend" && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for the backend to start
echo Waiting for backend to initialize...
echo This will take a few seconds...
timeout /t 8 /nobreak > nul

REM Start the frontend server
echo.
echo =================================
echo STARTING FRONTEND SERVER
echo =================================
echo.

echo Starting Frontend Server on port 3000...
start "Healthcare Frontend" cmd /k "cd /d "%CD%" && npm start"

REM Display application information
echo.
echo =================================
echo APPLICATION STARTED
echo =================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Default users:
echo Admin: admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123
echo Clerk: clerk@healthcare.com / clerk123
echo.
echo Both servers are running in separate windows.
echo Use stop-app.bat to stop all servers.
echo.

REM Open the frontend in the default browser after a short delay
echo Opening application in browser in 5 seconds...
timeout /t 5 /nobreak > nul
start "" http://localhost:3000

echo Press any key to exit this window (servers will keep running)...
pause >nul
