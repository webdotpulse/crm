import React from 'react'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileSignature,
  FolderKanban,
  Receipt,
  Network,
  Settings,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useApp, ViewType } from '../../context/AppContext'

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setSelectedProjectId,
    companies,
    deals,
    quotations,
    projects,
    invoices,
    peppolLogs,
  } = useApp()

  const activeDealsCount = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length
  const pendingQuotesCount = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length
  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length
  const unpaidInvoicesCount = invoices.filter((i) => i.status !== 'paid').length

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'crm',
      label: 'CRM & Companies',
      icon: <Building2 size={18} />,
      badge: companies.length,
      badgeColor: 'badge-soft-primary',
    },
    {
      id: 'deals',
      label: 'Sales Pipeline',
      icon: <TrendingUp size={18} />,
      badge: activeDealsCount,
      badgeColor: 'badge-soft-warning',
    },
    {
      id: 'quotes',
      label: 'Quotations',
      icon: <FileSignature size={18} />,
      badge: pendingQuotesCount,
      badgeColor: 'badge-soft-purple',
    },
    {
      id: 'projects',
      label: 'Projects & Tasks',
      icon: <FolderKanban size={18} />,
      badge: activeProjectsCount,
      badgeColor: 'badge-soft-info',
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: <Receipt size={18} />,
      badge: unpaidInvoicesCount,
      badgeColor: unpaidInvoicesCount > 0 ? 'badge-soft-danger' : 'badge-soft-success',
    },
    {
      id: 'peppol',
      label: 'Peppol BIS Hub',
      icon: <Network size={18} />,
      badge: 'EN 16931',
      badgeColor: 'badge-soft-success',
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      icon: <Settings size={18} />,
    },
  ]

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'var(--sb-surface)',
        borderRight: '1px solid var(--sb-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--sb-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--sb-primary), #605dba)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(63, 120, 224, 0.3)',
          }}
        >
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontFamily: 'var(--sb-font-heading)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--sb-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              PulseWork
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--sb-body-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All-in-One Work Suite
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id)
                  if (item.id === 'projects') {
                    setSelectedProjectId(null)
                  }
                }}
                className={`btn-sandbox ${isActive ? 'btn-sandbox-primary' : 'btn-sandbox-secondary'}`}
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--sb-radius-sm)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--sb-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--sb-heading)',
                  boxShadow: isActive ? 'var(--sb-shadow-sm)' : 'none',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#fff' : 'var(--sb-primary)' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem' }}>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`badge-soft ${item.badgeColor || 'badge-soft-primary'}`}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.45rem',
                      ...(isActive ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' } : {}),
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Peppol Network Status Card in Bottom */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--sb-border)' }}>
        <div
          className="card-sandbox"
          style={{
            padding: '0.85rem',
            backgroundColor: 'var(--sb-bg)',
            border: '1px solid var(--sb-border)',
            borderRadius: 'var(--sb-radius-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--sb-success)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                Peppol Network
              </span>
            </div>
            <span className="badge-soft badge-soft-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              ONLINE
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--sb-body)', lineHeight: 1.3 }}>
            AS4 Gateway ready. EN 16931 Schematron validation active.
          </p>
        </div>
      </div>
    </aside>
  )
}
