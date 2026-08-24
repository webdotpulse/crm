import React, { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Send,
  Sparkles,
  Package,
  User,
} from 'lucide-react'
import { Quotation, QuoteItem, Deal, ClientType } from '../../types'
import { useApp } from '../../context/AppContext'

interface QuoteBuilderModalProps {
  fromDeal?: Deal | null
  quotation?: Quotation | null
  quote?: Quotation | null
  onClose: () => void
}

export const QuoteBuilderModal: React.FC<QuoteBuilderModalProps> = ({
  fromDeal,
  quotation,
  quote,
  onClose,
}) => {
  const activeQuote = quotation || quote
  const {
    companies,
    individuals,
    quotations,
    addQuotation,
    updateQuotation,
    documentTemplates,
    products,
    vatRates,
    activeLegalEntity,
  } = useApp()

  const [clientType, setClientType] = useState<ClientType>(
    activeQuote?.clientType || (fromDeal?.clientType as ClientType) || 'company'
  )
  const [selectedClientId, setSelectedClientId] = useState<string>(
    activeQuote?.companyId ||
      activeQuote?.individualId ||
      fromDeal?.companyId ||
      fromDeal?.individualId ||
      companies[0]?.id ||
      ''
  )

  const [title, setTitle] = useState(
    activeQuote?.title || (fromDeal ? `Proposal for ${fromDeal.title}` : '')
  )
  const [validDays, setValidDays] = useState(30)
  const [terms, setTerms] = useState(
    activeQuote?.terms ||
      'Payment terms: 30% upfront on order, 40% on milestone beta release, 30% on handover. 3 months warranty included.'
  )

  const [items, setItems] = useState<QuoteItem[]>(
    activeQuote?.items || [
      {
        id: `qi-1`,
        description: fromDeal ? fromDeal.title : 'Full-Stack Software Architecture & Implementation',
        quantity: 40,
        unit: 'hours',
        unitPrice: 110.0,
        discountPercent: 0,
        vatRate: 21,
        total: 4400.0,
      },
    ]
  )

  // Template loader handler
  const handleLoadTemplate = (templateId: string) => {
    const tmpl = documentTemplates.find((t) => t.id === templateId)
    if (tmpl) {
      setTitle(tmpl.title)
      setTerms(tmpl.defaultTerms || terms)
      setItems(
        tmpl.items.map((it, idx) => ({
          ...it,
          id: `qi-tmpl-${Date.now()}-${idx}`,
        }))
      )
    }
  }

  // Insert from product catalog handler
  const handleInsertProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId)
    if (prod) {
      const newItem: QuoteItem = {
        id: `qi-prod-${Date.now()}`,
        productId: prod.id,
        description: `${prod.name} — ${prod.description}`,
        quantity: 1,
        unit: prod.unit,
        unitPrice: prod.sellPrice,
        discountPercent: 0,
        vatRate: prod.vatRate,
        total: prod.sellPrice,
      }
      setItems([...items, newItem])
    }
  }

  // Calculations
  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          const discountMultiplier = (100 - updated.discountPercent) / 100
          updated.total = Number((updated.quantity * updated.unitPrice * discountMultiplier).toFixed(2))
          return updated
        }
        return item
      })
    )
  }

  const addItem = () => {
    const newItem: QuoteItem = {
      id: `qi-${Date.now()}`,
      description: 'Senior Engineering & Consultation',
      quantity: 10,
      unit: 'hours',
      unitPrice: 110.0,
      discountPercent: 0,
      vatRate: 21,
      total: 1100.0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((i) => i.id !== id))
    }
  }

  const subtotal = Number(items.reduce((sum, item) => sum + item.total, 0).toFixed(2))
  const taxTotal = Number(
    items.reduce((sum, item) => sum + item.total * (item.vatRate / 100), 0).toFixed(2)
  )
  const grandTotal = Number((subtotal + taxTotal).toFixed(2))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || items.length === 0) return

    const issueDate = new Date().toISOString().slice(0, 10)
    const validUntilDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)

    if (activeQuote) {
      updateQuotation({
        ...activeQuote,
        clientType,
        companyId: clientType === 'company' ? selectedClientId : undefined,
        individualId: clientType === 'individual' ? selectedClientId : undefined,
        title,
        items,
        subtotal,
        taxTotal,
        total: grandTotal,
        terms,
      })
    } else {
      const quoteSeq = String(quotations.length + 42).padStart(4, '0')
      const newQuote: Quotation = {
        id: `quo-${Date.now()}`,
        number: `QUO-2026-${quoteSeq}`,
        legalEntityId: activeLegalEntity.id,
        dealId: fromDeal?.id,
        clientType,
        companyId: clientType === 'company' ? selectedClientId : undefined,
        individualId: clientType === 'individual' ? selectedClientId : undefined,
        title,
        issueDate,
        validUntilDate,
        items,
        subtotal,
        taxTotal,
        total: grandTotal,
        currency: 'EUR',
        status: 'draft',
        terms,
        createdAt: new Date().toISOString(),
      }
      addQuotation(newQuote)
    }

    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
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
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                {quotation ? `Edit Quotation ${quotation.number}` : 'Commercial Quotation Builder'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Issued by {activeLegalEntity.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Toolbar: Load Template & Insert Product */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--sb-bg)',
            borderBottom: '1px solid var(--sb-border)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Load from Template */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={15} color="var(--sb-purple)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Load Template:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadTemplate(e.target.value)
              }}
              className="form-select-sandbox"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
              defaultValue=""
            >
              <option value="" disabled>
                Select predefined proposal...
              </option>
              {documentTemplates
                .filter((t) => t.type === 'quotation')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Insert from Product Catalog */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={15} color="var(--sb-primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Insert Product:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleInsertProduct(e.target.value)
              }}
              className="form-select-sandbox"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
              defaultValue=""
            >
              <option value="" disabled>
                Choose from catalog...
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (€{p.sellPrice})
                </option>
              ))}
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Client & Title Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Client Type</label>
                <select
                  value={clientType}
                  onChange={(e) => {
                    const newType = e.target.value as ClientType
                    setClientType(newType)
                    setSelectedClientId(
                      newType === 'individual' ? individuals[0]?.id || '' : companies[0]?.id || ''
                    )
                  }}
                  className="form-select-sandbox"
                >
                  <option value="company">🏢 Company (B2B)</option>
                  <option value="individual">👤 Private Person (B2C)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Select Client *</label>
                {clientType === 'individual' ? (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="form-select-sandbox"
                  >
                    {individuals.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.firstName} {ind.lastName} ({ind.city})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="form-select-sandbox"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.vatNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="form-label">Validity (Days)</label>
                <input
                  type="number"
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value) || 30)}
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Proposal Title */}
            <div>
              <label className="form-label">Proposal Title / Project Scope *</label>
              <input
                type="text"
                required
                placeholder="e.g. Telematics Platform Architecture & Mobile App"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-sandbox"
              />
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Quotation Line Items</label>
                <button type="button" onClick={addItem} className="btn-sandbox btn-sandbox-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div style={{ border: '1px solid var(--sb-border)', borderRadius: 'var(--sb-radius)', overflow: 'hidden' }}>
                <table className="table-sandbox">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Description</th>
                      <th style={{ width: '12%' }}>Qty</th>
                      <th style={{ width: '12%' }}>Unit</th>
                      <th style={{ width: '15%' }}>Unit Price (€)</th>
                      <th style={{ width: '10%' }}>VAT %</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>Total (€)</th>
                      <th style={{ width: '4%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            className="form-input-sandbox"
                            style={{ padding: '0.4rem 0.6rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            required
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                            className="form-input-sandbox"
                            style={{ padding: '0.4rem 0.6rem' }}
                          />
                        </td>
                        <td>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                            className="form-select-sandbox"
                            style={{ padding: '0.4rem 0.5rem' }}
                          >
                            <option value="hours">hours</option>
                            <option value="pcs">pcs</option>
                            <option value="days">days</option>
                            <option value="licenses">licenses</option>
                            <option value="months">months</option>
                            <option value="package">package</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="form-input-sandbox"
                            style={{ padding: '0.4rem 0.6rem' }}
                          />
                        </td>
                        <td>
                          <select
                            value={item.vatRate}
                            onChange={(e) => updateItem(item.id, { vatRate: parseFloat(e.target.value) || 0 })}
                            className="form-select-sandbox"
                            style={{ padding: '0.4rem 0.5rem' }}
                          >
                            {vatRates.map((vr) => (
                              <option key={vr.id} value={vr.rate}>
                                {vr.rate}%
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          €{item.total.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.3rem', color: 'var(--sb-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commercial Terms & Totals Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Payment Terms & Milestones</label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>

              <div className="card-sandbox" style={{ padding: '1rem', backgroundColor: 'var(--sb-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                  <span>Subtotal:</span>
                  <strong>€{subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                  <span>VAT Amount:</span>
                  <strong>€{taxTotal.toFixed(2)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '0.6rem',
                    borderTop: '1px solid var(--sb-border)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--sb-primary)',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>€{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              <Send size={15} />
              <span>{quotation ? 'Update Proposal' : 'Generate Quotation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
