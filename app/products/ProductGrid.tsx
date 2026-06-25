'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Box, ChevronDown, Sparkles, Filter, ArrowUpDown } from 'lucide-react'
import { ProductCard } from '@/components/products/ProductCard'

export function ProductGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [sort, setSort] = useState('featured')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const searchParam = searchParams?.get('search') || ''
    const categoryParam = searchParams?.get('categoryId') || ''
    const sortParam = searchParams?.get('sort') || 'featured'
    const inStockParam = searchParams?.get('inStock') === '1'
    setSearch(searchParam)
    setSelectedCategoryId(categoryParam)
    setSort(sortParam)
    setInStockOnly(inStockParam)
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
        if (inStockOnly) params.set('inStock', '1')
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
  }, [search, selectedCategoryId, sort, inStockOnly])

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
    setIsFilterOpen(false)
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

  const clearFilters = () => {
    setSelectedCategoryId('')
    setSearch('')
    setSearchInput('')
    setSort('featured')
    router.push('/products', { scroll: false })
  }

  const sortOptions = [
    { value: 'featured', label: 'Featured Order' },
    { value: 'newest', label: 'Admin Order' },
    { value: 'price_low', label: 'Price: Low → High' },
    { value: 'price_high', label: 'Price: High → Low' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,10,60,0.3)_0%,_#0a0a0f_100%)]"></div>
        <div className="stars-layer absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-pink-600/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Search & Filters Bar */}
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Mobile Filter Toggle */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10 text-white text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {selectedCategoryId && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                </button>
              </div>

              {/* Categories - Desktop */}
              <div className="hidden md:flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    !selectedCategoryId
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  All Products
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
              </div>

              {/* Sort Dropdown & Clear Filters */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked)
                      const params = new URLSearchParams()
                      if (search) params.set('search', search)
                      if (selectedCategoryId) params.set('categoryId', selectedCategoryId)
                      if (sort) params.set('sort', sort)
                      if (e.target.checked) params.set('inStock', '1')
                      router.push(`/products?${params.toString()}`, { scroll: false })
                    }}
                    className="rounded"
                  />
                  In stock only
                </label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-2 pr-8 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 cursor-pointer"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {(selectedCategoryId || search) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Categories Dropdown */}
            {isFilterOpen && (
              <div className="md:hidden bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      !selectedCategoryId
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedCategoryId === cat.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{products.length}</span> product{products.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
              <Box className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              {(selectedCategoryId || search) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
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

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: star-twinkle 3s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
