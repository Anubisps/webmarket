'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Search, Filter, Sparkles, Star, Box, AlertCircle } from 'lucide-react'

export function ProductsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const searchParam = searchParams?.get('search') || ''
    const filterParam = searchParams?.get('filter') || ''
    setSearch(searchParam)
    setFilter(filterParam)
  }, [searchParams])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`)
        const data = await res.json()
        if (res.ok && Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error('API returned:', data)
          setProducts([])
        }
      } catch (err) {
        console.error('Failed to load products:', err)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [search, filter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filter) params.set('filter', filter)
    router.push(`/products?${params.toString()}`)
  }

  const toggleFilter = () => {
    const newFilter = filter ? '' : 'all'
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (newFilter) params.set('filter', newFilter)
    router.push(`/products?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-12">
      <section className="relative overflow-hidden py-16 mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f]">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-gray-300">Premium Collection</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-2">
                All{' '}
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Products
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                Browse our complete catalog of premium gaming items.
              </p>
            </div>
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Search products..."
                  className="w-full md:w-64 pl-10 pr-4 py-3 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              </form>
              <button
                onClick={toggleFilter}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                {filter === 'all' ? 'Clear' : 'Filter'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
            <Box className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const firstImage =
                product.images && product.images.length > 0 ? product.images[0] : null
              const isOutOfStock = product.stock <= 0
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 relative">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500" />
                    )}
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="text-white text-xs font-medium px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs">4.9</span>
                      </div>
                    </div>
                    {isOutOfStock && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-white text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        OUT OF STOCK
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {product.price.toFixed(2)} USDC
                      </span>
                      <span className="flex items-center gap-1 text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
