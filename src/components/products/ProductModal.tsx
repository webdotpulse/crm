import React, { useState } from 'react'
import { X, Package, DollarSign, Tag, Image, Barcode, Layers } from 'lucide-react'
import { Product, ProductCategory } from '../../types'
import { useApp } from '../../context/AppContext'

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, vatRates } = useApp()

  const [formData, setFormData] = useState<Partial<Product>>({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'service',
    type: product?.type || 'service',
    buyPrice: product?.buyPrice || 0,
    sellPrice: product?.sellPrice || 100,
    vatRate: product?.vatRate || 21,
    unit: product?.unit || 'hours',
    stockQuantity: product?.stockQuantity || 0,
    minStockAlert: product?.minStockAlert || 10,
    imageUrl: product?.imageUrl || '',
    barcode: product?.barcode || '',
    isActive: product?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.sku) return

    if (product) {
      updateProduct({
        ...product,
        ...(formData as Product),
      })
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        sku: formData.sku || `SKU-${Date.now().toString().slice(-4)}`,
        name: formData.name || '',
        description: formData.description || '',
        category: (formData.category as ProductCategory) || 'service',
        type: formData.type || 'service',
        buyPrice: Number(formData.buyPrice) || 0,
        sellPrice: Number(formData.sellPrice) || 0,
        vatRate: Number(formData.vatRate) || 21,
        unit: formData.unit || 'pcs',
        stockQuantity: Number(formData.stockQuantity) || 0,
        minStockAlert: Number(formData.minStockAlert) || 10,
        imageUrl:
          formData.imageUrl ||
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
        barcode: formData.barcode,
        isActive: Boolean(formData.isActive),
        createdAt: new Date().toISOString(),
      }
      addProduct(newProd)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                {product ? 'Edit Product / Service' : 'Add New Product or Service'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Configure SKU, pricing, category, default VAT rate, and inventory stock thresholds.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* SKU & Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
              <div>
                <label className="form-label">SKU / Item Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HW-GPS-4G"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="form-input-sandbox"
                  style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 600 }}
                />
              </div>

              <div>
                <label className="form-label">Product / Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IoT Telematics Gateway 4G/LTE"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Category, Type & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="form-select-sandbox"
                >
                  <option value="service">Service (Engineering/Hours)</option>
                  <option value="hardware">Hardware / Device</option>
                  <option value="software_license">Software License</option>
                  <option value="subscription">Subscription / SaaS</option>
                  <option value="physical_product">Physical Product</option>
                </select>
              </div>

              <div>
                <label className="form-label">Item Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="form-select-sandbox"
                >
                  <option value="service">Service (No Physical Stock)</option>
                  <option value="physical">Physical (Track Inventory)</option>
                  <option value="digital">Digital / License</option>
                </select>
              </div>

              <div>
                <label className="form-label">Default Billing Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="form-select-sandbox"
                >
                  <option value="hours">hours (h)</option>
                  <option value="pcs">pieces (pcs)</option>
                  <option value="days">days (d)</option>
                  <option value="licenses">licenses</option>
                  <option value="months">months</option>
                  <option value="package">package</option>
                </select>
              </div>
            </div>

            {/* Pricing & VAT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Cost / Buy Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })}
                  className="form-input-sandbox"
                />
              </div>

              <div>
                <label className="form-label">Selling Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100.00"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                  className="form-input-sandbox"
                  style={{ fontWeight: 700, color: 'var(--sb-primary)' }}
                />
              </div>

              <div>
                <label className="form-label">Default VAT Rate</label>
                <select
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="form-select-sandbox"
                >
                  {vatRates.map((vr) => (
                    <option key={vr.id} value={vr.rate}>
                      {vr.name} ({vr.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Stock & Low-Stock Alerts */}
            {formData.type !== 'service' && (
              <div
                className="card-sandbox"
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--sb-bg)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div>
                  <label className="form-label">Current Stock in Warehouse</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="form-input-sandbox"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label className="form-label">Minimum Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                    className="form-input-sandbox"
                  />
                </div>
              </div>
            )}

            {/* Image URL */}
            <div>
              <label className="form-label">Product Picture / Image URL</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="form-input-sandbox"
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid var(--sb-border)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Item Description (Included in Quotations & Invoices)</label>
              <textarea
                rows={2}
                placeholder="Detailed technical specifications or scope description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
