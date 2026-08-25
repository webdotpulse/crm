import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Smartphone,
  Key,
  Copy,
  Check,
  Download,
  AlertTriangle,
  X,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount, TwoFactorSetupData } from '../../types'
import {
  createTwoFactorSetup,
  verifyTotpCode,
  calculateTotpCode,
  getTotpRemainingSeconds,
} from '../../services/securityService'

interface TwoFactorSetupModalProps {
  user: UserAccount
  onClose: () => void
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({ user, onClose }) => {
  const { enable2FAForUser } = useApp()

  const [setupData, setSetupData] = useState<TwoFactorSetupData>(() =>
    createTwoFactorSetup(user.email)
  )
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: QR & Secret, 2: Verification Code, 3: Backup Codes
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [backupSavedAcknowledged, setBackupSavedAcknowledged] = useState(false)

  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupData.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2500)
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
    setCopiedBackup(true)
    setTimeout(() => setCopiedBackup(false), 2500)
  }

  const handleDownloadBackupCodes = () => {
    const content = `=====================================================
PULSEWORK CRM - 2FA BACKUP RECOVERY CODES
Account: ${user.name} (${user.email})
Generated: ${new Date().toISOString()}
=====================================================

Store these 8 emergency recovery codes safely. Each code
can be used once if you lose access to your authenticator app.

${setupData.backupCodes.map((c, i) => `[${i + 1}] ${c}`).join('\n')}

Security Notice: Never share your backup codes with anyone.
=====================================================`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `pulsework_2fa_backup_codes_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    setVerificationError(null)

    const isValid = verifyTotpCode(setupData.secret, verificationCode.trim())
    if (isValid) {
      setStep(3) // Advance to backup codes
    } else {
      setVerificationError('Invalid 6-digit authentication code. Please check your authenticator app.')
    }
  }

  const handleCompleteSetup = () => {
    enable2FAForUser(user.id, setupData.secret, setupData.backupCodes)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-lg)',
          boxShadow: 'var(--sb-shadow-lg)',
          border: '1px solid var(--sb-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(63, 120, 224, 0.08) 0%, rgba(56, 185, 149, 0.08) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Set Up Two-Factor Authentication
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Securing account: <strong>{user.email}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-sandbox btn-sandbox-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps Progress Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.85rem 1.5rem',
            backgroundColor: 'var(--sb-bg-alt)',
            borderBottom: '1px solid var(--sb-border)',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: step >= 1 ? 'var(--sb-primary)' : 'var(--sb-body)',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? 'var(--sb-primary)' : 'var(--sb-border)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
              }}
            >
              1
            </span>
            <span>Scan QR Code</span>
          </div>

          <div style={{ flex: 1, height: '2px', backgroundColor: step >= 2 ? 'var(--sb-primary)' : 'var(--sb-border)' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: step >= 2 ? 'var(--sb-primary)' : 'var(--sb-body)',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? 'var(--sb-primary)' : 'var(--sb-border)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
              }}
            >
              2
            </span>
            <span>Verify Code</span>
          </div>

          <div style={{ flex: 1, height: '2px', backgroundColor: step >= 3 ? 'var(--sb-primary)' : 'var(--sb-border)' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: step >= 3 ? 'var(--sb-primary)' : 'var(--sb-body)',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: step >= 3 ? 'var(--sb-primary)' : 'var(--sb-border)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
              }}
            >
              3
            </span>
            <span>Backup Codes</span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: SCAN QR CODE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: 0 }}>
                Scan the QR code below using your favorite TOTP authenticator application (such as{' '}
                <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>,{' '}
                <strong>1Password</strong>, <strong>Apple Passwords</strong>, or <strong>Authy</strong>).
              </p>

              {/* QR Code Container */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--sb-radius)',
                  border: '1px solid var(--sb-border)',
                  boxShadow: 'var(--sb-shadow-sm)',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: setupData.qrCodeSvg }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>
                  Standard RFC 6238 TOTP • SHA-1 • 30s Window
                </span>
              </div>

              {/* Manual Secret Key Card */}
              <div
                style={{
                  backgroundColor: 'var(--sb-bg-alt)',
                  borderRadius: 'var(--sb-radius)',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--sb-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    Can't scan the QR code? Enter secret key manually:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.3rem' }}
                  >
                    {copiedSecret ? <Check size={14} color="var(--sb-success)" /> : <Copy size={14} />}
                    {copiedSecret ? 'Copied!' : 'Copy Key'}
                  </button>
                </div>
                <code
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    color: 'var(--sb-primary)',
                    fontFamily: 'var(--sb-font-mono)',
                    wordBreak: 'break-all',
                  }}
                >
                  {setupData.secret.match(/.{1,4}/g)?.join(' ') || setupData.secret}
                </code>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFICATION CODE INPUT */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: 0 }}>
                Enter the 6-digit code displayed on your authenticator app to verify that setup was successful.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  6-Digit Authentication Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '')
                    setVerificationCode(clean)
                    setVerificationError(null)
                  }}
                  style={{
                    width: '220px',
                    height: '56px',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    borderRadius: 'var(--sb-radius)',
                    border: verificationError ? '2px solid var(--sb-danger)' : '2px solid var(--sb-primary)',
                    backgroundColor: 'var(--sb-surface)',
                    color: 'var(--sb-heading)',
                    outline: 'none',
                    fontFamily: 'var(--sb-font-mono)',
                    boxShadow: 'var(--sb-shadow-sm)',
                  }}
                />
              </div>

              {verificationError && (
                <div
                  style={{
                    backgroundColor: 'var(--sb-danger-soft)',
                    color: 'var(--sb-danger-text)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--sb-radius)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{verificationError}</span>
                </div>
              )}
            </form>
          )}

          {/* STEP 3: BACKUP RECOVERY CODES */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--sb-warning-soft)',
                  border: '1px solid rgba(250, 183, 88, 0.3)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--sb-radius)',
                  display: 'flex',
                  gap: '0.65rem',
                }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--sb-warning)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--sb-warning-text)' }}>
                    Save Your Backup Recovery Codes
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                    If you lose access to your phone or authenticator app, these single-use recovery codes are the{' '}
                    <strong>only way</strong> to access your account.
                  </div>
                </div>
              </div>

              {/* Codes Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  backgroundColor: 'var(--sb-bg-alt)',
                  padding: '1rem',
                  borderRadius: 'var(--sb-radius)',
                  border: '1px solid var(--sb-border)',
                }}
              >
                {setupData.backupCodes.map((code, idx) => (
                  <div
                    key={code}
                    style={{
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'var(--sb-surface)',
                      borderRadius: '6px',
                      border: '1px solid var(--sb-border)',
                      fontSize: '0.88rem',
                      fontFamily: 'var(--sb-font-mono)',
                      fontWeight: 700,
                      color: 'var(--sb-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginRight: '0.35rem' }}>
                      #{idx + 1}
                    </span>
                    <span>{code}</span>
                  </div>
                ))}
              </div>

              {/* Actions to copy & download */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <Download size={15} /> Download (.txt)
                </button>
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  {copiedBackup ? <Check size={15} color="var(--sb-success)" /> : <Copy size={15} />}
                  {copiedBackup ? 'Copied to Clipboard' : 'Copy All'}
                </button>
              </div>

              {/* Confirmation Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                }}
              >
                <input
                  type="checkbox"
                  checked={backupSavedAcknowledged}
                  onChange={(e) => setBackupSavedAcknowledged(e.target.checked)}
                  style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: 'var(--sb-primary)' }}
                />
                <span style={{ fontSize: '0.82rem', color: 'var(--sb-heading)', fontWeight: 600, lineHeight: 1.4 }}>
                  I have saved and securely backed up these 8 emergency recovery codes.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--sb-border)',
            backgroundColor: 'var(--sb-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
              className="btn-sandbox btn-sandbox-outline"
              style={{ gap: '0.35rem' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Cancel
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ gap: '0.35rem' }}
            >
              Continue to Verification <ArrowRight size={15} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
              className="btn-sandbox btn-sandbox-primary"
              style={{ gap: '0.35rem' }}
            >
              Verify Code <ArrowRight size={15} />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleCompleteSetup}
              disabled={!backupSavedAcknowledged}
              className="btn-sandbox btn-sandbox-success"
              style={{ gap: '0.35rem', fontWeight: 800 }}
            >
              <Check size={16} /> Enable 2FA Protection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
