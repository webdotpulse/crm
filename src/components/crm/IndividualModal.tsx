import React, { useState } from 'react'
import { X, User, MapPin, Mail, Phone, ShieldCheck, Tag, FileText } from 'lucide-react'
import { IndividualClient } from '../../types'
import { useApp } from '../../context/AppContext'

interface IndividualModalProps {
  individual?: IndividualClient | null
  onClose: () => void
}

export const IndividualModal: React.FC<IndividualModalProps> = ({ individual, onClose }) => {
  const { addIndividual, updateIndividual } = useApp()

  const [formData, setFormData] = useState<Partial<IndividualClient>>({
    firstName: individual?.firstName || '',
    lastName: individual?.lastName || '',
    email: individual?.email || '',
    phone: individual?.phone || '',
    address: individual?.address || '',
    city: individual?.city || '',
    postalCode: individual?.postalCode || '',
    country: individual?.country || 'Belgium',
    countryCode: individual?.countryCode || 'BE',
    nationalId: individual?.nationalId || '',
    status: individual?.status || 'customer',
    tags: individual?.tags || [],
    notes: individual?.notes || '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter((t) => t !== tagToRemove) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.email) return

    if (individual) {
      updateIndividual({
        ...individual,
        ...(formData as IndividualClient),
      })
    } else {
      const newInd: IndividualClient = {
        id: `ind-${Date.now()}`,
        clientType: 'individual',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        city: formData.city || '',
        postalCode: formData.postalCode || '',
        country: formData.country || 'Belgium',
        countryCode: formData.countryCode || 'BE',
        nationalId: formData.nationalId,
        status: formData.status || 'customer',
        tags: formData.tags || ['Private Client'],
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      }
      addIndividual(newInd)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                {individual ? 'Edit Private Person (B2C)' : 'New Private Client (B2C)'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Direct individual client record for residential, retail, or freelance services.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name Fields */}
            <div className="modal-form-grid">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Lucas"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Van Damme"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="modal-form-grid">
              <div>
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="lucas@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input-sandbox"
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
                </div>
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="+32 475 88 12 34"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input-sandbox"
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <Phone size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
                </div>
              </div>
            </div>

            {/* National ID & Status */}
            <div className="modal-form-grid">
              <div>
                <label className="form-label">National ID / Personal Tax Code</label>
                <input
                  type="text"
                  placeholder="e.g. 84.05.12-183.42"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Lifecycle Stage</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="form-select-sandbox"
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Active Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="modal-form-grid-3">
              <div>
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  placeholder="Kouter 15"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  placeholder="Gent"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
              <div>
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  placeholder="9000"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="form-input-sandbox"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">Tags & Categorization</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add custom tag (e.g. VIP, Smart Home, Retainer)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="form-input-sandbox"
                />
                <button type="button" onClick={handleAddTag} className="btn-sandbox btn-sandbox-secondary">
                  Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {formData.tags?.map((tag) => (
                  <span key={tag} className="badge-sandbox badge-soft-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {tag}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="form-label">Client Notes & Requirements</label>
              <textarea
                rows={2}
                placeholder="Residential client notes, preferences, or project requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {individual ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
