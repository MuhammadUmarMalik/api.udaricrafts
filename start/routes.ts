/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
Route.get('/', async () => {
  return { hello: 'world' }
})


Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy
    ? response.ok(report)
    : response.badRequest(report)
})

//admin endpoints 
Route.group(() => {
  //auth 
  Route.get('/users/exclude-current', 'AuthController.getAllExceptCurrent')
  Route.get('/users/profile', 'AuthController.getProfile')
  Route.put('/users/profile', 'AuthController.updateProfile')
  Route.put('/users/password', 'AuthController.changePassword')
  Route.put('/users/:id', 'AuthController.update')
  Route.delete('/users/:id', 'AuthController.destroy')
  Route.post('/logout', 'AuthController.logout')
  // Categories
  Route.post('/categories', 'CategoriesController.store')
  Route.get('/categories', 'CategoriesController.index')
  Route.put('/categories/:id', 'CategoriesController.update')
  Route.delete('/categories/:id', 'CategoriesController.destroy')
  // Products
  Route.post('/products', 'ProductsController.store')
  Route.get('/products', 'ProductsController.index')
  Route.put('/products/:id', 'ProductsController.update')
  Route.delete('/products/:id', 'ProductsController.destroy')
  Route.delete('/productImages/:id', 'ProductsController.deleteImage')
  //reviews
  Route.get('/reviews', 'ReviewsController.index')
  Route.get('/reviews/user', 'ReviewsController.getUserReviews')
  Route.put('/reviews/:id', 'ReviewsController.update')
  Route.put('/reviews/user/:id', 'ReviewsController.updateUserReview')
  Route.delete('/reviews/:id', 'ReviewsController.destroy')
  Route.delete('/reviews/user/:id', 'ReviewsController.deleteUserReview')
  // Banners
  Route.post('/banners', 'BannersController.store')
  Route.get('/banners', 'BannersController.index')
  Route.put('/banners/:id', 'BannersController.update')
  Route.delete('/banners/:id', 'BannersController.destroy')
  // Complaints
  Route.get('/complaints', 'ComplaintsController.index')
  Route.put('/complaints/:id', 'ComplaintsController.update')
  Route.delete('/complaints/:id', 'ComplaintsController.destroy')
  Route.post("/complaints/send-mail", "ComplaintsController.sendEmail")
  //order
  Route.get('/orders', 'OrdersController.getUserOrders')
  Route.put('/admin/orders/:id', 'OrdersController.updateOrderStatus')
  Route.put('/admin/orders/:id/:paymentStatus', 'OrdersController.updatePaymentStatus')
  Route.post("/orders/pagination", "OrdersController.pagination")
  //Dashboard Endpoints
  Route.get('/products/getStatistics', 'AdminDashboardsController.getStatistics')
  Route.post('/verify-password', 'AdminDashboardsController.verifyPassword')
  Route.post('/forgot-password', 'AdminDashboardsController.forgotPassword')
  Route.post('/reset-password', 'AuthController.resetPassword')
  //Notificatons
  Route.get('/notifications', 'NotificationsController.index')
  Route.post('/notifications', 'NotificationsController.create')
  Route.delete('/notifications/:id', 'NotificationsController.destroy')
  Route.patch('/notifications/:id/markAsRead', 'NotificationsController.markAsRead')
  Route.patch('/notifications/markAllAsRead', 'NotificationsController.markAllAsRead')
  Route.get('/notifications/unread', 'NotificationsController.getUnread')
}).prefix('api').middleware(['auth'])

//Authentication Endpoints
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

// Categories endpoint for public user
Route.get('/categories/:id/products', 'ProductsController.getByCategory')
Route.get('/categories', 'CategoriesController.index')

// Products endpoint for public user
Route.get('/products/search', 'ProductsController.search')
Route.get('/products/:id', 'ProductsController.show')
Route.get("/products", "ProductsController.pagination")

//review endpoint for public user
Route.post('/reviews', 'ReviewsController.store')
Route.get('/reviews', 'ReviewsController.index')

// Complaints endpoint for public user
Route.post('/complaints', 'ComplaintsController.store')

// Banners endpoint for public user
Route.get('/banners', 'BannersController.show')

// Create order endpoint for public user
Route.post('/orders', 'OrdersController.store')
Route.get('/orders/:order_number', 'OrdersController.getOrderDetails')
// stripe payment gateway
Route.post('/create-checkout-session/:id', 'OrdersController.createCheckoutSession')
Route.get('/verify-payment', 'OrdersController.verifyPayment')
// Jazzcash  payment gateway
Route.post('/create-jazzcash-checkout/:id', 'OrdersController.createJazzCashCheckout')