import React, { useState } from 'react'
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  AlertTriangle,
  Award,
  Layers,
  FileSpreadsheet,
  Check,
  X,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { LeaveRequest, LeaveType, StaffMemberCapacity } from '../../types'
import { formatCurrency } from '../../services/currencyService'

export const PulseHRView: React.FC = () => {
  const {
    staffCapacities,
    leaveRequests,
    addLeaveRequest,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    publicHolidays,
    reimbursementBatches,
    generateReimbursementBatch,
    expenses,
    mileageTrips,
    selectedCurrency,
    currentUser,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'capacity' | 'leave' | 'reimbursements'>('capacity')
  const [selectedWeek, setSelectedWeek] = useState<number>(34)

  // Leave Request Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState(staffCapacities[0]?.id || '')
  const [leaveType, setLeaveType] = useState<LeaveType>('vacation')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0])
  const [leaveReason, setLeaveReason] = useState('')

  // Batch Generation State
  const [batchCreatedNotice, setBatchCreatedNotice] = useState<string | null>(null)

  // Capacity calculations
  const totalWeeklyContractHours = staffCapacities.reduce((sum, s) => sum + s.weeklyContractHours, 0)
  const totalBookedHours = staffCapacities.reduce((sum, s) => {
    const alloc = s.weeklyAllocations.find((w) => w.weekNumber === selectedWeek)
    return sum + (alloc?.bookedHours || 0)
  }, 0)
  const overallTeamUtilization = Math.round((totalBookedHours / (totalWeeklyContractHours || 1)) * 100)

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const staff = staffCapacities.find((s) => s.id === selectedStaffId)
    if (!staff) return

    const d1 = new Date(startDate)
    const d2 = new Date(endDate)
    const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1)

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      leaveType,
      startDate,
      endDate,
      totalDays: diffDays,
      status: 'pending',
      reason: leaveReason || undefined,
      createdAt: new Date().toISOString(),
    }

    addLeaveRequest(newRequest)
    setIsLeaveModalOpen(false)
    setLeaveReason('')
  }

  const handleGenerateBatch = () => {
    const pendingExpenses = expenses.filter((e) => e.status === 'pending').map((e) => e.id)
    const pendingTrips = mileageTrips.filter((m) => !m.reimbursed).map((m) => m.id)

    const batch = generateReimbursementBatch(pendingExpenses, pendingTrips)
    setBatchCreatedNotice(`Generated SEPA Payout Run ${batch.batchNumber} for €${batch.totalAmountEur.toFixed(2)}`)
    setTimeout(() => setBatchCreatedNotice(null), 4500)
  }

  const handleDownloadSepaXml = (xmlContent?: string, batchNum?: string) => {
    if (!xmlContent) return
    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SEPA_Staff_Reimbursement_${batchNum || 'Batch'}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

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
                backgroundColor: 'rgba(56, 185, 149, 0.12)',
                color: '#38b995',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              PulseHR: Capacity & Leave Management
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            Team Resource Capacity Allocation, European Public Holidays, and SEPA Reimbursement Runs.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--sb-surface)', padding: '0.3rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`btn-sandbox ${activeTab === 'capacity' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Clock size={15} /> Capacity Heatmap
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`btn-sandbox ${activeTab === 'leave' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Calendar size={15} /> Time-Off & Holidays
          </button>
          <button
            onClick={() => setActiveTab('reimbursements')}
            className={`btn-sandbox ${activeTab === 'reimbursements' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <FileSpreadsheet size={15} /> SEPA Reimbursements
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Team Staff Count</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
            {staffCapacities.length} Members
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', marginTop: '0.15rem' }}>
            {totalWeeklyContractHours} Contract Hours/Week
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Week {selectedWeek} Utilization</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: overallTeamUtilization > 95 ? '#e2626b' : '#38b995', marginTop: '0.2rem' }}>
            {overallTeamUtilization}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
            {totalBookedHours} hrs booked / {totalWeeklyContractHours} hrs capacity
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Pending Leave Requests</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fab758', marginTop: '0.2rem' }}>
            {leaveRequests.filter((lr) => lr.status === 'pending').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>Awaiting manager review</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Next Public Holiday</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.35rem' }}>
            {publicHolidays[7]?.name || 'All Saints Day'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
            {publicHolidays[7]?.date || '2026-11-01'} (Belgium)
          </div>
        </div>
      </div>

      {batchCreatedNotice && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(56, 185, 149, 0.15)',
            color: 'var(--sb-success-text)',
            borderRadius: 'var(--sb-radius)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{batchCreatedNotice}</span>
        </div>
      )}

      {/* TAB 1: CAPACITY HEATMAP */}
      {activeTab === 'capacity' && (
        <div>
          {/* Week Selector Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', backgroundColor: 'var(--sb-bg)', padding: '0.75rem 1.25rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--sb-heading)' }}>Select Allocation Week:</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {[34, 35, 36, 37].map((wk) => (
                  <button
                    key={wk}
                    onClick={() => setSelectedWeek(wk)}
                    className={`btn-sandbox ${selectedWeek === wk ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', fontWeight: 700 }}
                  >
                    Week {wk} (2026)
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'var(--sb-body)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#38b995', borderRadius: '2px' }} /> Optimal (75-90%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#fab758', borderRadius: '2px' }} /> High Load (90-100%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#e2626b', borderRadius: '2px' }} /> Overloaded (&gt;100%)
              </span>
            </div>
          </div>

          {/* Team Capacity Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {staffCapacities.map((staff) => {
              const alloc = staff.weeklyAllocations.find((w) => w.weekNumber === selectedWeek)
              const booked = alloc?.bookedHours || 0
              const available = staff.weeklyContractHours - booked
              const pct = Math.round((booked / staff.weeklyContractHours) * 100)

              return (
                <div key={staff.id} className="card-sandbox" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--sb-primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                        }}
                      >
                        {staff.name.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--sb-heading)' }}>
                          {staff.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                          {staff.role} • {staff.department} • Cost: €{staff.hourlyCostRate}/h • Bill: €{staff.hourlyBillRate}/h
                        </div>
                      </div>
                    </div>

                    {/* Booked / Available Stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                          {booked}h / {staff.weeklyContractHours}h
                        </div>
                        <div style={{ fontSize: '0.72rem', color: available < 0 ? '#e2626b' : 'var(--sb-body)' }}>
                          {available >= 0 ? `${available}h available` : `${Math.abs(available)}h Overbooked!`}
                        </div>
                      </div>

                      <span
                        className={`badge-sandbox badge-soft-${
                          pct > 100 ? 'danger' : pct >= 90 ? 'warning' : pct >= 70 ? 'success' : 'primary'
                        }`}
                        style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.35rem 0.75rem' }}
                      >
                        {pct}% Load
                      </span>
                    </div>
                  </div>

                  {/* Progress Utilization Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--sb-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        height: '100%',
                        backgroundColor: pct > 100 ? '#e2626b' : pct >= 90 ? '#fab758' : '#38b995',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  {/* Project Breakdown Tags */}
                  {alloc?.projectBreakdown && alloc.projectBreakdown.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sb-body)' }}>Assigned Projects:</span>
                      {alloc.projectBreakdown.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--sb-bg)',
                            border: '1px solid var(--sb-border)',
                            color: 'var(--sb-heading)',
                          }}
                        >
                          {p.projectTitle}: <strong>{p.hours}h</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE & PUBLIC HOLIDAYS */}
      {activeTab === 'leave' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.75rem' }}>
          {/* Left Column: Leave Requests Manager */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Staff Leave & Vacation Requests
              </h3>

              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="btn-sandbox btn-sandbox-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', fontWeight: 800 }}
              >
                <Plus size={14} /> Request Time-Off
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {leaveRequests.map((lr) => (
                <div key={lr.id} className="card-sandbox" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--sb-heading)' }}>{lr.staffName}</strong>
                      <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                        {lr.leaveType}
                      </span>
                      <span
                        className={`badge-sandbox badge-soft-${
                          lr.status === 'approved' ? 'success' : lr.status === 'rejected' ? 'danger' : 'warning'
                        }`}
                        style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}
                      >
                        {lr.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                      Dates: <strong>{lr.startDate}</strong> to <strong>{lr.endDate}</strong> ({lr.totalDays} business days)
                    </div>
                    {lr.reason && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                        "{lr.reason}"
                      </div>
                    )}
                  </div>

                  {/* Manager Approval Buttons */}
                  {lr.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <button
                        onClick={() => updateLeaveRequestStatus(lr.id, 'approved')}
                        className="btn-sandbox btn-sandbox-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => updateLeaveRequestStatus(lr.id, 'rejected')}
                        className="btn-sandbox btn-sandbox-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: 'var(--sb-danger)' }}
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Public Holidays Calendar */}
          <div className="card-sandbox" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              🇧🇪 Belgian Public Holidays 2026
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {publicHolidays.map((h, hIdx) => (
                <div
                  key={hIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.75rem',
                    backgroundColor: 'var(--sb-bg)',
                    borderRadius: 'var(--sb-radius)',
                    fontSize: '0.78rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>{h.name}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--sb-body)' }}>{h.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEPA REIMBURSEMENT RUNS */}
      {activeTab === 'reimbursements' && (
        <div>
          <div
            className="card-sandbox"
            style={{
              padding: '1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundColor: 'rgba(56, 185, 149, 0.05)',
              border: '1px solid rgba(56, 185, 149, 0.25)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
                Automated Employee Payout Runs
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
                Batch Expense & Mileage Reimbursements (SEPA pain.001)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Bundles approved employee out-of-pocket expenses and statutory vehicle mileage into direct credit transfers.
              </div>
            </div>

            <button
              onClick={handleGenerateBatch}
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.6rem 1.25rem', fontWeight: 800 }}
            >
              ⚡ Generate Payout Batch Now
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reimbursementBatches.map((batch) => (
              <div key={batch.id} className="card-sandbox" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--sb-border)', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                        {batch.batchNumber}
                      </h4>
                      <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                        {batch.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                      Created: {batch.createdDate} • {batch.claimsCount} Claims Processed
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                        {formatCurrency(batch.totalAmountEur, selectedCurrency)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>Total Payout</div>
                    </div>

                    <button
                      onClick={() => handleDownloadSepaXml(batch.sepaXml, batch.batchNumber)}
                      className="btn-sandbox btn-sandbox-outline"
                      style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
                    >
                      <Download size={14} /> Download pain.001 XML
                    </button>
                  </div>
                </div>

                {/* Staff breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {batch.staffBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.85rem',
                        backgroundColor: 'var(--sb-bg)',
                        borderRadius: 'var(--sb-radius)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--sb-heading)' }}>{item.staffName}</strong>
                        <span style={{ color: 'var(--sb-body)', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                          {item.iban}
                        </span>
                      </div>
                      <strong style={{ color: 'var(--sb-primary)' }}>
                        {formatCurrency(item.amountEur, selectedCurrency)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {isLeaveModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card-sandbox"
            style={{
              width: '480px',
              maxWidth: '100%',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius-lg)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Submit Time-Off Request
              </h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Team Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                >
                  {staffCapacities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                >
                  <option value="vacation">Statutory Annual Leave (Vakantie)</option>
                  <option value="sick">Sick Leave (Ziekte)</option>
                  <option value="training">Training & Certification</option>
                  <option value="parental">Parental Leave</option>
                  <option value="special">Special Leave / Force Majeure</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Reason / Handover Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Summer holiday in France, emergency contact available."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn-sandbox btn-sandbox-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ fontWeight: 800 }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default PulseHRView
