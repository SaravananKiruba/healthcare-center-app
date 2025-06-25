from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # admin, doctor, clerk
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    guardian_name = Column(String)
    address = Column(String)
    age = Column(Integer)
    sex = Column(String)
    occupation = Column(String)
    mobile_number = Column(String)
    chief_complaints = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    medical_history = Column(JSON)
    physical_generals = Column(JSON)
    menstrual_history = Column(JSON, nullable=True)
    food_and_habit = Column(JSON)
    
    investigations = relationship("Investigation", back_populates="patient")
    treatments = relationship("Treatment", back_populates="patient")
    invoices = relationship("Invoice", back_populates="patient")

class Investigation(Base):
    __tablename__ = "investigations"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    type = Column(String)
    details = Column(String)
    date = Column(DateTime)
    file_url = Column(String, nullable=True)
    
    patient = relationship("Patient", back_populates="investigations")

class Treatment(Base):
    __tablename__ = "treatments"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    date = Column(DateTime)
    doctor = Column(String)
    observations = Column(String)
    medications = Column(String)
    
    patient = relationship("Patient", back_populates="treatments")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    date = Column(DateTime)
    items = Column(JSON)  # List of items with description and amount
    subtotal = Column(Float)
    discount = Column(Float)
    tax = Column(Float)
    total = Column(Float)
    payment_status = Column(String)  # Paid, Unpaid, Partial
    payment_mode = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    amount_paid = Column(Float, default=0)
    balance = Column(Float, default=0)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment_history = Column(JSON, default=list)  # List of payment transactions with date, amount, mode
    
    patient = relationship("Patient", back_populates="invoices")
