import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { Response } from 'App/Utils/ApiUtil'
export default class AdminDashboardController {
    public async getStatistics({ response }: HttpContextContract) {
        try {
            const [productsMonth, productsYear, ordersMonth, ordersYear, earningsMonth, earningsYear] = await Promise.all([
                Database.from('products')
                    .whereRaw('extract(month from created_at) = extract(month from now())')
                    .count('* as total'),
                Database.from('products')
                    .whereRaw('extract(year from created_at) = extract(year from now())')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('extract(month from created_at) = extract(month from now())')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('extract(year from created_at) = extract(year from now())')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('extract(month from created_at) = extract(month from now())')
                    .sum('total as total'),
                Database.from('orders')
                    .whereRaw('extract(year from created_at) = extract(year from now())')
                    .sum('total as total')
            ])

            const totalProductsCurrentMonth = productsMonth[0].total || 0
            const totalProductsCurrentYear = productsYear[0].total || 0
            const totalOrdersCurrentMonth = ordersMonth[0].total || 0
            const totalOrdersCurrentYear = ordersYear[0].total || 0
            const totalEarningsCurrentMonth = earningsMonth[0].total || 0
            const totalEarningsCurrentYear = earningsYear[0].total || 0

            return response.send(Response("Statistics", {
                totalProductsCurrentMonth,
                totalProductsCurrentYear,
                totalOrdersCurrentMonth,
                totalOrdersCurrentYear,
                totalEarningsCurrentMonth,
                totalEarningsCurrentYear
            }))
        } catch (error) {
            console.error(error)
            return response.status(500).send({ message: 'Internal server error' })
        }
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
