import React, { useState } from 'react'
import {
  X,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  Plus,
  TrendingUp,
  FileSignature,
  Receipt,
  FolderKanban,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Company, Contact, Deal, Quotation, Invoice, Project } from '../../types'
import { useApp } from '../../context/AppContext'
import { lookupPeppolParticipant, PeppolParticipantInfo } from '../../services/peppolDispatcher'

interface CompanyDetailDrawerProps {
  company: Company
  onClose: () => void
  onEditCompany: (company: Company) => void
  onAddContact: (companyId: string) => void
  onEditContact: (contact: Contact) => void
  onCreateDeal: (companyId: string) => void
  onCreateQuote: (companyId: string) => void
  onCreateInvoice: (companyId: string) => void
}

export const CompanyDetailDrawer: React.FC<CompanyDetailDrawerProps> = ({
  company,
  onClose,
  onEditCompany,
  onAddContact,
  onEditContact,
  onCreateDeal,
  onCreateQuote,
  onCreateInvoice,
}) => {
  const {
    contacts,
    deals,
    quotations,
    invoices,
    projects,
    deleteCompany,
    deleteContact,
    setCurrentView,
    setSelectedProjectId,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'quotes' | 'invoices' | 'projects'>('overview')
  const [peppolInfo, setPeppolInfo] = useState<PeppolParticipantInfo | null>(null)
  const [loadingPeppol, setLoadingPeppol] = useState(false)

  const companyContacts = contacts.filter((c) => c.companyId === company.id)
  const companyDeals = deals.filter((d) => d.companyId === company.id)
  const companyQuotes = quotations.filter((q) => q.companyId === company.id)
  const companyInvoices = invoices.filter((i) => i.companyId === company.id)
  const companyProjects = projects.filter((p) => p.companyId === company.id)

  const handleVerifyPeppol = async () => {
    setLoadingPeppol(true)
    const targetEndpoint = company.peppolEndpoint || company.vatNumber.replace(/[^0-9]/g, '')
    const info = await lookupPeppolParticipant(company.peppolScheme, targetEndpoint)
    setPeppolInfo(info)
    setLoadingPeppol(false)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      deleteCompany(company.id)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content modal-content-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '750px',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
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
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem' }}>{company.name}</h2>
                <span className={`badge-soft badge-soft-${company.status === 'customer' ? 'success' : company.status === 'prospect' ? 'primary' : 'warning'}`}>
                  {company.status.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>{company.legalName || company.name}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => onEditCompany(company)}
              className="btn-sandbox btn-icon btn-sandbox-secondary"
              title="Edit Company"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="btn-sandbox btn-icon btn-sandbox-danger"
              title="Delete Company"
            >
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--sb-border)',
            padding: '0 1.5rem',
            backgroundColor: 'var(--sb-bg-alt)',
            gap: '0.5rem',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deals', label: `Deals (${companyDeals.length})` },
            { id: 'quotes', label: `Quotes (${companyQuotes.length})` },
            { id: 'invoices', label: `Invoices (${companyInvoices.length})` },
            { id: 'projects', label: `Projects (${companyProjects.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--sb-primary)' : 'var(--sb-body)',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--sb-primary)' : 'transparent'}`,
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Peppol Electronic Invoicing Card */}
              <div
                className="card-sandbox"
                style={{
                  padding: '1.25rem',
                  border: '1px solid rgba(63, 120, 224, 0.25)',
                  backgroundColor: 'var(--sb-primary-soft)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="var(--sb-primary)" />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--sb-primary-text)' }}>Peppol Network Readiness</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                        Scheme: {company.peppolScheme} • Endpoint: {company.peppolEndpoint || company.vatNumber}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyPeppol}
                    disabled={loadingPeppol}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                  >
                    <Sparkles size={13} />
                    <span>{loadingPeppol ? 'Querying SMP...' : 'Verify Peppol'}</span>
                  </button>
                </div>

                {peppolInfo && (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--sb-radius-sm)',
                      backgroundColor: 'var(--sb-surface)',
                      border: '1px solid var(--sb-border)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {peppolInfo.registered ? (
                        <CheckCircle2 size={16} color="var(--sb-success)" />
                      ) : (
                        <AlertTriangle size={16} color="var(--sb-warning)" />
                      )}
                      <span style={{ fontWeight: 700, color: peppolInfo.registered ? 'var(--sb-success-text)' : 'var(--sb-warning-text)' }}>
                        {peppolInfo.registered ? 'Active Peppol Participant' : 'Not Registered on Network'}
                      </span>
                    </div>
                    {peppolInfo.registered && (
                      <>
                        <div>
                          <strong>Access Point:</strong> {peppolInfo.accessPointProvider}
                        </div>
                        <div>
                          <strong>Supported Profiles:</strong> Peppol BIS Billing 3.0 UBL Invoice & Credit Note
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Company Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <div className="card-sandbox" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                    CONTACT DETAILS
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={15} color="var(--sb-body-subtle)" />
                      <a href={`mailto:${company.email}`}>{company.email || 'N/A'}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={15} color="var(--sb-body-subtle)" />
                      <span>{company.phone || 'N/A'}</span>
                    </div>
                    {company.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={15} color="var(--sb-body-subtle)" />
                        <a href={company.website} target="_blank" rel="noreferrer">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-sandbox" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                    BILLING & TAX
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <strong>VAT:</strong> {company.vatNumber || 'Not specified'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={15} color="var(--sb-body-subtle)" style={{ marginTop: '2px' }} />
                      <span>
                        {company.address}, {company.postalCode} {company.city} ({company.country})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts Section */}
              <div className="card-sandbox" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem' }}>Associated Contacts ({companyContacts.length})</h4>
                  <button
                    onClick={() => onAddContact(company.id)}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                  >
                    <Plus size={13} />
                    <span>Add Contact</span>
                  </button>
                </div>

                {companyContacts.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--sb-body-subtle)' }}>No contacts listed yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {companyContacts.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--sb-bg)',
                          borderRadius: 'var(--sb-radius-sm)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>
                              {c.firstName} {c.lastName}
                            </span>
                            {c.isPrimary && <span className="badge-soft badge-soft-primary" style={{ fontSize: '0.65rem' }}>PRIMARY</span>}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                            {c.role} • {c.email} • {c.phone}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => onEditContact(c)}
                            className="btn-sandbox btn-icon btn-sandbox-secondary"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="btn-sandbox btn-icon btn-sandbox-danger"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags & Notes */}
              {company.notes && (
                <div className="card-sandbox" style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--sb-body-subtle)' }}>NOTES</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)' }}>{company.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem' }}>Active Deals & Opportunities</h4>
                <button onClick={() => onCreateDeal(company.id)} className="btn-sandbox btn-sandbox-sm btn-sandbox-primary">
                  <Plus size={14} />
                  <span>New Deal</span>
                </button>
              </div>

              {companyDeals.length === 0 ? (
                <p style={{ color: 'var(--sb-body-subtle)', fontSize: '0.85rem' }}>No deals currently registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {companyDeals.map((d) => (
                    <div key={d.id} className="card-sandbox" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.title}</span>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--sb-primary)' }}>
                          €{d.value.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                        <span>Stage: <strong style={{ textTransform: 'capitalize' }}>{d.stage}</strong> ({d.probability}%)</span>
                        <span>Close date: {d.expectedCloseDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quotations Tab */}
          {activeTab === 'quotes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem' }}>Quotations & Proposals</h4>
                <button onClick={() => onCreateQuote(company.id)} className="btn-sandbox btn-sandbox-sm btn-sandbox-primary">
                  <Plus size={14} />
                  <span>New Quote</span>
                </button>
              </div>

              {companyQuotes.length === 0 ? (
                <p style={{ color: 'var(--sb-body-subtle)', fontSize: '0.85rem' }}>No quotations created yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {companyQuotes.map((q) => (
                    <div key={q.id} className="card-sandbox" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{q.number}</span> • {q.title}
                        </div>
                        <span className={`badge-soft badge-soft-${q.status === 'accepted' ? 'success' : q.status === 'sent' ? 'primary' : 'warning'}`}>
                          {q.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                        <span>Valid until: {q.validUntilDate}</span>
                        <strong style={{ color: 'var(--sb-heading)' }}>€{q.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem' }}>Invoices & Peppol Documents</h4>
                <button onClick={() => onCreateInvoice(company.id)} className="btn-sandbox btn-sandbox-sm btn-sandbox-primary">
                  <Plus size={14} />
                  <span>New Invoice</span>
                </button>
              </div>

              {companyInvoices.length === 0 ? (
                <p style={{ color: 'var(--sb-body-subtle)', fontSize: '0.85rem' }}>No invoices issued yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {companyInvoices.map((inv) => (
                    <div key={inv.id} className="card-sandbox" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{inv.number}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)', marginLeft: '0.5rem' }}>
                            Ref: {inv.structuredReference}
                          </span>
                        </div>
                        <span className={`badge-soft badge-soft-${inv.status === 'paid' ? 'success' : inv.status === 'peppol_sent' ? 'primary' : 'warning'}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                        <span>Issued: {inv.issueDate} • Due: {inv.dueDate}</span>
                        <strong style={{ color: 'var(--sb-heading)' }}>€{inv.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem' }}>Projects & Deliverables</h4>
              </div>

              {companyProjects.length === 0 ? (
                <p style={{ color: 'var(--sb-body-subtle)', fontSize: '0.85rem' }}>No active projects for this company.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {companyProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProjectId(p.id)
                        setCurrentView('projects')
                        onClose()
                      }}
                      className="card-sandbox card-sandbox-hover"
                      style={{ padding: '1rem', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700 }}>{p.title}</span>
                        <span className="badge-soft badge-soft-primary">{p.progressPercent}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                        <span>Budget: {p.budgetHours} hrs (€{p.budgetAmount.toLocaleString()})</span>
                        <span>Deadline: {p.endDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
