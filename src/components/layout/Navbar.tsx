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
  Palette,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
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
    selectedCurrency,
    setSelectedCurrency,
    language,
    setLanguage,
    setIsSpotlightOpen,
    setIsThemeCustomizerOpen,
    customTheme,
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
      {/* Upgraded Search Input with Spotlight Trigger */}
      <div
        className="search-container-sandbox"
        id="global-search-container"
        onClick={() => setIsSpotlightOpen(true)}
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--sb-body)',
            pointerEvents: 'none',
          }}
        />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search clients, deals, quotes, invoices..."
          className="search-input-sandbox"
          readOnly
          onClick={(e) => {
            e.stopPropagation()
            setIsSpotlightOpen(true)
          }}
          style={{ cursor: 'pointer' }}
        />
        <span className="search-kbd-badge">⌘K</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Quick Theme Customizer Palette Trigger */}
        <button
          id="btn-theme-customizer"
          onClick={() => setIsThemeCustomizerOpen(true)}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.42rem 0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            color: 'var(--sb-primary)',
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
          title="Customize CRM Theme & Colors"
        >
          <Palette size={15} />
          <span style={{ display: 'inline' }}>Theme</span>
        </button>

        {/* Language Selector (NL / FR / EN / DE) */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{
            padding: '0.42rem 0.55rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            backgroundColor: 'var(--sb-card-bg, #ffffff)',
            color: 'var(--sb-heading)',
            cursor: 'pointer',
          }}
          title="Interface Language"
        >
          <option value="nl">🇳🇱 NL</option>
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
          <option value="de">🇩🇪 DE</option>
        </select>

        {/* Currency Switcher */}
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as any)}
          className="input-sandbox"
          style={{
            padding: '0.42rem 0.55rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            backgroundColor: 'var(--sb-card-bg, #ffffff)',
            color: 'var(--sb-heading)',
            cursor: 'pointer',
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
              padding: '0.42rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--sb-border)',
              borderRadius: 'var(--sb-radius)',
            }}
          >
            <Building2 size={15} color="var(--sb-primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{activeLegalEntity.name}</span>
            <ChevronDown size={13} color="var(--sb-body)" />
          </button>

          {isEntityMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--sb-surface, #ffffff)',
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
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: activeTimer.isRunning ? 'var(--sb-primary-soft)' : 'var(--sb-bg)',
            border: activeTimer.isRunning ? '1px solid var(--sb-primary)' : '1px solid var(--sb-border)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: activeTimer.isRunning ? '#e2626b' : 'var(--sb-body-subtle)',
              animation: activeTimer.isRunning ? 'pulseAnim 1.4s infinite' : 'none',
            }}
          />
          <Clock size={13} style={{ color: activeTimer.isRunning ? 'var(--sb-primary)' : 'var(--sb-body)' }} />
          <span
            style={{
              fontFamily: 'var(--sb-font-mono)',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: activeTimer.isRunning ? 'var(--sb-primary)' : 'var(--sb-heading)',
            }}
          >
            {formatTimer(activeTimer.elapsedSeconds)}
          </span>

          {activeTimer.isRunning && (
            <button
              onClick={stopTimer}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ padding: '0.15rem', color: '#e2626b' }}
              title="Stop & Log Time"
            >
              <Square size={12} fill="#e2626b" />
            </button>
          )}
        </div>

        {/* Quick Action Button (+ New) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ padding: '0.42rem 0.9rem', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>New</span>
            <ChevronDown size={13} style={{ marginLeft: '0.15rem' }} />
          </button>

          {isQuickMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--sb-surface, #ffffff)',
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
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* User Identity Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', paddingLeft: '0.35rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
            }}
          >
            PW
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', lineHeight: 1.15 }}>
              {activeLegalEntity.name.split(' ')[0]} User
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--sb-body)', lineHeight: 1.15 }}>
              Peppol: {activeLegalEntity.peppolEndpoint}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
