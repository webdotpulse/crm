import React, { useState } from 'react'
import { X, FileSignature, Plus, Trash2, DollarSign, Calendar, Building2 } from 'lucide-react'
import { Quotation, QuoteItem, QuoteStatus, Deal } from '../../types'
import { useApp } from '../../context/AppContext'

interface QuoteBuilderModalProps {
  quote?: Quotation | null
  fromDeal?: Deal | null
  onClose: () => void
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  quote,
  fromDeal,
  onClose,
}) => {
  const { companies, contacts, quotations, addQuotation, updateQuotation } = useApp()

  const [number, setNumber] = useState(
    quote?.number || `QUO-2026-${String(quotations.length + 49).padStart(4, '0')}`
  )
  const [companyId, setCompanyId] = useState(
    quote?.companyId || fromDeal?.companyId || companies[0]?.id || ''
  )
  const [contactId, setContactId] = useState(quote?.contactId || fromDeal?.contactId || '')
  const [dealId, setDealId] = useState(quote?.dealId || fromDeal?.id || '')
  const [title, setTitle] = useState(
    quote?.title || fromDeal?.title || 'Deliverables & Implementation Proposal'
  )
  const [issueDate, setIssueDate] = useState(
    quote?.issueDate || new Date().toISOString().slice(0, 10)
  )
  const [validUntilDate, setValidUntilDate] = useState(
    quote?.validUntilDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || 'draft')
  const [terms, setTerms] = useState(
    quote?.terms ||
      'Payment terms: 30 days net. 30% milestone advance on signature, 40% on staging delivery, 30% on go-live.'
  )

  const [items, setItems] = useState<QuoteItem[]>(
    quote?.items || [
      {
        id: `qi-1`,
        description: fromDeal
          ? `${fromDeal.title} - Scope & Architecture`
          : 'Discovery Sprint & Architecture Design',
        quantity: 30,
        unit: 'hours',
        unitPrice: 110,
        discountPercent: 0,
        vatRate: 21,
        total: 3300,
      },
      {
        id: `qi-2`,
        description: 'System Development, Core APIs & Peppol E-Invoicing Engine',
        quantity: 70,
        unit: 'hours',
        unitPrice: 110,
        discountPercent: 0,
        vatRate: 21,
        total: 7700,
      },
    ]
  )

  const companyContacts = contacts.filter((c) => c.companyId === companyId)

  // Calculations
  const calculateItemTotal = (qty: number, price: number, discount: number) => {
    return qty * price * (1 - discount / 100)
  }

  const handleItemChange = (idx: number, field: keyof QuoteItem, val: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: val }
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
      updated[idx].total = calculateItemTotal(
        Number(updated[idx].quantity),
        Number(updated[idx].unitPrice),
        Number(updated[idx].discountPercent)
      )
    }
    setItems(updated)
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `qi-${Date.now()}`,
        description: 'New Deliverable or Service',
        quantity: 1,
        unit: 'hours',
        unitPrice: 110,
        discountPercent: 0,
        vatRate: 21,
        total: 110,
      },
    ])
  }

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxTotal = items.reduce((sum, item) => sum + item.total * (item.vatRate / 100), 0)
  const total = subtotal + taxTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !companyId || items.length === 0) return

    const payload = {
      number,
      companyId,
      contactId: contactId || undefined,
      dealId: dealId || undefined,
      title,
      issueDate,
      validUntilDate,
      items,
      subtotal,
      taxTotal,
      total,
      currency: 'EUR',
      status,
      terms,
    }

    if (quote) {
      updateQuotation({ ...quote, ...payload })
    } else {
      addQuotation(payload)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-purple-soft)',
                color: 'var(--sb-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSignature size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>{quote ? 'Edit Quotation' : 'Create Quotation Proposal'}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>Ref: {number}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Header Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Quotation Title / Subject *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Telematics Fleet Management Software"
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Client Company *</label>
              <select
                required
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value)
                  setContactId('')
                }}
                className="form-select-sandbox"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Recipient Contact</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="form-select-sandbox"
              >
                <option value="">-- General Inquiries --</option>
                {companyContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="form-select-sandbox"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Client</option>
                <option value="accepted">Accepted / Signed</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.95rem' }}>Quotation Deliverables & Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="card-sandbox" style={{ overflow: 'hidden' }}>
              <table className="table-sandbox">
                <thead>
                  <tr>
                    <th style={{ width: '42%' }}>Description</th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '12%' }}>Unit</th>
                    <th style={{ width: '13%' }}>Unit Price (€)</th>
                    <th style={{ width: '8%' }}>VAT %</th>
                    <th style={{ width: '12%', textAlign: 'right' }}>Total (€)</th>
                    <th style={{ width: '3%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Item or deliverable description..."
                          className="form-input-sandbox"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="form-input-sandbox"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td>
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="form-select-sandbox"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                        >
                          <option value="hours">hours</option>
                          <option value="days">days</option>
                          <option value="unit">unit/item</option>
                          <option value="month">month</option>
                          <option value="sprint">sprint</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="form-input-sandbox"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                        />
                      </td>
                      <td>
                        <select
                          value={item.vatRate}
                          onChange={(e) => handleItemChange(idx, 'vatRate', Number(e.target.value))}
                          className="form-select-sandbox"
                          style={{ height: '32px', fontSize: '0.8rem' }}
                        >
                          <option value="21">21%</option>
                          <option value="12">12%</option>
                          <option value="6">6%</option>
                          <option value="0">0%</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        €{item.total.toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="btn-sandbox btn-icon btn-sandbox-danger"
                          style={{ width: '26px', height: '26px', padding: 0 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown & Terms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Payment & Delivery Terms</label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment schedule, warranties, delivery milestones..."
                className="form-textarea-sandbox"
              />
            </div>

            <div className="card-sandbox" style={{ padding: '1rem', backgroundColor: 'var(--sb-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Subtotal (Excl. VAT):</span>
                <strong>€{subtotal.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <span>VAT Total:</span>
                <strong>€{taxTotal.toFixed(2)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--sb-border)',
                  paddingTop: '0.75rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--sb-primary)',
                }}
              >
                <span>Total Amount:</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {quote ? 'Update Quotation' : 'Save & Send Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
