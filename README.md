# Healthcare Center Management System

A comprehensive Next.js web application for healthcare centers to manage patients, investigations, reports, and user accounts.

## Features

- **Authentication and Authorization**
  - Role-based access control (Admin and Doctor roles)
  - Secure login and session management
  - Protected routes

- **Patient Management**
  - Patient registration and profiling
  - Medical history tracking
  - Patient visit records

- **Investigation Management**
  - Create and manage investigations for patients
  - Upload and store investigation files
  - Track investigation history

- **User Management (Admin)**
  - Create, update, and manage users
  - Role assignment
  - Account activation/deactivation

- **Reports and Analytics**
  - Generate reports on patients and visits
  - Export reports to PDF

## Tech Stack

- **Frontend & Backend**
  - Next.js (React framework)
  - Next.js API Routes
  - NextAuth.js (authentication)
  - Chakra UI (styling)

- **Database**
  - SQLite (via Prisma ORM)

- **Additional Libraries**
  - Formik & Yup (form validation)
  - React Icons
  - jsPDF & html2canvas (PDF generation)

## Getting Started

### System Requirements

- **Node.js**: v16+ 
- **npm** or **yarn**

### Quick Start

1. Install dependencies:
```bash
npm install
# or
yarn
```

2. Set up the database:
```bash
npm run db:push
npm run db:seed
# or
yarn db:push
yarn db:seed
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Access the application at: http://localhost:3000

### Default Login Credentials

- **Admin**: admin@example.com / password123
- **Doctor**: doctor@example.com / password123

## Application Structure

```
healthcare-center-app/
├── pages/                  # Next.js pages
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── patients/       # Patient endpoints
│   │   └── investigations/ # Investigation endpoints
│   ├── _app.js            # Main app component
│   ├── index.js           # Home/landing page
│   └── ...                # Other pages
├── prisma/                # Prisma ORM
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seed script
├── public/               # Static assets
│   └── ...
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Shared/common components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   ├── patients/      # Patient-related components
│   │   └── ...           # Other component categories
│   ├── config/           # Application configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── api/          # API client and services
│   │   └── auth/         # Authentication utilities
│   ├── styles/           # Global styles
│   └── ...
```
