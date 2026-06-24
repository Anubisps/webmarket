const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const methods = [
    { method: 'stripe', label: 'Stripe (Credit Card)', enabled: false, supportsAuto: true, sortOrder: 1 },
    { method: 'paypal', label: 'PayPal', enabled: false, supportsAuto: true, sortOrder: 2 },
    { method: 'coinbase', label: 'Coinbase Commerce (Crypto)', enabled: false, supportsAuto: true, sortOrder: 3 },
    { method: 'crypto', label: 'Manual Crypto (BTC/ETH/USDT)', enabled: false, supportsAuto: false, sortOrder: 4 },
    { method: 'western_union', label: 'Western Union', enabled: false, supportsAuto: false, sortOrder: 5 },
    { method: 'ria', label: 'Ria Money Transfer', enabled: false, supportsAuto: false, sortOrder: 6 },
    { method: 'moneygram', label: 'MoneyGram', enabled: false, supportsAuto: false, sortOrder: 7 },
  ]

  for (const m of methods) {
    await prisma.paymentSetting.upsert({
      where: { method: m.method },
      update: { label: m.label, supportsAuto: m.supportsAuto, sortOrder: m.sortOrder },
      create: {
        method: m.method,
        label: m.label,
        enabled: m.enabled,
        supportsAuto: m.supportsAuto,
        sortOrder: m.sortOrder,
        mode: 'manual',
      },
    })
  }

  console.log('✅ Payment settings seeded.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
