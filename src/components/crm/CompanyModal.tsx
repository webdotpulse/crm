import React, { useState } from 'react'
import { X, Building2, ShieldCheck, Sparkles } from 'lucide-react'
import { Company, PeppolScheme } from '../../types'
import { useApp } from '../../context/AppContext'
import { lookupPeppolParticipant } from '../../services/peppolDispatcher'
import { searchKboRegistry } from '../../services/kboLookupService'

interface CompanyModalProps {
  company?: Company | null
  onClose: () => void
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ company, onClose }) => {
  const { addCompany, updateCompany } = useApp()

  const [name, setName] = useState(company?.name || '')
  const [legalName, setLegalName] = useState(company?.legalName || '')
  const [vatNumber, setVatNumber] = useState(company?.vatNumber || '')
  const [peppolScheme, setPeppolScheme] = useState<string>(company?.peppolScheme || '0208')
  const [peppolEndpoint, setPeppolEndpoint] = useState(company?.peppolEndpoint || '')
  const [email, setEmail] = useState(company?.email || '')
  const [phone, setPhone] = useState(company?.phone || '')
  const [website, setWebsite] = useState(company?.website || '')
  const [address, setAddress] = useState(company?.address || '')
  const [city, setCity] = useState(company?.city || '')
  const [postalCode, setPostalCode] = useState(company?.postalCode || '')
  const [country, setCountry] = useState(company?.country || 'Belgium')
  const [countryCode, setCountryCode] = useState(company?.countryCode || 'BE')
  const [status, setStatus] = useState<Company['status']>(company?.status || 'prospect')
  const [tagsStr, setTagsStr] = useState(company?.tags ? company.tags.join(', ') : '')
  const [notes, setNotes] = useState(company?.notes || '')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupMessage, setLookupMessage] = useState<string | null>(null)
  const [kboLoading, setKboLoading] = useState(false)

  const handleKboLookup = async () => {
    const query = vatNumber || name
    if (!query) return
    setKboLoading(true)
    setLookupMessage(null)

    const results = await searchKboRegistry(query)
    setKboLoading(false)

    if (results.length > 0) {
      const match = results[0]
      setName(match.commercialName || match.legalName)
      setLegalName(`${match.legalName} (${match.legalForm})`)
      setVatNumber(match.vatNumber)
      setPeppolEndpoint(match.vatNumber.replace(/[^0-9]/g, ''))
      setAddress(`${match.address.street} ${match.address.number}${match.address.box ? ', ' + match.address.box : ''}`)
      setPostalCode(match.address.postalCode)
      setCity(match.address.city)
      setCountry(match.address.country)
      setCountryCode('BE')
      setLookupMessage(`✓ KBO / BCE Verified: ${match.legalName} (NACE: ${match.naceCodes[0]?.code || 'Active'})`)
    } else {
      setLookupMessage('⚠ No enterprise found in Belgian KBO / BCE registry.')
    }
  }

  const handleVatChange = (val: string) => {
    setVatNumber(val)
    // Auto-fill Peppol endpoint from Belgian / Dutch VAT if empty
    const digitsOnly = val.replace(/[^0-9]/g, '')
    if (!peppolEndpoint || peppolEndpoint === digitsOnly.slice(0, -1)) {
      setPeppolEndpoint(digitsOnly)
    }
  }

  const handleLookupPeppol = async () => {
    if (!peppolEndpoint && !vatNumber) return
    setLookupLoading(true)
    setLookupMessage(null)
    const targetEndpoint = peppolEndpoint || vatNumber.replace(/[^0-9]/g, '')
    const result = await lookupPeppolParticipant(peppolScheme, targetEndpoint)
    setLookupLoading(false)
    if (result.registered) {
      setLookupMessage(`✓ Registered on Peppol via ${result.accessPointProvider}`)
    } else {
      setLookupMessage(`⚠ Participant not yet registered on Peppol SMP`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      name,
      legalName: legalName || name,
      vatNumber,
      peppolScheme,
      peppolEndpoint: peppolEndpoint || vatNumber.replace(/[^0-9]/g, ''),
      peppolRegistered: true,
      email,
      phone,
      website,
      address,
      city,
      postalCode,
      country,
      countryCode,
      status,
      tags,
      notes,
    }

    if (company) {
      updateCompany({ ...company, ...payload })
    } else {
      addCompany(payload)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3>{company ? 'Edit Company Profile' : 'Add New Company'}</h3>
              <p>Belgian Enterprise & Peppol Registry Linked Record</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="modal-form-grid">
              <div>
                <label className="form-label">Trading / Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp NV"
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Legal Name (For Invoices)</label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Acme Corporation NV/SA"
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Peppol & VAT Identification Section */}
            <div
              className="card-sandbox"
              style={{
                padding: '1rem',
                backgroundColor: 'var(--sb-bg)',
                border: '1px solid var(--sb-border)',
                borderRadius: 'var(--sb-radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="var(--sb-primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    Belgian KBO / BCE & Peppol Identifiers
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleKboLookup}
                    disabled={kboLoading}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    <Sparkles size={13} />
                    <span>{kboLoading ? 'Searching KBO...' : '⚡ Look up KBO / BCE'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLookupPeppol}
                    disabled={lookupLoading}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                  >
                    <span>{lookupLoading ? 'Checking SMP...' : 'Verify Peppol'}</span>
                  </button>
                </div>
              </div>

              {lookupMessage && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '4px',
                    backgroundColor: lookupMessage.startsWith('✓') ? 'var(--sb-success-soft)' : 'var(--sb-warning-soft)',
                    color: lookupMessage.startsWith('✓') ? 'var(--sb-success-text)' : 'var(--sb-warning-text)',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {lookupMessage}
                </div>
              )}

              <div className="modal-form-grid-3">
                <div>
                  <label className="form-label">VAT / Tax ID</label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => handleVatChange(e.target.value)}
                    placeholder="e.g. BE0842123456"
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">Scheme</label>
                  <select
                    value={peppolScheme}
                    onChange={(e) => setPeppolScheme(e.target.value)}
                    className="form-select-sandbox"
                  >
                    <option value="0208">0208 (BE KBO/BCE)</option>
                    <option value="0106">0106 (NL KvK)</option>
                    <option value="9930">9930 (DE VAT)</option>
                    <option value="9956">9956 (BE VAT)</option>
                    <option value="0088">0088 (GLN)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Peppol Endpoint</label>
                  <input
                    type="text"
                    value={peppolEndpoint}
                    onChange={(e) => setPeppolEndpoint(e.target.value)}
                    placeholder="0842123456"
                    className="form-input-sandbox"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="modal-form-grid-3">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@company.com"
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+32 3 123 45 67"
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="form-input-sandbox"
                />
              </div>
            </div>

            <div className="modal-form-grid">
              <div>
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Keizerslaan 12"
                  className="form-input-sandbox"
                />
              </div>
              <div className="modal-form-grid">
                <div>
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="1000"
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Brussels"
                    className="form-input-sandbox"
                  />
                </div>
              </div>
            </div>

            <div className="modal-form-grid">
              <div>
                <label className="form-label">Lifecycle Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="form-select-sandbox"
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Partner</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Logistics, High Priority, Peppol Active"
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="form-label">Internal Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Important client context or contract terms..."
                className="form-input-sandbox"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {company ? 'Update Company' : 'Save Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
