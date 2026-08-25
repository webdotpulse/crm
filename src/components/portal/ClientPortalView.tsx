import React, { useState } from 'react'
import {
  Globe,
  FileText,
  Receipt,
  FolderKanban,
  CheckCircle2,
  Download,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../services/currencyService'

export const ClientPortalView: React.FC = () => {
  const {
    companies,
    individuals,
    quotations,
    invoices,
    projects,
    signQuotation,
    recordPayment,
    selectedCurrency,
    activeLegalEntity,
  } = useApp()

  // Selected client for simulator
  const [selectedClientId, setSelectedClientId] = useState<string>(companies[0]?.id || '')
  const [selectedClientType, setSelectedClientType] = useState<'company' | 'individual'>('company')
  const [portalTab, setPortalTab] = useState<'overview' | 'quotes' | 'invoices' | 'projects'>('overview')
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null)

  const activeCompany = companies.find((c) => c.id === selectedClientId)
  const activeIndividual = individuals.find((i) => i.id === selectedClientId)
  const clientName = selectedClientType === 'company'
    ? activeCompany?.name || 'Select a Client'
    : (activeIndividual ? `${activeIndividual.firstName} ${activeIndividual.lastName}` : 'Select a Client')

  // Client Documents
  const clientQuotes = quotations.filter((q) =>
    selectedClientType === 'company' ? q.companyId === selectedClientId : q.individualId === selectedClientId
  )
  const clientInvoices = invoices.filter((i) =>
    selectedClientType === 'company' ? i.companyId === selectedClientId : i.individualId === selectedClientId
  )
  const clientProjects = projects.filter((p) =>
    selectedClientType === 'company' ? p.companyId === selectedClientId : p.individualId === selectedClientId
  )

  const handleOnlinePayment = (invoice: any) => {
    recordPayment({
      invoiceId: invoice.id,
      amount: invoice.total - (invoice.amountPaid || 0),
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'card',
      reference: `Bancontact Online Payment #${Date.now().toString().slice(-6)}`,
      note: 'Instant online payment via Client Extranet Portal',
    })
    setPaymentSuccessMsg(`🎉 Payment of ${formatCurrency(invoice.total, selectedCurrency)} via Bancontact successful!`)
    setTimeout(() => setPaymentSuccessMsg(null), 5000)
  }

  const handleAcceptQuote = (quoteId: string) => {
    signQuotation(quoteId, clientName, 'Approved via Client Extranet Portal')
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Client Portal Header */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.75rem',
          backgroundColor: 'rgba(63, 120, 224, 0.08)',
          border: '1px solid rgba(63, 120, 224, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--sb-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
              Client Self-Service Portal
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
              Extranet URL: <code>{activeLegalEntity ? `https://portal.${activeLegalEntity.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.be` : 'https://portal.pulsework.io'}</code>
            </div>
          </div>
        </div>

        {/* Client Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)' }}>View Portal As:</span>
          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value)
              const isComp = companies.some((c) => c.id === e.target.value)
              setSelectedClientType(isComp ? 'company' : 'individual')
            }}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <optgroup label="B2B Companies">
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  🏢 {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="B2C Individuals">
              {individuals.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  👤 {ind.firstName} {ind.lastName}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Payment Success Alert */}
      {paymentSuccessMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            color: '#10b981',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {/* Branded Portal Frame */}
      <div
        className="card-sandbox"
        style={{
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--sb-border)',
          backgroundColor: 'var(--sb-card-bg)',
        }}
      >
        {/* Portal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--sb-border)',
            paddingBottom: '1.5rem',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                CLIENT PORTAL
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>Hosted by {activeLegalEntity.name}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Welcome, {clientName}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPortalTab('overview')}
              className={`btn-sandbox ${portalTab === 'overview' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPortalTab('quotes')}
              className={`btn-sandbox ${portalTab === 'quotes' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              Proposals ({clientQuotes.length})
            </button>
            <button
              onClick={() => setPortalTab('invoices')}
              className={`btn-sandbox ${portalTab === 'invoices' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              Invoices & Billing ({clientInvoices.length})
            </button>
            <button
              onClick={() => setPortalTab('projects')}
              className={`btn-sandbox ${portalTab === 'projects' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              Project Timeline ({clientProjects.length})
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {portalTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--sb-bg)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>Pending Proposals</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
                  {clientQuotes.filter((q) => q.status === 'sent').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', marginTop: '0.2rem' }}>
                  Awaiting your digital sign-off
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--sb-bg)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>Unsettled Invoices</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fab758', marginTop: '0.25rem' }}>
                  {formatCurrency(
                    clientInvoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + (i.total - i.amountPaid), 0),
                    selectedCurrency
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                  {clientInvoices.filter((i) => i.status !== 'paid').length} open invoices
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--sb-bg)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>Active Projects</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                  {clientProjects.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.2rem' }}>
                  In engineering & delivery
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Proposals */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem' }}>
                  Action Needed: Commercial Proposals
                </h4>
                {clientQuotes.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--sb-border)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>{q.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>{q.number} • Valid until {q.validUntilDate}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                        {formatCurrency(q.total, selectedCurrency)}
                      </div>
                      {q.status === 'sent' ? (
                        <button
                          onClick={() => handleAcceptQuote(q.id)}
                          className="btn-sandbox btn-sandbox-primary"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.72rem', marginTop: '0.3rem' }}
                        >
                          Accept & Sign
                        </button>
                      ) : (
                        <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>
                          ✓ Signed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoices */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem' }}>
                  Recent Invoices & Pay Online
                </h4>
                {clientInvoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--sb-border)',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>{inv.number}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Due: {inv.dueDate} • OGM: {inv.structuredReference}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                        {formatCurrency(inv.total, selectedCurrency)}
                      </div>
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => handleOnlinePayment(inv)}
                          className="btn-sandbox btn-sandbox-primary"
                          style={{
                            padding: '0.3rem 0.75rem',
                            fontSize: '0.72rem',
                            marginTop: '0.3rem',
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                          }}
                        >
                          💳 Pay Online
                        </button>
                      ) : (
                        <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>
                          ✓ Paid
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPOSALS */}
        {portalTab === 'quotes' && (
          <div>
            {clientQuotes.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--sb-border)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      {q.title}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                      Quote #{q.number} • Issued: {q.issueDate} • Valid Until: {q.validUntilDate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                      {formatCurrency(q.total, selectedCurrency)}
                    </div>
                    {q.status === 'sent' && (
                      <button
                        onClick={() => handleAcceptQuote(q.id)}
                        className="btn-sandbox btn-sandbox-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', marginTop: '0.4rem' }}
                      >
                        Accept & Sign Proposal
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '0.75rem' }}>
                  {q.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        padding: '0.35rem 0',
                        color: 'var(--sb-heading)',
                      }}
                    >
                      <span>• {item.description} (x{item.quantity})</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(item.total, selectedCurrency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: INVOICES */}
        {portalTab === 'invoices' && (
          <div>
            <div style={{ overflow: 'hidden', border: '1px solid var(--sb-border)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>INVOICE #</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>DATE / DUE</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>STRUCTURED OGM</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'right' }}>TOTAL</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>PAY ONLINE</th>
                  </tr>
                </thead>
                <tbody>
                  {clientInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, fontSize: '0.85rem' }}>{inv.number}</td>
                      <td style={{ padding: '1rem', fontSize: '0.78rem' }}>
                        <div>{inv.issueDate}</div>
                        <div style={{ color: 'var(--sb-body)', fontSize: '0.7rem' }}>Due: {inv.dueDate}</div>
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--sb-primary)', fontWeight: 700 }}>
                        {inv.structuredReference}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem' }}>
                        {formatCurrency(inv.total, selectedCurrency)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {inv.status === 'paid' ? (
                          <span className="badge-sandbox badge-soft-success">Paid</span>
                        ) : (
                          <span className="badge-sandbox badge-soft-warning">Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {inv.status !== 'paid' ? (
                          <button
                            onClick={() => handleOnlinePayment(inv)}
                            className="btn-sandbox btn-sandbox-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                          >
                            💳 Bancontact
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {portalTab === 'projects' && (
          <div>
            {clientProjects.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--sb-border)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {p.title}
                  </h3>
                  <span className="badge-sandbox badge-soft-primary" style={{ textTransform: 'capitalize' }}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0 0 1rem' }}>
                  {p.description || 'Active delivery sprint and deliverables.'}
                </p>

                {/* Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--sb-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progressPercent}%`, height: '100%', backgroundColor: 'var(--sb-primary)' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {p.progressPercent}% Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
