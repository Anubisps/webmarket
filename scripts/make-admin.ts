import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'eleounik@gmail.com'
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' }
  })
  
  console.log(`✅ User ${user.email} is now an admin (role: ${user.role})`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
