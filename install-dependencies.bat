@echo off
echo ===================================================
echo Healthcare Center App - Installing Dependencies
echo ===================================================

echo.
echo [1/5] Checking for required tools...

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/
    exit /b 1
)

:: Check if Rust is installed (needed for pydantic)
where rustc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: Rust is not installed or not in PATH.
    echo This is required for some Python packages.
    echo Installing Rust automatically...
    
    :: Create a temporary script to install Rust
    echo @echo off > install_rust.bat
    echo curl -sSf -o rustup-init.exe https://win.rustup.rs/ >> install_rust.bat
    echo rustup-init.exe -y --default-toolchain stable --profile minimal >> install_rust.bat
    echo set PATH=%%USERPROFILE%%\.cargo\bin;%%PATH%% >> install_rust.bat
    
    :: Run the temporary script
    call install_rust.bat
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Rust. Please install it manually from https://rustup.rs/
        echo After installing Rust, restart this script.
        exit /b 1
    )
    del install_rust.bat rustup-init.exe
    
    :: Update PATH to include Rust
    set PATH=%USERPROFILE%\.cargo\bin;%PATH%
    echo Rust installed successfully!
)

echo Required tools detected!
echo.

echo [2/4] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies.
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/5] Installing backend dependencies...
cd backend

:: Try to install using precompiled wheels first
echo Attempting to install packages with precompiled wheels...
pip install --no-cache-dir --only-binary=:all: -r requirements.txt
if %ERRORLEVEL% equ 0 (
    echo Backend dependencies installed successfully using precompiled wheels!
    goto :DB_INIT
)

:: If that fails, try the direct approach with specific flags for problematic packages
echo Falling back to direct installation...
pip install --no-cache-dir --upgrade pip wheel setuptools
pip install --no-cache-dir pydantic-core==2.10.1
pip install --no-cache-dir -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies using direct installation.
    echo.
    echo Attempting alternative installation approach...
    
    :: Create a simplified requirements file without version constraints
    echo fastapi > simplified-requirements.txt
    echo uvicorn[standard] >> simplified-requirements.txt
    echo sqlalchemy >> simplified-requirements.txt
    echo python-multipart >> simplified-requirements.txt
    echo pydantic >> simplified-requirements.txt
    echo email-validator >> simplified-requirements.txt
    echo pyjwt >> simplified-requirements.txt
    echo python-jose[cryptography] >> simplified-requirements.txt
    echo passlib[bcrypt] >> simplified-requirements.txt
    echo python-dotenv >> simplified-requirements.txt
    
    :: Try installing with the simplified requirements
    pip install --no-cache-dir -r simplified-requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ===================================================
        echo ERROR: Failed to install backend dependencies.
        echo.
        echo Manual installation steps:
        echo 1. Open a command prompt with administrator privileges
        echo 2. Run: pip install --upgrade pip wheel setuptools
        echo 3. Run: rustup default stable
        echo 4. Run: pip install -r backend/requirements.txt
        echo ===================================================
        cd ..
        exit /b 1
    )
    echo Backend dependencies installed with compatible versions!
    del simplified-requirements.txt
)

:DB_INIT
echo Backend dependencies installed successfully!
echo.

echo [4/5] Installing additional development tools...
pip install pytest black flake8
if %ERRORLEVEL% neq 0 (
    echo Warning: Failed to install development tools, but continuing...
)
echo.

echo [5/5] Initializing database...
python -c "from app.init_db import init_db; init_db()"
if %ERRORLEVEL% neq 0 (
    echo Failed to initialize database.
    cd ..
    exit /b 1
)
echo Database initialized successfully!
cd ..
echo.

echo ===================================================
echo Installation completed successfully!
echo.
echo NEXT STEPS:
echo 1. Run 'start-app.bat' to start the application
echo 2. Access the application at http://localhost:3000
echo 3. API documentation at http://localhost:8000/docs
echo ===================================================
