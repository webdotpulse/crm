import React, { useState, useRef, useEffect } from 'react'
import {
  Boxes,
  Truck,
  QrCode,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Camera,
  Barcode,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { WarehouseLocation, StockTransferOrder, SerialBatchItem, Product } from '../../types'
import { formatCurrency } from '../../services/currencyService'

export const MultiLocationInventoryView: React.FC = () => {
  const {
    products,
    warehouseLocations,
    addWarehouseLocation,
    stockTransfers,
    createStockTransfer,
    completeStockTransfer,
    serialBatchItems,
    addSerialBatchItem,
    selectedCurrency,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'locations' | 'transfers' | 'serials' | 'scanner'>('locations')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stock Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFromLocation, setTransferFromLocation] = useState(warehouseLocations[0]?.id || '')
  const [transferToLocation, setTransferToLocation] = useState(warehouseLocations[1]?.id || warehouseLocations[0]?.id || '')
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '')
  const [transferQuantity, setTransferQuantity] = useState(1)
  const [transferNotes, setTransferNotes] = useState('')

  // Interactive Barcode / Serial Scanner State
  const [scannedBarcode, setScannedBarcode] = useState<string>('')
  const [scannerNotice, setScannerNotice] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    const fromLoc = warehouseLocations.find((l) => l.id === transferFromLocation)
    const toLoc = warehouseLocations.find((l) => l.id === transferToLocation)
    const prod = products.find((p) => p.id === transferProductId)
    if (!fromLoc || !toLoc || !prod) return

    createStockTransfer({
      fromLocationId: fromLoc.id,
      fromLocationName: fromLoc.name,
      toLocationId: toLoc.id,
      toLocationName: toLoc.name,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: transferQuantity,
      requestedBy: 'Koen De Vries',
      notes: transferNotes || undefined,
    })

    setIsTransferModalOpen(false)
    setTransferNotes('')
  }

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setIsCameraActive(true)
        setScannerNotice('Camera active. Point at item barcode or QR code.')
      } else {
        setScannerNotice('Camera access not supported on this browser. Use manual scanner input.')
      }
    } catch (err: any) {
      setScannerNotice(`Camera access: ${err?.message || 'Permission needed'}. Use scanner input.`)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const handleScanInput = (code: string) => {
    setScannedBarcode(code)
    if (code.trim()) {
      setScannerNotice(`Recognized barcode: ${code}`)
    }
  }

  const matchedSerialItem = serialBatchItems.find((s) => s.serialNumber === scannedBarcode || s.sku === scannedBarcode)
  const matchedProduct = products.find((p) => p.sku === matchedSerialItem?.sku || p.sku === scannedBarcode || p.barcode === scannedBarcode)

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
                backgroundColor: 'rgba(63, 120, 224, 0.12)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Boxes size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Multi-Location Inventory & Serial Tracking
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            Central Warehouses, Service Van Stock, Inter-Depot Stock Transfers, and Barcode/QR Scanner.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--sb-surface)', padding: '0.3rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
          <button
            onClick={() => setActiveTab('locations')}
            className={`btn-sandbox ${activeTab === 'locations' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Building2 size={15} /> Warehouses & Vans
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`btn-sandbox ${activeTab === 'transfers' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <ArrowRightLeft size={15} /> Stock Transfers
          </button>
          <button
            onClick={() => setActiveTab('serials')}
            className={`btn-sandbox ${activeTab === 'serials' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <QrCode size={15} /> Serials & Batches
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`btn-sandbox ${activeTab === 'scanner' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Camera size={15} /> Barcode Scanner
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Active Locations</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
            {warehouseLocations.length} Sites
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', marginTop: '0.15rem' }}>
            2 Depots • 2 Service Vans
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Tracked SKUs</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
            {products.length} Products
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38b995', marginTop: '0.15rem' }}>
            Total Stock: {products.reduce((sum, p) => sum + p.stockQuantity, 0)} Units
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>In-Transit Transfers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fab758', marginTop: '0.2rem' }}>
            {stockTransfers.filter((t) => t.status === 'in_transit').length} Orders
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>En-route replenishment</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Registered Serials</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
            {serialBatchItems.length} Units
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>With 2-Year Hardware Warranty</div>
        </div>
      </div>

      {/* TAB 1: LOCATIONS & WAREHOUSES OVERVIEW */}
      {activeTab === 'locations' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {warehouseLocations.map((loc) => {
              const isVan = loc.type === 'van'

              return (
                <div key={loc.id} className="card-sandbox" style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: isVan ? 'rgba(116, 82, 214, 0.15)' : 'var(--sb-primary-soft)',
                          color: isVan ? '#7452d6' : 'var(--sb-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isVan ? <Truck size={18} /> : <Building2 size={18} />}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                          {loc.name}
                        </h4>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--sb-body)' }}>
                          {loc.code}
                        </span>
                      </div>
                    </div>

                    <span className={`badge-sandbox badge-soft-${isVan ? 'purple' : 'primary'}`} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {loc.type}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginBottom: '0.85rem' }}>
                    {loc.address || `License Plate: ${loc.vehiclePlate}`} • Manager: <strong>{loc.managerName}</strong>
                  </div>

                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: 'var(--sb-radius)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>Capacity Allocated:</span>
                    <strong>{loc.capacityUnits || 500} units</strong>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Product Stock Table */}
          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--sb-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--sb-bg)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                Product Stock Levels & Reorder Thresholds
              </div>

              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
                <input
                  type="text"
                  placeholder="Filter by SKU or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', paddingLeft: '1.85rem', fontSize: '0.78rem', padding: '0.35rem 0.5rem 0.35rem 1.85rem' }}
                />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>SKU</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>PRODUCT NAME</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>CATEGORY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'right' }}>TOTAL IN STOCK</th>
                  <th style={{ padding: '0.75rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'center' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--sb-primary)' }}>
                      {prod.sku}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {prod.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', color: 'var(--sb-body)' }}>
                      {prod.category.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      {prod.stockQuantity} {prod.unit}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <span className={`badge-sandbox badge-soft-${prod.stockQuantity > prod.minStockAlert ? 'success' : 'danger'}`} style={{ fontSize: '0.68rem' }}>
                        {prod.stockQuantity > prod.minStockAlert ? '✓ Stock Healthy' : '⚠️ Reorder Alert'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK TRANSFERS */}
      {activeTab === 'transfers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Inter-Warehouse & Service Van Transfer Orders
            </h3>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.5rem 1rem', fontWeight: 800, fontSize: '0.82rem' }}
            >
              <Plus size={15} /> Create Stock Transfer
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stockTransfers.map((transfer) => (
              <div key={transfer.id} className="card-sandbox" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--sb-primary)' }}>{transfer.transferNumber}</strong>
                    <span
                      className={`badge-sandbox badge-soft-${
                        transfer.status === 'completed' ? 'success' : transfer.status === 'in_transit' ? 'warning' : 'primary'
                      }`}
                      style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}
                    >
                      {transfer.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{transfer.date}</span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {transfer.quantity}x {transfer.productName} ({transfer.sku})
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>
                    From: <strong>{transfer.fromLocationName}</strong> ➔ To: <strong>{transfer.toLocationName}</strong>
                  </div>
                </div>

                {transfer.status === 'in_transit' && (
                  <button
                    onClick={() => completeStockTransfer(transfer.id)}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
                  >
                    <Check size={14} /> Confirm Receipt & Stock Delivery
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERIALS & LOT NUMBERS */}
      {activeTab === 'serials' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>SERIAL NUMBER</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>PRODUCT</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>LOCATION</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>LOT / BATCH</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>WARRANTY EXPIRY</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: 'var(--sb-heading)', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {serialBatchItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--sb-primary)' }}>
                    {item.serialNumber}
                  </td>
                  <td style={{ padding: '1rem 1rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    {item.productName}
                  </td>
                  <td style={{ padding: '1rem 1rem', color: 'var(--sb-body)' }}>
                    {item.locationName}
                  </td>
                  <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', color: 'var(--sb-body)' }}>
                    {item.batchNumber || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem 1rem', color: 'var(--sb-body)' }}>
                    {item.warrantyExpiryDate || '2 Years'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REAL BARCODE / QR SCANNER */}
      {activeTab === 'scanner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.75rem' }}>
          {/* Left Viewport: Camera & Hardware Barcode Reader */}
          <div className="card-sandbox" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#0f172a', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '320px', height: '220px', margin: '0 auto 1.5rem', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', overflow: 'hidden' }}>
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <Barcode size={54} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '0.78rem' }}>Camera inactive</span>
                </div>
              )}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', backgroundColor: '#38b995', boxShadow: '0 0 10px #38b995', animation: 'scanLaser 2s ease-in-out infinite' }} />
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
              Live Camera & Barcode Reader
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              Scan items with your device camera or connect any USB/Bluetooth Honeywell or Zebra barcode scanner.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Camera size={15} />
                  <span>Start Camera Video</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn-sandbox btn-sandbox-danger"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                >
                  Stop Camera
                </button>
              )}
            </div>

            {/* Direct Hardware Scanner Input */}
            <div style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Direct Barcode / Serial Input (Hardware Scanner or Manual):
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Scan or type barcode / SKU / Serial..."
                  value={scannedBarcode}
                  onChange={(e) => handleScanInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                    borderRadius: 'var(--sb-radius)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Barcode size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* Right Column: Scan Result & Quick Actions */}
          <div className="card-sandbox" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem' }}>
              Scan Result Details
            </h3>

            {scannerNotice && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(56, 185, 149, 0.15)', color: 'var(--sb-success-text)', borderRadius: 'var(--sb-radius)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' }}>
                {scannerNotice}
              </div>
            )}

            {matchedSerialItem || matchedProduct ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: 'var(--sb-radius)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', textTransform: 'uppercase', fontWeight: 700 }}>Scanned Code / SKU</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--sb-primary)', fontFamily: 'monospace' }}>
                    {matchedSerialItem?.serialNumber || matchedProduct?.sku || scannedBarcode}
                  </div>
                </div>

                {matchedProduct && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>Product:</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                      {matchedProduct.name} ({matchedProduct.sku})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                      Price: {formatCurrency(matchedProduct.sellPrice, selectedCurrency)} | Category: {matchedProduct.category}
                    </div>
                  </div>
                )}

                {matchedSerialItem && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>Current Location:</div>
                    <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {matchedSerialItem.locationName}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--sb-border)' }}>
                  <button
                    onClick={() => {
                      if (matchedSerialItem) {
                        alert(`Allocated serial ${matchedSerialItem.serialNumber} to current work order job.`)
                      } else if (matchedProduct) {
                        alert(`Allocated product ${matchedProduct.name} to work order.`)
                      }
                    }}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ width: '100%', fontSize: '0.82rem', fontWeight: 800 }}
                  >
                    ✓ Allocate to Work Order
                  </button>

                  <button
                    onClick={() => {
                      if (matchedProduct) {
                        setTransferProductId(matchedProduct.id)
                      }
                      setIsTransferModalOpen(true)
                    }}
                    className="btn-sandbox btn-sandbox-outline"
                    style={{ width: '100%', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    ➔ Initiate Warehouse Transfer
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--sb-body)', fontSize: '0.85rem' }}>
                {scannedBarcode ? 'No product or serial item matched this barcode.' : 'Scan a barcode or type a SKU/serial code above to inspect inventory details.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {isTransferModalOpen && (
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
              width: '520px',
              maxWidth: '100%',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius-lg)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Create Stock Transfer Order
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    From Source Location
                  </label>
                  <select
                    value={transferFromLocation}
                    onChange={(e) => setTransferFromLocation(e.target.value)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  >
                    {warehouseLocations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    To Destination Location
                  </label>
                  <select
                    value={transferToLocation}
                    onChange={(e) => setTransferToLocation(e.target.value)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  >
                    {warehouseLocations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Select Product / Hardware Item
                </label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Transfer Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(parseInt(e.target.value, 10) || 1)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Transfer Notes & Dispatch Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Replenishment for Antwerp field maintenance project"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsTransferModalOpen(false)} className="btn-sandbox btn-sandbox-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ fontWeight: 800 }}>
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default MultiLocationInventoryView
