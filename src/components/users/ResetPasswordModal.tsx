import React, { useState } from 'react'
import { X, KeyRound, Copy, Check, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount } from '../../types'
import { generateSecurePassword } from '../../services/securityService'

interface ResetPasswordModalProps {
  user: UserAccount
  onClose: () => void
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose }) => {
  const { resetUserPassword } = useApp()
  const [newPassword, setNewPassword] = useState(() => generateSecurePassword(14))
  const [copied, setCopied] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = () => {
    setNewPassword(generateSecurePassword(14))
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      setError('Please provide a valid password.')
      return
    }
    setIsSubmitting(true)
    try {
      await resetUserPassword(user.id, newPassword.trim())
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-lg)',
          boxShadow: 'var(--sb-shadow-lg)',
          border: '1px solid var(--sb-border)',
          overflow: 'hidden',
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
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(226, 98, 107, 0.08) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-warning-soft)',
                color: 'var(--sb-warning-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Reset Credentials
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                For {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.35rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: 'var(--sb-danger-soft)',
                  border: '1px solid var(--sb-danger)',
                  color: 'var(--sb-danger-text)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--sb-radius)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ fontSize: '0.82rem', color: 'var(--sb-body)', lineHeight: 1.4 }}>
              Set a temporary password or generate a cryptographically strong 14-character token. The user will be prompted to update their password.
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  New Secure Password
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn-sandbox btn-sandbox-ghost"
                  style={{ fontSize: '0.74rem', padding: '0.15rem 0.4rem', color: 'var(--sb-primary)', gap: '0.25rem' }}
                >
                  <Sparkles size={13} /> Re-Generate
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-sandbox"
                  style={{
                    flex: 1,
                    fontFamily: 'var(--sb-font-mono)',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ padding: '0 0.85rem', gap: '0.35rem', fontSize: '0.8rem' }}
                  title="Copy password to clipboard"
                >
                  {copied ? <Check size={14} color="var(--sb-success)" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--sb-radius)',
                backgroundColor: 'var(--sb-bg-alt)',
                border: '1px solid var(--sb-border)',
                fontSize: '0.75rem',
                color: 'var(--sb-body)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={15} color="var(--sb-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Resetting will immediately invalidate any previous password and log this action in the security audit trail.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-sandbox btn-sandbox-primary"
                style={{ gap: '0.4rem', fontWeight: 800 }}
              >
                <Check size={16} /> {isSubmitting ? 'Updating...' : 'Confirm Reset Password'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-success-soft)',
                color: 'var(--sb-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Check size={28} />
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.5rem' }}>
              Password Reset Successfully!
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', margin: '0 0 1.25rem', maxWidth: '340px' }}>
              The new credentials for <strong>{user.name}</strong> have been updated and stored.
            </p>

            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--sb-radius)',
                backgroundColor: 'var(--sb-bg-alt)',
                border: '1px solid var(--sb-border)',
                fontFamily: 'var(--sb-font-mono)',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--sb-heading)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span>{newPassword}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}
              >
                {copied ? <Check size={13} color="var(--sb-success)" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button onClick={onClose} className="btn-sandbox btn-sandbox-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
