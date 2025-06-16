@echo off
echo Starting Healthcare Center Backend Server...
echo.
echo Default login credentials:
echo Admin: admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123  
echo Clerk: clerk@healthcare.com / clerk123
echo.
echo Server will start on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
