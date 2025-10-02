import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { Response } from 'App/Utils/ApiUtil'
export default class AdminDashboardController {
    public async getStatistics({ response }: HttpContextContract) {
        try {
            // Get total counts
            const [
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue,
                productsLastMonth,
                ordersLastMonth,
                usersLastMonth,
                revenueLastMonth,
                productsThisMonth,
                ordersThisMonth,
                usersThisMonth,
                revenueThisMonth,
                recentOrders,
                lowStockProducts,
                recentReviews,
                last7DaysRevenue,
                ordersByStatus,
                productsByCategory
            ] = await Promise.all([
                // Total counts
                Database.from('products').count('* as total'),
                Database.from('orders').count('* as total'),
                Database.from('users').count('* as total'),
                Database.from('orders').sum('total as total'),
                
                // Last month data (MySQL compatible)
                Database.from('products')
                    .whereRaw('YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .whereRaw('MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .whereRaw('MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .count('* as total'),
                Database.from('users')
                    .whereRaw('YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .whereRaw('MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .whereRaw('MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))')
                    .sum('total as total'),
                
                // This month data (MySQL compatible)
                Database.from('products')
                    .whereRaw('YEAR(created_at) = YEAR(NOW())')
                    .whereRaw('MONTH(created_at) = MONTH(NOW())')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('YEAR(created_at) = YEAR(NOW())')
                    .whereRaw('MONTH(created_at) = MONTH(NOW())')
                    .count('* as total'),
                Database.from('users')
                    .whereRaw('YEAR(created_at) = YEAR(NOW())')
                    .whereRaw('MONTH(created_at) = MONTH(NOW())')
                    .count('* as total'),
                Database.from('orders')
                    .whereRaw('YEAR(created_at) = YEAR(NOW())')
                    .whereRaw('MONTH(created_at) = MONTH(NOW())')
                    .sum('total as total'),
                
                // Recent activity
                Database.from('orders')
                    .select('id', 'order_number', 'created_at')
                    .orderBy('created_at', 'desc')
                    .limit(5),
                Database.from('products')
                    .select('id', 'name', 'quantity')
                    .where('quantity', '<', 10)
                    .orderBy('quantity', 'asc')
                    .limit(5),
                Database.from('reviews')
                    .select('id', 'product_id', 'name', 'rating', 'created_at')
                    .orderBy('created_at', 'desc')
                    .limit(5),
                
                // Chart data: Last 7 days revenue
                Database.raw(`
                    SELECT 
                        DATE(created_at) as date,
                        SUM(total) as revenue,
                        COUNT(*) as orders
                    FROM orders
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    GROUP BY DATE(created_at)
                    ORDER BY date ASC
                `),
                
                // Chart data: Orders by status
                Database.from('orders')
                    .select('status')
                    .count('* as count')
                    .groupBy('status'),
                
                // Chart data: Products by category
                Database.raw(`
                    SELECT 
                        c.name as category,
                        COUNT(p.id) as count
                    FROM products p
                    LEFT JOIN categories c ON p.category_id = c.id
                    GROUP BY c.id, c.name
                    ORDER BY count DESC
                `)
            ])

            // Calculate percentage changes
            const calculateChange = (current: number, previous: number) => {
                if (previous === 0) return current > 0 ? 100 : 0
                return ((current - previous) / previous * 100).toFixed(1)
            }

            const stats = {
                totalProducts: Number(totalProducts[0].total) || 0,
                totalOrders: Number(totalOrders[0].total) || 0,
                totalUsers: Number(totalUsers[0].total) || 0,
                totalRevenue: Number(totalRevenue[0].total) || 0,
                
                productsChange: calculateChange(
                    Number(productsThisMonth[0].total) || 0,
                    Number(productsLastMonth[0].total) || 0
                ),
                ordersChange: calculateChange(
                    Number(ordersThisMonth[0].total) || 0,
                    Number(ordersLastMonth[0].total) || 0
                ),
                usersChange: calculateChange(
                    Number(usersThisMonth[0].total) || 0,
                    Number(usersLastMonth[0].total) || 0
                ),
                revenueChange: calculateChange(
                    Number(revenueThisMonth[0].total) || 0,
                    Number(revenueLastMonth[0].total) || 0
                ),
                
                recentOrders: recentOrders,
                lowStockProducts: lowStockProducts,
                recentReviews: recentReviews,
                
                // Chart data
                revenueChart: last7DaysRevenue[0] || [],
                orderStatusChart: ordersByStatus.map((item: any) => ({
                    status: item.status || 'Unknown',
                    count: Number(item.count) || 0
                })),
                categoryChart: productsByCategory[0] || []
            }

            return response.send(Response("Statistics", stats))
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
