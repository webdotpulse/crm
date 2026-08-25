import React, { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Building2,
  Calendar,
  Sparkles,
  Package,
  User,
  ShieldCheck,
} from 'lucide-react'
import { Invoice, InvoiceItem, ClientType } from '../../types'
import { useApp } from '../../context/AppContext'

interface InvoiceEditorModalProps {
  invoice?: Invoice | null
  onClose: () => void
}

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  invoice,
  onClose,
}) => {
  const {
    companies,
    individuals,
    legalEntities,
    activeLegalEntity,
    invoices,
    addInvoice,
    updateInvoice,
    products,
    documentTemplates,
    vatRates,
  } = useApp()

  const [legalEntityId, setLegalEntityId] = useState<string>(
    invoice?.legalEntityId || activeLegalEntity.id
  )
  const [clientType, setClientType] = useState<ClientType>(
    invoice?.clientType || 'company'
  )
  const [selectedClientId, setSelectedClientId] = useState<string>(
    invoice?.companyId || invoice?.individualId || companies[0]?.id || ''
  )

  const [issueDate, setIssueDate] = useState(
    invoice?.issueDate || new Date().toISOString().slice(0, 10)
  )
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [reference, setReference] = useState(invoice?.reference || '')
  const [notes, setNotes] = useState(
    invoice?.notes ||
      'Thank you for your business. Please remit payment quoting the structured reference.'
  )

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || [
      {
        id: `ii-1`,
        description: '',
        quantity: 1,
        unit: 'service',
        unitPrice: 0,
        discountPercent: 0,
        vatRate: 21,
        total: 0,
        taxCategory: 'S',
      },
    ]
  )

  // Generate Belgian Structured Reference Modulo-97
  const generateStructuredReference = (seedNumber: string): string => {
    const cleanSeed = seedNumber.replace(/[^0-9]/g, '').slice(-10).padStart(10, '0')
    const numVal = BigInt(cleanSeed)
    const mod97 = Number(numVal % 97n)
    const check = mod97 === 0 ? 97 : mod97
    const checkStr = String(check).padStart(2, '0')
    const full12 = cleanSeed + checkStr
    return `+++${full12.slice(0, 3)}/${full12.slice(3, 7)}/${full12.slice(7, 12)}+++`
  }

  // Load from template
  const handleLoadTemplate = (templateId: string) => {
    const tmpl = documentTemplates.find((t) => t.id === templateId)
    if (tmpl) {
      setNotes(tmpl.defaultNotes || notes)
      setItems(
        tmpl.items.map((it, idx) => ({
          id: `ii-tmpl-${Date.now()}-${idx}`,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          discountPercent: it.discountPercent,
          vatRate: it.vatRate,
          total: it.total,
          taxCategory: it.vatRate === 0 ? 'AE' : 'S',
        }))
      )
    }
  }

  // Insert from product catalog
  const handleInsertProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId)
    if (prod) {
      const newItem: InvoiceItem = {
        id: `ii-prod-${Date.now()}`,
        productId: prod.id,
        description: `${prod.name} — ${prod.description}`,
        quantity: 1,
        unit: prod.unit,
        unitPrice: prod.sellPrice,
        discountPercent: 0,
        vatRate: prod.vatRate,
        total: prod.sellPrice,
        taxCategory: prod.vatRate === 0 ? 'AE' : 'S',
      }
      setItems([...items, newItem])
    }
  }

  // Calculation helpers
  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates }
          const discountMultiplier = (100 - updated.discountPercent) / 100
          updated.total = Number((updated.quantity * updated.unitPrice * discountMultiplier).toFixed(2))
          if (updated.vatRate === 0) {
            updated.taxCategory = 'AE'
          } else {
            updated.taxCategory = 'S'
          }
          return updated
        }
        return item
      })
    )
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `ii-${Date.now()}`,
      description: '',
      quantity: 1,
      unit: 'service',
      unitPrice: 0,
      discountPercent: 0,
      vatRate: 21,
      total: 0,
      taxCategory: 'S',
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
    if (items.length === 0) return

    const issuingEntity = legalEntities.find((e) => e.id === legalEntityId) || activeLegalEntity

    if (invoice) {
      updateInvoice({
        ...invoice,
        legalEntityId,
        clientType,
        companyId: clientType === 'company' ? selectedClientId : undefined,
        individualId: clientType === 'individual' ? selectedClientId : undefined,
        issueDate,
        dueDate,
        reference,
        items,
        subtotal,
        taxTotal,
        total: grandTotal,
        notes,
      })
    } else {
      const invSeq = String(invoices.length + 1).padStart(4, '0')
      const prefix = issuingEntity.invoicePrefix || 'INV-'
      const invoiceNumber = `${prefix}2026-${invSeq}`
      const seed = `${new Date().getFullYear()}${invSeq}${Math.floor(Math.random() * 1000)}`

      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        number: invoiceNumber,
        legalEntityId,
        clientType,
        companyId: clientType === 'company' ? selectedClientId : undefined,
        individualId: clientType === 'individual' ? selectedClientId : undefined,
        issueDate,
        dueDate,
        reference,
        structuredReference: generateStructuredReference(seed),
        items,
        subtotal,
        taxBreakdown: [
          {
            rate: 21,
            taxCategory: 'S',
            taxableAmount: subtotal,
            taxAmount: taxTotal,
          },
        ],
        taxTotal,
        total: grandTotal,
        amountPaid: 0,
        currency: issuingEntity.defaultCurrency || 'EUR',
        status: 'issued',
        peppolStatus: 'valid',
        notes,
        paymentTerms: '30 days net',
        createdAt: new Date().toISOString(),
      }
      addInvoice(newInv)
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
                backgroundColor: 'var(--sb-success-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-success)',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                {invoice ? `Edit Invoice ${invoice.number}` : 'Create Commercial Invoice'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Compliant with European Standard EN 16931 & Peppol BIS Billing 3.0
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Toolbar: Templates & Products */}
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
                Select invoice template...
              </option>
              {documentTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

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
            {/* Issuing Entity & Client */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Issuing Legal Entity *</label>
                <select
                  value={legalEntityId}
                  onChange={(e) => setLegalEntityId(e.target.value)}
                  className="form-select-sandbox"
                >
                  {legalEntities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} (VAT: {ent.vatNumber})
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="form-label">Bill To Client *</label>
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
            </div>

            {/* Dates & Reference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Issue Date *</label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Client PO / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-994"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Invoice Line Items</label>
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
                            <option value="service">service</option>
                            <option value="hours">hours</option>
                            <option value="pcs">pcs</option>
                            <option value="days">days</option>
                            <option value="licenses">licenses</option>
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

            {/* Notes & Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Payment Instructions & Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>

              <div className="card-sandbox" style={{ padding: '1rem', backgroundColor: 'var(--sb-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                  <span>Subtotal:</span>
                  <strong>€{subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.88rem' }}>
                  <span>VAT Total:</span>
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
              <Receipt size={15} />
              <span>{invoice ? 'Update Invoice' : 'Issue Commercial Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
