# Udari Crafts Frontend

A modern, fully-featured e-commerce frontend built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Public Features

- **Home Page**: Hero section, featured banners, category showcase
- **Product Catalog**: Grid view with search, filters, and pagination
- **Product Details**: Image gallery, quantity selector, add to cart
- **Shopping Cart**: Real-time cart management with quantity updates
- **Checkout**: Form validation, order summary
- **Order Tracking**: Track order status by order number

### Admin Features

- **Dashboard**: Statistics overview (products, orders, users, revenue)
- **Product Management**: Create, view, delete products with multi-image upload
- **Category Management**: CRUD operations for product categories
- **Order Management**: Update order status and payment status
- **Review Management**: View and moderate customer reviews
- **Banner Management**: Upload and manage homepage banners
- **User Management**: View and manage registered users

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Vite** for build tooling

## 📦 Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3333
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance with auth interceptor
│   │   ├── endpoints.ts  # API endpoint definitions
│   │   └── auth.ts       # Auth-specific API calls
│   ├── components/       # Reusable components
│   │   ├── ui/           # UI components (Button, Input, Card, etc.)
│   │   ├── Layout.tsx    # Main layout with header/footer
│   │   └── ProtectedRoute.tsx  # Auth guard for admin routes
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderStatus.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── admin/        # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── ProductsAdmin.tsx
│   │       ├── CategoriesAdmin.tsx
│   │       ├── OrdersAdmin.tsx
│   │       ├── ReviewsAdmin.tsx
│   │       ├── BannersAdmin.tsx
│   │       └── UsersAdmin.tsx
│   ├── store/            # Zustand stores
│   │   ├── auth.ts       # Authentication state
│   │   └── cart.ts       # Shopping cart state
│   ├── utils/            # Utility functions
│   │   └── image.ts      # Image URL helper
│   ├── App.tsx           # Main app component with routes
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design System

### Colors

- **Primary**: Blue-600 (#2563eb)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Gray Scale**: 50-900

### Components

- **Button**: Primary, Secondary, Outline, Danger variants
- **Input**: With label and error states
- **Card**: Hover effects and shadows
- **Badge**: Status indicators with color variants
- **Modal**: Overlay with multiple sizes
- **Spinner**: Loading states

## 🔐 Authentication

The app uses token-based authentication:

- Login/Register returns a JWT token
- Token is stored in `localStorage` as `auth_token`
- Axios interceptor automatically adds `Authorization: Bearer <token>` header
- Admin routes are protected with `ProtectedRoute` component

## 🛒 State Management

### Auth Store (Zustand)

```typescript
{
  token: string | null
  isAuthenticated: boolean
  login: (email, password) => Promise<void>
  register: (name, email, password) => Promise<void>
  logout: () => void
}
```

### Cart Store (Zustand)

```typescript
{
  items: CartItem[]
  addItem: (item, quantity) => void
  removeItem: (productId) => void
  updateQuantity: (productId, quantity) => void
  clear: () => void
  total: () => number
}
```

## 🖼️ Image Handling

The backend serves images from the `uploads/` directory. The `toImageUrl()` helper function normalizes image paths:

```typescript
toImageUrl("uploads/image.jpg");
// => 'http://localhost:3333/uploads/image.jpg'
```

## 📱 Responsive Design

The UI is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚦 Routes

### Public Routes

- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/order/:number` - Order status
- `/login` - Login page
- `/register` - Registration page

### Admin Routes (Protected)

- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/reviews` - Review management
- `/admin/banners` - Banner management
- `/admin/users` - User management

## 🔧 API Integration

All API calls go through the centralized `api` client:

```typescript
import { api } from "./api/client";
import { endpoints } from "./api/endpoints";

// Example: Fetch products
const products = await api.get(endpoints.products);

// Example: Create order
const order = await api.post(endpoints.orders, orderData);
```

## 🐛 Troubleshooting

### Images not displaying

- Ensure backend serves files from the `uploads/` directory
- Check `VITE_API_BASE_URL` is correct
- Verify image paths in API responses

### Authentication errors

- Clear `localStorage` and try logging in again
- Check token expiration (default: 5 days)
- Verify backend is running on correct port

### CORS errors

- Backend must allow requests from frontend origin
- Check `cors.ts` config in backend

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Made with ❤️ for Udari Crafts**
