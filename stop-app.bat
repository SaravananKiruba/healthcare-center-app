@echo off
echo ===================================================
echo   Healthcare Center Application - Stopping App
echo ===================================================
echo.

echo This will stop all running instances of the Healthcare Center Application.
choice /C YN /M "Do you want to continue"
if %errorlevel% neq 1 (
    echo Operation cancelled by user.
    exit /b 0
)

echo.
echo Stopping Healthcare Center Application processes...

echo Stopping Healthcare Frontend windows...
taskkill /FI "WINDOWTITLE eq Healthcare Frontend*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo Frontend processes terminated successfully.
) else (
    echo No running frontend processes found.
)

echo Stopping Healthcare Backend windows...
taskkill /FI "WINDOWTITLE eq Healthcare Backend*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo Backend processes terminated successfully.
) else (
    echo No running backend processes found.
)

echo Stopping Node.js processes for the application...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000"') DO (
    taskkill /F /PID %%P 2>nul
)

echo Stopping Uvicorn processes for the application...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":8000"') DO (
    taskkill /F /PID %%P 2>nul
)

echo.
echo ===================================================
echo   Application stopped successfully!
echo ===================================================
echo All server processes have been terminated.
echo.
echo Press any key to exit...
pause >nul
