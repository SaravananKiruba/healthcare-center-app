@echo off
echo Stopping Healthcare Center Application...

docker-compose down

echo Application stopped successfully!
echo To remove all data, run: docker-compose down -v
