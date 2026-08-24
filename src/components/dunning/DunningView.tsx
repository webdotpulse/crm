import React, { useState } from 'react'
import {
  AlertTriangle,
  Send,
  Scale,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Clock,
  ArrowUpRight,
  Download,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { DunningCase, Invoice, DunningStage } from '../../types'
import { calculateDunningEscalation } from '../../services/dunningService'
import { DunningNoticeModal } from './DunningNoticeModal'

export const DunningView: React.FC = () => {
  const { invoices, companies, individuals, getClientDisplayName } = useApp()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<DunningCase | null>(null)

  // Compute active dunning cases from overdue invoices
  const dunningCases: DunningCase[] = invoices
    .filter((inv) => {
      const isUnpaid = inv.status === 'issued' || inv.status === 'overdue'
      return isUnpaid
    })
    .map((inv) => {
      const clientName = getClientDisplayName(inv.clientType, inv.companyId || inv.individualId)
      const company = companies.find((c) => c.id === inv.companyId)
      const individual = individuals.find((i) => i.id === inv.individualId)
      const clientEmail = company?.email || individual?.email || 'billing@client.be'

      return calculateDunningEscalation(inv, clientName, clientEmail)
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const filteredCases = dunningCases.filter((c) => {
    if (stageFilter !== 'all' && c.currentStage !== stageFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        c.invoiceNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.clientEmail.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalOverduePrincipal = dunningCases.reduce((sum, c) => sum + c.balanceDue, 0)
  const totalStatutoryFees = dunningCases.reduce((sum, c) => sum + c.totalStatutoryFees, 0)
  const totalInterest = dunningCases.reduce((sum, c) => sum + c.totalInterest, 0)
  const totalClaim = totalOverduePrincipal + totalStatutoryFees + totalInterest

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
            <span className="badge-sandbox badge-soft-danger" style={{ fontSize: '0.7rem' }}>
              DEBT COLLECTION & AANMANINGEN
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>Book XIX Code of Economic Law</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Automated Dunning & Claims Escalation
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            3-Tier legal escalation, statutory €40 recovery compensation, and 1-click Bailiff recovery export
          </p>
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
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Overdue Principal Balance</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            €{totalOverduePrincipal.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-danger)', marginTop: '0.35rem', fontWeight: 600 }}>
            {dunningCases.length} overdue invoices in tracking
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Statutory €40 Recovery Fees</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            €{totalStatutoryFees.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Legal recovery compensation applied
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Statutory Late Interest (12.5%)</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
            €{totalInterest.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Calculated pro-rata temporis
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>Total Enforceable Claim</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--sb-danger)', marginTop: '0.25rem' }}>
            €{totalClaim.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Principal + Fees + Interest
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStageFilter('all')}
            className={`btn-sandbox ${stageFilter === 'all' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            All Overdue ({dunningCases.length})
          </button>
          <button
            onClick={() => setStageFilter('reminder_1')}
            className={`btn-sandbox ${stageFilter === 'reminder_1' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Stage 1: Friendly Reminder
          </button>
          <button
            onClick={() => setStageFilter('formal_notice')}
            className={`btn-sandbox ${stageFilter === 'formal_notice' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Stage 2: Notice of Default (+€40)
          </button>
          <button
            onClick={() => setStageFilter('bailiff_notice')}
            className={`btn-sandbox ${stageFilter === 'bailiff_notice' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Stage 3: Pre-Legal Bailiff
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
          <input
            type="text"
            placeholder="Search overdue invoice or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Overdue Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--sb-bg)', borderBottom: '1px solid var(--sb-border)' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>INVOICE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>DEBTOR / CLIENT</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>DUE DATE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>OVERDUE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>ESCALATION STAGE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'right' }}>PRINCIPAL</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'right' }}>TOTAL CLAIM</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.invoiceId} style={{ borderBottom: '1px solid var(--sb-border)', fontSize: '0.82rem' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  {c.invoiceNumber}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{c.clientName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>{c.clientEmail}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--sb-body)' }}>
                  {c.dueDate}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    className={`badge-sandbox badge-soft-${c.daysOverdue >= 30 ? 'danger' : c.daysOverdue >= 14 ? 'warning' : 'primary'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {c.daysOverdue} days
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  {c.currentStage === 'reminder_1' && (
                    <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                      1. Friendly Reminder
                    </span>
                  )}
                  {c.currentStage === 'formal_notice' && (
                    <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.7rem' }}>
                      2. Notice of Default (+€40)
                    </span>
                  )}
                  {c.currentStage === 'bailiff_notice' && (
                    <span className="badge-sandbox badge-soft-danger" style={{ fontSize: '0.7rem' }}>
                      3. Pre-Legal Bailiff
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  €{c.balanceDue.toFixed(2)}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>
                  €{c.totalClaim.toFixed(2)}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => setSelectedCaseForModal(c)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: c.currentStage === 'bailiff_notice' ? '#dc2626' : undefined,
                      borderColor: c.currentStage === 'bailiff_notice' ? '#dc2626' : undefined,
                    }}
                  >
                    <Send size={13} />
                    <span>Manage Escalation</span>
                  </button>
                </td>
              </tr>
            ))}

            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  ✓ No overdue claims found in this category. All invoices paid on time!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dunning Notice Modal */}
      {selectedCaseForModal && (
        <DunningNoticeModal
          dunningCase={selectedCaseForModal}
          onClose={() => setSelectedCaseForModal(null)}
        />
      )}
    </div>
  )
}
