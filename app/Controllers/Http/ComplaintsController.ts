import { Response } from 'App/Utils/ApiUtil';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Complaint from 'App/Models/Complaint';
import ComplaintValidator from 'App/Validators/ComplaintValidator';
import Mail from '@ioc:Adonis/Addons/Mail';

export default class ComplaintsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const complaint = await request.validate(ComplaintValidator)
            await Complaint.create(complaint)
            return response.send(Response('Complaint Submitted Successfully', complaint))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async update({ request, params, response }: HttpContextContract) {
        try {
            const complaint = await Complaint.findOrFail(params.id)
            const status = await request.input('status')
            await complaint.merge({ status: status }).save()
            return response.send(Response('Complaint Updated Successfully', complaint))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async sendEmail({ request, response }: HttpContextContract) {
        const { to, from, subject, text } = request.only(['to', 'from', 'subject', 'text'])

        try {
            await Mail.send((message) => {
                message
                    .to(to)
                    .from(from)
                    .subject(subject)
                    .text(text)
            })

            return response.send(Response('Email Send Successfully', { to, from, subject, text }))
        } catch (error) {
            console.error(error)
            return response.status(500).send({ message: 'Failed to send email', error: error.message })
        }
    }

    public async index({ request, response }: HttpContextContract) {
        try {
            const { date, name, status } = request.qs()
            let query = Complaint.query()
            if (date) {
                query = query.where('created_at', date)
            }
            if (name) {
                query = query.where('name', 'like', `%${name}%`)
            }
            if (status) {
                query = query.where('status', status)
            }
            const page = request.input('page', 1)
            const limit = request.input('limit', 10)
            const results = await query.paginate(page, limit)

            return response.send(Response('Get All Complaints with Pagination', results))
        } catch (error) {
            return response.status(500).send(Response('internal server error', error))
        }

    }
}

