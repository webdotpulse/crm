import React, { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tag,
  Layers,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
} from 'lucide-react'
import { Product } from '../../types'
import { useApp } from '../../context/AppContext'
import { ProductModal } from './ProductModal'

export const ProductsView: React.FC = () => {
  const { products, deleteProduct, adjustProductStock } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all')

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null)
  const [stockDelta, setStockDelta] = useState<number>(1)

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory

    let matchesStock = true
    if (stockFilter === 'low_stock') {
      matchesStock = p.type !== 'service' && p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = p.type !== 'service' && p.stockQuantity <= 0
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  // Stock summary metrics
  const totalItems = products.length
  const lowStockCount = products.filter((p) => p.type !== 'service' && p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0).length
  const outOfStockCount = products.filter((p) => p.type !== 'service' && p.stockQuantity <= 0).length
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.type !== 'service' ? p.buyPrice * p.stockQuantity : 0), 0)

  const handleApplyStockAdjust = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stockAdjustProduct) return
    adjustProductStock(stockAdjustProduct.id, stockDelta)
    setStockAdjustProduct(null)
    setStockDelta(1)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Products & Stock Inventory</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Manage commercial catalog items, hardware stock, software licenses, consulting rates, and pictures.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null)
            setIsProductModalOpen(true)
          }}
          className="btn-sandbox btn-sandbox-primary"
        >
          <Plus size={16} />
          <span>New Product or Service</span>
        </button>
      </div>

      {/* KPI Cards for Inventory */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '0.25rem' }}>Catalog Items</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)' }}>{totalItems} Products</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-primary)', marginTop: '0.25rem' }}>Active commercial SKUs</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '0.25rem' }}>Total Stock Valuation</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-success)' }}>
            €{totalInventoryValue.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>Physical inventory cost value</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '0.25rem' }}>Low Stock Alert</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: lowStockCount > 0 ? 'var(--sb-warning)' : 'var(--sb-heading)' }}>
            {lowStockCount} Items
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>Below reorder threshold</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '0.25rem' }}>Out of Stock</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: outOfStockCount > 0 ? 'var(--sb-danger)' : 'var(--sb-heading)' }}>
            {outOfStockCount} Items
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>Replenishment required</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50)',
              color: 'var(--sb-body)',
            }}
          />
          <input
            type="text"
            placeholder="Search product by name, SKU code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input-sandbox"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'hardware', label: 'Hardware' },
            { id: 'service', label: 'Services' },
            { id: 'software_license', label: 'Licenses' },
            { id: 'subscription', label: 'Subscriptions' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn-sandbox ${selectedCategory === cat.id ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table className="table-sandbox">
          <thead>
            <tr>
              <th>Product / Item</th>
              <th>SKU Code</th>
              <th>Category & Type</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body)' }}>
                  No products or services found matching your filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const margin = p.sellPrice - p.buyPrice
                const marginPercent = p.sellPrice > 0 ? ((margin / p.sellPrice) * 100).toFixed(0) : '0'
                const isLowStock = p.type !== 'service' && p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0
                const isOutOfStock = p.type !== 'service' && p.stockQuantity <= 0

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid var(--sb-border)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--sb-primary-soft)',
                              color: 'var(--sb-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Package size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{p.name}</div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--sb-body)',
                              maxWidth: '350px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--sb-font-mono)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--sb-border)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {p.sku}
                      </span>
                    </td>

                    <td>
                      <span className="badge-sandbox badge-soft-primary" style={{ textTransform: 'capitalize' }}>
                        {p.category.replace('_', ' ')}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
                        Unit: {p.unit}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>€{p.buyPrice.toFixed(2)}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--sb-primary)' }}>€{p.sellPrice.toFixed(2)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-success)' }}>
                        +{marginPercent}% margin (€{margin.toFixed(2)})
                      </div>
                    </td>

                    <td>
                      {p.type === 'service' ? (
                        <span className="badge-sandbox badge-soft-purple">Unlimited (Service)</span>
                      ) : isOutOfStock ? (
                        <span className="badge-sandbox badge-soft-danger">
                          <XCircle size={12} style={{ marginRight: '0.25rem' }} />
                          Out of Stock (0)
                        </span>
                      ) : isLowStock ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span className="badge-sandbox badge-soft-warning">
                            <AlertTriangle size={12} style={{ marginRight: '0.25rem' }} />
                            Low: {p.stockQuantity} {p.unit}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>
                            Alert under {p.minStockAlert}
                          </span>
                        </div>
                      ) : (
                        <span className="badge-sandbox badge-soft-success">
                          <CheckCircle2 size={12} style={{ marginRight: '0.25rem' }} />
                          {p.stockQuantity} {p.unit}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {p.type !== 'service' && (
                          <button
                            onClick={() => {
                              setStockAdjustProduct(p)
                              setStockDelta(1)
                            }}
                            className="btn-sandbox btn-sandbox-secondary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                            title="Adjust Stock"
                          >
                            <Sliders size={13} style={{ marginRight: '0.25rem' }} />
                            <span>Stock</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingProduct(p)
                            setIsProductModalOpen(true)
                          }}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ padding: '0.4rem' }}
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${p.name}?`)) {
                              deleteProduct(p.id)
                            }
                          }}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ padding: '0.4rem', color: 'var(--sb-danger)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Dialog */}
      {stockAdjustProduct && (
        <div className="modal-backdrop" onClick={() => setStockAdjustProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem' }}>Adjust Inventory Stock</h3>
              <button
                onClick={() => setStockAdjustProduct(null)}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ padding: '0.3rem' }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyStockAdjust}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1rem' }}>
                  Updating stock for <strong>{stockAdjustProduct.name}</strong> (SKU: {stockAdjustProduct.sku})
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--sb-body)' }}>Current Stock:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {stockAdjustProduct.stockQuantity} {stockAdjustProduct.unit}
                  </span>
                </div>

                <div>
                  <label className="form-label">Stock Change Delta (+ to receive stock, - to deduct)</label>
                  <input
                    type="number"
                    required
                    value={stockDelta}
                    onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
                    className="form-input-sandbox"
                    style={{ fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--sb-bg)',
                    borderRadius: 'var(--sb-radius)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>New Stock Total:</span>
                  <strong style={{ color: 'var(--sb-primary)' }}>
                    {Math.max(0, stockAdjustProduct.stockQuantity + stockDelta)} {stockAdjustProduct.unit}
                  </strong>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="btn-sandbox btn-sandbox-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}
