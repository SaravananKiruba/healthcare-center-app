# Healthcare Center Application

A comprehensive healthcare management system built with Next.js, Prisma, and Chakra UI.

## Folder Structure

```
healthcare-center-app/
├── pages/                # Next.js pages (routes)
│   ├── api/              # API routes 
│   │   ├── auth/         # Authentication endpoints
│   │   ├── patients/     # Patient management endpoints
│   │   └── investigations/ # Medical investigations endpoints
│   ├── patient/          # Patient-specific pages
│   └── [...other pages]  # Various application pages
├── prisma/               # Database schema and migrations
├── public/               # Static files
└── src/                  # Application source code
    ├── components/       # UI Components
    │   ├── admin/        # Admin-specific components
    │   ├── Auth/         # Authentication components
    │   ├── common/       # Shared/common components
    │   ├── dashboard/    # Dashboard components
    │   ├── investigations/ # Investigation-related components
    │   ├── layout/       # Layout components
    │   ├── patients/     # Patient management components
    │   └── reports/      # Reporting components
    ├── config/           # Application configuration
    ├── context/          # React context providers
    ├── hooks/            # Custom React hooks
    ├── lib/              # Utilities and libraries
    │   ├── api/          # API utilities
    │   └── auth/         # Authentication utilities
    ├── pages/            # Page-specific components
    └── theme/            # UI theme configuration
```

## Module Organization

The application is organized into several key modules:

1. **Authentication**: Handles user login, session management, and access control
2. **Patient Management**: Patient registration, viewing, and editing
3. **Investigations**: Medical investigations tracking and management
4. **Reporting**: Generation of medical reports and analytics
5. **Admin Functions**: User management and system configuration

## Import Conventions

For better code organization, follow these import conventions:

1. React imports first
2. External library imports second
3. Internal module imports third, organized by:
   - Components
   - Hooks
   - Utils/Config

Example:

```javascript
// React imports
import React, { useState, useEffect } from 'react';

// External library imports
import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';

// Internal imports
import { PatientList } from 'components/patients';
import { usePatients } from 'hooks';
import { formatDate } from 'utils';
```
