import React, { useState } from 'react'
import {
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
  Copy,
  Search,
  Sparkles,
  Send,
  Building2,
  Receipt,
  Server,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Invoice, Company, PeppolValidationReport, PeppolTransmissionLog } from '../../types'
import { useApp } from '../../context/AppContext'
import { generatePeppolUblXml } from '../../services/peppolGenerator'
import { validatePeppolInvoice } from '../../services/peppolValidator'
import { lookupPeppolParticipant, PeppolParticipantInfo } from '../../services/peppolDispatcher'

interface PeppolHubViewProps {
  selectedInvoice?: Invoice | null
}

export const PeppolHubView: React.FC<PeppolHubViewProps> = ({ selectedInvoice }) => {
  const {
    invoices,
    companies,
    companyProfile,
    peppolLogs,
    sendInvoiceViaPeppol,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'generator' | 'validator' | 'lookup' | 'logs'>('generator')
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>(
    selectedInvoice?.id || invoices[0]?.id || ''
  )
  const [copied, setCopied] = useState(false)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Directory Lookup State
  const [lookupScheme, setLookupScheme] = useState('0208')
  const [lookupEndpoint, setLookupEndpoint] = useState('0842123456')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<PeppolParticipantInfo | null>(null)

  const currentInvoice = invoices.find((i) => i.id === currentInvoiceId) || invoices[0]
  const buyerCompany = currentInvoice ? companies.find((c) => c.id === currentInvoice.companyId) : null

  // Generate XML & Run Validation for current invoice
  const generatedXml =
    currentInvoice && buyerCompany
      ? generatePeppolUblXml(currentInvoice, companyProfile, buyerCompany)
      : '<!-- Please select an invoice to generate Peppol BIS 3.0 XML -->'

  const validationReport: PeppolValidationReport | null =
    currentInvoice && buyerCompany
      ? validatePeppolInvoice(currentInvoice, companyProfile, buyerCompany)
      : null

  const handleCopyXml = () => {
    navigator.clipboard.writeText(generatedXml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadXml = () => {
    if (!currentInvoice) return
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentInvoice.number}_peppol_bis3_ubl.xml`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleTransmit = async () => {
    if (!currentInvoice) return
    setIsTransmitting(true)
    const result = await sendInvoiceViaPeppol(currentInvoice.id)
    setIsTransmitting(false)
    if (result.success) {
      setToastMessage('✓ Successfully transmitted invoice via Peppol AS4 network! Receipt MDN verified.')
    } else {
      setToastMessage(`⚠ Dispatch Failed: ${result.error}`)
    }
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handlePerformLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupEndpoint.trim()) return
    setLookupLoading(true)
    const res = await lookupPeppolParticipant(lookupScheme, lookupEndpoint)
    setLookupResult(res)
    setLookupLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '1rem 1.5rem',
            borderRadius: 'var(--sb-radius)',
            backgroundColor: toastMessage.startsWith('✓') ? '#1d7e63' : '#b8333d',
            color: '#ffffff',
            fontWeight: 700,
            boxShadow: 'var(--sb-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          {toastMessage.startsWith('✓') ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--sb-primary), #605dba)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(63, 120, 224, 0.35)',
            }}
          >
            <Network size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.85rem' }}>Peppol BIS Billing 3.0 Hub</h1>
              <span className="badge-soft badge-soft-success">EN 16931 COMPLIANT</span>
            </div>
            <p style={{ color: 'var(--sb-body)' }}>
              OpenPeppol e-Delivery Gateway, UBL 2.1 XML Generator, Schematron Rules Validator & Participant Directory.
            </p>
          </div>
        </div>

        {/* Invoice Selector Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
            Active Invoice:
          </label>
          <select
            value={currentInvoiceId}
            onChange={(e) => setCurrentInvoiceId(e.target.value)}
            className="form-select-sandbox"
            style={{ height: '38px', minWidth: '220px', fontWeight: 600 }}
          >
            {invoices.map((inv) => {
              const comp = companies.find((c) => c.id === inv.companyId)
              return (
                <option key={inv.id} value={inv.id}>
                  {inv.number} - {comp?.name || 'Client'} (€{inv.total.toFixed(2)})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--sb-border)',
          marginBottom: '1.75rem',
          gap: '0.5rem',
        }}
      >
        {[
          { id: 'generator', label: 'UBL XML Generator & Viewer', icon: <FileCode size={16} /> },
          { id: 'validator', label: `EN 16931 Validator (${validationReport?.rules.length || 0} Rules)`, icon: <ShieldCheck size={16} /> },
          { id: 'lookup', label: 'Peppol Directory Lookup', icon: <Search size={16} /> },
          { id: 'logs', label: `AS4 Transmission Logs (${peppolLogs.length})`, icon: <Server size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="btn-sandbox"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--sb-radius-sm) var(--sb-radius-sm) 0 0',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--sb-primary)' : 'transparent'}`,
              backgroundColor: activeTab === tab.id ? 'var(--sb-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--sb-primary)' : 'var(--sb-body)',
              fontWeight: 700,
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: XML GENERATOR & VIEWER */}
      {activeTab === 'generator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Peppol UBL 2.1 XML Document</span>
                  <span className="badge-soft badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                    Profile: poacc:billing:01:1.0
                  </span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                  Sender: <strong>{companyProfile.peppolScheme}:{companyProfile.peppolEndpoint}</strong> ➔ Recipient: <strong>{buyerCompany?.peppolScheme || '0208'}:{buyerCompany?.peppolEndpoint || buyerCompany?.vatNumber}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={handleCopyXml} className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary">
                  <Copy size={14} />
                  <span>{copied ? 'Copied!' : 'Copy XML'}</span>
                </button>

                <button onClick={handleDownloadXml} className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary">
                  <Download size={14} />
                  <span>Download .xml</span>
                </button>

                <button
                  onClick={handleTransmit}
                  disabled={isTransmitting}
                  className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                >
                  <Send size={14} />
                  <span>{isTransmitting ? 'Dispatching AS4...' : 'Send via Peppol'}</span>
                </button>
              </div>
            </div>

            {/* XML Code Box */}
            <div
              style={{
                backgroundColor: 'var(--sb-dark)',
                color: '#e2e8f0',
                padding: '1.25rem',
                borderRadius: 'var(--sb-radius-sm)',
                fontFamily: 'var(--sb-font-mono)',
                fontSize: '0.8rem',
                maxHeight: '520px',
                overflowY: 'auto',
                lineHeight: 1.5,
                whiteSpace: 'pre',
                border: '1px solid var(--sb-border)',
              }}
            >
              {generatedXml}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EN 16931 VALIDATOR */}
      {activeTab === 'validator' && validationReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Validation Header Card */}
          <div
            className="card-sandbox"
            style={{
              padding: '1.5rem',
              backgroundColor: validationReport.isValid ? 'var(--sb-success-soft)' : 'var(--sb-danger-soft)',
              border: `1px solid ${validationReport.isValid ? 'var(--sb-success)' : 'var(--sb-danger)'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {validationReport.isValid ? (
                  <CheckCircle2 size={32} color="var(--sb-success)" />
                ) : (
                  <AlertTriangle size={32} color="var(--sb-danger)" />
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: validationReport.isValid ? 'var(--sb-success-text)' : 'var(--sb-danger-text)' }}>
                    {validationReport.isValid
                      ? '✓ EN 16931 & Peppol BIS 3.0 Validation: PASSED'
                      : '⚠ Validation Violations Found'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--sb-heading)' }}>
                    Specification: {validationReport.customizationId}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                    {validationReport.rules.filter((r) => r.passed).length} / {validationReport.rules.length} Rules Passed
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                    {validationReport.errorCount} Errors • {validationReport.warningCount} Warnings
                  </span>
                </div>

                {validationReport.isValid && (
                  <button onClick={handleTransmit} disabled={isTransmitting} className="btn-sandbox btn-sandbox-primary">
                    <Send size={15} />
                    <span>Transmit via AS4</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rules Table */}
          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table className="table-sandbox">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Rule ID</th>
                  <th style={{ width: '12%' }}>Category</th>
                  <th style={{ width: '53%' }}>Assertion / Business Rule</th>
                  <th style={{ width: '10%' }}>Target Field</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {validationReport.rules.map((rule) => (
                  <tr key={rule.ruleId}>
                    <td>
                      <span style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 700, fontSize: '0.78rem' }}>
                        {rule.ruleId}
                      </span>
                    </td>
                    <td>
                      <span className="badge-soft badge-soft-dark" style={{ textTransform: 'capitalize' }}>
                        {rule.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--sb-heading)' }}>{rule.message}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)', fontFamily: 'var(--sb-font-mono)' }}>
                        {rule.field || '-'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {rule.passed ? (
                        <span className="badge-soft badge-soft-success">
                          <CheckCircle2 size={12} />
                          <span>PASSED</span>
                        </span>
                      ) : (
                        <span className={`badge-soft badge-soft-${rule.severity === 'error' ? 'danger' : 'warning'}`}>
                          <AlertTriangle size={12} />
                          <span>{rule.severity.toUpperCase()}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PEPPOL DIRECTORY LOOKUP */}
      {activeTab === 'lookup' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Query Form */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Search Peppol Participant Directory</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
              Query the SMP / SML infrastructure to verify whether any European enterprise or public authority is registered to receive Peppol invoices.
            </p>

            <form onSubmit={handlePerformLookup}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Electronic Address Scheme (ISO 6523)</label>
                <select
                  value={lookupScheme}
                  onChange={(e) => setLookupScheme(e.target.value)}
                  className="form-select-sandbox"
                >
                  <option value="0208">0208 - Belgian Enterprise Number (KBO / BCE)</option>
                  <option value="0106">0106 - Netherlands Chamber of Commerce (KvK)</option>
                  <option value="0190">0190 - Netherlands Organization Identification (OIN)</option>
                  <option value="9930">9930 - Germany VAT Number</option>
                  <option value="9944">9944 - Austria VAT Number</option>
                  <option value="0088">0088 - GS1 Global Location Number (GLN)</option>
                  <option value="9920">9920 - Spain VAT Number</option>
                  <option value="9956">9956 - Belgian VAT (General)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Endpoint Identifier *</label>
                <input
                  type="text"
                  required
                  value={lookupEndpoint}
                  onChange={(e) => setLookupEndpoint(e.target.value)}
                  placeholder="e.g. 0842123456 or DE312987654"
                  className="form-input-sandbox"
                />
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="btn-sandbox btn-sandbox-primary"
                style={{ width: '100%' }}
              >
                <Search size={15} />
                <span>{lookupLoading ? 'Querying OpenPeppol SMP...' : 'Lookup Participant'}</span>
              </button>
            </form>
          </div>

          {/* Result Card */}
          <div className="card-sandbox" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Directory Response</h3>

              {lookupResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--sb-radius-sm)',
                      backgroundColor: lookupResult.registered ? 'var(--sb-success-soft)' : 'var(--sb-warning-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {lookupResult.registered ? (
                      <CheckCircle2 size={20} color="var(--sb-success)" />
                    ) : (
                      <AlertTriangle size={20} color="var(--sb-warning)" />
                    )}
                    <span style={{ fontWeight: 700, color: lookupResult.registered ? 'var(--sb-success-text)' : 'var(--sb-warning-text)' }}>
                      {lookupResult.registered ? 'Registered Peppol Participant' : 'Participant Not Found on SMP'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div>
                      <strong>Entity Name:</strong> {lookupResult.name}
                    </div>
                    <div>
                      <strong>Country:</strong> {lookupResult.country}
                    </div>
                    <div>
                      <strong>Access Point Gateway:</strong> {lookupResult.accessPointProvider}
                    </div>
                    {lookupResult.registrationDate && (
                      <div>
                        <strong>Registered Since:</strong> {lookupResult.registrationDate}
                      </div>
                    )}
                  </div>

                  {lookupResult.supportedProfiles.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body-subtle)' }}>
                        SUPPORTED DOCUMENT PROFILES:
                      </span>
                      <ul style={{ paddingLeft: '1.25rem', marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                        {lookupResult.supportedProfiles.map((p, i) => (
                          <li key={i} style={{ fontFamily: 'var(--sb-font-mono)' }}>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--sb-body-subtle)' }}>
                  Enter an electronic scheme and ID on the left to verify network connectivity.
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '0.75rem', fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
              Connected to OpenPeppol Production SMP Service.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AS4 TRANSMISSION LOGS */}
      {activeTab === 'logs' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table className="table-sandbox">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Invoice #</th>
                <th>Recipient Endpoint</th>
                <th>AS4 MDN Receipt ID</th>
                <th>Status</th>
                <th>Gateway Response</th>
              </tr>
            </thead>
            <tbody>
              {peppolLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body-subtle)' }}>
                    No electronic documents transmitted yet.
                  </td>
                </tr>
              ) : (
                peppolLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--sb-heading)' }}>{log.invoiceNumber}</strong>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.78rem', color: 'var(--sb-primary)' }}>
                        {log.recipientEndpoint}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
                        {log.accessPointReceiptId ? log.accessPointReceiptId.slice(0, 32) + '...' : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-soft badge-soft-${log.status === 'success' ? 'success' : 'danger'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                      {log.responseMessage}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
