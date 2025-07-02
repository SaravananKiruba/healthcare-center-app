from typing import List, Optional
import traceback
import json
import os
from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, get_db
from uuid import uuid4
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Healthcare Center API", version="1.0.0")

# Get allowed origins from environment variable or default to localhost
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# Add CloudFront/production domain if available
if os.getenv("PRODUCTION_FRONTEND_URL"):
    ALLOWED_ORIGINS.append(os.getenv("PRODUCTION_FRONTEND_URL"))

# Configure CORS with environment-specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Global exception handler for better error reporting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = str(exc)
    status_code = 500
    
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        error_detail = exc.detail
    
    return JSONResponse(
        status_code=status_code,
        content={
            "detail": error_detail,
            "status_code": status_code
        }
    )
