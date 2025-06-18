from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sqlite3
import time
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Use environment variable or default to local database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./healthcare.db")

# Configure SQLite for better performance and to handle concurrency better
if "sqlite" in DATABASE_URL:
    connect_args = {
        "check_same_thread": False,
        "timeout": 30  # Wait up to 30 seconds for the database lock to be released
    }
    
    engine = create_engine(
        DATABASE_URL, 
        connect_args=connect_args,
        # Use a valid isolation level for SQLite
        isolation_level="SERIALIZABLE"
    )
    
    # Configure SQLite pragmas for better performance
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        if isinstance(dbapi_connection, sqlite3.Connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL;")  # Better concurrency
            cursor.execute("PRAGMA synchronous=NORMAL;")  # Better performance
            cursor.execute("PRAGMA foreign_keys=ON;")  # Enforce foreign key constraints
            cursor.close()
else:
    # For other databases like PostgreSQL
    engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency with retry logic for database connections
def get_db():
    retries = 3
    retry_delay = 0.5  # Start with 0.5 second delay
    
    for attempt in range(retries):
        db = SessionLocal()
        try:
            # Test the connection before returning it
            db.execute(text("SELECT 1"))
            yield db
            break  # Connection successful, exit the retry loop
        except Exception as e:
            db.close()
            if attempt < retries - 1:  # Don't wait after the last attempt
                print(f"Database connection attempt {attempt+1} failed: {str(e)}")
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print(f"All database connection attempts failed")
                traceback.print_exc()
                raise
        finally:
            db.close()
