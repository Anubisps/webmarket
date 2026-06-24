import type { PaymentSetting } from '@prisma/client'

export type PaymentConfig = Record<string, string>

export function parseConfig(config: unknown): PaymentConfig {
  if (!config || typeof config !== 'object') return {}
  return config as PaymentConfig
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://windvault.store'
}

export async function processAutoPayment(
  setting: PaymentSetting,
  params: { orderId: string; amount: number; currency: string; userEmail?: string }
): Promise<{ paymentId: string; checkoutUrl: string }> {
  const config = parseConfig(setting.config)
  const base = getBaseUrl()
  const successUrl = `${base}/checkout/success?orderId=${params.orderId}&method=${setting.method}`
  const cancelUrl = `${base}/checkout/${params.orderId}?cancelled=1`

  if (setting.testMode) {
    const paymentId = `test_${setting.method}_${params.orderId}`
    return {
      paymentId,
      checkoutUrl: `${base}/api/payments/simulate?orderId=${params.orderId}&method=${setting.method}`,
    }
  }

  switch (setting.method) {
    case 'stripe':
      return createStripeSession(config, { ...params, successUrl, cancelUrl })
    case 'coinbase':
      return createCoinbaseCharge(config, params)
    case 'paypal':
      return createPayPalOrder(config, { ...params, successUrl, cancelUrl })
    default:
      throw new Error(`Auto payments not supported for ${setting.method}`)
  }
}

async function createStripeSession(
  config: PaymentConfig,
  params: { orderId: string; amount: number; currency: string; successUrl: string; cancelUrl: string; userEmail?: string }
) {
  const secretKey = config.secretKey
  if (!secretKey) throw new Error('Stripe secret key not configured')

  const body = new URLSearchParams({
    mode: 'payment',
    success_url: `${params.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl,
    'line_items[0][price_data][currency]': params.currency.toLowerCase(),
    'line_items[0][price_data][product_data][name]': `Order #${params.orderId.slice(0, 8)}`,
    'line_items[0][price_data][unit_amount]': String(Math.round(params.amount * 100)),
    'line_items[0][quantity]': '1',
    'metadata[orderId]': params.orderId,
  })
  if (params.userEmail) body.set('customer_email', params.userEmail)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe session failed')

  return { paymentId: data.id, checkoutUrl: data.url }
}

async function createCoinbaseCharge(
  config: PaymentConfig,
  params: { orderId: string; amount: number; currency: string }
) {
  const apiKey = config.apiKey || process.env.COINBASE_COMMERCE_API_KEY
  if (!apiKey) throw new Error('Coinbase API key not configured')

  const base = getBaseUrl()
  const res = await fetch('https://api.commerce.coinbase.com/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Api-Key': apiKey,
      'X-CC-Version': '2018-03-22',
    },
    body: JSON.stringify({
      name: `Order #${params.orderId.slice(0, 8)}`,
      description: 'WindVault purchase',
      pricing_type: 'fixed_price',
      local_price: { amount: params.amount.toFixed(2), currency: params.currency },
      metadata: { orderId: params.orderId },
      redirect_url: `${base}/checkout/success?orderId=${params.orderId}&method=coinbase`,
      cancel_url: `${base}/checkout/${params.orderId}?cancelled=1`,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Coinbase charge failed')

  return {
    paymentId: data.data.id,
    checkoutUrl: data.data.hosted_url,
  }
}

async function createPayPalOrder(
  config: PaymentConfig,
  params: { orderId: string; amount: number; currency: string; successUrl: string; cancelUrl: string }
) {
  const clientId = config.clientId
  const clientSecret = config.clientSecret
  if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured')

  const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) throw new Error('PayPal auth failed')

  const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.orderId,
        amount: { currency_code: params.currency, value: params.amount.toFixed(2) },
      }],
      application_context: {
        return_url: `${params.successUrl}&provider=paypal`,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  const orderData = await orderRes.json()
  if (!orderRes.ok) throw new Error(orderData.message || 'PayPal order failed')

  const approveLink = orderData.links?.find((l: { rel: string }) => l.rel === 'approve')
  return {
    paymentId: orderData.id,
    checkoutUrl: approveLink?.href || params.successUrl,
  }
}

export const PROVIDER_FIELDS: Record<string, { key: string; label: string; secret?: boolean }[]> = {
  stripe: [
    { key: 'publishableKey', label: 'Publishable Key' },
    { key: 'secretKey', label: 'Secret Key', secret: true },
    { key: 'webhookSecret', label: 'Webhook Secret', secret: true },
  ],
  coinbase: [{ key: 'apiKey', label: 'Commerce API Key', secret: true }],
  paypal: [
    { key: 'clientId', label: 'Client ID' },
    { key: 'clientSecret', label: 'Client Secret', secret: true },
  ],
}

export const AUTO_CAPABLE_METHODS = ['stripe', 'coinbase', 'paypal']
