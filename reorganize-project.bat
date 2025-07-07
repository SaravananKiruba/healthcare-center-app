@echo off
echo ===================================
echo Healthcare Center App Reorganization
echo ===================================
echo.

echo Running import path updates...
call npm run update-imports
echo.

echo Installing dependencies...
call npm install
echo.

echo Running lint fixes...
call npm run lint -- --fix
echo.

echo Build check...
call npm run build
echo.

echo Project reorganization completed!
echo Please check the build output for any remaining issues.
echo If everything looks good, you can start the app with "npm run dev"
echo.
echo See STRUCTURE.md for documentation on the new folder structure.
echo ===================================
