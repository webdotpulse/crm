import React, { useState } from 'react'
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Landmark,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  PieChart,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { generate90DayCashFlowForecast } from '../../services/cashflowForecastService'

export const CashFlowForecastView: React.FC = () => {
  const { invoices, expenses, subscriptions, bankTransactions, setCurrentView } = useApp()
  const [activeTab, setActiveTab] = useState<'forecast' | 'insights'>('forecast')

  const { dailyPoints, metrics } = generate90DayCashFlowForecast(
    invoices,
    expenses,
    subscriptions,
    bankTransactions,
    42580.0
  )

  // Find min and max for chart scaling
  const balances = dailyPoints.map((d) => d.netCashBalance)
  const minBalance = Math.min(...balances, 20000)
  const maxBalance = Math.max(...balances, 100000)

  // Generate SVG path for 90-day curve
  const chartWidth = 900
  const chartHeight = 220
  const points = dailyPoints.map((d, i) => {
    const x = (i / 90) * chartWidth
    const y = chartHeight - ((d.netCashBalance - minBalance) / (maxBalance - minBalance || 1)) * (chartHeight - 40) - 20
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const pathD = `M ${points.join(' L ')}`
  const fillD = `M ${points[0]} L ${points.join(' L ')} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
              AI FINANCIAL CO-PILOT
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>90-Day Cash Flow Simulation</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Predictive Cash Flow & Financial Intelligence
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Combines active MRR retainers, client invoices, supplier liabilities, and Belgian tax reserves
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentView('banking')}
            className="btn-sandbox btn-sandbox-outline"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1rem' }}
          >
            Bank Accounts ➔
          </button>
          <button
            onClick={() => setCurrentView('accountant')}
            className="btn-sandbox btn-sandbox-primary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem' }}
          >
            Belgian VAT Grids ➔
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Current Confirmed Cash</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>Ponto Verified</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            €{metrics.currentCashEur.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpRight size={14} />
            <span>Strong initial liquidity buffer</span>
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>90-Day Projected Runway</span>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem' }}>+110%</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3f78e0', marginTop: '0.25rem' }}>
            €{metrics.projectedCash90DaysEur.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Day +90 estimated treasury balance
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Days Sales Outstanding (DSO)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {metrics.dsoDays} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sb-body)' }}>Days</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            ✓ Healthy Belgian B2B collection speed
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem', backgroundColor: 'rgba(63, 120, 224, 0.04)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Quarterly VAT Reserve</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            €{metrics.estimatedVatReserveEur.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Auto-reserved for Oct 20 Intervat
          </div>
        </div>
      </div>

      {/* 90-Day Cash Flow Chart */}
      <div className="card-sandbox" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              90-Day Treasury Runway & Cash Flow Trajectory
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--sb-body)' }}>
              Continuous balance curve modeling incoming client collections, retainer billing cycles, and operating overheads.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3f78e0' }} />
              <span>Projected Net Cash</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }} />
              <span>Recurring MRR Income</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '220px', display: 'block' }}>
            <defs>
              <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3f78e0" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3f78e0" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="var(--sb-border)" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="var(--sb-border)" strokeDasharray="3 3" />
            <line x1="0" y1="160" x2={chartWidth} y2="160" stroke="var(--sb-border)" strokeDasharray="3 3" />

            {/* Shaded Area */}
            <path d={fillD} fill="url(#cashGradient)" />

            {/* Curve Line */}
            <path d={pathD} fill="none" stroke="#3f78e0" strokeWidth="3" strokeLinecap="round" />

            {/* Key Marker Points */}
            <circle cx="0" cy={chartHeight - ((metrics.currentCashEur - minBalance) / (maxBalance - minBalance)) * 180 - 20} r="5" fill="#3f78e0" />
            <circle cx={chartWidth * 0.33} cy={chartHeight - ((dailyPoints[30]?.netCashBalance - minBalance) / (maxBalance - minBalance)) * 180 - 20} r="5" fill="#10b981" />
            <circle cx={chartWidth * 0.66} cy={chartHeight - ((dailyPoints[60]?.netCashBalance - minBalance) / (maxBalance - minBalance)) * 180 - 20} r="5" fill="#10b981" />
            <circle cx={chartWidth} cy={chartHeight - ((dailyPoints[90]?.netCashBalance - minBalance) / (maxBalance - minBalance)) * 180 - 20} r="6" fill="#8b5cf6" />
          </svg>
        </div>

        {/* Timeline Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.5rem', borderTop: '1px solid var(--sb-border)', paddingTop: '0.5rem' }}>
          <span>Today (Day 0)</span>
          <span>Day +30 (Month 1 Billing)</span>
          <span>Day +60 (Month 2 Billing)</span>
          <span>Day +90 (Quarter Close)</span>
        </div>
      </div>

      {/* AI Financial Insights & Action Recommendations */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={18} color="#8b5cf6" />
        <span>AI Financial Co-Pilot Insights</span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {metrics.insights.map((insight) => (
          <div
            key={insight.id}
            className="card-sandbox"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: `4px solid ${
                insight.type === 'opportunity' ? '#10b981' : insight.type === 'tax' ? '#3f78e0' : '#f59e0b'
              }`,
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span
                  className={`badge-sandbox badge-soft-${
                    insight.type === 'opportunity' ? 'success' : insight.type === 'tax' ? 'primary' : 'warning'
                  }`}
                  style={{ fontSize: '0.65rem' }}
                >
                  {insight.metricName}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: insight.impactEur > 0 ? '#10b981' : insight.impactEur < 0 ? '#ef4444' : 'var(--sb-heading)',
                  }}
                >
                  {insight.impactEur > 0 ? `+€${insight.impactEur.toLocaleString('nl-BE')}` : insight.impactEur < 0 ? `-€${Math.abs(insight.impactEur).toLocaleString('nl-BE')}` : ''}
                </span>
              </div>

              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                {insight.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                {insight.description}
              </p>
            </div>

            {insight.actionLabel && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--sb-border)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => {
                    if (insight.id === 'ins-1') setCurrentView('banking')
                    if (insight.id === 'ins-2') setCurrentView('accountant')
                    if (insight.id === 'ins-3') setCurrentView('expenses')
                  }}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Zap size={13} />
                  <span>{insight.actionLabel}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
