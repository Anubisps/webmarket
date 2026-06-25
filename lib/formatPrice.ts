export function formatPrice(amount: number, options?: { suffix?: boolean }) {
  const formatted = `$${amount.toFixed(2)}`
  if (options?.suffix === false) return formatted
  return formatted
}

export function formatPriceLabel(amount: number) {
  return `$${amount.toFixed(2)}`
}
