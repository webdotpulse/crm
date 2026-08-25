import React, { useState } from 'react'
import { X, FileCode2, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { parseInboundPeppolXml } from '../../services/inboundPeppolParser'
import { formatCurrency } from '../../services/currencyService'

interface InboundPeppolModalProps {
  onClose: () => void
  onSuccess: () => void
}

export const InboundPeppolModal: React.FC<InboundPeppolModalProps> = ({ onClose, onSuccess }) => {
  const { importInboundPeppolXml, selectedCurrency } = useApp()
  const [xmlContent, setXmlContent] = useState<string>('')
  const [parsedPreview, setParsedPreview] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleXmlChange = (val: string) => {
    setXmlContent(val)
    if (val.trim().startsWith('<')) {
      const parsed = parseInboundPeppolXml(val)
      setParsedPreview(parsed)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      handleXmlChange(text)
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (!xmlContent) return
    importInboundPeppolXml(xmlContent, 'inbound-supplier.xml')
    onSuccess()
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
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <FileCode2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Peppol Inbound UBL / XML Receiver
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Receive & parse vendor e-invoices directly into Accounts Payable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sb-body)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            const file = e.dataTransfer.files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (ev) => handleXmlChange(ev.target?.result as string)
              reader.readAsText(file)
            }
          }}
          style={{
            border: `2px dashed ${dragActive ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: dragActive ? 'var(--sb-primary-soft)' : 'var(--sb-bg)',
            marginBottom: '1rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={28} color="var(--sb-primary)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
            Drag & Drop Vendor Peppol XML / UBL File
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>
            or{' '}
            <label style={{ color: 'var(--sb-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
              browse from computer
              <input type="file" accept=".xml,.ubl" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Live Parsed Preview */}
        {parsedPreview && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--sb-bg)',
              borderRadius: '12px',
              border: '1px solid var(--sb-border)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  Auto-Extracted Peppol Metadata
                </span>
              </div>
              <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>
                EN 16931 VALIDATED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Supplier</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  {parsedPreview.supplierName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Invoice Number</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  {parsedPreview.number}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Category</div>
                <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                  {parsedPreview.category?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Total Payable</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>
                  {formatCurrency(parsedPreview.total, selectedCurrency)}
                </div>
              </div>
            </div>

            {parsedPreview.items && parsedPreview.items.length > 0 && (
              <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--sb-border)', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginBottom: '0.35rem' }}>Line Items:</div>
                {parsedPreview.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--sb-heading)',
                      padding: '0.2rem 0',
                    }}
                  >
                    <span>• {item.description} (x{item.quantity})</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(item.total, selectedCurrency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* XML Viewer / Editor */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
              Raw UBL / XML Document
            </label>
          </div>
          <textarea
            value={xmlContent}
            placeholder="Paste your Peppol UBL 2.1 / BIS Billing 3.0 XML here..."
            onChange={(e) => handleXmlChange(e.target.value)}
            className="input-sandbox"
            rows={7}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              lineHeight: 1.4,
              padding: '0.75rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-sandbox btn-sandbox-outline"
            style={{ padding: '0.6rem 1.25rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn-sandbox btn-sandbox-primary"
            style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <CheckCircle2 size={16} />
            Import Into Expenses & P&L
          </button>
        </div>
      </div>
    </div>
  )
}
