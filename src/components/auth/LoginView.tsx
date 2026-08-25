import React, { useState } from 'react'
import {
  Lock,
  Mail,
  KeyRound,
  Shield,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  HelpCircle,
  Server,
  Layers,
  ArrowLeft,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount } from '../../types'

export const LoginView: React.FC = () => {
  const { users, currentUser, login, companyProfile, customTheme } = useApp()

  const [identifier, setIdentifier] = useState(currentUser?.email || (users[0]?.email || ''))
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [is2faStep, setIs2faStep] = useState(false)
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Identify targeted user for avatar / 2FA status
  const matchedUser = users.find(
    (u) =>
      u.email.toLowerCase() === identifier.trim().toLowerCase() ||
      u.name.toLowerCase() === identifier.trim().toLowerCase()
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const res = await login(
        identifier,
        is2faStep ? undefined : password,
        is2faStep ? totpCode : undefined,
        rememberMe
      )

      if (res.requires2fa) {
        setIs2faStep(true)
      } else if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickSelectUser = (user: UserAccount) => {
    setIdentifier(user.email)
    setPassword('')
    setTotpCode('')
    setIs2faStep(false)
    setErrorMessage(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--sb-bg)',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(63, 120, 224, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(116, 82, 214, 0.08) 0px, transparent 50%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '1.5rem',
        boxSizing: 'border-box',
        fontFamily: 'var(--sb-font-body)',
      }}
    >
      {/* Background Decorative Ambient Blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63, 120, 224, 0.12) 0%, rgba(63, 120, 224, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-120px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(116, 82, 214, 0.12) 0%, rgba(116, 82, 214, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Login Card */}
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-xl)',
          boxShadow: 'var(--sb-shadow-lg)',
          border: '1px solid var(--sb-border)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Top Gradient Header */}
        <div
          style={{
            padding: '2rem 2rem 1.25rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(63, 120, 224, 0.06) 0%, transparent 100%)',
            borderBottom: '1px solid var(--sb-border-subtle)',
          }}
        >
          {/* Company / Brand Icon */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'var(--sb-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 20px -4px rgba(63, 120, 224, 0.4)',
            }}
          >
            <ShieldCheck size={32} />
          </div>

          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--sb-font-heading)',
              color: 'var(--sb-heading)',
              margin: '0 0 0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            {customTheme.customBrandName || companyProfile.name || 'GridCRM Enterprise'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', margin: 0 }}>
            Secure Business Management & ERP Suite
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem 2rem 2rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--sb-danger-soft)',
                border: '1px solid var(--sb-danger)',
                color: 'var(--sb-danger-text)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--sb-radius)',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                animation: 'shake 0.3s ease-in-out',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {!is2faStep ? (
            /* STEP 1: Email & Password */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--sb-heading)',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  Work Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. admin@pulsework.io"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      setErrorMessage(null)
                    }}
                    className="input-sandbox"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      paddingLeft: '2.5rem',
                      fontSize: '0.9rem',
                    }}
                  />
                  <Mail
                    size={16}
                    color="var(--sb-body)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    Password or PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--sb-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot credentials?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrorMessage(null)
                    }}
                    className="input-sandbox"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem',
                      fontSize: '0.9rem',
                    }}
                  />
                  <Lock
                    size={16}
                    color="var(--sb-body)"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--sb-body)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--sb-primary)' }}
                  />
                  <span>Keep me signed in on this device</span>
                </label>

                {matchedUser?.twoFactorEnabled && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--sb-success)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <ShieldCheck size={13} /> 2FA Active
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-sandbox btn-sandbox-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  marginTop: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 2FA TOTP Challenge */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--sb-radius)',
                  backgroundColor: 'var(--sb-primary-soft)',
                  border: '1px solid rgba(63, 120, 224, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--sb-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    Two-Factor Verification Required
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                    Enter the 6-digit TOTP code from your Google / Microsoft Authenticator app.
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--sb-heading)',
                    display: 'block',
                    marginBottom: '0.4rem',
                  }}
                >
                  6-Digit Security Code or Backup Code
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={10}
                  placeholder="000 000"
                  value={totpCode}
                  onChange={(e) => {
                    setTotpCode(e.target.value)
                    setErrorMessage(null)
                  }}
                  className="input-sandbox"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    fontFamily: 'var(--sb-font-mono)',
                    padding: '0.75rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIs2faStep(false)
                    setTotpCode('')
                    setErrorMessage(null)
                  }}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ flex: 1, padding: '0.75rem', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || totpCode.trim().length < 6}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ flex: 2, padding: '0.75rem', gap: '0.5rem', fontWeight: 800, fontSize: '0.88rem' }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* Quick Profile Select Tray (Dev / Demo / Fast Switcher) */}
          {users.length > 0 && (
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--sb-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Registered Team Profiles:
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickSwitchOpen(!isQuickSwitchOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--sb-primary)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isQuickSwitchOpen ? 'Hide Profiles' : `Quick Select (${users.length})`}
                </button>
              </div>

              {isQuickSwitchOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {users.map((u) => {
                    const isSelected = u.email.toLowerCase() === identifier.trim().toLowerCase()
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSelectUser(u)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.55rem 0.75rem',
                          borderRadius: 'var(--sb-radius)',
                          backgroundColor: isSelected ? 'var(--sb-primary-soft)' : 'var(--sb-bg-alt)',
                          border: isSelected ? '1px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'var(--sb-primary)' : 'var(--sb-surface)',
                              color: isSelected ? '#ffffff' : 'var(--sb-heading)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              border: '1px solid var(--sb-border)',
                            }}
                          >
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{u.email}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--sb-surface)',
                              border: '1px solid var(--sb-border)',
                              color: 'var(--sb-body)',
                            }}
                          >
                            {u.role}
                          </span>
                          {u.twoFactorEnabled && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--sb-success)', fontWeight: 700 }}>
                              2FA
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Security Badges */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: 'var(--sb-bg-alt)',
            borderTop: '1px solid var(--sb-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--sb-body)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={13} color="var(--sb-success)" />
            <span>SHA-256 Auth & TOTP RFC 6238</span>
          </div>
          <div>v3.0.0 Enterprise</div>
        </div>
      </div>

      {/* Forgot Credentials Help Modal */}
      {showHelpModal && (
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
            padding: '1.5rem',
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="card-sandbox"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--sb-shadow-lg)',
              border: '1px solid var(--sb-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <HelpCircle size={22} color="var(--sb-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Account Recovery & Help
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: '0 0 1rem' }}>
              In an on-premise / private cloud environment, your workspace administrator can reset your credentials or
              generate a temporary password for you via the <strong>User Management Module</strong>.
            </p>
            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--sb-radius)',
                backgroundColor: 'var(--sb-bg-alt)',
                border: '1px solid var(--sb-border)',
                fontSize: '0.8rem',
                color: 'var(--sb-heading)',
                marginBottom: '1.25rem',
              }}
            >
              <strong>Default Recovery:</strong> If you are the system owner, you can sign in using your admin PIN code
              or contact your infrastructure administrator.
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ width: '100%', padding: '0.65rem', fontWeight: 700 }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
