"""
Database migration script to handle schema changes
"""
import sqlite3
import os
import sys
from datetime import datetime
import json

def add_notes_column_to_invoices():
    """Add the missing notes column to the invoices table"""
    db_path = "healthcare.db"
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the column already exists to avoid errors
        cursor.execute("PRAGMA table_info(invoices)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "notes" not in columns:
            print("Adding 'notes' column to invoices table...")
            cursor.execute("ALTER TABLE invoices ADD COLUMN notes TEXT")
            conn.commit()
            print("Column 'notes' added to invoices table successfully!")
        else:
            print("Column 'notes' already exists in invoices table.")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding 'notes' column to invoices table: {e}")
        return False

def run_migrations():
    """Run all migrations in order"""
    migrations = [
        add_notes_column_to_invoices
    ]
    
    for migration in migrations:
        success = migration()
        if not success:
            print(f"Migration {migration.__name__} failed. Aborting...")
            sys.exit(1)
    
    print("All migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
