@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Healthcare Center Application - Install Dependencies
echo ===================================================
echo.

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher and try again
    goto :error
)

echo Python version:
python --version

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher and try again
    goto :error
)

echo Node.js version:
node --version
echo npm version:
npm --version

echo.
echo =================================
echo INSTALLING FRONTEND DEPENDENCIES
echo =================================
echo.

echo Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    goto :error
)
echo Frontend dependencies installed successfully!

echo.
echo =================================
echo INSTALLING BACKEND DEPENDENCIES
echo =================================
echo.

echo Installing Python dependencies...
cd backend
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    goto :error
)
echo Backend dependencies installed successfully!

cd ..

echo.
echo ===================================================
echo   All dependencies installed successfully!
echo ===================================================
echo.
echo You can now run:
echo - setup-local.bat: to initialize the application
echo - start-app.bat: to start the application
echo.
echo Press any key to exit...
pause >nul
exit /b 0

:error
echo.
echo ERROR: Dependency installation failed.
echo Please check the error messages above and try again.
echo.
pause
exit /b 1
