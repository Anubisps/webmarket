/** Resolve a stored product image path to a public URL. */

export function productImageFilename(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null
  const name = stored.split('/').pop()?.trim()
  return name || null
}

/**
 * Serve via Next.js API — same process/user that writes uploads.
 * Avoids nginx 403 when files live under /home/windvault (www-data cannot read).
 */
export function productImageUrl(stored: string | null | undefined): string | null {
  const filename = productImageFilename(stored)
  if (!filename) return null
  return `/api/images/products/${filename}`
}

/** Direct static path (only works if nginx can read public/uploads). */
export function productImageStaticUrl(stored: string | null | undefined): string | null {
  const filename = productImageFilename(stored)
  if (!filename) return null
  return `/uploads/products/${filename}`
}
