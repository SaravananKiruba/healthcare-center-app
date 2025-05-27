#!/bin/bash
echo "Starting Healthcare Center Backend..."

# Initialize database
echo "Initializing database..."
python -c "from app.init_db import init_db; init_db()"

# Start the server
echo "Starting server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
