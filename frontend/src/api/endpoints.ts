export const endpoints = {
  // auth
  register: '/register',
  login: '/login',

  // public
  categories: '/categories',
  products: (id?: number | string) => (id ? `/products/${id}` : '/products'),
  productsPaginated: '/products',
  reviews: '/reviews',
  complaints: '/complaints',
  banners: '/banners',
  orders: '/orders',
  orderByNumber: (orderNumber: string) => `/orders/${orderNumber}`,
  createCheckoutSession: (orderId: number | string) => `/create-checkout-session/${orderId}`,
  createJazzCashCheckout: (orderId: number | string) => `/create-jazzcash-checkout/${orderId}`,

  // admin (all prefixed with /api)
  admin: {
    usersExcludeCurrent: '/api/users/exclude-current',
    user: (id: number | string) => `/api/users/${id}`,
    categories: '/api/categories',
    category: (id: number | string) => `/api/categories/${id}`,
    products: '/api/products',
    product: (id: number | string) => `/api/products/${id}`,
    productImage: (id: number | string) => `/api/productImages/${id}`,
    reviews: '/api/reviews',
    review: (id: number | string) => `/api/reviews/${id}`,
    banners: '/api/banners',
    banner: (id: number | string) => `/api/banners/${id}`,
    complaints: '/api/complaints',
    complaint: (id: number | string) => `/api/complaints/${id}`,
    complaintSendMail: '/api/complaints/send-mail',
    orders: '/api/orders',
    updateOrderStatus: (id: number | string) => `/api/admin/orders/${id}`,
    updatePaymentStatus: (id: number | string, paymentStatus: string) => `/api/admin/orders/${id}/${paymentStatus}`,
    ordersPagination: '/api/orders/pagination',
    dashboardStats: '/api/products/getStatistics',
    verifyPassword: '/api/verify-password',
    forgotPassword: '/api/forgot-password',
    notifications: '/api/notifications',
    notification: (id: number | string) => `/api/notifications/${id}`,
    markAsRead: (id: number | string) => `/api/notifications/${id}/markAsRead`,
    markAllAsRead: '/api/notifications/markAllAsRead',
    unread: '/api/notifications/unread',
  },
}


