import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Category from 'App/Models/Category'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await Category.createMany([
      { name: 'Home Decor', slug: 'home-decor' },
      { name: 'Wall Art', slug: 'wall-art' },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Curtains', slug: 'curtains' },
      { name: 'Storage & Organization', slug: 'storage-organization' },
    ])
  }
}
