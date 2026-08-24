import React from 'react'
import {
  X,
  Printer,
  Download,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { Invoice } from '../../types'
import { useApp } from '../../context/AppContext'

interface InvoicePreviewModalProps {
  invoice: Invoice
  onClose: () => void
  onSendPeppol: (invoiceId: string) => void
  onOpenPeppolHub: (invoice: Invoice) => void
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  onSendPeppol,
  onOpenPeppolHub,
}) => {
  const { companies, contacts, companyProfile } = useApp()

  const client = companies.find((c) => c.id === invoice.companyId)
  const contact = contacts.find((c) => c.id === invoice.contactId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--sb-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Invoice Preview: {invoice.number}</h3>
            <span
              className={`badge-soft badge-soft-${
                invoice.status === 'paid'
                  ? 'success'
                  : invoice.status === 'peppol_sent'
                  ? 'primary'
                  : invoice.status === 'overdue'
                  ? 'danger'
                  : 'warning'
              }`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => onOpenPeppolHub(invoice)}
              className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
            >
              <ShieldCheck size={14} />
              <span>Inspect Peppol XML</span>
            </button>

            {invoice.status !== 'peppol_sent' && invoice.status !== 'paid' && (
              <button
                onClick={() => onSendPeppol(invoice.id)}
                className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
              >
                <Network size={14} />
                <span>Send via Peppol</span>
              </button>
            )}

            <button onClick={() => window.print()} className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary">
              <Printer size={14} />
              <span>Print</span>
            </button>

            <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div style={{ padding: '2rem', backgroundColor: 'var(--sb-bg)', maxHeight: '75vh', overflowY: 'auto' }}>
          <div
            className="card-sandbox"
            style={{
              padding: '2.5rem',
              backgroundColor: '#ffffff',
              color: '#1e2229',
              boxShadow: 'var(--sb-shadow)',
            }}
          >
            {/* Header Identity Grid */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '2px solid #e9ecf2',
                paddingBottom: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#1e2229', fontWeight: 800 }}>{companyProfile.name}</h2>
                <div style={{ fontSize: '0.85rem', color: '#60697b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {companyProfile.address}, {companyProfile.postalCode} {companyProfile.city} ({companyProfile.country})
                  <br />
                  VAT ID: <strong>{companyProfile.vatNumber}</strong>
                  <br />
                  Peppol Endpoint: <strong style={{ color: '#2f5fb8' }}>{companyProfile.peppolScheme}:{companyProfile.peppolEndpoint}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e2229', marginBottom: '0.25rem' }}>
                  INVOICE
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2f5fb8' }}>{invoice.number}</div>
                <div style={{ fontSize: '0.82rem', color: '#60697b' }}>Issue Date: {invoice.issueDate}</div>
                <div style={{ fontSize: '0.82rem', color: '#60697b' }}>Due Date: {invoice.dueDate}</div>
              </div>
            </div>

            {/* Recipient & Structured Reference Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#959ca9', textTransform: 'uppercase' }}>
                  INVOICE TO:
                </span>
                <h3 style={{ fontSize: '1.15rem', color: '#1e2229', marginTop: '0.2rem' }}>{client?.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#60697b', lineHeight: 1.4 }}>
                  {contact && <div>Attn: {contact.firstName} {contact.lastName}</div>}
                  {client?.address}, {client?.postalCode} {client?.city} ({client?.country})
                  <br />
                  VAT Number: <strong>{client?.vatNumber || 'N/A'}</strong>
                  <br />
                  Peppol Identifier: <strong>{client?.peppolScheme}:{client?.peppolEndpoint || client?.vatNumber}</strong>
                </div>
              </div>

              {/* Payment Box */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#959ca9', textTransform: 'uppercase' }}>
                  PAYMENT INSTRUCTIONS (SEPA)
                </span>
                <div style={{ fontSize: '0.82rem', color: '#1e2229', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  <div>IBAN: <strong>{companyProfile.iban}</strong></div>
                  <div>BIC / SWIFT: <strong>{companyProfile.bic}</strong></div>
                  <div style={{ marginTop: '0.4rem' }}>
                    Structured Reference:
                    <div
                      style={{
                        fontFamily: 'var(--sb-font-mono)',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: '#2f5fb8',
                        backgroundColor: '#eef3fc',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginTop: '0.2rem',
                      }}
                    >
                      {invoice.structuredReference}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                marginBottom: '1.75rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f6f7f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#60697b' }}>Item Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#60697b' }}>Quantity</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b' }}>VAT</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b' }}>Net Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e9ecf2' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#1e2229', fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#60697b' }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#60697b' }}>
                      €{item.unitPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#60697b' }}>
                      {item.vatRate}% ({item.taxCategory})
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#1e2229' }}>
                      €{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & VAT Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60697b', fontSize: '0.85rem' }}>
                  <span>Subtotal (Net):</span>
                  <strong>€{invoice.subtotal.toFixed(2)}</strong>
                </div>

                {invoice.taxBreakdown.map((tb, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#60697b', fontSize: '0.8rem' }}>
                    <span>VAT ({tb.rate}% {tb.taxCategory}):</span>
                    <span>€{tb.taxAmount.toFixed(2)}</span>
                  </div>
                ))}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '2px solid #1e2229',
                    paddingTop: '0.5rem',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#1e2229',
                  }}
                >
                  <span>Total Incl. VAT:</span>
                  <span style={{ color: '#2f5fb8' }}>€{invoice.total.toFixed(2)}</span>
                </div>

                {invoice.amountPaid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1d7e63', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span>Amount Paid:</span>
                    <span>-€{invoice.amountPaid.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Legal Notices */}
            {invoice.notes && (
              <div style={{ borderTop: '1px solid #e9ecf2', paddingTop: '1rem', fontSize: '0.8rem', color: '#60697b' }}>
                <strong>Notes:</strong> {invoice.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
