// start/app/Controllers/Http/OrderController.ts
import Mail from '@ioc:Adonis/Addons/Mail'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
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

const stripe = new Stripe(Env.get('STRIPE_SECRET_KEY', 'sk_test_default'), {
    apiVersion: Env.get('STRIPE_API_VERSION', '2023-10-16') as any,
})

export default class OrderController {
    public async updateOrderStatus({ request, params, response }: HttpContextContract) {
        const orderId = params.id
        const { status } = request.only(['status'])

        const trx = await Database.transaction()

        try {
            const order = await Order.query({ client: trx })
                .where('id', orderId)
                .preload('orderItems')
                .firstOrFail()

            const oldStatus = order.status

            // If order is being cancelled, restore stock
            if (status === 'cancelled' && oldStatus !== 'cancelled') {
                console.log('🔄 Restoring stock for cancelled order:', order.order_number)

                for (const orderItem of order.orderItems) {
                    const product = await Product.query({ client: trx })
                        .where('id', orderItem.productId)
                        .forUpdate()
                        .firstOrFail()

                    const newQuantity = product.quantity + orderItem.quantity
                    product.quantity = newQuantity
                    await product.useTransaction(trx).save()

                    console.log(`  ↩️  ${product.name}: ${product.quantity - orderItem.quantity} → ${newQuantity} (+${orderItem.quantity} restored)`)
                }
            }

            // If order was cancelled and is being reactivated, reduce stock again
            if (oldStatus === 'cancelled' && status !== 'cancelled') {
                console.log('🔄 Reducing stock for reactivated order:', order.order_number)

                for (const orderItem of order.orderItems) {
                    const product = await Product.query({ client: trx })
                        .where('id', orderItem.productId)
                        .forUpdate()
                        .firstOrFail()

                    // Check if sufficient stock is available
                    if (product.quantity < orderItem.quantity) {
                        await trx.rollback()
                        return response.status(400).json({ 
                            message: `Cannot reactivate order. Insufficient stock for "${product.name}". Available: ${product.quantity}, Required: ${orderItem.quantity}` 
                        })
                    }

                    const newQuantity = product.quantity - orderItem.quantity
                    product.quantity = newQuantity
                    await product.useTransaction(trx).save()

                    console.log(`  ⬇️  ${product.name}: ${product.quantity + orderItem.quantity} → ${newQuantity} (-${orderItem.quantity})`)
                }
            }

            // Update order status
            order.status = status
            await order.useTransaction(trx).save()

            await trx.commit()
            
            console.log('✅ Order status updated:', order.order_number, '→', status)

            // Send notification email
            try {
                const statusMessages: Record<string, string> = {
                    'pending': 'is being processed',
                    'processing': 'is being prepared',
                    'shipped': 'has been shipped',
                    'delivered': 'has been delivered',
                    'cancelled': 'has been cancelled'
                }

                await Mail.send((message) => {
                    message
                        .to(order.email)
                        .from('no-reply@yourstore.com')
                        .subject(`Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Udari Crafts`)
                        .html(`
                    <h1>Order Status Update</h1>
                    <p>Dear ${order.name},</p>
                    <p>Your order <strong>${order.order_number}</strong> ${statusMessages[status] || status}.</p>
                    ${status === 'cancelled' ? '<p><em>Your product quantities have been restored to inventory.</em></p>' : ''}
                    <p><strong>Order Total:</strong> Rs ${order.total.toLocaleString()}</p>
                    <p>Thank you for shopping with us!</p>
                    <br>
                    <h3>Best Regards,<br>Udari Crafts Team</h3>
                  `)
                })
            } catch (emailError) {
                console.error('⚠️ Email notification failed:', emailError)
            }

            return response.status(200).json({ 
                message: 'Order status updated successfully', 
                order,
                stockRestored: status === 'cancelled' && oldStatus !== 'cancelled'
            })

        } catch (error) {
            await trx.rollback()
            console.error('❌ Failed to update order status:', error)
            
            return response.status(500).json({ 
                message: 'Failed to update order status', 
                error: error.message 
            })
        }
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

        // Use database transaction for atomicity
        const trx = await Database.transaction()

        try {
            // Fetch products from the database with lock (for concurrency safety)
            const productIds = products.map(p => p.productId)
            const productList = await Product.query({ client: trx })
                .whereIn('id', productIds)
                .forUpdate() // Lock rows to prevent race conditions

            console.log('📦 Processing order with products:', productIds)

            // Validate stock availability and calculate total price
            let totalPrice = 0
            const stockUpdates: { product: Product; ordered: number; remaining: number }[] = []

            for (let product of products) {
                const foundProduct = productList.find(p => p.id === product.productId)
                
                if (!foundProduct) {
                    await trx.rollback()
                    return response.status(404).json({ 
                        message: `Product with ID ${product.productId} not found` 
                    })
                }

                if (foundProduct.quantity < product.buyingQuantity) {
                    await trx.rollback()
                    return response.status(400).json({ 
                        message: `Insufficient stock for "${foundProduct.name}". Available: ${foundProduct.quantity}, Requested: ${product.buyingQuantity}` 
                    })
                }

                // Calculate price with discount
                const discountedPrice = foundProduct.price - (foundProduct.price * foundProduct.discount / 100)
                const itemTotal = discountedPrice * product.buyingQuantity
                totalPrice += itemTotal

                stockUpdates.push({
                    product: foundProduct,
                    ordered: product.buyingQuantity,
                    remaining: foundProduct.quantity - product.buyingQuantity
                })

                console.log(`  ✅ ${foundProduct.name}: ${foundProduct.quantity} → ${foundProduct.quantity - product.buyingQuantity} (ordered: ${product.buyingQuantity})`)
            }

            // Update product quantities (AUTOMATIC STOCK MANAGEMENT)
            for (let update of stockUpdates) {
                update.product.quantity = update.remaining
                await update.product.useTransaction(trx).save()
            }

            console.log('💰 Total order amount: Rs', totalPrice)

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
            }, { client: trx })

            // Create payment detail
            await PaymentDetail.create({
                orderId: newOrder.id,
                amount: totalPrice,
                type: 'card',
                status: 'pending'
            }, { client: trx })

            // Create order items
            for (const product of products) {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (foundProduct) {
                    await OrderItem.create({
                        orderId: newOrder.id,
                        productId: product.productId,
                        item_name: foundProduct.name,
                        quantity: product.buyingQuantity,
                    }, { client: trx })
                }
            }

            // Commit transaction - all changes are now permanent
            await trx.commit()
            
            console.log('✅ Order created successfully:', orderNumber)
            console.log('📧 Sending confirmation email...')

            // Load order items for email
            await newOrder.load('orderItems')

            // Build order items HTML
            const orderItemsHtml = products.map((product) => {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (!foundProduct) return ''
                
                const discountedPrice = foundProduct.price - (foundProduct.price * foundProduct.discount / 100)
                const itemTotal = discountedPrice * product.buyingQuantity
                
                return `
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #eeeeee;">
                            <div style="font-weight: 600; color: #333333; margin-bottom: 4px;">${foundProduct.name}</div>
                            <div style="font-size: 13px; color: #666666;">Qty: ${product.buyingQuantity}</div>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #eeeeee; text-align: right;">
                            <div style="font-weight: 600; color: #333333;">Rs ${discountedPrice.toLocaleString()}</div>
                            ${foundProduct.discount > 0 ? `<div style="font-size: 12px; color: #10b981;">-${foundProduct.discount}% off</div>` : ''}
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 600; color: #333333;">
                            Rs ${itemTotal.toLocaleString()}
                        </td>
                    </tr>
                `
            }).join('')

            // Send confirmation email (outside transaction)
            try {
                await Mail.send((message) => {
                    message
                        .to(email)
                        .from('no-reply@udaricrafts.com', 'Udari Crafts')
                        .subject(`Order Confirmation #${orderNumber.slice(0, 8)} - Udari Crafts`)
                        .html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Udari Crafts</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Handcrafted with Love</p>
                        </td>
                    </tr>

                    <!-- Success Message -->
                    <tr>
                        <td style="padding: 40px 30px 30px; text-align: center;">
                            <div style="width: 80px; height: 80px; margin: 0 auto 20px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 28px; font-weight: 700;">Order Confirmed!</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 16px;">Thank you for your order, ${name}</p>
                        </td>
                    </tr>

                    <!-- Order Details -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Order Number</span><br>
                                                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">#${orderNumber.slice(0, 13)}...</span>
                                                </td>
                                                <td style="padding: 8px 0; text-align: right;">
                                                    <span style="color: #6b7280; font-size: 14px;">Order Date</span><br>
                                                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6b7280; font-size: 14px;">Status</span><br>
                                                    <span style="display: inline-block; margin-top: 4px; padding: 4px 12px; background-color: #fef3c7; color: #92400e; border-radius: 12px; font-size: 13px; font-weight: 600;">Pending</span>
                                                </td>
                                                <td style="padding: 8px 0; text-align: right;">
                                                    <span style="color: #6b7280; font-size: 14px;">Total Amount</span><br>
                                                    <span style="color: #10b981; font-size: 24px; font-weight: 700;">Rs ${totalPrice.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Items -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Order Items</h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f9fafb;">
                                        <th style="padding: 15px; text-align: left; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                                        <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                                        <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderItemsHtml}
                                    <tr style="background-color: #f9fafb;">
                                        <td colspan="2" style="padding: 20px; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                                            Subtotal:
                                        </td>
                                        <td style="padding: 20px; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                                            Rs ${totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr style="background-color: #f9fafb;">
                                        <td colspan="2" style="padding: 0 20px 20px 20px; text-align: right; color: #6b7280; font-size: 14px;">
                                            Shipping:
                                        </td>
                                        <td style="padding: 0 20px 20px 20px; text-align: right; color: #10b981; font-weight: 600; font-size: 14px;">
                                            Free
                                        </td>
                                    </tr>
                                    <tr style="background-color: #667eea;">
                                        <td colspan="2" style="padding: 20px; text-align: right; font-weight: 700; color: #ffffff; font-size: 18px;">
                                            Total:
                                        </td>
                                        <td style="padding: 20px; text-align: right; font-weight: 700; color: #ffffff; font-size: 18px;">
                                            Rs ${totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping Information -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Shipping Information</h3>
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                                <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">${name}</p>
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${email}</p>
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${phone}</p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">${address}</p>
                            </div>
                        </td>
                    </tr>

                    <!-- What's Next -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">What's Next?</h3>
                            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                    🔸 We're processing your order<br>
                                    🔸 You'll receive a shipping notification soon<br>
                                    🔸 Track your order status anytime<br>
                                    🔸 Estimated delivery: 3-5 business days
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Support -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                                Need help? Contact us anytime
                            </p>
                            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 10px;">
                                        <a href="mailto:support@udaricrafts.com" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
                                            📧 Email Support
                                        </a>
                                    </td>
                                    <td style="padding: 0 10px; border-left: 1px solid #e5e7eb;">
                                        <a href="tel:+923001234567" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
                                            📞 Call Us
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                                Thank you for shopping with Udari Crafts!
                            </p>
                            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} Udari Crafts. All rights reserved.
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                                <span style="color: #4b5563;">•</span>
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 12px;">Terms of Service</a>
                                <span style="color: #4b5563;">•</span>
                                <a href="#" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 12px;">Contact Us</a>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                        `)
                })
            } catch (emailError) {
                console.error('⚠️ Email sending failed:', emailError)
                // Don't fail the order if email fails
            }

            return response.status(201).send(Response('Order created successfully', {
                order: newOrder,
                message: 'Stock has been automatically updated'
            }))

        } catch (error) {
            // Rollback transaction on any error
            await trx.rollback()
            console.error('❌ Order creation failed:', error)
            
            return response.status(500).json({ 
                message: 'An error occurred while processing your order', 
                error: error.message 
            })
        }
    }

    public async pagination({ request, response }: HttpContextContract) {
        try {
            const { date, name, status } = request.qs()
            let query = Order.query()
                .preload('paymentDetails')
                .preload('orderItems', (orderItemsQuery) => {
                    orderItemsQuery.preload('product')
                })
            
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

            // Serialize the results
            const serialized = results.serialize({
                fields: {
                    pick: ['id', 'order_number', 'total', 'name', 'email', 'phone', 'address', 'status', 'createdAt', 'updatedAt']
                },
                relations: {
                    paymentDetails: {
                        fields: ['id', 'status', 'amount', 'type']
                    },
                    orderItems: {
                        fields: ['id', 'item_name', 'quantity', 'productId'],
                        relations: {
                            product: {
                                fields: ['id', 'name', 'price']
                            }
                        }
                    }
                }
            })

            // Transform the results to include payment_status at the order level
            const transformedResults = {
                ...serialized,
                data: serialized.data.map((order: any) => ({
                    ...order,
                    payment_status: order.paymentDetails?.[0]?.status || 'pending'
                }))
            }

            console.log('📦 Loaded orders with items:', transformedResults.data.length)
            console.log('📋 Sample order items:', transformedResults.data[0]?.orderItems)

            return response.send(Response('Get All Orders with Pagination', transformedResults))
        } catch (error) {
            console.error('❌ Error loading orders:', error)
            return response.status(400).send(error);
        }
    }

    public async createCheckoutSession({ params, response }: HttpContextContract) {
        try {
            // Fetch the order and its items
            const orderId = params.id
            console.log('📦 Creating checkout session for order ID:', orderId)
            
            const order = await Order.query().where('id', orderId).preload('orderItems', (query) => {
                query.preload('product')
            }).firstOrFail()

            console.log('✅ Order found:', order.order_number, 'Total:', order.total)
            console.log('📦 Order items count:', order.orderItems.length)

            // Validate order has items
            if (!order.orderItems || order.orderItems.length === 0) {
                console.error('❌ Order has no items')
                return response.status(400).json({ 
                    error: 'Order has no items',
                    message: 'Cannot create checkout session for empty order'
                })
            }

            // Prepare line items for the checkout session
            const lineItems = order.orderItems.map((orderItem) => {
                console.log(`  - ${orderItem.product.name}: Rs ${orderItem.product.price} x ${orderItem.quantity}`)
                return {
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: orderItem.product.name,
                            description: `Order: ${order.order_number}`,
                        },
                        unit_amount: Math.round(orderItem.product.price * 100), // Stripe expects amount in cents (paisa)
                    },
                    quantity: orderItem.quantity,
                }
            })

            console.log('💳 Creating Stripe checkout session...')

            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${Env.get('FRONTEND_URL', 'http://localhost:5173')}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
                cancel_url: `${Env.get('FRONTEND_URL', 'http://localhost:5173')}/payment/cancel?order_id=${orderId}`,
                customer_email: order.email,
                metadata: {
                    order_id: orderId.toString(),
                    order_number: order.order_number,
                },
            })

            console.log('✅ Stripe session created:', session.id)

            // Update the payment details with the Stripe session ID
            const paymentDetail = await PaymentDetail.query().where('order_id', orderId).firstOrFail()
            paymentDetail.stripeSessionID = session.id
            paymentDetail.status = 'pending' // Keep pending until payment is confirmed
            await paymentDetail.save()

            console.log('✅ Payment detail updated with session ID')
            console.log('🔗 Checkout URL:', session.url)

            return response.status(201).json({
                success: true,
                id: session.id,
                url: session.url,
                order_id: orderId,
                order_number: order.order_number
            })
        } catch (error) {
            console.error('❌ Failed to create checkout session:', error)
            console.error('Error details:', error.stack)
            
            // Check for specific Stripe errors
            if (error.type === 'StripeInvalidRequestError') {
                return response.status(400).json({ 
                    error: 'Invalid payment request',
                    message: error.message,
                    details: 'Please check your Stripe configuration'
                })
            }

            if (error.type === 'StripeAuthenticationError') {
                return response.status(401).json({ 
                    error: 'Stripe authentication failed',
                    message: 'Invalid Stripe API key. Please check your .env file',
                    details: error.message
                })
            }

            return response.status(500).json({ 
                error: 'Failed to create checkout session',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
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

    public async verifyPayment({ request, response }: HttpContextContract) {
        try {
            const { session_id, order_id } = request.qs()

            if (!session_id || !order_id) {
                console.error('❌ Missing parameters - session_id:', session_id, 'order_id:', order_id)
                return response.status(400).json({ 
                    success: false,
                    message: 'Missing session_id or order_id' 
                })
            }

            console.log('🔍 Verifying payment for order:', order_id, 'session:', session_id)

            // Retrieve the session from Stripe
            const session = await stripe.checkout.sessions.retrieve(session_id)

            console.log('💳 Stripe session status:', session.payment_status)
            console.log('💳 Stripe session payment_intent:', session.payment_intent)

            // Check if payment was successful
            if (session.payment_status === 'paid') {
                // Find the payment detail - try with stripeSessionID first
                let paymentDetail = await PaymentDetail.query()
                    .where('order_id', order_id)
                    .whereNotNull('stripe_session_id')
                    .first()

                if (!paymentDetail) {
                    // If not found with session check, try just by order_id
                    paymentDetail = await PaymentDetail.query()
                        .where('order_id', order_id)
                        .first()
                }

                if (!paymentDetail) {
                    console.error('❌ Payment detail not found for order:', order_id)
                    return response.status(404).json({
                        success: false,
                        message: 'Payment detail not found for this order'
                    })
                }

                // Verify the session ID matches if it was previously set
                if (paymentDetail.stripeSessionID && paymentDetail.stripeSessionID !== session_id) {
                    console.error('❌ Session ID mismatch. Expected:', paymentDetail.stripeSessionID, 'Got:', session_id)
                    return response.status(400).json({
                        success: false,
                        message: 'Session ID mismatch - potential fraud attempt'
                    })
                }

                // Update payment status to paid
                paymentDetail.status = 'paid'
                paymentDetail.stripeSessionID = session_id // Ensure it's set
                await paymentDetail.save()

                console.log('✅ Payment detail updated:', paymentDetail.id)

                // Get the order for the response
                const order = await Order.query()
                    .where('id', order_id)
                    .firstOrFail()

                console.log('✅ Payment verified and status updated to paid for order:', order.order_number)

                return response.status(200).json({
                    success: true,
                    message: 'Payment verified successfully',
                    order: {
                        id: order.id,
                        order_number: order.order_number,
                        total: order.total,
                        status: order.status
                    },
                    payment_status: 'paid'
                })
            } else {
                console.log('⚠️ Payment not completed. Status:', session.payment_status)
                
                return response.status(400).json({
                    success: false,
                    message: 'Payment not completed',
                    payment_status: session.payment_status
                })
            }
        } catch (error) {
            console.error('❌ Payment verification failed:', error)
            console.error('Error details:', error.stack)
            
            return response.status(500).json({
                success: false,
                message: 'Payment verification failed',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        }
    }

    // Get authenticated user's orders
    public async getUserOrders({ auth, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }

            const orders = await Order.query()
                .where('email', user.email)
                .preload('orderItems', (orderItemsQuery) => {
                    orderItemsQuery.preload('product')
                })
                .preload('paymentDetails')
                .orderBy('created_at', 'desc')

            return response.send(Response('User orders fetched successfully', orders))
        } catch (error) {
            console.error('❌ Error fetching user orders:', error)
            return response.status(500).json({ 
                message: 'Failed to fetch user orders', 
                error: error.message 
            })
        }
    }
}



