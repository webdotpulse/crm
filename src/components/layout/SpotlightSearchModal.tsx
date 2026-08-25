import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Building2,
  TrendingUp,
  FileText,
  Receipt,
  FolderKanban,
  Package,
  Wrench,
  Sparkles,
  ArrowRight,
  X,
  Palette,
  LayoutDashboard,
  Calendar,
  Settings,
  Car,
  Truck,
  ShieldAlert,
} from 'lucide-react'
import { useApp, AppView } from '../../context/AppContext'

interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: 'Views' | 'Clients' | 'Deals' | 'Quotes' | 'Invoices' | 'Projects' | 'Products' | 'Actions'
  icon: React.ReactNode
  view: AppView
  badge?: string
  badgeType?: 'primary' | 'success' | 'warning' | 'purple' | 'danger'
}

export const SpotlightSearchModal: React.FC = () => {
  const {
    isSpotlightOpen,
    setIsSpotlightOpen,
    setCurrentView,
    setIsThemeCustomizerOpen,
    getClientDisplayName,
    companies,
    individuals,
    deals,
    quotations,
    invoices,
    projects,
    products,
    workOrders,
    isModuleEnabled,
  } = useApp()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSpotlightOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isSpotlightOpen])

  if (!isSpotlightOpen) return null

  // System Views catalog
  const viewsCatalog: SearchResultItem[] = [
    {
      id: 'view-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'Executive KPIs, revenue metrics & activity',
      category: 'Views',
      icon: <LayoutDashboard size={16} />,
      view: 'dashboard',
    },
    {
      id: 'view-crm',
      title: 'CRM & Client Database',
      subtitle: 'B2B Companies, B2C Individuals & Peppol Directory',
      category: 'Views',
      icon: <Building2 size={16} />,
      view: 'crm',
    },
    {
      id: 'view-deals',
      title: 'Sales Pipeline (Kanban)',
      subtitle: 'Track leads, stages & weighted forecasts',
      category: 'Views',
      icon: <TrendingUp size={16} />,
      view: 'deals',
    },
    {
      id: 'view-quotes',
      title: 'Quotations & Proposals',
      subtitle: 'Interactive quotes & digital client signatures',
      category: 'Views',
      icon: <FileText size={16} />,
      view: 'quotes',
    },
    {
      id: 'view-invoices',
      title: 'Invoices & Billing',
      subtitle: 'Peppol UBL transmission & payment tracking',
      category: 'Views',
      icon: <Receipt size={16} />,
      view: 'invoices',
    },
    {
      id: 'view-projects',
      title: 'Projects & Gantt Timeline',
      subtitle: 'Milestones, tasks kanban & time tracking',
      category: 'Views',
      icon: <FolderKanban size={16} />,
      view: 'projects',
    },
    {
      id: 'view-helpdesk',
      title: 'PulseDesk Helpdesk Support',
      subtitle: 'SLA countdown timers & ticket conversion',
      category: 'Views',
      icon: <Receipt size={16} />,
      view: 'helpdesk',
    },
    {
      id: 'view-hr',
      title: 'PulseHR & Capacity Heatmap',
      subtitle: 'Team allocation, leave & SEPA reimbursements',
      category: 'Views',
      icon: <Building2 size={16} />,
      view: 'hr',
    },
    {
      id: 'view-bi',
      title: 'Executive BI & Scheduled Digests',
      subtitle: 'MRR, LTV, CAC, DSO & automated email briefs',
      category: 'Views',
      icon: <TrendingUp size={16} />,
      view: 'bi',
    },
    {
      id: 'view-pulse-ai',
      title: 'PulseAI & OCR Studio',
      subtitle: 'Receipt OCR extractor & deal intelligence',
      category: 'Views',
      icon: <Sparkles size={16} />,
      view: 'pulse_ai',
    },
    {
      id: 'view-inventory-multi',
      title: 'Multi-Location Inventory & Vans',
      subtitle: 'Stock transfers, serials & QR barcode scanner',
      category: 'Views',
      icon: <Package size={16} />,
      view: 'inventory_multi',
    },
    {
      id: 'view-template-designer',
      title: 'Document Template Designer',
      subtitle: 'Visual WYSIWYG letterhead & EPC QR styling',
      category: 'Views',
      icon: <FileText size={16} />,
      view: 'template_designer',
    },
    {
      id: 'view-module-store',
      title: 'Module Hub & Industry Presets',
      subtitle: 'Configure enterprise modules & archetypes',
      category: 'Views',
      icon: <Settings size={16} />,
      view: 'module_store',
    },
    {
      id: 'view-workorders',
      title: 'Digital Werkbonnen',
      subtitle: 'Field service tickets & sign-on-glass',
      category: 'Views',
      icon: <Wrench size={16} />,
      view: 'workorders',
    },
    {
      id: 'view-cashflow',
      title: 'AI Cashflow & Prognose',
      subtitle: '30-60-90 day liquidity intelligence',
      category: 'Views',
      icon: <Sparkles size={16} />,
      view: 'cashflow',
    },
    {
      id: 'view-settings',
      title: 'Settings & Theme Customizer',
      subtitle: 'Customize theme colors, fonts, entities & VAT',
      category: 'Views',
      icon: <Settings size={16} />,
      view: 'settings',
    },
  ]

  // Filter dynamic CRM items
  const cleanQ = query.toLowerCase().trim()

  const availableViews = viewsCatalog.filter((v) => {
    if (v.view === 'dashboard') return true
    return isModuleEnabled(v.view as any)
  })

  const filteredViews = cleanQ
    ? availableViews.filter(
        (v) => v.title.toLowerCase().includes(cleanQ) || v.subtitle.toLowerCase().includes(cleanQ)
      )
    : availableViews.slice(0, 5)

  const filteredClients: SearchResultItem[] = companies
    .filter(
      (c) =>
        c.name.toLowerCase().includes(cleanQ) ||
        c.vatNumber.toLowerCase().includes(cleanQ) ||
        c.city?.toLowerCase().includes(cleanQ)
    )
    .slice(0, 4)
    .map((c) => ({
      id: `comp-${c.id}`,
      title: c.name,
      subtitle: `VAT: ${c.vatNumber} • ${c.city || 'Belgium'}`,
      category: 'Clients',
      icon: <Building2 size={16} />,
      view: 'crm',
      badge: c.status?.toUpperCase(),
      badgeType: c.status === 'customer' ? 'success' : 'primary',
    }))

  const filteredDeals: SearchResultItem[] = deals
    .filter((d) => {
      const clientName = getClientDisplayName(d.clientType, d.companyId || d.individualId)
      return d.title.toLowerCase().includes(cleanQ) || clientName.toLowerCase().includes(cleanQ)
    })
    .slice(0, 3)
    .map((d) => {
      const clientName = getClientDisplayName(d.clientType, d.companyId || d.individualId)
      return {
        id: `deal-${d.id}`,
        title: d.title,
        subtitle: `${clientName} • €${d.value.toLocaleString()} (${d.stage})`,
        category: 'Deals',
        icon: <TrendingUp size={16} />,
        view: 'deals',
        badge: `€${d.value.toLocaleString()}`,
        badgeType: 'warning',
      }
    })

  const filteredInvoices: SearchResultItem[] = invoices
    .filter((i) => {
      const clientName = getClientDisplayName(i.clientType, i.companyId || i.individualId)
      return i.number.toLowerCase().includes(cleanQ) || clientName.toLowerCase().includes(cleanQ)
    })
    .slice(0, 3)
    .map((i) => {
      const clientName = getClientDisplayName(i.clientType, i.companyId || i.individualId)
      return {
        id: `inv-${i.id}`,
        title: `${i.number} — ${clientName}`,
        subtitle: `Total: €${i.total.toLocaleString()} • Due: ${i.dueDate}`,
        category: 'Invoices',
        icon: <Receipt size={16} />,
        view: 'invoices',
        badge: i.status.toUpperCase(),
        badgeType: i.status === 'paid' ? 'success' : 'danger',
      }
    })

  const filteredProjects: SearchResultItem[] = projects
    .filter((p) => {
      const clientName = getClientDisplayName(p.clientType, p.companyId || p.individualId)
      return p.title.toLowerCase().includes(cleanQ) || clientName.toLowerCase().includes(cleanQ)
    })
    .slice(0, 3)
    .map((p) => {
      const clientName = getClientDisplayName(p.clientType, p.companyId || p.individualId)
      return {
        id: `proj-${p.id}`,
        title: p.title,
        subtitle: `${clientName} • Budget: €${(p.budgetAmount || 0).toLocaleString()}`,
        category: 'Projects',
        icon: <FolderKanban size={16} />,
        view: 'projects',
        badge: p.status.replace('_', ' ').toUpperCase(),
        badgeType: 'primary',
      }
    })

  const allResults = [
    ...filteredViews,
    ...filteredClients,
    ...filteredDeals,
    ...filteredInvoices,
    ...filteredProjects,
  ]

  const handleSelect = (item: SearchResultItem) => {
    setCurrentView(item.view)
    setIsSpotlightOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSpotlightOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex])
      }
    }
  }

  return (
    <div
      className="spotlight-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSpotlightOpen(false)
      }}
    >
      <div className="spotlight-dialog" onKeyDown={handleKeyDown}>
        {/* Search Header */}
        <div className="spotlight-header">
          <Search size={20} color="var(--sb-primary)" />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="Type to search clients, deals, invoices, views... (↑ ↓ to navigate)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          )}
          <span className="search-kbd-badge" style={{ position: 'static', transform: 'none' }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="spotlight-body">
          {allResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--sb-body)' }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--sb-heading)', fontSize: '0.95rem' }}>
                No matching results found for "{query}"
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Try searching for a client name, invoice number, or module.
              </div>
            </div>
          ) : (
            <>
              {/* Group: Views */}
              {filteredViews.length > 0 && (
                <div>
                  <div className="spotlight-group-title">Navigation & Modules</div>
                  {filteredViews.map((item) => {
                    const globalIdx = allResults.findIndex((r) => r.id === item.id)
                    const isSelected = globalIdx === selectedIndex
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`spotlight-item ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--sb-primary)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{item.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.4 }} />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Group: Clients */}
              {filteredClients.length > 0 && (
                <div>
                  <div className="spotlight-group-title">Clients & Companies</div>
                  {filteredClients.map((item) => {
                    const globalIdx = allResults.findIndex((r) => r.id === item.id)
                    const isSelected = globalIdx === selectedIndex
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`spotlight-item ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--sb-primary)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{item.subtitle}</div>
                          </div>
                        </div>
                        {item.badge && (
                          <span className={`badge-soft badge-soft-${item.badgeType || 'primary'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Group: Invoices */}
              {filteredInvoices.length > 0 && (
                <div>
                  <div className="spotlight-group-title">Commercial Invoices</div>
                  {filteredInvoices.map((item) => {
                    const globalIdx = allResults.findIndex((r) => r.id === item.id)
                    const isSelected = globalIdx === selectedIndex
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`spotlight-item ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--sb-success)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{item.subtitle}</div>
                          </div>
                        </div>
                        {item.badge && (
                          <span className={`badge-soft badge-soft-${item.badgeType || 'primary'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Group: Deals */}
              {filteredDeals.length > 0 && (
                <div>
                  <div className="spotlight-group-title">Sales Deals</div>
                  {filteredDeals.map((item) => {
                    const globalIdx = allResults.findIndex((r) => r.id === item.id)
                    const isSelected = globalIdx === selectedIndex
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`spotlight-item ${isSelected ? 'active' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--sb-warning)' }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{item.subtitle}</div>
                          </div>
                        </div>
                        {item.badge && (
                          <span className={`badge-soft badge-soft-${item.badgeType || 'warning'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Quick Shortcuts */}
        <div className="spotlight-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--sb-surface)', border: '1px solid var(--sb-border)', borderRadius: '3px' }}>
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--sb-surface)', border: '1px solid var(--sb-border)', borderRadius: '3px' }}>
                ↵
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--sb-surface)', border: '1px solid var(--sb-border)', borderRadius: '3px' }}>
                ESC
              </kbd>{' '}
              Close
            </span>
          </div>

          <button
            onClick={() => {
              setIsSpotlightOpen(false)
              setIsThemeCustomizerOpen(true)
            }}
            className="btn-sandbox btn-sandbox-ghost btn-sandbox-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--sb-primary)', fontWeight: 700 }}
          >
            <Palette size={13} />
            <span>Customize Theme</span>
          </button>
        </div>
      </div>
    </div>
  )
}
