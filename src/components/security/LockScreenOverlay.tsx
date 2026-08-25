import React, { useState, useEffect } from 'react'
import { Lock, Unlock, ShieldCheck, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { calculateTotpCode } from '../../services/securityService'

export const LockScreenOverlay: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentUser, users, switchUser } = useApp()
  const [pinOrCode, setPinOrCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSwitchingUser, setIsSwitchingUser] = useState(false)

  // Realtime clock
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!isScreenLocked) return null

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const success = unlockScreen(pinOrCode)
    if (!success) {
      setError('Invalid PIN or 2FA authentication code. Please check and try again.')
    } else {
      setPinOrCode('')
    }
  }

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 17, 32, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#f8fafc',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63, 120, 224, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Clock and Date */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 1 }}>
        <div
          style={{
            fontSize: '3.2rem',
            fontWeight: 800,
            fontFamily: 'var(--sb-font-heading)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {formattedTime}
        </div>
        <div style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 500 }}>
          {formattedDate}
        </div>
      </div>

      {/* Lock Screen Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'rgba(21, 31, 50, 0.75)',
          borderRadius: 'var(--sb-radius-xl)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
      >
        {/* User Avatar with Locked Icon Badge */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.6rem',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(63, 120, 224, 0.35)',
              border: '3px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-warning)',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
          >
            <Lock size={14} strokeWidth={2.5} />
          </div>
        </div>

        {/* User Identity */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
          {currentUser.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(63, 120, 224, 0.2)',
              color: '#93c5fd',
              border: '1px solid rgba(63, 120, 224, 0.3)',
            }}
          >
            {currentUser.roleLabel}
          </span>
          {currentUser.twoFactorEnabled && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 185, 149, 0.2)',
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: '1px solid rgba(56, 185, 149, 0.3)',
              }}
            >
              <ShieldCheck size={11} /> 2FA Active
            </span>
          )}
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} style={{ width: '100%', marginTop: '1.5rem' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="password"
              autoFocus
              placeholder="Enter your PIN or authentication code..."
              value={pinOrCode}
              onChange={(e) => {
                setPinOrCode(e.target.value)
                setError(null)
              }}
              style={{
                width: '100%',
                padding: '0.8rem 3rem 0.8rem 1rem',
                borderRadius: 'var(--sb-radius)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: error ? '2px solid var(--sb-danger)' : '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              className="btn-sandbox btn-sandbox-primary"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                bottom: '4px',
                padding: '0 0.85rem',
                borderRadius: 'calc(var(--sb-radius) - 2px)',
              }}
            >
              <ArrowRight size={16} />
            </button>
          </div>

          {error && (
            <div
              style={{
                color: '#f87171',
                fontSize: '0.78rem',
                marginTop: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Switch User Toggle */}
        <div style={{ marginTop: '1.5rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          {!isSwitchingUser ? (
            <button
              type="button"
              onClick={() => setIsSwitchingUser(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <User size={14} /> Switch User Account
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Select Team Member:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id)
                      setIsSwitchingUser(false)
                      setError(null)
                    }}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--sb-radius)',
                      backgroundColor: u.id === currentUser.id ? 'rgba(63, 120, 224, 0.3)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>{u.name} ({u.role})</span>
                    {u.twoFactorEnabled && <span style={{ fontSize: '0.68rem', color: '#34d399' }}>2FA</span>}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsSwitchingUser(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.74rem', cursor: 'pointer', marginTop: '0.2rem' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
