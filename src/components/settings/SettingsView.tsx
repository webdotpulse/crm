import React, { useState } from 'react'
import {
  Settings,
  Building2,
  ShieldCheck,
  CreditCard,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react'
import { CompanyProfile } from '../../types'
import { useApp } from '../../context/AppContext'

export const SettingsView: React.FC = () => {
  const {
    companyProfile,
    updateCompanyProfile,
    resetToDemoData,
    exportDataJson,
    importDataJson,
  } = useApp()

  const [formData, setFormData] = useState<CompanyProfile>(companyProfile)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [importJsonText, setImportJsonText] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateCompanyProfile(formData)
    showToast('✓ Company Profile & Peppol Configuration updated!')
  }

  const handleExport = () => {
    const jsonStr = exportDataJson()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pulsework_crm_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ Backup exported to JSON')
  }

  const handleImport = () => {
    if (!importJsonText.trim()) return
    const success = importDataJson(importJsonText)
    if (success) {
      showToast('✓ Backup restored successfully!')
      setImportJsonText('')
    } else {
      showToast('⚠ Invalid JSON backup format')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
          {toastMessage.startsWith('✓') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Company Settings & Peppol Configuration</h1>
        <p style={{ color: 'var(--sb-body)' }}>
          Configure legal entity details, SEPA bank coordinates, and Access Point gateway parameters for European e-invoicing.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Legal Entity */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building2 size={20} color="var(--sb-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Organization Profile</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Trading Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Legal Name (For Invoices)</label>
              <input
                type="text"
                required
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Country Code</label>
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Peppol & SEPA Configuration */}
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShieldCheck size={20} color="var(--sb-success)" />
            <h3 style={{ fontSize: '1.15rem' }}>Peppol Network & Financial Coordinates</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">VAT Identifier *</label>
              <input
                type="text"
                required
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Peppol Scheme (ISO 6523)</label>
              <select
                value={formData.peppolScheme}
                onChange={(e) => setFormData({ ...formData, peppolScheme: e.target.value })}
                className="form-select-sandbox"
              >
                <option value="0208">0208 - Belgium KBO/BCE</option>
                <option value="0106">0106 - Netherlands KvK</option>
                <option value="9930">9930 - Germany VAT</option>
                <option value="0088">0088 - GS1 GLN</option>
              </select>
            </div>
            <div>
              <label className="form-label">Peppol Endpoint ID</label>
              <input
                type="text"
                required
                value={formData.peppolEndpoint}
                onChange={(e) => setFormData({ ...formData, peppolEndpoint: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">SEPA IBAN Account *</label>
              <input
                type="text"
                required
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="form-input-sandbox"
                style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 600 }}
              />
            </div>
            <div>
              <label className="form-label">BIC / SWIFT *</label>
              <input
                type="text"
                required
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Access Point Name</label>
              <input
                type="text"
                value={formData.peppolAccessPointName}
                onChange={(e) => setFormData({ ...formData, peppolAccessPointName: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Gateway URL</label>
              <input
                type="text"
                value={formData.peppolAccessPointUrl}
                onChange={(e) => setFormData({ ...formData, peppolAccessPointUrl: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Access Point API Key</label>
              <input
                type="password"
                value={formData.peppolApiKey}
                onChange={(e) => setFormData({ ...formData, peppolApiKey: e.target.value })}
                className="form-input-sandbox"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="submit" className="btn-sandbox btn-sandbox-primary btn-sandbox-lg">
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Section 3: Data Management & Backup */}
      <div className="card-sandbox" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Database size={20} color="var(--sb-purple)" />
          <h3 style={{ fontSize: '1.15rem' }}>Data Backup & Demo Reset</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
          Export all CRM records, projects, quotations, invoices, and Peppol logs to JSON, or restore default demo data.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button onClick={handleExport} className="btn-sandbox btn-sandbox-secondary">
            <Download size={15} />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data to default demo state?')) {
                resetToDemoData()
                showToast('✓ Reset to demo dataset complete!')
              }
            }}
            className="btn-sandbox btn-sandbox-danger"
          >
            <RotateCcw size={15} />
            <span>Reset to Demo Data</span>
          </button>
        </div>

        {/* Import Box */}
        <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1rem' }}>
          <label className="form-label">Restore from JSON Backup</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON backup payload here..."
              className="form-input-sandbox"
            />
            <button onClick={handleImport} className="btn-sandbox btn-sandbox-primary">
              <Upload size={14} />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
