import React, { useState } from 'react'
import {
  LayoutTemplate,
  Palette,
  Type,
  QrCode,
  Sliders,
  Check,
  Download,
  Eye,
  Building2,
  FileText,
  Receipt,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { TemplateStyleConfig, WysiwygDocumentTemplate } from '../../types'
import { formatCurrency } from '../../services/currencyService'

export const DocumentTemplateDesignerView: React.FC = () => {
  const {
    wysiwygTemplates,
    activeWysiwygTemplateId,
    setActiveWysiwygTemplateId,
    updateWysiwygTemplateStyle,
    activeLegalEntity,
    companyProfile,
    selectedCurrency,
  } = useApp()

  const activeTemplate =
    wysiwygTemplates.find((t) => t.id === activeWysiwygTemplateId) || wysiwygTemplates[0]

  const [styleConfig, setStyleConfig] = useState<TemplateStyleConfig>(activeTemplate.styleConfig)
  const [activePreviewDocType, setActivePreviewDocType] = useState<'invoice' | 'quote' | 'delivery'>('invoice')
  const [saveToast, setSaveToast] = useState(false)

  const handleUpdate = (updates: Partial<TemplateStyleConfig>) => {
    const updated = { ...styleConfig, ...updates }
    setStyleConfig(updated)
    updateWysiwygTemplateStyle(activeTemplate.id, updates)
  }

  const handleSaveDefault = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1500px', margin: '0 auto' }}>
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
              <LayoutTemplate size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Visual WYSIWYG Document Designer
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            Design letterheads, EPC QR payment codes, typography, and styling for Invoices, Quotes, and Work Orders with live real-time preview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleSaveDefault}
            className="btn-sandbox btn-sandbox-primary"
            style={{ fontWeight: 800, padding: '0.6rem 1.25rem' }}
          >
            <Check size={16} /> Save & Set as Default Template
          </button>
        </div>
      </div>

      {saveToast && (
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
          <Check size={16} />
          <span>Document template styles saved and active for {activeLegalEntity.name}!</span>
        </div>
      )}

      {/* 2-Column Designer Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
        {/* Left Column: Style Controls Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Preset Selector */}
          <div className="card-sandbox" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sb-heading)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Base Template Presets
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {wysiwygTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveWysiwygTemplateId(t.id)
                    setStyleConfig(t.styleConfig)
                  }}
                  className="btn-sandbox btn-sandbox-ghost"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: t.id === activeTemplate.id ? 800 : 500,
                    backgroundColor: t.id === activeTemplate.id ? 'var(--sb-primary-soft)' : 'transparent',
                    color: t.id === activeTemplate.id ? 'var(--sb-primary)' : 'var(--sb-heading)',
                    border: t.id === activeTemplate.id ? '1px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                  }}
                >
                  <span>{t.name}</span>
                  {t.id === activeTemplate.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Controls */}
          <div className="card-sandbox" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sb-heading)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              Brand Colors & Accents
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'block', marginBottom: '0.35rem' }}>
                  Primary Brand Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={styleConfig.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={styleConfig.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="input-sandbox"
                    style={{ flex: 1, padding: '0.4rem 0.65rem', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'block', marginBottom: '0.35rem' }}>
                  Secondary / Highlight Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={styleConfig.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    style={{ width: '40px', height: '36px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={styleConfig.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    className="input-sandbox"
                    style={{ flex: 1, padding: '0.4rem 0.65rem', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Header Layout */}
          <div className="card-sandbox" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sb-heading)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              Typography & Layout Structure
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'block', marginBottom: '0.35rem' }}>
                  Font Family
                </label>
                <select
                  value={styleConfig.fontFamily}
                  onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.45rem 0.65rem' }}
                >
                  <option value="Urbanist">Urbanist (Modern Clean)</option>
                  <option value="Inter">Inter (Swiss Neutral)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Corporate)</option>
                  <option value="Outfit">Outfit (Geometric Agency)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech Monospace)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'block', marginBottom: '0.35rem' }}>
                  Header Alignment
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {(['standard', 'centered', 'modern_minimal', 'sidebar_accent'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleUpdate({ headerLayout: mode })}
                      className={`btn-sandbox ${styleConfig.headerLayout === mode ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', textTransform: 'capitalize' }}
                    >
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* EPC QR Code & Footer Settings */}
          <div className="card-sandbox" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sb-heading)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
              EPC QR & Legal Footer
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={styleConfig.showEpcQrCode}
                  onChange={(e) => handleUpdate({ showEpcQrCode: e.target.checked })}
                />
                <span style={{ fontWeight: 700 }}>Render European EPC QR Payment Code</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={styleConfig.showItemDescriptions}
                  onChange={(e) => handleUpdate({ showItemDescriptions: e.target.checked })}
                />
                <span>Include Extended Item Descriptions</span>
              </label>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'block', marginBottom: '0.35rem' }}>
                  Custom Legal Footer Text
                </label>
                <textarea
                  rows={2}
                  value={styleConfig.customFooterText || ''}
                  onChange={(e) => handleUpdate({ customFooterText: e.target.value })}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem' }}
                  placeholder="Legal entity details, RPR, bank IBAN..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Canvas Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Preview Document Type Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--sb-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setActivePreviewDocType('invoice')}
                className={`btn-sandbox ${activePreviewDocType === 'invoice' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
              >
                <Receipt size={14} /> Commercial Invoice Preview
              </button>
              <button
                onClick={() => setActivePreviewDocType('quote')}
                className={`btn-sandbox ${activePreviewDocType === 'quote' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}
              >
                <FileText size={14} /> Quotation Proposal Preview
              </button>
            </div>

            <span style={{ fontSize: '0.74rem', color: 'var(--sb-body)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} color="var(--sb-primary)" /> Live Dynamic Canvas
            </span>
          </div>

          {/* Paper Canvas */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: `${styleConfig.borderRadius}px`,
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              padding: '3rem',
              color: '#1e293b',
              fontFamily: styleConfig.fontFamily,
              minHeight: '720px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: styleConfig.headerLayout === 'centered' ? 'center' : 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: `2px solid ${styleConfig.primaryColor}`,
                  paddingBottom: '1.75rem',
                  marginBottom: '2rem',
                  textAlign: styleConfig.headerLayout === 'centered' ? 'center' : 'left',
                }}
              >
                <div>
                  {(activeLegalEntity.logoUrl || companyProfile.logoUrl) && (
                    <div style={{ marginBottom: '0.6rem', maxHeight: '48px' }}>
                      <img
                        src={activeLegalEntity.logoUrl || companyProfile.logoUrl}
                        alt="Logo"
                        style={{ maxHeight: '48px', maxWidth: '200px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: styleConfig.primaryColor, letterSpacing: '-0.02em' }}>
                    {activeLegalEntity.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {activeLegalEntity.address} • {activeLegalEntity.postalCode} {activeLegalEntity.city}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    VAT: <strong>{activeLegalEntity.vatNumber}</strong> • IBAN: <strong>{activeLegalEntity.iban}</strong>
                  </div>
                </div>

                {styleConfig.headerLayout !== 'centered' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                      {activePreviewDocType === 'invoice' ? 'COMMERCIAL INVOICE' : 'QUOTATION PROPOSAL'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: styleConfig.primaryColor, fontWeight: 700, marginTop: '0.2rem' }}>
                      {activePreviewDocType === 'invoice' ? '#BE-INV-2026-001' : '#QT-2026-084'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Date: {new Date().toLocaleDateString([], { dateStyle: 'medium' })}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Billed Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Billed To / Client:
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b', marginTop: '0.25rem' }}>
                    TechFlow Logistics NV
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>Havenlaan 88, 2000 Antwerp, Belgium</div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>VAT: BE0842123456 • Peppol: 0208:0842123456</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Payment Reference / Terms:
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: styleConfig.primaryColor, marginTop: '0.25rem', fontFamily: 'monospace' }}>
                    +++090/9337/55493+++
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>Due within 30 days net</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ backgroundColor: styleConfig.primaryColor, color: '#ffffff' }}>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700 }}>DESCRIPTION</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }}>QTY</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, textAlign: 'right' }}>UNIT PRICE</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }}>VAT</th>
                    <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, textAlign: 'right' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      Custom Cloud Architecture & Peppol BIS Gateway
                      {styleConfig.showItemDescriptions && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Deployment of secure microservices and AS4 message handling pipeline.
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>€3,500.00</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>21%</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>€3,500.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      IoT Fleet Telematics Gateway Hardware (v3)
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>2</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>€367.50</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>21%</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>€735.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals & EPC QR Code Area */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {styleConfig.showEpcQrCode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={48} color={styleConfig.primaryColor} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e293b' }}>
                        Scan to Pay (EPC QR)
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Supports KBC, Belfius, ING, BNP & Revolut
                      </div>
                    </div>
                  </div>
                ) : <div />}

                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <strong>€4,235.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>VAT Total (21%):</span>
                    <strong>€889.35</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: styleConfig.primaryColor, borderTop: '2px solid #e2e8f0', paddingTop: '0.5rem' }}>
                    <span>Total Due:</span>
                    <span>€5,124.35</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '2rem', textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
              {styleConfig.customFooterText || `${activeLegalEntity.legalName} • ${activeLegalEntity.vatNumber} • RPR ${activeLegalEntity.city} • Payments due 30 days net.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DocumentTemplateDesignerView
