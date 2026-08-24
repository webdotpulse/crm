import React, { useState } from 'react'
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Filter,
  Users,
  Briefcase,
  Receipt,
  Sparkles,
} from 'lucide-react'
import { Company, Contact } from '../../types'
import { useApp } from '../../context/AppContext'
import { CompanyModal } from './CompanyModal'
import { ContactModal } from './ContactModal'
import { CompanyDetailDrawer } from './CompanyDetailDrawer'

interface CRMViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const CRMView: React.FC<CRMViewProps> = ({ onOpenQuickModal }) => {
  const { companies, contacts, searchQuery, selectedCompanyId, setSelectedCompanyId } = useApp()

  const [activeFilter, setActiveFilter] = useState<'all' | 'customer' | 'prospect' | 'lead' | 'partner'>('all')
  const [localSearch, setLocalSearch] = useState('')
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [defaultCompanyForContact, setDefaultCompanyForContact] = useState<string | undefined>(undefined)

  const activeSearch = searchQuery || localSearch

  const filteredCompanies = companies.filter((c) => {
    if (activeFilter !== 'all' && c.status !== activeFilter) return false
    if (!activeSearch.trim()) return true
    const q = activeSearch.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.legalName && c.legalName.toLowerCase().includes(q)) ||
      (c.vatNumber && c.vatNumber.toLowerCase().includes(q)) ||
      (c.peppolEndpoint && c.peppolEndpoint.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    )
  })

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || null

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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Customer Relationship Management</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Manage client accounts, verified Peppol endpoints, and linked stakeholder contacts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setEditingCompany(null)
              setIsCompanyModalOpen(true)
            }}
            className="btn-sandbox btn-sandbox-primary"
          >
            <Plus size={16} />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
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
            { id: 'all', label: `All Accounts (${companies.length})` },
            { id: 'customer', label: `Customers (${companies.filter((c) => c.status === 'customer').length})` },
            { id: 'prospect', label: `Prospects (${companies.filter((c) => c.status === 'prospect').length})` },
            { id: 'lead', label: `Leads (${companies.filter((c) => c.status === 'lead').length})` },
            { id: 'partner', label: `Partners (${companies.filter((c) => c.status === 'partner').length})` },
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
            placeholder="Search company or VAT..."
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

      {/* Companies Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table className="table-sandbox">
          <thead>
            <tr>
              <th>Company & Legal Entity</th>
              <th>Peppol Scheme / ID</th>
              <th>Primary Contact</th>
              <th>Location</th>
              <th>Status</th>
              <th>Tags</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body-subtle)' }}>
                  No companies found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((comp) => {
                const compContacts = contacts.filter((c) => c.companyId === comp.id)
                const primaryContact = compContacts.find((c) => c.isPrimary) || compContacts[0]

                return (
                  <tr
                    key={comp.id}
                    onClick={() => setSelectedCompanyId(comp.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                            fontSize: '0.85rem',
                          }}
                        >
                          {comp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{comp.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                            VAT: {comp.vatNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShieldCheck size={15} color="var(--sb-success)" />
                        <span style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
                          {comp.peppolScheme}:{comp.peppolEndpoint || comp.vatNumber?.replace(/[^0-9]/g, '')}
                        </span>
                      </div>
                    </td>

                    <td>
                      {primaryContact ? (
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--sb-heading)' }}>
                            {primaryContact.firstName} {primaryContact.lastName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
                            {primaryContact.role}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>No contacts</span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                        <MapPin size={13} color="var(--sb-body-subtle)" />
                        <span>
                          {comp.city ? `${comp.city}, ` : ''}{comp.countryCode || comp.country}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge-soft badge-soft-${
                          comp.status === 'customer'
                            ? 'success'
                            : comp.status === 'prospect'
                            ? 'primary'
                            : comp.status === 'lead'
                            ? 'warning'
                            : 'purple'
                        }`}
                      >
                        {comp.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {comp.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="badge-soft badge-soft-dark" style={{ fontSize: '0.7rem' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCompanyId(comp.id)
                        }}
                        className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                      >
                        <span>View</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals & Drawers */}
      {isCompanyModalOpen && (
        <CompanyModal company={editingCompany} onClose={() => setIsCompanyModalOpen(false)} />
      )}

      {isContactModalOpen && (
        <ContactModal
          contact={editingContact}
          defaultCompanyId={defaultCompanyForContact}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}

      {selectedCompany && (
        <CompanyDetailDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompanyId(null)}
          onEditCompany={(comp) => {
            setEditingCompany(comp)
            setIsCompanyModalOpen(true)
          }}
          onAddContact={(compId) => {
            setDefaultCompanyForContact(compId)
            setEditingContact(null)
            setIsContactModalOpen(true)
          }}
          onEditContact={(cont) => {
            setEditingContact(cont)
            setIsContactModalOpen(true)
          }}
          onCreateDeal={(compId) => onOpenQuickModal('deal')}
          onCreateQuote={(compId) => onOpenQuickModal('quote')}
          onCreateInvoice={(compId) => onOpenQuickModal('invoice')}
        />
      )}
    </div>
  )
}
