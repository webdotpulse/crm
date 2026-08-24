import React, { useState } from 'react'
import {
  X,
  Settings2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Lock,
  ExternalLink,
  ShieldCheck,
  Activity,
  Send,
  Calendar,
  Calculator,
  Landmark,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CreditCard,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { IntegrationConfig, IntegrationId, IntegrationSettingField } from '../../types'

interface IntegrationModalProps {
  integration: IntegrationConfig
  onClose: () => void
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({ integration, onClose }) => {
  const {
    toggleIntegration,
    updateIntegrationCredentials,
    syncIntegration,
    simulateIntegrationEvent,
  } = useApp()

  const [credentials, setCredentials] = useState<Record<string, any>>({ ...integration.credentials })
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings')

  const handleFieldChange = (key: string, value: any) => {
    setCredentials((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateIntegrationCredentials(integration.id, credentials)
    setSyncFeedback({ success: true, message: 'Settings and credentials saved successfully.' })
    setTimeout(() => setSyncFeedback(null), 3000)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncFeedback(null)
    const res = await syncIntegration(integration.id)
    setIsSyncing(false)
    setSyncFeedback({ success: res.success, message: res.message })
    setTimeout(() => setSyncFeedback(null), 6000)
  }

  const handleSimulateEvent = async () => {
    setIsSyncing(true)
    setSyncFeedback(null)
    const res = await simulateIntegrationEvent(integration.id)
    setIsSyncing(false)
    setSyncFeedback(res)
    setTimeout(() => setSyncFeedback(null), 7000)
  }

  const getIntegrationIcon = (id: IntegrationId) => {
    switch (id) {
      case 'google_calendar':
        return <Calendar size={22} color="#4285F4" />
      case 'octopus':
        return <Calculator size={22} color="#10b981" />
      case 'ponto':
        return <Landmark size={22} color="#3f78e0" />
      case 'solvari':
        return <TrendingUp size={22} color="#f59e0b" />
      case 'exact_online':
        return <FileSpreadsheet size={22} color="#ef4444" />
      case 'yuki':
        return <Building2 size={22} color="#8b5cf6" />
      case 'mollie':
        return <CreditCard size={22} color="#000000" />
      case 'stripe':
        return <ShieldCheck size={22} color="#635bff" />
      default:
        return <Settings2 size={22} />
    }
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
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-bg)',
                border: '1px solid var(--sb-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getIntegrationIcon(integration.id)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  {integration.name}
                </h3>
                {integration.enabled ? (
                  <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>
                    ● Connected
                  </span>
                ) : (
                  <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.68rem' }}>
                    Disabled
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                {integration.tagline}
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: syncFeedback.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${syncFeedback.success ? '#10b981' : '#ef4444'}`,
              borderRadius: '10px',
              color: syncFeedback.success ? '#10b981' : '#ef4444',
              fontWeight: 700,
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {syncFeedback.success ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span>{syncFeedback.message}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--sb-border)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('settings')}
            className={`btn-sandbox ${activeTab === 'settings' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Connection Settings & API Keys
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`btn-sandbox ${activeTab === 'logs' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Live Activity Logs ({integration.logs?.length || 0})
          </button>
        </div>

        {/* TAB 1: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave}>
            {/* Enable/Disable Toggle Banner */}
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--sb-bg)',
                borderRadius: '10px',
                border: '1px solid var(--sb-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>
                  Integration Status
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                  {integration.enabled ? 'Active and processing background webhooks/syncs.' : 'Paused. No data is synchronized.'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleIntegration(integration.id)}
                className={`btn-sandbox ${integration.enabled ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  backgroundColor: integration.enabled ? '#10b981' : undefined,
                  borderColor: integration.enabled ? '#10b981' : undefined,
                }}
              >
                {integration.enabled ? '✓ Enabled' : 'Disabled (Click to Enable)'}
              </button>
            </div>

            {/* Dynamic Setting Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              {integration.settingFields.map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--sb-danger)' }}>*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={credentials[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-sandbox"
                      style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                    />
                  )}

                  {field.type === 'password' && (
                    <input
                      type="password"
                      value={credentials[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-sandbox"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={credentials[field.key] ?? ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--sb-heading)' }}>
                      <input
                        type="checkbox"
                        checked={!!credentials[field.key]}
                        onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      />
                      <span>{field.label}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>

            {/* Test & Simulation Actions */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(63, 120, 224, 0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(63, 120, 224, 0.2)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', marginBottom: '0.5rem' }}>
                ⚡ Test Live Sync & Webhook Handlers
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Test Connection & Sync</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateEvent}
                  disabled={isSyncing}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#8b5cf6',
                    borderColor: '#8b5cf6',
                  }}
                >
                  <Zap size={14} />
                  <span>
                    {integration.id === 'solvari'
                      ? '🚀 Ingest Solvari Lead'
                      : integration.id === 'ponto'
                      ? '⚡ Ingest PSD2 Bank Feed'
                      : integration.id === 'mollie'
                      ? '💳 Simulate Bancontact Payment'
                      : integration.id === 'stripe'
                      ? '💳 Simulate Card Payment'
                      : '⚡ Trigger Live Sync Event'}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.55rem 1.25rem' }}>
                Close
              </button>
              <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.55rem 1.5rem' }}>
                Save Configuration
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ overflow: 'hidden', border: '1px solid var(--sb-border)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--sb-bg)', borderBottom: '1px solid var(--sb-border)' }}>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 700 }}>TIMESTAMP</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 700 }}>TYPE</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 700 }}>STATUS</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.72rem', fontWeight: 700 }}>MESSAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {integration.logs?.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--sb-border)', fontSize: '0.78rem' }}>
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--sb-body)' }}>
                        {log.timestamp.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                        {log.type}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span
                          className={`badge-sandbox badge-soft-${
                            log.status === 'success' ? 'success' : log.status === 'warning' ? 'warning' : 'danger'
                          }`}
                          style={{ fontSize: '0.62rem' }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--sb-heading)' }}>
                        {log.message}
                      </td>
                    </tr>
                  ))}

                  {(!integration.logs || integration.logs.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                        No execution logs yet. Click "Test Connection & Sync" to verify.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={onClose} className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
