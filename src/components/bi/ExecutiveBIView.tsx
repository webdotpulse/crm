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
  const [previewingDigestId, setPreviewingDigestId] = useState<string>(scheduledDigests[0]?.id || 'dig-1')

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
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 68

  // Export CSV Helper
  const handleExportCsv = () => {
    const rows = [
      ['Dimension', 'Metric Value', 'Currency', 'Period'],
      ['TechFlow Logistics NV', '€28,450.00', 'EUR', '2026 YTD'],
      ['Vanguard Retail Europe BV', '€19,200.00', 'EUR', '2026 YTD'],
      ['NorthStar Digital NV', '€14,800.00', 'EUR', '2026 YTD'],
      ['Apex Cloud Dynamics', '€9,600.00', 'EUR', '2026 YTD'],
    ]
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
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            High-level executive KPIs (MRR, LTV, CAC, DSO), dynamic pivot reporting, and automated email briefs.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--sb-surface)', padding: '0.3rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn-sandbox ${activeTab === 'dashboard' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <TrendingUp size={15} /> Executive KPIs
          </button>
          <button
            onClick={() => setActiveTab('digests')}
            className={`btn-sandbox ${activeTab === 'digests' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Mail size={15} /> Scheduled Digests
          </button>
          <button
            onClick={() => setActiveTab('pivot_builder')}
            className={`btn-sandbox ${activeTab === 'pivot_builder' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Sliders size={15} /> Custom Pivot Builder
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE KPI DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Top 6 KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.15rem', marginBottom: '1.75rem' }}>
            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Monthly Recurring (MRR)</span>
                <span style={{ color: '#38b995', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                  <ArrowUpRight size={14} /> +8.4%
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {formatCurrency(mrrTotal || 34850, selectedCurrency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                ARR Run-Rate: <strong>{formatCurrency((mrrTotal || 34850) * 12, selectedCurrency)}</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Customer LTV</span>
                <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>SaaS Benchmark</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {formatCurrency(18400, selectedCurrency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                LTV / CAC Ratio: <strong>14.7x</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Cust. Acquisition (CAC)</span>
                <span style={{ color: '#38b995', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                  <ArrowDownRight size={14} /> -4.2%
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {formatCurrency(1250, selectedCurrency)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Payback Period: <strong>2.8 months</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Days Sales Out (DSO)</span>
                <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem' }}>Peppol Accelerated</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#38b995', marginTop: '0.35rem' }}>
                24 Days
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                EU Industry Average: <strong>48 days</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Gross Margin %</span>
                <span style={{ color: '#38b995', display: 'flex', alignItems: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                  <ArrowUpRight size={14} /> +3.1%
                </span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
                {grossMarginPercent}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Net EBITDA: <strong>{formatCurrency(totalRevenue * 0.32 || 38200, selectedCurrency)}</strong>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Cash Runway</span>
                <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>Healthy</span>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--sb-primary)', marginTop: '0.35rem' }}>
                14.2 Mo
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Factoring VAT & tax reserves
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses Trajectory & Client Concentration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Revenue vs Expense Chart */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem' }}>
                Quarterly Revenue vs Expenditure Trajectory (2026)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { quarter: 'Q1 (Jan - Mar)', revenue: 68400, expense: 22100 },
                  { quarter: 'Q2 (Apr - Jun)', revenue: 84200, expense: 26800 },
                  { quarter: 'Q3 (Jul - Sep)', revenue: 98500, expense: 29400 },
                  { quarter: 'Q4 Projected', revenue: 112000, expense: 32000 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--sb-heading)' }}>{item.quarter}</span>
                      <span style={{ color: 'var(--sb-body)' }}>
                        Rev: <strong style={{ color: 'var(--sb-primary)' }}>€{item.revenue.toLocaleString()}</strong> • Exp: <strong style={{ color: '#e2626b' }}>€{item.expense.toLocaleString()}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', height: '10px', backgroundColor: 'var(--sb-border)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.revenue / 120000) * 100}%`, backgroundColor: 'var(--sb-primary)', borderRadius: '5px 0 0 5px' }} />
                      <div style={{ width: `${(item.expense / 120000) * 100}%`, backgroundColor: '#e2626b', borderRadius: '0 5px 5px 0' }} />
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'TechFlow Logistics NV', arr: 48200, share: 34, status: 'Active Retainer' },
                  { name: 'Vanguard Retail Europe BV', arr: 32400, share: 23, status: 'Active Retainer' },
                  { name: 'NorthStar Digital NV', arr: 24800, share: 18, status: 'SLA Support' },
                  { name: 'Apex Cloud Dynamics', arr: 18500, share: 13, status: 'Monthly Subscription' },
                ].map((c, idx) => (
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
                        €{c.arr.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--sb-primary)', fontWeight: 700 }}>
                        {c.share}% of ARR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED DIGESTS & LIVE EMAIL PREVIEW */}
      {activeTab === 'digests' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.75rem' }}>
          {/* Left Column: Digest Configs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Automated Email Digests
            </h3>

            {scheduledDigests.map((digest) => {
              const isSelected = previewingDigestId === digest.id

              return (
                <div
                  key={digest.id}
                  onClick={() => setPreviewingDigestId(digest.id)}
                  className="card-sandbox"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                    backgroundColor: isSelected ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--sb-heading)' }}>
                      {digest.title}
                    </span>
                    <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {digest.cadence}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)', marginBottom: '0.65rem' }}>
                    Recipients: <strong>{digest.recipients.join(', ')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                      Next send: {digest.nextSendDate}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleScheduledDigest(digest.id)
                      }}
                      className={`btn-sandbox ${digest.enabled ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                    >
                      {digest.enabled ? 'Enabled' : 'Paused'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Visual Email Previewer */}
          <div className="card-sandbox" style={{ padding: '2rem', backgroundColor: '#f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
                Live HTML Email Preview
              </div>
              <button
                onClick={() => alert('Digest preview successfully generated and exported as PDF.')}
                className="btn-sandbox btn-sandbox-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
              >
                <Download size={14} /> Download Digest PDF / Copy
              </button>
            </div>

            {/* Email Container Canvas */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                padding: '2rem',
                maxWidth: '650px',
                margin: '0 auto',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <div style={{ borderBottom: '2px solid #3f78e0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#3f78e0', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                  PulseWork Executive Morning Brief
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Daily Performance Digest for {activeLegalEntity.name} • {new Date().toLocaleDateString([], { dateStyle: 'full' })}
                </div>
              </div>

              {/* Metric Highlights in Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current MRR</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>€34,850.00</div>
                  <div style={{ fontSize: '0.7rem', color: '#38b995', fontWeight: 700 }}>▲ +8.4% this month</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cash Runway</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>14.2 Months</div>
                  <div style={{ fontSize: '0.7rem', color: '#3f78e0', fontWeight: 700 }}>● Operational Liquidity Safe</div>
                </div>
              </div>

              {/* Overdue Risk Alert in Email */}
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef8ee', borderLeft: '4px solid #fab758', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#b87a1d' }}>
                <strong>Priority Overdue Notice:</strong> Invoice #BE-INV-2026-001 (€4,235.00) is 9 days overdue. Recommended: Dispatch 1st statutory formal reminder.
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
                Generated automatically by PulseWork Executive BI Engine. Manage your digest preferences in the Module Store.
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
                  <option value="this_year">2026 Fiscal Year to Date</option>
                  <option value="q3">Q3 2026 (Current Quarter)</option>
                  <option value="q2">Q2 2026</option>
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
                {[
                  { name: 'TechFlow Logistics NV', val: '€28,450.00', share: '38.4%', status: 'Growth Leader' },
                  { name: 'Vanguard Retail Europe BV', val: '€19,200.00', share: '25.9%', status: 'Steady Retainer' },
                  { name: 'NorthStar Digital NV', val: '€14,800.00', share: '20.0%', status: 'SLA Client' },
                  { name: 'Apex Cloud Dynamics', val: '€9,600.00', share: '13.0%', status: 'High Margin' },
                ].map((row, idx) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export default ExecutiveBIView
