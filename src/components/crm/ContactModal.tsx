import React, { useState } from 'react'
import { X, User, Building2 } from 'lucide-react'
import { Contact } from '../../types'
import { useApp } from '../../context/AppContext'

interface ContactModalProps {
  contact?: Contact | null
  defaultCompanyId?: string
  onClose: () => void
}

export const ContactModal: React.FC<ContactModalProps> = ({ contact, defaultCompanyId, onClose }) => {
  const { companies, addContact, updateContact } = useApp()

  const [companyId, setCompanyId] = useState(contact?.companyId || defaultCompanyId || companies[0]?.id || '')
  const [firstName, setFirstName] = useState(contact?.firstName || '')
  const [lastName, setLastName] = useState(contact?.lastName || '')
  const [email, setEmail] = useState(contact?.email || '')
  const [phone, setPhone] = useState(contact?.phone || '')
  const [role, setRole] = useState(contact?.role || '')
  const [isPrimary, setIsPrimary] = useState(contact?.isPrimary || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    const payload = {
      companyId,
      firstName,
      lastName,
      email,
      phone,
      role: role || 'Contact Person',
      isPrimary,
    }

    if (contact) {
      updateContact({ ...contact, ...payload })
    } else {
      addContact(payload)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
              }}
            >
              <User size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Associated Company *</label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="form-select-sandbox"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city || c.country})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Marc"
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Vandamme"
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.vandamme@company.com"
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+32 478 00 11 22"
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Job Title / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Chief Operating Officer"
              className="form-input-sandbox"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--sb-primary)' }}
            />
            <label htmlFor="isPrimary" style={{ fontSize: '0.85rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
              Primary contact person for billing and correspondence
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {contact ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
