import { prisma } from '@/lib/db'

export interface PaymentProvider {
  id: string
  name: string
  enabled: boolean
  createPayment: (orderId: string, amount: number, currency: string, metadata?: any) => Promise<{
    paymentId: string
    checkoutUrl: string
    providerData?: any
  }>
  verifyPayment: (paymentId: string) => Promise<{
    status: 'pending' | 'paid' | 'failed'
    transactionId?: string
  }>
}

export const paymentProviders: Record<string, PaymentProvider> = {}

export async function getAvailableProviders(): Promise<PaymentProvider[]> {
  return Object.values(paymentProviders).filter(p => p.enabled)
}

// We'll import and register providers below
import { coinbaseProvider } from './coinbase'
paymentProviders.coinbase = coinbaseProvider
// Add more providers here in the future
