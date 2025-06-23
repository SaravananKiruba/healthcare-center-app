@echo off
echo ===================================================
echo Healthcare Center App - Login Diagnostics
echo ===================================================

echo Checking backend server status...
curl -s -o nul -w "%%{http_code}" http://localhost:8000/health
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend server is not running or not responding.
    echo Please start the backend server using 'start-app.bat' first.
    goto :end
)

echo.
echo Checking database...
cd backend
python -c "from app.database import engine; from sqlalchemy import text; with engine.connect() as conn: result = conn.execute(text('SELECT COUNT(*) FROM users')); print(f'User accounts found: {result.scalar()}')"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Database check failed.
    echo The database might be corrupted or not properly initialized.
    echo.
    echo Would you like to reinitialize the database? (This will create default users)
    set /p INIT_DB="Reinitialize database? (Y/N): "
    if /I "%INIT_DB%"=="Y" (
        echo.
        echo Reinitializing database...
        python -c "from app.init_db import init_db; init_db()"
        if %ERRORLEVEL% equ 0 (
            echo Database successfully reinitialized with default users.
            echo.
            echo You should now be able to login with:
            echo Email: admin@healthcare.com
            echo Password: admin123
            echo.
            echo - OR -
            echo.
            echo Email: doctor@healthcare.com
            echo Password: doctor123
        ) else (
            echo Failed to reinitialize database.
        )
    )
)

cd ..

:end
pause
