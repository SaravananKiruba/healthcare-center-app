# Healthcare Center App - Quick Setup Guide

This document provides instructions for setting up and running the Healthcare Center Application.

## System Requirements

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **Rust** (for compiling certain Python packages)
- **Windows OS** (for running the batch files)

## Available Scripts

The following batch files are provided to simplify setup and execution:

### `check-environment.bat`

Verifies that your system has all necessary tools installed and that the project structure is intact. Run this first to ensure your environment is properly configured.

```bash
.\check-environment.bat
```

### `setup-rust-python.bat`

**IMPORTANT: Use this if you encounter Rust/pydantic installation issues**

This script helps you set up Rust and resolve common Python package installation issues. It should be run as administrator if you encounter errors during dependency installation.

```bash
# Right-click and select "Run as administrator"
.\setup-rust-python.bat
```

### `install-dependencies.bat`

Installs all required dependencies for both the frontend and backend components. Also initializes the database.

```bash
.\install-dependencies.bat
```

### `start-app.bat`

Starts both the frontend and backend servers concurrently. The application will be accessible at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

```bash
.\start-app.bat
```

### `stop-app.bat`

Stops all running instances of the application (both frontend and backend).

```bash
.\stop-app.bat
```

## Manual Setup (if batch files don't work)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize the database
python -c "from app.init_db import init_db; init_db()"

# Start the backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Common Issues and Solutions

- **Port conflicts**: Ensure that ports 3000 and 8000 are not in use by other applications.
  
- **Database errors**: If you encounter database issues, delete the file `backend/healthcare.db` and reinitialize with the command: `python -c "from app.init_db import init_db; init_db()"` 

- **Module not found errors**: Make sure all dependencies are installed. Try running `install-dependencies.bat` again.

- **Backend not connecting**: Check that the backend is running on port 8000 and that the frontend is configured to connect to the correct URL.

### Rust/Python Package Installation Issues

If you encounter errors related to `pydantic-core`, `pydantic`, or other packages requiring Rust compilation:

1. Run `setup-rust-python.bat` as administrator
2. Restart your command prompt
3. Run `install-dependencies.bat` again

### Advanced Troubleshooting

If you still encounter issues with the Python backend dependencies:

1. Open a Command Prompt as administrator
2. Run the following commands:
   ```bash
   pip install --upgrade pip wheel setuptools
   pip install --no-cache-dir pydantic==2.4.2 --no-binary :all:
   pip install --no-cache-dir -r backend/requirements.txt
   ```

3. If errors persist, you can try installing without version pinning:
   ```bash
   pip install fastapi uvicorn[standard] sqlalchemy python-multipart pydantic email-validator pyjwt python-jose[cryptography] passlib[bcrypt] python-dotenv
   ```
