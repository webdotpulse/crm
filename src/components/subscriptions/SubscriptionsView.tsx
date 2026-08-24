import React, { useState } from 'react'
import {
  RefreshCw,
  Plus,
  Play,
  TrendingUp,
  Calendar,
  Building,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SubscriptionContract, BillingCadence, SubscriptionStatus } from '../../types'
import { formatCurrency } from '../../services/currencyService'
import { SubscriptionModal } from './SubscriptionModal'

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    companies,
    individuals,
    deleteSubscription,
    updateSubscription,
    generateInvoicesForDueSubscriptions,
    selectedCurrency,
  } = useApp()

  const [filterCadence, setFilterCadence] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedSubscriptionToEdit, setSelectedSubscriptionToEdit] = useState<SubscriptionContract | null>(null)
  const [runMessage, setRunMessage] = useState<string | null>(null)

  // MRR & ARR Calculations
  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const monthlyRecurringRevenue = activeSubs.reduce((sum, s) => {
    if (s.cadence === 'monthly') return sum + s.subtotal
    if (s.cadence === 'quarterly') return sum + s.subtotal / 3
    if (s.cadence === 'biannually') return sum + s.subtotal / 6
    if (s.cadence === 'annually') return sum + s.subtotal / 12
    return sum
  }, 0)

  const annualRecurringRevenue = monthlyRecurringRevenue * 12
  const avgContractValue = activeSubs.length > 0 ? Math.round(monthlyRecurringRevenue / activeSubs.length) : 0

  const filteredSubscriptions = subscriptions.filter((s) => {
    if (filterCadence !== 'all' && s.cadence !== filterCadence) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  const handleRunBillingCycle = () => {
    const generated = generateInvoicesForDueSubscriptions()
    if (generated.length > 0) {
      setRunMessage(
        `⚡ Billing Cycle Executed! Generated ${generated.length} invoices: ${generated.map((i) => i.number).join(', ')}`
      )
    } else {
      setRunMessage('All subscriptions are up-to-date! No pending billing cycles due today.')
    }
    setTimeout(() => setRunMessage(null), 6000)
  }

  const getCadenceBadge = (c: BillingCadence) => {
    if (c === 'monthly') return <span className="badge-sandbox badge-soft-primary">Monthly MRR</span>
    if (c === 'quarterly') return <span className="badge-sandbox badge-soft-purple">Quarterly</span>
    if (c === 'biannually') return <span className="badge-sandbox badge-soft-warning">Biannual</span>
    return <span className="badge-sandbox badge-soft-success">Annual ARR</span>
  }

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Recurring Invoicing & Subscriptions (MRR Engine)
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Automate retainer billing, software licenses, maintenance plans, and SLA contracts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleRunBillingCycle}
            className="btn-sandbox btn-sandbox-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
            }}
          >
            <Zap size={16} />
            <span>⚡ Run Next Billing Cycle</span>
          </button>

          <button
            onClick={() => {
              setSelectedSubscriptionToEdit(null)
              setIsModalOpen(true)
            }}
            className="btn-sandbox btn-sandbox-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
          >
            <Plus size={16} />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {runMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf6',
            borderRadius: '12px',
            color: '#8b5cf6',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{runMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Monthly Recurring Revenue</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(monthlyRecurringRevenue, selectedCurrency)}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}> /mo</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8b5cf6', marginTop: '0.35rem', fontWeight: 600 }}>
            {activeSubs.length} active recurring client contracts
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Annualized Run-Rate (ARR)</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>PREDICTABLE</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(annualRecurringRevenue, selectedCurrency)}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}> /yr</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Contracted annualized contract baseline
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Avg Contract Value (ACV)</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(63, 120, 224, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <RefreshCw size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(avgContractValue, selectedCurrency)}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}> /mo</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Average revenue per active subscriber
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterCadence}
            onChange={(e) => setFilterCadence(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Cadences</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
          Showing <strong>{filteredSubscriptions.length}</strong> subscription plans
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                SUBSCRIPTION / CLIENT
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                BILLING CADENCE
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                NEXT BILLING DATE
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                DISPATCH CHANNELS
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                RECURRING AMOUNT
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'center' }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub) => {
              const comp = companies.find((c) => c.id === sub.companyId)
              const ind = individuals.find((i) => i.id === sub.individualId)
              const clientName = comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Client'

              return (
                <tr
                  key={sub.id}
                  style={{
                    borderBottom: '1px solid var(--sb-border)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--sb-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--sb-heading)' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                      {sub.contractNumber} • {clientName}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    {getCadenceBadge(sub.cadence)}
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {sub.nextBillingDate}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>Started: {sub.startDate}</div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {sub.autoSendPeppol && (
                        <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>
                          Peppol Auto
                        </span>
                      )}
                      {sub.autoSendEmail && (
                        <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.65rem' }}>
                          Email Auto
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem', textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                      {formatCurrency(sub.total, selectedCurrency)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>
                      excl. VAT: {formatCurrency(sub.subtotal, selectedCurrency)}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedSubscriptionToEdit(sub)
                          setIsModalOpen(true)
                        }}
                        title="Edit Subscription"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--sb-body)',
                          padding: '0.3rem',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        title="Delete Subscription"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--sb-danger)',
                          padding: '0.3rem',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredSubscriptions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  <RefreshCw size={36} color="var(--sb-body)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No subscriptions found</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Set up monthly retainers or recurring maintenance plans to track MRR.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <SubscriptionModal
          subscriptionToEdit={selectedSubscriptionToEdit}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedSubscriptionToEdit(null)
          }}
        />
      )}
    </div>
  )
}
