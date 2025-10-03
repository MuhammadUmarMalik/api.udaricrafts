export const endpoints = {
  // auth
  register: '/register',
  login: '/login',
  logout: '/api/logout',

  // public
  categories: '/categories',
  categoryProducts: (id: number | string) => `/categories/${id}/products`,
  products: (id?: number | string) => (id ? `/products/${id}` : '/products'),
  productsPaginated: '/products',
  productsSearch: '/products/search',
  reviews: '/reviews',
  complaints: '/complaints',
  banners: '/banners',
  orders: '/orders',
  orderByNumber: (orderNumber: string) => `/orders/${orderNumber}`,
  createCheckoutSession: (orderId: number | string) => `/create-checkout-session/${orderId}`,
  createJazzCashCheckout: (orderId: number | string) => `/create-jazzcash-checkout/${orderId}`,
  verifyPayment: '/verify-payment',

  // customer (authenticated user endpoints)
  customer: {
    // User profile
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    changePassword: '/api/users/password',
    
    // User orders
    orders: '/api/orders',
    
    // User reviews
    reviews: '/api/reviews/user',
    review: (id: number | string) => `/api/reviews/user/${id}`,
  },

  // admin (all prefixed with /api)
  admin: {
    // User profile
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    changePassword: '/api/users/password',
    
    // User management
    usersExcludeCurrent: '/api/users/exclude-current',
    user: (id: number | string) => `/api/users/${id}`,
    
    // Categories
    categories: '/api/categories',
    category: (id: number | string) => `/api/categories/${id}`,
    
    // Products
    products: '/api/products',
    product: (id: number | string) => `/api/products/${id}`,
    productImage: (id: number | string) => `/api/productImages/${id}`,
    
    // Reviews (admin)
    reviews: '/api/reviews',
    review: (id: number | string) => `/api/reviews/${id}`,
    
    // User reviews
    userReviews: '/api/reviews/user',
    userReview: (id: number | string) => `/api/reviews/user/${id}`,
    
    // Banners
    banners: '/api/banners',
    banner: (id: number | string) => `/api/banners/${id}`,
    
    // Complaints
    complaints: '/api/complaints',
    complaint: (id: number | string) => `/api/complaints/${id}`,
    complaintSendMail: '/api/complaints/send-mail',
    
    // Orders
    orders: '/api/orders',
    userOrders: '/api/orders',
    updateOrderStatus: (id: number | string) => `/api/admin/orders/${id}`,
    updatePaymentStatus: (id: number | string, paymentStatus: string) => `/api/admin/orders/${id}/${paymentStatus}`,
    ordersPagination: '/api/orders/pagination',
    
    // Dashboard
    dashboardStats: '/api/products/getStatistics',
    verifyPassword: '/api/verify-password',
    forgotPassword: '/api/forgot-password',
    resetPassword: '/api/reset-password',
    
    // Notifications
    notifications: '/api/notifications',
    notification: (id: number | string) => `/api/notifications/${id}`,
    markAsRead: (id: number | string) => `/api/notifications/${id}/markAsRead`,
    markAllAsRead: '/api/notifications/markAllAsRead',
    unread: '/api/notifications/unread',
  },
}


