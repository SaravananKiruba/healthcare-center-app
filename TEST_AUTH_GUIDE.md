# Demo Login Authentication Test Guide

This guide will help you test the JWT authentication in the Healthcare Center app using the demo admin credentials.

## Prerequisites

- Python 3.6+
- Required packages: `fastapi`, `uvicorn`, `sqlalchemy`, `pyjwt`, `passlib`, `python-multipart`, etc.

## Step 1: Initialize the Database

First, initialize the database with the demo admin user:

```bash
cd backend
python initialize_db.py
```

This will create a demo admin user with the credentials:
- Email: admin@example.com
- Password: admin123

## Step 2: Start the FastAPI Server

```bash
cd backend
python run.py
```

This will start the FastAPI server at http://localhost:8000.

## Step 3: Run the Authentication Test

In a new terminal window, run:

```bash
cd backend
python test_auth.py
```

The script will automatically use the default demo credentials (admin@example.com / admin123).

If you want to test with different credentials, you can specify them:

```bash
python test_auth.py --email user@example.com --password userpassword
```

## Expected Output

A successful authentication test should show:

```
=== Healthcare Center API Authentication Test ===

1. Authenticating user...
Authentication successful!
User: Demo Admin (admin@example.com)
Role: admin
Token: eyJhbGciOiJIUzI1NiIs...[truncated]

2. Testing /me endpoint...
Successfully retrieved user profile!

3. Testing role-based access control...
Admin route: Accessible
Doctor route: Forbidden
Staff route: Accessible
```

## Testing Different Roles

You can test different role-based permissions by using:
- Admin user: admin@example.com / admin123
- Doctor user: doctor@healthcare.com / doctor123

## Troubleshooting

1. If you encounter the error "FastAPI server is not running", make sure the server is started in another terminal.

2. If authentication fails, check:
   - The database is initialized properly
   - You're using the correct credentials
   - The database file healthcare.db exists in the backend directory

3. If there are bcrypt errors, check if the passlib[bcrypt] package is installed correctly:
   ```
   pip install passlib[bcrypt]
   ```

4. If the JWT token doesn't work for protected routes, check that:
   - The token is valid and not expired
   - The user has the appropriate role for the route
