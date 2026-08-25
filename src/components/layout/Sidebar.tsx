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
  Plug,
  Wrench,
  ShieldAlert,
  Car,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Users,
  BarChart3,
  Boxes,
  LayoutTemplate,
  Sliders,
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
    setIsThemeCustomizerOpen,
    customTheme,
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
    integrations,
    workOrders,
    mileageTrips,
    purchaseOrders,
    tickets,
    staffCapacities,
    warehouseLocations,
    users,
    isModuleEnabled,
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
          id: 'workorders',
          label: 'Digitale Werkbonnen',
          icon: <Wrench size={17} />,
          badge: workOrders.filter((w) => w.status !== 'invoiced').length,
          badgeType: 'purple',
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
      title: 'DELIVERY & OPERATIONS',
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
        {
          id: 'inventory_multi',
          label: 'Multi-Depot & Vans',
          icon: <Boxes size={17} />,
          badge: warehouseLocations.length,
          badgeType: 'primary',
        },
        {
          id: 'procurement',
          label: 'Bestelbonnen (PO)',
          icon: <Truck size={17} />,
          badge: purchaseOrders.length,
          badgeType: 'primary',
        },
        {
          id: 'mileage',
          label: 'Kilometerregistratie',
          icon: <Car size={17} />,
          badge: `${mileageTrips.reduce((sum, t) => sum + t.distanceKm, 0).toFixed(0)} km`,
          badgeType: 'primary',
        },
      ],
    },
    {
      title: 'PEOPLE & SUPPORT',
      items: [
        {
          id: 'users',
          label: 'User Management',
          icon: <Users size={17} />,
          badge: users.length,
          badgeType: 'primary',
        },
        {
          id: 'helpdesk',
          label: 'PulseDesk Support',
          icon: <Headphones size={17} />,
          badge: tickets.filter((t) => t.status === 'open').length || undefined,
          badgeType: 'warning',
        },
        {
          id: 'hr',
          label: 'PulseHR & Capacity',
          icon: <Users size={17} />,
          badge: staffCapacities.length,
          badgeType: 'purple',
        },
      ],
    },
    {
      title: 'FINANCE & BI',
      items: [
        {
          id: 'invoices',
          label: 'Invoices & Billing',
          icon: <Receipt size={17} />,
          badge: invoices.filter((i) => i.status === 'issued').length || undefined,
          badgeType: 'danger',
        },
        {
          id: 'bi',
          label: 'Executive BI & KPIs',
          icon: <BarChart3 size={17} />,
          badge: 'KPIs',
          badgeType: 'success',
        },
        {
          id: 'dunning',
          label: 'Aanmaningen & Incasso',
          icon: <ShieldAlert size={17} />,
          badge: invoices.filter((i) => i.status === 'issued' || i.status === 'overdue').length || undefined,
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
          id: 'cashflow',
          label: 'AI Cashflow & Prognose',
          icon: <Sparkles size={17} />,
          badge: '90D',
          badgeType: 'purple',
        },
        {
          id: 'accountant',
          label: 'VAT & EU OSS Tax',
          icon: <Calculator size={17} />,
          badge: 'OSS',
          badgeType: 'success',
        },
      ],
    },
    {
      title: 'ADVANCED & SYSTEM',
      items: [
        {
          id: 'pulse_ai',
          label: 'PulseAI & OCR Studio',
          icon: <Sparkles size={17} />,
          badge: 'AI',
          badgeType: 'purple',
        },
        {
          id: 'template_designer',
          label: 'Document Designer',
          icon: <LayoutTemplate size={17} />,
        },
        {
          id: 'integrations',
          label: 'Integrations Hub',
          icon: <Plug size={17} />,
          badge: `${integrations.filter((i) => i.enabled).length}/${integrations.length}`,
          badgeType: 'success',
        },
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
          id: 'security',
          label: 'Security & 2FA Hub',
          icon: <ShieldCheck size={17} />,
          badge: '2FA',
          badgeType: 'success',
        },
        {
          id: 'module_store',
          label: 'Module Hub & Presets',
          icon: <Sliders size={17} />,
          badge: 'Store',
          badgeType: 'primary',
        },
        {
          id: 'settings',
          label: 'Settings & Theme',
          icon: <Settings size={17} />,
        },
      ],
    },
  ]

  const sidebarClass = `sidebar-sandbox ${
    customTheme.sidebarBgMode === 'dark'
      ? 'sidebar-style-dark'
      : customTheme.sidebarBgMode === 'glass'
      ? 'sidebar-style-glass'
      : ''
  }`

  return (
    <aside className={sidebarClass}>
      {/* Brand Header */}
      <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--sb-sidebar-border)' }}>
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
              {customTheme.customBrandName || 'GridCRM'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise CRM Suite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '0.75rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', flex: 1 }}>
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => {
            if (item.id === 'dashboard') return true
            return isModuleEnabled(item.id as any)
          })

          if (visibleItems.length === 0) return null

          return (
            <div key={sIdx}>
              <div className="sidebar-nav-section-title">{section.title}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {visibleItems.map((item) => {
                  const isActive = currentView === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          className="sidebar-icon"
                          style={{
                            color: isActive ? 'var(--sb-primary)' : 'var(--sb-body)',
                            display: 'flex',
                          }}
                        >
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
          )
        })}
      </nav>

      {/* Bottom Status & Theme Shortcut */}
      <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {/* Peppol Network Status */}
        <div
          style={{
            padding: '0.75rem 0.85rem',
            backgroundColor: 'var(--sb-surface, #ffffff)',
            borderRadius: 'var(--sb-radius-sm)',
            border: '1px solid var(--sb-sidebar-border)',
            boxShadow: 'var(--sb-shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="var(--sb-success)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-heading)' }}>Peppol Gateway</span>
            </div>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.6rem', padding: '0.08rem 0.3rem' }}>
              ONLINE
            </span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--sb-body)' }}>AS4 & EN 16931 Active</div>
        </div>

        {/* Quick Customize Styling Trigger */}
        <button
          onClick={() => setIsThemeCustomizerOpen(true)}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '0.45rem',
            border: '1px dashed var(--sb-border)',
            borderRadius: 'var(--sb-radius-sm)',
            color: 'var(--sb-primary)',
            gap: '0.4rem',
          }}
        >
          <Palette size={13} />
          <span>Customize CRM Styling</span>
        </button>
      </div>
    </aside>
  )
}
