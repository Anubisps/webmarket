import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pages = [
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h1>Terms of Service</h1><p>Last updated: June 2026</p><p>By using WindVault Market, you agree to these terms.</p><h2>1. Acceptance</h2><p>By accessing this site, you accept these terms.</p>'
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>Last updated: June 2026</p><p>We respect your privacy and protect your data.</p><h2>1. Data Collection</h2><p>We collect only what you provide.</p>'
    },
    {
      slug: 'refund',
      title: 'Refund Policy',
      content: '<h1>Refund Policy</h1><p>Last updated: June 2026</p><p>We offer a 14-day satisfaction guarantee.</p><h2>1. Eligibility</h2><p>You must request a refund within 14 days.</p>'
    }
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    })
  }
  console.log('✅ Pages seeded.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
