import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await User.createMany([
      {
        name: 'admin',
        email: 'admin@saqafat.com',
        password: '12345678',
        role: 'super admin',
      },
    ])
  }
}
