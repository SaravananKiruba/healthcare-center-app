from datetime import datetime, timedelta
from typing import Optional
import hashlib
from .database import get_db
from sqlalchemy.orm import Session
from . import models

# JWT configuration
SECRET_KEY = "your-secret-key-keep-it-secret"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return get_password_hash(plain_password) == hashed_password

def get_password_hash(password):
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    # For simplicity, return a simple token (in production, use proper JWT)
    return f"token_{data.get('sub', 'user')}_{expire.timestamp()}"

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user credentials"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
