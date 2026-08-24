import React, { useState } from 'react'
import { X, Landmark, Download, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatCurrency } from '../../services/currencyService'

interface SepaBatchModalProps {
  onClose: () => void
}

export const SepaBatchModal: React.FC<SepaBatchModalProps> = ({ onClose }) => {
  const { invoices, companies, individuals, activeLegalEntity, generateSepaBatch, selectedCurrency } = useApp()

  const eligibleInvoices = invoices.filter((i) => i.status === 'issued' || i.status === 'overdue' || i.status === 'peppol_sent')
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(eligibleInvoices.map((i) => i.id))
  const [collectionDate, setCollectionDate] = useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  )
  const [generatedBatch, setGeneratedBatch] = useState<any | null>(null)

  const toggleInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectedTotal = eligibleInvoices
    .filter((i) => selectedInvoiceIds.includes(i.id))
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0)

  const handleGenerate = () => {
    if (selectedInvoiceIds.length === 0) return
    const batch = generateSepaBatch(selectedInvoiceIds, collectionDate)
    setGeneratedBatch(batch)
  }

  const handleDownloadXml = () => {
    if (!generatedBatch) return
    const blob = new Blob([generatedBatch.generatedXml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedBatch.batchReference}_pain008.xml`
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
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: 'var(--sb-card-bg)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(63, 120, 224, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <Landmark size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                SEPA Direct Debit (pain.008) Batch Generator
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                Collect customer invoice payments automatically via EPC ISO 20022 Direct Debit
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-body)' }}>
            <X size={20} />
          </button>
        </div>

        {!generatedBatch ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                  Creditor Legal Entity
                </label>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  {activeLegalEntity.legalName || activeLegalEntity.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>IBAN: {activeLegalEntity.iban}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                  Target Collection Date (D+2)
                </label>
                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                  Select Outstanding Invoices to Collect ({selectedInvoiceIds.length})
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sb-primary)' }}>
                  Total: {formatCurrency(selectedTotal, selectedCurrency)}
                </span>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--sb-border)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                }}
              >
                {eligibleInvoices.map((inv) => {
                  const comp = companies.find((c) => c.id === inv.companyId)
                  const ind = individuals.find((i) => i.id === inv.individualId)
                  const clientName = comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Client'
                  const isChecked = selectedInvoiceIds.includes(inv.id)

                  return (
                    <div
                      key={inv.id}
                      onClick={() => toggleInvoice(inv.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? 'var(--sb-primary-soft)' : 'transparent',
                        cursor: 'pointer',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => {}} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                            {inv.number} — {clientName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
                            Ref: {inv.structuredReference} • Due: {inv.dueDate}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>
                        {formatCurrency(inv.total - inv.amountPaid, selectedCurrency)}
                      </div>
                    </div>
                  )
                })}

                {eligibleInvoices.length === 0 && (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--sb-body)', fontSize: '0.8rem' }}>
                    No pending invoices available for SEPA Direct Debit collection.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.6rem 1.25rem' }}>
                Cancel
              </button>
              <button
                disabled={selectedInvoiceIds.length === 0}
                onClick={handleGenerate}
                className="btn-sandbox btn-sandbox-primary"
                style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Landmark size={16} />
                Generate SEPA Direct Debit XML
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--sb-bg)',
                borderRadius: '12px',
                border: '1px solid var(--sb-border)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  SEPA Direct Debit File Successfully Created
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', lineHeight: 1.5 }}>
                Batch Reference: <strong>{generatedBatch.batchReference}</strong><br />
                Total Collection: <strong>{formatCurrency(generatedBatch.totalAmount, selectedCurrency)}</strong> across{' '}
                <strong>{generatedBatch.transactionCount} transactions</strong>.<br />
                EPC ISO 20022 Scheme: <code>pain.008.001.02 (CORE / RCUR)</code>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Generated ISO 20022 XML Preview
              </label>
              <textarea
                readOnly
                value={generatedBatch.generatedXml}
                className="input-sandbox"
                rows={6}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.7rem', padding: '0.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.6rem 1.25rem' }}>
                Close
              </button>
              <button
                onClick={handleDownloadXml}
                className="btn-sandbox btn-sandbox-primary"
                style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} />
                Download pain.008 XML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
