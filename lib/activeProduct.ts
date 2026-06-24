export const publicProductWhere = {
  deletedAt: null,
  isActive: true,
} as const

export function isProductPubliclyAvailable(product: {
  deletedAt?: Date | null
  isActive?: boolean
} | null) {
  if (!product) return false
  return product.deletedAt == null && product.isActive !== false
}
