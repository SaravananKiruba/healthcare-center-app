# Healthcare Center Management System

A comprehensive Next.js web application for healthcare centers to manage patients, investigations, reports, and user accounts.

## Features

- **Multi-tenant SaaS Architecture**
  - Hierarchical organization with clinics and branches
  - Complete tenant isolation and data segregation
  - Support for multi-level administrative roles

- **Authentication and Authorization**
  - Hierarchical role-based access control (SUPERADMIN, CLINICADMIN, BRANCHADMIN, DOCTOR roles)
  - Tenant-aware authorization and scoping
  - Secure login and session management
  - Protected routes with role and tenant validation

- **Patient Management**
  - Patient registration and profiling with branch association
  - Medical history tracking
  - Patient visit records

- **Investigation Management**
  - Create and manage comprehensive investigations for patients
  - Upload and store investigation files and reports
  - Track investigation history with detailed medical parameters
  - Schedule follow-up dates for ongoing patient care
  - Sort and filter investigations by type and date

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

## Multi-tenant SaaS Upgrade

The application has been upgraded to support multi-tenant architecture for SaaS deployment.

### Running the Upgrade

1. Ensure you have backed up your database
2. Run the upgrade script:
```bash
# Windows
.\upgrade-to-saas.bat

# Linux/Mac (using bash)
bash ./upgrade-to-saas.sh
```

3. After upgrading, restart the application:
```bash
npm run start
```

### Multi-tenant Login Credentials

After upgrading, use these default credentials:

- **Super Admin**: superadmin@healthcare.com / superadmin123
- **Clinic Admin**: clinicadmin@healthcare.com / clinic123
- **Branch Admin**: branchadmin@healthcare.com / branch123
- **Doctor**: doctor@healthcare.com / doctor123

### Troubleshooting

If the upgrade fails, use the recovery script:
```bash
# Windows
.\migration-recovery.bat

# Linux/Mac
bash ./migration-recovery.sh
```

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
