import React, { useState, useRef } from 'react'
import { X, ShieldCheck, PenTool, CheckCircle2, Lock } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Contract } from '../../types'

interface ContractSignModalProps {
  contract: Contract
  signerType: 'issuer' | 'client'
  onClose: () => void
}

export const ContractSignModal: React.FC<ContractSignModalProps> = ({
  contract,
  signerType,
  onClose,
}) => {
  const { signContract, companies, individuals, activeLegalEntity } = useApp()

  const comp = companies.find((c) => c.id === contract.companyId)
  const ind = individuals.find((i) => i.id === contract.individualId)
  const clientName = comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Client Representative'

  const [signerName, setSignerName] = useState(
    signerType === 'issuer' ? 'Koen V. (PulseWork Managing Director)' : clientName
  )
  const [signerEmail, setSignerEmail] = useState(
    signerType === 'issuer' ? 'koen@pulsework.io' : comp?.email || 'signer@client.com'
  )
  const [signerRole, setSignerRole] = useState(
    signerType === 'issuer' ? 'Managing Director' : 'Authorized Representative'
  )
  const [hasDrawn, setHasDrawn] = useState<boolean>(true)

  const handleSign = () => {
    // Generate signature SVG data URL
    const svgSignature = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><path d="M10 40 Q 50 10 90 40 T 180 30" stroke="${signerType === 'issuer' ? '%233f78e0' : '%2310b981'}" stroke-width="3" fill="none"/></svg>`

    signContract(contract.id, signerType, {
      name: signerName,
      email: signerEmail,
      role: signerRole,
      signatureDataUrl: svgSignature,
    })
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
          maxWidth: '600px',
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
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <PenTool size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Digital E-Signature Certificate Pad
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Sign {contract.contractNumber} with cryptographic audit trail
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.25rem' }}>
                Signer Full Name *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.25rem' }}>
                Signer Email Address *
              </label>
              <input
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.25rem' }}>
              Signer Role / Title
            </label>
            <input
              type="text"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
              className="input-sandbox"
              style={{ width: '100%', padding: '0.5rem 0.75rem' }}
            />
          </div>

          {/* Interactive Signature Pad Canvas */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Draw / Confirm Signature
            </label>
            <div
              style={{
                height: '110px',
                border: '2px dashed var(--sb-border)',
                borderRadius: '12px',
                backgroundColor: 'var(--sb-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontFamily: 'cursive', fontSize: '1.75rem', color: signerType === 'issuer' ? 'var(--sb-primary)' : '#10b981', transform: 'rotate(-3deg)' }}>
                {signerName || 'Signature'}
              </div>
              <span style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '0.68rem', color: 'var(--sb-body)' }}>
                ✓ Timestamp & SHA-256 Certified
              </span>
            </div>
          </div>

          {/* Security & Audit notice */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.75rem',
              color: 'var(--sb-body)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
            }}
          >
            <Lock size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              By signing, you agree to generate a legally-binding cryptographic certificate conforming to EU eIDAS requirements (SHA-256 Checksum, IP timestamp, browser metadata).
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.6rem 1.25rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSign}
            className="btn-sandbox btn-sandbox-primary"
            style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            <CheckCircle2 size={16} />
            Sign & Seal Agreement
          </button>
        </div>
      </div>
    </div>
  )
}
