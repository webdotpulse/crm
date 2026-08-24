import React, { useState } from 'react'
import {
  Car,
  Bike,
  Plus,
  Search,
  Trash2,
  Download,
  CheckCircle2,
  Calendar,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MileageTrip } from '../../types'
import { MileageModal } from './MileageModal'

export const MileageView: React.FC = () => {
  const { mileageTrips, deleteMileageTrip, addExpense, activeLegalEntityId } = useApp()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)

  const filteredTrips = mileageTrips.filter((trip) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        trip.driverName.toLowerCase().includes(q) ||
        trip.purpose.toLowerCase().includes(q) ||
        trip.destinationAddress.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalKm = mileageTrips.reduce((sum, t) => sum + t.distanceKm, 0)
  const totalAllowance = mileageTrips.reduce((sum, t) => sum + t.totalAllowanceEur, 0)
  const unreimbursedAllowance = mileageTrips
    .filter((t) => !t.reimbursed)
    .reduce((sum, t) => sum + t.totalAllowanceEur, 0)

  const handleExportToExpense = () => {
    if (unreimbursedAllowance <= 0) {
      setExportFeedback('All logged trips have already been reimbursed.')
      setTimeout(() => setExportFeedback(null), 3000)
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    addExpense({
      id: `exp-mileage-${Date.now()}`,
      legalEntityId: activeLegalEntityId,
      number: `KILOMETER-${today.slice(0, 7)}`,
      supplierName: 'Staff Mileage Claim (FOD Financiën Rate)',
      invoiceDate: today,
      dueDate: today,
      category: 'travel_meals',
      subtotal: Math.round(unreimbursedAllowance * 100) / 100,
      vatTotal: 0,
      total: Math.round(unreimbursedAllowance * 100) / 100,
      currency: 'EUR',
      status: 'approved',
      notes: `Consolidated mileage deduction claim for ${mileageTrips.filter((t) => !t.reimbursed).length} trips.`,
      createdAt: new Date().toISOString(),
    })

    setExportFeedback(`✓ €${unreimbursedAllowance.toFixed(2)} added to Accounts Payable Expenses under Travel & Vehicle deductions.`)
    setTimeout(() => setExportFeedback(null), 5000)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
              RITTENADMINISTRATIE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>FOD Financiën Compliant (€0.4415/km)</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Kilometerregistratie & Vehicle Mileage Log
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Track business travel routes, calculate official Belgian tax allowances, and post claims to P&L
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportToExpense}
            className="btn-sandbox btn-sandbox-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.6rem 1.25rem' }}
          >
            <FileSpreadsheet size={15} />
            <span>Export Claim to Expenses</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-sandbox btn-sandbox-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
          >
            <Plus size={16} />
            <span>Log Business Trip</span>
          </button>
        </div>
      </div>

      {exportFeedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            color: '#10b981',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{exportFeedback}</span>
        </div>
      )}

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
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Total Logged Distance</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            {totalKm.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sb-body)' }}>km</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#3f78e0', marginTop: '0.35rem', fontWeight: 600 }}>
            {mileageTrips.length} business trips recorded
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Total Fiscal Allowance</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            €{totalAllowance.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Deductible operational expenditure
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Pending Reimbursement</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            €{unreimbursedAllowance.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.35rem', fontWeight: 600 }}>
            Ready for payroll / P&L export
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--sb-bg)', borderBottom: '1px solid var(--sb-border)' }}>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>DATE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>DRIVER</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>PURPOSE / CLIENT</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>ROUTE (ORIGIN ➔ DESTINATION)</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>VEHICLE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'right' }}>DISTANCE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'right' }}>ALLOWANCE</th>
              <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--sb-border)', fontSize: '0.82rem' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--sb-body)' }}>
                  {t.date}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  {t.driverName}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>{t.purpose}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--sb-body)', fontSize: '0.78rem' }}>
                  <div>📍 {t.originAddress}</div>
                  <div style={{ color: 'var(--sb-primary)' }}>➔ {t.destinationAddress}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                    {t.vehicleType === 'bicycle' ? '🚲 Fiets (€0.35/km)' : '🚗 Private Car (€0.4415/km)'}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                  {t.distanceKm} km {t.isRoundTrip && <span style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>(2-way)</span>}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                  €{t.totalAllowanceEur.toFixed(2)}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => deleteMileageTrip(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                    title="Delete entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredTrips.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  No mileage trips recorded. Click "Log Business Trip" to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && <MileageModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
