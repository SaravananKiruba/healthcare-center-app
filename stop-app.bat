@echo off
echo Stopping Healthcare Center Application...

echo Stopping Node.js processes (Frontend)...
taskkill /f /im node.exe 2>nul

echo Stopping Python processes (Backend)...
taskkill /f /im python.exe 2>nul

echo Stopping Uvicorn processes...
wmic process where "commandline like '%%uvicorn%%'" delete 2>nul

echo.
echo Application stopped successfully!
echo All server processes have been terminated.
