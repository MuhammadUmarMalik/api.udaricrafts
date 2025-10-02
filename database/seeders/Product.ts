import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Product from 'App/Models/Product'

export default class extends BaseSeeder {
  public async run() {
    await Product.createMany([
      {
        name: 'Handwoven Wall Tapestry',
        categoryId: 2, // Wall Art
        description: 'Beautiful handwoven wall tapestry with traditional patterns and vibrant colors. Perfect for adding warmth to any room.',
        story: 'Crafted by skilled artisans using traditional weaving techniques passed down through generations.',
        sizes: JSON.stringify(['Small', 'Medium', 'Large']),
        colors: JSON.stringify(['Red', 'Blue', 'Green', 'Natural']),
        discount: 10,
        price: 4500,
        quantity: 25,
      },
      {
        name: 'Ceramic Dinner Plate Set',
        categoryId: 3, // Kitchen & Dining
        description: 'Elegant hand-painted ceramic dinner plates. Set of 6 pieces with unique floral designs.',
        story: 'Each plate is individually painted by master craftsmen, making every piece unique.',
        sizes: JSON.stringify(['Standard']),
        colors: JSON.stringify(['White/Blue', 'White/Green', 'Multicolor']),
        discount: 15,
        price: 6800,
        quantity: 40,
      },
      {
        name: 'Wooden Coffee Table',
        categoryId: 4, // Furniture
        description: 'Solid wood coffee table with intricate carved details. Features a natural finish that highlights the wood grain.',
        story: 'Made from sustainably sourced wood and finished with natural oils.',
        sizes: JSON.stringify(['90x60cm', '120x80cm']),
        colors: JSON.stringify(['Natural Oak', 'Walnut', 'Dark Brown']),
        discount: 0,
        price: 18500,
        quantity: 10,
      },
      {
        name: 'Embroidered Cushion Covers',
        categoryId: 1, // Home Decor
        description: 'Set of 4 cushion covers with beautiful embroidery work. Made from premium cotton fabric.',
        story: 'Hand-embroidered by village artisans using traditional needlework techniques.',
        sizes: JSON.stringify(['16x16 inch', '18x18 inch']),
        colors: JSON.stringify(['Beige', 'Cream', 'Grey', 'Blue']),
        discount: 20,
        price: 2400,
        quantity: 60,
      },
      {
        name: 'Macrame Plant Hanger',
        categoryId: 1, // Home Decor
        description: 'Beautiful macrame plant hanger perfect for indoor plants. Includes adjustable rope length.',
        story: 'Hand-knotted using natural cotton rope in traditional macrame patterns.',
        sizes: JSON.stringify(['Medium', 'Large']),
        colors: JSON.stringify(['Natural', 'White', 'Black']),
        discount: 5,
        price: 1200,
        quantity: 80,
      },
      {
        name: 'Decorative Wall Mirror',
        categoryId: 2, // Wall Art
        description: 'Round decorative mirror with handcrafted wooden frame. Adds elegance to any wall.',
        story: 'Frame carved from reclaimed wood with traditional motifs.',
        sizes: JSON.stringify(['24 inch', '30 inch', '36 inch']),
        colors: JSON.stringify(['Natural Wood', 'Antique Gold', 'White Wash']),
        discount: 0,
        price: 5500,
        quantity: 20,
      },
      {
        name: 'Handmade Clay Pottery Set',
        categoryId: 3, // Kitchen & Dining
        description: 'Traditional clay pottery set including bowls, mugs, and serving dishes. Microwave and dishwasher safe.',
        story: 'Crafted on a pottery wheel and fired in traditional kilns.',
        sizes: JSON.stringify(['Small Set', 'Large Set']),
        colors: JSON.stringify(['Terracotta', 'Glazed Blue', 'Glazed Green']),
        discount: 10,
        price: 3200,
        quantity: 35,
      },
      {
        name: 'Woven Storage Baskets',
        categoryId: 6, // Storage & Organization
        description: 'Set of 3 handwoven storage baskets in different sizes. Perfect for organizing any space.',
        story: 'Woven from natural water hyacinth and seagrass by skilled basket makers.',
        sizes: JSON.stringify(['Small/Medium/Large Set']),
        colors: JSON.stringify(['Natural', 'Brown', 'White']),
        discount: 15,
        price: 2800,
        quantity: 50,
      },
      {
        name: 'Embroidered Silk Curtains',
        categoryId: 5, // Curtains
        description: 'Luxurious silk curtains with delicate embroidery. Includes rod pocket header for easy hanging.',
        story: 'Hand-embroidered on premium silk fabric with metallic thread accents.',
        sizes: JSON.stringify(['5x7 feet', '7x9 feet']),
        colors: JSON.stringify(['Ivory', 'Gold', 'Royal Blue', 'Burgundy']),
        discount: 0,
        price: 12500,
        quantity: 15,
      },
      {
        name: 'Wooden Bookshelf',
        categoryId: 4, // Furniture
        description: '5-tier wooden bookshelf with open shelves. Sturdy construction and elegant design.',
        story: 'Handcrafted from solid mango wood with a smooth finish.',
        sizes: JSON.stringify(['5 Tier', '6 Tier']),
        colors: JSON.stringify(['Natural', 'Espresso', 'White']),
        discount: 10,
        price: 14800,
        quantity: 12,
      },
      {
        name: 'Hand-painted Terracotta Planters',
        categoryId: 1, // Home Decor
        description: 'Set of 3 terracotta planters with colorful hand-painted designs. Includes drainage holes.',
        story: 'Each planter is individually painted with traditional folk art motifs.',
        sizes: JSON.stringify(['Small/Medium/Large']),
        colors: JSON.stringify(['Multi-colored', 'Blue & White', 'Red & Yellow']),
        discount: 0,
        price: 1800,
        quantity: 45,
      },
      {
        name: 'Brass Candle Holders',
        categoryId: 1, // Home Decor
        description: 'Set of 5 vintage-style brass candle holders in varying heights. Creates beautiful ambiance.',
        story: 'Hand-forged brass with antique finish, perfect for traditional and modern homes.',
        sizes: JSON.stringify(['Standard Set']),
        colors: JSON.stringify(['Antique Brass', 'Polished Gold']),
        discount: 5,
        price: 3500,
        quantity: 30,
      },
    ])
  }
}
