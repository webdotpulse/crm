import React, { useState, useEffect } from 'react'
import { ShieldAlert, Key, X, Check, AlertTriangle, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { verifyTotpCode, calculateTotpCode } from '../../services/securityService'

export const TwoFactorChallengeModal: React.FC = () => {
  const { stepUpChallenge, closeStepUpChallenge, currentUser } = useApp()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBackupMode, setIsBackupMode] = useState(false)

  // Live simulation helper for testing
  const [simulatedCode, setSimulatedCode] = useState(() =>
    currentUser?.twoFactorSecret ? calculateTotpCode(currentUser.twoFactorSecret) : '123456'
  )

  useEffect(() => {
    if (!currentUser?.twoFactorSecret) return
    const interval = setInterval(() => {
      setSimulatedCode(calculateTotpCode(currentUser.twoFactorSecret!))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentUser?.twoFactorSecret])

  if (!stepUpChallenge || !stepUpChallenge.isOpen) return null

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const secret = currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP'
    const cleanCode = code.trim().toUpperCase()

    const isTotpValid = verifyTotpCode(secret, cleanCode)
    const isBackupValid =
      currentUser.backupCodes && currentUser.backupCodes.includes(cleanCode)
    const isDemoValid = cleanCode === simulatedCode || cleanCode === '123456'

    if (isTotpValid || isBackupValid || isDemoValid) {
      const callback = stepUpChallenge.onConfirmed
      closeStepUpChallenge()
      callback()
    } else {
      setError(
        isBackupMode
          ? 'Invalid backup recovery code. Please check and try again.'
          : 'Invalid 6-digit authentication code. Please check your authenticator app.'
      )
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={closeStepUpChallenge}
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
            background: 'linear-gradient(135deg, rgba(226, 98, 107, 0.08) 0%, rgba(63, 120, 224, 0.08) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-danger-soft)',
                color: 'var(--sb-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                {stepUpChallenge.title || 'Security Step-Up Verification'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Protected action for <strong>{currentUser.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={closeStepUpChallenge}
            className="btn-sandbox btn-sandbox-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerify} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.86rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: 0 }}>
            {stepUpChallenge.description ||
              'This sensitive administrative operation requires you to confirm your identity with your two-factor authenticator app.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
              {isBackupMode ? 'Enter 8-Character Backup Code' : 'Enter 6-Digit Authenticator Code'}
            </label>
            <input
              type="text"
              autoFocus
              maxLength={isBackupMode ? 9 : 6}
              placeholder={isBackupMode ? 'XXXX-XXXX' : '000000'}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              style={{
                width: isBackupMode ? '240px' : '200px',
                height: '52px',
                fontSize: isBackupMode ? '1.3rem' : '1.8rem',
                fontWeight: 800,
                letterSpacing: isBackupMode ? '0.15em' : '0.35em',
                textAlign: 'center',
                borderRadius: 'var(--sb-radius)',
                border: error ? '2px solid var(--sb-danger)' : '2px solid var(--sb-primary)',
                backgroundColor: 'var(--sb-surface)',
                color: 'var(--sb-heading)',
                outline: 'none',
                fontFamily: 'var(--sb-font-mono)',
                textTransform: isBackupMode ? 'uppercase' : 'none',
                boxShadow: 'var(--sb-shadow-sm)',
              }}
            />

            {/* Quick Testing helper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                Demo App Code: <strong style={{ color: 'var(--sb-primary)', fontFamily: 'var(--sb-font-mono)' }}>{simulatedCode}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCode(simulatedCode)}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ padding: '0.1rem 0.35rem', fontSize: '0.72rem' }}
              >
                Autofill
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--sb-danger-soft)',
                color: 'var(--sb-danger-text)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--sb-radius)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setIsBackupMode(!isBackupMode)
                setCode('')
                setError(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sb-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isBackupMode ? '← Use Authenticator App Code' : 'Lost your phone? Use a Backup Recovery Code'}
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={closeStepUpChallenge}
              className="btn-sandbox btn-sandbox-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={code.trim().length === 0}
              className="btn-sandbox btn-sandbox-primary"
              style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', fontWeight: 800 }}
            >
              <Check size={16} /> Verify & Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
