import React, { useState } from 'react'
import { X, RefreshCw, Plus, Trash2, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SubscriptionContract, BillingCadence, SubscriptionStatus, QuoteItem, ClientType } from '../../types'
import { formatCurrency } from '../../services/currencyService'

interface SubscriptionModalProps {
  subscriptionToEdit?: SubscriptionContract | null
  onClose: () => void
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscriptionToEdit,
  onClose,
}) => {
  const {
    addSubscription,
    updateSubscription,
    companies,
    individuals,
    products,
    selectedCurrency,
    activeLegalEntity,
  } = useApp()

  const [contractNumber, setContractNumber] = useState(
    subscriptionToEdit?.contractNumber || `SUB-2026-${Math.floor(100 + Math.random() * 900)}`
  )
  const [title, setTitle] = useState(subscriptionToEdit?.title || '')
  const [clientType, setClientType] = useState<ClientType>(subscriptionToEdit?.clientType || 'company')
  const [companyId, setCompanyId] = useState<string>(subscriptionToEdit?.companyId || companies[0]?.id || '')
  const [individualId, setIndividualId] = useState<string>(subscriptionToEdit?.individualId || individuals[0]?.id || '')
  const [cadence, setCadence] = useState<BillingCadence>(subscriptionToEdit?.cadence || 'monthly')
  const [status, setStatus] = useState<SubscriptionStatus>(subscriptionToEdit?.status || 'active')
  const [startDate, setStartDate] = useState(
    subscriptionToEdit?.startDate || new Date().toISOString().slice(0, 10)
  )
  const [nextBillingDate, setNextBillingDate] = useState(
    subscriptionToEdit?.nextBillingDate || new Date().toISOString().slice(0, 10)
  )
  const [autoRenew, setAutoRenew] = useState(subscriptionToEdit?.autoRenew ?? true)
  const [autoSendPeppol, setAutoSendPeppol] = useState(subscriptionToEdit?.autoSendPeppol ?? true)
  const [autoSendEmail, setAutoSendEmail] = useState(subscriptionToEdit?.autoSendEmail ?? true)
  const [notes, setNotes] = useState(subscriptionToEdit?.notes || '')

  const [items, setItems] = useState<QuoteItem[]>(
    subscriptionToEdit?.items || [
      {
        id: `si-1`,
        description: '',
        quantity: 1,
        unit: 'month',
        unitPrice: 0,
        discountPercent: 0,
        vatRate: 21,
        total: 0,
      },
    ]
  )

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `si-${Date.now()}`,
        description: '',
        quantity: 1,
        unit: 'month',
        unitPrice: 0,
        discountPercent: 0,
        vatRate: 21,
        total: 0,
      },
    ])
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              productId: product.id,
              description: product.name,
              unitPrice: product.sellPrice,
              vatRate: product.vatRate,
              total: item.quantity * product.sellPrice,
            }
          : item
      )
    )
  }

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
          const raw = updated.quantity * updated.unitPrice
          const disc = (raw * (updated.discountPercent || 0)) / 100
          updated.total = Math.round((raw - disc) * 100) / 100
        }
        return updated
      })
    )
  }

  const handleDeleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const subtotal = Number(items.reduce((s, i) => s + i.total, 0).toFixed(2))
  const vatTotal = Number(
    items.reduce((s, i) => s + (i.total * i.vatRate) / 100, 0).toFixed(2)
  )
  const total = Number((subtotal + vatTotal).toFixed(2))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || items.length === 0) return

    const subData: SubscriptionContract = {
      id: subscriptionToEdit?.id || `sub-${Date.now()}`,
      contractNumber,
      title,
      clientType,
      companyId: clientType === 'company' ? companyId : undefined,
      individualId: clientType === 'individual' ? individualId : undefined,
      cadence,
      status,
      startDate,
      nextBillingDate,
      autoRenew,
      autoSendPeppol,
      autoSendEmail,
      items,
      subtotal,
      vatTotal,
      total,
      currency: selectedCurrency,
      notes: notes || undefined,
      legalEntityId: activeLegalEntity.id,
      createdAt: subscriptionToEdit?.createdAt || new Date().toISOString(),
    }

    if (subscriptionToEdit) {
      updateSubscription(subData)
    } else {
      addSubscription(subData)
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
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                {subscriptionToEdit ? 'Edit Recurring Subscription' : 'Create Recurring Subscription (MRR)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Automated cadence invoicing, retainers, and SLA service agreements
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Contract Code *
              </label>
              <input
                type="text"
                required
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Contract Title / Service Scope *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                placeholder="e.g. Enterprise Cloud Care & 24/7 SLA"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Client Type
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="company">🏢 B2B Company</option>
                <option value="individual">👤 B2C Person</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Target Client *
              </label>
              {clientType === 'company' ? (
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vatNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={individualId}
                  onChange={(e) => setIndividualId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                >
                  {individuals.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.firstName} {ind.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Billing Cadence *
              </label>
              <select
                value={cadence}
                onChange={(e) => setCadence(e.target.value as BillingCadence)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="monthly">Monthly (MRR)</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannually">Biannual</option>
                <option value="annually">Annually (ARR)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Next Billing Date
              </label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                Recurring Plan Items & Quantities
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-sandbox btn-sandbox-outline"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.72rem' }}
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                  placeholder="Service description"
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                  placeholder="Qty"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                  placeholder="Price"
                />
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)', textAlign: 'right' }}>
                  {formatCurrency(item.total, selectedCurrency)}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  disabled={items.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--sb-danger)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Total Bar */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '10px',
              border: '1px solid var(--sb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoSendPeppol} onChange={(e) => setAutoSendPeppol(e.target.checked)} />
                Auto-dispatch Peppol
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoSendEmail} onChange={(e) => setAutoSendEmail(e.target.checked)} />
                Auto-send Email
              </label>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginRight: '0.5rem' }}>Recurring Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                {formatCurrency(total, selectedCurrency)} / {cadence}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.6rem 1.25rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle size={16} />
              {subscriptionToEdit ? 'Save Changes' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
