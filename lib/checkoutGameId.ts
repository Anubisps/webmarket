export function resolveGameIdSettings(product: {
  enableUsernameFetch?: boolean | null
  fetchProvider?: string | null
  gameIdLabel?: string | null
  category?: {
    enableUsernameFetch?: boolean
    fetchProvider?: string | null
    gameIdLabel?: string | null
  } | null
}) {
  const fetchEnabled = product.enableUsernameFetch ?? product.category?.enableUsernameFetch ?? false
  const fetchProvider = product.fetchProvider ?? product.category?.fetchProvider ?? 'wherewindsmeet'
  const gameIdLabel = product.gameIdLabel ?? product.category?.gameIdLabel ?? 'In-Game ID'

  return { fetchEnabled, fetchProvider, gameIdLabel }
}
