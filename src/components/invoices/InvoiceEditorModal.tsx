import React, { useState } from 'react'
import { X, Receipt, Plus, Trash2, ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { Invoice, InvoiceItem, InvoiceStatus, TaxBreakdownItem } from '../../types'
import { useApp } from '../../context/AppContext'
import { generateStructuredReference } from '../../services/peppolGenerator'

interface InvoiceEditorModalProps {
  invoice?: Invoice | null
  defaultCompanyId?: string
  onClose: () => void
}

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  invoice,
  defaultCompanyId,
  onClose,
}) => {
  const { companies, contacts, invoices, addInvoice, updateInvoice } = useApp()

  const [number, setNumber] = useState(
    invoice?.number || `INV-2026-${String(invoices.length + 215).padStart(4, '0')}`
  )
  const [companyId, setCompanyId] = useState(
    invoice?.companyId || defaultCompanyId || companies[0]?.id || ''
  )
  const [contactId, setContactId] = useState(invoice?.contactId || '')
  const [issueDate, setIssueDate] = useState(
    invoice?.issueDate || new Date().toISOString().slice(0, 10)
  )
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [reference, setReference] = useState(invoice?.reference || 'PO-2026-CLIENT')
  const [structuredReference, setStructuredReference] = useState(
    invoice?.structuredReference || generateStructuredReference(Date.now())
  )
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status || 'issued')
  const [notes, setNotes] = useState(
    invoice?.notes ||
      'Thank you for your business. Please use the structured payment reference for bank reconciliation.'
  )
  const [paymentTerms, setPaymentTerms] = useState(
    invoice?.paymentTerms || 'Payment due within 30 days net.'
  )

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [
      {
        id: 'ii-1',
        description: 'Software Engineering & Cloud Architecture Consulting',
        quantity: 40,
        unit: 'hours',
        unitPrice: 110,
        discountPercent: 0,
        vatRate: 21,
        total: 4400,
        taxCategory: 'S',
      },
    ]
  )

  const companyContacts = contacts.filter((c) => c.companyId === companyId)

  // Calculations
  const calculateItemTotal = (qty: number, price: number, discount: number) => {
    return qty * price * (1 - discount / 100)
  }

  const handleItemChange = (idx: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: val }
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercent') {
      updated[idx].total = calculateItemTotal(
        Number(updated[idx].quantity),
        Number(updated[idx].unitPrice),
        Number(updated[idx].discountPercent)
      )
    }
    if (field === 'vatRate') {
      const rate = Number(val)
      updated[idx].taxCategory = rate === 0 ? 'AE' : 'S'
    }
    setItems(updated)
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `ii-${Date.now()}`,
        description: 'Professional Services / Deliverable',
        quantity: 1,
        unit: 'unit',
        unitPrice: 500,
        discountPercent: 0,
        vatRate: 21,
        total: 500,
        taxCategory: 'S',
      },
    ])
  }

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)

  // Build Tax Breakdown
  const taxMap = new Map<number, { rate: number; category: string; base: number; tax: number }>()
  items.forEach((item) => {
    const existing = taxMap.get(item.vatRate) || {
      rate: item.vatRate,
      category: item.taxCategory,
      base: 0,
      tax: 0,
    }
    existing.base += item.total
    existing.tax += item.total * (item.vatRate / 100)
    taxMap.set(item.vatRate, existing)
  })

  const taxBreakdown: TaxBreakdownItem[] = Array.from(taxMap.values()).map((t) => ({
    rate: t.rate,
    taxCategory: t.category,
    taxableAmount: t.base,
    taxAmount: t.tax,
  }))

  const taxTotal = taxBreakdown.reduce((sum, t) => sum + t.taxAmount, 0)
  const total = subtotal + taxTotal

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId || items.length === 0) return

    const payload = {
      number,
      companyId,
      contactId: contactId || undefined,
      issueDate,
      dueDate,
      reference,
      structuredReference,
      items,
      subtotal,
      taxBreakdown,
      taxTotal,
      total,
      amountPaid: invoice?.amountPaid || 0,
      currency: 'EUR',
      status,
      peppolStatus: invoice?.peppolStatus || ('valid' as const),
      notes,
      paymentTerms,
    }

    if (invoice) {
      updateInvoice({ ...invoice, ...payload })
    } else {
      addInvoice(payload)
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
                backgroundColor: 'var(--sb-success-soft)',
                color: 'var(--sb-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>{invoice ? 'Edit Invoice' : 'Create Commercial Invoice'}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>Ref: {number} • Peppol BIS 3.0 Ready</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Header Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Invoice Number *</label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Client Account *</label>
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
                    {c.name} (VAT: {c.vatNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Contact Person</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="form-select-sandbox"
              >
                <option value="">-- General Billing --</option>
                {companyContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Invoice Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="form-select-sandbox"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="peppol_sent">Sent via Peppol</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '1rem', marginBottom: '1.5rem' }}>
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
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Structured Communication (Belgian / SEPA)</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  value={structuredReference}
                  onChange={(e) => setStructuredReference(e.target.value)}
                  placeholder="+++090/9337/55493+++"
                  className="form-input-sandbox"
                  style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 700 }}
                />
                <button
                  type="button"
                  onClick={() => setStructuredReference(generateStructuredReference(Date.now()))}
                  className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary"
                  title="Generate New Reference"
                >
                  <Sparkles size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ fontSize: '0.95rem' }}>Invoice Line Items & Tax Categories</h4>
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
                    <th style={{ width: '40%' }}>Description</th>
                    <th style={{ width: '9%' }}>Qty</th>
                    <th style={{ width: '11%' }}>Unit</th>
                    <th style={{ width: '12%' }}>Unit Price (€)</th>
                    <th style={{ width: '12%' }}>VAT & Code</th>
                    <th style={{ width: '13%', textAlign: 'right' }}>Total (€)</th>
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
                          placeholder="Service or product description..."
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
                          <option value="hours">hours (HUR)</option>
                          <option value="days">days (DAY)</option>
                          <option value="unit">item (C62)</option>
                          <option value="month">month (MON)</option>
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
                          <option value="21">21% (Standard - S)</option>
                          <option value="12">12% (Reduced - S)</option>
                          <option value="6">6% (Reduced - S)</option>
                          <option value="0">0% (Reverse Charge - AE)</option>
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

          {/* Totals Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Notes & Legal Statements</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions, VAT reverse charge mentions..."
                className="form-textarea-sandbox"
              />
            </div>

            <div className="card-sandbox" style={{ padding: '1rem', backgroundColor: 'var(--sb-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span>Subtotal (Net):</span>
                <strong>€{subtotal.toFixed(2)}</strong>
              </div>

              {taxBreakdown.map((tb, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                  <span>VAT ({tb.rate}% - Category {tb.taxCategory}):</span>
                  <span>€{tb.taxAmount.toFixed(2)}</span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--sb-border)',
                  paddingTop: '0.65rem',
                  marginTop: '0.4rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--sb-heading)',
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--sb-primary)' }}>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {invoice ? 'Update Invoice' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
