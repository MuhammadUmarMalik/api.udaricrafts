// start/app/Controllers/Http/OrderController.ts
import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import OrderItem from 'App/Models/OrderItem'
import PaymentDetail from 'App/Models/PaymentDetail'
import Product from 'App/Models/Product'
// import OrderValidator from 'App/Validators/OrderValidator'
import { v4 as uuidv4 } from 'uuid'


export default class OrderController {
    public async updateOrderStatus({ request, params, response }: HttpContextContract) {
        const orderId = params.id
        const { status } = request.only(['status'])

        const order = await Order.find(orderId)
        if (!order) {
            return response.status(404).json({ message: 'Order not found' })
        }

        order.status = status
        await order.save()

        return response.status(200).json({ message: 'Order status updated successfully', order })
    }

    public async updatePaymentStatus({ request, params, response }: HttpContextContract) {
        const orderId = params.id
        const { status } = request.only(['status'])

        const paymentDetail = await PaymentDetail.findBy('order_id', orderId)
        if (!paymentDetail) {
            return response.status(404).json({ message: 'Payment details not found' })
        }

        paymentDetail.status = status
        await paymentDetail.save()

        return response.status(200).json({ message: 'Payment status updated successfully', paymentDetail })
    }

    public async getOrderDetails({ params, response }: HttpContextContract) {
        const orderNumber = params.order_number

        const order = await Order.query()
            .where('order_number', orderNumber)
            .preload('orderItems')
            .preload('paymentDetails')
            .first()

        if (!order) {
            return response.status(404).json({ message: 'Order not found' })
        }

        return response.status(200).json({ message: 'Order details fetched successfully', order })
    }

    public async store({ request, response }: HttpContextContract) {
        const { name, email, phone, address, products } = request.only(['name', 'email', 'phone', 'address', 'products'])

        if (!Array.isArray(products) || products.length === 0) {
            return response.status(400).json({ message: 'Products are required and must be an array' })
        }

        try {
            // Fetch products from the database
            const productIds = products.map(p => p.productId)
            const productList = await Product.query().whereIn('id', productIds)

            // Check if all requested products are available in sufficient quantity
            let totalPrice = 0
            for (let product of products) {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (!foundProduct || foundProduct.quantity < product.buyingQuantity) {
                    return response.status(400).json({ message: `Product ${product.name} is not available in the requested quantity` })
                }
                // Calculate total price
                totalPrice += foundProduct.price * product.buyingQuantity
            }

            // Update product quantities
            for (let product of products) {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (foundProduct) {
                    foundProduct.quantity -= product.buyingQuantity
                    await foundProduct.save()
                }
            }

            // Create the order
            const orderNumber = uuidv4()
            const newOrder = await Order.create({
                name,
                email,
                phone,
                address,
                order_number: orderNumber,
                total: totalPrice,

            })
            await PaymentDetail.create({
                orderId: newOrder.id,
                amount: totalPrice,
                type: 'cash',
                status: 'pending' // Default status
            })
            // Create order items
            for (let product of products) {
                await OrderItem.create({
                    orderId: newOrder.id,
                    productId: product.productId,
                    quantity: product.buyingQuantity,
                })
            }

            // Send confirmation email
            // const productDetails = products.map(p => `Product name: ${p.name}, Quantity: ${p.buyingQuantity}`).join('<br/>')
            await Mail.send((message) => {
                message
                    .to(email)
                    .from('no-reply@yourstore.com')
                    .subject('Order Confirmation')
                    .html(`
            <h1>Order Confirmation</h1>
            <p>Dear ${name},</p>
            <p>Thank you for your order. Your order number is <br> ${orderNumber}.</p>
            <p>We will notify you once your order is shipped.</p>
            <p>Thank you for shopping with us!</p>
            <h3>Regards: Udari Crafts</h3>
          `)
            })

            return response.status(201).json(newOrder)
        } catch (error) {
            return response.status(500).json({ message: 'An error occurred while processing your order', error: error.message })
        }
    }
}


