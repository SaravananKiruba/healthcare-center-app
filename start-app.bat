@echo off
echo Building and starting Healthcare Center Application...

echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

echo Waiting for services to start...
timeout /t 10

echo Checking service status...
docker-compose ps

echo.
echo Application is starting...
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo To stop the application, run: docker-compose down
echo To view logs, run: docker-compose logs -f
