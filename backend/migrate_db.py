"""
Standalone migration script runner
"""
import os
import sys

def run_migrations():
    try:
        # Add the parent directory to sys.path to allow importing from app package
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        
        from app.migrations import run_migrations
        run_migrations()
        
        print('Database migrations completed successfully!')
    except Exception as e:
        print(f'Error running database migrations: {e}')
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()
