import { Suspense } from 'react'
import { ProductGrid } from './ProductGrid'

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading products...</p>
        </div>
      </div>
    }>
      <ProductGrid />
    </Suspense>
  )
}
