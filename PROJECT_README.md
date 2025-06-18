# Healthcare Center Management System

A complete healthcare center management system with React frontend and FastAPI backend, using SQLite database.

## Features

- **Patient Management**: Register, view, update, and manage patient records
- **Medical History**: Track patient medical history, treatments, and investigations
- **Billing System**: Generate invoices, track payments, and manage billing
- **Reports & Analytics**: Generate various reports and analytics
- **User Management**: Role-based access control (Admin, Doctor, Clerk)
- **Search & Filter**: Advanced search and filtering capabilities

## Tech Stack

### Frontend
- React 18
- Chakra UI for styling
- React Router for navigation
- Axios for API calls
- Formik for form handling

### Backend
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- JWT authentication with improved security
- Pydantic for data validation
- Bcrypt for secure password hashing

### Deployment
- Docker & Docker Compose
- Nginx for serving frontend
- Uvicorn ASGI server for backend

## Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd healthcare-center-app
```

2. **Run with Docker Compose**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development Setup

### Application Scripts

- `start-app-new.bat`: Starts both frontend and backend servers
- `stop-app.bat`: Stops all running application instances
- `install-deps.bat`: Installs both frontend and backend dependencies
- `setup-local.bat`: Sets up the local development environment

### Backend Development

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create a .env file**
```
# Security settings
JWT_SECRET_KEY=your-secure-random-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database settings
DATABASE_URL=sqlite:///./healthcare.db
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Start the backend server**
```bash
# On Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# On Linux/Mac
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

1. **Install Node.js dependencies**
```bash
npm install
```

2. **Start the development server**
```bash
npm start
```

## Default Users

The system comes with pre-configured users for testing:

- **Admin User**
  - Email: admin@healthcare.com
  - Password: admin123

- **Doctor User**
  - Email: doctor@healthcare.com
  - Password: doctor123

## API Endpoints

### Authentication
- `POST /token` - Login and get access token
- `POST /users/` - Create new user

### Patients
- `GET /patients/` - Get all patients
- `POST /patients/` - Create new patient
- `GET /patients/{id}` - Get patient by ID
- `PUT /patients/{id}` - Update patient
- `DELETE /patients/{id}` - Delete patient

### Investigations
- `POST /investigations/` - Create investigation
- `GET /investigations/` - Get investigations

### Treatments
- `POST /treatments/` - Create treatment
- `GET /treatments/` - Get treatments

### Invoices
- `POST /invoices/` - Create invoice
- `GET /invoices/` - Get invoices

### Statistics
- `GET /stats/dashboard` - Get dashboard statistics

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User authentication and roles
- `patients` - Patient information and medical data
- `investigations` - Medical investigations and reports
- `treatments` - Treatment records
- `invoices` - Billing and payment information

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend settings
REACT_APP_API_URL=http://localhost:8000
REACT_APP_TITLE=Healthcare Center

# Backend settings (optional)
SECRET_KEY=your-secret-key-keep-it-secret
DATABASE_URL=sqlite:///./healthcare.db
```

## Deployment

### Production Deployment with Docker

1. **Build and run with Docker Compose**
```bash
docker-compose up -d --build
```

2. **Scale services if needed**
```bash
docker-compose up --scale backend=2
```

### Manual Deployment

1. **Build frontend**
```bash
npm run build
```

2. **Serve with Nginx or any web server**

3. **Deploy backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.
