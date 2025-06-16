@echo off
echo Running verification tests for the healthcare center app...

cd /d %~dp0\backend
echo Activating virtual environment if it exists...

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated.
) else if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo Virtual environment activated.
) else (
    echo No virtual environment found. Will run using system Python.
)

echo Running verification script...
python verify-fixes.py

pause
