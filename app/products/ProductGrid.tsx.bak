'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Box, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/products/ProductCard'

export function ProductGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [sort, setSort] = useState('newest')
  const [searchInput, setSearchInput] = useState('')

  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const searchParam = searchParams?.get('search') || ''
    const categoryParam = searchParams?.get('categoryId') || ''
    const sortParam = searchParams?.get('sort') || 'newest'
    setSearch(searchParam)
    setSelectedCategoryId(categoryParam)
    setSort(sortParam)
    setSearchInput(searchParam)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (selectedCategoryId && selectedCategoryId !== '') {
          params.set('categoryId', selectedCategoryId)
        }
        if (sort) params.set('sort', sort)
        const res = await fetch(`/api/products?${params.toString()}`)
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
  }, [search, selectedCategoryId, sort])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (value) params.set('search', value)
      if (selectedCategoryId && selectedCategoryId !== '') {
        params.set('categoryId', selectedCategoryId)
      }
      if (sort) params.set('sort', sort)
      router.push(`/products?${params.toString()}`, { scroll: false })
    }, 300)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId) {
      params.set('categoryId', categoryId)
    }
    if (sort) params.set('sort', sort)
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (selectedCategoryId && selectedCategoryId !== '') {
      params.set('categoryId', selectedCategoryId)
    }
    if (newSort) params.set('sort', newSort)
    router.push(`/products?${params.toString()}`, { scroll: false })
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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500 selection:text-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-3">
            All Products
          </h1>

          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>

            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  !selectedCategoryId
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategoryId === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer pr-8"
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low → High</option>
                  <option value="price_high">Price: High → Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
            <Box className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No products found</h3>
            <p className="text-gray-400">Check back later for new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const firstImage = product.images && product.images.length > 0 ? product.images[0] : null
              const imageSrc = firstImage ? `/api/images/products/${firstImage.split('/').pop()}` : null
              return (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    stock: product.stock,
                    images: product.images || [],
                    category: product.category ? { name: product.category.name } : null
                  }}
                  imageSrc={imageSrc}
                  wishlisted={product.wishlisted}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
