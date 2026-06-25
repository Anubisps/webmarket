'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Package, Save, Box, Edit, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { revalidateHomepage } from '@/app/actions/productActions'

// Loading error component
function ProductLoadingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to Load Product</h2>
        <p className="text-gray-400 mb-4">The product data could not be loaded.</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    isActive: true,
    isLimited: false,
    discount: '',
    startDate: '',
    endDate: '',
    variants: '[]',
    bannerImage: '',
    availabilityMessage: '',
    showAvailabilityMessage: false,
    // ✅ New fields
    productNote: '',
    customDelivery: '',
    customNote: '',
    enableUsernameFetch: 'inherit' as 'inherit' | 'true' | 'false',
    fetchProvider: 'wherewindsmeet',
    gameIdLabel: '',
  })
  const [productImage, setProductImage] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load product')
        return res.json()
      })
      .then(data => {
        setForm({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          price: data.price.toString(),
          stock: data.stock.toString(),
          categoryId: data.categoryId || '',
          isActive: data.isActive,
          isLimited: data.isLimited,
          discount: data.discount?.toString() || '',
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0,16) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0,16) : '',
          variants: data.variants ? JSON.stringify(data.variants) : '[]',
          bannerImage: data.bannerImage || '',
          availabilityMessage: data.availabilityMessage || '',
          showAvailabilityMessage: !!data.availabilityMessage,
          // ✅ Load new fields
          productNote: data.productNote || data.customNote || '',
          customDelivery: data.customDelivery || data.estimatedDelivery || '',
          customNote: '',
          enableUsernameFetch: data.enableUsernameFetch === true ? 'true' : data.enableUsernameFetch === false ? 'false' : 'inherit',
          fetchProvider: data.fetchProvider || 'wherewindsmeet',
          gameIdLabel: data.gameIdLabel || '',
        })
        setProductImage(data.images && data.images.length > 0 ? data.images[0] : '')
        setLoadError(false)
      })
      .catch(err => {
        console.error('Load error:', err)
        setLoadError(true)
        setError('Failed to load product')
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let variants = []
    try {
      variants = JSON.parse(form.variants)
    } catch (err) {
      setError('Invalid JSON format for variants')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          discount: form.discount ? parseFloat(form.discount) : null,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
          images: productImage ? [productImage] : [],
          variants,
          bannerImage: form.bannerImage || null,
          availabilityMessage: form.showAvailabilityMessage ? form.availabilityMessage : null,
          // ✅ Send new fields
          productNote: form.productNote,
          customDelivery: form.customDelivery,
          enableUsernameFetch: form.enableUsernameFetch,
          fetchProvider: form.fetchProvider,
          gameIdLabel: form.gameIdLabel || null,
        })
      })

      if (res.ok) {
        await revalidateHomepage()
        toast.success('✅ Product updated successfully!')
        router.push('/accessadmin/products')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update product')
      }
    } catch (err) {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`/api/admin/products/${id}/image`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setProductImage(data.images && data.images.length > 0 ? data.images[0] : '')
        toast.success('Product image uploaded successfully')
      } else {
        toast.error('Failed to upload product image')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
  }

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`/api/admin/products/${id}/banner`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, bannerImage: data.bannerImage })
        toast.success('Banner image uploaded successfully')
      } else {
        toast.error('Failed to upload banner image')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setBannerUploading(false)
    }
  }

  const removeProductImage = () => {
    if (!confirm('Remove product image?')) return
    setProductImage('')
    toast.success('Product image removed')
  }

  const removeBannerImage = () => {
    if (!confirm('Remove banner image?')) return
    setForm({ ...form, bannerImage: '' })
    toast.success('Banner image removed')
  }

  if (loadError) {
    return <ProductLoadingError onRetry={() => window.location.reload()} />
  }

  if (!form.name && !error) return <div className="p-8 text-center text-gray-400">Loading product...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Edit <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Product</span>
          </h1>
          <p className="text-gray-400 text-lg">Update product details, image, and variants.</p>
        </div>
        <Link
          href="/accessadmin/products"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all mt-4 md:mt-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 max-w-2xl">
        {/* Product Image */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Product Image (Max 1)
          </h2>
          <div className="flex gap-2">
            {productImage && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                <img src={`/api/images/products/${productImage.split('/').pop()}`} alt="Product" className="w-full h-full object-cover" />
                <button
                  onClick={removeProductImage}
                  className="absolute top-0 right-0 p-1 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-bl-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            {!productImage && (
              <label className="w-32 h-32 rounded-lg border border-white/10 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
          {uploading && <p className="text-sm text-purple-400">Uploading...</p>}
        </div>

        {/* Banner Image */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            Banner Image (Max 1)
          </h2>
          <div className="flex gap-2">
            {form.bannerImage && (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                <img src={form.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                <button
                  onClick={removeBannerImage}
                  className="absolute top-0 right-0 p-1 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-bl-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            {!form.bannerImage && (
              <label className="w-32 h-20 rounded-lg border border-white/10 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                <Upload className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageUpload} disabled={bannerUploading} />
              </label>
            )}
          </div>
          {bannerUploading && <p className="text-sm text-purple-400">Uploading...</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Slug</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Stock</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Category</label>
            <select
              required
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
            <h3 className="font-bold text-purple-300">Checkout Game ID Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Username fetch</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
                value={form.enableUsernameFetch}
                onChange={e => setForm({ ...form, enableUsernameFetch: e.target.value as 'inherit' | 'true' | 'false' })}
              >
                <option value="inherit">Inherit from category</option>
                <option value="true">Enabled (fetch username)</option>
                <option value="false">Disabled (ID only)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Custom ID field label (optional)</label>
              <input
                type="text"
                placeholder="Leave blank to inherit from category"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
                value={form.gameIdLabel}
                onChange={e => setForm({ ...form, gameIdLabel: e.target.value })}
              />
            </div>
          </div>

          {/* Active & Limited */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={form.isLimited}
                onChange={e => setForm({ ...form, isLimited: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              Limited Time
            </label>
          </div>

          {/* Limited Time Dates */}
          {form.isLimited && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={form.discount}
              onChange={e => setForm({ ...form, discount: e.target.value })}
            />
          </div>

          {/* ✅ Custom Availability Message Override */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={form.showAvailabilityMessage}
                onChange={e => setForm({ ...form, showAvailabilityMessage: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              Override availability message
            </label>
          </div>
          {form.showAvailabilityMessage && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Custom Availability Message</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={form.availabilityMessage}
                onChange={e => setForm({ ...form, availabilityMessage: e.target.value })}
                placeholder="e.g. Ends in 3 days"
              />
            </div>
          )}

          {/* Customer note — single rich text area */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">
              Customer note (shown on product page)
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Use line breaks for paragraphs. Supports delivery info, warnings, or instructions.
            </p>
            <textarea
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm leading-relaxed text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              value={form.productNote}
              onChange={e => setForm({ ...form, productNote: e.target.value })}
              placeholder={'Example:\n• Delivery within 24 hours after payment\n• Contact support with your order ID\n• Requires active game account'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Delivery estimate (optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              value={form.customDelivery}
              onChange={e => setForm({ ...form, customDelivery: e.target.value })}
              placeholder="e.g. Instant after payment, 24-48 hours"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
