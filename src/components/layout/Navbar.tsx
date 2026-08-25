import React, { useState, useEffect } from 'react'
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
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Shield,
  Smartphone,
  Check,
  Sliders,
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
    currentUser,
    users,
    switchUser,
    lockScreen,
    isPrivacyModeActive,
    togglePrivacyMode,
    setCurrentView,
    setTwoFactorSetupModalUser,
  } = useApp()

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false)
  const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Keyboard shortcut listener for ⌘L (Lock Screen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        lockScreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lockScreen])

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
        {/* Language Selector (NL / FR / EN / DE / ES) */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.42rem 0.6rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            cursor: 'pointer',
            backgroundColor: 'var(--sb-surface)',
            color: 'var(--sb-heading)',
          }}
          title="Change System Language"
        >
          <option value="nl">🇳🇱 NL</option>
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
          <option value="de">🇩🇪 DE</option>
          <option value="es">🇪🇸 ES</option>
        </select>

        {/* Multi-Entity Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsEntityMenuOpen(!isEntityMenuOpen)}
            className="btn-sandbox btn-sandbox-ghost"
            style={{
              padding: '0.42rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              border: '1px solid var(--sb-border)',
              borderRadius: 'var(--sb-radius)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--sb-heading)',
            }}
          >
            <Building2 size={15} color={activeLegalEntity.accentColor || 'var(--sb-primary)'} />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeLegalEntity.name}
            </span>
            <ChevronDown size={14} />
          </button>

          {isEntityMenuOpen && (
            <div
              className="card-sandbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                right: 0,
                width: '240px',
                zIndex: 1000,
                backgroundColor: 'var(--sb-surface)',
                boxShadow: 'var(--sb-shadow-lg)',
                padding: '0.5rem',
              }}
            >
              <div
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--sb-body)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Switch Legal Entity
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
                    fontSize: '0.8rem',
                    fontWeight: entity.id === activeLegalEntityId ? 700 : 500,
                    color: entity.id === activeLegalEntityId ? 'var(--sb-primary)' : 'var(--sb-heading)',
                    backgroundColor:
                      entity.id === activeLegalEntityId ? 'var(--sb-primary-soft)' : 'transparent',
                  }}
                >
                  <Building2 size={14} style={{ marginRight: '0.5rem' }} />
                  {entity.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency Switcher Dropdown */}
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as any)}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.42rem 0.6rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius)',
            cursor: 'pointer',
            backgroundColor: 'var(--sb-surface)',
            color: 'var(--sb-heading)',
          }}
        >
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
          <option value="CHF">CHF</option>
        </select>

        {/* Active Timer Indicator */}
        {activeTimer.isRunning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(226, 98, 107, 0.1)',
              border: '1px solid rgba(226, 98, 107, 0.25)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--sb-radius)',
              animation: 'pulse 2s infinite',
            }}
          >
            <Clock size={15} color="var(--sb-danger)" />
            <span
              style={{
                fontFamily: 'var(--sb-font-mono)',
                fontWeight: 700,
                color: 'var(--sb-danger)',
                fontSize: '0.84rem',
              }}
            >
              {formatTimer(activeTimer.elapsedSeconds)}
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                color: 'var(--sb-body)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeProject?.title || 'Project Timer'}
            </span>
            <button
              onClick={stopTimer}
              className="btn-sandbox btn-sandbox-ghost"
              style={{
                padding: '0.2rem',
                color: 'var(--sb-danger)',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Stop and Save Time Log"
            >
              <Square size={13} />
            </button>
          </div>
        )}

        {/* Global Quick Action Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ padding: '0.45rem 0.85rem', gap: '0.35rem', fontWeight: 700 }}
          >
            <Plus size={16} /> Create New <ChevronDown size={14} />
          </button>

          {isQuickMenuOpen && (
            <div
              className="card-sandbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 5px)',
                right: 0,
                width: '210px',
                zIndex: 1000,
                backgroundColor: 'var(--sb-surface)',
                boxShadow: 'var(--sb-shadow-lg)',
                padding: '0.5rem',
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

        {/* Privacy Screen-Share Toggle */}
        <button
          onClick={togglePrivacyMode}
          className={`btn-sandbox btn-sandbox-ghost ${isPrivacyModeActive ? 'active' : ''}`}
          style={{
            padding: '0.45rem',
            borderRadius: '50%',
            color: isPrivacyModeActive ? 'var(--sb-warning)' : 'var(--sb-body)',
          }}
          title={isPrivacyModeActive ? 'Privacy Mode Active (Amounts Blurred) - Click to Disable' : 'Enable Privacy Screen-Share Mode'}
        >
          {isPrivacyModeActive ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>

        {/* Instant Screen Lock Button */}
        <button
          onClick={lockScreen}
          className="btn-sandbox btn-sandbox-ghost"
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title="Lock Screen (⌘L)"
        >
          <Lock size={17} />
        </button>

        {/* Module Store / Presets Hub Shortcut */}
        <button
          onClick={() => setCurrentView('module_store')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title="Module Hub & Industry Presets"
        >
          <Sliders size={17} />
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="btn-sandbox btn-sandbox-ghost"
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* User Identity Profile Menu */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              paddingLeft: '0.35rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
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
                boxShadow: 'var(--sb-shadow-xs)',
              }}
            >
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', lineHeight: 1.15 }}>
                {currentUser.name.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.68rem', color: currentUser.twoFactorEnabled ? 'var(--sb-success)' : 'var(--sb-body)', lineHeight: 1.15, fontWeight: 600 }}>
                {currentUser.twoFactorEnabled ? '● 2FA Active' : currentUser.role}
              </span>
            </div>
            <ChevronDown size={13} color="var(--sb-body)" />
          </div>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div
              className="card-sandbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '260px',
                zIndex: 2000,
                backgroundColor: 'var(--sb-surface)',
                boxShadow: 'var(--sb-shadow-lg)',
                padding: '0.75rem',
                border: '1px solid var(--sb-border)',
              }}
            >
              {/* Account info header */}
              <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--sb-border)', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{currentUser.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--sb-primary-soft)',
                      color: 'var(--sb-primary-text)',
                    }}
                  >
                    {currentUser.roleLabel}
                  </span>
                  {currentUser.twoFactorEnabled && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(56, 185, 149, 0.15)',
                        color: 'var(--sb-success-text)',
                      }}
                    >
                      ✓ 2FA
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Actions */}
              <button
                onClick={() => {
                  setCurrentView('security')
                  setIsUserMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', gap: '0.5rem', fontSize: '0.82rem' }}
              >
                <ShieldCheck size={16} color="var(--sb-success)" />
                <strong>Security & 2FA Hub</strong>
              </button>

              <button
                onClick={() => {
                  lockScreen()
                  setIsUserMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', gap: '0.5rem', fontSize: '0.82rem' }}
              >
                <Lock size={15} /> Lock Screen (⌘L)
              </button>

              <button
                onClick={() => {
                  setCurrentView('settings')
                  setIsUserMenuOpen(false)
                }}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.6rem', gap: '0.5rem', fontSize: '0.82rem' }}
              >
                <Palette size={15} /> Settings & Themes
              </button>

              {/* Switch User Submenu */}
              <div style={{ borderTop: '1px solid var(--sb-border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--sb-body)', padding: '0.2rem 0.5rem', textTransform: 'uppercase' }}>
                  Switch Team Profile:
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id)
                      setIsUserMenuOpen(false)
                    }}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.78rem',
                      fontWeight: u.id === currentUser.id ? 700 : 500,
                      color: u.id === currentUser.id ? 'var(--sb-primary)' : 'var(--sb-heading)',
                    }}
                  >
                    <span>{u.name}</span>
                    {u.id === currentUser.id && <Check size={14} color="var(--sb-primary)" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
