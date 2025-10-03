import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from 'App/Models/Notification'
import { Response } from 'App/Utils/ApiUtil'
export default class NotificationsController {
    public async create({ request, response }: HttpContextContract) {
        const data = request.only(['type', 'description'])
        const notification = await Notification.create(data)
        return response.send(Response('Notification created Successfully', notification))
    }

    public async markAsRead({ params, response }: HttpContextContract) {
        const notification = await Notification.findOrFail(params.id)
        notification.read = true
        await notification.save()
        return response.send(Response('Notification mark as read Successfully', notification))
    }

    public async markAllAsRead({ response }: HttpContextContract) {
        await Notification.query().where('read', false).update({ read: true })
        return response.status(200).send({ message: 'All notifications marked as read' })
    }

    public async getUnread({ response }: HttpContextContract) {
        const unreadNotifications = await Notification.query().where('read', false)
        return response.status(200).json(unreadNotifications)
    }

    public async index({ response }: HttpContextContract) {
        try {
            const notifications = await Notification.query().orderBy('created_at', 'desc')
            return response.send(Response('Get All Notifications Successfully', notifications))
        } catch (error) {
            return response.status(500).send(Response('Failed to get notifications', error))
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const notification = await Notification.findOrFail(params.id)
            await notification.delete()
            return response.send(Response('Notification Deleted Successfully', notification))
        } catch (error) {
            return response.status(404).send(Response('Notification not found', error))
        }
    }
}
