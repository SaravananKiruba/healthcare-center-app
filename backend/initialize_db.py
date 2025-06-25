"""
Standalone database initialization script
"""
import os
import sys

def run_init():
    try:
        from app.init_db import init_db
        init_db()
        
        # Run migrations after initializing
        from app.migrations import run_migrations
        run_migrations()
        
        print('Database initialized and migrated successfully!')
    except Exception as e:
        print(f'Error initializing database: {e}')
        sys.exit(1)

if __name__ == "__main__":
    run_init()
