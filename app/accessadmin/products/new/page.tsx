'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { ProductSubscriptionFields } from '@/components/admin/ProductSubscriptionFields'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    productNote: '',
    customDelivery: '',
    enableUsernameFetch: 'inherit' as 'inherit' | 'true' | 'false',
    fetchProvider: 'wherewindsmeet',
    gameIdLabel: '',
  })
  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false)
  const [subscriptionBillingType, setSubscriptionBillingType] = useState('monthly')
  const [subscriptionCustomDays, setSubscriptionCustomDays] = useState('30')
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string>('')
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories:', err))
  }, [])

  const handleProductImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProductImageFile(file)
    setProductImagePreview(URL.createObjectURL(file))
  }

  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerImageFile(file)
    setBannerImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let variants = []
    try {
      variants = JSON.parse(form.variants)
    } catch {
      setError('Invalid JSON format for variants')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
          categoryId: form.categoryId || null,
          isActive: form.isActive,
          isLimited: form.isLimited,
          discount: form.discount ? parseFloat(form.discount) : null,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
          images: [],
          variants,
          bannerImage: null,
          availabilityMessage: form.showAvailabilityMessage ? form.availabilityMessage : null,
          productNote: form.productNote,
          customDelivery: form.customDelivery,
          enableUsernameFetch: form.enableUsernameFetch,
          fetchProvider: form.fetchProvider,
          gameIdLabel: form.gameIdLabel || null,
          subscriptionEnabled,
          subscriptionBillingType,
          subscriptionIntervalDays: subscriptionBillingType === 'custom' ? parseInt(subscriptionCustomDays, 10) : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create product')
        return
      }

      const product = await res.json()

      if (productImageFile) {
        const formData = new FormData()
        formData.append('file', productImageFile)
        const imgRes = await fetch(`/api/admin/products/${product.id}/image`, { method: 'POST', body: formData })
        if (!imgRes.ok) toast.error('Product created but image upload failed')
      }

      if (bannerImageFile) {
        const formData = new FormData()
        formData.append('file', bannerImageFile)
        const bannerRes = await fetch(`/api/admin/products/${product.id}/banner`, { method: 'POST', body: formData })
        if (!bannerRes.ok) toast.error('Product created but banner upload failed')
      }

      toast.success('Product created successfully!')
      router.push('/accessadmin/products')
    } catch {
      setError('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Products</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Add <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Product</span>
          </h1>
          <p className="text-gray-400 text-lg">Create a new product with images, notes, and checkout settings.</p>
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
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Product Image (Max 1)
          </h2>
          <div className="flex gap-2">
            {productImagePreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                <img src={productImagePreview} alt="Product preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setProductImageFile(null); setProductImagePreview('') }}
                  className="absolute top-0 right-0 p-1 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-bl-lg"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-32 h-32 rounded-lg border border-white/10 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5">
                <Upload className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProductImageSelect} />
              </label>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            Banner Image (Max 1)
          </h2>
          <div className="flex gap-2">
            {bannerImagePreview ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                <img src={bannerImagePreview} alt="Banner preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setBannerImageFile(null); setBannerImagePreview('') }}
                  className="absolute top-0 right-0 p-1 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-bl-lg"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="w-32 h-20 rounded-lg border border-white/10 border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5">
                <Upload className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageSelect} />
              </label>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Slug</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Price (USD)</label>
              <input type="number" step="0.01" required className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Stock</label>
              <input type="number" required className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Category</label>
            <select required className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
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
              <select className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.enableUsernameFetch} onChange={e => setForm({ ...form, enableUsernameFetch: e.target.value as 'inherit' | 'true' | 'false' })}>
                <option value="inherit">Inherit from category</option>
                <option value="true">Enabled (fetch username)</option>
                <option value="false">Disabled (ID only)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Custom ID field label (optional)</label>
              <input type="text" placeholder="Leave blank to inherit from category" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.gameIdLabel} onChange={e => setForm({ ...form, gameIdLabel: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-purple-500" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.isLimited} onChange={e => setForm({ ...form, isLimited: e.target.checked })} className="w-4 h-4 accent-purple-500" />
              Limited Time
            </label>
          </div>

          {form.isLimited && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Start Date</label>
                <input type="datetime-local" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">End Date</label>
                <input type="datetime-local" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Discount (%)</label>
            <input type="number" min="0" max="100" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Variants (JSON)</label>
            <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 font-mono text-sm text-white" value={form.variants} onChange={e => setForm({ ...form, variants: e.target.value })} placeholder='[{"id":"default","name":"Standard","price":9.99}]' />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.showAvailabilityMessage} onChange={e => setForm({ ...form, showAvailabilityMessage: e.target.checked })} className="w-4 h-4 accent-purple-500" />
              Override availability message
            </label>
          </div>
          {form.showAvailabilityMessage && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Custom Availability Message</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.availabilityMessage} onChange={e => setForm({ ...form, availabilityMessage: e.target.value })} placeholder="e.g. Ends in 3 days" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Customer note (shown on product page)</label>
            <textarea rows={4} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white" value={form.productNote} onChange={e => setForm({ ...form, productNote: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Delivery estimate (optional)</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white" value={form.customDelivery} onChange={e => setForm({ ...form, customDelivery: e.target.value })} placeholder="e.g. Instant after payment" />
          </div>

          <ProductSubscriptionFields
            enabled={subscriptionEnabled}
            billingType={subscriptionBillingType}
            customDays={subscriptionCustomDays}
            onEnabledChange={setSubscriptionEnabled}
            onBillingTypeChange={setSubscriptionBillingType}
            onCustomDaysChange={setSubscriptionCustomDays}
          />

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
