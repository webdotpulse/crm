import React, { useState } from 'react'
import { X, Car, Bike, MapPin, Calculator, Plus, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MileageTrip, VehicleType } from '../../types'
import { calculateTripAllowance, BELGIAN_MILEAGE_RATES } from '../../services/mileageService'

interface MileageModalProps {
  onClose: () => void
}

export const MileageModal: React.FC<MileageModalProps> = ({ onClose }) => {
  const { addMileageTrip, companies, projects, currentUser } = useApp()

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [driverName, setDriverName] = useState<string>(currentUser?.name || '')
  const [purpose, setPurpose] = useState<string>('')
  const [originAddress, setOriginAddress] = useState<string>('')
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [distanceKm, setDistanceKm] = useState<number>(0)
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false)
  const [vehicleType, setVehicleType] = useState<VehicleType>('private_car')
  const [companyId, setCompanyId] = useState<string>(companies[0]?.id || '')

  const { totalDistanceKm, ratePerKm, totalAllowanceEur } = calculateTripAllowance(
    Number(distanceKm) || 0,
    isRoundTrip,
    vehicleType
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim() || !distanceKm) return

    const newTrip: MileageTrip = {
      id: `trip-${Date.now()}`,
      date,
      driverName,
      purpose,
      originAddress,
      destinationAddress,
      distanceKm: totalDistanceKm,
      isRoundTrip,
      vehicleType,
      ratePerKm,
      totalAllowanceEur,
      companyId: companyId || undefined,
      reimbursed: false,
      createdAt: new Date().toISOString(),
    }

    addMileageTrip(newTrip)
    onClose()
  }

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
          maxWidth: '580px',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>
              BELGIAN FISCAL MILEAGE DEDUCTION
            </span>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              Log Business Trip (Kilometers)
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Trip Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Driver / Employee *
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Sven De Smet"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Purpose */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Business Purpose / Client Visit *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. On-site IoT hardware maintenance & client review"
              className="input-sandbox"
              style={{ width: '100%', padding: '0.5rem 0.75rem' }}
            />
          </div>

          {/* Route origin & destination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Origin Address *
              </label>
              <input
                type="text"
                required
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                placeholder="Departure location"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Destination Address *
              </label>
              <input
                type="text"
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Arrival location"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Vehicle & Distance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              >
                <option value="private_car">Private Car (Belgian rate €0.4415/km)</option>
                <option value="company_car">Company Car (€0.00/km allowance)</option>
                <option value="bicycle">Bicycle Allowance (€0.35/km tax-free)</option>
                <option value="ev_car">Electric Vehicle (EV €0.4415/km)</option>
                <option value="motorcycle">Motorcycle (€0.4415/km)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                One-Way Distance (km) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                min="0.5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Round trip toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--sb-heading)' }}>
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={(e) => setIsRoundTrip(e.target.checked)}
              />
              <span>Round-trip (Return journey included: {isRoundTrip ? distanceKm * 2 : distanceKm} km total)</span>
            </label>
          </div>

          {/* Allowance Summary Box */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '10px',
              border: '1px solid var(--sb-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Total Recorded Distance</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                {totalDistanceKm} km
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Official Fiscal Allowance</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                €{totalAllowanceEur.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.55rem 1.5rem' }}>
              Save Mileage Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
