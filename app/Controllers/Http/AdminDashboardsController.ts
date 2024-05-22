import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import Order from 'App/Models/Order'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import moment from 'moment'
import { Response } from 'App/Utils/ApiUtil'
export default class AdminDashboardController {

    public async totalProductsCurrentMonth({ response }: HttpContextContract) {
        const count = await Product.query()
            .where('createdAt', '>=', moment().startOf('month').toDate())
            .count('* as total')

        return response.send(Response("Total Product in Current Month:", { total: count[0].$extras.total }))
    }

    public async totalProductsCurrentYear({ response }: HttpContextContract) {
        const count = await Product.query()
            .where('createdAt', '>=', moment().startOf('year').toDate())
            .count('* as total')

        return response.send(Response("Total Product in Current Year:", { total: count[0].$extras.total }))
    }

    public async totalOrdersCurrentMonth({ response }: HttpContextContract) {
        const count = await Order.query()
            .where('createdAt', '>=', moment().startOf('month').toDate())
            .count('* as total')

        return response.send(Response("Total Product in Current Month:", { total: count[0].$extras.total }))
    }

    public async totalOrdersCurrentYear({ response }: HttpContextContract) {
        const count = await Order.query()
            .where('createdAt', '>=', moment().startOf('year').toDate())
            .count('* as total')

        return response.send(Response("Total Product in Current Year:", { total: count[0].$extras.total }))
    }

    public async totalEarningsCurrentMonth({ response }: HttpContextContract) {
        const sum = await Order.query()
            .where('createdAt', '>=', moment().startOf('month').toDate())
            .sum('totalPrice as total')

        response.send(Response("Total Earnings in Current Month: ", { total: sum[0].$extras.total }))
    }

    public async totalEarningsCurrentYear({ response }: HttpContextContract) {
        const sum = await Order.query()
            .where('createdAt', '>=', moment().startOf('year').toDate())
            .sum('totalPrice as total')

        response.send(Response("Total Earnings in Current Year: ", { total: sum[0].$extras.total }))
    }

    public async verifyPassword({ request, response }: HttpContextContract) {
        const { email, password } = request.only(['email', 'password'])
        const admin = await User.findBy('email', email)

        if (!admin) {
            return response.status(404).send({ message: 'Admin not found' })
        }

        const isSame = await Hash.verify(admin.password, password)
        if (!isSame) {
            return response.status(400).send({ message: 'Password mismatch' })
        }

        return response.send({ message: 'Password verified' })
    }

    public async forgotPassword({ request, response }: HttpContextContract) {
        const { email } = request.only(['email'])
        const admin = await User.findBy('email', email)

        if (!admin) {
            return response.status(404).json({ message: 'Admin not found' })
        }

        const newPassword = Math.random().toString(36).slice(-8)
        admin.password = await Hash.make(newPassword)
        await admin.save()
        const { from } = request.only(['to', 'from', 'subject', 'text'])
        await Mail.send((message) => {
            message
                .to(admin.email)
                .from(from, 'Udari Crafts')
                .subject('Your new password')
                .text(`'emails/forgot_password', ${newPassword}`)
        })

        return response.json({ message: 'New password has been sent to your email' })
    }
}
