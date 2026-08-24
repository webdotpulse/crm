import React, { useState } from 'react'
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
  User,
  Users,
  Briefcase,
  Mail,
  Phone,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Company, IndividualClient, Contact } from '../../types'
import { useApp } from '../../context/AppContext'
import { CompanyModal } from './CompanyModal'
import { IndividualModal } from './IndividualModal'
import { ContactModal } from './ContactModal'
import { CompanyDetailDrawer } from './CompanyDetailDrawer'

interface CRMViewProps {
  onOpenQuickModal?: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const CRMView: React.FC<CRMViewProps> = ({ onOpenQuickModal }) => {
  const {
    companies,
    individuals,
    contacts,
    deleteIndividual,
    deleteContact,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'companies' | 'individuals' | 'contacts'>('companies')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Modals & Drawer State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [selectedDrawerCompany, setSelectedDrawerCompany] = useState<Company | null>(null)

  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false)
  const [editingIndividual, setEditingIndividual] = useState<IndividualClient | null>(null)

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // Filters
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredIndividuals = individuals.filter((ind) => {
    const fullName = `${ind.firstName} ${ind.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      ind.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || ind.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredContacts = contacts.filter((cont) => {
    const fullName = `${cont.firstName} ${cont.lastName}`.toLowerCase()
    const comp = companies.find((c) => c.id === cont.companyId)
    const compName = comp ? comp.name.toLowerCase() : ''
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      cont.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compName.includes(searchTerm.toLowerCase()) ||
      cont.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'customer':
        return <span className="badge-sandbox badge-soft-success">Customer</span>
      case 'prospect':
        return <span className="badge-sandbox badge-soft-warning">Prospect</span>
      case 'lead':
        return <span className="badge-sandbox badge-soft-primary">Lead</span>
      case 'partner':
        return <span className="badge-sandbox badge-soft-purple">Partner</span>
      default:
        return <span className="badge-sandbox badge-soft-danger">Inactive</span>
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Customer Relationship Management</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Manage B2B enterprise accounts, B2C private persons, and connected company employers/employees.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'companies' && (
            <button
              onClick={() => {
                setEditingCompany(null)
                setIsCompanyModalOpen(true)
              }}
              className="btn-sandbox btn-sandbox-primary"
            >
              <Plus size={16} />
              <span>New Company (B2B)</span>
            </button>
          )}

          {activeTab === 'individuals' && (
            <button
              onClick={() => {
                setEditingIndividual(null)
                setIsIndividualModalOpen(true)
              }}
              className="btn-sandbox btn-sandbox-primary"
            >
              <Plus size={16} />
              <span>New Private Client (B2C)</span>
            </button>
          )}

          {activeTab === 'contacts' && (
            <button
              onClick={() => {
                setEditingContact(null)
                setIsContactModalOpen(true)
              }}
              className="btn-sandbox btn-sandbox-primary"
            >
              <Plus size={16} />
              <span>New Contact / Employer</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--sb-border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('companies')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'companies' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'companies' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'companies' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Building2 size={18} />
          <span>Companies & B2B ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('individuals')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'individuals' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'individuals' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'individuals' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <User size={18} />
          <span>Private Individuals / B2C ({individuals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'contacts' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'contacts' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'contacts' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={18} />
          <span>All Contacts & Employers ({contacts.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
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
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--sb-body)',
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === 'companies'
                ? 'Search company name, VAT, city...'
                : activeTab === 'individuals'
                ? 'Search private client name, email, national ID...'
                : 'Search contact name, role, company...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input-sandbox"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        {activeTab !== 'contacts' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'customer', 'prospect', 'lead', 'partner'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`btn-sandbox ${selectedStatus === st ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              >
                {st === 'all' ? `All (${activeTab === 'companies' ? companies.length : individuals.length})` : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: Companies (B2B) */}
      {activeTab === 'companies' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table className="table-sandbox">
            <thead>
              <tr>
                <th>Company / Legal Entity</th>
                <th>Peppol Scheme / ID</th>
                <th>Primary Contact</th>
                <th>Location</th>
                <th>Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body)' }}>
                    No companies found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const compContacts = contacts.filter((ct) => ct.companyId === c.id)
                  const primaryContact = compContacts.find((ct) => ct.isPrimary) || compContacts[0]

                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDrawerCompany(c)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--sb-primary-soft)',
                              color: 'var(--sb-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{c.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', fontFamily: 'var(--sb-font-mono)' }}>
                              VAT: {c.vatNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {c.peppolRegistered ? (
                            <span className="badge-sandbox badge-soft-success" title="Verified on OpenPeppol Directory">
                              <ShieldCheck size={12} style={{ marginRight: '0.2rem' }} />
                              {c.peppolScheme}:{c.peppolEndpoint}
                            </span>
                          ) : (
                            <span className="badge-sandbox badge-soft-warning" title="Not registered on Peppol">
                              {c.peppolScheme}:{c.peppolEndpoint}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        {primaryContact ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {primaryContact.firstName} {primaryContact.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{primaryContact.role}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>No contacts</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{c.city}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{c.country}</div>
                      </td>

                      <td>{getStatusBadge(c.status)}</td>

                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setEditingCompany(c)
                              setIsCompanyModalOpen(true)
                            }}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.4rem' }}
                            title="Edit Company"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedDrawerCompany(c)}
                            className="btn-sandbox btn-sandbox-secondary"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            <span>Open</span>
                            <ExternalLink size={13} />
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
      )}

      {/* TAB 2: Private Individuals (B2C) */}
      {activeTab === 'individuals' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table className="table-sandbox">
            <thead>
              <tr>
                <th>Private Client (B2C)</th>
                <th>National ID / Tax Code</th>
                <th>Contact Coordinates</th>
                <th>Location</th>
                <th>Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndividuals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body)' }}>
                    No private individuals found. Click "New Private Client (B2C)" to add one.
                  </td>
                </tr>
              ) : (
                filteredIndividuals.map((ind) => (
                  <tr key={ind.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--sb-purple-soft)',
                            color: 'var(--sb-purple)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {ind.firstName[0]}
                          {ind.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>
                            {ind.firstName} {ind.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                            {ind.tags.join(' • ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
                        {ind.nationalId || '—'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <Mail size={13} color="var(--sb-body)" />
                          <span>{ind.email}</span>
                        </div>
                        {ind.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                            <Phone size={13} />
                            <span>{ind.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{ind.city}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{ind.address}</div>
                    </td>

                    <td>{getStatusBadge(ind.status)}</td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setEditingIndividual(ind)
                            setIsIndividualModalOpen(true)
                          }}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ padding: '0.4rem' }}
                          title="Edit Individual"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete private client ${ind.firstName} ${ind.lastName}?`)) {
                              deleteIndividual(ind.id)
                            }
                          }}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ padding: '0.4rem', color: 'var(--sb-danger)' }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Contacts & Company Employers */}
      {activeTab === 'contacts' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table className="table-sandbox">
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Company / Employer</th>
                <th>Role & Department</th>
                <th>Direct Billing</th>
                <th>Coordinates</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body)' }}>
                    No contacts found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((cont) => {
                  const comp = companies.find((c) => c.id === cont.companyId)

                  return (
                    <tr key={cont.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: cont.isEmployer ? 'var(--sb-warning-soft)' : 'var(--sb-primary-soft)',
                              color: cont.isEmployer ? 'var(--sb-warning)' : 'var(--sb-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            {cont.firstName[0]}
                            {cont.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>
                              {cont.firstName} {cont.lastName}
                            </div>
                            {cont.isEmployer && (
                              <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.68rem' }}>
                                Employer / Executive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>
                          {comp ? comp.name : 'Independent'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{comp?.city}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cont.role}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{cont.department || 'General'}</div>
                      </td>

                      <td>
                        {cont.canBeBilledDirectly ? (
                          <span className="badge-sandbox badge-soft-success">Can Be Billed</span>
                        ) : (
                          <span className="badge-sandbox badge-soft-primary">Via Company</span>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{cont.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{cont.phone}</div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setEditingContact(cont)
                              setIsContactModalOpen(true)
                            }}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.4rem' }}
                            title="Edit Contact"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete contact ${cont.firstName} ${cont.lastName}?`)) {
                                deleteContact(cont.id)
                              }
                            }}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.4rem', color: 'var(--sb-danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={15} />
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
      )}

      {/* Modals & Slide-over Drawers */}
      {isCompanyModalOpen && (
        <CompanyModal
          company={editingCompany}
          onClose={() => {
            setIsCompanyModalOpen(false)
            setEditingCompany(null)
          }}
        />
      )}

      {isIndividualModalOpen && (
        <IndividualModal
          individual={editingIndividual}
          onClose={() => {
            setIsIndividualModalOpen(false)
            setEditingIndividual(null)
          }}
        />
      )}

      {isContactModalOpen && (
        <ContactModal
          defaultCompanyId={companies[0]?.id || ''}
          contact={editingContact}
          onClose={() => {
            setIsContactModalOpen(false)
            setEditingContact(null)
          }}
        />
      )}

      {selectedDrawerCompany && (
        <CompanyDetailDrawer
          company={selectedDrawerCompany}
          onClose={() => setSelectedDrawerCompany(null)}
          onEditCompany={(comp) => {
            setEditingCompany(comp)
            setSelectedDrawerCompany(null)
            setIsCompanyModalOpen(true)
          }}
          onAddContact={() => {
            setEditingContact(null)
            setIsContactModalOpen(true)
          }}
          onEditContact={(contact) => {
            setEditingContact(contact)
            setIsContactModalOpen(true)
          }}
          onCreateDeal={() => {
            if (onOpenQuickModal) onOpenQuickModal('deal')
          }}
          onCreateQuote={() => {
            if (onOpenQuickModal) onOpenQuickModal('quote')
          }}
          onCreateInvoice={() => {
            if (onOpenQuickModal) onOpenQuickModal('invoice')
          }}
        />
      )}
    </div>
  )
}
