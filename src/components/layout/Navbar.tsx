import React, { useState } from 'react'
import {
  Search,
  Moon,
  Sun,
  Plus,
  Play,
  Pause,
  Square,
  Clock,
  Briefcase,
  FileText,
  DollarSign,
  Building,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface NavbarProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickModal }) => {
  const {
    theme,
    toggleTheme,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopAndSaveTimer,
    projects,
    companyProfile,
  } = useApp()

  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [showTimerDropdown, setShowTimerDropdown] = useState(false)

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const activeProject = projects.find((p) => p.id === activeTimer.projectId)

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--sb-border)',
        backgroundColor: 'var(--sb-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '420px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--sb-body-subtle)',
            }}
          />
          <input
            type="text"
            placeholder="Search companies, deals, projects, invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input-sandbox"
            style={{
              paddingLeft: '38px',
              borderRadius: 'var(--sb-radius-pill)',
              backgroundColor: 'var(--sb-bg)',
              border: '1px solid var(--sb-border)',
              height: '38px',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--sb-body-subtle)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Timer + Quick Actions + Theme + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Floating Timer Widget */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeTimer.isRunning ? 'var(--sb-primary-soft)' : 'var(--sb-bg)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--sb-radius-pill)',
            border: `1px solid ${activeTimer.isRunning ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              className={activeTimer.isRunning ? 'pulse-indicator' : ''}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeTimer.isRunning ? 'var(--sb-success)' : 'var(--sb-body-subtle)',
                display: 'inline-block',
              }}
            />
            <Clock size={15} style={{ color: activeTimer.isRunning ? 'var(--sb-primary)' : 'var(--sb-body)' }} />
            <span
              style={{
                fontFamily: 'var(--sb-font-mono)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: activeTimer.isRunning ? 'var(--sb-primary-text)' : 'var(--sb-heading)',
              }}
            >
              {formatTimer(activeTimer.seconds)}
            </span>
          </div>

          {activeProject && (
            <span
              style={{
                fontSize: '0.75rem',
                maxWidth: '110px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'var(--sb-body)',
                fontWeight: 500,
              }}
            >
              • {activeProject.title}
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {activeTimer.isRunning ? (
              <button
                onClick={pauseTimer}
                className="btn-sandbox btn-icon btn-sandbox-soft-primary"
                style={{ width: '26px', height: '26px', padding: 0, borderRadius: '50%' }}
                title="Pause Timer"
              >
                <Pause size={13} />
              </button>
            ) : activeTimer.seconds > 0 ? (
              <button
                onClick={resumeTimer}
                className="btn-sandbox btn-icon btn-sandbox-primary"
                style={{ width: '26px', height: '26px', padding: 0, borderRadius: '50%' }}
                title="Resume Timer"
              >
                <Play size={13} />
              </button>
            ) : (
              <button
                onClick={() => {
                  const defaultProj = projects[0]?.id
                  startTimer(defaultProj, undefined, 'Work Session')
                }}
                className="btn-sandbox btn-icon btn-sandbox-soft-primary"
                style={{ width: '26px', height: '26px', padding: 0, borderRadius: '50%' }}
                title="Start Timer"
              >
                <Play size={13} />
              </button>
            )}

            {activeTimer.seconds > 0 && (
              <button
                onClick={stopAndSaveTimer}
                className="btn-sandbox btn-icon btn-sandbox-success"
                style={{ width: '26px', height: '26px', padding: 0, borderRadius: '50%' }}
                title="Save Logged Time"
              >
                <Square size={12} fill="currentColor" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ borderRadius: 'var(--sb-radius-pill)', gap: '0.4rem', padding: '0.45rem 1rem' }}
          >
            <Plus size={16} />
            <span>New</span>
            <ChevronDown size={14} />
          </button>

          {showQuickMenu && (
            <div
              className="card-sandbox"
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '210px',
                padding: '0.5rem',
                zIndex: 100,
                boxShadow: 'var(--sb-shadow-lg)',
              }}
              onMouseLeave={() => setShowQuickMenu(false)}
            >
              <button
                onClick={() => {
                  setShowQuickMenu(false)
                  onOpenQuickModal('deal')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
              >
                <Briefcase size={15} color="var(--sb-primary)" />
                <span>New Deal</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false)
                  onOpenQuickModal('quote')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
              >
                <FileText size={15} color="var(--sb-secondary)" />
                <span>New Quotation</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false)
                  onOpenQuickModal('invoice')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
              >
                <DollarSign size={15} color="var(--sb-success)" />
                <span>New Invoice</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false)
                  onOpenQuickModal('company')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', padding: '0.5rem 0.75rem' }}
              >
                <Building size={15} color="var(--sb-warning)" />
                <span>New Company</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-sandbox btn-icon btn-sandbox-secondary"
          style={{ borderRadius: '50%' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* User / Org Avatar */}
        <div
          onClick={() => setCurrentView('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--sb-radius-pill)',
            cursor: 'pointer',
            backgroundColor: 'var(--sb-bg)',
            border: '1px solid var(--sb-border)',
          }}
          title="Manage Company Profile & Peppol Settings"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--sb-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            PW
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', lineHeight: 1.1 }}>
              {companyProfile.name.slice(0, 14)}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--sb-body-subtle)', lineHeight: 1.1 }}>
              Peppol: {companyProfile.peppolEndpoint}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
