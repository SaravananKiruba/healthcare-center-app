@echo off
echo ===================================================
echo Healthcare Center App - Login Reset Tool
echo ===================================================
echo.
echo This tool will reset your login status and database
echo.

:: Stop any running instances
echo [1/4] Stopping any running application instances...
call stop-app.bat

:: Clear localStorage
echo [2/4] Clearing browser local storage...
echo var fs = require('fs'); > clear_localstorage.js
echo var path = require('path'); >> clear_localstorage.js
echo var directories = [ >> clear_localstorage.js
echo   path.join(process.env.APPDATA, '../Local/Google/Chrome/User Data/Default/Local Storage/leveldb'), >> clear_localstorage.js
echo   path.join(process.env.APPDATA, '../Local/Microsoft/Edge/User Data/Default/Local Storage/leveldb'), >> clear_localstorage.js
echo   path.join(process.env.APPDATA, 'Mozilla/Firefox/Profiles') >> clear_localstorage.js
echo ]; >> clear_localstorage.js
echo directories.forEach(function(dir) { >> clear_localstorage.js
echo   console.log('Checking directory: ' + dir); >> clear_localstorage.js
echo   if (fs.existsSync(dir)) { >> clear_localstorage.js
echo     console.log('Browser local storage directory found. Please close your browsers before continuing.'); >> clear_localstorage.js
echo   } >> clear_localstorage.js
echo }); >> clear_localstorage.js

node clear_localstorage.js
del clear_localstorage.js

echo.
echo Please close all browser windows and press any key to continue...
pause > nul

:: Reset database
echo [3/4] Resetting database...
if exist "backend\healthcare.db" (
    echo Backing up current database to healthcare.db.bak
    copy backend\healthcare.db backend\healthcare.db.bak > nul
    del backend\healthcare.db
)

echo Reinitializing database with default users...
cd backend
python -c "from app.init_db import init_db; init_db()"
if %ERRORLEVEL% neq 0 (
    echo Failed to reinitialize database.
    cd ..
    goto :ERROR
)
cd ..

:: Start application with clean state
echo [4/4] Starting application with clean state...
echo.
echo ===================================================
echo Reset complete! Your default login credentials are:
echo.
echo Admin:  admin@healthcare.com / admin123
echo Doctor: doctor@healthcare.com / doctor123
echo ===================================================
echo.

echo Starting application...
echo Press any key to continue and start the application...
pause > nul
start start-app.bat
goto :END

:ERROR
echo.
echo ===================================================
echo Error occurred during reset process.
echo Please check the error messages above.
echo ===================================================
pause
exit /b 1

:END
