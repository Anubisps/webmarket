import { prisma } from '@/lib/db'

export type DiscordEventType =
  | 'order.created'
  | 'order.paid'
  | 'order.fulfilled'
  | 'order.refund'
  | 'ticket.created'
  | 'ticket.escalated'
  | 'affiliate.payout'
  | 'subscription.due'

async function getDiscordWebhookUrl(): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'discord_webhook_url' } })
  return setting?.value?.trim() || process.env.DISCORD_WEBHOOK_URL || null
}

export async function sendDiscordNotification(
  event: DiscordEventType,
  payload: { title: string; description: string; fields?: { name: string; value: string }[] }
) {
  const url = await getDiscordWebhookUrl()
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: payload.title,
          description: payload.description,
          color: event.includes('refund') ? 0xe74c3c : event.includes('paid') ? 0x2ecc71 : 0x9b59b6,
          fields: payload.fields || [],
          footer: { text: `WindVault · ${event}` },
          timestamp: new Date().toISOString(),
        }],
      }),
    })
  } catch (err) {
    console.error('Discord webhook error:', err)
  }
}
