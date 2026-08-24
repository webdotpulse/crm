import React, { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, Download, Sparkles, Building2 } from 'lucide-react'
import { Quotation } from '../../types'
import { useApp } from '../../context/AppContext'

interface QuoteClientPortalModalProps {
  quote: Quotation
  onClose: () => void
}

export const QuoteClientPortalModal: React.FC<QuoteClientPortalModalProps> = ({
  quote,
  onClose,
}) => {
  const { companies, contacts, companyProfile, signQuotation } = useApp()

  const [signerName, setSignerName] = useState('Marc Vandamme (COO)')
  const [signerNotes, setSignerNotes] = useState('Approved per milestone specifications.')
  const [isSigned, setIsSigned] = useState(quote.status === 'accepted')

  const client = companies.find((c) => c.id === quote.companyId)
  const contact = contacts.find((c) => c.id === quote.contactId)

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signerName.trim()) return
    signQuotation(quote.id, signerName, signerNotes)
    setIsSigned(true)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        {/* Portal Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--sb-primary), #605dba)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Client Proposal & Sign-off Portal</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                Viewing proposal as {client?.name}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => window.print()}
              className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary"
            >
              <Download size={14} />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Proposal Document Body */}
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
            {/* Top Identity Grid */}
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
                <div style={{ fontSize: '0.85rem', color: '#60697b', marginTop: '0.25rem' }}>
                  {companyProfile.address}, {companyProfile.postalCode} {companyProfile.city}
                  <br />
                  VAT: {companyProfile.vatNumber} • Peppol: {companyProfile.peppolEndpoint}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isSigned ? '#eaf7f3' : '#eef3fc',
                    color: isSigned ? '#1d7e63' : '#2f5fb8',
                    marginBottom: '0.5rem',
                  }}
                >
                  {isSigned ? 'SIGNED & ACCEPTED' : 'OFFICIAL PROPOSAL'}
                </span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e2229' }}>{quote.number}</div>
                <div style={{ fontSize: '0.82rem', color: '#60697b' }}>Issue Date: {quote.issueDate}</div>
                <div style={{ fontSize: '0.82rem', color: '#60697b' }}>Valid Until: {quote.validUntilDate}</div>
              </div>
            </div>

            {/* Recipient info */}
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#959ca9', textTransform: 'uppercase' }}>
                PREPARED FOR:
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#1e2229', marginTop: '0.2rem' }}>{client?.name}</h3>
              <div style={{ fontSize: '0.85rem', color: '#60697b' }}>
                Attn: {contact ? `${contact.firstName} ${contact.lastName} (${contact.role})` : 'Management Team'}
                <br />
                {client?.address}, {client?.postalCode} {client?.city} ({client?.country})
                <br />
                VAT: {client?.vatNumber || 'N/A'} • Peppol Endpoint: {client?.peppolEndpoint || 'N/A'}
              </div>
            </div>

            {/* Proposal Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#2f5fb8', fontWeight: 700 }}>{quote.title}</h4>
            </div>

            {/* Items Table */}
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                marginBottom: '2rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f6f7f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#60697b', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#60697b', fontWeight: 700 }}>Qty</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b', fontWeight: 700 }}>Rate</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b', fontWeight: 700 }}>VAT</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#60697b', fontWeight: 700 }}>Total (€)</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e9ecf2' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#1e2229', fontWeight: 500 }}>{item.description}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#60697b' }}>
                      {item.quantity} {item.unit}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#60697b' }}>
                      €{item.unitPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#60697b' }}>{item.vatRate}%</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#1e2229' }}>
                      €{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60697b', fontSize: '0.85rem' }}>
                  <span>Subtotal:</span>
                  <strong>€{quote.subtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60697b', fontSize: '0.85rem' }}>
                  <span>VAT Amount:</span>
                  <strong>€{quote.taxTotal.toFixed(2)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '2px solid #1e2229',
                    paddingTop: '0.5rem',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#1e2229',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>€{quote.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            {quote.terms && (
              <div style={{ borderTop: '1px solid #e9ecf2', paddingTop: '1rem', fontSize: '0.8rem', color: '#60697b', marginBottom: '2rem' }}>
                <strong>Terms & Conditions:</strong> {quote.terms}
              </div>
            )}

            {/* Digital Sign-off Section */}
            <div
              style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: isSigned ? '#eaf7f3' : '#f8fafc',
              }}
            >
              {isSigned ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={28} color="#1d7e63" />
                  <div>
                    <h4 style={{ color: '#1d7e63', fontSize: '1rem' }}>Quotation Electronically Signed & Approved</h4>
                    <span style={{ fontSize: '0.8rem', color: '#60697b' }}>
                      Signed by {quote.clientSignedBy || signerName} on {quote.clientSignedAt ? new Date(quote.clientSignedAt).toLocaleString() : 'Today'}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSign}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <ShieldCheck size={18} color="var(--sb-primary)" />
                    <h4 style={{ fontSize: '0.95rem', color: '#1e2229' }}>Electronic Acceptance & Digital Signature</h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#60697b', marginBottom: '1rem' }}>
                    By clicking below, you agree to the deliverables, milestone schedules, and quotation terms outlined above.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div>
                      <label className="form-label" style={{ color: '#1e2229' }}>Full Signer Name *</label>
                      <input
                        type="text"
                        required
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        placeholder="Marc Vandamme (COO)"
                        className="form-input-sandbox"
                        style={{ height: '36px' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: '#1e2229' }}>Approval Comments</label>
                      <input
                        type="text"
                        value={signerNotes}
                        onChange={(e) => setSignerNotes(e.target.value)}
                        placeholder="Approved for milestone kickoff..."
                        className="form-input-sandbox"
                        style={{ height: '36px' }}
                      />
                    </div>
                    <button type="submit" className="btn-sandbox btn-sandbox-success" style={{ height: '36px' }}>
                      <CheckCircle2 size={16} />
                      <span>Approve & Sign</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
