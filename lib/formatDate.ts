/** Stable date formatting — same output on server and client (avoids hydration mismatch). */

export function formatDateTime(value: string | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

export function formatDate(value: string | Date): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toISOString().slice(0, 10)
}
