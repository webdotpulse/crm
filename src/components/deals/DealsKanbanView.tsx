import React, { useState } from 'react'
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Building2,
  FileSignature,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { Deal, DealStage } from '../../types'
import { useApp } from '../../context/AppContext'
import { DealModal } from './DealModal'

interface DealsKanbanViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
  onGenerateQuoteFromDeal: (deal: Deal) => void
}

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead In', color: '#60697b' },
  { id: 'qualified', label: 'Qualified', color: '#3f78e0' },
  { id: 'meeting', label: 'Meeting', color: '#54a8c7' },
  { id: 'proposal', label: 'Proposal Sent', color: '#605dba' },
  { id: 'negotiation', label: 'Negotiation', color: '#fab758' },
  { id: 'won', label: 'Closed Won 🎉', color: '#38b995' },
  { id: 'lost', label: 'Lost', color: '#e2626b' },
]

export const DealsKanbanView: React.FC<DealsKanbanViewProps> = ({
  onOpenQuickModal,
  onGenerateQuoteFromDeal,
}) => {
  const { deals, companies, moveDealStage, deleteDeal } = useApp()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  const activeDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const totalActiveValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const weightedValue = activeDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0)
  const wonValue = deals.filter((d) => d.stage === 'won').reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Sales Pipeline & Deals</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Track sales opportunities from qualification to won quotations and delivery kickoff.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDeal(null)
            setIsModalOpen(true)
          }}
          className="btn-sandbox btn-sandbox-primary"
        >
          <Plus size={16} />
          <span>New Deal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>ACTIVE PIPELINE</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            €{totalActiveValue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>{activeDeals.length} active opportunities</span>
        </div>

        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>WEIGHTED FORECAST</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-purple)' }}>
            €{Math.round(weightedValue).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>probability-adjusted return</span>
        </div>

        <div className="card-sandbox" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-body)' }}>CLOSED WON</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sb-success)' }}>
            €{wonValue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>{deals.filter((d) => d.stage === 'won').length} contracts closed</span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board">
        {STAGES.map((col) => {
          const colDeals = deals.filter((d) => d.stage === col.id)
          const colTotal = colDeals.reduce((sum, d) => sum + d.value, 0)

          return (
            <div key={col.id} className="kanban-col">
              {/* Column Header */}
              <div className="kanban-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: col.color,
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--sb-heading)' }}>
                    {col.label}
                  </span>
                  <span className="badge-soft badge-soft-dark" style={{ fontSize: '0.7rem' }}>
                    {colDeals.length}
                  </span>
                </div>

                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-body)' }}>
                  €{colTotal >= 1000 ? `${(colTotal / 1000).toFixed(0)}k` : colTotal}
                </span>
              </div>

              {/* Column Cards */}
              <div className="kanban-col-body">
                {colDeals.map((deal) => {
                  const comp = companies.find((c) => c.id === deal.companyId)
                  return (
                    <div key={deal.id} className="kanban-card">
                      {/* Company & Deal Title */}
                      <div style={{ marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                          <Building2 size={12} />
                          <span>{comp?.name || 'Unknown Company'}</span>
                        </div>
                        <h4 style={{ fontSize: '0.92rem', color: 'var(--sb-heading)', marginTop: '0.15rem' }}>
                          {deal.title}
                        </h4>
                      </div>

                      {/* Value & Probability */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.6rem 0' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                          €{deal.value.toLocaleString()}
                        </span>
                        <span
                          className={`badge-soft badge-soft-${
                            deal.probability >= 80 ? 'success' : deal.probability >= 50 ? 'warning' : 'primary'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {deal.probability}% Prob
                        </span>
                      </div>

                      {/* Close Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--sb-body-subtle)', marginBottom: '0.65rem' }}>
                        <Calendar size={12} />
                        <span>Close: {deal.expectedCloseDate}</span>
                      </div>

                      {/* Card Actions Toolbar */}
                      <div
                        style={{
                          borderTop: '1px solid var(--sb-border)',
                          paddingTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.35rem',
                        }}
                      >
                        {/* Quick Stage Mover */}
                        <select
                          value={deal.stage}
                          onChange={(e) => moveDealStage(deal.id, e.target.value as DealStage)}
                          className="form-select-sandbox"
                          style={{
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.72rem',
                            height: '26px',
                            width: 'auto',
                            flex: 1,
                          }}
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move: {s.label}
                            </option>
                          ))}
                        </select>

                        {/* Convert to Quote Action */}
                        <button
                          onClick={() => onGenerateQuoteFromDeal(deal)}
                          className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', height: '26px' }}
                          title="Generate Quotation for Client"
                        >
                          <FileSignature size={13} />
                          <span>Quote</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingDeal(deal)
                            setIsModalOpen(true)
                          }}
                          className="btn-sandbox btn-icon btn-sandbox-secondary"
                          style={{ width: '26px', height: '26px' }}
                          title="Edit Deal"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <DealModal deal={editingDeal} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
