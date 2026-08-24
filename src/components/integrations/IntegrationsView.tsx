import React, { useState } from 'react'
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Settings2,
  ExternalLink,
  Calendar,
  Calculator,
  Landmark,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  CreditCard,
  ShieldCheck,
  Search,
  Filter,
  Check,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { IntegrationConfig, IntegrationCategory, IntegrationId } from '../../types'
import { IntegrationModal } from './IntegrationModal'

export const IntegrationsView: React.FC = () => {
  const {
    integrations,
    toggleIntegration,
    syncIntegration,
    simulateIntegrationEvent,
  } = useApp()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedIntegrationForModal, setSelectedIntegrationForModal] = useState<IntegrationConfig | null>(null)
  const [globalSyncMsg, setGlobalSyncMsg] = useState<string | null>(null)
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false)

  const filteredIntegrations = integrations.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      )
    }
    return true
  })

  const connectedCount = integrations.filter((i) => i.enabled).length

  const handleSyncAll = async () => {
    setIsSyncingAll(true)
    setGlobalSyncMsg('⚡ Synchronizing all active connectors (Google Calendar, Octopus, Ponto, Solvari, Mollie, Exact Online)...')
    
    let totalItems = 0
    for (const item of integrations.filter((i) => i.enabled)) {
      const res = await syncIntegration(item.id)
      totalItems += res.itemsSynced || 0
    }

    setIsSyncingAll(false)
    setGlobalSyncMsg(`🎉 All ${connectedCount} active integrations synchronized successfully! (${totalItems} items processed)`)
    setTimeout(() => setGlobalSyncMsg(null), 6000)
  }

  const getIntegrationIcon = (id: IntegrationId) => {
    switch (id) {
      case 'google_calendar':
        return <Calendar size={24} color="#4285F4" />
      case 'octopus':
        return <Calculator size={24} color="#10b981" />
      case 'ponto':
        return <Landmark size={24} color="#3f78e0" />
      case 'solvari':
        return <TrendingUp size={24} color="#f59e0b" />
      case 'exact_online':
        return <FileSpreadsheet size={24} color="#ef4444" />
      case 'yuki':
        return <Building2 size={24} color="#8b5cf6" />
      case 'mollie':
        return <CreditCard size={24} color="#000000" />
      case 'stripe':
        return <ShieldCheck size={24} color="#635bff" />
      default:
        return <Plug size={24} />
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
              INTEGRATIONS HUB
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{connectedCount} of {integrations.length} services connected</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Integrations & Connectors Marketplace
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Seamlessly connect your accounting, bank reconciliation, lead generation, and online payments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="btn-sandbox btn-sandbox-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#3f78e0',
              borderColor: '#3f78e0',
            }}
          >
            <RefreshCw size={16} className={isSyncingAll ? 'animate-spin' : ''} />
            <span>⚡ Sync All Active</span>
          </button>
        </div>
      </div>

      {/* Global Sync Notification */}
      {globalSyncMsg && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(63, 120, 224, 0.1)',
            border: '1px solid #3f78e0',
            borderRadius: '12px',
            color: '#3f78e0',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{globalSyncMsg}</span>
        </div>
      )}

      {/* KPI Metrics */}
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
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Connected Connectors</span>
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
              <Plug size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {connectedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sb-body)' }}>/ {integrations.length} Active</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Real-time two-way synchronization enabled
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Open Banking & PSD2</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>PONTO LIVE</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            Sub-Minute Feed
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Direct OGM matching with Belgian banks
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Accountant Sync Ready</span>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>PCMN & UBL</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            Octopus, Exact & Yuki
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Automated journal and invoice delivery
          </div>
        </div>
      </div>

      {/* Filter Category Bar */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`btn-sandbox ${selectedCategory === 'all' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            All Integrations ({integrations.length})
          </button>
          <button
            onClick={() => setSelectedCategory('accounting')}
            className={`btn-sandbox ${selectedCategory === 'accounting' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            📊 Accounting (Octopus, Exact, Yuki)
          </button>
          <button
            onClick={() => setSelectedCategory('banking')}
            className={`btn-sandbox ${selectedCategory === 'banking' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            🏦 Banking (Ponto PSD2)
          </button>
          <button
            onClick={() => setSelectedCategory('leads')}
            className={`btn-sandbox ${selectedCategory === 'leads' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            🚀 Contractor Leads (Solvari)
          </button>
          <button
            onClick={() => setSelectedCategory('payments')}
            className={`btn-sandbox ${selectedCategory === 'payments' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            💳 Online Payments (Mollie, Stripe)
          </button>
          <button
            onClick={() => setSelectedCategory('calendar')}
            className={`btn-sandbox ${selectedCategory === 'calendar' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            📅 Calendar (Google)
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Integrations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {filteredIntegrations.map((item) => (
          <div
            key={item.id}
            className="card-sandbox"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: item.enabled ? '1px solid var(--sb-border)' : '1px dashed var(--sb-border)',
              opacity: item.enabled ? 1 : 0.85,
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              {/* Card Top: Icon, Badge, Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--sb-bg)',
                      border: '1px solid var(--sb-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getIntegrationIcon(item.id)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      {item.name}
                    </h3>
                    {item.badge && (
                      <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enable / Disable Switch */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '44px',
                      height: '24px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => toggleIntegration(item.id)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: item.enabled ? '#10b981' : 'var(--sb-border)',
                        borderRadius: '24px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: item.enabled ? '22px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: item.enabled ? '#10b981' : 'var(--sb-body)' }}>
                    {item.enabled ? 'Connected' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Tagline & Description */}
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)', marginBottom: '0.4rem' }}>
                {item.tagline}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                {item.description}
              </p>

              {/* Feature bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                {item.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--sb-heading)' }}>
                    <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
                  {item.lastSyncAt ? `Last Sync: ${item.lastSyncAt.slice(11, 16)}` : 'Never synced'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--sb-primary)', fontWeight: 600 }}>
                  {item.syncCount || 0} operations logged
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedIntegrationForModal(item)}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Settings2 size={14} />
                  <span>Configure</span>
                </button>

                {item.enabled && (
                  <button
                    onClick={() => simulateIntegrationEvent(item.id)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Simulate Event"
                  >
                    <Zap size={14} />
                    <span>Live Test</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedIntegrationForModal && (
        <IntegrationModal
          integration={selectedIntegrationForModal}
          onClose={() => setSelectedIntegrationForModal(null)}
        />
      )}
    </div>
  )
}
