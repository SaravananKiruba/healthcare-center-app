from datetime import datetime, timedelta
from typing import Optional
import hashlib
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
import secrets
from passlib.context import CryptContext
from .database import get_db
from . import models, schemas
from pydantic import ValidationError
import logging

# JWT configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", secrets.token_hex(32))  # Generate secure random key if not provided
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configure password hashing with bcrypt
try:
    # Password hashing context - using bcrypt for secure password storage
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # Test if bcrypt is working properly
    test_hash = pwd_context.hash("test")
    if not pwd_context.verify("test", test_hash):
        raise Exception("Bcrypt verification test failed")
    logging.info("Bcrypt initialized successfully")
except Exception as e:
    logging.warning(f"Error initializing bcrypt, falling back to sha256: {str(e)}")
    # Fallback to SHA256 if bcrypt fails (less secure but functional)
    pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
    logging.info("Using SHA256 as fallback password hashing method")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    # First check if it's an old SHA256 hash
    old_hash = get_password_hash_sha256(plain_password)
    if old_hash == hashed_password:
        return True
    # Otherwise use the secure bcrypt verification
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash_sha256(password):
    """Hash a password using SHA256 - LEGACY, DO NOT USE FOR NEW PASSWORDS"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_password_hash(password):
    """Hash a password using secure bcrypt hashing"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token with user data and expiration"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Make sure role is included in the token payload if available
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception):
    """Verify JWT token and extract payload data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        # Create token data with additional fields from payload
        token_data = schemas.TokenData(email=email)
        # Add role info if available
        token_data.role = payload.get("role")
        token_data.user_id = payload.get("user_id")
        return token_data
    except jwt.ExpiredSignatureError:
        # Specific error for expired tokens
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        # Invalid token structure
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        # Log the error but don't expose details to client
        print(f"Token verification error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error during token verification: {str(e)}")
        raise credentials_exception

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user credentials"""
    try:
        # Normalize email to lowercase
        email = email.lower().strip()
        
        # Find user by email
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            print(f"Login attempt with non-existent email: {email}")
            return False
            
        # Verify password
        if not verify_password(password, user.hashed_password):
            print(f"Failed login attempt for user: {email}")
            return False
            
        # Check if password was stored with old method and update if needed
        if user.hashed_password == get_password_hash_sha256(password):
            # Update to new secure hash
            try:
                user.hashed_password = get_password_hash(password)
                db.commit()
                print(f"Updated password hash for user: {email}")
            except Exception as e:
                print(f"Error updating password hash: {str(e)}")
                # Rollback changes if update fails
                db.rollback()
            
        return user
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        return False

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: list):
    """Decorator to require specific roles"""
    def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
