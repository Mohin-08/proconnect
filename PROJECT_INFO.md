# ProConnect - Professional Services Platform

A comprehensive platform connecting users with professional service providers.

## Features

### Admin Portal
- Dashboard with platform statistics (total users, professionals, active/completed jobs)
- User management system with role-based access
- Service listings management
- Platform settings configuration
- User details modal with animations

### Professional Portal
- Dashboard with job statistics and recent activity
- Active jobs management with status tracking
- Service offerings management
- Professional profile management
- Purple gradient theme

### User Portal
- Browse and search professional services
- Favorites system with toggle functionality
- Booking management and history
- User profile management
- Green gradient theme

## Tech Stack
- **Frontend:** React 19.2.0 with TypeScript
- **Routing:** React Router v6
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth
- **Build Tool:** Vite
- **Styling:** Custom CSS with animations

## Key Features Implemented
✅ Multi-role authentication (Admin, Professional, User)
✅ Comprehensive animations and smooth transitions
✅ Favorites system with database persistence
✅ Booking system with status tracking
✅ Professional services management
✅ Admin dashboard with global statistics
✅ Support footer on all pages

## Support
For any queries, contact: **2400030974@kluniversity.in**

## Installation

```bash
npm install
npm run dev
```

## Database Setup
Run the SQL scripts in the following order:
1. `complete_database_setup.sql`
2. `create_favorites_table.sql`
3. `add_home_services.sql`
4. `fix_admin_bookings_access.sql`

## Project Structure
```
proconnect/
├── src/
│   ├── admin/          # Admin portal components
│   ├── professional/   # Professional portal components
│   ├── user/          # User portal components
│   ├── App.tsx        # Main app with routing
│   ├── AuthPage.tsx   # Authentication page
│   └── supabaseClient.ts
├── public/
└── SQL scripts/       # Database setup scripts
```

## Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment
- Frontend can be deployed on Vercel, Netlify, or similar platforms
- Database hosted on Supabase

## License
All rights reserved © 2025 ProConnect
