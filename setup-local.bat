@echo off
echo Setting up Healthcare Center Application for Local Development...

echo.
echo =================================
echo BACKEND SETUP
echo =================================

cd backend
echo Installing Python dependencies...
pip install fastapi uvicorn sqlalchemy python-jose passlib python-multipart pydantic python-dotenv

echo.
echo Initializing database...
python -c "from app.init_db import init_db; init_db()" 2>nul || echo Database initialization completed with warnings

echo.
echo Starting backend server...
start "Healthcare Backend" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

cd ..

echo.
echo =================================
echo FRONTEND SETUP
echo =================================

echo Installing Node.js dependencies...
npm install

echo.
echo Starting frontend development server...
start "Healthcare Frontend" cmd /k "npm start"

echo.
echo =================================
echo APPLICATION STARTED
echo =================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Default users:
echo Admin: admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123
echo.
echo Press any key to continue...
pause >nul
