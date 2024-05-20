import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category';
import { Response } from 'App/Utils/ApiUtil';
import CategoryValidator from 'App/Validators/CategoryValidator';

export default class CategoriesController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const category = await request.validate(CategoryValidator)
            await Category.create(category)
            return response.send(Response('Category Created Successfully', category))
        } catch (error) { 
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const category = await Category.all()
            return response.send(Response('Get All Categories', category))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const category = await Category.findOrFail(params.id)
            const data = await request.validate(CategoryValidator)
            await category.merge(data).save()
            return response.send(Response('Category Updated Successfully', category))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const category = await Category.findOrFail(params.id)
            await category.delete()
            return response.send(Response('Category Deleted Successfully', category))
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}