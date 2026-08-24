import React, { useState } from 'react'
import {
  Palette,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Layout,
  Type,
  Maximize2,
  Code2,
  Copy,
  CheckCircle2,
  Sun,
  Moon,
  Building,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { themePresets } from '../../services/themeService'
import {
  FontFamilyOption,
  BorderRadiusOption,
  DensityOption,
  SidebarStyleOption,
} from '../../types'

export const ThemeCustomizerModal: React.FC = () => {
  const {
    isThemeCustomizerOpen,
    setIsThemeCustomizerOpen,
    customTheme,
    updateCustomTheme,
    setThemePreset,
    resetCustomTheme,
    theme,
    toggleTheme,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'navigation' | 'typography' | 'customcss'>('presets')
  const [copiedToast, setCopiedToast] = useState(false)

  if (!isThemeCustomizerOpen) return null

  const quickColorSwatches = [
    '#3f78e0', // SandBox Blue
    '#4f46e5', // Royal Indigo
    '#10b981', // Emerald Green
    '#7c3aed', // Royal Violet
    '#0891b2', // Ocean Teal
    '#d97706', // Sunset Amber
    '#e11d48', // Crimson Rose
    '#0f172a', // Obsidian Slate
  ]

  const fontOptions: { id: FontFamilyOption; label: string; sample: string }[] = [
    { id: 'Urbanist', label: 'Urbanist (Default)', sample: 'Clean modern geometric' },
    { id: 'Inter', label: 'Inter (Enterprise)', sample: 'Standard SaaS UI font' },
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sample: 'Crisp contemporary style' },
    { id: 'Outfit', label: 'Outfit (Luxury)', sample: 'High-end rounded geometric' },
    { id: 'Manrope', label: 'Manrope (Nordic)', sample: 'Balanced humanist design' },
    { id: 'Space Grotesk', label: 'Space Grotesk (Tech)', sample: 'Futuristic technical look' },
  ]

  const radiusOptions: { id: BorderRadiusOption; label: string; preview: string }[] = [
    { id: 'sharp', label: 'Sharp (2px)', preview: '2px' },
    { id: 'subtle', label: 'Subtle (6px)', preview: '6px' },
    { id: 'modern', label: 'Modern (10px)', preview: '10px' },
    { id: 'rounded', label: 'Rounded (16px)', preview: '16px' },
    { id: 'pill', label: 'Pill (Full)', preview: '9999px' },
  ]

  const densityOptions: { id: DensityOption; label: string; desc: string }[] = [
    { id: 'compact', label: 'Compact', desc: 'Higher information density, tighter padding' },
    { id: 'comfortable', label: 'Comfortable (Standard)', desc: 'Balanced spacing for all screens' },
    { id: 'spacious', label: 'Spacious', desc: 'Relaxed luxury layout with generous margins' },
  ]

  const handleExportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(customTheme, null, 2))
    setCopiedToast(true)
    setTimeout(() => setCopiedToast(false), 2500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsThemeCustomizerOpen(false)
      }}
    >
      <div className="theme-customizer-drawer">
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.15rem 1.35rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--sb-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--sb-heading)' }}>
                CRM Theme Engine
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                Live styling & brand customizer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={toggleTheme}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ padding: '0.45rem', borderRadius: '50%' }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={() => setIsThemeCustomizerOpen(false)}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ padding: '0.45rem' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--sb-border)',
            backgroundColor: 'var(--sb-bg-alt)',
            padding: '0.35rem 0.75rem',
            gap: '0.25rem',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'presets', label: 'Presets', icon: <Sparkles size={13} /> },
            { id: 'colors', label: 'Colors', icon: <Palette size={13} /> },
            { id: 'navigation', label: 'Navigation', icon: <Layout size={13} /> },
            { id: 'typography', label: 'Typography', icon: <Type size={13} /> },
            { id: 'customcss', label: 'Custom CSS', icon: <Code2 size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn-sandbox btn-sandbox-sm ${
                activeTab === tab.id ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'
              }`}
              style={{
                fontSize: '0.76rem',
                padding: '0.35rem 0.65rem',
                gap: '0.35rem',
                borderRadius: 'var(--sb-radius-sm)',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Select a curated color scheme and navigation style. Changes apply instantly:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {themePresets.map((preset) => {
                  const isActive = customTheme.preset === preset.id

                  return (
                    <div
                      key={preset.id}
                      onClick={() => setThemePreset(preset.id)}
                      className={`theme-preset-card ${isActive ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: preset.previewColors.primary,
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: preset.previewColors.sidebar,
                              border: '1px solid var(--sb-border)',
                              display: 'inline-block',
                            }}
                          />
                        </div>
                        {isActive && <Check size={14} color="var(--sb-primary)" />}
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--sb-heading)' }}>
                          {preset.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '2px', lineHeight: 1.3 }}>
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & BRANDING */}
          {activeTab === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Primary Color */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Primary Brand Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input
                    type="color"
                    value={customTheme.primaryColor || '#3f78e0'}
                    onChange={(e) => updateCustomTheme({ primaryColor: e.target.value, preset: 'standard-white' })}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1px solid var(--sb-border)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                  <input
                    type="text"
                    className="form-input-sandbox"
                    value={customTheme.primaryColor || '#3f78e0'}
                    onChange={(e) => updateCustomTheme({ primaryColor: e.target.value, preset: 'standard-white' })}
                    style={{ fontFamily: 'var(--sb-font-mono)', width: '130px', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {quickColorSwatches.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => updateCustomTheme({ primaryColor: hex, preset: 'standard-white' })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: hex,
                        border: customTheme.primaryColor === hex ? '2px solid #000000' : '1px solid var(--sb-border)',
                        cursor: 'pointer',
                      }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Secondary Accent Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={customTheme.secondaryColor || '#605dba'}
                    onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1px solid var(--sb-border)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                  <input
                    type="text"
                    className="form-input-sandbox"
                    value={customTheme.secondaryColor || '#605dba'}
                    onChange={(e) => updateCustomTheme({ secondaryColor: e.target.value })}
                    style={{ fontFamily: 'var(--sb-font-mono)', width: '130px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Custom Brand Name */}
              <div>
                <label className="form-label">Custom Workspace Brand Name</label>
                <input
                  type="text"
                  className="form-input-sandbox"
                  value={customTheme.customBrandName || 'PulseWork'}
                  onChange={(e) => updateCustomTheme({ customBrandName: e.target.value })}
                  placeholder="e.g. PulseWork or Your Company CRM"
                />
              </div>
            </div>
          )}

          {/* TAB 3: NAVIGATION & SURFACES */}
          {activeTab === 'navigation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Sidebar Background Mode */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Sidebar Background Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {[
                    { id: 'white', label: 'Standard White', desc: 'Clean crisp white with subtle border' },
                    { id: 'dark', label: 'Dark Obsidian', desc: 'Deep slate high-contrast sidebar' },
                    { id: 'glass', label: 'Translucent Glass', desc: 'Frosted blur background' },
                    { id: 'brand', label: 'Brand Solid', desc: 'Primary color filled sidebar' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => updateCustomTheme({ sidebarBgMode: mode.id as any })}
                      className={`btn-sandbox btn-sandbox-ghost ${
                        customTheme.sidebarBgMode === mode.id ? 'active' : ''
                      }`}
                      style={{
                        padding: '0.75rem',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        border: `1px solid ${customTheme.sidebarBgMode === mode.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                        backgroundColor:
                          customTheme.sidebarBgMode === mode.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sb-heading)' }}>
                        {mode.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginTop: '2px' }}>
                        {mode.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navbar Background Mode */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Top Navigation (Navbar) Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {[
                    { id: 'white', label: 'Standard Crisp White' },
                    { id: 'dark', label: 'Dark Obsidian Topbar' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => updateCustomTheme({ navbarBgMode: mode.id as any })}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{
                        padding: '0.65rem',
                        textAlign: 'left',
                        border: `1px solid ${customTheme.navbarBgMode === mode.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                        backgroundColor:
                          customTheme.navbarBgMode === mode.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Density */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Interface Spacing & Density
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {densityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateCustomTheme({ density: opt.id })}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{
                        padding: '0.65rem 0.85rem',
                        justifyContent: 'space-between',
                        border: `1px solid ${customTheme.density === opt.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                        backgroundColor:
                          customTheme.density === opt.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{opt.desc}</div>
                      </div>
                      {customTheme.density === opt.id && <Check size={14} color="var(--sb-primary)" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TYPOGRAPHY & GEOMETRY */}
          {activeTab === 'typography' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Font Family */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Typography Font Family
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {fontOptions.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateCustomTheme({ fontFamily: f.id })}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{
                        padding: '0.65rem 0.85rem',
                        justifyContent: 'space-between',
                        border: `1px solid ${customTheme.fontFamily === f.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                        backgroundColor:
                          customTheme.fontFamily === f.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: f.id }}>{f.label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', fontFamily: f.id }}>
                          {f.sample}
                        </div>
                      </div>
                      {customTheme.fontFamily === f.id && <Check size={14} color="var(--sb-primary)" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner Radius */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Card & Button Corner Radius
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {radiusOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => updateCustomTheme({ borderRadius: r.id })}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{
                        padding: '0.5rem',
                        border: `1px solid ${customTheme.borderRadius === r.id ? 'var(--sb-primary)' : 'var(--sb-border)'}`,
                        backgroundColor:
                          customTheme.borderRadius === r.id ? 'var(--sb-primary-soft)' : 'var(--sb-surface)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        borderRadius: r.preview,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOM CSS */}
          {activeTab === 'customcss' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Write custom CSS rules. They are injected live into the document:
              </div>

              <textarea
                className="form-textarea-sandbox"
                rows={10}
                style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.78rem', lineHeight: 1.5 }}
                placeholder={`/* Custom CSS Example */\n.sidebar-sandbox {\n  border-right-width: 2px;\n}\n.card-sandbox {\n  box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n}`}
                value={customTheme.customCss || ''}
                onChange={(e) => updateCustomTheme({ customCss: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--sb-border)',
            backgroundColor: 'var(--sb-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={resetCustomTheme}
            className="btn-sandbox btn-sandbox-ghost btn-sandbox-sm"
            style={{ color: 'var(--sb-body)', gap: '0.35rem' }}
            title="Reset to default standard crisp white theme"
          >
            <RotateCcw size={14} />
            <span>Reset to Standard White</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportJson}
              className="btn-sandbox btn-sandbox-secondary btn-sandbox-sm"
              style={{ gap: '0.35rem' }}
            >
              {copiedToast ? <CheckCircle2 size={14} color="var(--sb-success)" /> : <Copy size={14} />}
              <span>{copiedToast ? 'Copied!' : 'Export JSON'}</span>
            </button>

            <button
              onClick={() => setIsThemeCustomizerOpen(false)}
              className="btn-sandbox btn-sandbox-primary btn-sandbox-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
