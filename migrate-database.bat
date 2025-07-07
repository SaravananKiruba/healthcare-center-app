@echo off
echo Healthcare Center App - Database Migration
echo =========================================
echo.
echo This will run a database migration to update the schema with new fields for investigations.
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

echo Running Prisma migration...
npx prisma migrate dev --name add-investigation-fields
echo.

echo Migration completed!
echo Press any key to exit...
pause > nul
