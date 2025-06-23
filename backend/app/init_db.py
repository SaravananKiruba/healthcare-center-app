"""
Database initialization script with sample data
"""
from sqlalchemy.orm import Session
from . import models
from .database import engine, SessionLocal
from .auth import get_password_hash
from uuid import uuid4
from datetime import datetime
import os

def init_db():
    """Create tables and add sample data"""
    try:
        # Create database directory if it doesn't exist
        db_dir = os.path.dirname(os.path.abspath("healthcare.db"))
        os.makedirs(db_dir, exist_ok=True)
        
        models.Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        
        db = SessionLocal()
        try:
            # Check if admin user exists
            admin_user = db.query(models.User).filter(models.User.email == "admin@healthcare.com").first()
            if not admin_user:
                # Create admin user
                admin_user = models.User(
                    id=f"u{uuid4().hex[:8]}",
                    email="admin@healthcare.com",
                    hashed_password=get_password_hash("admin123"),
                    full_name="Admin User",
                    role="admin"
                )
                db.add(admin_user)
                print("Admin user created!")
            
            # Create demo admin user with specified credentials
            demo_admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
            if not demo_admin:
                demo_admin = models.User(
                    id=f"u{uuid4().hex[:8]}",
                    email="admin@example.com",
                    hashed_password=get_password_hash("admin123"),
                    full_name="Demo Admin",
                    role="admin",
                    is_active=True
                )
                db.add(demo_admin)
                print("Demo admin user created!")
            
            # Create sample doctor
            doctor_user = db.query(models.User).filter(models.User.email == "doctor@healthcare.com").first()
            if not doctor_user:
                doctor_user = models.User(
                    id=f"u{uuid4().hex[:8]}",
                    email="doctor@healthcare.com",
                    hashed_password=get_password_hash("doctor123"),
                    full_name="Dr. Smith",
                    role="doctor"
                )
                db.add(doctor_user)
                print("Doctor user created!")
            
            # Create sample patients
            existing_patients = db.query(models.Patient).count()
            if existing_patients == 0:
                sample_patient = models.Patient(
                    id=f"p{uuid4().hex[:8]}",
                    name="John Doe",
                    guardian_name="Mary Doe",
                    address="123 Main St, Anytown",
                    age=45,
                    sex="Male",
                    occupation="Teacher",
                    mobile_number="555-123-4567",
                    chief_complaints="Frequent headaches and fatigue",
                    medical_history={
                        "pastHistory": {
                            "allergy": True,
                            "anemia": False,
                            "arthritis": False,
                            "asthma": True,
                            "cancer": False,
                            "diabetes": False,
                            "heartDisease": False,
                            "hypertension": True,
                            "thyroid": False,
                            "tuberculosis": False,
                        },
                        "familyHistory": {
                            "diabetes": True,
                            "hypertension": True,
                            "thyroid": False,
                            "tuberculosis": False,
                            "cancer": False,
                        },
                    },
                    physical_generals={
                        "appetite": "Good",
                        "bowel": "Regular",
                        "urine": "Normal",
                        "sweating": "Moderate",
                        "sleep": "Disturbed",
                        "thirst": "Increased",
                        "addictions": "None",
                    },
                    food_and_habit={
                        "foodHabit": "Non-vegetarian",
                        "addictions": "Occasional alcohol",
                    },
                )
                db.add(sample_patient)
                print("Sample patient created!")
            
            db.commit()
            print("Database initialized successfully!")
            
        except Exception as e:
            db.rollback()
            print(f"Error initializing database data: {e}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    init_db()
