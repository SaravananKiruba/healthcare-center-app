@echo off
echo Starting Healthcare Center Application...

echo.
echo =================================
echo INSTALLING DEPENDENCIES
echo =================================

echo Installing Node.js dependencies...
npm install

echo Installing Python dependencies...
cd backend
pip install -r requirements.txt

echo.
echo =================================
echo INITIALIZING DATABASE
echo =================================
python -c "from app.init_db import init_db; init_db()" 2>nul || echo Database already initialized

cd ..

echo.
echo =================================
echo STARTING SERVERS
echo =================================

echo Starting Backend Server...
start "Healthcare Backend" cmd /k "cd /d \"%CD%\backend\" && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 5

echo Starting Frontend Server...
start "Healthcare Frontend" cmd /k "cd /d \"%CD%\" && npm start"

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
echo Both servers are running in separate windows.
echo Close the server windows to stop the application.
