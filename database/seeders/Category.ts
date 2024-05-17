import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await Category.createMany([
      { name: 'Home Decor', slug: 'Home Decor' },
      { name: 'Wall Art', slug: 'Wall Art' },
      { name: 'Kitchen & Dining', slug: 'kitchen & Dining' },
      { name: 'Furniture', slug: 'Furniture' },
      { name: 'Curtains', slug: 'Curtains' },
      { name: 'Storage & Organization', slug: 'Storage & Organization' },
    ])
  }
}
