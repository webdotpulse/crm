import React from 'react'
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  FileText,
  FolderKanban,
  Receipt,
  FileCode2,
  Settings,
  ShieldCheck,
  Calendar as CalendarIcon,
  Package,
} from 'lucide-react'
import { useApp, AppView } from '../../context/AppContext'

interface NavItem {
  id: AppView
  label: string
  icon: React.ReactNode
  badge?: string | number
  badgeType?: 'primary' | 'success' | 'warning' | 'purple'
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    companies,
    individuals,
    deals,
    quotations,
    projects,
    invoices,
    products,
    events,
  } = useApp()

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'crm',
      label: 'CRM & Clients',
      icon: <Building2 size={18} />,
      badge: companies.length + individuals.length,
      badgeType: 'primary',
    },
    {
      id: 'calendar',
      label: 'Calendar & Planner',
      icon: <CalendarIcon size={18} />,
      badge: events.length,
      badgeType: 'purple',
    },
    {
      id: 'deals',
      label: 'Sales Pipeline',
      icon: <TrendingUp size={18} />,
      badge: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
      badgeType: 'warning',
    },
    {
      id: 'quotes',
      label: 'Quotations',
      icon: <FileText size={18} />,
      badge: quotations.filter((q) => q.status === 'sent').length || undefined,
      badgeType: 'primary',
    },
    {
      id: 'projects',
      label: 'Projects & Tasks',
      icon: <FolderKanban size={18} />,
      badge: projects.filter((p) => p.status === 'in_progress').length,
      badgeType: 'primary',
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: <Package size={18} />,
      badge: products.length,
      badgeType: 'primary',
    },
    {
      id: 'invoices',
      label: 'Invoices & Billing',
      icon: <Receipt size={18} />,
      badge: invoices.filter((i) => i.status === 'issued').length || undefined,
      badgeType: 'danger' as any,
    },
    {
      id: 'peppol',
      label: 'Peppol BIS Hub',
      icon: <FileCode2 size={18} />,
      badge: 'EN 16931',
      badgeType: 'success',
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      icon: <Settings size={18} />,
    },
  ]

  return (
    <aside className="sidebar-sandbox">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--sb-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--sb-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--sb-shadow-sm)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sb-heading)', letterSpacing: '-0.02em' }}>
              PulseWork
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All-in-One Work Suite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--sb-radius)',
                border: 'none',
                backgroundColor: isActive ? 'var(--sb-primary-soft)' : 'transparent',
                color: isActive ? 'var(--sb-primary)' : 'var(--sb-heading)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: isActive ? 'var(--sb-primary)' : 'var(--sb-body)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`badge-sandbox badge-soft-${item.badgeType || 'primary'}`}
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Network & Peppol Status Widget */}
      <div style={{ padding: '1rem', margin: '0.75rem', backgroundColor: 'var(--sb-card-bg)', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--sb-success)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)' }}>Peppol Network</span>
          </div>
          <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>ONLINE</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--sb-body)', margin: 0, lineHeight: 1.4 }}>
          AS4 Gateway ready. EN 16931 Schematron validation active.
        </p>
      </div>
    </aside>
  )
}
