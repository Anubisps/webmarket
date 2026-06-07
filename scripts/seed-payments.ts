import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const methods = [
    { method: 'coinbase', label: 'Coinbase Commerce (Crypto)', enabled: false },
    { method: 'paypal', label: 'PayPal (Manual)', enabled: false },
    { method: 'crypto', label: 'Manual Crypto (BTC/ETH/USDT)', enabled: false },
    { method: 'western_union', label: 'Western Union', enabled: false },
    { method: 'ria', label: 'Ria Money Transfer', enabled: false },
    { method: 'moneygram', label: 'MoneyGram', enabled: false },
  ]

  for (const m of methods) {
    await prisma.paymentSetting.upsert({
      where: { method: m.method },
      update: { label: m.label, enabled: m.enabled },
      create: { method: m.method, label: m.label, enabled: m.enabled }
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
