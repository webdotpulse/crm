import React, { useState } from 'react'
import { X, Receipt, Upload, Building, Calendar, DollarSign, Tag, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Expense, ExpenseCategory, ExpenseStatus } from '../../types'
import { formatCurrency } from '../../services/currencyService'

interface ExpenseModalProps {
  expenseToEdit?: Expense | null
  onClose: () => void
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expenseToEdit, onClose }) => {
  const { addExpense, updateExpense, suppliers, selectedCurrency, activeLegalEntity } = useApp()

  const [number, setNumber] = useState(expenseToEdit?.number || `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  const [supplierName, setSupplierName] = useState(expenseToEdit?.supplierName || '')
  const [supplierVat, setSupplierVat] = useState(expenseToEdit?.supplierVat || '')
  const [supplierIban, setSupplierIban] = useState(expenseToEdit?.supplierIban || '')
  const [category, setCategory] = useState<ExpenseCategory>(expenseToEdit?.category || 'hosting_software')
  const [invoiceDate, setInvoiceDate] = useState(expenseToEdit?.invoiceDate || new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(expenseToEdit?.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))
  const [subtotal, setSubtotal] = useState<number>(expenseToEdit?.subtotal || 0)
  const [vatRate, setVatRate] = useState<number>(expenseToEdit ? (expenseToEdit.vatTotal / (expenseToEdit.subtotal || 1)) * 100 : 21)
  const [status, setStatus] = useState<ExpenseStatus>(expenseToEdit?.status || 'pending')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'direct_debit' | 'card' | 'cash'>(expenseToEdit?.paymentMethod || 'bank_transfer')
  const [notes, setNotes] = useState(expenseToEdit?.notes || '')

  const vatTotal = Number(((subtotal * vatRate) / 100).toFixed(2))
  const total = Number((subtotal + vatTotal).toFixed(2))

  const handleSupplierSelect = (supId: string) => {
    const sup = suppliers.find((s) => s.id === supId)
    if (sup) {
      setSupplierName(sup.name)
      if (sup.vatNumber) setSupplierVat(sup.vatNumber)
      if (sup.iban) setSupplierIban(sup.iban)
      setCategory(sup.defaultCategory)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const expenseData: Expense = {
      id: expenseToEdit?.id || `exp-${Date.now()}`,
      number,
      supplierName,
      supplierVat: supplierVat || undefined,
      supplierIban: supplierIban || undefined,
      category,
      invoiceDate,
      dueDate,
      subtotal,
      vatTotal,
      total,
      currency: selectedCurrency,
      status,
      paymentMethod,
      notes: notes || undefined,
      legalEntityId: activeLegalEntity.id,
      createdAt: expenseToEdit?.createdAt || new Date().toISOString(),
    }

    if (expenseToEdit) {
      updateExpense(expenseData)
    } else {
      addExpense(expenseData)
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
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                {expenseToEdit ? 'Edit Supplier Expense' : 'Record Supplier Expense'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Accounts Payable & inbound cost tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sb-body)',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick Supplier Picker */}
          {suppliers.length > 0 && !expenseToEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                ⚡ Quick Pick Known Supplier
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {suppliers.map((sup) => (
                  <button
                    type="button"
                    key={sup.id}
                    onClick={() => handleSupplierSelect(sup.id)}
                    className="badge-sandbox badge-soft-primary"
                    style={{
                      cursor: 'pointer',
                      border: '1px solid var(--sb-border)',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      backgroundColor: supplierName === sup.name ? 'var(--sb-primary)' : 'var(--sb-card-bg)',
                      color: supplierName === sup.name ? '#ffffff' : 'var(--sb-heading)',
                    }}
                  >
                    🏢 {sup.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Invoice / Receipt Number *
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                placeholder="e.g. AWS-2026-9918"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                placeholder="e.g. Amazon Web Services"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Supplier VAT / Peppol ID
              </label>
              <input
                type="text"
                value={supplierVat}
                onChange={(e) => setSupplierVat(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                placeholder="e.g. BE0202239951"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Supplier IBAN
              </label>
              <input
                type="text"
                value={supplierIban}
                onChange={(e) => setSupplierIban(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                placeholder="e.g. BE29 2100 0000 1234"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Cost Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="hosting_software">Hosting & Cloud Infrastructure</option>
                <option value="subcontractors">Freelancers & Subcontractors</option>
                <option value="office_rent">Office Lease & Co-working</option>
                <option value="hardware">Hardware & IT Equipment</option>
                <option value="telecom">Telecom & Internet</option>
                <option value="travel_meals">Travel & Client Entertainment</option>
                <option value="professional_services">Accounting & Legal Fees</option>
                <option value="marketing">Marketing & Paid Ads</option>
                <option value="other">General Operating Expenses</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="pending">Pending Approval / Unpaid</option>
                <option value="approved">Approved for Payment</option>
                <option value="paid">Settled & Paid</option>
                <option value="rejected">Rejected / Disputed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Financial Calculation */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '12px',
              border: '1px solid var(--sb-border)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.25rem' }}>
                  Net Subtotal (excl. VAT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={subtotal}
                  onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.25rem' }}>
                  VAT Rate %
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="21">21% Standard</option>
                  <option value="12">12% Intermediate</option>
                  <option value="6">6% Reduced</option>
                  <option value="0">0% Reverse Charge / Exempt</option>
                </select>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                  VAT: {formatCurrency(vatTotal, selectedCurrency)}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
                  {formatCurrency(total, selectedCurrency)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>Total Payable</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Internal Description & Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-sandbox"
              style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              placeholder="e.g. Monthly cloud compute and backup storage fees"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-sandbox btn-sandbox-outline"
              style={{ padding: '0.6rem 1.25rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle size={16} />
              {expenseToEdit ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
