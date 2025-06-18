from typing import List, Optional
import traceback
import json
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

# Configure CORS - Allow both development and production environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  
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
            "path": request.url.path,
            "method": request.method,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Add a middleware to log request/response for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print(f"Error processing request {request.url.path}: {str(e)}")
        traceback.print_exc()
        raise

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication endpoints
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Add rate limiting for login attempts (simple implementation)
    client_ip = request.client.host
    current_time = datetime.utcnow()
    
    # Log login attempt
    print(f"Login attempt from {client_ip} at {current_time} for user: {form_data.username}")
    
    # Authenticate user
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled. Please contact an administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Generate access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@app.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# User management endpoints (admin only)
@app.post("/users/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin"]))
):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        id=f"u{uuid4().hex[:8]}",
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[schemas.User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin"]))
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

# Patient endpoints
@app.post("/patients/", response_model=schemas.Patient)
def create_patient(
    patient: schemas.PatientCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "doctor", "clerk"]))
):
    try:
        patient_data = patient.dict()
        db_patient = models.Patient(
            id=f"p{uuid4().hex[:8]}",
            **patient_data
        )
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except Exception as e:
        db.rollback()
        print(f"Error creating patient: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create patient: {str(e)}")

@app.get("/patients/", response_model=List[schemas.Patient])
def read_patients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(
    patient_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.put("/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(
    patient_id: str, 
    patient: schemas.PatientCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "doctor", "clerk"]))
):
    try:
        db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
        if db_patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        update_data = patient.dict()
        for field, value in update_data.items():
            setattr(db_patient, field, value)
        
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        print(f"Error updating patient {patient_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update patient: {str(e)}")

@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin"]))
):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

# Investigation endpoints
@app.post("/investigations/", response_model=schemas.Investigation)
def create_investigation(
    investigation: schemas.InvestigationCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "doctor"]))
):
    db_investigation = models.Investigation(
        id=f"inv{uuid4().hex[:8]}",
        **investigation.dict()
    )
    db.add(db_investigation)
    db.commit()
    db.refresh(db_investigation)
    return db_investigation

@app.get("/investigations/", response_model=List[schemas.Investigation])
def read_investigations(
    patient_id: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Investigation)
    if patient_id:
        query = query.filter(models.Investigation.patient_id == patient_id)
    investigations = query.offset(skip).limit(limit).all()
    return investigations

# Treatment endpoints
@app.post("/treatments/", response_model=schemas.Treatment)
def create_treatment(
    treatment: schemas.TreatmentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "doctor"]))
):
    db_treatment = models.Treatment(
        id=f"t{uuid4().hex[:8]}",
        **treatment.dict()
    )
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

@app.get("/treatments/", response_model=List[schemas.Treatment])
def read_treatments(
    patient_id: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Treatment)
    if patient_id:
        query = query.filter(models.Treatment.patient_id == patient_id)
    treatments = query.offset(skip).limit(limit).all()
    return treatments

# Invoice endpoints
@app.post("/invoices/", response_model=schemas.Invoice)
def create_invoice(
    invoice: schemas.InvoiceCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "clerk"]))
):
    db_invoice = models.Invoice(
        id=f"inv{uuid4().hex[:8]}",
        **invoice.dict()
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.get("/invoices/", response_model=List[schemas.Invoice])
def read_invoices(
    patient_id: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Invoice)
    if patient_id:
        query = query.filter(models.Invoice.patient_id == patient_id)
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@app.put("/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(
    invoice_id: str, 
    invoice: schemas.InvoiceCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role(["admin", "clerk"]))
):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    for field, value in invoice.dict().items():
        setattr(db_invoice, field, value)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# Dashboard stats endpoints
@app.get("/stats/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    total_patients = db.query(models.Patient).count()
    total_invoices = db.query(models.Invoice).count()
    total_treatments = db.query(models.Treatment).count()
    
    # Calculate revenue
    invoices = db.query(models.Invoice).all()
    total_revenue = sum(invoice.total for invoice in invoices)
    paid_revenue = sum(invoice.amount_paid for invoice in invoices)
    
    # Today's stats
    today = datetime.now().date()
    today_patients = db.query(models.Patient).filter(
        models.Patient.created_at >= today
    ).count()
    
    today_revenue = sum(
        invoice.amount_paid for invoice in invoices 
        if invoice.date and invoice.date.date() == today
    )
    
    return {
        "total_patients": total_patients,
        "total_invoices": total_invoices,
        "total_treatments": total_treatments,
        "total_revenue": total_revenue,
        "paid_revenue": paid_revenue,
        "outstanding_revenue": total_revenue - paid_revenue,
        "today_patients": today_patients,
        "today_revenue": today_revenue
    }

# Search endpoints
@app.get("/search/patients", response_model=List[schemas.Patient])
def search_patients(
    q: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    patients = db.query(models.Patient).filter(
        models.Patient.name.contains(q) |
        models.Patient.mobile_number.contains(q)
    ).all()
    return patients

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Healthcare Center API is running"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Healthcare Center API is running"}

# Initialize default admin user
@app.on_event("startup")
async def startup_event():
    from .database import SessionLocal
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(models.User).filter(models.User.email == "admin@healthcare.com").first()
        if not admin_user:
            # Create default admin user
            hashed_password = auth.get_password_hash("admin123")
            admin_user = models.User(
                id=f"u{uuid4().hex[:8]}",
                email="admin@healthcare.com",
                hashed_password=hashed_password,
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Default admin user created: admin@healthcare.com / admin123")
    finally:
        db.close()
