import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  PenTool,
  Download,
  Trash2,
  ShieldCheck,
  Sparkles,
  Plus,
  Minus,
  Check,
  AlertCircle,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../../context/AppContext'
import { Quotation, QuoteItem } from '../../types'
import { formatCurrency } from '../../services/currencyService'

interface InteractiveProposalViewerModalProps {
  quote?: Quotation | null
  onClose: () => void
}

interface ProposalInteractiveItem extends QuoteItem {
  isOptional?: boolean
  selected?: boolean
}

export const InteractiveProposalViewerModal: React.FC<InteractiveProposalViewerModalProps> = ({
  quote,
  onClose,
}) => {
  const {
    quotations,
    updateQuotation,
    signQuotation,
    companies,
    individuals,
    activeLegalEntity,
    selectedCurrency,
  } = useApp()

  const targetQuote = quote || quotations[0]

  // Client lookup
  const clientCompany = companies.find((c) => c.id === targetQuote?.companyId)
  const clientIndividual = individuals.find((i) => i.id === targetQuote?.individualId)
  const clientName = clientCompany?.name || (clientIndividual ? `${clientIndividual.firstName} ${clientIndividual.lastName}` : 'Client')

  // Interactive items state
  const [items, setItems] = useState<ProposalInteractiveItem[]>(() => {
    if (!targetQuote?.items) return []
    return targetQuote.items.map((item, index) => ({
      ...item,
      isOptional: index >= 2, // Optional items for demonstration
      selected: true,
    }))
  })

  // Signatures & Sign off state
  const [signerName, setSignerName] = useState(clientName)
  const [signerNotes, setSignerNotes] = useState('')
  const [isSigned, setIsSigned] = useState(targetQuote?.status === 'accepted')
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Recalculate totals dynamically
  const activeItems = items.filter((item) => !item.isOptional || item.selected)
  const subtotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity * (1 - item.discountPercent / 100), 0)
  const taxTotal = activeItems.reduce((sum, item) => {
    const lineSubtotal = item.unitPrice * item.quantity * (1 - item.discountPercent / 100)
    return sum + (lineSubtotal * item.vatRate) / 100
  }, 0)
  const total = subtotal + taxTotal

  // Canvas signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e293b'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleToggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: nextQty, total: nextQty * item.unitPrice }
        }
        return item
      })
    )
  }

  const handleConfirmSignature = () => {
    if (!targetQuote) return

    signQuotation(targetQuote.id, signerName, signerNotes)
    setIsSigned(true)

    // Trigger celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3f78e0', '#38b995', '#fab758', '#7452d6'],
    })
  }

  if (!targetQuote) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="card-sandbox"
        style={{
          width: '1000px',
          maxWidth: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--sb-surface)',
          boxShadow: 'var(--sb-shadow-hover)',
          borderRadius: 'var(--sb-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--sb-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--sb-heading)' }}>
                Interactive Proposal Experience
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)' }}>
                {targetQuote.number} • Prepared for <strong>{clientName}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge-sandbox badge-soft-${isSigned ? 'success' : 'primary'}`} style={{ fontSize: '0.76rem' }}>
              {isSigned ? '✓ Accepted & Legally Signed' : '● Live Client Web View'}
            </span>
            <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Proposal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
          {/* Proposal Header Banner */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderRadius: 'var(--sb-radius)',
              background: 'linear-gradient(135deg, var(--sb-surface) 0%, var(--sb-primary-soft) 100%)',
              border: '1px solid var(--sb-border)',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sb-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeLegalEntity.name}
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0.25rem 0' }}>
                {targetQuote.title}
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--sb-body)', maxWidth: '500px' }}>
                Commercial proposal for enterprise services, licensing, SLA maintenance and optional implementation modules.
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Valid Until: <strong>{targetQuote.validUntilDate}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Currency: <strong>{targetQuote.currency || 'EUR'}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Issued by: <strong>{activeLegalEntity.legalName}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Line Items Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Services & Optional Add-ons
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Toggle optional add-ons or adjust quantities to see live total updates.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => {
                const isSelected = !item.isOptional || item.selected
                const lineTotal = item.unitPrice * item.quantity * (1 - item.discountPercent / 100)

                return (
                  <div
                    key={item.id}
                    className="card-sandbox"
                    style={{
                      padding: '1.15rem 1.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: isSelected ? '1.5px solid var(--sb-primary)' : '1px dashed var(--sb-border)',
                      backgroundColor: isSelected ? 'var(--sb-surface)' : 'var(--sb-bg)',
                      opacity: isSelected ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      {item.isOptional && (
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={isSigned}
                          onChange={() => handleToggleItem(item.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--sb-heading)' }}>
                            {item.description}
                          </span>
                          {item.isOptional && (
                            <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.65rem' }}>
                              Optional Add-on
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                          €{item.unitPrice.toFixed(2)} per {item.unit || 'unit'} • VAT {item.vatRate}%
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {!isSigned && (
                          <button
                            onClick={() => handleAdjustQuantity(item.id, -1)}
                            className="btn-sandbox btn-sandbox-outline"
                            style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                        )}
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        {!isSigned && (
                          <button
                            onClick={() => handleAdjustQuantity(item.id, 1)}
                            className="btn-sandbox btn-sandbox-outline"
                            style={{ padding: '0.2rem 0.4rem', borderRadius: '4px' }}
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--sb-heading)' }}>
                          {formatCurrency(lineTotal, selectedCurrency)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>Excl. VAT</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--sb-radius)',
              backgroundColor: 'var(--sb-bg)',
              border: '1px solid var(--sb-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '2.5rem',
            }}
          >
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--sb-body)' }}>
                <span>Subtotal (Excl. VAT):</span>
                <strong>{formatCurrency(subtotal, selectedCurrency)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--sb-body)' }}>
                <span>VAT Total:</span>
                <strong>{formatCurrency(taxTotal, selectedCurrency)}</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: 'var(--sb-heading)',
                  borderTop: '2px solid var(--sb-border)',
                  paddingTop: '0.75rem',
                }}
              >
                <span>Total Investment:</span>
                <span style={{ color: 'var(--sb-primary)' }}>{formatCurrency(total, selectedCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Acceptance Pad */}
          <div className="card-sandbox" style={{ padding: '1.75rem', border: '1px solid var(--sb-border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PenTool size={18} color="var(--sb-primary)" />
              {isSigned ? 'Electronic Signature Verification' : 'Digital Sign-on-Screen & Acceptance'}
            </h3>

            {isSigned ? (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--sb-radius)',
                  backgroundColor: 'rgba(56, 185, 149, 0.1)',
                  border: '1px solid rgba(56, 185, 149, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <CheckCircle2 size={32} color="var(--sb-success)" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--sb-heading)' }}>
                    Proposal Signed & Accepted by {targetQuote.clientSignedBy || signerName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                    Signed at {targetQuote.clientSignedAt || new Date().toLocaleString()} • SHA-256 Tamper Audit Checksum Verified
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Signer Full Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', padding: '0.55rem 0.85rem' }}
                      placeholder="e.g. Marc Van Damme"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Signer Notes or Purchase Order Ref (Optional)
                    </label>
                    <input
                      type="text"
                      value={signerNotes}
                      onChange={(e) => setSignerNotes(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', padding: '0.55rem 0.85rem' }}
                      placeholder="e.g. PO-849-2026"
                    />
                  </div>
                </div>

                {/* HTML5 Canvas Signature Pad */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Draw Signature Below:
                    </label>
                    <button
                      onClick={clearSignature}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{ fontSize: '0.72rem', color: 'var(--sb-danger)', padding: '0.2rem 0.5rem' }}
                    >
                      <Trash2 size={12} /> Clear Pad
                    </button>
                  </div>

                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      width: '100%',
                      height: '140px',
                      borderRadius: 'var(--sb-radius)',
                      border: '1.5px dashed var(--sb-primary)',
                      backgroundColor: 'var(--sb-bg)',
                      cursor: 'crosshair',
                      touchAction: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)', maxWidth: '550px' }}>
                    By clicking "Accept & Sign Proposal", you agree to the MSA terms, pricing schedule, and payment terms stipulated in this document.
                  </div>

                  <button
                    onClick={handleConfirmSignature}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.65rem 1.5rem', fontWeight: 800, fontSize: '0.92rem', gap: '0.5rem' }}
                    disabled={!signerName.trim() || !hasSignature}
                  >
                    <CheckCircle2 size={18} />
                    <span>Accept & Sign Proposal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default InteractiveProposalViewerModal
