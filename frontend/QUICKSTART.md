# Quick Start Guide - Udari Crafts Frontend

## Prerequisites

- Node.js 18+ installed
- Backend API running on port 3333 (or update VITE_API_BASE_URL)

## Setup in 3 Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend/` directory:

```bash
echo "VITE_API_BASE_URL=http://localhost:3333" > .env
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:5173/**

## First Time Setup

### Create Admin Account

1. Go to `/register`
2. Create an account with email and password
3. **In the backend**, update the user's role to `admin` in the database
4. Login and access `/admin`

### Add Test Data

1. Login as admin
2. Go to `/admin/categories` and create categories
3. Go to `/admin/products` and add products
4. Go to `/admin/banners` and upload banners

### Test Shopping Flow

1. Logout (or use incognito)
2. Browse products on homepage
3. Add items to cart
4. Complete checkout
5. View order status

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Troubleshooting

### Port 5173 already in use

```bash
# Kill the process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Cannot connect to backend

- Verify backend is running: `curl http://localhost:3333/health`
- Check `.env` has correct `VITE_API_BASE_URL`
- Check CORS is enabled in backend

### Images not loading

- Backend must serve static files from `uploads/` directory
- Check backend route configuration for static file serving

## Next Steps

- Customize theme colors in `src/index.css`
- Add your logo in `Layout.tsx`
- Configure payment gateway credentials in backend
- Set up email service for order confirmations
- Deploy to production (Vercel, Netlify, etc.)

---

**Need help? Check the full README.md for detailed documentation.**
