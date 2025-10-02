import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import CategoriesAdmin from './pages/admin/CategoriesAdmin'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import ReviewsAdmin from './pages/admin/ReviewsAdmin'
import BannersAdmin from './pages/admin/BannersAdmin'
import UsersAdmin from './pages/admin/UsersAdmin'
import ProtectedRoute from './components/ProtectedRoute'
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
      <Route element={<Layout><Login /></Layout>} path="/login" />
      <Route element={<Layout><Register /></Layout>} path="/register" />

      {/* Admin Routes - Separate Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
        <Route path="banners" element={<BannersAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
      </Route>
    </Routes>
  )
}
