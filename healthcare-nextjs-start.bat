@echo off
echo ===================================================
echo Healthcare Center App - Next.js Start
echo ===================================================
echo.

title Healthcare Center - Next.js Running

:: Check if setup was completed
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run healthcare-nextjs-setup.bat first.
    echo.
    pause
    exit /b 1
)

if not exist ".env.local" (
    echo ERROR: .env.local not found!
    echo Please run healthcare-nextjs-setup.bat first.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run healthcare-nextjs-setup.bat first.
    echo.
    pause
    exit /b 1
)

:: Check if ports are available
echo [1/4] Checking port availability...
netstat -ano | findstr :3000 >nul
if %ERRORLEVEL% equ 0 (
    echo WARNING: Port 3000 is already in use.
    echo The application might already be running or another service is using this port.
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo Startup cancelled.
        pause
        exit /b 1
    )
) else (
    echo ✓ Port 3000 is available
)
echo.

:: Check database connection
echo [2/4] Checking database configuration...
if exist "prisma\schema.prisma" (
    echo ✓ Database schema found
) else (
    echo ERROR: Prisma schema not found!
    echo Please run healthcare-nextjs-setup.bat first.
    pause
    exit /b 1
)

:: Check if database is ready
echo [3/4] Verifying database setup...
npx prisma db seed --preview-feature >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo WARNING: Database might not be initialized.
    echo.
    echo To initialize your database, run:
    echo   npm run db:push
    echo   npm run db:seed
    echo.
    set /p init="Initialize database now? (y/N): "
    if /i "%init%"=="y" (
        echo Pushing database schema...
        npx prisma db push
        if %ERRORLEVEL% equ 0 (
            echo Seeding initial data...
            npm run db:seed
            if %ERRORLEVEL% equ 0 (
                echo ✓ Database initialized successfully
            ) else (
                echo WARNING: Database seeding failed
            )
        ) else (
            echo ERROR: Database push failed. Check your DATABASE_URL in .env.local
            pause
            exit /b 1
        )
    )
) else (
    echo ✓ Database appears to be ready
)
echo.

:: Start the application
echo [4/4] Starting Healthcare Center App...
echo.
echo ===================================================
echo 🚀 Application Starting!
echo ===================================================
echo.
echo Your app will be available at:
echo 👉 http://localhost:3000
echo.
echo Default login credentials:
echo 👤 Admin: admin@healthcare.com / admin123
echo 👨‍⚕️ Doctor: doctor@healthcare.com / doctor123
echo.
echo Press Ctrl+C to stop the application
echo ===================================================
echo.

:: Start Next.js development server
npm run dev

:: If we reach here, the server has stopped
echo.
echo ===================================================
echo Application stopped.
echo ===================================================
pause
