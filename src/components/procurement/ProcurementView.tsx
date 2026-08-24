import React, { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Truck,
  ShieldCheck,
  Calendar,
  Check,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PurchaseOrder, ThreeWayMatchResult } from '../../types'
import { evaluateThreeWayMatch } from '../../services/procurementService'
import { PurchaseOrderModal } from './PurchaseOrderModal'

export const ProcurementView: React.FC = () => {
  const { purchaseOrders, expenses, deletePurchaseOrder, receivePurchaseOrderItems } = useApp()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPoForEdit, setSelectedPoForEdit] = useState<PurchaseOrder | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [selectedPoForMatch, setSelectedPoForMatch] = useState<PurchaseOrder | null>(null)

  const filteredOrders = purchaseOrders.filter((po) => {
    if (statusFilter !== 'all' && po.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        po.number.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q)
      )
    }
    return true
  })

  const totalPoValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0)
  const fullyReceivedCount = purchaseOrders.filter((po) => po.status === 'received' || po.status === 'matched').length
  const pendingReceiptCount = purchaseOrders.filter((po) => po.status === 'issued' || po.status === 'partially_received').length

  const handleQuickReceiveAll = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId)
    if (!po) return
    const allReceipts = po.items.map((i) => ({ itemId: i.id, quantityReceived: i.quantityOrdered }))
    receivePurchaseOrderItems(poId, allReceipts)
  }

  const getMatchResult = (po: PurchaseOrder): ThreeWayMatchResult => {
    const matchingExpense = expenses.find((e) => e.id === po.matchedExpenseId) || expenses.find((e) => e.supplierName === po.supplierName)
    return evaluateThreeWayMatch(po, matchingExpense)
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
              SUPPLIER PROCUREMENT
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{purchaseOrders.length} Purchase Orders (Bestelbonnen)</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Supplier Purchase Orders & 3-Way Match
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Procurement lifecycle: Purchase Order ➔ Goods Receipt Note ➔ Inbound Peppol Invoice Validation
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="btn-sandbox btn-sandbox-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
        >
          <Plus size={16} />
          <span>New Purchase Order (Bestelbon)</span>
        </button>
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
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Total Ordered Volume</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.25rem' }}>
            €{totalPoValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#3f78e0', marginTop: '0.35rem', fontWeight: 600 }}>
            {purchaseOrders.length} supplier orders placed
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Warehouse Deliveries Pending</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {pendingReceiptCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sb-body)' }}>Shipments</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            Awaiting supplier fulfillment
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>3-Way Verified for Payment</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {fullyReceivedCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--sb-body)' }}>Matched</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            ✓ Verified PO = Delivery = Invoice
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
            All Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('issued')}
            className={`btn-sandbox ${statusFilter === 'issued' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Issued / In Route
          </button>
          <button
            onClick={() => setStatusFilter('partially_received')}
            className={`btn-sandbox ${statusFilter === 'partially_received' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            Partially Received
          </button>
          <button
            onClick={() => setStatusFilter('matched')}
            className={`btn-sandbox ${statusFilter === 'matched' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            3-Way Matched
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
          <input
            type="text"
            placeholder="Search PO or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Purchase Orders List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {filteredOrders.map((po) => {
          const matchResult = getMatchResult(po)
          const totalItemsOrdered = po.items.reduce((sum, i) => sum + i.quantityOrdered, 0)
          const totalItemsReceived = po.items.reduce((sum, i) => sum + i.quantityReceived, 0)

          return (
            <div
              key={po.id}
              className="card-sandbox"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                      {po.number}
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      {po.supplierName}
                    </h3>
                  </div>

                  <span
                    className={`badge-sandbox badge-soft-${
                      po.status === 'matched' ? 'success' : po.status === 'received' ? 'primary' : 'warning'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {po.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                  <span>📅 Ordered: {po.orderDate}</span>
                  <span>🚚 Expected: {po.expectedDeliveryDate}</span>
                </div>

                {/* Items breakdown */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--sb-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--sb-border)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sb-heading)', marginBottom: '0.35rem' }}>
                    Warehouse Check-In: {totalItemsReceived} of {totalItemsOrdered} units received
                  </div>
                  {po.items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                      <span>• {it.description}</span>
                      <strong style={{ color: it.quantityReceived >= it.quantityOrdered ? '#10b981' : '#f59e0b' }}>
                        {it.quantityReceived}/{it.quantityOrdered} {it.unit}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* 3-Way Match Status Banner */}
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: matchResult.isMatched ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${matchResult.isMatched ? '#10b981' : '#f59e0b'}`,
                    marginBottom: '1rem',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color={matchResult.isMatched ? '#10b981' : '#f59e0b'} />
                    <span style={{ fontWeight: 700, color: matchResult.isMatched ? '#10b981' : '#f59e0b' }}>
                      {matchResult.isMatched ? '3-Way Match Validated (PO = Receipt = Invoice)' : '3-Way Match Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  €{po.total.toFixed(2)}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {totalItemsReceived < totalItemsOrdered && (
                    <button
                      onClick={() => handleQuickReceiveAll(po.id)}
                      className="btn-sandbox btn-sandbox-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Check size={12} />
                      <span>Receive All</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPoForEdit(po)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                  >
                    Edit PO
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isCreatingNew && <PurchaseOrderModal onClose={() => setIsCreatingNew(false)} />}
      {selectedPoForEdit && (
        <PurchaseOrderModal
          purchaseOrder={selectedPoForEdit}
          onClose={() => setSelectedPoForEdit(null)}
        />
      )}
    </div>
  )
}
