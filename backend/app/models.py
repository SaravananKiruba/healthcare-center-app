from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # admin, doctor
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

class Investigation(Base):
    __tablename__ = "investigations"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    type = Column(String)
    details = Column(String)
    date = Column(DateTime)
    file_url = Column(String, nullable=True)
    
    patient = relationship("Patient", back_populates="investigations")
