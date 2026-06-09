'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Box, ArrowRight, Sparkles, Star, AlertCircle } from 'lucide-react'

export function ProductGrid() {
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
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Products
            </span>
          </h1>
          <div className="flex gap-2 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-52">
              <input
                type="text"
                name="search"
                defaultValue={search || ''}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 rounded-md bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            </form>
            <button
              onClick={toggleFilter}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              {filter === 'all' ? 'Clear' : 'Filter'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
              <Box className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No products found.</p>
            </div>
          ) : (
            products.map((product) => {
              const firstImage = product.images && product.images.length > 0 ? product.images[0] : null
              const imageSrc = firstImage ? `/api/images/products/${firstImage.split('/').pop()}` : null
              const isOutOfStock = product.stock <= 0
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-purple-500/50 transition-all duration-200"
                >
                  <div className="h-28 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 relative">
                    {imageSrc ? (
                      <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="text-white text-[10px] font-medium px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                        {product.category}
                      </span>
                    </div>
                    {isOutOfStock && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-red-500/80 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
                        Out
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-sm font-medium mb-0.5 group-hover:text-purple-400 transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
