import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Mail,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  PieChart,
  Sliders,
  Eye,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CustomReportConfig, ScheduledDigestConfig } from '../../types'
import { formatCurrency } from '../../services/currencyService'

export const ExecutiveBIView: React.FC = () => {
  const {
    invoices,
    expenses,
    subscriptions,
    deals,
    projects,
    companies,
    tasks,
    legalEntities,
    scheduledDigests,
    updateScheduledDigest,
    toggleScheduledDigest,
    customReports,
    addCustomReport,
    deleteCustomReport,
    selectedCurrency,
    activeLegalEntity,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'dashboard' | 'digests' | 'pivot_builder'>('dashboard')

  // Pivot Builder State
  const [selectedDimension, setSelectedDimension] = useState<'client' | 'entity' | 'month' | 'category'>('client')
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit_margin' | 'hours' | 'invoices_count'>('revenue')
  const [selectedDateRange, setSelectedDateRange] = useState<'this_year' | 'q3' | 'q2' | 'last_12_months'>('this_year')
  const [previewingDigestId, setPreviewingDigestId] = useState<string>(scheduledDigests[0]?.id || '')

  // Calculations for Executive Metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const mrrTotal = activeSubs.reduce((sum, s) => {
    if (s.cadence === 'monthly') return sum + s.total
    if (s.cadence === 'quarterly') return sum + s.total / 3
    if (s.cadence === 'annually') return sum + s.total / 12
    return sum + s.total
  }, 0)

  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0)
  const totalApprovedExpenses = expenses.filter((e) => e.status !== 'rejected').reduce((sum, e) => sum + e.total, 0)
  const grossProfit = Math.max(0, totalRevenue - totalApprovedExpenses)
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0

  // Calculate top client concentration dynamically
  const clientArrMap: Record<string, { name: string; arr: number; count: number; status: string }> = {}
  companies.forEach((comp) => {
    const compSubs = subscriptions.filter((s) => s.companyId === comp.id && s.status === 'active')
    const compInvoices = invoices.filter((i) => i.companyId === comp.id && i.status === 'paid')
    const annualSubs = compSubs.reduce((sum, s) => {
      if (s.cadence === 'monthly') return sum + s.total * 12
      if (s.cadence === 'quarterly') return sum + s.total * 4
      return sum + s.total
    }, 0)
    const invTotal = compInvoices.reduce((sum, i) => sum + i.total, 0)
    const arr = annualSubs || invTotal
    if (arr > 0) {
      clientArrMap[comp.id] = {
        name: comp.name,
        arr,
        count: compInvoices.length,
        status: compSubs.length > 0 ? 'Active Subscription' : 'Client Account',
      }
    }
  })

  const totalArrAll = Object.values(clientArrMap).reduce((sum, c) => sum + c.arr, 0) || 1
  const topClients = Object.values(clientArrMap)
    .sort((a, b) => b.arr - a.arr)
    .slice(0, 5)
    .map((c) => ({
      ...c,
      share: Math.round((c.arr / totalArrAll) * 100),
    }))

  // Dynamic Quarterly Revenue vs Expenses
  const currentYear = new Date().getFullYear()
  const quarterlyTrajectory = [
    { label: 'Q1 (Jan - Mar)', qNum: 1, months: ['01', '02', '03'] },
    { label: 'Q2 (Apr - Jun)', qNum: 2, months: ['04', '05', '06'] },
    { label: 'Q3 (Jul - Sep)', qNum: 3, months: ['07', '08', '09'] },
    { label: 'Q4 (Oct - Dec)', qNum: 4, months: ['10', '11', '12'] },
  ].map((q) => {
    const rev = invoices
      .filter((inv) => {
        const d = inv.issueDate || ''
        return d.startsWith(`${currentYear}-`) && q.months.some((m) => d.includes(`-${m}-`)) && inv.status === 'paid'
      })
      .reduce((sum, inv) => sum + inv.total, 0)

    const exp = expenses
      .filter((e) => {
        const d = e.invoiceDate || ''
        return d.startsWith(`${currentYear}-`) && q.months.some((m) => d.includes(`-${m}-`)) && e.status !== 'rejected'
      })
      .reduce((sum, e) => sum + e.total, 0)

    return {
      quarter: q.label,
      revenue: rev,
      expense: exp,
    }
  })
  const maxQuarterlyVal = Math.max(...quarterlyTrajectory.map((q) => Math.max(q.revenue, q.expense)), 1000)

  // Dynamic Pivot rows
  const getPivotRows = () => {
    if (selectedDimension === 'client') {
      if (companies.length === 0) return []
      return companies.map((comp) => {
        const compInvoices = invoices.filter((i) => i.companyId === comp.id)
        const compPaid = compInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
        const share = totalRevenue > 0 ? ((compPaid / totalRevenue) * 100).toFixed(1) + '%' : '0%'
        return {
          name: comp.name,
          val: formatCurrency(compPaid, selectedCurrency),
          share,
          status: compPaid > 0 ? 'Active' : 'Prospect',
        }
      })
    }
    if (selectedDimension === 'entity') {
      return legalEntities.map((ent) => {
        const entInvoices = invoices.filter((i) => i.legalEntityId === ent.id && i.status === 'paid')
        const entTotal = entInvoices.reduce((sum, i) => sum + i.total, 0)
        const share = totalRevenue > 0 ? ((entTotal / totalRevenue) * 100).toFixed(1) + '%' : '0%'
        return {
          name: ent.name,
          val: formatCurrency(entTotal, selectedCurrency),
          share,
          status: ent.isDefault ? 'Primary' : 'Entity',
        }
      })
    }
    if (selectedDimension === 'category') {
      const categories: Record<string, number> = {}
      expenses.forEach((e) => {
        if (e.status !== 'rejected') {
          categories[e.category] = (categories[e.category] || 0) + e.total
        }
      })
      const totalExpAll = Object.values(categories).reduce((sum, v) => sum + v, 0) || 1
      return Object.entries(categories).map(([cat, val]) => ({
        name: cat.replace(/_/g, ' ').toUpperCase(),
        val: formatCurrency(val, selectedCurrency),
        share: ((val / totalExpAll) * 100).toFixed(1) + '%',
        status: 'Expense',
      }))
    }
    return [
      {
        name: `${currentYear} YTD`,
        val: formatCurrency(totalRevenue, selectedCurrency),
        share: '100%',
        status: 'Annual Total',
      },
    ]
  }

  const pivotRows = getPivotRows()

  // Export CSV Helper
  const handleExportCsv = () => {
    const rows = [
      ['Dimension', 'Metric Value', 'Currency', 'Period'],
      ...pivotRows.map((r) => [r.name, r.val, selectedCurrency, `${currentYear} YTD`]),
    ]
    if (pivotRows.length === 0) {
      rows.push(['No data recorded', '0.00', selectedCurrency, `${currentYear} YTD`])
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `PulseWork_Executive_BI_Pivot_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const selectedDigest = scheduledDigests.find((d) => d.id === previewingDigestId) || scheduledDigests[0]
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue')

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(63, 120, 224, 0.12)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Executive BI & Scheduled Digests
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Multi-dimensional financial intelligence, automated management digests, and pivot query builder
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="tab-group-sandbox" style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn-sandbox ${activeTab === 'dashboard' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <BarChart3 size={15} style={{ marginRight: '0.4rem' }} />
            <span>Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('digests')}
            className={`btn-sandbox ${activeTab === 'digests' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <Mail size={15} style={{ marginRight: '0.4rem' }} />
            <span>Scheduled Digests</span>
          </button>
          <button
            onClick={() => setActiveTab('pivot_builder')}
            className={`btn-sandbox ${activeTab === 'pivot_builder' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <Sliders size={15} style={{ marginRight: '0.4rem' }} />
            <span>Custom Pivot Builder</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Executive Top Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Active MRR</span>
                <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem' }}>Recurring</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {formatCurrency(mrrTotal, selectedCurrency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                {activeSubs.length} active subscription retainer(s)
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Total Invoiced Revenue</span>
                <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>Settled</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {formatCurrency(totalRevenue, selectedCurrency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                {paidInvoices.length} paid customer invoice(s)
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Gross Margin %</span>
                <span style={{ color: '#38b995', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                  <ArrowUpRight size={14} /> {grossMarginPercent}%
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {grossMarginPercent}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Gross Profit: <strong>{formatCurrency(grossProfit, selectedCurrency)}</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Overdue Invoices</span>
                <span className={`badge-sandbox ${overdueInvoices.length > 0 ? 'badge-soft-danger' : 'badge-soft-success'}`} style={{ fontSize: '0.65rem' }}>
                  {overdueInvoices.length > 0 ? `${overdueInvoices.length} Action Needed` : 'All Current'}
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: overdueInvoices.length > 0 ? '#e2626b' : 'var(--sb-primary)', marginTop: '0.35rem' }}>
                {overdueInvoices.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                {overdueInvoices.length > 0 ? formatCurrency(overdueInvoices.reduce((s, i) => s + (i.total - (i.amountPaid || 0)), 0), selectedCurrency) : 'Zero overdue payments'}
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses Trajectory & Client Concentration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Revenue vs Expense Chart */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem' }}>
                Quarterly Revenue vs Expenditure Trajectory ({currentYear})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {quarterlyTrajectory.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--sb-heading)' }}>{item.quarter}</span>
                      <span style={{ color: 'var(--sb-body)' }}>
                        Rev: <strong style={{ color: 'var(--sb-primary)' }}>{formatCurrency(item.revenue, selectedCurrency)}</strong> • Exp: <strong style={{ color: '#e2626b' }}>{formatCurrency(item.expense, selectedCurrency)}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', height: '10px', backgroundColor: 'var(--sb-border)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.revenue / maxQuarterlyVal) * 100}%`, backgroundColor: 'var(--sb-primary)', borderRadius: '5px 0 0 5px' }} />
                      <div style={{ width: `${(item.expense / maxQuarterlyVal) * 100}%`, backgroundColor: '#e2626b', borderRadius: '0 5px 5px 0' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Concentration Table */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem' }}>
                Top Client Revenue Concentration
              </h3>

              {topClients.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topClients.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--sb-bg)',
                        borderRadius: 'var(--sb-radius)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--sb-heading)' }}>{c.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{c.status}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                          {formatCurrency(c.arr, selectedCurrency)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-primary)', fontWeight: 700 }}>
                          {c.share}% of Total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--sb-body)', fontSize: '0.85rem' }}>
                  No client revenue concentration recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED DIGESTS & EMAIL PREVIEWS */}
      {activeTab === 'digests' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>
          {/* Digest Config List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Automated Digest Subscriptions
            </h3>

            {scheduledDigests.length > 0 ? (
              scheduledDigests.map((dig) => (
                <div
                  key={dig.id}
                  className="card-sandbox"
                  style={{
                    padding: '1.25rem',
                    border: previewingDigestId === dig.id ? '2px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--sb-heading)' }}>{dig.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
                        Cadence: <strong>{dig.cadence.toUpperCase()}</strong> • Recipients: {dig.recipients.join(', ')}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dig.enabled}
                      onChange={() => toggleScheduledDigest(dig.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => setPreviewingDigestId(dig.id)}
                      className="btn-sandbox btn-sandbox-outline"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} />
                      <span>Preview Email Layout</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card-sandbox" style={{ padding: '2rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                No scheduled digests configured yet.
              </div>
            )}
          </div>

          {/* Email Preview Mockup */}
          <div className="card-sandbox" style={{ padding: '1.5rem', backgroundColor: '#ffffff', color: '#1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <Mail size={18} color="#3f78e0" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                HTML Email Preview
              </span>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ marginBottom: '1.25rem', borderBottom: '2px solid #3f78e0', paddingBottom: '0.75rem' }}>
                <div style={{ color: '#3f78e0', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                  {activeLegalEntity.name || 'Company'} Executive Brief
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Performance Digest • {new Date().toLocaleDateString([], { dateStyle: 'full' })}
                </div>
              </div>

              {/* Metric Highlights in Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current MRR</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(mrrTotal, selectedCurrency)}</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Revenue YTD</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(totalRevenue, selectedCurrency)}</div>
                </div>
              </div>

              {/* Overdue Risk Alert in Email */}
              {overdueInvoices.length > 0 ? (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef8ee', borderLeft: '4px solid #fab758', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#b87a1d' }}>
                  <strong>Priority Overdue Notice:</strong> {overdueInvoices.length} invoice(s) overdue totaling {formatCurrency(overdueInvoices.reduce((s, i) => s + (i.total - (i.amountPaid || 0)), 0), selectedCurrency)}.
                </div>
              ) : (
                <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#15803d' }}>
                  <strong>All Invoices Settled:</strong> Zero outstanding payment delays.
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                Generated automatically by Executive BI Engine.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM BI PIVOT & QUERY BUILDER */}
      {activeTab === 'pivot_builder' && (
        <div>
          {/* Builder Controls */}
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: 'var(--sb-bg)',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sb-body)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Group Dimension
                </label>
                <select
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value as any)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}
                >
                  <option value="client">Client / Account</option>
                  <option value="entity">Legal Entity</option>
                  <option value="category">Expense Category</option>
                  <option value="month">Month-over-Month</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sb-body)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Aggregated Metric
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}
                >
                  <option value="revenue">Total Sales Revenue (€)</option>
                  <option value="profit_margin">Net Gross Margin (%)</option>
                  <option value="hours">Billable Project Hours</option>
                  <option value="invoices_count">Invoice Volume (#)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sb-body)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                  Timeframe Filter
                </label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value as any)}
                  className="input-sandbox"
                  style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}
                >
                  <option value="this_year">{currentYear} Fiscal Year to Date</option>
                  <option value="q3">Q3 {currentYear}</option>
                  <option value="q2">Q2 {currentYear}</option>
                  <option value="last_12_months">Trailing 12 Months</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportCsv}
              className="btn-sandbox btn-sandbox-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.15rem' }}
            >
              <FileSpreadsheet size={16} />
              <span>Export Pivot CSV / Excel</span>
            </button>
          </div>

          {/* Pivot Table Result */}
          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {selectedDimension.toUpperCase()} SEGMENT
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'right' }}>
                    AGGREGATED METRIC
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'right' }}>
                    % SHARE OF TOTAL
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'center' }}>
                    BENCHMARK STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {pivotRows.length > 0 ? (
                  pivotRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--sb-primary)' }}>
                        {row.val}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--sb-body)' }}>
                        {row.share}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.7rem' }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                      No data recorded for the selected dimensions. Add clients or record invoices to populate analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExecutiveBIView
