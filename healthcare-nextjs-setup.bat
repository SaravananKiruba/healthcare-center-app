@echo off
echo ===================================================
echo Healthcare Center App - Next.js Setup
echo ===================================================
echo.

title Healthcare Center - Next.js Setup

:: Check Node.js
echo [1/5] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js is installed: %NODE_VERSION%
)
echo.

:: Setup package.json
echo [2/5] Setting up Next.js configuration...
if exist "package.json" (
    echo ✓ Next.js package.json already configured
) else if exist "package-nextjs.json" (
    move "package-nextjs.json" "package.json" >nul
    echo ✓ Next.js package.json configured
) else (
    echo ERROR: Next.js configuration not found!
    echo Creating default package.json...
    echo {"name":"healthcare-center-nextjs","version":"0.1.0","private":true} > package.json
    echo Please run the setup again after package.json is created.
    pause
    exit /b 1
)
echo.

:: Install dependencies
echo [3/5] Installing dependencies...
echo This may take a few minutes...
npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully
echo.

:: Setup environment
echo [4/5] Setting up environment configuration...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo ✓ Environment file created (.env.local)
    ) else (
        echo Creating .env.local file...
        echo DATABASE_URL="postgresql://username:password@localhost:5432/healthcare" > .env.local
        echo NEXTAUTH_URL="http://localhost:3000" >> .env.local
        echo NEXTAUTH_SECRET="your-secret-key-change-this-in-production" >> .env.local
        echo NEXT_PUBLIC_API_URL="http://localhost:3000" >> .env.local
        echo NODE_ENV="development" >> .env.local
        echo ✓ Environment file created
    )
) else (
    echo ✓ Environment file already exists
)
echo.

:: Generate Prisma client
echo [5/5] Setting up database client...
npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to generate Prisma client. You'll need to set up the database first.
) else (
    echo ✓ Database client generated
)
echo.

echo ===================================================
echo 🎉 Setup Complete!
echo ===================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Setup your FREE database:
echo    • PlanetScale: https://planetscale.com (MySQL)
echo    • Supabase: https://supabase.com (PostgreSQL)
echo.
echo 2. Update .env.local with your database URL
echo.
echo 3. Initialize database:
echo    npm run db:push
echo    npm run db:seed
echo.
echo 4. Start the application:
echo    healthcare-nextjs-start.bat
echo.
echo Default login credentials will be:
echo • Admin: admin@healthcare.com / admin123
echo • Doctor: doctor@healthcare.com / doctor123
echo.
echo Press any key to open .env.local for editing...
pause >nul
notepad .env.local
