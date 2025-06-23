@echo off
echo ===================================================
echo Healthcare Center App - One-Click Setup
echo ===================================================
echo.
echo This script will:
echo 1. Check your environment
echo 2. Install all dependencies
echo 3. Start the application
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

:: Run the environment check first
echo.
echo ===================================================
echo Step 1: Checking environment...
echo ===================================================
call check-environment.bat

if %ERRORLEVEL% neq 0 (
    echo Environment check failed. Please fix the issues before continuing.
    pause
    exit /b 1
)

:: Ask if user wants to install dependencies
echo.
echo ===================================================
echo Step 2: Install dependencies?
echo ===================================================
set /p INSTALL_DEPS="Do you want to install dependencies? (Y/N): "
if /I "%INSTALL_DEPS%"=="Y" (
    echo.
    echo Installing dependencies...
    call install-dependencies.bat
    
    if %ERRORLEVEL% neq 0 (
        echo.
        echo Dependency installation encountered errors.
        echo Would you like to try running setup-rust-python.bat to fix common issues?
        set /p SETUP_RUST="Run setup-rust-python.bat? (Y/N): "
        
        if /I "%SETUP_RUST%"=="Y" (
            echo.
            echo Running setup-rust-python.bat...
            call setup-rust-python.bat
            
            echo.
            echo Trying to install dependencies again...
            call install-dependencies.bat
            
            if %ERRORLEVEL% neq 0 (
                echo.
                echo Dependency installation failed after attempted fixes.
                echo Please check the SETUP_INSTRUCTIONS.md file for troubleshooting.
                pause
                exit /b 1
            )
        ) else (
            echo.
            echo Dependency installation was not completed.
            pause
            exit /b 1
        )
    )
)

:: Ask if user wants to start the application
echo.
echo ===================================================
echo Step 3: Start the application?
echo ===================================================
set /p START_APP="Do you want to start the application now? (Y/N): "
if /I "%START_APP%"=="Y" (
    echo.
    echo Starting the application...
    call start-app.bat
) else (
    echo.
    echo To start the application later, run:
    echo start-app.bat
    pause
)
