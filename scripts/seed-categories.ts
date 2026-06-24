import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    { name: 'Where Winds Meet', slug: 'where-winds-meet', enableUsernameFetch: true, fetchProvider: 'wherewindsmeet', gameIdLabel: 'In-Game ID' },
    { name: 'Palmon Survival', slug: 'palmon-survival' },
    { name: 'Echo Pearls', slug: 'echo-pearls' },
    { name: 'Custom Bars', slug: 'custom-bars' },
    { name: 'Limited Edition', slug: 'limited-edition' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        enableUsernameFetch: cat.enableUsernameFetch ?? false,
        fetchProvider: cat.fetchProvider ?? null,
        gameIdLabel: cat.gameIdLabel ?? null,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        enableUsernameFetch: cat.enableUsernameFetch ?? false,
        fetchProvider: cat.fetchProvider ?? null,
        gameIdLabel: cat.gameIdLabel ?? null,
      }
    })
  }
  console.log('✅ Categories seeded.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
