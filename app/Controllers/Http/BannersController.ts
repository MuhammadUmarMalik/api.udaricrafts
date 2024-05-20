import Application from '@ioc:Adonis/Core/Application';
import { Response } from 'App/Utils/ApiUtil';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import fs from 'fs/promises'
import Banner from 'App/Models/Banner';

export default class DishesController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const image = await request.input('image')
            await image.move(Application.tmpPath('uploads'), {
                name: `${Date.now()} - ${image.clientName}`
            })
            let banner = new Banner()
            banner.image = image.fileName
            await banner.save()
            return response.send(Response('Banner Created Successfully', banner))
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
                    image: Application.tmpPath(`uploads/${banner.image}`)
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
            const image = await request.input('image')
            await image.move(Application.tmpPath('uploads'), {
                name: `${Date.now()} - ${image.clientName}`
            })
            const previousImage = Application.tmpPath(`uploads / ${image}`)
            await fs.unlink(previousImage)
            await banner.merge({
                image: image.fileName
            }).save()
            return response.send(Response('Banner Updated Successfully', banner))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const banner = await Banner.findOrFail(params.id)
            const image = Application.tmpPath(`uploads / ${banner.image}`)
            await fs.unlink(image)
            await banner.delete()
            return response.send(Response('Banner Deleted Successfully', banner))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }
}