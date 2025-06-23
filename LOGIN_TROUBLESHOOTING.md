# Healthcare Center App - Login Troubleshooting Guide

## Common Login Issues and Solutions

If you're having trouble logging into the Healthcare Center App, follow these steps to diagnose and fix the problem.

## Quick Fix

Run the `login-fix.bat` script to automatically:
1. Check if the backend server is running
2. Verify the database connection
3. Check if user accounts exist
4. Reinitialize the database with default users if needed

## Default Login Credentials

After running the fix script, you can use these default credentials:

**Admin User:**
- Email: `admin@healthcare.com`
- Password: `admin123`

**Doctor User:**
- Email: `doctor@healthcare.com`
- Password: `doctor123`

## Manual Troubleshooting Steps

### 1. Check if the Backend Server is Running

1. Open a terminal/command prompt
2. Run: `curl http://localhost:8000/health`
3. If this fails, the backend server isn't running

**Solution:** Run `start-app.bat` to start both frontend and backend servers

### 2. Check Database Connectivity

If the frontend loads but login fails, the issue might be with the database:

1. Navigate to the backend folder: `cd backend`
2. Run the database initialization script:
   ```
   python -c "from app.init_db import init_db; init_db()"
   ```

This will create the default users without affecting existing data.

### 3. Client-Side Issues

If you're still having trouble:

1. Clear your browser cache
2. Delete the browser's local storage:
   - Open browser DevTools (F12)
   - Go to Application > Local Storage > http://localhost:3000
   - Click "Clear" button
3. Refresh the page and try logging in again

### 4. Network Connectivity Issues

1. Check if CORS is blocking requests: Open browser DevTools > Console
2. Look for CORS-related errors
3. Verify your network can reach both frontend (port 3000) and backend (port 8000)

## Advanced Troubleshooting

If the above steps don't work:

### Reset the Database

1. Stop all running instances of the application
2. Delete the database file: `delete backend\healthcare.db`
3. Run `start-app.bat` to restart the application
4. The database will be recreated with default users

### Check for Backend Errors

If login attempts fail, check the backend console for error messages that may indicate the specific issue.

### Manual User Creation

You can create a new admin user directly in the database:

```python
python -c "from sqlalchemy.orm import sessionmaker; from app.database import engine; from app.models import User; from app.auth import get_password_hash; from uuid import uuid4; Session = sessionmaker(bind=engine); session = Session(); new_user = User(id=f'u{uuid4().hex[:8]}', email='newadmin@healthcare.com', hashed_password=get_password_hash('newpassword'), full_name='New Admin', role='admin'); session.add(new_user); session.commit(); print('New admin user created!')"
```

Replace 'newadmin@healthcare.com' and 'newpassword' with your desired credentials.
