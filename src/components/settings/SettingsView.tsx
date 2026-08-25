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
  Plus,
  Percent,
  Mail,
  FileText,
  Trash2,
  Edit2,
  Globe,
  Palette,
  Check,
  Copy,
  Layout,
  Type,
  Maximize2,
  Code2,
  Sparkles,
  Server,
  HardDrive,
  Users,
} from 'lucide-react'
import { CompanyProfile, LegalEntity, VatRate, EmailTemplate, DocumentTemplate, FontFamilyOption, BorderRadiusOption, DensityOption } from '../../types'
import { useApp } from '../../context/AppContext'
import { themePresets } from '../../services/themeService'
import { DEFAULT_COMPANY_LOGO } from '../../data/initialData'

export const SettingsView: React.FC = () => {
  const {
    companyProfile,
    updateCompanyProfile,
    legalEntities,
    addLegalEntity,
    updateLegalEntity,
    deleteLegalEntity,
    activeLegalEntityId,
    setActiveLegalEntityId,
    vatRates,
    addVatRate,
    updateVatRate,
    deleteVatRate,
    emailTemplates,
    updateEmailTemplate,
    documentTemplates,
    resetToDemoData,
    exportDataJson,
    importDataJson,
    databaseConfig,
    isInstalled,
    resetToInstaller,
    customTheme,
    updateCustomTheme,
    setThemePreset,
    resetCustomTheme,
    setIsThemeCustomizerOpen,
    theme,
    toggleTheme,
    currentUser,
    users,
    securityPolicy,
    updateSecurityPolicy,
    setCurrentView,
    setTwoFactorSetupModalUser,
    isPrivacyModeActive,
    togglePrivacyMode,
    lockScreen,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'entities' | 'vat' | 'templates' | 'branding' | 'security' | 'backup'>('entities')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [importJsonText, setImportJsonText] = useState('')

  // Legal Entity Modal / Edit state
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null)
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false)
  const [entityFormData, setEntityFormData] = useState<Partial<LegalEntity>>({
    name: '',
    legalName: '',
    vatNumber: '',
    peppolScheme: '0208',
    peppolEndpoint: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Belgium',
    countryCode: 'BE',
    iban: '',
    bic: '',
    defaultCurrency: 'EUR',
    invoicePrefix: 'INV-',
    isDefault: false,
    accentColor: '#3f78e0',
  })

  // VAT Rate Add state
  const [newVatName, setNewVatName] = useState('')
  const [newVatRate, setNewVatRate] = useState<number>(21)
  const [newVatCategory, setNewVatCategory] = useState<'S' | 'Z' | 'E' | 'AE' | 'AA'>('S')
  const [newVatCountry, setNewVatCountry] = useState('BE')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleOpenEntityModal = (entity?: LegalEntity) => {
    if (entity) {
      setEditingEntity(entity)
      setEntityFormData(entity)
    } else {
      setEditingEntity(null)
      setEntityFormData({
        name: '',
        legalName: '',
        vatNumber: '',
        peppolScheme: '0208',
        peppolEndpoint: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Belgium',
        countryCode: 'BE',
        iban: '',
        bic: '',
        defaultCurrency: 'EUR',
        invoicePrefix: 'INV-',
        isDefault: false,
        accentColor: '#3f78e0',
      })
    }
    setIsEntityModalOpen(true)
  }

  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityFormData.name || !entityFormData.vatNumber) return

    if (editingEntity) {
      updateLegalEntity({
        ...editingEntity,
        ...(entityFormData as LegalEntity),
      })
      showToast('✓ Legal Entity updated successfully!')
    } else {
      const newEntity: LegalEntity = {
        id: `ent-${Date.now()}`,
        name: entityFormData.name || 'New Entity',
        legalName: entityFormData.legalName || entityFormData.name || '',
        vatNumber: entityFormData.vatNumber || '',
        peppolScheme: entityFormData.peppolScheme || '0208',
        peppolEndpoint: entityFormData.peppolEndpoint || '',
        email: entityFormData.email || '',
        phone: entityFormData.phone || '',
        website: entityFormData.website || '',
        address: entityFormData.address || '',
        city: entityFormData.city || '',
        postalCode: entityFormData.postalCode || '',
        country: entityFormData.country || 'Belgium',
        countryCode: entityFormData.countryCode || 'BE',
        iban: entityFormData.iban || '',
        bic: entityFormData.bic || '',
        defaultCurrency: entityFormData.defaultCurrency || 'EUR',
        invoicePrefix: entityFormData.invoicePrefix || 'INV-',
        isDefault: false,
        accentColor: entityFormData.accentColor || '#3f78e0',
      }
      addLegalEntity(newEntity)
      showToast('✓ New Legal Entity registered!')
    }
    setIsEntityModalOpen(false)
  }

  const handleAddVatRate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVatName) return
    const newRate: VatRate = {
      id: `vat-${Date.now()}`,
      name: newVatName,
      rate: Number(newVatRate),
      taxCategory: newVatCategory,
      countryCode: newVatCountry,
      isDefault: false,
    }
    addVatRate(newRate)
    setNewVatName('')
    showToast('✓ VAT rate added!')
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
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
          }}
        >
          {toastMessage.startsWith('✓') ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Settings & Business Configuration</h1>
        <p style={{ color: 'var(--sb-body)' }}>
          Manage multiple legal entities, customizable VAT rates, proposal templates, and email automation.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--sb-border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('entities')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'entities' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'entities' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'entities' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Building2 size={18} />
          <span>Legal Entities ({legalEntities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vat')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'vat' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'vat' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'vat' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Percent size={18} />
          <span>VAT & Tax Rates ({vatRates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'templates' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'templates' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'templates' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Mail size={18} />
          <span>Email & Document Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'branding' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'branding' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'branding' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Palette size={18} />
          <span>🎨 Theme & Custom Styling</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'security' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'security' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={18} color="var(--sb-success)" />
          <span>🛡️ Security & 2FA</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className="btn-sandbox btn-sandbox-ghost"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: activeTab === 'backup' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            color: activeTab === 'backup' ? 'var(--sb-primary)' : 'var(--sb-body)',
            fontWeight: activeTab === 'backup' ? 700 : 500,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Database size={18} />
          <span>Backup & Reset</span>
        </button>
      </div>

      {/* TAB 1: Multiple Legal Entities & Company Profile */}
      {activeTab === 'entities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Main Organization Profile & Company Logo */}
          <div className="card-sandbox" style={{ padding: '1.75rem', backgroundColor: 'var(--sb-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--sb-heading)' }}>
                  🏢 Organization Profile & Global Brand Logo
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', margin: '0.2rem 0 0 0' }}>
                  This logo and official identity appear on all quotations, offers, invoices, and client sign-off portals.
                </p>
              </div>
              <span className="badge-sandbox badge-soft-success">Active Master Profile</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.75rem', alignItems: 'flex-start' }}>
              {/* Logo Preview & Upload Box */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '220px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '90px',
                    borderRadius: 'var(--sb-radius)',
                    backgroundColor: '#ffffff',
                    border: '2px solid var(--sb-border)',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: 'var(--sb-shadow-sm)',
                  }}
                >
                  {companyProfile.logoUrl ? (
                    <img
                      src={companyProfile.logoUrl}
                      alt="Company Logo Preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>No Logo</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  <label
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                    style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              updateCompanyProfile({ logoUrl: reader.result })
                              showToast('✓ Company logo updated!')
                            }
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateCompanyProfile({ logoUrl: DEFAULT_COMPANY_LOGO })
                      showToast('✓ Default logo restored!')
                    }}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Reset
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Paste direct Image URL..."
                  value={companyProfile.logoUrl || ''}
                  onChange={(e) => updateCompanyProfile({ logoUrl: e.target.value })}
                  className="form-input-sandbox"
                  style={{ fontSize: '0.75rem', width: '100%' }}
                />
              </div>

              {/* Organization Metadata Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label">Trading Name</label>
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) => updateCompanyProfile({ name: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">Legal Name (For Invoices/Contracts)</label>
                  <input
                    type="text"
                    value={companyProfile.legalName}
                    onChange={(e) => updateCompanyProfile({ legalName: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">VAT / Enterprise Number</label>
                  <input
                    type="text"
                    value={companyProfile.vatNumber}
                    onChange={(e) => updateCompanyProfile({ vatNumber: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">Billing Email</label>
                  <input
                    type="email"
                    value={companyProfile.email}
                    onChange={(e) => updateCompanyProfile({ email: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>
                <div>
                  <label className="form-label">Main SEPA IBAN</label>
                  <input
                    type="text"
                    value={companyProfile.iban}
                    onChange={(e) => updateCompanyProfile({ iban: e.target.value })}
                    className="form-input-sandbox"
                    style={{ fontFamily: 'var(--sb-font-mono)' }}
                  />
                </div>
                <div>
                  <label className="form-label">Peppol Scheme & Endpoint</label>
                  <input
                    type="text"
                    value={`${companyProfile.peppolScheme}:${companyProfile.peppolEndpoint}`}
                    readOnly
                    className="form-input-sandbox"
                    style={{ color: 'var(--sb-primary)', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Issuing Legal Entities</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)' }}>
                Configure multiple corporate entities or national branches with distinct Peppol schemes, VAT numbers, and SEPA bank accounts.
              </p>
            </div>
            <button onClick={() => handleOpenEntityModal()} className="btn-sandbox btn-sandbox-primary">
              <Plus size={16} />
              <span>Add Legal Entity</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
            {legalEntities.map((ent) => {
              const isActive = ent.id === activeLegalEntityId

              return (
                <div
                  key={ent.id}
                  className="card-sandbox"
                  style={{
                    padding: '1.5rem',
                    border: isActive ? '2px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: `${ent.accentColor || '#3f78e0'}18`,
                          color: ent.accentColor || '#3f78e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                        }}
                      >
                        {ent.countryCode}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)' }}>{ent.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{ent.legalName}</span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="badge-sandbox badge-soft-primary">Active Selection</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sb-body)' }}>VAT Identifier:</span>
                      <strong style={{ fontFamily: 'var(--sb-font-mono)' }}>{ent.vatNumber}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sb-body)' }}>Peppol Endpoint:</span>
                      <strong style={{ fontFamily: 'var(--sb-font-mono)' }}>{ent.peppolScheme}:{ent.peppolEndpoint}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sb-body)' }}>SEPA IBAN:</span>
                      <strong style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.8rem' }}>{ent.iban}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sb-body)' }}>Invoice Prefix:</span>
                      <span className="badge-sandbox badge-soft-purple">{ent.invoicePrefix}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sb-body)' }}>Location:</span>
                      <span>{ent.city}, {ent.country}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--sb-border)', paddingTop: '0.75rem' }}>
                    {!isActive ? (
                      <button
                        onClick={() => {
                          setActiveLegalEntityId(ent.id)
                          showToast(`✓ Switched active issuing entity to ${ent.name}`)
                        }}
                        className="btn-sandbox btn-sandbox-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Set as Active
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--sb-success)', fontWeight: 700 }}>
                        ✓ Default for Invoices
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleOpenEntityModal(ent)}
                        className="btn-sandbox btn-sandbox-ghost"
                        style={{ padding: '0.35rem' }}
                        title="Edit Entity"
                      >
                        <Edit2 size={15} />
                      </button>
                      {legalEntities.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete entity ${ent.name}?`)) {
                              deleteLegalEntity(ent.id)
                              showToast('✓ Entity removed')
                            }
                          }}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ padding: '0.35rem', color: 'var(--sb-danger)' }}
                          title="Delete Entity"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VAT & Tax Rates */}
      {activeTab === 'vat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Configured VAT & Tax Rates</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
              Tax categories map automatically to European standard EN 16931 and Peppol UBL billing specifications.
            </p>

            <table className="table-sandbox">
              <thead>
                <tr>
                  <th>Tax Name & Description</th>
                  <th>Rate (%)</th>
                  <th>Country</th>
                  <th>UBL Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vatRates.map((vr) => (
                  <tr key={vr.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{vr.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>{vr.description || 'Standard rate'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-primary)' }}>
                        {vr.rate}%
                      </span>
                    </td>
                    <td>
                      <span className="badge-sandbox badge-soft-primary">{vr.countryCode}</span>
                    </td>
                    <td>
                      <span className="badge-sandbox badge-soft-purple">{vr.taxCategory}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          if (confirm(`Remove VAT rate ${vr.name}?`)) {
                            deleteVatRate(vr.id)
                          }
                        }}
                        className="btn-sandbox btn-sandbox-ghost"
                        style={{ padding: '0.35rem', color: 'var(--sb-danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New VAT Rate Form */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Add New Tax Rate</h3>
            <form onSubmit={handleAddVatRate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Tax Rate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reduced Food & Culture (6%)"
                  value={newVatName}
                  onChange={(e) => setNewVatName(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">VAT Percentage (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVatRate}
                    onChange={(e) => setNewVatRate(parseFloat(e.target.value) || 0)}
                    className="form-input-sandbox"
                  />
                </div>

                <div>
                  <label className="form-label">Country Code</label>
                  <input
                    type="text"
                    required
                    value={newVatCountry}
                    onChange={(e) => setNewVatCountry(e.target.value)}
                    className="form-input-sandbox"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Peppol / UBL Tax Category Code</label>
                <select
                  value={newVatCategory}
                  onChange={(e) => setNewVatCategory(e.target.value as any)}
                  className="form-select-sandbox"
                >
                  <option value="S">S — Standard Rate</option>
                  <option value="AA">AA — Lower / Reduced Rate</option>
                  <option value="AE">AE — Reverse Charge (Intra-Community)</option>
                  <option value="Z">Z — Zero Rated (Export)</option>
                  <option value="E">E — Exempt</option>
                </select>
              </div>

              <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={15} />
                <span>Save VAT Rate</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Templates */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email Templates */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Email Dispatch Templates</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
              Dynamic placeholders like <code>{'{{client_name}}'}</code>, <code>{'{{document_number}}'}</code>, <code>{'{{total_amount}}'}</code>, and <code>{'{{signature_link}}'}</code> are substituted at runtime.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
              {emailTemplates.map((et) => (
                <div key={et.id} style={{ border: '1px solid var(--sb-border)', borderRadius: 'var(--sb-radius)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--sb-heading)' }}>{et.name}</strong>
                    <span className="badge-sandbox badge-soft-primary">{et.type}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '0.5rem' }}>
                    Subject: <code>{et.subject}</code>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {et.variables.slice(0, 5).map((v) => (
                      <span key={v} className="badge-sandbox badge-soft-purple" style={{ fontSize: '0.68rem' }}>
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Templates */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Commercial Proposal & Invoice Templates</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
              Pre-saved quotation line items for fast 1-click proposal creation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
              {documentTemplates.map((dt) => (
                <div key={dt.id} style={{ border: '1px solid var(--sb-border)', borderRadius: 'var(--sb-radius)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--sb-heading)' }}>{dt.name}</strong>
                    <span className="badge-sandbox badge-soft-success">{dt.items.length} Items</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', margin: '0 0 0.75rem' }}>{dt.description}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--sb-primary)', fontWeight: 600 }}>
                    Title: {dt.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Branding & Custom Theme Engine */}
      {activeTab === 'branding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Presets Grid */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Curated Theme Presets</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)' }}>
                  Select from pre-configured color schemes, white/dark navigation modes, and typography pairings.
                </p>
              </div>
              <button
                onClick={() => setIsThemeCustomizerOpen(true)}
                className="btn-sandbox btn-sandbox-primary"
                style={{ gap: '0.4rem' }}
              >
                <Palette size={15} />
                <span>Open Live Customizer Drawer</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {themePresets.map((preset) => {
                const isActive = customTheme.preset === preset.id

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setThemePreset(preset.id)
                      showToast(`✓ Switched theme to ${preset.name}`)
                    }}
                    className={`theme-preset-card ${isActive ? 'active' : ''}`}
                    style={{ padding: '1rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: preset.previewColors.primary,
                            boxShadow: 'var(--sb-shadow-xs)',
                          }}
                        />
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: preset.previewColors.sidebar,
                            border: '1px solid var(--sb-border)',
                          }}
                        />
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: preset.previewColors.bg,
                            border: '1px solid var(--sb-border)',
                          }}
                        />
                      </div>
                      {isActive && (
                        <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--sb-heading)', marginBottom: '0.2rem' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)', lineHeight: 1.4 }}>
                      {preset.description}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Custom Colors & Workspace Branding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Color Controls */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Colors & Brand Accent</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
                Pick customized colors for primary buttons, active highlights, and navigation accents.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">Primary Brand Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <input
                      type="color"
                      value={customTheme.primaryColor || '#3f78e0'}
                      onChange={(e) => updateCustomTheme({ primaryColor: e.target.value, preset: 'standard-white' })}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--sb-border)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="form-input-sandbox"
                      value={customTheme.primaryColor || '#3f78e0'}
                      onChange={(e) => updateCustomTheme({ primaryColor: e.target.value, preset: 'standard-white' })}
                      style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 700, width: '120px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Secondary Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="color"
                      value={customTheme.secondaryColor || '#605dba'}
                      onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--sb-border)', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      className="form-input-sandbox"
                      value={customTheme.secondaryColor || '#605dba'}
                      onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                      style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 700, width: '120px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Workspace / Product Brand Title</label>
                  <input
                    type="text"
                    className="form-input-sandbox"
                    value={customTheme.customBrandName || 'PulseWork'}
                    onChange={(e) => updateCustomTheme({ customBrandName: e.target.value })}
                    placeholder="e.g. PulseWork or MyCompany Suite"
                  />
                </div>
              </div>
            </div>

            {/* Geometry & Typography */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Typography & Geometry</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
                Adjust corner roundness, font typeface, and spacing density.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Font Selector */}
                <div>
                  <label className="form-label">Font Family</label>
                  <select
                    value={customTheme.fontFamily || 'Urbanist'}
                    onChange={(e) => updateCustomTheme({ fontFamily: e.target.value as FontFamilyOption })}
                    className="form-select-sandbox"
                  >
                    <option value="Urbanist">Urbanist (Modern Geometric)</option>
                    <option value="Inter">Inter (Enterprise SaaS Standard)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary)</option>
                    <option value="Outfit">Outfit (Luxury Rounded)</option>
                    <option value="Manrope">Manrope (Clean Humanist)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech Monospace Accent)</option>
                  </select>
                </div>

                {/* Corner Radius */}
                <div>
                  <label className="form-label">Corner Radius</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'sharp', label: 'Sharp (2px)' },
                      { id: 'subtle', label: 'Subtle (6px)' },
                      { id: 'modern', label: 'Modern (10px)' },
                      { id: 'rounded', label: 'Rounded (16px)' },
                      { id: 'pill', label: 'Pill (Full)' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => updateCustomTheme({ borderRadius: r.id as BorderRadiusOption })}
                        className="btn-sandbox btn-sandbox-ghost"
                        style={{
                          padding: '0.45rem',
                          border: `1px solid ${customTheme.borderRadius === r.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                          backgroundColor: customTheme.borderRadius === r.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density */}
                <div>
                  <label className="form-label">Layout Spacing & Density</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'compact', label: 'Compact' },
                      { id: 'comfortable', label: 'Comfortable' },
                      { id: 'spacious', label: 'Spacious' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => updateCustomTheme({ density: d.id as DensityOption })}
                        className="btn-sandbox btn-sandbox-ghost"
                        style={{
                          padding: '0.45rem',
                          border: `1px solid ${customTheme.density === d.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                          backgroundColor: customTheme.density === d.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Custom CSS Editor */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Injected Custom CSS</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', marginBottom: '1rem' }}>
              Add custom CSS rules to fine-tune typography, shadows, borders, or layout components.
            </p>

            <textarea
              className="form-textarea-sandbox"
              rows={6}
              style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.8rem', lineHeight: 1.5 }}
              placeholder={`/* Enter custom CSS rules */\n.navbar-sandbox { border-bottom-width: 2px; }\n.sidebar-sandbox { box-shadow: 2px 0 10px rgba(0,0,0,0.05); }`}
              value={customTheme.customCss || ''}
              onChange={(e) => updateCustomTheme({ customCss: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  resetCustomTheme()
                  showToast('✓ Reset to default Standard Crisp White theme!')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ gap: '0.4rem' }}
              >
                <RotateCcw size={14} />
                <span>Reset Theme to Standard White</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(customTheme, null, 2))
                  showToast('✓ Theme configuration copied to clipboard!')
                }}
                className="btn-sandbox btn-sandbox-secondary"
                style={{ gap: '0.4rem' }}
              >
                <Copy size={14} />
                <span>Copy Theme JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Security & Two-Factor Authentication (2FA) */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 2FA Card */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: currentUser.twoFactorEnabled ? 'rgba(56, 185, 149, 0.15)' : 'rgba(226, 98, 107, 0.15)',
                    color: currentUser.twoFactorEnabled ? 'var(--sb-success)' : 'var(--sb-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--sb-heading)' }}>
                    Two-Factor Authentication (2FA / TOTP)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', margin: '0.2rem 0 0 0' }}>
                    Status for {currentUser.name}:{' '}
                    <strong style={{ color: currentUser.twoFactorEnabled ? 'var(--sb-success)' : 'var(--sb-danger)' }}>
                      {currentUser.twoFactorEnabled ? '✓ Protected (Google / Microsoft Authenticator)' : '⚠️ Not Enabled'}
                    </strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => setCurrentView('users')}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ gap: '0.35rem' }}
                >
                  <Users size={15} color="var(--sb-primary)" />
                  <span>Manage Users & Roles</span>
                </button>
                <button
                  onClick={() => setTwoFactorSetupModalUser(currentUser)}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ gap: '0.35rem', fontWeight: 700 }}
                >
                  {currentUser.twoFactorEnabled ? 'Re-enroll 2FA' : 'Configure 2FA Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Security Policies */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Org 2FA & Step-Up */}
            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem 0' }}>
                Multi-Factor Enforcement
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Enforce 2FA Org-Wide
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Require all team members to set up 2FA
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.enforce2faOrgWide}
                    onChange={(e) => {
                      updateSecurityPolicy({ enforce2faOrgWide: e.target.checked })
                      showToast('✓ Security policy updated.')
                    }}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </label>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Step-Up 2FA for Financial Exports
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Require TOTP code to export tax/financial data
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityPolicy.stepUp2faForFinancials}
                    onChange={(e) => {
                      updateSecurityPolicy({ stepUp2faForFinancials: e.target.checked })
                      showToast('✓ Security policy updated.')
                    }}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
                  />
                </label>
              </div>
            </div>

            {/* Inactivity & Screen Lock */}
            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem 0' }}>
                Inactivity Lock & Privacy
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                    Auto-Lock Session Inactivity
                  </label>
                  <select
                    value={securityPolicy.sessionTimeoutMinutes}
                    onChange={(e) => {
                      updateSecurityPolicy({ sessionTimeoutMinutes: Number(e.target.value) })
                      showToast(`✓ Inactivity lock set to ${e.target.value} minutes.`)
                    }}
                    className="input-sandbox"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes (Standard)</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      Screen-Share Privacy Mode
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>
                      Mask financial totals during presentations
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={togglePrivacyMode}
                    className={`btn-sandbox ${isPrivacyModeActive ? 'btn-sandbox-warning' : 'btn-sandbox-outline'}`}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    {isPrivacyModeActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Deep link banner to full Security Hub */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--sb-radius)',
              background: 'linear-gradient(135deg, rgba(63, 120, 224, 0.1) 0%, rgba(56, 185, 149, 0.1) 100%)',
              border: '1px solid rgba(63, 120, 224, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Enterprise Security & Compliance Hub
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
                Access the full Security Posture Dashboard, Connected Device Management, SHA-256 Audit Trail, and GDPR Data Subject Tools.
              </div>
            </div>
            <button
              onClick={() => setCurrentView('security')}
              className="btn-sandbox btn-sandbox-primary"
              style={{ fontWeight: 800 }}
            >
              Open Security Hub →
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: Data Management & Backup */}
      {activeTab === 'backup' && (
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Database size={20} color="var(--sb-purple)" />
            <h3 style={{ fontSize: '1.15rem' }}>Data Backup & Factory Reset</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
            Export all entities, CRM records, products, calendar events, templates, projects, and invoices to JSON.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button onClick={handleExport} className="btn-sandbox btn-sandbox-secondary">
              <Download size={15} />
              <span>Export Full Backup (JSON)</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to perform a factory reset? All CRM records will be cleared to a clean state.')) {
                  resetToDemoData()
                  showToast('✓ Clean factory reset complete.')
                }
              }}
              className="btn-sandbox btn-sandbox-danger"
            >
              <RotateCcw size={15} />
              <span>Clear All Data (Factory Reset)</span>
            </button>
          </div>

          {/* Import Box */}
          <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
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

          {/* Database Storage Engine & Combell MySQL Info */}
          <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Server size={16} color="var(--sb-primary)" />
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Database Storage Engine</h4>
            </div>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--sb-card-bg)',
                border: '1px solid var(--sb-border)',
                borderRadius: 'var(--sb-radius)',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                marginBottom: '0.85rem',
              }}
            >
              <div>
                <strong>Active Engine:</strong>{' '}
                <span
                  style={{
                    color: databaseConfig.mode === 'mysql' ? 'var(--sb-success)' : 'var(--sb-primary)',
                    fontWeight: 600,
                  }}
                >
                  {databaseConfig.mode === 'mysql' ? '● Combell MySQL Database' : '● Browser Local Storage (Standalone)'}
                </span>
              </div>
              {databaseConfig.mode === 'mysql' && (
                <>
                  <div><strong>Host:</strong> {databaseConfig.host}</div>
                  <div><strong>Database:</strong> {databaseConfig.database}</div>
                  <div><strong>Table Prefix:</strong> {databaseConfig.tablePrefix || 'pw_'}</div>
                  <div><strong>Status:</strong> Connected via PHP PDO Bridge (<code>/api/db.php</code>)</div>
                </>
              )}
            </div>
          </div>

          {/* Permanent Provisioning Status */}
          <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} color="var(--sb-success)" />
              <h4 style={{ fontSize: '0.95rem', margin: 0 }}>System Provisioning & Workspace Status</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--sb-body)', marginBottom: '0.85rem' }}>
              System status: <strong style={{ color: 'var(--sb-success)' }}>● Permanently Provisioned & Initialized</strong>.
              Your database configuration, administrator credentials, and security policies are active.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: 'var(--sb-success-soft)',
                border: '1px solid rgba(56, 185, 149, 0.3)',
                borderRadius: 'var(--sb-radius-sm)',
                color: 'var(--sb-success-text)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={15} />
              <span>First-Run Installation Finalized & Locked</span>
            </div>
          </div>
        </div>
      )}

      {/* Legal Entity Edit / Create Modal */}
      {isEntityModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEntityModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingEntity ? 'Edit Legal Entity' : 'Register New Legal Entity'}
              </h3>
              <button
                onClick={() => setIsEntityModalOpen(false)}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ padding: '0.35rem' }}
              >
                <AlertCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntity}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Trading / Display Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PulseWork Netherlands BV"
                      value={entityFormData.name}
                      onChange={(e) => setEntityFormData({ ...entityFormData, name: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">Legal Name (For Invoices)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PulseWork Netherlands B.V."
                      value={entityFormData.legalName}
                      onChange={(e) => setEntityFormData({ ...entityFormData, legalName: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">VAT Identifier *</label>
                    <input
                      type="text"
                      required
                      placeholder="NL861234567B01"
                      value={entityFormData.vatNumber}
                      onChange={(e) => setEntityFormData({ ...entityFormData, vatNumber: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">Peppol Scheme</label>
                    <select
                      value={entityFormData.peppolScheme}
                      onChange={(e) => setEntityFormData({ ...entityFormData, peppolScheme: e.target.value })}
                      className="form-select-sandbox"
                    >
                      <option value="0208">0208 (Belgium)</option>
                      <option value="0106">0106 (Netherlands)</option>
                      <option value="9930">9930 (Germany)</option>
                      <option value="0088">0088 (GLN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Peppol Endpoint</label>
                    <input
                      type="text"
                      required
                      placeholder="86123456"
                      value={entityFormData.peppolEndpoint}
                      onChange={(e) => setEntityFormData({ ...entityFormData, peppolEndpoint: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">SEPA IBAN *</label>
                    <input
                      type="text"
                      required
                      placeholder="NL42 INGB 0001 2345 67"
                      value={entityFormData.iban}
                      onChange={(e) => setEntityFormData({ ...entityFormData, iban: e.target.value })}
                      className="form-input-sandbox"
                      style={{ fontFamily: 'var(--sb-font-mono)', fontWeight: 600 }}
                    />
                  </div>
                  <div>
                    <label className="form-label">BIC / SWIFT</label>
                    <input
                      type="text"
                      placeholder="INGBNL2A"
                      value={entityFormData.bic}
                      onChange={(e) => setEntityFormData({ ...entityFormData, bic: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">Invoice Prefix</label>
                    <input
                      type="text"
                      placeholder="NL-INV-"
                      value={entityFormData.invoicePrefix}
                      onChange={(e) => setEntityFormData({ ...entityFormData, invoicePrefix: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      value={entityFormData.address}
                      onChange={(e) => setEntityFormData({ ...entityFormData, address: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={entityFormData.city}
                      onChange={(e) => setEntityFormData({ ...entityFormData, city: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      value={entityFormData.postalCode}
                      onChange={(e) => setEntityFormData({ ...entityFormData, postalCode: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                  <div>
                    <label className="form-label">Country Code</label>
                    <input
                      type="text"
                      value={entityFormData.countryCode}
                      onChange={(e) => setEntityFormData({ ...entityFormData, countryCode: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                {/* Entity Custom Logo */}
                <div>
                  <label className="form-label">Entity Custom Logo (Optional Override)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '42px',
                        borderRadius: '0.35rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--sb-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '0.25rem',
                      }}
                    >
                      {entityFormData.logoUrl ? (
                        <img src={entityFormData.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Inherit Master</span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Custom Logo URL (leave empty to use master logo)"
                      value={entityFormData.logoUrl || ''}
                      onChange={(e) => setEntityFormData({ ...entityFormData, logoUrl: e.target.value })}
                      className="form-input-sandbox"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEntityModalOpen(false)}
                  className="btn-sandbox btn-sandbox-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary">
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
