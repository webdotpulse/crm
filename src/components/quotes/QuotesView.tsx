import React, { useState } from 'react'
import {
  FileSignature,
  Plus,
  Search,
  ExternalLink,
  FolderKanban,
  Receipt,
  CheckCircle2,
  Calendar,
  Building2,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
} from 'lucide-react'
import { Quotation, Deal } from '../../types'
import { useApp } from '../../context/AppContext'
import { QuoteBuilderModal } from './QuoteBuilderModal'
import { QuoteClientPortalModal } from './QuoteClientPortalModal'

interface QuotesViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const QuotesView: React.FC<QuotesViewProps> = ({ onOpenQuickModal }) => {
  const {
    quotations,
    companies,
    individuals,
    deleteQuotation,
    convertQuoteToProject,
    convertQuoteToInvoice,
    setCurrentView,
    setSelectedProjectId,
    setActiveInteractiveProposalQuote,
  } = useApp()

  const [activeFilter, setActiveFilter] = useState<'all' | 'sent' | 'accepted' | 'draft'>('all')
  const [localSearch, setLocalSearch] = useState('')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null)
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null)

  const filteredQuotes = quotations.filter((q) => {
    if (activeFilter !== 'all' && q.status !== activeFilter) return false
    if (!localSearch.trim()) return true
    const s = localSearch.toLowerCase()
    const comp = companies.find((c) => c.id === q.companyId)
    const ind = individuals.find((i) => i.id === q.individualId)
    const indName = ind ? `${ind.firstName} ${ind.lastName}`.toLowerCase() : ''
    return (
      q.number.toLowerCase().includes(s) ||
      q.title.toLowerCase().includes(s) ||
      (comp && comp.name.toLowerCase().includes(s)) ||
      indName.includes(s)
    )
  })

  const handleConvertToProject = (quoteId: string) => {
    const proj = convertQuoteToProject(quoteId)
    if (proj) {
      setSelectedProjectId(proj.id)
      setCurrentView('projects')
    }
  }

  const handleConvertToInvoice = (quoteId: string) => {
    const inv = convertQuoteToInvoice(quoteId)
    if (inv) {
      setCurrentView('invoices')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Commercial Quotations & Proposals</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Build comprehensive proposals, request client digital sign-offs, and convert directly into active projects or invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuote(null)
            setIsBuilderOpen(true)
          }}
          className="btn-sandbox btn-sandbox-primary"
        >
          <Plus size={16} />
          <span>New Quotation</span>
        </button>
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
            { id: 'all', label: `All Quotes (${quotations.length})` },
            { id: 'sent', label: `Sent to Clients (${quotations.filter((q) => q.status === 'sent').length})` },
            { id: 'accepted', label: `Signed & Accepted (${quotations.filter((q) => q.status === 'accepted').length})` },
            { id: 'draft', label: `Drafts (${quotations.filter((q) => q.status === 'draft').length})` },
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
            placeholder="Search quotation..."
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

      {/* Quotations Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table className="table-sandbox">
          <thead>
            <tr>
              <th>Quote # & Title</th>
              <th>Client Company</th>
              <th>Issue Date</th>
              <th>Valid Until</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body-subtle)' }}>
                  No quotations found matching your filter.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((quote) => {
                const comp = companies.find((c) => c.id === quote.companyId)
                const ind = individuals.find((i) => i.id === quote.individualId)
                const clientName = comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Direct Client'
                const isAccepted = quote.status === 'accepted'

                return (
                  <tr key={quote.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--sb-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{quote.number}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>{quote.title}</div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={14} color="var(--sb-body-subtle)" />
                        <span style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>{clientName}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--sb-body)' }}>{quote.issueDate}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--sb-body)' }}>{quote.validUntilDate}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                        €{quote.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge-soft badge-soft-${
                          quote.status === 'accepted'
                            ? 'success'
                            : quote.status === 'sent'
                            ? 'primary'
                            : quote.status === 'draft'
                            ? 'warning'
                            : 'danger'
                        }`}
                      >
                        {quote.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {/* Interactive Web Proposal */}
                        <button
                          onClick={() => setActiveInteractiveProposalQuote(quote)}
                          className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                          style={{ gap: '0.25rem' }}
                          title="Open Dynamic Web Proposal Experience"
                        >
                          <Sparkles size={13} />
                          <span>Proposal</span>
                        </button>

                        {/* Client Portal Sign-off Preview */}
                        <button
                          onClick={() => setPreviewQuote(quote)}
                          className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                          title="Client Portal Sign-off View"
                        >
                          <Eye size={13} />
                          <span>Portal</span>
                        </button>

                        {/* Convert to Project */}
                        {isAccepted && !quote.convertedToProjectId && (
                          <button
                            onClick={() => handleConvertToProject(quote.id)}
                            className="btn-sandbox btn-sandbox-sm btn-sandbox-success"
                            title="Create Project from Deliverables"
                          >
                            <FolderKanban size={13} />
                            <span>To Project</span>
                          </button>
                        )}

                        {/* Convert to Invoice */}
                        {isAccepted && !quote.convertedToInvoiceId && (
                          <button
                            onClick={() => handleConvertToInvoice(quote.id)}
                            className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                            title="Issue Invoice"
                          >
                            <Receipt size={13} />
                            <span>To Invoice</span>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingQuote(quote)
                            setIsBuilderOpen(true)
                          }}
                          className="btn-sandbox btn-icon btn-sandbox-secondary"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Quotation"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteQuotation(quote.id)}
                          className="btn-sandbox btn-icon btn-sandbox-danger"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete Quotation"
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
      {isBuilderOpen && (
        <QuoteBuilderModal quote={editingQuote} onClose={() => setIsBuilderOpen(false)} />
      )}

      {previewQuote && (
        <QuoteClientPortalModal quote={previewQuote} onClose={() => setPreviewQuote(null)} />
      )}
    </div>
  )
}
