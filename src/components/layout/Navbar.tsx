import React, { useState } from 'react'
import {
  Search,
  Plus,
  Play,
  Square,
  Moon,
  Sun,
  ShieldCheck,
  Building2,
  ChevronDown,
  User,
  Package,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface NavbarProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickModal }) => {
  const {
    theme,
    toggleTheme,
    activeTimer,
    stopTimer,
    projects,
    legalEntities,
    activeLegalEntityId,
    setActiveLegalEntityId,
    activeLegalEntity,
  } = useApp()

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false)
  const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false)

  const activeProject = projects.find((p) => p.id === activeTimer.projectId)

  // Format stopwatch seconds -> HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <header className="navbar-sandbox">
      {/* Search Input */}
      <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sb-body)',
          }}
        />
        <input
          type="text"
          placeholder="Search companies, clients, quotes, projects..."
          className="form-input-sandbox"
          style={{
            paddingLeft: '2.4rem',
            backgroundColor: 'var(--sb-bg)',
            borderColor: 'transparent',
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Currency Switcher */}
        <select
          value={useApp().selectedCurrency}
          onChange={(e) => useApp().setSelectedCurrency(e.target.value as any)}
          className="input-sandbox"
          style={{
            padding: '0.4rem 0.6rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            backgroundColor: 'var(--sb-card-bg)',
            color: 'var(--sb-heading)',
          }}
          title="Display Currency"
        >
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
          <option value="CHF">CHF</option>
        </select>

        {/* Multi-Entity Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsEntityMenuOpen(!isEntityMenuOpen)}
            className="btn-sandbox btn-sandbox-ghost"
            style={{
              padding: '0.4rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--sb-border)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <Building2 size={16} color="var(--sb-primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{activeLegalEntity.name}</span>
            <ChevronDown size={14} color="var(--sb-body)" />
          </button>

          {isEntityMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--sb-card-bg)',
                borderRadius: 'var(--sb-radius)',
                boxShadow: 'var(--sb-shadow-lg)',
                border: '1px solid var(--sb-border)',
                padding: '0.5rem',
                zIndex: 1000,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sb-body)', padding: '0.35rem 0.6rem' }}>
                SWITCH ISSUING ENTITY
              </div>
              {legalEntities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => {
                    setActiveLegalEntityId(entity.id)
                    setIsEntityMenuOpen(false)
                  }}
                  className="btn-sandbox btn-sandbox-ghost"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '0.5rem 0.6rem',
                    fontSize: '0.82rem',
                    fontWeight: entity.id === activeLegalEntityId ? 700 : 500,
                    color: entity.id === activeLegalEntityId ? 'var(--sb-primary)' : 'var(--sb-heading)',
                    backgroundColor: entity.id === activeLegalEntityId ? 'var(--sb-primary-soft)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span>{entity.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
                      VAT: {entity.vatNumber} ({entity.countryCode})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Live Stopwatch Widget */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: activeTimer.isRunning ? 'var(--sb-primary-soft)' : 'var(--sb-border)',
            border: activeTimer.isRunning ? '1px solid var(--sb-primary)' : '1px solid transparent',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: activeTimer.isRunning ? '#e2626b' : 'var(--sb-body)',
              animation: activeTimer.isRunning ? 'pulse 1.2s infinite' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--sb-font-mono)',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: activeTimer.isRunning ? 'var(--sb-primary)' : 'var(--sb-heading)',
            }}
          >
            {formatTimer(activeTimer.elapsedSeconds)}
          </span>

          {activeTimer.isRunning && (
            <button
              onClick={stopTimer}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ padding: '0.2rem', color: '#e2626b' }}
              title="Stop & Log Time"
            >
              <Square size={14} fill="#e2626b" />
            </button>
          )}
        </div>

        {/* Quick Action Button (+ New) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ padding: '0.45rem 1rem' }}
          >
            <Plus size={16} />
            <span>New</span>
            <ChevronDown size={14} style={{ marginLeft: '0.2rem' }} />
          </button>

          {isQuickMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '210px',
                backgroundColor: 'var(--sb-card-bg)',
                borderRadius: 'var(--sb-radius)',
                boxShadow: 'var(--sb-shadow-lg)',
                border: '1px solid var(--sb-border)',
                padding: '0.5rem',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => {
                  onOpenQuickModal('quote')
                  setIsQuickMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }}
              >
                📝 Quotation Proposal
              </button>
              <button
                onClick={() => {
                  onOpenQuickModal('invoice')
                  setIsQuickMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }}
              >
                🧾 Commercial Invoice
              </button>
              <button
                onClick={() => {
                  onOpenQuickModal('project')
                  setIsQuickMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }}
              >
                🚀 Project & Milestone
              </button>
              <button
                onClick={() => {
                  onOpenQuickModal('deal')
                  setIsQuickMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }}
              >
                💼 Sales Opportunity
              </button>
              <button
                onClick={() => {
                  onOpenQuickModal('company')
                  setIsQuickMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }}
              >
                🏢 Client / Company
              </button>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="btn-sandbox btn-sandbox-ghost"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User Identity Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            PW
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
              {activeLegalEntity.name.split(' ')[0]} User
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
              Peppol: {activeLegalEntity.peppolEndpoint}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
