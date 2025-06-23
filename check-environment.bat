@echo off
echo ===================================================
echo Healthcare Center App - Environment Check
echo ===================================================

echo Checking system requirements...
echo.

:: Check Node.js
echo [1/6] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    goto :END_CHECK
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo Node.js is installed: %NODE_VERSION%
    echo.
)

:: Check NPM
echo [2/6] Checking NPM...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: NPM is not installed or not in PATH.
    echo.
    goto :END_CHECK
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo NPM is installed: %NPM_VERSION%
    echo.
)

:: Check Python
echo [3/6] Checking Python...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/
    echo.
    goto :END_CHECK
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo %PYTHON_VERSION% is installed
    echo.
)

:: Check Pip
echo [4/6] Checking PIP...
where pip >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: PIP is not installed or not in PATH.
    echo.
    goto :END_CHECK
) else (
    for /f "tokens=*" %%i in ('pip --version') do set PIP_VERSION=%%i
    echo PIP is installed: %PIP_VERSION%
    echo.
)

:: Check Rust (required for pydantic)
echo [5/6] Checking Rust...
where rustc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: Rust is not installed or not in PATH.
    echo Rust is recommended for compiling certain Python packages.
    echo Run setup-rust-python.bat if you encounter installation issues.
    echo.
) else (
    for /f "tokens=*" %%i in ('rustc --version') do set RUST_VERSION=%%i
    echo Rust is installed: %RUST_VERSION%
    echo.
)

:: Check project structure
echo [6/6] Checking project structure...
if not exist "package.json" (
    echo ERROR: package.json not found in current directory.
    echo Make sure you're running this from the project root.
    echo.
    goto :END_CHECK
) else (
    echo Frontend project structure verified.
)

if not exist "backend\requirements.txt" (
    echo ERROR: Backend requirements.txt not found.
    echo Make sure the project structure is intact.
    echo.
    goto :END_CHECK
) else (
    echo Backend project structure verified.
)

echo.
echo Checking for setup batch files:
echo - check-environment.bat: [PRESENT]
if exist "install-dependencies.bat" (echo - install-dependencies.bat: [PRESENT]) else (echo - install-dependencies.bat: [MISSING])
if exist "start-app.bat" (echo - start-app.bat: [PRESENT]) else (echo - start-app.bat: [MISSING])
if exist "stop-app.bat" (echo - stop-app.bat: [PRESENT]) else (echo - stop-app.bat: [MISSING])
if exist "setup-rust-python.bat" (echo - setup-rust-python.bat: [PRESENT]) else (echo - setup-rust-python.bat: [MISSING])

echo.
echo ===================================================
echo All checks passed successfully!
echo.
echo Your environment is correctly set up for the Healthcare Center App.
echo.
echo Next steps:
echo 1. Run 'install-dependencies.bat' to install all dependencies
echo 2. Run 'start-app.bat' to start the application
echo.
echo Or, use 'setup.bat' for a guided setup process
echo ===================================================
goto :EOF

:END_CHECK
echo ===================================================
echo Environment check failed. Please fix the issues above.
echo ===================================================
