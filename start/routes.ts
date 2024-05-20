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
  Route.get('/users', 'AuthController.index')
  Route.put('/users/:id', 'AuthController.update')
  Route.delete('/users/:id', 'AuthController.destroy')
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
  //reviews
  Route.get('/reviews', 'ReviewsController.index')
  Route.put('/reviews/:id', 'ReviewsController.update')
  Route.delete('/reviews/:id', 'ReviewsController.destroy')
  // Banners
  Route.post('/banners', 'BannersController.store')
  Route.get('/banners', 'BannersController.index')
  Route.put('/banners/:id', 'BannersController.update')
  Route.delete('/banners/:id', 'BannersController.destroy')
  // Complaints
  Route.put('/complaints/:id', 'ComplaintsController.update')
  Route.post("/complaints/pagination", "ComplaintsController.pagination")
}).prefix('api').middleware(['auth'])

//Authentication Endpoints
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

// Categories endpoint for public user
Route.get('/categories', 'CategoriesController.index')

// Products endpoint for public user
Route.get('/products/:id', 'ProductsController.show')
Route.post("/products/pagination", "ProductsController.pagination")

//review endpoint for public user
Route.post('/reviews', 'ReviewsController.store')
Route.get('/reviews', 'ReviewsController.index')

// Complaints endpoint for public user
Route.post('/complaints', 'ComplaintsController.store')

// Banners endpoint for public user
Route.get('/banners', 'BannersController.show')

