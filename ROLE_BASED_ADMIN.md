# Role-Based Administration Structure

## Overview
The healthcare center application now implements a proper hierarchical SaaS administration model with clear separation of concerns between different admin levels.

## Role Hierarchy

### 1. SaaS Admin (Super Admin)
- **Role:** `superadmin`
- **Dashboard:** `/saas-admin`
- **Responsibilities:** 
  - Manage Clinic Admins only
  - Manage Clinics
- **Access:** Platform-wide access but only for clinic and clinic admin management
- **No Core Module Access:** Cannot access patients, investigations, reports, etc.

### 2. Clinic Admin
- **Role:** `clinicadmin`
- **Dashboard:** `/clinic-admin`
- **Responsibilities:**
  - Manage Branch Admins only
  - Manage Branches within their clinic
- **Access:** Limited to their own clinic's branches and branch admins
- **No Core Module Access:** Cannot access patients, investigations, reports, etc.

### 3. Branch Admin
- **Role:** `branchadmin`
- **Dashboard:** `/branch-admin`
- **Responsibilities:**
  - Manage Doctors only
- **Access:** Limited to doctors within their branch
- **No Core Module Access:** Cannot access patients, investigations, reports, etc.

### 4. Doctor
- **Role:** `doctor`
- **Dashboard:** `/doctor-dashboard`
- **Responsibilities:**
  - Core user of the software
  - Use all modules (patients, investigations, reports, search, settings)
- **Access:** Full access to all core medical modules within their branch

## Dashboard Routes

| Role | Dashboard Route | Description |
|------|----------------|-------------|
| `superadmin` | `/saas-admin` | SaaS platform administration |
| `clinicadmin` | `/clinic-admin` | Clinic-level administration |
| `branchadmin` | `/branch-admin` | Branch-level administration |
| `doctor` | `/doctor-dashboard` | Medical practice interface |

## Key Features

### SaaS Admin Features
- View and manage all clinics
- Create and manage clinic administrators
- Platform-wide statistics (clinics count, clinic admins count)
- No access to medical data or doctor functionality

### Clinic Admin Features
- View and manage branches within their clinic
- Create and manage branch administrators
- Clinic-specific statistics (branches count, branch admins count)
- No access to medical data or doctor functionality

### Branch Admin Features
- View and manage doctors within their branch
- Doctor management (create, edit, deactivate)
- Branch-specific statistics (doctors count, active doctors count)
- No access to medical data or doctor functionality

### Doctor Features
- Patient management
- Investigation tracking
- Report generation
- Advanced search capabilities
- Settings management
- Full medical practice workflow

## User Management Enhancements

The `UserManagement` component now supports role-based restrictions:

```javascript
// Example usage in different admin dashboards
<UserManagement 
  restrictedRole="clinicadmin" 
  title="Clinic Admin Management"
  description="Manage clinic administrators for your platform"
/>

<UserManagement 
  restrictedRole="branchadmin" 
  title="Branch Admin Management"
  description="Manage branch administrators for your clinic"
/>

<UserManagement 
  restrictedRole="doctor" 
  title="Doctor Management"
  description="Manage doctors in your branch"
/>
```

## Navigation Updates

The main layout navigation now properly routes users based on their roles:
- Admins see only their relevant dashboard
- Only doctors see the full navigation with core modules
- Clean separation between administrative and medical interfaces

## Database Schema Support

The existing multi-tenant schema already supports this hierarchy:
- `Clinic` -> `Branch` -> `User` relationships
- Proper tenant scoping for data isolation
- Role-based access control at the database level

## Authentication Flow

1. User logs in
2. System determines role from JWT token
3. Redirects to appropriate dashboard based on role
4. Navigation and features are filtered by role permissions
5. API calls are scoped to user's tenant and role level

This structure ensures that each level of administration has clear, focused responsibilities without access to functionalities they shouldn't manage, while giving doctors full access to the medical practice tools they need.
