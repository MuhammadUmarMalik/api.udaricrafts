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

    // Get current user's reviews
    public async getUserReviews({ auth, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }

            const reviews = await Review.query()
                .where('email', user.email)
                .orderBy('created_at', 'desc')

            return response.send(Response('User reviews fetched successfully', reviews))
        } catch (error) {
            return response.status(500).json({ 
                message: 'Failed to fetch user reviews', 
                error: error.message 
            })
        }
    }

    // Update user's own review
    public async updateUserReview({ auth, request, params, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }

            const review = await Review.findOrFail(params.id)

            // Check if the review belongs to the user
            if (review.email !== user.email) {
                return response.status(403).json({ message: 'You can only update your own reviews' })
            }

            const data = await request.validate(ReviewUpdateValidator)
            await review.merge(data).save()

            return response.send(Response('Review updated successfully', review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }

    // Delete user's own review
    public async deleteUserReview({ auth, params, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }

            const review = await Review.findOrFail(params.id)

            // Check if the review belongs to the user
            if (review.email !== user.email) {
                return response.status(403).json({ message: 'You can only delete your own reviews' })
            }

            await review.delete()
            return response.send(Response('Review deleted successfully', review))
        } catch (error) {
            return response.status(400).send(error)
        }
    }
}