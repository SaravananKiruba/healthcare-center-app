/**
 * Application Configuration
 * 
 * Central configuration file for the Healthcare Center App
 */

export const APP_CONFIG = {
  name: 'MediBoo',
  description: 'SaaS Platform for Medical Practice Management',
  version: '1.0.0',
}

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
}

// Authentication Configuration
export const AUTH_CONFIG = {
  // User roles
  roles: {
    SUPERADMIN: 'superadmin',
    CLINICADMIN: 'clinicadmin',
    BRANCHADMIN: 'branchadmin',
    DOCTOR: 'doctor',
  },
  
  // Routes based on user roles
  routes: {
    superadmin: '/admin-dashboard',
    clinicadmin: '/admin-dashboard',
    branchadmin: '/admin-dashboard',
    doctor: '/doctor-dashboard',
    default: '/login',
  }
}

// Feature flags
export const FEATURES = {
  enableReports: true,
  enableAdvancedSearch: true,
}
