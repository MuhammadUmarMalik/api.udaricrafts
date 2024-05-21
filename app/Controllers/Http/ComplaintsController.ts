import { Response } from 'App/Utils/ApiUtil';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Complaint from 'App/Models/Complaint';
import ComplaintValidator from 'App/Validators/ComplaintValidator';
import { PaginationUtil } from 'App/Utils/PaginationUtil';
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

    public async pagination({ request, response }: HttpContextContract) {
        try {
            const { page, page_size, filter, sort } = request.body();
            const query = Complaint.query();
            const paginationOptions = {
                page: page,
                pageSize: page_size,
                filter,
                sort,
            };
            const paginatedData = await PaginationUtil(query, paginationOptions, response);
            return response.send(Response('Get All Complaints with Pagination', paginatedData))
        } catch (error) {
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
            return response.status(500).json({ message: 'Failed to send email', error: error.message })
        }
    }
}
