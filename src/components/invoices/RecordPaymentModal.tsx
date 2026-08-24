import React, { useState } from 'react'
import { X, DollarSign, CheckCircle2 } from 'lucide-react'
import { Invoice } from '../../types'
import { useApp } from '../../context/AppContext'

interface RecordPaymentModalProps {
  invoice: Invoice
  onClose: () => void
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ invoice, onClose }) => {
  const { recordPayment } = useApp()

  const remainingBalance = Math.max(0, invoice.total - (invoice.amountPaid || 0))
  const [amount, setAmount] = useState(remainingBalance)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState<'sepa' | 'bank_transfer' | 'card' | 'peppol_payment' | 'other'>('sepa')
  const [reference, setReference] = useState(invoice.structuredReference)
  const [note, setNote] = useState('Payment reconciled via bank statement.')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return

    recordPayment({
      invoiceId: invoice.id,
      amount: Number(amount),
      paymentDate,
      method,
      reference,
      note,
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Record Payment</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                {invoice.number} • Remaining: €{remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Payment Amount (€) *</label>
              <input
                type="number"
                min="0.01"
                max={remainingBalance}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Payment Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="form-select-sandbox"
              >
                <option value="sepa">SEPA Credit Transfer</option>
                <option value="bank_transfer">Direct Bank Wire</option>
                <option value="peppol_payment">Peppol E-Payment Hub</option>
                <option value="card">Credit / Debit Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Bank / Transaction Ref</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Reconciliation Notes</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cleared in BNP Paribas Fortis account..."
              className="form-input-sandbox"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-success">
              <CheckCircle2 size={16} />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
