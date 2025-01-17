// start/app/Controllers/Http/OrderController.ts
import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import OrderItem from 'App/Models/OrderItem'
import PaymentDetail from 'App/Models/PaymentDetail'
import Product from 'App/Models/Product'
// import OrderValidator from 'App/Validators/OrderValidator'
import { v4 as uuidv4 } from 'uuid'
import { Response } from 'App/Utils/ApiUtil'
import Stripe from 'stripe'
import Env from '@ioc:Adonis/Core/Env';
import axios from 'axios'
import crypto from 'crypto'

const stripe = new Stripe(Env.get('STRIPE_SECRET_KEY'), {
    apiVersion: Env.get('STRIPE_API_VERSION'),
})

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
        await Mail.send((message) => {
            message
                .to(order.email)
                .from('no-reply@yourstore.com')
                .subject('Order Confirmation')
                .html(`
            <h1>Order Confirmation</h1>
            <p>Dear ${order.name},</p>
            <p>Thank you for your order. Your order number is <br> ${order.order_number}.</p>
            <p>We will notify you once your order is ${order.status}.</p>
            <p>Thank you for shopping with us!</p>
            <h3>Regards: Udari Crafts</h3>
          `)
        })

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

        return response.status(200).send(Response('Payment status updated successfully', paymentDetail))
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
                status: 'pending'
            })
            await PaymentDetail.create({
                orderId: newOrder.id,
                amount: totalPrice,
                type: 'card',
                status: 'pending' // Default status
            })
            // Create order items
            for (const product of products) {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (foundProduct) {
                    await OrderItem.create({
                        orderId: newOrder.id,
                        productId: product.productId,
                        item_name: foundProduct.name, // Include the product name
                        quantity: product.buyingQuantity,
                    })
                }
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
            <p>We will notify you once your order is  ${newOrder.status}.</p>
            <p>Thank you for shopping with us!</p>
            <h3>Regards: Udari Crafts</h3>
          `)
            })
            return response.send(Response('your order ', newOrder));
        } catch (error) {
            return response.status(500).json({ message: 'An error occurred while processing your order', error: error.message })
        }
    }

    public async pagination({ request, response }: HttpContextContract) {
        try {
            const { date, name, status } = request.qs()
            let query = Order.query()
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

            return response.send(Response('Get All Product with Pagination', results))
        } catch (error) {
            return response.status(400).send(error);
        }
    }

    public async createCheckoutSession({ params, response }: HttpContextContract) {
        try {
            // Fetch the order and its items
            const orderId = params.id
            const order = await Order.query().where('id', orderId).preload('orderItems', (query) => {
                query.preload('product')
            }).firstOrFail()

            // Prepare line items for the checkout session
            const lineItems = order.orderItems.map((orderItem) => ({
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: orderItem.product.name,
                    },
                    unit_amount: orderItem.product.price * 100, // Stripe expects the amount in cents
                },
                quantity: orderItem.quantity,
            }))

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
                cancel_url: `https://yourdomain.com/cancel?order_id=${orderId}`,
            })

            // Update the payment details with the Stripe session ID

            const paymentDetail = await PaymentDetail.query().where('order_id', orderId).firstOrFail()
            paymentDetail.stripeSessionID = session.id
            paymentDetail.status = 'paid' // Update the status if needed
            await paymentDetail.save()

            return response.status(201).json({
                id: session.id,
                url: session.url,
            })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ error: error.message })
        }
    }

    public async createJazzCashCheckout({ params, response }: HttpContextContract) {
        try {
            const orderId = params.id

            // Find the order by ID
            const order = await Order.find(orderId)
            if (!order) {
                return response.status(404).json({ message: 'Order not found' })
            }

            const amount = order.total
            const formattedAmount = Number(amount).toFixed(2) // Correct usage of Number constructor
            const txnRefNo = `T${Date.now()}`
            const merchantId = Env.get('JAZZCASH_MERCHANT_ID')
            const password = Env.get('JAZCASH_PASSWORD')
            const returnUrl = Env.get('JAZZCASH_RETURN_URL')
            const secretKey = Env.get('JAZZCASH_SECRET_KEY')

            const data = {
                pp_Version: '1.1',
                pp_TxnType: 'MWALLET',
                pp_Language: 'EN',
                pp_MerchantID: merchantId,
                pp_Password: password,
                pp_TxnRefNo: txnRefNo,
                pp_Amount: `${formattedAmount}00`, // Format the amount properly
                pp_TxnCurrency: 'PKR',
                pp_TxnDateTime: new Date().toISOString(),
                pp_BillReference: 'billRef',
                pp_Description: 'Order Description',
                pp_TxnExpiryDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
                pp_ReturnURL: returnUrl,
                pp_SecureHash: '',
            }

            // Generate secure hash
            const secureHashString = `${secretKey}&${data.pp_Amount}&${data.pp_BillReference}&${data.pp_Description}&${data.pp_Language}&${data.pp_MerchantID}&${data.pp_Password}&${data.pp_ReturnURL}&${data.pp_TxnCurrency}&${data.pp_TxnDateTime}&${data.pp_TxnExpiryDateTime}&${data.pp_TxnRefNo}&${data.pp_TxnType}&${data.pp_Version}`
            const secureHash = crypto.createHash('sha256').update(secureHashString).digest('hex')
            data.pp_SecureHash = secureHash

            const apiResponse = await axios.post('https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction', data)

            if (apiResponse.data.pp_ResponseCode === '000') {
                // Save the transaction ID to PaymentDetail
                const paymentDetail = await PaymentDetail.findBy('order_id', orderId)
                if (paymentDetail) {
                    paymentDetail.jazzCashTransactionId = txnRefNo
                    paymentDetail.status = 'pending'
                    await paymentDetail.save()
                }

                return response.status(201).json({
                    message: 'JazzCash checkout initiated successfully',
                    transactionId: txnRefNo,
                    checkoutUrl: apiResponse.data.pp_RedirectURL,
                })
            } else {
                return response.status(400).json({
                    message: 'JazzCash checkout initiation failed',
                    response: apiResponse.data,
                })
            }
        } catch (error) {
            return response.status(500).json({ message: 'An error occurred', error: error.message })
        }
    }
}



