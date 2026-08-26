import React from 'react'
import { AlertTriangle, Check, RefreshCw, X, ShieldAlert, ArrowRight } from 'lucide-react'

export interface ConflictData<T = any> {
  isOpen: boolean
  entityName: string
  entityId: string
  serverRecord: T | null
  localRecord: T | null
  serverVersion?: number
  onResolve: (action: 'keep_server' | 'overwrite') => void
  onCancel: () => void
}

export const ConflictResolutionDrawer: React.FC<ConflictData> = ({
  isOpen,
  entityName,
  entityId,
  serverRecord,
  localRecord,
  serverVersion = 2,
  onResolve,
  onCancel,
}) => {
  if (!isOpen || !serverRecord || !localRecord) return null

  // Collect modified keys between local and server records
  const allKeys = Array.from(
    new Set([...Object.keys(serverRecord), ...Object.keys(localRecord)])
  ).filter((k) => !['updated_at', 'updatedAt', 'version'].includes(k))

  const changedKeys = allKeys.filter((k) => {
    const sVal = JSON.stringify((serverRecord as any)[k])
    const lVal = JSON.stringify((localRecord as any)[k])
    return sVal !== lVal
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--sb-surface-card, #1e293b)',
          color: 'var(--sb-text-main, #f8fafc)',
          borderRadius: '16px',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          maxWidth: '720px',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--sb-border-subtle, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                Data Conflict Detected
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Another user or session modified this {entityName} ({entityId}) (Server v{serverVersion}).
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Diff Comparison Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#93c5fd',
            }}
          >
            <ShieldAlert size={18} />
            <span>
              Optimistic concurrency locking prevented accidental overwrite of newer server data.
            </span>
          </div>

          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
            Conflicting Fields ({changedKeys.length})
          </h4>

          <div
            style={{
              border: '1px solid var(--sb-border-subtle, #334155)',
              borderRadius: '10px',
              overflow: 'hidden',
              fontSize: '13px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                padding: '10px 16px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                fontWeight: 600,
                color: '#94a3b8',
                borderBottom: '1px solid var(--sb-border-subtle, #334155)',
              }}
            >
              <span>Field</span>
              <span style={{ color: '#60a5fa' }}>Your Submitted Version</span>
              <span style={{ color: '#34d399' }}>Live Server Version</span>
            </div>

            {changedKeys.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                No direct property conflicts found. Metadata timestamps differed.
              </div>
            ) : (
              changedKeys.map((key) => {
                const localVal = (localRecord as any)[key]
                const serverVal = (serverRecord as any)[key]
                const formatVal = (v: any) => {
                  if (v === null || v === undefined) return '<empty>'
                  if (typeof v === 'object') return JSON.stringify(v)
                  return String(v)
                }

                return (
                  <div
                    key={key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span
                      style={{
                        color: '#93c5fd',
                        wordBreak: 'break-word',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {formatVal(localVal)}
                    </span>
                    <span
                      style={{
                        color: '#6ee7b7',
                        wordBreak: 'break-word',
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {formatVal(serverVal)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--sb-border-subtle, #334155)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid var(--sb-border-subtle, #334155)',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Review Later
          </button>
          <button
            onClick={() => onResolve('keep_server')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Check size={16} />
            Keep Server Version
          </button>
          <button
            onClick={() => onResolve('overwrite')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Overwrite with My Version
          </button>
        </div>
      </div>
    </div>
  )
}
