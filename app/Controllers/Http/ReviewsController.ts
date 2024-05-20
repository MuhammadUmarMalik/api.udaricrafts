import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Review from 'App/Models/Review';
import { Response } from 'App/Utils/ApiUtil';
import ReviewValidator from 'App/Validators/ReviewValidator';

export default class ReviewsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const review = await request.validate(ReviewValidator)
            await Review.create(review)
            return response.send(Response({ message: 'success', review }))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const review = await Review.all()
            return response.send(Response(review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const review = await Review.findOrFail(params.id)
            const data = await request.validate(ReviewValidator)
            await review.merge(data).save()
            return response.send(Response({ message: 'success', review }))
        } catch (error) {
            console.log(error)
            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const review = await Review.findOrFail(params.id)
            await review.delete()
            return response.send(Response({ message: 'Success', review }))
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}