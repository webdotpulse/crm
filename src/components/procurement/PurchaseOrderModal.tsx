import React, { useState } from 'react'
import { X, Plus, Trash2, Package, Calendar, Truck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../../types'

interface PurchaseOrderModalProps {
  purchaseOrder?: PurchaseOrder | null
  onClose: () => void
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  purchaseOrder,
  onClose,
}) => {
  const { suppliers, addPurchaseOrder, updatePurchaseOrder } = useApp()

  const [supplierId, setSupplierId] = useState<string>(
    purchaseOrder?.supplierId || (suppliers[0]?.id || '')
  )
  const [orderDate, setOrderDate] = useState<string>(
    purchaseOrder?.orderDate || new Date().toISOString().slice(0, 10)
  )
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    purchaseOrder?.expectedDeliveryDate ||
      new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  )
  const [status, setStatus] = useState<PurchaseOrderStatus>(
    purchaseOrder?.status || 'issued'
  )
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    purchaseOrder?.deliveryNotes || ''
  )

  const [items, setItems] = useState<PurchaseOrderItem[]>(
    purchaseOrder?.items || [
      {
        id: `poi-${Date.now()}`,
        description: 'Industrial Sensor Module / Hardware Component',
        quantityOrdered: 5,
        quantityReceived: 0,
        unit: 'piece',
        unitPrice: 120.0,
        vatRate: 21,
        lineTotal: 600.0,
      },
    ]
  )

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `poi-${Date.now()}`,
        description: 'New Procurement Item',
        quantityOrdered: 1,
        quantityReceived: 0,
        unit: 'piece',
        unitPrice: 50.0,
        vatRate: 21,
        lineTotal: 50.0,
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantityOrdered' || field === 'unitPrice') {
          updated.lineTotal = Math.round(Number(updated.quantityOrdered) * Number(updated.unitPrice) * 100) / 100
        }
        return updated
      })
    )
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)
  const vatTotal = subtotal * 0.21
  const total = subtotal + vatTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const supplier = suppliers.find((s) => s.id === supplierId)
    const supplierName = supplier?.name || 'Rexel Belgium NV'

    const newPo: PurchaseOrder = {
      id: purchaseOrder?.id || `po-${Date.now()}`,
      number: purchaseOrder?.number || `PO-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      supplierId,
      supplierName,
      orderDate,
      expectedDeliveryDate,
      status,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      vatTotal: Math.round(vatTotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      deliveryNotes,
      createdAt: purchaseOrder?.createdAt || new Date().toISOString(),
    }

    if (purchaseOrder) {
      updatePurchaseOrder(newPo)
    } else {
      addPurchaseOrder(newPo)
    }

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>
              SUPPLIER PROCUREMENT & BESTELBON
            </span>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              {purchaseOrder ? `Edit Purchase Order ${purchaseOrder.number}` : 'New Supplier Purchase Order (Bestelbon)'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Supplier *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.vatNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Procurement Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PurchaseOrderStatus)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued to Supplier</option>
                <option value="partially_received">Partially Received</option>
                <option value="received">Fully Received in Warehouse</option>
                <option value="matched">3-Way Matched & Approved</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: '1.25rem', border: '1px solid var(--sb-border)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--sb-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} color="var(--sb-primary)" />
                <span>Ordered Line Items</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-sandbox btn-sandbox-outline"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={12} />
                <span>Add Item</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  placeholder="Item description / SKU"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <input
                  type="number"
                  min="1"
                  value={item.quantityOrdered}
                  onChange={(e) => handleItemChange(idx, 'quantityOrdered', Number(e.target.value))}
                  placeholder="Qty"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <input
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                  placeholder="Price €"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                  €{item.lineTotal.toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery notes & Total */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Delivery Instructions / Notes
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Deliver to Warehouse Bay 3, attn Sven De Smet"
                className="input-sandbox"
                rows={2}
                style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
              />
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--sb-bg)',
                borderRadius: '8px',
                border: '1px solid var(--sb-border)',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Subtotal: €{subtotal.toFixed(2)}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>VAT (21%): €{vatTotal.toFixed(2)}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
                €{total.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.55rem 1.5rem' }}>
              Save Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
