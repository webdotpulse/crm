import React, { useState } from 'react'
import { X, TrendingUp, DollarSign } from 'lucide-react'
import { Deal, DealStage } from '../../types'
import { useApp } from '../../context/AppContext'

interface DealModalProps {
  deal?: Deal | null
  defaultCompanyId?: string
  onClose: () => void
}

export const DealModal: React.FC<DealModalProps> = ({ deal, defaultCompanyId, onClose }) => {
  const { companies, contacts, addDeal, updateDeal } = useApp()

  const [title, setTitle] = useState(deal?.title || '')
  const [companyId, setCompanyId] = useState(deal?.companyId || defaultCompanyId || companies[0]?.id || '')
  const [contactId, setContactId] = useState(deal?.contactId || '')
  const [value, setValue] = useState(deal?.value || 0)
  const [currency, setCurrency] = useState(deal?.currency || 'EUR')
  const [stage, setStage] = useState<DealStage>(deal?.stage || 'qualified')
  const [probability, setProbability] = useState(deal?.probability ?? 50)
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    deal?.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState(deal?.notes || '')

  const companyContacts = contacts.filter((c) => c.companyId === companyId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !companyId) return

    const payload = {
      title,
      companyId,
      contactId: contactId || undefined,
      value: Number(value),
      currency,
      stage,
      probability: Number(probability),
      expectedCloseDate,
      notes,
    }

    if (deal) {
      updateDeal({ ...deal, ...payload })
    } else {
      addDeal(payload)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
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
                backgroundColor: 'var(--sb-purple-soft)',
                color: 'var(--sb-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{deal ? 'Edit Deal' : 'New Sales Opportunity'}</h3>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Deal / Opportunity Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Telematics Fleet Management Platform"
              className="form-input-sandbox"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Client Company *</label>
              <select
                required
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value)
                  setContactId('')
                }}
                className="form-select-sandbox"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Decision Maker Contact</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="form-select-sandbox"
              >
                <option value="">-- Select Contact --</option>
                {companyContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Expected Value (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>

            <div>
              <label className="form-label">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => {
                  const s = e.target.value as DealStage
                  setStage(s)
                  if (s === 'lead') setProbability(20)
                  if (s === 'qualified') setProbability(40)
                  if (s === 'meeting') setProbability(50)
                  if (s === 'proposal') setProbability(65)
                  if (s === 'negotiation') setProbability(85)
                  if (s === 'won') setProbability(100)
                  if (s === 'lost') setProbability(0)
                }}
                className="form-select-sandbox"
              >
                <option value="lead">Lead In</option>
                <option value="qualified">Qualified</option>
                <option value="meeting">Meeting Scheduled</option>
                <option value="proposal">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed Won 🎉</option>
                <option value="lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="form-label">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Expected Closing Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="form-input-sandbox"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Opportunity Notes & Scope</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key requirements, budget constraints, timeline expectations..."
              className="form-textarea-sandbox"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {deal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
