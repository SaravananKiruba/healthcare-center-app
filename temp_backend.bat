@echo off 
cd backend 
title Healthcare Center - Backend Server 
python -c "from app.init_db import init_db; init_db()" 
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 
pause 
