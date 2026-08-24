import React, { useState } from 'react'
import {
  X,
  AlertTriangle,
  FileText,
  Send,
  Download,
  ShieldCheck,
  CreditCard,
  Scale,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { DunningCase, DunningStage } from '../../types'
import { generateBailiffClaimExportJson } from '../../services/dunningService'

interface DunningNoticeModalProps {
  dunningCase: DunningCase
  onClose: () => void
}

export const DunningNoticeModal: React.FC<DunningNoticeModalProps> = ({ dunningCase, onClose }) => {
  const { sendDunningNotice, companyProfile, activeLegalEntity } = useApp()
  const [selectedStage, setSelectedStage] = useState<DunningStage>(dunningCase.currentStage)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showJsonExport, setShowJsonExport] = useState<boolean>(false)

  const handleSendNotice = () => {
    sendDunningNotice(dunningCase.invoiceId, selectedStage)
    setFeedback(`✓ Formal notice for stage "${selectedStage}" dispatched to ${dunningCase.clientEmail}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const creditor = {
    ...companyProfile,
    id: 'active-creditor',
    countryCode: 'BE',
    status: 'customer' as any,
    tags: [],
    createdAt: new Date().toISOString(),
  }

  const exportJson = generateBailiffClaimExportJson(dunningCase, creditor as any)

  const handleDownloadBailiffExport = () => {
    const blob = new Blob([exportJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BAILIFF_CLAIM_${dunningCase.invoiceNumber}.json`
    a.click()
    URL.revokeObjectURL(url)
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
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-sandbox badge-soft-danger" style={{ fontSize: '0.68rem' }}>
                BELGIAN BOOK XIX CEL COMPLIANCE
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{dunningCase.daysOverdue} Days Overdue</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              Aanmaning & Debt Escalation: {dunningCase.invoiceNumber}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
              Debtor: <strong>{dunningCase.clientName}</strong> ({dunningCase.clientEmail})
            </p>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        {feedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            {feedback}
          </div>
        )}

        {/* Claim Breakdown Card */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-bg)',
            borderRadius: '12px',
            border: '1px solid var(--sb-border)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={16} color="var(--sb-primary)" />
            <span>Statutory Claim Calculation (EU Directive 2011/7/EU)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Principal Balance</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                €{dunningCase.balanceDue.toFixed(2)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Statutory Recovery Fee</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
                +€{dunningCase.totalStatutoryFees.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--sb-body)' }}>Fixed €40 B2B legal fee</span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Late Payment Interest</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>
                +€{dunningCase.totalInterest.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--sb-body)' }}>12.5% p.a. (Day {dunningCase.daysOverdue})</span>
            </div>

            <div style={{ borderLeft: '1px solid var(--sb-border)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)', fontWeight: 700 }}>Total Claim Due</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' }}>
                €{dunningCase.totalClaim.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.5rem' }}>
            Select Escalation Notice Stage to Dispatch:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setSelectedStage('reminder_1')}
              className={`card-sandbox ${selectedStage === 'reminder_1' ? 'border-primary' : ''}`}
              style={{
                padding: '0.85rem',
                textAlign: 'left',
                border: selectedStage === 'reminder_1' ? '2px solid #3f78e0' : '1px solid var(--sb-border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--sb-heading)' }}>1. Friendly Reminder</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Day 7 • €0 fee • Bancontact link
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage('formal_notice')}
              className={`card-sandbox ${selectedStage === 'formal_notice' ? 'border-primary' : ''}`}
              style={{
                padding: '0.85rem',
                textAlign: 'left',
                border: selectedStage === 'formal_notice' ? '2px solid #3f78e0' : '1px solid var(--sb-border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--sb-heading)' }}>2. Notice of Default</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Day 14 • +€40 fee • Legal interest
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStage('bailiff_notice')}
              className={`card-sandbox ${selectedStage === 'bailiff_notice' ? 'border-primary' : ''}`}
              style={{
                padding: '0.85rem',
                textAlign: 'left',
                border: selectedStage === 'bailiff_notice' ? '2px solid #3f78e0' : '1px solid var(--sb-border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--sb-heading)' }}>3. Pre-Legal Bailiff</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Day 30 • Judicial enforcement
              </div>
            </button>
          </div>
        </div>

        {/* Legal Text Preview */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--sb-bg)',
            border: '1px solid var(--sb-border)',
            borderRadius: '10px',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            color: 'var(--sb-body)',
            lineHeight: 1.5,
            marginBottom: '1.25rem',
            maxHeight: '130px',
            overflowY: 'auto',
          }}
        >
          {selectedStage === 'reminder_1' && (
            <p style={{ margin: 0 }}>
              Geachte klant,<br />
              Volgens onze administratie staat factuur <strong>{dunningCase.invoiceNumber}</strong> ten bedrage van <strong>€{dunningCase.balanceDue.toFixed(2)}</strong> (vervaldatum {dunningCase.dueDate}) nog open.<br />
              Gelieve dit bedrag binnen 7 dagen over te maken via Bancontact: https://pay.pulsework.be/{dunningCase.invoiceId}
            </p>
          )}

          {selectedStage === 'formal_notice' && (
            <p style={{ margin: 0, color: '#ef4444' }}>
              <strong>AANGETEKENDE INGEBREKESTELLING (Art. 5.231 BW & Wet B2B Betalingsachterstand)</strong><br />
              Ondanks eerdere herinnering bleef factuur {dunningCase.invoiceNumber} onbetaald. Krachtens Boek XIX WER wordt een forfaitaire schadevergoeding van €40,00 vermeerderd met de wettelijke nalatigheidsintrest (12,5%) gevorderd. Totaal verschuldigd: <strong>€{dunningCase.totalClaim.toFixed(2)}</strong>.
            </p>
          )}

          {selectedStage === 'bailiff_notice' && (
            <p style={{ margin: 0, color: '#b91c1c' }}>
              <strong>LAATSTE AANMANING VÓÓR GERECHTELIJKE INVORDERING (Art. 1394/20 Ger.W.)</strong><br />
              Bij gebrek aan betaling binnen 48 uur wordt het dossier onherroepelijk overgedragen aan het gerechtsdeurwaarderskantoor (Unpaid.be / Modero) voor betekening van een uitvoerbare titel. Alle bijkomende kosten vallen ten laste van de schuldenaar.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleDownloadBailiffExport}
            className="btn-sandbox btn-sandbox-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
          >
            <Download size={14} />
            <span>Export Bailiff Dossier JSON</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
              Close
            </button>
            <button
              type="button"
              onClick={handleSendNotice}
              className="btn-sandbox btn-sandbox-primary"
              style={{
                backgroundColor: selectedStage === 'bailiff_notice' ? '#dc2626' : '#3f78e0',
                borderColor: selectedStage === 'bailiff_notice' ? '#dc2626' : '#3f78e0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Send size={15} />
              <span>Dispatch {selectedStage === 'reminder_1' ? 'Reminder' : selectedStage === 'formal_notice' ? 'Notice of Default' : 'Bailiff Escalation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
