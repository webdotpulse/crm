import React, { useState } from 'react'
import {
  Boxes,
  Check,
  Search,
  Filter,
  Sparkles,
  Zap,
  Briefcase,
  Wrench,
  User,
  Building2,
  Crown,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MODULE_REGISTRY, INDUSTRY_PRESETS } from '../../services/moduleRegistry'
import { ModuleCategory, ModuleId, ModulePresetId } from '../../types'

export const ModuleStoreView: React.FC = () => {
  const { moduleSettings, toggleModule, applyModulePreset, isModuleEnabled, setCurrentView, customTheme } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activePresetNotification, setActivePresetNotification] = useState<string | null>(null)

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All Modules', count: MODULE_REGISTRY.length },
    { id: 'core', label: 'Core & Workspace', count: MODULE_REGISTRY.filter((m) => m.category === 'core').length },
    { id: 'sales_operations', label: 'Sales & Operations', count: MODULE_REGISTRY.filter((m) => m.category === 'sales_operations').length },
    { id: 'finance_tax', label: 'Finance, Banking & Tax', count: MODULE_REGISTRY.filter((m) => m.category === 'finance_tax').length },
    { id: 'logistics', label: 'Logistics & Inventory', count: MODULE_REGISTRY.filter((m) => m.category === 'logistics').length },
    { id: 'people_support', label: 'People & Helpdesk', count: MODULE_REGISTRY.filter((m) => m.category === 'people_support').length },
    { id: 'ai_automation', label: 'AI & Intelligence', count: MODULE_REGISTRY.filter((m) => m.category === 'ai_automation').length },
  ]

  const enabledCount = MODULE_REGISTRY.filter((m) => isModuleEnabled(m.id)).length

  const filteredModules = MODULE_REGISTRY.filter((mod) => {
    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory
    const cleanQ = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !cleanQ ||
      mod.name.toLowerCase().includes(cleanQ) ||
      mod.tagline.toLowerCase().includes(cleanQ) ||
      mod.description.toLowerCase().includes(cleanQ)
    return matchesCategory && matchesSearch
  })

  const handleApplyPreset = (presetId: ModulePresetId, presetName: string) => {
    applyModulePreset(presetId)
    setActivePresetNotification(`Preset applied: ${presetName}`)
    setTimeout(() => setActivePresetNotification(null), 3500)
  }

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown size={16} />
      case 'Briefcase':
        return <Briefcase size={16} />
      case 'Wrench':
        return <Wrench size={16} />
      case 'User':
        return <User size={16} />
      case 'Building2':
        return <Building2 size={16} />
      default:
        return <Zap size={16} />
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--sb-primary-soft) 0%, rgba(116, 82, 214, 0.08) 100%)',
          borderRadius: 'var(--sb-radius-lg)',
          border: '1px solid var(--sb-border)',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--sb-primary)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Sliders size={12} /> PulseWork Modular Architecture
              </span>
              <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                {enabledCount} of {MODULE_REGISTRY.length} Modules Active
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Centralized Module Hub & Industry Presets
            </h1>
            <p style={{ color: 'var(--sb-body)', margin: 0, fontSize: '0.92rem', maxWidth: '680px', lineHeight: 1.5 }}>
              Enable or disable any module with one click. Disabling a module cleanly removes it from your Navigation Sidebar, Spotlight (⌘K), and Quick Action shortcuts.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
              Active Suite Configuration:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => applyModulePreset('all')}
                className="btn-sandbox btn-sandbox-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <Crown size={14} /> Enable All ({MODULE_REGISTRY.length})
              </button>
            </div>
          </div>
        </div>

        {activePresetNotification && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--sb-radius)',
              backgroundColor: '#38b995',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: 'var(--sb-shadow)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{activePresetNotification}</span>
          </div>
        )}
      </div>

      {/* 1. Industry Presets Selector */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              Pre-Configured Industry Presets
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
              Instantly configure your workspace for your specific industry archetype in one click.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {INDUSTRY_PRESETS.map((preset) => {
            const isPresetFullyActive = preset.enabledModules.every((id) => isModuleEnabled(id))

            return (
              <div
                key={preset.id}
                className="card-sandbox card-sandbox-hover"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${preset.color}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: `${preset.color}15`,
                        color: preset.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getPresetIcon(preset.icon)}
                    </div>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: `${preset.color}15`,
                        color: preset.color,
                      }}
                    >
                      {preset.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.35rem' }}>
                    {preset.name}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {preset.description}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)', marginBottom: '1rem' }}>
                    <strong>{preset.enabledModules.length} Modules:</strong>{' '}
                    {preset.enabledModules.slice(0, 5).join(', ')}...
                  </div>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset.id, preset.name)}
                  className={`btn-sandbox ${isPresetFullyActive ? 'btn-sandbox-outline' : 'btn-sandbox-primary'}`}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', justifyContent: 'center' }}
                >
                  {isPresetFullyActive ? (
                    <>
                      <Check size={14} /> Active Preset
                    </>
                  ) : (
                    <>Apply {preset.name.split('(')[0]}</>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--sb-border)',
          paddingBottom: '1rem',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn-sandbox ${selectedCategory === cat.id ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                fontWeight: selectedCategory === cat.id ? 800 : 600,
                borderRadius: 'var(--sb-radius-pill)',
              }}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }}
          />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* 3. Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
        {filteredModules.map((mod) => {
          const isEnabled = isModuleEnabled(mod.id)
          const isCoreLocked = mod.isCore

          return (
            <div
              key={mod.id}
              className="card-sandbox"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isEnabled ? '1px solid var(--sb-border)' : '1px dashed var(--sb-border)',
                opacity: isEnabled ? 1 : 0.65,
                transition: 'all 0.2s ease',
                backgroundColor: isEnabled ? 'var(--sb-surface)' : 'var(--sb-bg)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: isEnabled ? 'var(--sb-primary-soft)' : 'var(--sb-border)',
                        color: isEnabled ? 'var(--sb-primary)' : 'var(--sb-body)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      <Boxes size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                        {mod.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: 'var(--sb-body)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {mod.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '42px',
                        height: '24px',
                        cursor: isCoreLocked ? 'not-allowed' : 'pointer',
                      }}
                      title={isCoreLocked ? 'Core module cannot be disabled' : isEnabled ? 'Click to Disable Module' : 'Click to Enable Module'}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        disabled={isCoreLocked}
                        onChange={() => toggleModule(mod.id)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: isCoreLocked ? 'not-allowed' : 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: isEnabled ? 'var(--sb-primary)' : '#cbd5e1',
                          transition: '0.3s',
                          borderRadius: '24px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            content: '""',
                            height: '18px',
                            width: '18px',
                            left: isEnabled ? '20px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.3s',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--sb-heading)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {mod.tagline}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', lineHeight: 1.45, marginBottom: '1rem' }}>
                  {mod.description}
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--sb-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isCoreLocked ? (
                    <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.62rem' }}>
                      Core System
                    </span>
                  ) : isEnabled ? (
                    <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.62rem' }}>
                      ✓ Active
                    </span>
                  ) : (
                    <span className="badge-sandbox badge-soft-dark" style={{ fontSize: '0.62rem' }}>
                      Disabled
                    </span>
                  )}
                </div>

                {isEnabled && (
                  <button
                    onClick={() => setCurrentView(mod.id as any)}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{ fontSize: '0.74rem', fontWeight: 700, padding: '0.25rem 0.5rem', color: 'var(--sb-primary)' }}
                  >
                    Open View <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default ModuleStoreView
