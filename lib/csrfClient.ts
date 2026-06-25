export function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return ''
  const cookies = document.cookie.split(';')
  const csrfCookie = cookies.find(c => c.trim().startsWith('csrf_token='))
  return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : ''
}

export function csrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie()
  return token ? { 'x-csrf-token': token } : {}
}
