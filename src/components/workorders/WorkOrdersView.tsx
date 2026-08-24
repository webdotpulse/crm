import React, { useState } from 'react'
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  FileText,
  PenTool,
  ArrowUpRight,
  UserCheck,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { WorkOrder, WorkOrderSignature } from '../../types'
import { WorkOrderModal } from './WorkOrderModal'
import { WorkOrderSignModal } from './WorkOrderSignModal'

export const WorkOrdersView: React.FC = () => {
  const {
    workOrders,
    deleteWorkOrder,
    signWorkOrder,
    convertWorkOrderToInvoice,
    setCurrentView,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedWoForEdit, setSelectedWoForEdit] = useState<WorkOrder | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [selectedWoForSign, setSelectedWoForSign] = useState<WorkOrder | null>(null)
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState<string | null>(null)

  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter !== 'all' && wo.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        wo.number.toLowerCase().includes(q) ||
        wo.title.toLowerCase().includes(q) ||
        wo.city.toLowerCase().includes(q) ||
        wo.technicianName.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleSign = (signature: WorkOrderSignature) => {
    if (selectedWoForSign) {
      signWorkOrder(selectedWoForSign.id, signature)
      setSelectedWoForSign(null)
    }
  }

  const handleConvertToInvoice = (woId: string) => {
    const invId = convertWorkOrderToInvoice(woId)
    if (invId) {
      setInvoiceSuccessMsg(`🎉 Work order converted to commercial invoice! Ready to dispatch via Peppol or PDF.`)
      setTimeout(() => setInvoiceSuccessMsg(null), 5000)
    }
  }

  const scheduledCount = workOrders.filter((w) => w.status === 'scheduled').length
  const inProgressCount = workOrders.filter((w) => w.status === 'in_progress').length
  const signedCount = workOrders.filter((w) => w.status === 'signed').length
  const invoicedCount = workOrders.filter((w) => w.status === 'invoiced').length

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
              FIELD SERVICE & OPERATIONS
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{workOrders.length} Digital Work Orders</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Digitale Werkbonnen & Field Dispatch
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Mobile technician time recording, stock consumption, on-glass customer signature, and instant Peppol billing
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="btn-sandbox btn-sandbox-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>New Digital Work Order</span>
        </button>
      </div>

      {invoiceSuccessMsg && (
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
          <span>{invoiceSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Scheduled / In Route</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            {scheduledCount + inProgressCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}>Jobs</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#3f78e0', marginTop: '0.35rem', fontWeight: 600 }}>
            {inProgressCount} active on-site now
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Signed & Ready to Bill</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {signedCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}>Approved</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Customer on-glass signature confirmed
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Invoiced & Processed</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-primary)', marginTop: '0.25rem' }}>
            {invoicedCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--sb-body)' }}>Invoiced</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Converted directly into sales ledger
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
            onClick={() => setStatusFilter('all')}
            className={`btn-sandbox ${statusFilter === 'all' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            All Work Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`btn-sandbox ${statusFilter === 'scheduled' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`btn-sandbox ${statusFilter === 'in_progress' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('signed')}
            className={`btn-sandbox ${statusFilter === 'signed' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Signed ({signedCount})
          </button>
          <button
            onClick={() => setStatusFilter('invoiced')}
            className={`btn-sandbox ${statusFilter === 'invoiced' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Invoiced ({invoicedCount})
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
          <input
            type="text"
            placeholder="Search work order or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Grid of Work Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {filteredOrders.map((wo) => {
          const totalLaborHours = wo.laborItems.reduce((sum, l) => sum + l.hours, 0)
          const totalLaborCost = wo.laborItems.reduce((sum, l) => sum + l.hours * l.hourlyRate, 0)
          const totalMaterialCost = wo.materialItems.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0)
          const totalTravelCost = wo.travelKilometers * wo.travelRatePerKm
          const totalEur = totalLaborCost + totalMaterialCost + totalTravelCost

          return (
            <div
              key={wo.id}
              className="card-sandbox"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                        {wo.number}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>• {wo.scheduledDate}</span>
                    </div>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      {wo.title}
                    </h3>
                  </div>

                  <span
                    className={`badge-sandbox badge-soft-${
                      wo.status === 'signed'
                        ? 'success'
                        : wo.status === 'invoiced'
                        ? 'primary'
                        : wo.status === 'in_progress'
                        ? 'warning'
                        : 'primary'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {wo.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Location & Technician */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="var(--sb-primary)" />
                    <span>{wo.address}, {wo.postalCode} {wo.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wrench size={14} color="#f59e0b" />
                    <span>{wo.technicianName} ({wo.scheduledTime || 'Scheduled'})</span>
                  </div>
                </div>

                {/* Breakdown Summary */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--sb-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--sb-border)',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--sb-body)' }}>Labor: </span>
                    <strong style={{ color: 'var(--sb-heading)' }}>{totalLaborHours}h</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--sb-body)' }}>Parts: </span>
                    <strong style={{ color: 'var(--sb-heading)' }}>{wo.materialItems.length} items</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--sb-body)' }}>Travel: </span>
                    <strong style={{ color: 'var(--sb-heading)' }}>{wo.travelKilometers} km</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--sb-body)' }}>Total: </span>
                    <strong style={{ color: 'var(--sb-heading)' }}>€{totalEur.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Signature status */}
                {wo.signature && (
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', fontSize: '0.72rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                    <CheckCircle2 size={14} />
                    <span>Signed by {wo.signature.signedBy} ({wo.signature.signedAt.slice(0, 10)})</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedWoForEdit(wo)}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                >
                  Edit / Details
                </button>

                {!wo.signature && wo.status !== 'invoiced' && (
                  <button
                    onClick={() => setSelectedWoForSign(wo)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                  >
                    <PenTool size={13} />
                    <span>Sign on Glass</span>
                  </button>
                )}

                {wo.status === 'signed' && !wo.invoiceId && (
                  <button
                    onClick={() => handleConvertToInvoice(wo.id)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  >
                    <Zap size={13} />
                    <span>⚡ Convert to Invoice</span>
                  </button>
                )}

                {wo.invoiceId && (
                  <button
                    onClick={() => setCurrentView('invoices')}
                    className="btn-sandbox btn-sandbox-outline"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: '#3f78e0' }}
                  >
                    View Invoice ➔
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Create/Edit */}
      {(isCreatingNew || selectedWoForEdit) && (
        <WorkOrderModal
          workOrder={selectedWoForEdit}
          onClose={() => {
            setIsCreatingNew(false)
            setSelectedWoForEdit(null)
          }}
        />
      )}

      {/* Modal: Sign on Glass */}
      {selectedWoForSign && (
        <WorkOrderSignModal
          workOrder={selectedWoForSign}
          onClose={() => setSelectedWoForSign(null)}
          onSign={handleSign}
        />
      )}
    </div>
  )
}
