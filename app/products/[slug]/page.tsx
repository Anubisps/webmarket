import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Shield, Zap, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/products" className="flex items-center text-purple-600 mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to products
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Product Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-500 text-sm">Category: {product.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.isLimited ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {product.isLimited ? 'Limited Edition' : 'Standard'}
              </span>
            </div>
          </div>

          {/* Product Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Notes / Special Features */}
            <div className="mt-6 bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Notes & Features
              </h3>
              <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
                <li>Instant delivery after payment</li>
                <li>100% secure transaction</li>
                <li>24/7 support included</li>
                {product.isLimited && <li>Limited time offer – expires soon!</li>}
                {product.discount && <li>🔥 {product.discount}% discount applied</li>}
              </ul>
            </div>

            {/* Price & Buy Section */}
            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <div>
                <span className="text-3xl font-bold text-purple-700">
                  ${product.price.toFixed(2)}
                </span>
                {product.discount && (
                  <span className="ml-3 text-sm text-gray-400 line-through">
                    ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-1">Stock: {product.stock} available</p>
              </div>
              <Link
                href={`/checkout/${product.id}`}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
