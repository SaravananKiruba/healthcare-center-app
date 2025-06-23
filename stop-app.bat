@echo off
echo ===================================================
echo Healthcare Center App - Stopping Application
echo ===================================================

:: Kill any running React development servers
echo Stopping frontend servers...
taskkill /f /im node.exe >nul 2>nul

:: Kill any running Python backend servers
echo Stopping backend servers...
taskkill /f /im python.exe >nul 2>nul

echo.
echo All application servers have been stopped.
echo ===================================================
