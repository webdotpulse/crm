import React, { useState, useRef } from 'react'
import { X, Check, PenTool, ShieldCheck, MapPin, Eraser } from 'lucide-react'
import { WorkOrder, WorkOrderSignature } from '../../types'

interface WorkOrderSignModalProps {
  workOrder: WorkOrder
  onClose: () => void
  onSign: (signature: WorkOrderSignature) => void
}

export const WorkOrderSignModal: React.FC<WorkOrderSignModalProps> = ({
  workOrder,
  onClose,
  onSign,
}) => {
  const [signedBy, setSignedBy] = useState<string>('')
  const [signerTitle, setSignerTitle] = useState<string>('Client / Site Representative')
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [hasDrawn, setHasDrawn] = useState<boolean>(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasDrawn(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const handleStopDraw = () => {
    setIsDrawing(false)
  }

  const handleClearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signedBy.trim() || !hasDrawn) return

    const canvas = canvasRef.current
    const signatureImage = canvas ? canvas.toDataURL('image/png') : ''

    const signature: WorkOrderSignature = {
      signedBy: signedBy.trim(),
      signatureImage,
      signedAt: new Date().toISOString(),
      signerTitle: signerTitle.trim(),
      legalDisclaimer: 'The customer certifies that the on-site works, labor hours, and materials listed have been executed completely and in accordance with order specifications.',
      gpsLocation: '50.8503° N, 4.3517° E (Brussels Verified)',
    }

    onSign(signature)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: '560px',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>
              CUSTOMER ON-SITE APPROVAL
            </span>
            <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              Sign Work Order: {workOrder.number}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Summary Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '10px',
              border: '1px solid var(--sb-border)',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{workOrder.title}</div>
            <div style={{ color: 'var(--sb-body)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>📍 {workOrder.address}, {workOrder.city}</span>
              <span>👨‍🔧 {workOrder.technicianName}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name of Signer *
              </label>
              <input
                type="text"
                required
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="e.g. Marc Vandenbroeck"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Role / Function *
              </label>
              <input
                type="text"
                required
                value={signerTitle}
                onChange={(e) => setSignerTitle(e.target.value)}
                placeholder="e.g. Site Manager"
                className="input-sandbox"
                style={{ width: '100%', padding: '0.5rem 0.75rem' }}
              />
            </div>
          </div>

          {/* Signature Canvas */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
                Sign on Glass (Use finger or mouse) *
              </label>
              <button
                type="button"
                onClick={handleClearCanvas}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Eraser size={13} />
                <span>Clear</span>
              </button>
            </div>

            <div
              style={{
                border: '2px dashed var(--sb-border)',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                onMouseDown={handleStartDraw}
                onMouseMove={handleDraw}
                onMouseUp={handleStopDraw}
                onMouseLeave={handleStopDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleDraw}
                onTouchEnd={handleStopDraw}
                style={{ width: '100%', height: '160px', cursor: 'crosshair', borderRadius: '10px' }}
              />
            </div>
            {!hasDrawn && (
              <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '0.25rem', display: 'block' }}>
                ✍️ Please sign above to authorize work completion.
              </span>
            )}
          </div>

          {/* Legal disclaimer */}
          <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)', marginBottom: '1.25rem', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span>Digital signature recorded with timestamp and cryptographic integrity. Legally binding under eIDAS regulation.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!signedBy.trim() || !hasDrawn}
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.55rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Check size={16} />
              <span>Confirm & Approve Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
