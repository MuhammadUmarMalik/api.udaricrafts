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
                    'processing': 'is being prepared for shipment',
                    'shipped': 'has been shipped and is on its way',
                    'delivered': 'has been successfully delivered',
                    'cancelled': 'has been cancelled'
                }

                const statusEmojis: Record<string, string> = {
                    'pending': '⏳',
                    'processing': '📦',
                    'shipped': '🚚',
                    'delivered': '✅',
                    'cancelled': '❌'
                }

                const statusColors: Record<string, string> = {
                    'pending': '#fbbf24',
                    'processing': '#3b82f6',
                    'shipped': '#8b5cf6',
                    'delivered': '#10b981',
                    'cancelled': '#ef4444'
                }

                const statusBgColors: Record<string, string> = {
                    'pending': '#fef3c7',
                    'processing': '#dbeafe',
                    'shipped': '#ede9fe',
                    'delivered': '#d1fae5',
                    'cancelled': '#fee2e2'
                }

                await Mail.send((message) => {
                    message
                        .to(order.email)
                        .from('no-reply@udaricrafts.com', 'Udari Crafts')
                        .subject(`${statusEmojis[status]} Order ${status.charAt(0).toUpperCase() + status.slice(1)} - Udari Crafts`)
                        .html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Order Status Update - Udari Crafts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 50px 20px;">
                
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 650px; border-collapse: collapse; background-color: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden;">
                    
                    <!-- Decorative Top Bar -->
                    <tr>
                        <td style="height: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);"></td>
                    </tr>
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0 0 5px 0; color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">Udari Crafts</h1>
                            <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px; font-weight: 500;">✨ Handcrafted with Love ✨</p>
                        </td>
                    </tr>

                    <!-- Status Icon -->
                    <tr>
                        <td style="padding: 45px 40px 25px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);">
                            <div style="width: 90px; height: 90px; margin: 0 auto 20px; background: ${statusColors[status]}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px ${statusColors[status]}40;">
                                <span style="font-size: 48px;">${statusEmojis[status]}</span>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 28px; font-weight: 800;">Order ${status.charAt(0).toUpperCase() + status.slice(1)}!</h2>
                            <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                Hi <strong style="color: #667eea;">${order.name}</strong>,<br>
                                Your order ${statusMessages[status] || status}.
                            </p>
                        </td>
                    </tr>

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, ${statusBgColors[status]} 0%, ${statusBgColors[status]}80 100%); border-radius: 16px; border: 2px solid ${statusColors[status]}40; overflow: hidden;">
                                <tr>
                                    <td style="padding: 28px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <div style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order Number</div>
                                                    <div style="color: #1f2937; font-size: 17px; font-weight: 700; font-family: 'Courier New', monospace;">#${order.order_number.slice(0, 16)}...</div>
                                                </td>
                                                <td style="padding: 8px 0; text-align: right;">
                                                    <div style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order Total</div>
                                                    <div style="color: #10b981; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Rs ${order.total.toLocaleString()}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding: 20px 0 8px 0;">
                                                    <div style="color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Current Status</div>
                                                    <span style="display: inline-block; padding: 10px 20px; background: ${statusColors[status]}; color: #ffffff; border-radius: 20px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 12px ${statusColors[status]}40;">
                                                        ${statusEmojis[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    ${status === 'cancelled' ? `
                    <!-- Cancellation Notice -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #ef4444;">
                                <p style="margin: 0; color: #991b1b; font-size: 15px; font-weight: 600; line-height: 1.6;">
                                    ℹ️ Your order has been cancelled. If you have any questions, please contact our support team.
                                    ${oldStatus !== 'cancelled' ? '<br><br>✓ Product quantities have been restored to inventory.' : ''}
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    ${status === 'shipped' ? `
                    <!-- Shipping Info -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); padding: 24px; border-radius: 12px; border-left: 5px solid #8b5cf6;">
                                <p style="margin: 0 0 12px 0; color: #5b21b6; font-size: 16px; font-weight: 700;">🚚 Your Order is On Its Way!</p>
                                <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.7;">
                                    Your package is being delivered to your address.<br>
                                    Expected delivery: <strong>3-5 business days</strong><br>
                                    You can track your order status anytime.
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    ${status === 'delivered' ? `
                    <!-- Delivery Success -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 24px; border-radius: 12px; border-left: 5px solid #10b981; text-align: center;">
                                <p style="margin: 0 0 12px 0; color: #065f46; font-size: 18px; font-weight: 700;">🎉 Delivered Successfully!</p>
                                <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.7;">
                                    We hope you love your handcrafted items!<br>
                                    Please leave us a review and share your experience.
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    ${status === 'processing' ? `
                    <!-- Processing Info -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 24px; border-radius: 12px; border-left: 5px solid #3b82f6;">
                                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 700;">📦 We're Preparing Your Order</p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.7;">
                                    Our team is carefully preparing your handcrafted items.<br>
                                    You'll receive a shipping notification once your order is dispatched.
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- CTA Buttons -->
                    <tr>
                        <td style="padding: 0 40px 35px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="padding: 0 8px;">
                                        <a href="mailto:support@udaricrafts.com" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 14px; box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);">
                                            💬 Contact Support
                                        </a>
                                    </td>
                                    ${status !== 'cancelled' ? `
                                    <td style="padding: 0 8px;">
                                        <a href="#" style="display: inline-block; padding: 14px 28px; background: #ffffff; color: #667eea; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 14px; border: 2px solid #667eea;">
                                            📦 Track Order
                                        </a>
                                    </td>
                                    ` : ''}
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 35px 40px 25px; text-align: center;">
                            <p style="margin: 0 0 12px 0; color: #d1d5db; font-size: 15px; font-weight: 600;">
                                Thank you for choosing Udari Crafts! 💝
                            </p>
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                                Every purchase supports our artisans and their craft.
                            </p>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 11px;">
                                    © ${new Date().getFullYear()} Udari Crafts. All rights reserved.
                                </p>
                                <div>
                                    <a href="#" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 11px;">Privacy Policy</a>
                                    <span style="color: #4b5563;">•</span>
                                    <a href="#" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none; font-size: 11px;">Contact Us</a>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Bottom Bar -->
                    <tr>
                        <td style="height: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);"></td>
                    </tr>

                </table>
                
                <!-- Footer Text -->
                <p style="margin: 25px 0 0 0; text-align: center; color: #6b7280; font-size: 12px;">
                    This email was sent to ${order.email}
                </p>
                
            </td>
        </tr>
    </table>
</body>
</html>
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

            // Calculate totals for email
            let subtotalBeforeDiscount = 0
            let totalDiscount = 0
            let finalTotal = 0

            // Build order items HTML with pricing details
            const orderItemsHtml = products.map((product, index) => {
                const foundProduct = productList.find(p => p.id === product.productId)
                if (!foundProduct) return ''
                
                const originalPrice = foundProduct.price
                const discountAmount = (foundProduct.price * foundProduct.discount / 100)
                const discountedPrice = foundProduct.price - discountAmount
                const itemSubtotal = originalPrice * product.buyingQuantity
                const itemTotal = discountedPrice * product.buyingQuantity
                const itemDiscountTotal = discountAmount * product.buyingQuantity
                const isLastItem = index === products.length - 1
                
                // Add to totals
                subtotalBeforeDiscount += itemSubtotal
                totalDiscount += itemDiscountTotal
                finalTotal += itemTotal
                
                return `
                    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#fafbfc'};">
                        <td style="padding: 20px; border-bottom: ${isLastItem ? '2px' : '1px'} solid #e5e7eb;">
                            <div style="font-weight: 700; color: #111827; font-size: 15px; margin-bottom: 6px;">${foundProduct.name}</div>
                            <div style="font-size: 13px; color: #6b7280; font-weight: 500;">
                                <span style="display: inline-block; padding: 3px 10px; background-color: #f3f4f6; border-radius: 10px;">
                                    Quantity: <strong style="color: #1f2937;">${product.buyingQuantity}</strong>
                                </span>
                            </div>
                        </td>
                        <td style="padding: 20px; border-bottom: ${isLastItem ? '2px' : '1px'} solid #e5e7eb; text-align: right;">
                            ${foundProduct.discount > 0 ? `
                                <div style="font-size: 13px; color: #9ca3af; text-decoration: line-through; margin-bottom: 4px;">Rs ${originalPrice.toLocaleString()}</div>
                                <div style="font-weight: 700; color: #1f2937; font-size: 15px; margin-bottom: 4px;">Rs ${discountedPrice.toLocaleString()}</div>
                                <div style="display: inline-block; padding: 3px 10px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; border-radius: 10px; font-size: 11px; font-weight: 700;">💰 SAVE ${foundProduct.discount}%</div>
                            ` : `
                                <div style="font-weight: 700; color: #1f2937; font-size: 15px;">Rs ${originalPrice.toLocaleString()}</div>
                            `}
                        </td>
                        <td style="padding: 20px; border-bottom: ${isLastItem ? '2px' : '1px'} solid #e5e7eb; text-align: right;">
                            ${foundProduct.discount > 0 ? `
                                <div style="font-size: 13px; color: #9ca3af; text-decoration: line-through; margin-bottom: 4px;">Rs ${itemSubtotal.toLocaleString()}</div>
                            ` : ''}
                            <div style="font-weight: 800; color: #10b981; font-size: 16px; letter-spacing: -0.3px;">Rs ${itemTotal.toLocaleString()}</div>
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
                        .subject(`🎉 Order Confirmed - Udari Crafts`)
                        .html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Order Confirmation - Udari Crafts</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    
    <!-- Preheader Text (Hidden) -->
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
        Your order has been confirmed! Order Number: ${orderNumber} - Total: Rs ${totalPrice.toLocaleString()}. Save this number to track your order.
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
        <tr>
            <td align="center" style="padding: 50px 20px;">
                
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 650px; border-collapse: collapse; background-color: #ffffff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden;">
                    
                    <!-- Decorative Top Bar -->
                    <tr>
                        <td style="height: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);"></td>
                    </tr>
                    
                    <!-- Header with Brand -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
                            <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 42px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Udari Crafts</h1>
                            <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 17px; font-weight: 500; letter-spacing: 1px;">✨ Handcrafted with Love ✨</p>
                        </td>
                    </tr>

                    <!-- Success Badge -->
                    <tr>
                        <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="width: 90px; height: 90px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); vertical-align: middle; line-height: 90px;">
                                        <span style="font-size: 48px; line-height: 90px;">📦</span>
                                    </td>
                                </tr>
                            </table>
                            <h2 style="margin: 24px 0 12px 0; color: #111827; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Order Confirmed! 🎉</h2>
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 17px; line-height: 1.6;">
                                Hi <strong style="color: #667eea;">${name}</strong>,<br>
                                Thank you for your order! We're excited to start preparing your handcrafted items.
                            </p>
                            
                            <!-- Prominent Order Number for Tracking -->
                            <div style="display: inline-block; padding: 16px 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border: 2px solid #3b82f6; margin-top: 8px;">
                                <p style="margin: 0 0 4px 0; color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Order Number</p>
                                <p style="margin: 0; color: #1e3a8a; font-size: 18px; font-weight: 800; font-family: 'Courier New', monospace; letter-spacing: 0.5px; word-break: break-all;">${orderNumber}</p>
                                <p style="margin: 6px 0 0 0; color: #3b82f6; font-size: 11px; font-weight: 600;">📋 Save this number to track your order</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Order Summary Card -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 16px; border: 2px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <tr>
                                    <td style="padding: 30px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 10px 0; vertical-align: top;">
                                                    <div style="color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order Number</div>
                                                    <div style="color: #1f2937; font-size: 14px; font-weight: 700; font-family: 'Courier New', monospace; word-break: break-all;">${orderNumber}</div>
                                                </td>
                                                <td style="padding: 10px 0; text-align: right; vertical-align: top;">
                                                    <div style="color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Order Date</div>
                                                    <div style="color: #1f2937; font-size: 17px; font-weight: 700;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 18px 0 10px 0; vertical-align: top;">
                                                    <div style="color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Status</div>
                                                    <span style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">⏳ Processing</span>
                                                </td>
                                                <td style="padding: 18px 0 10px 0; text-align: right; vertical-align: top;">
                                                    <div style="color: #9ca3af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Total Amount</div>
                                                    <div style="color: #10b981; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);">Rs ${totalPrice.toLocaleString()}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Items Section -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 700; padding-left: 4px;">📦 Your Order Items</h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);">
                                        <th style="padding: 18px 20px; text-align: left; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb;">Product</th>
                                        <th style="padding: 18px 20px; text-align: right; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                                        <th style="padding: 18px 20px; text-align: right; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orderItemsHtml}
                                    <!-- Subtotal (Original) -->
                                    ${totalDiscount > 0 ? `
                                    <tr style="background-color: #fafbfc;">
                                        <td colspan="2" style="padding: 18px 20px; text-align: right; font-weight: 600; color: #6b7280; font-size: 15px; border-top: 2px solid #e5e7eb;">
                                            Subtotal (Original Price)
                                        </td>
                                        <td style="padding: 18px 20px; text-align: right; font-weight: 600; color: #6b7280; font-size: 16px; border-top: 2px solid #e5e7eb; text-decoration: line-through;">
                                            Rs ${subtotalBeforeDiscount.toLocaleString()}
                                        </td>
                                    </tr>
                                    <!-- Discount -->
                                    <tr style="background-color: #d1fae5;">
                                        <td colspan="2" style="padding: 18px 20px; text-align: right; font-weight: 600; color: #065f46; font-size: 15px;">
                                            💰 Discount Savings
                                        </td>
                                        <td style="padding: 18px 20px; text-align: right; font-weight: 700; color: #065f46; font-size: 16px;">
                                            - Rs ${totalDiscount.toLocaleString()}
                                        </td>
                                    </tr>
                                    <!-- Subtotal After Discount -->
                                    <tr style="background-color: #fafbfc;">
                                        <td colspan="2" style="padding: 18px 20px; text-align: right; font-weight: 600; color: #374151; font-size: 16px;">
                                            Subtotal (After Discount)
                                        </td>
                                        <td style="padding: 18px 20px; text-align: right; font-weight: 700; color: #1f2937; font-size: 17px;">
                                            Rs ${finalTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                    ` : `
                                    <!-- Subtotal -->
                                    <tr style="background-color: #fafbfc;">
                                        <td colspan="2" style="padding: 22px 20px; text-align: right; font-weight: 600; color: #374151; font-size: 16px; border-top: 2px solid #e5e7eb;">
                                            Subtotal
                                        </td>
                                        <td style="padding: 22px 20px; text-align: right; font-weight: 700; color: #1f2937; font-size: 17px; border-top: 2px solid #e5e7eb;">
                                            Rs ${totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                    `}
                                    <!-- Shipping -->
                                    <tr style="background-color: #f0fdf4;">
                                        <td colspan="2" style="padding: 18px 20px; text-align: right; color: #059669; font-weight: 600; font-size: 15px;">
                                            🚚 Shipping
                                        </td>
                                        <td style="padding: 18px 20px; text-align: right; color: #059669; font-weight: 700; font-size: 16px;">
                                            FREE
                                        </td>
                                    </tr>
                                    <!-- Grand Total -->
                                    <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <td colspan="2" style="padding: 24px 20px; text-align: right; font-weight: 800; color: #ffffff; font-size: 19px; letter-spacing: 0.5px;">
                                            YOU PAY
                                        </td>
                                        <td style="padding: 24px 20px; text-align: right; font-weight: 900; color: #ffffff; font-size: 22px; letter-spacing: -0.5px;">
                                            Rs ${totalPrice.toLocaleString()}
                                        </td>
                                    </tr>
                                    ${totalDiscount > 0 ? `
                                    <tr style="background-color: #fef3c7;">
                                        <td colspan="3" style="padding: 12px 20px; text-align: center; color: #92400e; font-size: 13px; font-weight: 600;">
                                            🎉 You saved Rs ${totalDiscount.toLocaleString()} on this order!
                                        </td>
                                    </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping Information -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 700; padding-left: 4px;">📍 Delivery Address</h3>
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 24px; border-radius: 16px; border-left: 5px solid #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);">
                                <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 700; font-size: 17px;">👤 ${name}</p>
                                <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 15px;">✉️ ${email}</p>
                                <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 15px;">📱 ${phone}</p>
                                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7;">📦 ${address}</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Timeline -->
                    <tr>
                        <td style="padding: 0 40px 35px;">
                            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 22px; font-weight: 700; padding-left: 4px;">⏰ What Happens Next?</h3>
                            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 16px; border-left: 5px solid #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 15px; line-height: 1.8; font-weight: 500;">
                                            ✅ <strong>Order Received</strong> - We've got your order!
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 15px; line-height: 1.8; font-weight: 500;">
                                            📦 <strong>Processing</strong> - We're preparing your items with care
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 15px; line-height: 1.8; font-weight: 500;">
                                            🚚 <strong>Shipping</strong> - You'll receive tracking details via email
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 15px; line-height: 1.8; font-weight: 500;">
                                            🏠 <strong>Delivery</strong> - Expected in 3-5 business days
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Buttons -->
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="padding: 0 8px;">
                                        <a href="mailto:support@udaricrafts.com" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 15px; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); transition: all 0.3s;">
                                            💬 Contact Support
                                        </a>
                                    </td>
                                    <td style="padding: 0 8px;">
                                        <a href="tel:+923001234567" style="display: inline-block; padding: 16px 32px; background: #ffffff; color: #667eea; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 15px; border: 2px solid #667eea; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s;">
                                            📞 Call Us
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Support Banner -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 16px; text-align: center; border: 2px solid #f59e0b;">
                                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 700;">Need Help? We're Here!</p>
                                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                                    Our customer support team is available to assist you<br>
                                    <strong>Monday - Saturday: 9 AM - 6 PM</strong>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 40px 30px; text-align: center;">
                            <p style="margin: 0 0 16px 0; color: #d1d5db; font-size: 16px; font-weight: 600;">
                                Thank you for choosing Udari Crafts! 💝
                            </p>
                            <p style="margin: 0 0 20px 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                                Every purchase supports our artisans and their craft.<br>
                                We appreciate your business and trust.
                            </p>
                            
                            <!-- Social Links (Optional) -->
                            <div style="margin: 20px 0;">
                                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; transition: all 0.3s;">
                                    <span style="color: #d1d5db; font-size: 18px;">f</span>
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; transition: all 0.3s;">
                                    <span style="color: #d1d5db; font-size: 18px;">in</span>
                                </a>
                                <a href="#" style="display: inline-block; margin: 0 8px; width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; transition: all 0.3s;">
                                    <span style="color: #d1d5db; font-size: 18px;">✉</span>
                                </a>
                            </div>
                            
                            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
                                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px;">
                                © ${new Date().getFullYear()} Udari Crafts. All rights reserved.
                            </p>
                                <div style="margin-top: 12px;">
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #9ca3af; text-decoration: none; font-size: 12px; transition: color 0.3s;">Privacy Policy</a>
                                <span style="color: #4b5563;">•</span>
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #9ca3af; text-decoration: none; font-size: 12px; transition: color 0.3s;">Terms of Service</a>
                                <span style="color: #4b5563;">•</span>
                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #9ca3af; text-decoration: none; font-size: 12px; transition: color 0.3s;">Contact Us</a>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Bottom Decorative Bar -->
                    <tr>
                        <td style="height: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);"></td>
                    </tr>

                </table>
                
                <!-- Email Client Support Text -->
                <p style="margin: 30px 0 0 0; text-align: center; color: #6b7280; font-size: 12px;">
                    This email was sent to ${email}<br>
                    If you have any questions, please contact us at support@udaricrafts.com
                </p>
                
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
            console.log('🔍 getUserOrders - User:', user ? user.email : 'No user')
            
            if (!user) {
                console.log('❌ No authenticated user found')
                return response.status(401).json({ message: 'User not authenticated' })
            }

            console.log(`📦 Fetching orders for user: ${user.email}`)
            
            const orders = await Order.query()
                .where('email', user.email)
                .preload('orderItems', (orderItemsQuery) => {
                    orderItemsQuery.preload('product')
                })
                .preload('paymentDetails')
                .orderBy('created_at', 'desc')

            console.log(`✅ Found ${orders.length} orders for ${user.email}`)
            console.log('📋 Orders:', orders.map(o => ({ id: o.id, orderNumber: o.order_number, total: o.total })))

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



