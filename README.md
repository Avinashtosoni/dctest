# Digital Comrade - Digital Marketing Agency Dashboard

A full-featured digital marketing agency SaaS platform with e-commerce, CRM, and project management capabilities.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Payments**: Razorpay
- **Deployment**: Docker + Nginx (Coolify-ready)

## Features

- 📊 Admin Dashboard with Analytics
- 🛒 E-commerce (Products & Services)
- 💳 Multiple Payment Methods (Razorpay, Cash)
- 📄 Automatic Invoice Generation (PDF)
- 🔔 Real-time Notifications
- 👥 Role-based Access Control (RBAC)
- 📱 Responsive Design

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

## Coolify Deployment

### Option 1: Docker Build (Recommended)

1. **Connect your GitHub repo** to Coolify
2. **Select "Docker" as build type**
3. **Add environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
4. **Set port**: `3000`
5. **Deploy!**

### Option 2: Nixpacks

Coolify can also auto-detect and build using Nixpacks.

### Build Configuration

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Port | `3000` |

## Database Setup (Supabase)

Run migrations in order from `supabase/migrations/`:

```
0001_initial_schema.sql
0002_...
...
0023_ecommerce_notifications.sql
```

### Required Supabase Storage Buckets

Create these public buckets in Supabase Storage:
- `documents` - For invoice PDFs
- `avatars` - For profile pictures
- `attachments` - For notification attachments

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Docker Build (Manual)

```bash
# Build image
docker build -t digital-comrade .

# Run container
docker run -p 3000:3000 digital-comrade
```

## License

Private - All Rights Reserved
