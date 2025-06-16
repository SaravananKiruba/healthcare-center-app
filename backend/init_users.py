import asyncio
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash
from uuid import uuid4

async def init_admin_user():
    """Initialize default admin user"""
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.email == "admin@healthcare.com").first()
        if not admin_user:
            # Create default admin user
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                id=f"u{uuid4().hex[:8]}",
                email="admin@healthcare.com",
                hashed_password=hashed_password,
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin user created: admin@healthcare.com / admin123")
        else:
            print("✅ Admin user already exists")
            
        # Create sample users for different roles
        users_to_create = [
            {
                "email": "doctor@healthcare.com",
                "password": "doctor123",
                "full_name": "Dr. John Smith",
                "role": "doctor"
            },
            {
                "email": "clerk@healthcare.com", 
                "password": "clerk123",
                "full_name": "Jane Clerk",
                "role": "clerk"
            }
        ]
        
        for user_data in users_to_create:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                hashed_password = get_password_hash(user_data["password"])
                new_user = User(
                    id=f"u{uuid4().hex[:8]}",
                    email=user_data["email"],
                    hashed_password=hashed_password,
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                print(f"✅ Sample user created: {user_data['email']} / {user_data['password']}")
            else:
                print(f"✅ User {user_data['email']} already exists")
                
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(init_admin_user())
