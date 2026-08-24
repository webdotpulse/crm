import React, { useState } from 'react'
import {
  Receipt,
  Plus,
  Search,
  Network,
  ShieldCheck,
  DollarSign,
  Building2,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react'
import { Invoice } from '../../types'
import { useApp } from '../../context/AppContext'
import { InvoiceEditorModal } from './InvoiceEditorModal'
import { InvoicePreviewModal } from './InvoicePreviewModal'
import { RecordPaymentModal } from './RecordPaymentModal'

interface InvoicesViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
  onInspectPeppol: (invoice: Invoice) => void
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenQuickModal,
  onInspectPeppol,
}) => {
  const {
    invoices,
    companies,
    deleteInvoice,
    sendInvoiceViaPeppol,
    setCurrentView,
  } = useApp()

  const [activeFilter, setActiveFilter] = useState<'all' | 'unpaid' | 'paid' | 'peppol' | 'draft'>('all')
  const [localSearch, setLocalSearch] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [sendingPeppolId, setSendingPeppolId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSendPeppol = async (invoiceId: string) => {
    setSendingPeppolId(invoiceId)
    const result = await sendInvoiceViaPeppol(invoiceId)
    setSendingPeppolId(null)
    if (result.success) {
      showToast('✓ Invoice validated against EN 16931 and successfully transmitted via Peppol AS4 network!', 'success')
    } else {
      showToast(`⚠ Peppol transmission issue: ${result.error}`, 'error')
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'unpaid' && inv.status === 'paid') return false
    if (activeFilter === 'paid' && inv.status !== 'paid') return false
    if (activeFilter === 'peppol' && inv.peppolStatus !== 'delivered') return false
    if (activeFilter === 'draft' && inv.status !== 'draft') return false

    if (!localSearch.trim()) return true
    const s = localSearch.toLowerCase()
    const comp = companies.find((c) => c.id === inv.companyId)
    return (
      inv.number.toLowerCase().includes(s) ||
      inv.structuredReference.toLowerCase().includes(s) ||
      (comp && comp.name.toLowerCase().includes(s))
    )
  })

  // KPI Metrics
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)
  const totalUnpaid = invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0)
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.amountPaid || i.total), 0)
  const peppolCount = invoices.filter((i) => i.peppolStatus === 'delivered').length

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '1rem 1.5rem',
            borderRadius: 'var(--sb-radius)',
            backgroundColor: notification.type === 'success' ? '#1d7e63' : '#b8333d',
            color: '#ffffff',
            fontWeight: 700,
            boxShadow: 'var(--sb-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Commercial Invoicing & Peppol Hub</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Issue EN 16931-compliant electronic invoices, generate structured Belgian payment references, and track AS4 deliveries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setEditingInvoice(null)
              setIsEditorOpen(true)
            }}
            className="btn-sandbox btn-sandbox-primary"
          >
            <Plus size={16} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>TOTAL INVOICED</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            €{totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>{invoices.length} total issued</span>
        </div>

        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>OUTSTANDING (DUE)</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-warning)' }}>
            €{totalUnpaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>awaiting settlement</span>
        </div>

        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>COLLECTED CASH</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-success)' }}>
            €{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>reconciled payments</span>
        </div>

        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>PEPPOL DELIVERIES</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
            {peppolCount} Invoices
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>transmitted via AS4 network</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card-sandbox"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Invoices (${invoices.length})` },
            { id: 'unpaid', label: `Unpaid / Due (${invoices.filter((i) => i.status !== 'paid').length})` },
            { id: 'paid', label: `Paid (${invoices.filter((i) => i.status === 'paid').length})` },
            { id: 'peppol', label: `Peppol Delivered (${peppolCount})` },
            { id: 'draft', label: `Drafts (${invoices.filter((i) => i.status === 'draft').length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`btn-sandbox btn-sandbox-sm ${activeFilter === f.id ? 'btn-sandbox-primary' : 'btn-sandbox-secondary'}`}
              style={{ borderRadius: 'var(--sb-radius-pill)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--sb-body-subtle)' }} />
          <input
            type="text"
            placeholder="Search invoice or reference..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="form-input-sandbox"
            style={{
              paddingLeft: '32px',
              height: '34px',
              fontSize: '0.8rem',
              borderRadius: 'var(--sb-radius-pill)',
            }}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table className="table-sandbox">
          <thead>
            <tr>
              <th>Invoice # & Reference</th>
              <th>Client Company</th>
              <th>Issue / Due Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Peppol Network</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body-subtle)' }}>
                  No invoices found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const comp = companies.find((c) => c.id === inv.companyId)
                const isPaid = inv.status === 'paid'
                const isPeppolSent = inv.status === 'peppol_sent' || inv.peppolStatus === 'delivered'
                const isSending = sendingPeppolId === inv.id

                return (
                  <tr key={inv.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{inv.number}</div>
                        <div style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.75rem', color: 'var(--sb-primary)' }}>
                          {inv.structuredReference}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={14} color="var(--sb-body-subtle)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>{comp?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>VAT: {comp?.vatNumber}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--sb-heading)' }}>{inv.issueDate}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>Due: {inv.dueDate}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                        €{inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {inv.amountPaid > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--sb-success)', fontWeight: 600 }}>
                          Paid: €{inv.amountPaid.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge-soft badge-soft-${
                          inv.status === 'paid'
                            ? 'success'
                            : inv.status === 'peppol_sent'
                            ? 'primary'
                            : inv.status === 'overdue'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {inv.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {isPeppolSent ? (
                          <span className="badge-soft badge-soft-success" title="Delivered via Peppol AS4 network">
                            <CheckCircle2 size={12} />
                            <span>DELIVERED</span>
                          </span>
                        ) : (
                          <span className="badge-soft badge-soft-primary" title="EN 16931 Validated">
                            <ShieldCheck size={12} />
                            <span>READY</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {/* Send via Peppol */}
                        {!isPeppolSent && !isPaid && (
                          <button
                            onClick={() => handleSendPeppol(inv.id)}
                            disabled={isSending}
                            className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                            title="Dispatch electronic invoice via Peppol network"
                          >
                            <Network size={13} />
                            <span>{isSending ? 'Sending...' : 'Peppol'}</span>
                          </button>
                        )}

                        {/* Record Payment */}
                        {!isPaid && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="btn-sandbox btn-sandbox-sm btn-sandbox-success"
                            title="Record incoming payment"
                          >
                            <DollarSign size={13} />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Preview Printable PDF */}
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                          title="Printable Invoice View"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Inspect XML in Peppol Hub */}
                        <button
                          onClick={() => onInspectPeppol(inv)}
                          className="btn-sandbox btn-icon btn-sandbox-secondary"
                          style={{ width: '28px', height: '28px' }}
                          title="Inspect Peppol BIS 3.0 XML"
                        >
                          <ShieldCheck size={13} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingInvoice(inv)
                            setIsEditorOpen(true)
                          }}
                          className="btn-sandbox btn-icon btn-sandbox-secondary"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Invoice"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="btn-sandbox btn-icon btn-sandbox-danger"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete Invoice"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isEditorOpen && (
        <InvoiceEditorModal invoice={editingInvoice} onClose={() => setIsEditorOpen(false)} />
      )}

      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onSendPeppol={(id) => handleSendPeppol(id)}
          onOpenPeppolHub={(inv) => {
            setPreviewInvoice(null)
            onInspectPeppol(inv)
          }}
        />
      )}

      {paymentInvoice && (
        <RecordPaymentModal invoice={paymentInvoice} onClose={() => setPaymentInvoice(null)} />
      )}
    </div>
  )
}
