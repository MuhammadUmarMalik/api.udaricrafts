import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Review from 'App/Models/Review';
import { Response } from 'App/Utils/ApiUtil';
import ReviewValidator from 'App/Validators/ReviewValidator';
import ReviewUpdateValidator from 'App/Validators/ReviewUpdateValidator';

export default class ReviewsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const reviewData = await request.validate(ReviewValidator)
            // Set default status to 'pending' if not provided
            const review = await Review.create({
                ...reviewData,
                status: reviewData.status || 'pending'
            })
            return response.send(Response('Review Submitted Successfully', review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const review = await Review.all()
            return response.send(Response('Get All Review Successfully', review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const review = await Review.findOrFail(params.id)
            // Use ReviewUpdateValidator which allows partial updates
            const data = await request.validate(ReviewUpdateValidator)
            await review.merge(data).save()
            return response.send(Response('Review Updated Successfully', review))
        } catch (error) {
            console.log(error)
            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const review = await Review.findOrFail(params.id)
            await review.delete()
            return response.send(Response('Review Deleted Successfully', review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}