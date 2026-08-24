import React from 'react'
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Clock,
  Network,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  Building2,
  FolderKanban,
  Receipt,
  Sparkles,
  Play,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface DashboardViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickModal }) => {
  const {
    companies,
    deals,
    quotations,
    projects,
    tasks,
    timeEntries,
    invoices,
    peppolLogs,
    setCurrentView,
    setSelectedProjectId,
    startTimer,
  } = useApp()

  // Calculate Metrics
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0)
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.amountPaid || i.total), 0)
  const totalUnpaid = invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0)

  const activeDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedPipelineValue = activeDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0)

  const totalLoggedHours = timeEntries.reduce((sum, t) => sum + t.hours, 0)
  const billableHours = timeEntries.filter((t) => t.isBillable).reduce((sum, t) => sum + t.hours, 0)
  const billablePercent = totalLoggedHours > 0 ? Math.round((billableHours / totalLoggedHours) * 100) : 0

  const peppolSuccessCount = peppolLogs.filter((p) => p.status === 'success').length
  const peppolSuccessRate = peppolLogs.length > 0 ? Math.round((peppolSuccessCount / peppolLogs.length) * 100) : 100

  // Revenue chart mock points
  const monthlyData = [
    { month: 'Mar', invoiced: 18500, collected: 18500 },
    { month: 'Apr', invoiced: 22400, collected: 21000 },
    { month: 'May', invoiced: 27900, collected: 26500 },
    { month: 'Jun', invoiced: 24695, collected: 24695 },
    { month: 'Jul', invoiced: 31200, collected: 28000 },
    { month: 'Aug', invoiced: 30916, collected: 8964 },
  ]
  const maxVal = 35000

  const urgentTasks = tasks.filter((t) => t.status !== 'done').slice(0, 4)

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Business Overview</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Real-time pipeline, ongoing client deliverables, and Peppol electronic billing metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => onOpenQuickModal('quote')}
            className="btn-sandbox btn-sandbox-secondary"
          >
            <FileSignature size={16} />
            <span>Create Quote</span>
          </button>
          <button
            onClick={() => onOpenQuickModal('invoice')}
            className="btn-sandbox btn-sandbox-primary"
          >
            <DollarSign size={16} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* KPI 1: Invoiced & Revenue */}
        <div className="card-sandbox card-sandbox-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Total Invoiced</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.25rem' }}>
            €{totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span className="badge-soft badge-soft-success">
              <ArrowUpRight size={12} /> +14.2%
            </span>
            <span style={{ color: 'var(--sb-body-subtle)' }}>vs. previous quarter</span>
          </div>
        </div>

        {/* KPI 2: Outstanding Cashflow */}
        <div className="card-sandbox card-sandbox-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Outstanding Invoices</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-warning-soft)',
                color: 'var(--sb-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.25rem' }}>
            €{totalUnpaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span className="badge-soft badge-soft-warning">
              {invoices.filter((i) => i.status !== 'paid').length} Invoices
            </span>
            <span style={{ color: 'var(--sb-body-subtle)' }}>awaiting payment</span>
          </div>
        </div>

        {/* KPI 3: Sales Pipeline */}
        <div className="card-sandbox card-sandbox-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Active Pipeline</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-purple-soft)',
                color: 'var(--sb-purple)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.25rem' }}>
            €{totalPipelineValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span className="badge-soft badge-soft-purple">
              €{Math.round(weightedPipelineValue).toLocaleString()}
            </span>
            <span style={{ color: 'var(--sb-body-subtle)' }}>weighted forecast ({activeDeals.length} deals)</span>
          </div>
        </div>

        {/* KPI 4: Peppol Delivery */}
        <div className="card-sandbox card-sandbox-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Peppol E-Invoicing</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-success-soft)',
                color: 'var(--sb-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Network size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.25rem' }}>
            {peppolSuccessRate}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
            <span className="badge-soft badge-soft-success">
              <CheckCircle2 size={12} /> {peppolSuccessCount} Delivered
            </span>
            <span style={{ color: 'var(--sb-body-subtle)' }}>via AS4 Access Point</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Trend & Pipeline Funnel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Visual Revenue & Cashflow Chart */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Revenue & Cashflow Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>Monthly invoiced amount vs collected cash</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--sb-primary)', borderRadius: '2px' }} />
                <span>Invoiced</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--sb-success)', borderRadius: '2px' }} />
                <span>Collected</span>
              </div>
            </div>
          </div>

          {/* Simple Clean Bar Chart Visualizer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '10px' }}>
            {monthlyData.map((d, i) => {
              const invHeight = Math.round((d.invoiced / maxVal) * 150)
              const colHeight = Math.round((d.collected / maxVal) * 150)
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '150px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: `${invHeight}px`,
                        backgroundColor: 'var(--sb-primary)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                      title={`Invoiced: €${d.invoiced.toLocaleString()}`}
                    />
                    <div
                      style={{
                        width: '16px',
                        height: `${colHeight}px`,
                        backgroundColor: 'var(--sb-success)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                      title={`Collected: €${d.collected.toLocaleString()}`}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.5rem', fontWeight: 600 }}>
                    {d.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pipeline & Deals Funnel */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Sales Pipeline by Stage</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>Active deals distribution & conversion</p>
            </div>
            <button
              onClick={() => setCurrentView('deals')}
              className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
            >
              <span>View Pipeline</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { stage: 'Qualified Leads', count: deals.filter((d) => d.stage === 'qualified').length, val: deals.filter((d) => d.stage === 'qualified').reduce((s, d) => s + d.value, 0), color: '#3f78e0' },
              { stage: 'Proposal Sent', count: deals.filter((d) => d.stage === 'proposal').length, val: deals.filter((d) => d.stage === 'proposal').reduce((s, d) => s + d.value, 0), color: '#605dba' },
              { stage: 'Negotiation', count: deals.filter((d) => d.stage === 'negotiation').length, val: deals.filter((d) => d.stage === 'negotiation').reduce((s, d) => s + d.value, 0), color: '#fab758' },
              { stage: 'Won & Closed', count: deals.filter((d) => d.stage === 'won').length, val: deals.filter((d) => d.stage === 'won').reduce((s, d) => s + d.value, 0), color: '#38b995' },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>
                    {item.stage} ({item.count})
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>
                    €{item.val.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--sb-bg)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(8, (item.val / 65000) * 100))}%`,
                      backgroundColor: item.color,
                      borderRadius: '999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Urgent Deliverables & Projects */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Active Projects Overview */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Active Projects</h3>
            <button
              onClick={() => setCurrentView('projects')}
              className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
            >
              <span>All Projects</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projects.map((proj) => {
              const comp = companies.find((c) => c.id === proj.companyId)
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id)
                    setCurrentView('projects')
                  }}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--sb-radius-sm)',
                    backgroundColor: 'var(--sb-bg)',
                    border: '1px solid var(--sb-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  className="card-sandbox-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                      {proj.title}
                    </span>
                    <span className="badge-soft badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                      {proj.progressPercent}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--sb-body)', marginBottom: '0.5rem' }}>
                    <span>Client: {comp?.name || 'Internal'}</span>
                    <span>Budget: €{proj.budgetAmount.toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--sb-border)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${proj.progressPercent}%`,
                        backgroundColor: proj.color || 'var(--sb-primary)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks Due & Time Tracking Quick Actions */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Priority Deliverables</h3>
            <span className="badge-soft badge-soft-warning">
              {urgentTasks.length} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {urgentTasks.map((t) => {
              const proj = projects.find((p) => p.id === t.projectId)
              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--sb-radius-sm)',
                    backgroundColor: 'var(--sb-bg)',
                    border: '1px solid var(--sb-border)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, marginRight: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
                      {proj?.title} • Assignee: {t.assignee}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => startTimer(t.projectId, t.id, t.title)}
                      className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                      title="Track Time on Task"
                    >
                      <Play size={12} />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
