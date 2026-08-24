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
  Landmark,
  RefreshCw,
  Globe,
  Code2,
  Calculator,
  PenTool,
} from 'lucide-react'
import { useApp, AppView } from '../../context/AppContext'

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  id: AppView
  label: string
  icon: React.ReactNode
  badge?: string | number
  badgeType?: 'primary' | 'success' | 'warning' | 'purple' | 'danger'
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    companies,
    individuals,
    deals,
    quotations,
    contracts,
    subscriptions,
    projects,
    invoices,
    expenses,
    bankTransactions,
    products,
    events,
  } = useApp()

  const navSections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={17} />,
        },
        {
          id: 'crm',
          label: 'CRM & Clients',
          icon: <Building2 size={17} />,
          badge: companies.length + individuals.length,
          badgeType: 'primary',
        },
        {
          id: 'calendar',
          label: 'Calendar & Planner',
          icon: <CalendarIcon size={17} />,
          badge: events.length,
          badgeType: 'purple',
        },
      ],
    },
    {
      title: 'SALES & CONTRACTS',
      items: [
        {
          id: 'deals',
          label: 'Sales Pipeline',
          icon: <TrendingUp size={17} />,
          badge: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
          badgeType: 'warning',
        },
        {
          id: 'quotes',
          label: 'Quotations',
          icon: <FileText size={17} />,
          badge: quotations.filter((q) => q.status === 'sent').length || undefined,
          badgeType: 'primary',
        },
        {
          id: 'contracts',
          label: 'Contracts & SLAs',
          icon: <PenTool size={17} />,
          badge: contracts.length,
          badgeType: 'success',
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions & MRR',
          icon: <RefreshCw size={17} />,
          badge: subscriptions.filter((s) => s.status === 'active').length,
          badgeType: 'purple',
        },
      ],
    },
    {
      title: 'DELIVERY & STOCK',
      items: [
        {
          id: 'projects',
          label: 'Projects & Tasks',
          icon: <FolderKanban size={17} />,
          badge: projects.filter((p) => p.status === 'in_progress').length,
          badgeType: 'primary',
        },
        {
          id: 'products',
          label: 'Products & Stock',
          icon: <Package size={17} />,
          badge: products.length,
          badgeType: 'primary',
        },
      ],
    },
    {
      title: 'FINANCE & BANKING',
      items: [
        {
          id: 'invoices',
          label: 'Invoices & Billing',
          icon: <Receipt size={17} />,
          badge: invoices.filter((i) => i.status === 'issued').length || undefined,
          badgeType: 'danger',
        },
        {
          id: 'expenses',
          label: 'Expenses (P&L)',
          icon: <Receipt size={17} />,
          badge: expenses.filter((e) => e.status === 'pending').length || undefined,
          badgeType: 'warning',
        },
        {
          id: 'banking',
          label: 'Bank Reconciliation',
          icon: <Landmark size={17} />,
          badge: bankTransactions.filter((t) => !t.reconciled).length || undefined,
          badgeType: 'warning',
        },
        {
          id: 'accountant',
          label: 'Belgian VAT & Tax',
          icon: <Calculator size={17} />,
          badge: 'Q3',
          badgeType: 'success',
        },
      ],
    },
    {
      title: 'INTEGRATIONS & PORTAL',
      items: [
        {
          id: 'peppol',
          label: 'Peppol BIS Hub',
          icon: <FileCode2 size={17} />,
          badge: 'EN 16931',
          badgeType: 'success',
        },
        {
          id: 'portal',
          label: 'Client Extranet',
          icon: <Globe size={17} />,
        },
        {
          id: 'developers',
          label: 'REST API & Webhooks',
          icon: <Code2 size={17} />,
        },
        {
          id: 'settings',
          label: 'Settings & Entities',
          icon: <Settings size={17} />,
        },
      ],
    },
  ]

  return (
    <aside
      className="sidebar-sandbox"
      style={{
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--sb-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--sb-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--sb-shadow-sm)',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.12rem', color: 'var(--sb-heading)', letterSpacing: '-0.02em' }}>
              PulseWork
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise SMB Suite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '0.75rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div
              style={{
                fontSize: '0.66rem',
                fontWeight: 800,
                color: 'var(--sb-body)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0 0.65rem 0.35rem',
                opacity: 0.8,
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {section.items.map((item) => {
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
                      padding: '0.52rem 0.65rem',
                      borderRadius: 'var(--sb-radius)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--sb-primary-soft)' : 'transparent',
                      color: isActive ? 'var(--sb-primary)' : 'var(--sb-heading)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ color: isActive ? 'var(--sb-primary)' : 'var(--sb-body)', display: 'flex' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`badge-sandbox badge-soft-${item.badgeType || 'primary'}`}
                        style={{ fontSize: '0.65rem', padding: '0.12rem 0.4rem' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Peppol Network Status */}
      <div style={{ padding: '0.85rem 1rem', margin: '0.5rem', backgroundColor: 'var(--sb-card-bg)', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={15} color="var(--sb-success)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>Peppol Gateway</span>
          </div>
          <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
            ONLINE
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>AS4 & EN 16931 Active</div>
      </div>
    </aside>
  )
}
