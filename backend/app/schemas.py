from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None

class TokenData(BaseModel):
    email: Optional[str] = None

class PatientBase(BaseModel):
    name: str
    guardian_name: Optional[str] = None
    address: str
    age: int
    sex: str
    occupation: Optional[str] = None
    mobile_number: str
    chief_complaints: str
    medical_history: dict
    physical_generals: dict
    menstrual_history: Optional[dict] = None
    food_and_habit: dict

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: str
    created_at: datetime
    investigations: List['Investigation'] = []
    treatments: List['Treatment'] = []
    invoices: List['Invoice'] = []

    class Config:
        from_attributes = True

class InvestigationBase(BaseModel):
    type: str
    details: str
    date: datetime
    file_url: Optional[str] = None

class InvestigationCreate(InvestigationBase):
    patient_id: str

class Investigation(InvestigationBase):
    id: str
    patient_id: str

    class Config:
        from_attributes = True

class TreatmentBase(BaseModel):
    date: datetime
    doctor: str
    observations: str
    medications: str

class TreatmentCreate(TreatmentBase):
    patient_id: str

class Treatment(TreatmentBase):
    id: str
    patient_id: str

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    date: datetime
    items: List[dict]
    subtotal: float
    discount: float
    tax: float
    total: float
    payment_status: str
    payment_mode: Optional[str] = None
    transaction_id: Optional[str] = None
    amount_paid: float = 0
    balance: float = 0

class InvoiceCreate(InvoiceBase):
    patient_id: str

class Invoice(InvoiceBase):
    id: str
    patient_id: str

    class Config:
        from_attributes = True
