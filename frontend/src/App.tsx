import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import Login from './pages/Login'
import Register from './pages/Register'
import Complaint from './pages/Complaint'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import MyOrders from './pages/MyOrders'
import MyReviews from './pages/MyReviews'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProfile from './pages/admin/AdminProfile'
import AdminChangePassword from './pages/admin/AdminChangePassword'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import CategoriesAdmin from './pages/admin/CategoriesAdmin'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import ReviewsAdmin from './pages/admin/ReviewsAdmin'
import BannersAdmin from './pages/admin/BannersAdmin'
import UsersAdmin from './pages/admin/UsersAdmin'
import NotificationsAdmin from './pages/admin/NotificationsAdmin'
import ComplaintsAdmin from './pages/admin/ComplaintsAdmin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Layout from './components/Layout'

export default function App() {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route element={<Layout><Home /></Layout>} path="/" />
      <Route element={<Layout><Products /></Layout>} path="/products" />
      <Route element={<Layout><ProductDetail /></Layout>} path="/products/:id" />
      <Route element={<Layout><Cart /></Layout>} path="/cart" />
      <Route element={<Layout><Checkout /></Layout>} path="/checkout" />
      <Route element={<Layout><OrderStatus /></Layout>} path="/order/:number" />
      <Route element={<Layout><PaymentSuccess /></Layout>} path="/payment/success" />
      <Route element={<Layout><PaymentCancel /></Layout>} path="/payment/cancel" />
      <Route element={<Layout><Login /></Layout>} path="/login" />
      <Route element={<Layout><Register /></Layout>} path="/register" />
      <Route element={<Layout><Complaint /></Layout>} path="/complaint" />

      {/* User Profile Routes - Protected */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/password" 
        element={
          <ProtectedRoute>
            <Layout><ChangePassword /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/orders" 
        element={
          <ProtectedRoute>
            <Layout><MyOrders /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/reviews" 
        element={
          <ProtectedRoute>
            <Layout><MyReviews /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - Separate Layout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="profile/password" element={<AdminChangePassword />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
        <Route path="banners" element={<BannersAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="notifications" element={<NotificationsAdmin />} />
        <Route path="complaints" element={<ComplaintsAdmin />} />
      </Route>
    </Routes>
  )
}
