import { prisma } from '@/lib/db'
import { createUserNotification } from '@/lib/notifications'

export async function notifyProductAlerts(productId: string, reason: 'restock' | 'available' = 'restock') {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, stock: true, isActive: true },
  })
  if (!product || !product.isActive || product.stock < 1) return

  const alerts = await prisma.productAlert.findMany({
    where: { productId, notified: false },
    include: { user: { select: { id: true } } },
  })

  if (alerts.length === 0) return

  await Promise.all(
    alerts.map(async alert => {
      await createUserNotification(
        alert.userId,
        'Product available',
        `${product.name} is back in stock.`,
        `/products/${product.slug}`
      )
    })
  )

  await prisma.productAlert.updateMany({
    where: { productId, notified: false },
    data: { notified: true },
  })
}
