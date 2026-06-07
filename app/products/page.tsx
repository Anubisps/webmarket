// app/products/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found. Add some in the admin panel.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition p-6"
              >
                <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description?.slice(0, 100)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-700">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="flex items-center text-purple-600">
                    View <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
