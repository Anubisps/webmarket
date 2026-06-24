'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, Edit, Trash2, Package, Box, ArrowUpDown, 
  GripVertical, Sparkles, Save, X 
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: { name: string } | null
  isActive: boolean
  order: number
}

// Sortable product row component
function SortableProductRow({ product, index, onDelete, onEdit }: { 
  product: Product; 
  index: number; 
  onDelete: (id: string) => void; 
  onEdit: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-white/5 transition-colors border-b border-white/5">
      {/* Drag handle */}
      <td className="px-4 py-3 w-10">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-500 hover:text-purple-400 transition-colors" />
        </div>
      </td>
      {/* Product name */}
      <td className="px-4 py-3 font-medium">
        <Link href={`/accessadmin/products/${product.id}/edit`} className="hover:text-purple-400 transition-colors">
          {product.name}
        </Link>
      </td>
      {/* Price */}
      <td className="px-4 py-3 text-emerald-400">${product.price.toFixed(2)}</td>
      {/* Stock */}
      <td className="px-4 py-3">{product.stock}</td>
      {/* Category */}
      <td className="px-4 py-3 text-gray-400">{product.category?.name || 'Uncategorized'}</td>
      {/* Status */}
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      // Ensure products have an order property (fallback to index)
      const productsWithOrder = data.map((p: Product, idx: number) => ({
        ...p,
        order: p.order ?? idx,
      }))
      productsWithOrder.sort((a: Product, b: Product) => a.order - b.order)
      setProducts(productsWithOrder)
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Hide this product from the website?\n\nIt will be removed from the storefront but kept in the database for order history.')) {
      return
    }

    const permanent = confirm(
      'Permanently delete from database too?\n\nOnly choose OK if you are sure. This also removes order line items linked to this product.\n\nCancel = hide only (recommended).'
    )
    
    try {
      const url = permanent
        ? `/api/admin/products/${id}?permanent=true`
        : `/api/admin/products/${id}`

      const res = await fetch(url, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(permanent ? 'Product permanently deleted' : 'Product hidden from storefront')
        setProducts(prev => prev.filter(p => p.id !== id))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/accessadmin/products/${id}/edit`)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex(p => p.id === active.id)
    const newIndex = products.findIndex(p => p.id === over.id)
    const reordered = arrayMove(products, oldIndex, newIndex)
    
    // Update local state immediately for smooth UI
    setProducts(reordered)

    // Save new order to server
    setSavingOrder(true)
    try {
      const updates = reordered.map((product, index) => ({
        id: product.id,
        order: index,
      }))
      const res = await fetch('/api/admin/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) {
        // Revert on error
        loadProducts()
        toast.error('Failed to save order')
      } else {
        toast.success('Order saved')
      }
    } catch (err) {
      loadProducts()
      toast.error('Failed to save order')
    } finally {
      setSavingOrder(false)
    }
  }

  const filteredProducts = categoryFilter === 'all' 
    ? products 
    : products.filter(p => p.category?.name === categoryFilter)

  // Group products by category for display
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Uncategorized'
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">Products</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              All <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Products</span>
            </h1>
            <p className="text-gray-400 text-lg">Manage your product catalog.</p>
          </div>
          <Link
            href="/accessadmin/products/new"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-400">Filter by category:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                categoryFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  categoryFilter === cat.name
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Object.entries(groupedProducts).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        <Box className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                        <p>No products found</p>
                        <Link
                          href="/accessadmin/products/new"
                          className="mt-3 inline-block px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
                        >
                          Add your first product
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
                        <Fragment key={categoryName}>
                          {/* Category header row */}
                          <tr className="bg-white/5">
                            <td colSpan={7} className="px-4 py-2">
                              <h2 className="text-lg font-semibold text-purple-400">
                                {categoryName}
                              </h2>
                            </td>
                          </tr>
                          {/* Sortable products within category */}
                          <SortableContext
                            items={categoryProducts.map(p => p.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {categoryProducts.map((product, idx) => (
                              <SortableProductRow
                                key={product.id}
                                product={product}
                                index={idx}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                              />
                            ))}
                          </SortableContext>
                        </Fragment>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>

        {savingOrder && (
          <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-lg rounded-xl px-4 py-2 text-sm text-white flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            Saving order...
          </div>
        )}
      </div>
    </div>
  )
}
