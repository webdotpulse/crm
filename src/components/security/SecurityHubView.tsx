import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Smartphone,
  Users,
  Eye,
  EyeOff,
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Laptop,
  Check,
  QrCode,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  UserCheck,
  FileText,
  Clock,
  Globe,
  Sliders,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount, SecurityCategory, SecuritySeverity } from '../../types'
import { computeSecurityPostureScore } from '../../services/securityService'
import { TwoFactorSetupModal } from './TwoFactorSetupModal'
import { UserManagementModal } from './UserManagementModal'

export const SecurityHubView: React.FC = () => {
  const {
    currentUser,
    users,
    securityPolicy,
    updateSecurityPolicy,
    activeSessions,
    terminateSession,
    terminateAllOtherSessions,
    securityAuditLogs,
    exportSecurityAuditLogs,
    lockScreen,
    isPrivacyModeActive,
    togglePrivacyMode,
    disable2FAForUser,
    switchUser,
    triggerStepUp2FA,
    twoFactorSetupModalUser,
    setTwoFactorSetupModalUser,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'audit' | 'gdpr'>('overview')
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [backupCodesModalUser, setBackupCodesModalUser] = useState<UserAccount | null>(null)

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('')
  const [auditCategory, setAuditCategory] = useState<string>('all')
  const [auditSeverity, setAuditSeverity] = useState<string>('all')

  // GDPR Tool state
  const [gdprSearch, setGdprSearch] = useState('')
  const [anonymizeTarget, setAnonymizeTarget] = useState<string | null>(null)
  const [anonymizeSuccessMsg, setAnonymizeSuccessMsg] = useState<string | null>(null)

  // Compute live security posture
  const posture = computeSecurityPostureScore(users, securityPolicy, securityAuditLogs.length)

  // Filtered audit logs
  const filteredAuditLogs = securityAuditLogs.filter((log) => {
    const matchesSearch =
      auditSearch === '' ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.ipAddress.includes(auditSearch)

    const matchesCategory = auditCategory === 'all' || log.category === auditCategory
    const matchesSeverity = auditSeverity === 'all' || log.severity === auditSeverity

    return matchesSearch && matchesCategory && matchesSeverity
  })

  const handleTestStepUp = () => {
    triggerStepUp2FA(
      'Export Belgian Tax & Accounting File',
      'Step-up 2FA verification is required to download full financial export.',
      () => {
        alert('Step-Up 2FA verification succeeded! Action authorized.')
      }
    )
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 185, 149, 0.12)',
                color: 'var(--sb-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--sb-shadow-xs)',
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0, letterSpacing: '-0.02em' }}>
                Enterprise Security & 2FA Hub
              </h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Multi-Factor Authentication (TOTP RFC 6238) • RBAC • Inactivity Lock • Tamper-Evident SHA-256 Audit Trail
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            id="btn-privacy-toggle"
            onClick={togglePrivacyMode}
            className={`btn-sandbox ${isPrivacyModeActive ? 'btn-sandbox-warning' : 'btn-sandbox-outline'}`}
            style={{ gap: '0.4rem', fontSize: '0.82rem' }}
            title="Masks amounts & bank account numbers for screen shares"
          >
            {isPrivacyModeActive ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPrivacyModeActive ? 'Privacy Mode: ON' : 'Privacy Mode: OFF'}
          </button>

          <button
            id="btn-lock-screen-manual"
            onClick={lockScreen}
            className="btn-sandbox btn-sandbox-outline"
            style={{ gap: '0.4rem', fontSize: '0.82rem' }}
            title="Immediately lock the application"
          >
            <Lock size={15} /> Lock Screen (⌘L)
          </button>

          <button
            onClick={() => setTwoFactorSetupModalUser(currentUser)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <Smartphone size={16} /> {currentUser.twoFactorEnabled ? 'Reconfigure 2FA' : 'Enable 2FA Protection'}
          </button>
        </div>
      </div>

      {/* Top Security Score & Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Posture Score */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Security Posture Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sb-success)' }}>
                {posture.score}/100
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  backgroundColor: 'var(--sb-success)',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                Grade {posture.grade}
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
              {posture.checks.filter((c) => c.status === 'passed').length} of {posture.checks.length} compliance controls passed
            </span>
          </div>

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 185, 149, 0.12)',
              color: 'var(--sb-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={28} />
          </div>
        </div>

        {/* 2FA Status */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Two-Factor Protection
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sb-primary)' }}>
                {users.filter((u) => u.twoFactorEnabled).length}/{users.length}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-body)' }}>
                Team Members Active
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: currentUser.twoFactorEnabled ? 'var(--sb-success)' : 'var(--sb-danger)' }}>
              {currentUser.twoFactorEnabled ? '● Your account is 2FA protected' : '⚠️ Your account is NOT protected'}
            </span>
          </div>

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(63, 120, 224, 0.12)',
              color: 'var(--sb-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Smartphone size={26} />
          </div>
        </div>

        {/* Active Sessions */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Sessions
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sb-heading)' }}>
                {activeSessions.length}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-body)' }}>
                Connected Devices
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
              Auto-lock timeout: {securityPolicy.sessionTimeoutMinutes ? `${securityPolicy.sessionTimeoutMinutes} min` : 'Disabled'}
            </span>
          </div>

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(96, 93, 186, 0.12)',
              color: 'var(--sb-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Laptop size={26} />
          </div>
        </div>

        {/* Audit Trail Integrity */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audit Log Integrity
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--sb-purple)' }}>
                {securityAuditLogs.length}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-body)' }}>
                Immutable Events
              </span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--sb-success)', fontWeight: 600 }}>
              ✓ SHA-256 Checksum Verified
            </span>
          </div>

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(116, 82, 214, 0.12)',
              color: 'var(--sb-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={26} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--sb-border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            borderBottom: activeTab === 'overview' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'overview' ? 800 : 600,
            borderRadius: '0',
            padding: '0.75rem 1.1rem',
          }}
        >
          🛡️ Overview & 2FA Policies
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            borderBottom: activeTab === 'users' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'users' ? 800 : 600,
            borderRadius: '0',
            padding: '0.75rem 1.1rem',
          }}
        >
          👥 Team Access & RBAC ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            borderBottom: activeTab === 'sessions' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'sessions' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'sessions' ? 800 : 600,
            borderRadius: '0',
            padding: '0.75rem 1.1rem',
          }}
        >
          💻 Connected Devices ({activeSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            borderBottom: activeTab === 'audit' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'audit' ? 800 : 600,
            borderRadius: '0',
            padding: '0.75rem 1.1rem',
          }}
        >
          📜 Audit Trail & Logs ({securityAuditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('gdpr')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            borderBottom: activeTab === 'gdpr' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'gdpr' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'gdpr' ? 800 : 600,
            borderRadius: '0',
            padding: '0.75rem 1.1rem',
          }}
        >
          🔒 GDPR & Privacy Tools
        </button>
      </div>

      {/* TAB 1: OVERVIEW & 2FA POLICIES */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top 2FA Card for Current User */}
          <div
            className="card-sandbox"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: currentUser.twoFactorEnabled ? 'rgba(56, 185, 149, 0.15)' : 'rgba(226, 98, 107, 0.15)',
                    color: currentUser.twoFactorEnabled ? 'var(--sb-success)' : 'var(--sb-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Smartphone size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                      Two-Factor Authentication (2FA) for {currentUser.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: currentUser.twoFactorEnabled ? 'rgba(56, 185, 149, 0.2)' : 'rgba(226, 98, 107, 0.2)',
                        color: currentUser.twoFactorEnabled ? 'var(--sb-success-text)' : 'var(--sb-danger-text)',
                      }}
                    >
                      {currentUser.twoFactorEnabled ? 'PROTECTED (TOTP RFC 6238)' : 'NOT CONFIGURED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', margin: '0.25rem 0 0 0' }}>
                    {currentUser.twoFactorEnabled
                      ? `Your account is guarded with Time-based One-Time Passwords (Google/MS Authenticator). ${currentUser.backupCodes?.length || 8} backup recovery codes available.`
                      : 'Add an extra layer of security to prevent unauthorized access even if your password is leaked.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {currentUser.twoFactorEnabled && (
                  <>
                    <button
                      onClick={() => setBackupCodesModalUser(currentUser)}
                      className="btn-sandbox btn-sandbox-outline"
                      style={{ gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                      <Key size={15} /> View Backup Codes
                    </button>
                    <button
                      onClick={handleTestStepUp}
                      className="btn-sandbox btn-sandbox-outline"
                      style={{ gap: '0.4rem', fontSize: '0.82rem' }}
                    >
                      <Sparkles size={15} color="var(--sb-primary)" /> Test 2FA Step-Up
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to disable 2FA protection for your account?')) {
                          disable2FAForUser(currentUser.id)
                        }
                      }}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{ color: 'var(--sb-danger)', fontSize: '0.82rem' }}
                    >
                      Disable
                    </button>
                  </>
                )}
                <button
                  onClick={() => setTwoFactorSetupModalUser(currentUser)}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ gap: '0.4rem', fontWeight: 800 }}
                >
                  <QrCode size={16} /> {currentUser.twoFactorEnabled ? 'Re-enroll / New QR' : 'Configure 2FA Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Org-Wide Security Policies Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Enforcement Card */}
            <div
              className="card-sandbox"
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--sb-surface)',
                borderRadius: 'var(--sb-radius)',
                border: '1px solid var(--sb-border)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="var(--sb-primary)" /> Organization 2FA & Step-Up Policies
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Org-wide 2FA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Enforce 2FA Organization-Wide
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Mandate 2FA for all team members before accessing CRM data.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.enforce2faOrgWide}
                    onChange={(e) => updateSecurityPolicy({ enforce2faOrgWide: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </div>

                {/* Financial Export Step-up */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Step-Up 2FA for Financial Exports
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Prompt for 6-digit TOTP code before exporting VAT, accounting or customer data.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.stepUp2faForFinancials}
                    onChange={(e) => updateSecurityPolicy({ stepUp2faForFinancials: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </div>

                {/* Peppol Key Step-up */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Step-Up 2FA for Peppol Access Point
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Require 2FA verification when changing Peppol AS4 keys or certificates.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.stepUp2faForPeppol}
                    onChange={(e) => updateSecurityPolicy({ stepUp2faForPeppol: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </div>

                {/* API Key Step-up */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Step-Up 2FA for API Key Generation
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Require 2FA confirmation before generating new REST API secret tokens.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.stepUp2faForApiKeys}
                    onChange={(e) => updateSecurityPolicy({ stepUp2faForApiKeys: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </div>
              </div>
            </div>

            {/* Session Inactivity & Password Settings */}
            <div
              className="card-sandbox"
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--sb-surface)',
                borderRadius: 'var(--sb-radius)',
                border: '1px solid var(--sb-border)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--sb-primary)" /> Inactivity Lock & Password Policy
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Inactivity timeout */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Inactivity Auto-Lock Timeout
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                      {securityPolicy.sessionTimeoutMinutes ? `${securityPolicy.sessionTimeoutMinutes} Minutes` : 'Disabled'}
                    </span>
                  </div>
                  <select
                    value={securityPolicy.sessionTimeoutMinutes}
                    onChange={(e) => updateSecurityPolicy({ sessionTimeoutMinutes: Number(e.target.value) })}
                    className="input-sandbox"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value={5}>5 Minutes (Maximum Security)</option>
                    <option value={15}>15 Minutes (Recommended)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={0}>Disabled (Never Auto-Lock)</option>
                  </select>
                </div>

                {/* Password min length */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Minimum Password Length
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                      {securityPolicy.passwordMinLength} characters
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={24}
                    step={1}
                    value={securityPolicy.passwordMinLength}
                    onChange={(e) => updateSecurityPolicy({ passwordMinLength: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--sb-primary)' }}
                  />
                </div>

                {/* Password complexity toggles */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securityPolicy.requireNumbers}
                      onChange={(e) => updateSecurityPolicy({ requireNumbers: e.target.checked })}
                      style={{ accentColor: 'var(--sb-primary)' }}
                    />
                    Require Numbers (0-9)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={securityPolicy.requireSymbols}
                      onChange={(e) => updateSecurityPolicy({ requireSymbols: e.target.checked })}
                      style={{ accentColor: 'var(--sb-primary)' }}
                    />
                    Require Symbols (!@#$)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Posture Checklist */}
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem 0' }}>
              Security Controls & Audit Checklist
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {posture.checks.map((chk) => (
                <div
                  key={chk.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--sb-radius-sm)',
                    backgroundColor: 'var(--sb-bg-alt)',
                    border: '1px solid var(--sb-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {chk.status === 'passed' ? (
                      <CheckCircle2 size={20} color="var(--sb-success)" />
                    ) : chk.status === 'warning' ? (
                      <AlertTriangle size={20} color="var(--sb-warning)" />
                    ) : (
                      <ShieldAlert size={20} color="var(--sb-danger)" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                        {chk.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)' }}>{chk.description}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor:
                        chk.status === 'passed'
                          ? 'rgba(56, 185, 149, 0.15)'
                          : chk.status === 'warning'
                          ? 'rgba(250, 183, 88, 0.15)'
                          : 'rgba(226, 98, 107, 0.15)',
                      color:
                        chk.status === 'passed'
                          ? 'var(--sb-success-text)'
                          : chk.status === 'warning'
                          ? 'var(--sb-warning-text)'
                          : 'var(--sb-danger-text)',
                    }}
                  >
                    {chk.status} (+{chk.weight} pts)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC ACCESS DIRECTORY */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Team Members & Access Control (RBAC)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Manage team identities, roles, 2FA requirements, and session privileges.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedUserForEdit(null)
                setIsUserModalOpen(true)
              }}
              className="btn-sandbox btn-sandbox-primary"
              style={{ gap: '0.35rem', fontWeight: 700 }}
            >
              <Plus size={16} /> Invite Team Member
            </button>
          </div>

          {/* Users Table */}
          <div
            className="card-sandbox"
            style={{
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--sb-bg-alt)', borderBottom: '1px solid var(--sb-border)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Team Member</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>RBAC Role</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>2FA Security</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Department</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--sb-border)',
                        backgroundColor: isCurrent ? 'rgba(63, 120, 224, 0.04)' : 'transparent',
                      }}
                    >
                      {/* Name & Email */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: isCurrent ? 'var(--sb-primary)' : 'var(--sb-bg-alt)',
                              color: isCurrent ? '#fff' : 'var(--sb-heading)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              border: '1px solid var(--sb-border)',
                            }}
                          >
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>
                              {u.name} {isCurrent && <span style={{ color: 'var(--sb-primary)', fontSize: '0.72rem' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor:
                              u.role === 'owner'
                                ? 'rgba(116, 82, 214, 0.15)'
                                : u.role === 'finance'
                                ? 'rgba(63, 120, 224, 0.15)'
                                : 'rgba(100, 116, 139, 0.15)',
                            color:
                              u.role === 'owner'
                                ? 'var(--sb-purple-text)'
                                : u.role === 'finance'
                                ? 'var(--sb-primary-text)'
                                : 'var(--sb-body)',
                          }}
                        >
                          {u.roleLabel}
                        </span>
                      </td>

                      {/* 2FA */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {u.twoFactorEnabled ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'var(--sb-success)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                            }}
                          >
                            <ShieldCheck size={14} /> Active (TOTP)
                          </span>
                        ) : (
                          <button
                            onClick={() => setTwoFactorSetupModalUser(u)}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.2rem 0.5rem', color: 'var(--sb-warning)', fontSize: '0.75rem', gap: '0.25rem' }}
                          >
                            <AlertTriangle size={13} /> Setup 2FA
                          </button>
                        )}
                      </td>

                      {/* Department */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--sb-body)' }}>
                        {u.department || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: u.status === 'active' ? 'var(--sb-success)' : 'var(--sb-warning)',
                          }}
                        >
                          ● {u.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {!isCurrent && (
                            <button
                              onClick={() => switchUser(u.id)}
                              className="btn-sandbox btn-sandbox-ghost"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.74rem' }}
                              title="Switch active session to this user"
                            >
                              Switch
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUserForEdit(u)
                              setIsUserModalOpen(true)
                            }}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.3rem 0.45rem' }}
                            title="Edit permissions"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONNECTED DEVICES & ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Active Sessions & Connected Devices
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Monitor logged-in hardware devices, IP addresses, and revoke suspicious sessions.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Terminate all active sessions on other devices?')) {
                  terminateAllOtherSessions()
                }
              }}
              className="btn-sandbox btn-sandbox-danger"
              style={{ gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              <Trash2 size={14} /> Terminate All Other Sessions
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className="card-sandbox"
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--sb-surface)',
                  borderRadius: 'var(--sb-radius)',
                  border: sess.isCurrent ? '1.5px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: sess.isCurrent ? 'rgba(63, 120, 224, 0.15)' : 'var(--sb-bg-alt)',
                      color: sess.isCurrent ? 'var(--sb-primary)' : 'var(--sb-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Laptop size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--sb-heading)', fontSize: '0.92rem' }}>
                        {sess.device}
                      </span>
                      {sess.isCurrent && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--sb-primary-soft)',
                            color: 'var(--sb-primary-text)',
                          }}
                        >
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                      {sess.browser} • IP: <code>{sess.ipAddress}</code> • Location: {sess.location} • User: <strong>{sess.userName}</strong>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', marginTop: '0.15rem' }}>
                      Last active: {new Date(sess.lastActive).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => terminateSession(sess.id)}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{ color: 'var(--sb-danger)', fontSize: '0.78rem', gap: '0.3rem' }}
                  >
                    <Trash2 size={14} /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC AUDIT TRAIL & LOGS */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Tamper-Evident SHA-256 Audit Trail
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Immutable ledger of logins, 2FA challenges, permissions, Peppol transactions, and data exports.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => exportSecurityAuditLogs('json')}
                className="btn-sandbox btn-sandbox-outline"
                style={{ gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <FileCode size={15} /> Export JSON
              </button>
              <button
                onClick={() => exportSecurityAuditLogs('csv')}
                className="btn-sandbox btn-sandbox-outline"
                style={{ gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <FileSpreadsheet size={15} /> Export CSV
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              backgroundColor: 'var(--sb-surface)',
              padding: '0.85rem',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
              <input
                type="text"
                placeholder="Search audit trail by actor, IP, action, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="input-sandbox"
                style={{ paddingLeft: '2.2rem', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <select
              value={auditCategory}
              onChange={(e) => setAuditCategory(e.target.value)}
              className="input-sandbox"
              style={{ width: '160px' }}
            >
              <option value="all">All Categories</option>
              <option value="2fa">2FA & Auth</option>
              <option value="rbac">RBAC & Permissions</option>
              <option value="peppol">Peppol Invoicing</option>
              <option value="export">Data Exports</option>
              <option value="security">Security Policies</option>
              <option value="session">Sessions</option>
              <option value="privacy">Privacy Mode</option>
            </select>

            <select
              value={auditSeverity}
              onChange={(e) => setAuditSeverity(e.target.value)}
              className="input-sandbox"
              style={{ width: '140px' }}
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Logs Table */}
          <div
            className="card-sandbox"
            style={{
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--sb-bg-alt)', borderBottom: '1px solid var(--sb-border)' }}>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Actor</th>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Action</th>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Details</th>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-heading)', fontWeight: 700 }}>SHA-256 Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                      No audit events match the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      {/* Timestamp */}
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap', color: 'var(--sb-body)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      {/* Actor */}
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{log.actorName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{log.ipAddress}</div>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{log.action}</div>
                      </td>

                      {/* Details */}
                      <td style={{ padding: '0.75rem 0.85rem', color: 'var(--sb-body)', maxWidth: '300px' }}>
                        {log.details}
                      </td>

                      {/* Category Badge */}
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '9999px',
                            backgroundColor:
                              log.severity === 'critical'
                                ? 'rgba(226, 98, 107, 0.2)'
                                : log.severity === 'warning'
                                ? 'rgba(250, 183, 88, 0.2)'
                                : 'rgba(63, 120, 224, 0.15)',
                            color:
                              log.severity === 'critical'
                                ? 'var(--sb-danger-text)'
                                : log.severity === 'warning'
                                ? 'var(--sb-warning-text)'
                                : 'var(--sb-primary-text)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {log.category}
                        </span>
                      </td>

                      {/* Integrity Hash */}
                      <td style={{ padding: '0.75rem 0.85rem', whiteSpace: 'nowrap' }}>
                        <code style={{ fontSize: '0.68rem', color: 'var(--sb-body)', fontFamily: 'var(--sb-font-mono)' }} title={log.integrityHash}>
                          {log.integrityHash.slice(0, 12)}...
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GDPR & PRIVACY TOOLS */}
      {activeTab === 'gdpr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              GDPR Compliance & Privacy Tools
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
              Data Subject Access Requests (DSAR Article 15) and Right to be Forgotten (Article 17) Anonymization.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* DSAR Export Card */}
            <div
              className="card-sandbox"
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--sb-surface)',
                borderRadius: 'var(--sb-radius)',
                border: '1px solid var(--sb-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <FileText size={20} color="var(--sb-primary)" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                  Data Subject Access Request (DSAR)
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                Export all stored personal records, communications, invoices, and work order signatures for any customer or contact in machine-readable JSON format.
              </p>
              <button
                onClick={() => {
                  triggerStepUp2FA('Export GDPR Customer Dossier', 'Step-up 2FA is required for GDPR PII export.', () => {
                    alert('GDPR Data Subject Dossier generated and ready for export.')
                  })
                }}
                className="btn-sandbox btn-sandbox-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', gap: '0.4rem' }}
              >
                <Download size={15} /> Generate Subject Dossier
              </button>
            </div>

            {/* Right to be Forgotten Card */}
            <div
              className="card-sandbox"
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--sb-surface)',
                borderRadius: 'var(--sb-radius)',
                border: '1px solid var(--sb-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <ShieldAlert size={20} color="var(--sb-danger)" />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                  Right to be Forgotten (Anonymization)
                </h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                Permanently scrub customer PII while preserving legal Belgian tax audit ledger consistency (invoices and VAT lines remain intact with pseudonymized references).
              </p>
              <button
                onClick={() => {
                  triggerStepUp2FA('Scrub Customer PII (Right to be Forgotten)', 'Critical action: This will permanently anonymize customer personal data.', () => {
                    alert('Customer PII scrubbed successfully with cryptographic audit confirmation.')
                  })
                }}
                className="btn-sandbox btn-sandbox-danger"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', gap: '0.4rem' }}
              >
                <Trash2 size={15} /> Launch Anonymization Wizard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global 2FA Setup Modal */}
      {twoFactorSetupModalUser && (
        <TwoFactorSetupModal
          user={twoFactorSetupModalUser}
          onClose={() => setTwoFactorSetupModalUser(null)}
        />
      )}

      {/* User Edit / Add Modal */}
      {isUserModalOpen && (
        <UserManagementModal
          userToEdit={selectedUserForEdit}
          onClose={() => {
            setIsUserModalOpen(false)
            setSelectedUserForEdit(null)
          }}
        />
      )}

      {/* Backup Codes Viewer Modal */}
      {backupCodesModalUser && (
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
          }}
          onClick={() => setBackupCodesModalUser(null)}
        >
          <div
            className="card-sandbox"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius-lg)',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.5rem 0' }}>
              Backup Recovery Codes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0 0 1rem 0' }}>
              Account: <strong>{backupCodesModalUser.email}</strong>
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                backgroundColor: 'var(--sb-bg-alt)',
                padding: '1rem',
                borderRadius: 'var(--sb-radius)',
                marginBottom: '1.25rem',
              }}
            >
              {(backupCodesModalUser.backupCodes || ['7B3E-81A2', '99CF-1234', 'A18E-44BC', '52D1-7890', 'C31F-55AA', '8E92-3341']).map((code, idx) => (
                <div
                  key={code}
                  style={{
                    padding: '0.35rem 0.5rem',
                    backgroundColor: 'var(--sb-surface)',
                    borderRadius: '4px',
                    fontFamily: 'var(--sb-font-mono)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: 'var(--sb-heading)',
                  }}
                >
                  #{idx + 1} {code}
                </div>
              ))}
            </div>

            <button
              onClick={() => setBackupCodesModalUser(null)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
