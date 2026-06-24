import { prisma } from '@/lib/db'

export async function createUserNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      link: link || null,
    },
  })
}

export async function notifyStaffNewTicket(ticket: {
  id: string
  subject: string
  user: { username: string }
}) {
  const staff = await prisma.user.findMany({
    where: { role: { in: ['admin', 'manager', 'support'] } },
    select: { id: true },
  })

  if (staff.length === 0) return

  await prisma.notification.createMany({
    data: staff.map(member => ({
      userId: member.id,
      title: 'New support ticket',
      message: `${ticket.user.username}: ${ticket.subject}`,
      link: `/accessadmin/tickets/${ticket.id}`,
    })),
  })
}

export async function notifyStaffTicketReply(ticket: {
  id: string
  subject: string
  user: { username: string }
}) {
  const staff = await prisma.user.findMany({
    where: { role: { in: ['admin', 'manager', 'support'] } },
    select: { id: true },
  })

  if (staff.length === 0) return

  await prisma.notification.createMany({
    data: staff.map(member => ({
      userId: member.id,
      title: 'New ticket reply',
      message: `${ticket.user.username} replied on: ${ticket.subject}`,
      link: `/accessadmin/tickets/${ticket.id}`,
    })),
  })
}

export async function notifyUserTicketReply(
  ticketId: string,
  userId: string,
  subject: string
) {
  await createUserNotification(
    userId,
    'New support reply',
    `Staff replied to your ticket: ${subject}`,
    `/dashboard/tickets/${ticketId}`
  )
}

export async function getUnreadNotificationCount(userId: string, linkPrefix?: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
      ...(linkPrefix
        ? { link: { startsWith: linkPrefix } }
        : {}),
    },
  })
}

export async function markNotificationsRead(userId: string, link?: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(link ? { link } : {}),
    },
    data: { isRead: true },
  })
}
