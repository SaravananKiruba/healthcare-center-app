# Healthcare Center Application

This is a full-stack healthcare management application built with FastAPI (backend) and React (frontend).

## Getting Started

### System Requirements

- **Node.js**: v16+ (for frontend)
- **Python**: v3.8+ (for backend)
- **Ports**: 3000 (frontend) and 8000 (backend) must be available

### Quick Start

This application uses only two batch files for setup and operation:

1. **Setup**: Run `healthcare-setup.bat` to check your environment, install all dependencies, and initialize the database.
2. **Start**: Run `healthcare-start.bat` to start both the frontend and backend servers.

### Default Login Credentials

- **Admin**: admin@healthcare.com / admin123
- **Doctor**: doctor@healthcare.com / doctor123

## Application Structure

### Frontend (React)

- Located in the project root and `/src` directory
- Built with React, Chakra UI, and React Router
- Connects to the backend API on port 8000

### Backend (FastAPI)

- Located in the `/backend` directory
- Built with FastAPI, SQLAlchemy, and SQLite
- API documentation available at `http://localhost:8000/docs`

## Troubleshooting

If you encounter any issues:

1. **Port Conflicts**: Ensure ports 3000 and 8000 are not in use by other applications.
2. **Dependencies**: If installation fails, try running `healthcare-setup.bat` again with administrator privileges.
3. **Database Issues**: If the app fails to start due to database errors, delete the `backend/healthcare.db` file and run `healthcare-setup.bat` again to recreate it.
4. **Login Issues**: If you can't log in, the default credentials may have been changed. Check the database or use the backend API to reset passwords.

## Development

To make changes to the application:

1. Frontend code is located in the `/src` directory
2. Backend code is located in the `/backend/app` directory
3. Database schema is defined in `/backend/app/models.py`
4. API endpoints are defined in `/backend/app/main.py`
