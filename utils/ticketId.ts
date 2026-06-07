export function generateTicketId(id: string): string {
  // Take first 4 chars of the UUID and uppercase
  const short = id.replace(/-/g, '').slice(0, 4).toUpperCase()
  return `TKT-${short}`
}
