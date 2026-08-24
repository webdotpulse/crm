import React, { useState } from 'react'
import {
  Receipt,
  Plus,
  FileCode2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Building,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Expense, ExpenseCategory, ExpenseStatus } from '../../types'
import { formatCurrency } from '../../services/currencyService'
import { ExpenseModal } from './ExpenseModal'
import { InboundPeppolModal } from './InboundPeppolModal'

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    invoices,
    deleteExpense,
    updateExpense,
    selectedCurrency,
    suppliers,
  } = useApp()

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false)
  const [isPeppolModalOpen, setIsPeppolModalOpen] = useState<boolean>(false)
  const [selectedExpenseToEdit, setSelectedExpenseToEdit] = useState<Expense | null>(null)

  // Financial P&L calculations
  const totalInvoicedRevenue = invoices
    .filter((i) => i.status !== 'draft')
    .reduce((sum, i) => sum + i.subtotal, 0)

  const totalOperatingExpenses = expenses
    .filter((e) => e.status !== 'rejected')
    .reduce((sum, e) => sum + e.subtotal, 0)

  const netEbitdaProfit = totalInvoicedRevenue - totalOperatingExpenses
  const netMarginPercent = totalInvoicedRevenue > 0
    ? Math.round((netEbitdaProfit / totalInvoicedRevenue) * 100)
    : 0

  const pendingPayablesTotal = expenses
    .filter((e) => e.status === 'pending' || e.status === 'approved')
    .reduce((sum, e) => sum + e.total, 0)

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        e.supplierName.toLowerCase().includes(q) ||
        e.number.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      )
    }
    return true
  })

  const getCategoryBadge = (cat: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, { label: string; badge: string }> = {
      hosting_software: { label: 'Cloud & Hosting', badge: 'badge-soft-primary' },
      subcontractors: { label: 'Subcontractors', badge: 'badge-soft-purple' },
      office_rent: { label: 'Office Lease', badge: 'badge-soft-warning' },
      hardware: { label: 'Hardware', badge: 'badge-soft-primary' },
      telecom: { label: 'Telecom', badge: 'badge-soft-info' },
      travel_meals: { label: 'Travel', badge: 'badge-soft-warning' },
      professional_services: { label: 'Legal & Audit', badge: 'badge-soft-success' },
      marketing: { label: 'Marketing', badge: 'badge-soft-purple' },
      other: { label: 'General Ops', badge: 'badge-soft-primary' },
    }
    const item = labels[cat] || { label: cat, badge: 'badge-soft-primary' }
    return <span className={`badge-sandbox ${item.badge}`}>{item.label}</span>
  }

  const getStatusBadge = (st: ExpenseStatus) => {
    if (st === 'paid') return <span className="badge-sandbox badge-soft-success">Paid</span>
    if (st === 'approved') return <span className="badge-sandbox badge-soft-primary">Approved</span>
    if (st === 'pending') return <span className="badge-sandbox badge-soft-warning">Pending Review</span>
    return <span className="badge-sandbox badge-soft-danger">Rejected</span>
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Accounts Payable & Inbound Peppol
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Track supplier invoices, vendor receipts, and live Profit & Loss (P&L) margins
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsPeppolModalOpen(true)}
            className="btn-sandbox btn-sandbox-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem' }}
          >
            <FileCode2 size={16} color="var(--sb-primary)" />
            <span>📥 Receive Peppol XML</span>
          </button>

          <button
            onClick={() => {
              setSelectedExpenseToEdit(null)
              setIsExpenseModalOpen(true)
            }}
            className="btn-sandbox btn-sandbox-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* P&L Financial KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Revenue */}
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Total Invoiced Revenue</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(totalInvoicedRevenue, selectedCurrency)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            From {invoices.filter((i) => i.status !== 'draft').length} issued client invoices
          </div>
        </div>

        {/* Expenses */}
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Operating Expenses</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(totalOperatingExpenses, selectedCurrency)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem', fontWeight: 600 }}>
            {expenses.length} supplier & overhead bills recorded
          </div>
        </div>

        {/* Net Profit & EBITDA */}
        <div className="card-sandbox" style={{ padding: '1.25rem', border: '1px solid rgba(63, 120, 224, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Net Profit / EBITDA</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
              +{netMarginPercent}% Margin
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: netEbitdaProfit >= 0 ? '#10b981' : '#ef4444' }}>
            {formatCurrency(netEbitdaProfit, selectedCurrency)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Real-time Gross Profit before corporate tax
          </div>
        </div>

        {/* Pending Payables */}
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Pending Payables</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(250, 183, 88, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fab758',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(pendingPayablesTotal, selectedCurrency)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fab758', marginTop: '0.35rem', fontWeight: 600 }}>
            {expenses.filter((e) => e.status === 'pending').length} bills awaiting payment
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search supplier, bill #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Categories</option>
            <option value="hosting_software">Hosting & Software</option>
            <option value="subcontractors">Subcontractors</option>
            <option value="office_rent">Office Lease</option>
            <option value="hardware">Hardware</option>
            <option value="telecom">Telecom</option>
            <option value="professional_services">Legal & Accounting</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
          Showing <strong>{filteredExpenses.length}</strong> of {expenses.length} expenses
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                EXPENSE # / SUPPLIER
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                CATEGORY
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                DATE / DUE
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                STATUS
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                SUBTOTAL
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                TOTAL PAYABLE
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'center' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr
                key={exp.id}
                style={{
                  borderBottom: '1px solid var(--sb-border)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--sb-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                        {exp.supplierName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{exp.number}</span>
                        {exp.isPeppolInbound && (
                          <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                            Peppol BIS 3.0
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  {getCategoryBadge(exp.category)}
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-heading)' }}>{exp.invoiceDate}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Due: {exp.dueDate}</div>
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  {getStatusBadge(exp.status)}
                </td>

                <td style={{ padding: '1rem 1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--sb-body)' }}>
                  {formatCurrency(exp.subtotal, selectedCurrency)}
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(exp.total, selectedCurrency)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>
                    VAT: {formatCurrency(exp.vatTotal, selectedCurrency)}
                  </div>
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                    {exp.status !== 'paid' && (
                      <button
                        onClick={() =>
                          updateExpense({
                            ...exp,
                            status: 'paid',
                            paymentDate: new Date().toISOString().slice(0, 10),
                            paymentMethod: 'bank_transfer',
                          })
                        }
                        title="Mark as Paid"
                        className="btn-sandbox btn-sandbox-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#10b981', borderColor: '#10b981' }}
                      >
                        ✓ Pay
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedExpenseToEdit(exp)
                        setIsExpenseModalOpen(true)
                      }}
                      title="Edit Expense"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--sb-body)',
                        padding: '0.3rem',
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      title="Delete Expense"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--sb-danger)',
                        padding: '0.3rem',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  <Receipt size={36} color="var(--sb-body)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No expenses found</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Record a supplier receipt or import an inbound Peppol XML file.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isExpenseModalOpen && (
        <ExpenseModal
          expenseToEdit={selectedExpenseToEdit}
          onClose={() => {
            setIsExpenseModalOpen(false)
            setSelectedExpenseToEdit(null)
          }}
        />
      )}

      {isPeppolModalOpen && (
        <InboundPeppolModal
          onClose={() => setIsPeppolModalOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
