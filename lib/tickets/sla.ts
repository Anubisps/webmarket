const SLA_HOURS: Record<string, number> = {
  urgent: 4,
  high: 12,
  medium: 24,
  low: 72,
}

export function computeSlaDueAt(priority: string, from = new Date()): Date {
  const hours = SLA_HOURS[priority] ?? SLA_HOURS.medium
  return new Date(from.getTime() + hours * 60 * 60 * 1000)
}

export function slaStatus(slaDueAt: Date | null | undefined): 'ok' | 'warning' | 'breached' | 'none' {
  if (!slaDueAt) return 'none'
  const diff = slaDueAt.getTime() - Date.now()
  if (diff < 0) return 'breached'
  if (diff < 2 * 60 * 60 * 1000) return 'warning'
  return 'ok'
}
