import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { Response } from 'App/Utils/ApiUtil'
export default class AdminDashboardController {

    public async totalProductsCurrentMonth({ response }: HttpContextContract) {
        try {
            const count = await Database.from('products')
                .whereRaw('extract(month from created_at) = extract(month from now())')
                .count('* as total')

            const totalProductsCurrentMonth = count[0].total || 0
            return response.send(Response("Total Products in Current Month", { totalProductsCurrentMonth }))

        } catch (error) {
            console.error(error)
            return response.status(500).send({ message: 'Internal server error' })
        }
    }

    public async totalProductsCurrentYear({ response }: HttpContextContract) {
        try {
            const count = await Database.from('products')
                .whereRaw('extract(year from created_at) = extract(year from now())')
                .count('* as total')

            const totalProductsCurrentYear = count[0].total || 0

            return response.send(Response("Total Products in Current Year", { totalProductsCurrentYear }))
        } catch (error) {
            return response.status(500).send({ message: 'Internal server error' })
        }
    }

    public async totalOrdersCurrentMonth({ response }: HttpContextContract) {
        try {
            const count = await Database.from('orders')
                .whereRaw('extract(month from created_at) = extract(month from now())')
                .count('* as total')

            const totalOrdersCurrentMonth = count[0].total || 0
            return response.send(Response("Total Orders in Current Month", { totalOrdersCurrentMonth }))
        } catch (error) {
            return response.status(500).send({ message: 'Internal server error' })
        }
    }

    public async totalOrdersCurrentYear({ response }: HttpContextContract) {
        try {
            const count = await Database.from('orders')
                .whereRaw('extract(year from created_at) = extract(year from now())')
                .count('* as total')

            const totalOrdersCurrentYear = count[0].total || 0

            return response.send(Response("Total Orders in Current Year", { totalOrdersCurrentYear }))
        } catch (error) {
            return response.status(500).send({ message: 'Internal server error' })
        }
    }

    public async totalEarningsCurrentMonth({ response }: HttpContextContract) {
        try {
            const sum = await Database.from('orders')
                .whereRaw('extract(month from created_at) = extract(month from now())')
                .sum('total as total')

            const totalEarningsCurrentMonth = sum[0].total || 0

            return response.send(Response("Total Earnings in Current Month", { totalEarningsCurrentMonth }))
        } catch (error) {
            return response.status(500).send({ message: 'Internal server error' })
        }
    }

    public async totalEarningsCurrentYear({ response }: HttpContextContract) {
        try {
            const sum = await Database.from('orders')
                .whereRaw('extract(year from created_at) = extract(year from now())')
                .sum('total as total')

            const totalEarningsCurrentYear = sum[0].total || 0

            return response.send(Response("Total Earnings in Current Year", { totalEarningsCurrentYear }))
        } catch (error) {
            return response.status(500).send({ message: 'Internal server error' })
        }
    }
}