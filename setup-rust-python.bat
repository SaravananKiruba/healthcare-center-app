@echo off
echo ===================================================
echo Healthcare Center App - Rust & Python Setup Helper
echo ===================================================

:: Check for admin rights
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Administrator privileges required
    echo Please run this script as an administrator
    echo Right-click on the script and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo This script will install Rust and required Python packages
echo for the Healthcare Center App.
echo.
echo [1/4] Updating pip, wheel, and setuptools...
python -m pip install --upgrade pip wheel setuptools
if %ERRORLEVEL% neq 0 (
    echo Failed to upgrade pip and related packages.
    pause
    exit /b 1
)

echo.
echo [2/4] Installing/updating Rust using rustup...
curl -sSf -o rustup-init.exe https://win.rustup.rs/
if %ERRORLEVEL% neq 0 (
    echo Failed to download rustup-init.exe.
    echo Please check your internet connection.
    pause
    exit /b 1
)

rustup-init.exe -y --default-toolchain stable --profile minimal
if %ERRORLEVEL% neq 0 (
    echo Failed to install Rust.
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up environment variables...
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
setx PATH "%USERPROFILE%\.cargo\bin;%PATH%"

echo.
echo [4/4] Installing key Python packages...
pip install --no-cache-dir --upgrade pydantic-core
pip install --no-cache-dir --upgrade pydantic
pip install --no-cache-dir --upgrade fastapi

echo.
echo ===================================================
echo Setup completed successfully!
echo.
echo Please restart your command prompt and then run:
echo install-dependencies.bat
echo ===================================================

pause
