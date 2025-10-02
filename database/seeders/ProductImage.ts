import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ProductImage from 'App/Models/ProductImage'

export default class extends BaseSeeder {
  public async run() {
    // Note: These are placeholder image names
    // In production, you would upload actual product images to the uploads folder
    await ProductImage.createMany([
      // Product 1 - Handwoven Wall Tapestry
      { productId: 1, path: 'uploads/tapestry-1.jpg' },
      { productId: 1, path: 'uploads/tapestry-2.jpg' },
      
      // Product 2 - Ceramic Dinner Plate Set
      { productId: 2, path: 'uploads/plates-1.jpg' },
      { productId: 2, path: 'uploads/plates-2.jpg' },
      
      // Product 3 - Wooden Coffee Table
      { productId: 3, path: 'uploads/table-1.jpg' },
      { productId: 3, path: 'uploads/table-2.jpg' },
      
      // Product 4 - Embroidered Cushion Covers
      { productId: 4, path: 'uploads/cushions-1.jpg' },
      { productId: 4, path: 'uploads/cushions-2.jpg' },
      
      // Product 5 - Macrame Plant Hanger
      { productId: 5, path: 'uploads/macrame-1.jpg' },
      { productId: 5, path: 'uploads/macrame-2.jpg' },
      
      // Product 6 - Decorative Wall Mirror
      { productId: 6, path: 'uploads/mirror-1.jpg' },
      
      // Product 7 - Handmade Clay Pottery Set
      { productId: 7, path: 'uploads/pottery-1.jpg' },
      { productId: 7, path: 'uploads/pottery-2.jpg' },
      
      // Product 8 - Woven Storage Baskets
      { productId: 8, path: 'uploads/baskets-1.jpg' },
      
      // Product 9 - Embroidered Silk Curtains
      { productId: 9, path: 'uploads/curtains-1.jpg' },
      { productId: 9, path: 'uploads/curtains-2.jpg' },
      
      // Product 10 - Wooden Bookshelf
      { productId: 10, path: 'uploads/bookshelf-1.jpg' },
      
      // Product 11 - Hand-painted Terracotta Planters
      { productId: 11, path: 'uploads/planters-1.jpg' },
      { productId: 11, path: 'uploads/planters-2.jpg' },
      
      // Product 12 - Brass Candle Holders
      { productId: 12, path: 'uploads/candles-1.jpg' },
    ])
  }
}

