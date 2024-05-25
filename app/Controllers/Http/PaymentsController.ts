
import Stripe from 'stripe'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaymentDetail from 'App/Models/PaymentDetail'
import Order from 'App/Models/Order'
import Env from '@ioc:Adonis/Core/Env';

const stripe = new Stripe(Env.get('STRIPE_SECRET_KEY'), {
    apiVersion: Env.get('STRIPE_API_VERSION'),
})

export default class PaymentController {
    public async processPayment({ request, response }: HttpContextContract) {
        try {
            const { order_id } = request.only(['order_id'])

            // Fetch the payment details
            const paymentDetail = await PaymentDetail.findBy('order_id', order_id)
            if (!paymentDetail) {
                return response.status(404).json({ message: 'Payment details not found' })
            }

            if (paymentDetail.type !== 'cash') {
                return response.status(400).json({ message: 'Invalid payment method' })
            }
            const order = new Order();


            const paymentIntent = await stripe.paymentIntents.create({
                amount: (paymentDetail.amount * 100),
                currency: 'USD',
                payment_method_types: ['card'],
            })

            // Assuming payment is successful, update payment status
            paymentDetail.status = 'paid'
            await paymentDetail.save()

            return response.status(200).json({ message: 'Payment successful', paymentDetail, paymentIntent })
        } catch (error) {
            console.error('Error processing payment:', error)
            return response.status(500).json({ error: 'Payment failed' })
        }
    }
}

