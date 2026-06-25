export function formatPrice(amount: number, options?: { suffix?: boolean }) {
  const formatted = `$${Math.abs(amount).toFixed(2)}`
  if (options?.suffix === false) return formatted
  return `${formatted} USD`
}

export function formatPriceLabel(amount: number) {
  return `$${Math.abs(amount).toFixed(2)} USD`
}

export function formatPriceShort(amount: number) {
  return `$${Math.abs(amount).toFixed(2)}`
}
