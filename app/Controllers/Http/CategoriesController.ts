import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category';
import { Response } from 'App/Utils/ApiUtil';
import CategoryValidator from 'App/Validators/CategoryValidator';

export default class CategoriesController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const category = await request.validate(CategoryValidator)
            await Category.create(category)
            return response.send(Response({ message: 'Ctaegory is successfully added.' }))
        } catch (error) { 
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const category = await Category.all()
            return response.send(Response(category))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const category = await Category.findOrFail(params.id)
            const data = await request.validate(CategoryValidator)
            await category.merge(data).save()
            return response.send(Response({ message: 'Category updated successfully' }))
        } catch (error) {

            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const category = await Category.findOrFail(params.id)
            await category.delete()
            return response.send(Response({ message: 'Category Deleted Successfully' }))
        } catch (error) {

            return response.status(400).send(error)
        }
    }
}