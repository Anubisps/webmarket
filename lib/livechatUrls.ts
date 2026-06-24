export function getLiveChatFileUrl(sessionId: string, filename: string): string {
  return `/api/livechat/files/${sessionId}/${filename}`
}

export function normalizeLiveChatAttachmentUrl(url: string): string {
  if (url.startsWith('/api/livechat/files/')) return url

  const legacyPrefix = '/uploads/livechat/'
  if (url.startsWith(legacyPrefix)) {
    const rest = url.slice(legacyPrefix.length)
    const slashIndex = rest.indexOf('/')
    if (slashIndex > 0) {
      const sessionId = rest.slice(0, slashIndex)
      const filename = rest.slice(slashIndex + 1)
      return getLiveChatFileUrl(sessionId, filename)
    }
  }

  return url
}
