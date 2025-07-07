# Healthcare Center App - Next.js Version

## 🚀 Quick Start

### 1. Setup (First Time Only)
```bash
healthcare-nextjs-setup.bat
```

### 2. Start Application
```bash
healthcare-nextjs-start.bat
```

### 3. Access Application
- URL: http://localhost:3000
- Admin: admin@healthcare.com / admin123
- Doctor: doctor@healthcare.com / doctor123

## 📁 Project Structure

```
healthcare-center-app/
├── pages/                    # Next.js pages and API routes
│   ├── api/                 # Backend API (serverless functions)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── patients/       # Patient management
│   │   ├── investigations/ # Medical investigations
│   │   └── users/          # User management
│   ├── patient/            # Patient pages
│   └── *.js                # Application pages
├── src/                     # Frontend components (unchanged)
│   ├── components/         # React components
│   ├── context/            # Context providers
│   ├── layouts/            # Page layouts
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── utils/              # Utilities
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Initial data
├── healthcare-nextjs-setup.bat   # Setup script
├── healthcare-nextjs-start.bat   # Start script
└── package.json                  # Dependencies and scripts
```

## 💰 Cost: ₹0/Month

- **Frontend**: Vercel (Free)
- **Backend**: Next.js API Routes on Vercel (Free)
- **Database**: PlanetScale or Supabase (Free tier)
- **SSL & CDN**: Included (Free)

## 🌐 Deploy to Production

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

## 🔧 Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Update database schema
npm run db:seed      # Seed initial data
npm run db:studio    # Open database browser
```

## 📞 Support

For issues or questions, check the migration documentation files:
- `MIGRATION-README.md` - Detailed setup guide
- `DEPLOYMENT-COMPLETE.md` - Complete migration overview
