import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Banner from 'App/Models/Banner'

export default class extends BaseSeeder {
  public async run() {
    // Note: These are placeholder image names
    // In production, you would upload actual banner images to the uploads folder
    await Banner.createMany([
      {
        image: 'banner-1.jpg', // Replace with actual uploaded banner image
      },
      {
        image: 'banner-2.jpg', // Replace with actual uploaded banner image
      },
      {
        image: 'banner-3.jpg', // Replace with actual uploaded banner image
      },
    ])
  }
}

