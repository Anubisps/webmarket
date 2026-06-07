import { PaymentProvider } from './index'
import { prisma } from '@/lib/db'

const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY

export const coinbaseProvider: PaymentProvider = {
  id: 'coinbase',
  name: 'Coinbase Commerce',
  enabled: !!COINBASE_API_KEY,

  async createPayment(orderId: string, amount: number, currency: string = 'USD', metadata?: any) {
    if (!COINBASE_API_KEY) throw new Error('Coinbase API key missing')

    // Note: In a real implementation, you would use the Coinbase Commerce SDK here.
    // For now, this is a placeholder that returns a dummy checkout URL.
    // Replace this with actual Coinbase API call.

    // For demonstration, we'll return a fake checkout URL.
    // Replace the following with: const charge = await client.charge.create({...})

    const dummyCheckoutUrl = `https://commerce.coinbase.com/checkout/${orderId}`

    // Store the transaction ID in the order
    await prisma.order.update({
      where: { id: orderId },
      data: { transactionId: `coinbase_${orderId}` }
    })

    return {
      paymentId: `coinbase_${orderId}`,
      checkoutUrl: dummyCheckoutUrl
    }
  },

  async verifyPayment(paymentId: string) {
    // In production, you would verify with Coinbase API.
    // For now, we just return 'paid' to simulate success.
    return {
      status: 'paid',
      transactionId: `tx_${paymentId}`
    }
  }
}
