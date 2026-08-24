import React, { useState } from 'react'
import {
  FileText,
  Plus,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  Clock,
  Trash2,
  Edit2,
  Lock,
  Download,
  Building,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Contract, ContractType, ContractStatus } from '../../types'
import { formatCurrency } from '../../services/currencyService'
import { ContractModal } from './ContractModal'
import { ContractSignModal } from './ContractSignModal'

export const ContractsView: React.FC = () => {
  const { contracts, deleteContract, companies, individuals, selectedCurrency } = useApp()

  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedContractToEdit, setSelectedContractToEdit] = useState<Contract | null>(null)
  const [signModalData, setSignModalData] = useState<{ contract: Contract; signerType: 'issuer' | 'client' } | null>(null)
  const [viewAuditContract, setViewAuditContract] = useState<Contract | null>(null)

  const filteredContracts = contracts.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    return true
  })

  const getStatusBadge = (st: ContractStatus) => {
    if (st === 'signed') return <span className="badge-sandbox badge-soft-success">✓ Fully Signed</span>
    if (st === 'sent') return <span className="badge-sandbox badge-soft-primary">Awaiting Signature</span>
    if (st === 'draft') return <span className="badge-sandbox badge-soft-warning">Draft</span>
    return <span className="badge-sandbox badge-soft-danger">Expired</span>
  }

  const getTypeBadge = (t: ContractType) => {
    const map: Record<ContractType, { label: string; badge: string }> = {
      nda: { label: 'NDA', badge: 'badge-soft-primary' },
      sla: { label: 'SLA (99.9%)', badge: 'badge-soft-purple' },
      msa: { label: 'Master MSA', badge: 'badge-soft-success' },
      handover: { label: 'Project Sign-off', badge: 'badge-soft-warning' },
      custom: { label: 'Custom', badge: 'badge-soft-primary' },
    }
    const item = map[t] || { label: t, badge: 'badge-soft-primary' }
    return <span className={`badge-sandbox ${item.badge}`}>{item.label}</span>
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Contracts & SLA Lifecycle Management
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            NDAs, Master Services Agreements, Uptime SLAs, and digital e-signature audit trails
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedContractToEdit(null)
            setIsModalOpen(true)
          }}
          className="btn-sandbox btn-sandbox-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>New Agreement / SLA</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Active Signed Agreements</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {contracts.filter((c) => c.status === 'signed').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Cryptographically sealed & audit verified
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Contracted Value</span>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>SLA / MSA</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(
              contracts.reduce((sum, c) => sum + (c.value || 0), 0),
              selectedCurrency
            )}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Total contracted legal commitments
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>eIDAS Compliance</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>EN 16931</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
            SHA-256 Cryptographic Audit
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Browser fingerprint, timestamp & IP logging
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Contract Types</option>
            <option value="nda">Non-Disclosure (NDA)</option>
            <option value="sla">Service Level Agreements (SLA)</option>
            <option value="msa">Master Services Agreements (MSA)</option>
            <option value="handover">Project Acceptance Sign-off</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="signed">Signed</option>
            <option value="sent">Sent / Awaiting Signature</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
          Showing <strong>{filteredContracts.length}</strong> legal agreements
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                AGREEMENT / NUMBER
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                TYPE
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                CLIENT PARTY
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                STATUS / SIGNATURES
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                VALUE
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'center' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((ctr) => {
              const comp = companies.find((c) => c.id === ctr.companyId)
              const ind = individuals.find((i) => i.id === ctr.individualId)
              const clientName = comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Client'
              const issuerSigned = !!ctr.signatures.issuerSignature
              const clientSigned = !!ctr.signatures.clientSignature

              return (
                <tr
                  key={ctr.id}
                  style={{
                    borderBottom: '1px solid var(--sb-border)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--sb-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                      {ctr.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                      {ctr.contractNumber} • Effective: {ctr.effectiveDate}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    {getTypeBadge(ctr.type)}
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
                      {clientName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
                      {ctr.clientType === 'company' ? 'Enterprise B2B' : 'Private Person'}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ marginBottom: '0.35rem' }}>{getStatusBadge(ctr.status)}</div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <span
                        className={`badge-sandbox ${issuerSigned ? 'badge-soft-success' : 'badge-soft-warning'}`}
                        style={{ fontSize: '0.62rem' }}
                      >
                        {issuerSigned ? '✓ Issuer Signed' : 'Issuer Pending'}
                      </span>
                      <span
                        className={`badge-sandbox ${clientSigned ? 'badge-soft-success' : 'badge-soft-warning'}`}
                        style={{ fontSize: '0.62rem' }}
                      >
                        {clientSigned ? '✓ Client Signed' : 'Client Pending'}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                    {ctr.value && ctr.value > 0 ? formatCurrency(ctr.value, selectedCurrency) : '—'}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      {!issuerSigned && (
                        <button
                          onClick={() => setSignModalData({ contract: ctr, signerType: 'issuer' })}
                          className="btn-sandbox btn-sandbox-primary"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.7rem' }}
                        >
                          ✍️ Sign as Issuer
                        </button>
                      )}
                      {!clientSigned && (
                        <button
                          onClick={() => setSignModalData({ contract: ctr, signerType: 'client' })}
                          className="btn-sandbox btn-sandbox-outline"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.7rem', color: '#10b981', borderColor: '#10b981' }}
                        >
                          ✍️ Sign as Client
                        </button>
                      )}
                      {(issuerSigned || clientSigned) && (
                        <button
                          onClick={() => setViewAuditContract(ctr)}
                          title="View Cryptographic Audit Trail"
                          className="btn-sandbox btn-sandbox-outline"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.7rem' }}
                        >
                          🔒 Audit Trail
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedContractToEdit(ctr)
                          setIsModalOpen(true)
                        }}
                        title="Edit Agreement"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--sb-body)',
                          padding: '0.3rem',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteContract(ctr.id)}
                        title="Delete Agreement"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--sb-danger)',
                          padding: '0.3rem',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredContracts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  <FileText size={36} color="var(--sb-body)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No legal agreements found</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Draft an NDA, Master Services Agreement, or Uptime SLA.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Audit Trail Modal */}
      {viewAuditContract && (
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
              maxWidth: '650px',
              padding: '1.75rem',
              backgroundColor: 'var(--sb-card-bg)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  Cryptographic Audit Certificate
                </h3>
              </div>
              <button onClick={() => setViewAuditContract(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
              Contract: <strong>{viewAuditContract.title}</strong> ({viewAuditContract.contractNumber})
            </div>

            {viewAuditContract.signatures.issuerSignature && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--sb-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--sb-border)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-primary)', marginBottom: '0.4rem' }}>
                  🏢 Issuer Signature: {viewAuditContract.signatures.issuerSignature.signerName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                  Email: {viewAuditContract.signatures.issuerSignature.signerEmail}<br />
                  Timestamp: {viewAuditContract.signatures.issuerSignature.timestamp}<br />
                  IP Address: <code>{viewAuditContract.signatures.issuerSignature.ipAddress}</code><br />
                  SHA-256 Checksum: <code>{viewAuditContract.signatures.issuerSignature.documentChecksumSha256}</code><br />
                  Certificate: <strong>{viewAuditContract.signatures.issuerSignature.certificateId}</strong>
                </div>
              </div>
            )}

            {viewAuditContract.signatures.clientSignature && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--sb-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--sb-border)',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981', marginBottom: '0.4rem' }}>
                  👤 Client Signature: {viewAuditContract.signatures.clientSignature.signerName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                  Email: {viewAuditContract.signatures.clientSignature.signerEmail}<br />
                  Timestamp: {viewAuditContract.signatures.clientSignature.timestamp}<br />
                  IP Address: <code>{viewAuditContract.signatures.clientSignature.ipAddress}</code><br />
                  SHA-256 Checksum: <code>{viewAuditContract.signatures.clientSignature.documentChecksumSha256}</code><br />
                  Certificate: <strong>{viewAuditContract.signatures.clientSignature.certificateId}</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewAuditContract(null)} className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ContractModal
          contractToEdit={selectedContractToEdit}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedContractToEdit(null)
          }}
        />
      )}

      {signModalData && (
        <ContractSignModal
          contract={signModalData.contract}
          signerType={signModalData.signerType}
          onClose={() => setSignModalData(null)}
        />
      )}
    </div>
  )
}
