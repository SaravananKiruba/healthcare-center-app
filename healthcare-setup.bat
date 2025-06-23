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
python -m pip install --upgrade pip
:: Install core dependencies first to ensure compatibility with Python 3.13
python -m pip install --no-cache-dir typing-extensions>=4.9.0 pydantic-core>=2.14.3 pydantic>=2.4.2
python -m pip install --no-cache-dir -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo.
    echo WARNING: Initial dependency installation encountered issues.
    echo Attempting alternative installation approach...
    
    :: Try installing dependencies one by one with specific versions known to work with Python 3.13
    python -m pip install --no-cache-dir typing-extensions>=4.9.0
    python -m pip install --no-cache-dir pydantic-core>=2.14.3
    python -m pip install --no-cache-dir pydantic>=2.4.2
    python -m pip install --no-cache-dir fastapi>=0.104.1
    python -m pip install --no-cache-dir uvicorn[standard]>=0.24.0
    python -m pip install --no-cache-dir sqlalchemy==1.4.50
    python -m pip install --no-cache-dir python-multipart==0.0.6
    python -m pip install --no-cache-dir email-validator>=2.1.0
    python -m pip install --no-cache-dir pyjwt==2.8.0
    python -m pip install --no-cache-dir python-jose[cryptography]==3.3.0
    python -m pip install --no-cache-dir passlib[bcrypt]==1.7.4
    python -m pip install --no-cache-dir python-dotenv==1.0.0
    
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

:: Run the dedicated initialization script
python initialize_db.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Failed to initialize database.
    echo.
    echo This might be due to compatibility issues between Python 3.13 and the dependencies.
    echo Trying with a more specific approach...
    
    :: Try again with a more direct approach
    python -m pip install --no-cache-dir pydantic-core>=2.14.3 pydantic>=2.4.2
    
    :: Try again with the script
    python initialize_db.py    if %ERRORLEVEL% neq 0 (
        echo.
        echo ERROR: Database initialization failed. Please try running the following commands manually:
        echo cd backend
        echo python -m pip install --upgrade pip
        echo python -m pip install --no-cache-dir typing-extensions>=4.9.0 pydantic-core>=2.14.3 pydantic>=2.4.2 fastapi>=0.104.1
        echo python initialize_db.py
        echo.
        pause
        cd ..
        exit /b 1
    )
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
