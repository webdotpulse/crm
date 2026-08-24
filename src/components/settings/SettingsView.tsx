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
} from 'lucide-react'
import { CompanyProfile, LegalEntity, VatRate, EmailTemplate, DocumentTemplate, FontFamilyOption, BorderRadiusOption, DensityOption } from '../../types'
import { useApp } from '../../context/AppContext'
import { themePresets } from '../../services/themeService'

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
    customTheme,
    updateCustomTheme,
    setThemePreset,
    resetCustomTheme,
    setIsThemeCustomizerOpen,
    theme,
    toggleTheme,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'entities' | 'vat' | 'templates' | 'branding' | 'backup'>('entities')
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

      {/* TAB 1: Multiple Legal Entities */}
      {activeTab === 'entities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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

      {/* TAB 4: Data Management & Backup */}
      {activeTab === 'backup' && (
        <div className="card-sandbox" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Database size={20} color="var(--sb-purple)" />
            <h3 style={{ fontSize: '1.15rem' }}>Data Backup & Demo Reset</h3>
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
          <div style={{ borderTop: '1px solid var(--sb-border)', paddingTop: '1.25rem' }}>
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
