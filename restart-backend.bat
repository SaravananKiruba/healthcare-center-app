@echo off
echo Restarting the backend server with the new fixes...

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

echo Starting backend server...
python run.py

pause
