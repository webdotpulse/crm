import React, { useState } from 'react'
import { X, FileText, CheckCircle, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Contract, ContractType, ContractStatus, ClientType } from '../../types'

interface ContractModalProps {
  contractToEdit?: Contract | null
  onClose: () => void
}

const contractTemplates: Record<ContractType, { title: string; body: string }> = {
  nda: {
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    body: `<p><strong>MUTUAL NON-DISCLOSURE AGREEMENT (NDA)</strong></p>
<p>This Mutual Non-Disclosure Agreement is entered into by and between the Disclosing Party and the Client identified herein ("Recipient").</p>
<p>1. <strong>Confidential Information:</strong> Includes proprietary architectures, commercial terms, client data, and electronic transaction records.</p>
<p>2. <strong>Non-Disclosure:</strong> Recipient agrees not to disclose or publish any proprietary information for a period of 24 months.</p>
<p>3. <strong>Jurisdiction:</strong> Governed by the applicable statutory enterprise courts.</p>`,
  },
  sla: {
    title: 'Service Level Agreement (SLA) — 99.9% Uptime Guarantee',
    body: `<p><strong>SERVICE LEVEL AGREEMENT (SLA)</strong></p>
<p>1. <strong>Uptime Commitment:</strong> The Service Provider guarantees 99.9% availability of all agreed production services and electronic invoicing gateways.</p>
<p>2. <strong>Incident Response:</strong> Severity 1 (Critical Outage) response time is within 15 minutes; Severity 2 (Degraded) within 2 hours.</p>
<p>3. <strong>Service Credits:</strong> 10% monthly rebate per 0.5% downtime violation.</p>`,
  },
  msa: {
    title: 'Master Services Agreement (MSA)',
    body: `<p><strong>MASTER SERVICES AGREEMENT</strong></p>
<p>1. <strong>Scope:</strong> Governs all statements of work, engineering deliverables, and technical consulting services.</p>
<p>2. <strong>Intellectual Property:</strong> Deliverables transfer to Client upon full payment settlement.</p>
<p>3. <strong>Invoicing Terms:</strong> 30 days net payable via standard bank transfer or electronic invoicing.</p>`,
  },
  handover: {
    title: 'Project Final Acceptance & Handover Sign-off',
    body: `<p><strong>PROJECT ACCEPTANCE & HANDOVER CERTIFICATE</strong></p>
<p>1. <strong>Deliverables Acceptance:</strong> The Client confirms all technical acceptance criteria and user testing milestones have been verified and accepted in full without reservation.</p>
<p>2. <strong>Warranty:</strong> 90 days bug-fixing warranty commencing on the signature date.</p>`,
  },
  custom: {
    title: 'Custom Commercial Agreement',
    body: `<p><strong>COMMERCIAL SERVICES AGREEMENT</strong></p>
<p>Terms and scope as agreed between the Service Provider and the Client.</p>`,
  },
}

export const ContractModal: React.FC<ContractModalProps> = ({ contractToEdit, onClose }) => {
  const { addContract, updateContract, companies, individuals, activeLegalEntity } = useApp()

  const [contractNumber, setContractNumber] = useState(
    contractToEdit?.contractNumber || `CTR-2026-${Math.floor(100 + Math.random() * 900)}`
  )
  const [type, setType] = useState<ContractType>(contractToEdit?.type || 'nda')
  const [title, setTitle] = useState(contractToEdit?.title || contractTemplates.nda.title)
  const [clientType, setClientType] = useState<ClientType>(contractToEdit?.clientType || 'company')
  const [companyId, setCompanyId] = useState<string>(contractToEdit?.companyId || companies[0]?.id || '')
  const [individualId, setIndividualId] = useState<string>(contractToEdit?.individualId || individuals[0]?.id || '')
  const [effectiveDate, setEffectiveDate] = useState(
    contractToEdit?.effectiveDate || new Date().toISOString().slice(0, 10)
  )
  const [expiryDate, setExpiryDate] = useState(
    contractToEdit?.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
  )
  const [value, setValue] = useState<number>(contractToEdit?.value || 0)
  const [contentHtml, setContentHtml] = useState<string>(contractToEdit?.contentHtml || contractTemplates.nda.body)
  const [status, setStatus] = useState<ContractStatus>(contractToEdit?.status || 'draft')

  const handleTemplateSelect = (t: ContractType) => {
    setType(t)
    setTitle(contractTemplates[t].title)
    setContentHtml(contractTemplates[t].body)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const contractData: Contract = {
      id: contractToEdit?.id || `ctr-${Date.now()}`,
      contractNumber,
      title,
      type,
      status,
      clientType,
      companyId: clientType === 'company' ? companyId : undefined,
      individualId: clientType === 'individual' ? individualId : undefined,
      effectiveDate,
      expiryDate: expiryDate || undefined,
      value,
      currency: 'EUR',
      contentHtml,
      legalEntityId: activeLegalEntity.id,
      signatures: contractToEdit?.signatures || {},
      createdAt: contractToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (contractToEdit) {
      updateContract(contractData)
    } else {
      addContract(contractData)
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(63, 120, 224, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                {contractToEdit ? 'Edit Legal Agreement' : 'Draft Contract & SLA'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Create NDAs, Master Services Agreements, and Uptime SLAs
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Template Selector */}
          {!contractToEdit && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                ⚡ Quick Load Standard EU Legal Template
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['nda', 'sla', 'msa', 'handover'] as ContractType[]).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => handleTemplateSelect(t)}
                    className="badge-sandbox"
                    style={{
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer',
                      border: '1px solid var(--sb-border)',
                      backgroundColor: type === t ? 'var(--sb-primary)' : 'var(--sb-bg)',
                      color: type === t ? '#ffffff' : 'var(--sb-heading)',
                      fontWeight: 700,
                    }}
                  >
                    📄 {t.toUpperCase()} Template
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Contract Number *
              </label>
              <input
                type="text"
                required
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Contract Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Client Type
              </label>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value as ClientType)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              >
                <option value="company">🏢 B2B Company</option>
                <option value="individual">👤 B2C Person</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Client Entity *
              </label>
              {clientType === 'company' ? (
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vatNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={individualId}
                  onChange={(e) => setIndividualId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem 0.75rem' }}
                >
                  {individuals.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.firstName} {ind.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Expiry / Renewal Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Contract Value (€)
              </label>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Contract Legal Terms & Scope (HTML / Rich Text)
            </label>
            <textarea
              rows={8}
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              className="input-sandbox"
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.78rem', padding: '0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.6rem 1.25rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckCircle size={16} />
              {contractToEdit ? 'Save Changes' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
