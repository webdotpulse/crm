import React, { useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Package,
  Wrench,
  Car,
  Camera,
  MapPin,
  Calendar,
  Clock,
  User,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  WorkOrder,
  WorkOrderLaborItem,
  WorkOrderMaterialItem,
  WorkOrderStatus,
  ClientType,
} from '../../types'

interface WorkOrderModalProps {
  workOrder?: WorkOrder | null
  onClose: () => void
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ workOrder, onClose }) => {
  const {
    companies,
    individuals,
    products,
    addWorkOrder,
    updateWorkOrder,
  } = useApp()

  const [title, setTitle] = useState<string>(workOrder?.title || '')
  const [clientType, setClientType] = useState<ClientType>(workOrder?.clientType || 'company')
  const [companyId, setCompanyId] = useState<string>(workOrder?.companyId || (companies[0]?.id || ''))
  const [individualId, setIndividualId] = useState<string>(workOrder?.individualId || (individuals[0]?.id || ''))
  const [address, setAddress] = useState<string>(workOrder?.address || 'Technologielaan 15')
  const [city, setCity] = useState<string>(workOrder?.city || 'Leuven')
  const [postalCode, setPostalCode] = useState<string>(workOrder?.postalCode || '3001')
  const [scheduledDate, setScheduledDate] = useState<string>(workOrder?.scheduledDate || new Date().toISOString().slice(0, 10))
  const [scheduledTime, setScheduledTime] = useState<string>(workOrder?.scheduledTime || '09:00 - 12:00')
  const [technicianName, setTechnicianName] = useState<string>(workOrder?.technicianName || 'Sven De Smet')
  const [technicianPhone, setTechnicianPhone] = useState<string>(workOrder?.technicianPhone || '+32 470 12 34 56')
  const [status, setStatus] = useState<WorkOrderStatus>(workOrder?.status || 'scheduled')
  const [description, setDescription] = useState<string>(workOrder?.description || '')
  const [travelKilometers, setTravelKilometers] = useState<number>(workOrder?.travelKilometers || 25)
  const [travelRatePerKm, setTravelRatePerKm] = useState<number>(workOrder?.travelRatePerKm || 0.75)
  const [internalNotes, setInternalNotes] = useState<string>(workOrder?.internalNotes || '')

  const [laborItems, setLaborItems] = useState<WorkOrderLaborItem[]>(
    workOrder?.laborItems || [
      {
        id: `woli-${Date.now()}`,
        technicianName: 'Sven De Smet',
        date: new Date().toISOString().slice(0, 10),
        hours: 2.5,
        hourlyRate: 95.0,
        description: 'Standard on-site technical inspection & assembly',
      },
    ]
  )

  const [materialItems, setMaterialItems] = useState<WorkOrderMaterialItem[]>(
    workOrder?.materialItems || [
      {
        id: `womi-${Date.now()}`,
        productId: products[0]?.id,
        description: products[0]?.name || 'Standard Spare Part',
        quantity: 1,
        unit: 'piece',
        unitPrice: products[0]?.sellPrice || 45.0,
      },
    ]
  )

  const handleAddLabor = () => {
    setLaborItems((prev) => [
      ...prev,
      {
        id: `woli-${Date.now()}`,
        technicianName: technicianName || 'Technician',
        date: scheduledDate,
        hours: 1.0,
        hourlyRate: 95.0,
        description: 'Additional on-site work',
      },
    ])
  }

  const handleRemoveLabor = (id: string) => {
    setLaborItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleAddMaterial = () => {
    const prod = products[0]
    setMaterialItems((prev) => [
      ...prev,
      {
        id: `womi-${Date.now()}`,
        productId: prod?.id,
        description: prod?.name || 'Material Item',
        quantity: 1,
        unit: 'piece',
        unitPrice: prod?.sellPrice || 25.0,
      },
    ])
  }

  const handleSelectProduct = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId)
    if (!prod) return
    setMaterialItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              productId: prod.id,
              description: prod.name,
              unitPrice: prod.sellPrice,
            }
          : item
      )
    )
  }

  const handleRemoveMaterial = (id: string) => {
    setMaterialItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const now = new Date().toISOString()
    const newWo: WorkOrder = {
      id: workOrder?.id || `wo-${Date.now()}`,
      number: workOrder?.number || `WB-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      title: title.trim() || 'On-site Field Service Order',
      clientType,
      companyId: clientType === 'company' ? companyId : undefined,
      individualId: clientType === 'individual' ? individualId : undefined,
      address,
      city,
      postalCode,
      scheduledDate,
      scheduledTime,
      technicianName,
      technicianPhone,
      status,
      description,
      laborItems,
      materialItems,
      travelKilometers: Number(travelKilometers),
      travelRatePerKm: Number(travelRatePerKm),
      photos: workOrder?.photos || [],
      signature: workOrder?.signature,
      invoiceId: workOrder?.invoiceId,
      internalNotes,
      createdAt: workOrder?.createdAt || now,
      updatedAt: now,
    }

    if (workOrder) {
      updateWorkOrder(newWo)
    } else {
      addWorkOrder(newWo)
    }

    onClose()
  }

  const totalLabor = laborItems.reduce((sum, l) => sum + l.hours * l.hourlyRate, 0)
  const totalMaterials = materialItems.reduce((sum, m) => sum + m.quantity * m.unitPrice, 0)
  const totalTravel = travelKilometers * travelRatePerKm
  const grandTotal = totalLabor + totalMaterials + totalTravel

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>
              DIGITALE WERKBON
            </span>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              {workOrder ? `Edit Work Order ${workOrder.number}` : 'New Digital Work Order'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Top Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Job / Service Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Heat Pump On-site Inspection & Maintenance"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed (Unsigned)</option>
                <option value="signed">Signed & Approved</option>
                <option value="invoiced">Invoiced</option>
              </select>
            </div>
          </div>

          {/* Client Selection & Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Customer Type & Name
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setClientType('company')}
                  className={`btn-sandbox ${clientType === 'company' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                >
                  B2B Company
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('individual')}
                  className={`btn-sandbox ${clientType === 'individual' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
                  style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                >
                  B2C Private Client
                </button>
              </div>

              {clientType === 'company' ? (
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={individualId}
                  onChange={(e) => setIndividualId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                >
                  {individuals.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.firstName} {ind.lastName} ({ind.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                On-Site Job Location Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street and Number"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem', marginBottom: '0.4rem' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Schedule & Technician */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Time Window
              </label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="09:00 - 12:30"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Field Technician
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="e.g. Sven De Smet"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>

          {/* 1. Labor Section */}
          <div style={{ marginBottom: '1.25rem', border: '1px solid var(--sb-border)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--sb-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={16} color="var(--sb-primary)" />
                <span>On-Site Labor & Technician Hours</span>
              </div>
              <button
                type="button"
                onClick={handleAddLabor}
                className="btn-sandbox btn-sandbox-outline"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={12} />
                <span>Add Labor</span>
              </button>
            </div>

            {laborItems.map((item, idx) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const desc = e.target.value
                    setLaborItems((prev) => prev.map((l, i) => (i === idx ? { ...l, description: desc } : l)))
                  }}
                  placeholder="Task / Labor description"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />
                <input
                  type="number"
                  step="0.25"
                  value={item.hours}
                  onChange={(e) => {
                    const hrs = Number(e.target.value)
                    setLaborItems((prev) => prev.map((l, i) => (i === idx ? { ...l, hours: hrs } : l)))
                  }}
                  placeholder="Hours"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />
                <input
                  type="number"
                  step="1"
                  value={item.hourlyRate}
                  onChange={(e) => {
                    const rate = Number(e.target.value)
                    setLaborItems((prev) => prev.map((l, i) => (i === idx ? { ...l, hourlyRate: rate } : l)))
                  }}
                  placeholder="Rate €/h"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLabor(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* 2. Materials & Stock Consumption */}
          <div style={{ marginBottom: '1.25rem', border: '1px solid var(--sb-border)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--sb-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} color="#10b981" />
                <span>Materials & Parts Consumed (Deducted from Stock)</span>
              </div>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="btn-sandbox btn-sandbox-outline"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Plus size={12} />
                <span>Add Material</span>
              </button>
            </div>

            {materialItems.map((mat, idx) => (
              <div key={mat.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select
                  value={mat.productId || ''}
                  onChange={(e) => handleSelectProduct(idx, e.target.value)}
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                >
                  <option value="">Custom Item...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={mat.description}
                  onChange={(e) => {
                    const desc = e.target.value
                    setMaterialItems((prev) => prev.map((m, i) => (i === idx ? { ...m, description: desc } : m)))
                  }}
                  placeholder="Description"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <input
                  type="number"
                  min="1"
                  value={mat.quantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value)
                    setMaterialItems((prev) => prev.map((m, i) => (i === idx ? { ...m, quantity: qty } : m)))
                  }}
                  placeholder="Qty"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <input
                  type="number"
                  step="0.01"
                  value={mat.unitPrice}
                  onChange={(e) => {
                    const price = Number(e.target.value)
                    setMaterialItems((prev) => prev.map((m, i) => (i === idx ? { ...m, unitPrice: price } : m)))
                  }}
                  placeholder="Price €"
                  className="input-sandbox"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(mat.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* 3. Travel Kilometers & Total */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '10px',
              border: '1px solid var(--sb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Car size={18} color="var(--sb-primary)" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Travel:</span>
                <input
                  type="number"
                  value={travelKilometers}
                  onChange={(e) => setTravelKilometers(Number(e.target.value))}
                  style={{ width: '60px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                  className="input-sandbox"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>km @ €{travelRatePerKm}/km = €{totalTravel.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Calculated Work Order Subtotal (excl. VAT)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                €{grandTotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.55rem 1.5rem' }}>
              {workOrder ? 'Update Work Order' : 'Create Digital Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
