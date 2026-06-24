import { rm } from 'fs/promises'
import path from 'path'

const ALLOWED_MIME_TYPES = new Set(['application/pdf'])

export function isAllowedLiveChatFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return ALLOWED_MIME_TYPES.has(file.type)
}

export function getLiveChatUploadDir(sessionId: string): string {
  return path.join(process.cwd(), 'public', 'uploads', 'livechat', sessionId)
}

export async function deleteLiveChatSessionFiles(sessionId: string): Promise<void> {
  const dir = getLiveChatUploadDir(sessionId)
  await rm(dir, { recursive: true, force: true })
}
