import Application from '@ioc:Adonis/Core/Application';
import { Response } from 'App/Utils/ApiUtil';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from 'fs/promises'
import Banner from 'App/Models/Banner';

export default class DishesController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const image = await request.file('image')
            if (image) {
                await image.move(Application.tmpPath('uploads'), {
                    name: `${Date.now()} - ${image.clientName}`
                })
                let banner = new Banner()
                banner.image = image.fileName || ''
                await banner.save()
                return response.send(Response('Banner Created Successfully', banner))
            }


        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const banners = await Banner.all()
            const data = banners.map((banner) => {
                return {
                    id: banner.id,
                    image: `uploads/${banner.image}`
                }
            })
            return response.send(Response('Get All Banners', data))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async show({ response }: HttpContextContract) {
        try {
            const banners = await Banner.all()
            const data = banners.map((banner) => {
                return {
                    id: banner.id,
                    image: `uploads/${banner.image}`
                }
            })
            return response.send(Response('Get All Banners', data))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        try {
            const banner = await Banner.findOrFail(params.id)
            const image = request.file('image') // Fixed: use file() not input()
            
            if (!image) {
                return response.status(400).send(Response('No image file provided', null))
            }

            // Save the old image path for deletion
            const oldImagePath = banner.image

            // Move new image to uploads folder
            await image.move(Application.tmpPath('uploads'), {
                name: `${Date.now()}-${image.clientName}` // Fixed: removed space
            })

            // Update banner with new image filename
            banner.image = image.fileName || ''
            await banner.save()

            // Try to delete old image file (don't fail if it doesn't exist)
            if (oldImagePath) {
                try {
                    await fs.unlink(Application.tmpPath(`uploads/${oldImagePath}`))
                } catch (fileError) {
                    console.log('Old banner image not found or already deleted:', oldImagePath)
                }
            }

            return response.send(Response('Banner Updated Successfully', {
                id: banner.id,
                image: `uploads/${banner.image}`
            }))
        } catch (error) {
            console.log('Error updating banner:', error);
            return response.status(400).send(Response('Failed to update banner', error))
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const banner = await Banner.findOrFail(params.id)
            
            // Try to delete the image file (don't fail if file doesn't exist)
            if (banner.image) {
                try {
                    const imagePath = Application.tmpPath(`uploads/${banner.image}`)
                    await fs.unlink(imagePath)
                } catch (fileError) {
                    console.log('Banner image file not found or already deleted:', banner.image)
                }
            }
            
            // Always delete the database record
            await banner.delete()
            
            return response.send(Response('Banner Deleted Successfully', {
                id: banner.id,
                image: banner.image
            }))
        } catch (error) {
            console.log('Error deleting banner:', error);
            return response.status(404).send(Response('Banner not found', error))
        }
    }
}