from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, get_db
from uuid import uuid4
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Healthcare Center API")

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:80",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication endpoint
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
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

# Patient endpoints
@app.post("/patients/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(
        id=f"p{uuid4().hex[:8]}",
        **patient.dict()
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@app.get("/patients/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

# Investigation endpoints
@app.post("/investigations/", response_model=schemas.Investigation)
def create_investigation(investigation: schemas.InvestigationCreate, db: Session = Depends(get_db)):
    db_investigation = models.Investigation(
        id=f"inv{uuid4().hex[:8]}",
        **investigation.dict()
    )
    db.add(db_investigation)
    db.commit()
    db.refresh(db_investigation)
    return db_investigation

# Treatment endpoints
@app.post("/treatments/", response_model=schemas.Treatment)
def create_treatment(treatment: schemas.TreatmentCreate, db: Session = Depends(get_db)):
    db_treatment = models.Treatment(
        id=f"t{uuid4().hex[:8]}",
        **treatment.dict()
    )
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

# Invoice endpoints
@app.post("/invoices/", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = models.Invoice(
        id=f"inv{uuid4().hex[:8]}",
        **invoice.dict()
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.get("/invoices/", response_model=List[schemas.Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    invoices = db.query(models.Invoice).offset(skip).limit(limit).all()
    return invoices

# Dashboard stats endpoints
@app.get("/stats/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_patients = db.query(models.Patient).count()
    total_invoices = db.query(models.Invoice).count()
    total_treatments = db.query(models.Treatment).count()
    
    # Calculate revenue
    invoices = db.query(models.Invoice).all()
    total_revenue = sum(invoice.total for invoice in invoices)
    paid_revenue = sum(invoice.amount_paid for invoice in invoices)
    
    return {
        "total_patients": total_patients,
        "total_invoices": total_invoices,
        "total_treatments": total_treatments,
        "total_revenue": total_revenue,
        "paid_revenue": paid_revenue,
        "outstanding_revenue": total_revenue - paid_revenue
    }

# Search endpoints
@app.get("/search/patients", response_model=List[schemas.Patient])
def search_patients(q: str, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).filter(
        models.Patient.name.contains(q) |
        models.Patient.mobile_number.contains(q)
    ).all()
    return patients

# Update patient endpoint
@app.put("/patients/{patient_id}", response_model=schemas.Patient)
def update_patient(patient_id: str, patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for field, value in patient.dict().items():
        setattr(db_patient, field, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient

# Delete patient endpoint
@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Healthcare Center API is running"}
