@echo off
echo ===================================================
echo Healthcare Center App - Setup Script
echo ===================================================
echo.

title Healthcare Center - Setup

:: -------------------------------------------
:: Environment Check
:: -------------------------------------------
echo [1/3] Checking environment requirements...
echo.

:: Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo Node.js is installed: %NODE_VERSION%
    echo.
)

:: Check Python
echo Checking Python...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo %PYTHON_VERSION% is installed
    echo.
)

:: Check project structure
echo Checking project structure...
if not exist "package.json" (
    echo ERROR: package.json not found in current directory.
    echo Make sure you're running this from the project root.
    echo.
    pause
    exit /b 1
)

if not exist "backend\requirements.txt" (
    echo ERROR: Backend requirements.txt not found.
    echo Make sure the project structure is intact.
    echo.
    pause
    exit /b 1
)

echo Environment check completed successfully!
echo.

:: -------------------------------------------
:: Install Dependencies
:: -------------------------------------------
echo [2/3] Installing dependencies...
echo.

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    echo Please check npm errors and try again.
    echo.
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo Installing backend dependencies...
cd backend
pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo.
    echo WARNING: Initial dependency installation encountered issues.
    echo Attempting alternative installation approach...
    
    :: Try installing with more specific commands
    pip install --no-cache-dir pydantic-core
    pip install --no-cache-dir -r requirements.txt
    
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ERROR: Failed to install backend dependencies.
        echo.
        pause
        cd ..
        exit /b 1
    )
)
cd ..
echo Backend dependencies installed successfully!
echo.

:: -------------------------------------------
:: Initialize Database
:: -------------------------------------------
echo [3/3] Initializing database...
cd backend
:: Create a backup of existing database if it exists
if exist "healthcare.db" (
    echo Creating backup of existing database...
    copy healthcare.db healthcare.db.bak >nul
)

echo Initializing database with sample data...
python -c "from app.init_db import init_db; init_db()"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to initialize database.
    echo.
    pause
    cd ..
    exit /b 1
)
cd ..
echo Database initialized successfully!
echo.

echo ===================================================
echo Healthcare Center App setup completed successfully!
echo ===================================================
echo.
echo To start the application, run:
echo healthcare-start.bat
echo.
pause
