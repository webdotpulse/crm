import React, { useState } from 'react'
import {
  Code2,
  Key,
  Webhook,
  Play,
  Copy,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Terminal,
  Activity,
  Send,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ApiKey, WebhookEndpoint } from '../../types'

export const DevelopersView: React.FC = () => {
  const {
    apiKeys,
    addApiKey,
    deleteApiKey,
    webhookEndpoints,
    addWebhookEndpoint,
    deleteWebhookEndpoint,
    webhookLogs,
    dispatchWebhookEvent,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'api_keys' | 'webhooks' | 'sandbox'>('api_keys')
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState<string>('')
  const [isAddingKey, setIsAddingKey] = useState<boolean>(false)

  // New Webhook state
  const [isAddingWebhook, setIsAddingWebhook] = useState<boolean>(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('https://api.mycrm.com/webhooks/pulsework')
  const [newWebhookDesc, setNewWebhookDesc] = useState<string>('Zapier / Slack Sync')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['invoice.paid', 'quote.accepted'])

  // Sandbox state
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>('GET /api/v1/invoices')
  const [sandboxResponse, setSandboxResponse] = useState<any | null>(null)
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKeyId(id)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleCreateApiKey = () => {
    if (!newKeyName) return
    const randomHex = Math.random().toString(16).slice(2, 10)
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keyPrefix: `pw_live_${randomHex.slice(0, 4)}`,
      secretKey: `pw_live_${randomHex}${Date.now().toString(16)}`,
      permissions: ['invoices:read', 'invoices:write', 'crm:read', 'peppol:send'],
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    addApiKey(newKey)
    setNewKeyName('')
    setIsAddingKey(false)
  }

  const handleCreateWebhook = () => {
    if (!newWebhookUrl) return
    const newEp: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      description: newWebhookDesc,
      events: selectedEvents,
      secret: `whsec_${Math.random().toString(16).slice(2, 12)}`,
      status: 'active',
      failureCount: 0,
      createdAt: new Date().toISOString(),
    }
    addWebhookEndpoint(newEp)
    setIsAddingWebhook(false)
  }

  const handleDispatchTestWebhook = async () => {
    const payload = {
      event: 'invoice.paid',
      timestamp: new Date().toISOString(),
      invoiceNumber: 'INV-2026-001',
      client: 'AeroDynamics Belgium BV',
      amountPaid: 14520.0,
      paymentMethod: 'sepa_direct_debit',
      peppolAccessPointStatus: 'DELIVERED',
    }
    const logs = await dispatchWebhookEvent('invoice.paid', payload)
    setTestWebhookStatus(`🚀 Dispatched 'invoice.paid' webhook to ${logs.length} active endpoints! Response 200 OK.`)
    setTimeout(() => setTestWebhookStatus(null), 5000)
  }

  const handleRunSandbox = () => {
    if (sandboxEndpoint.includes('invoices')) {
      setSandboxResponse({
        status: 'success',
        code: 200,
        data: [
          {
            id: 'inv-1',
            number: 'BE-INV-2026-0001',
            client: 'AeroDynamics Belgium BV',
            vatNumber: 'BE0842123456',
            total: 14520.0,
            status: 'paid',
            peppolStatus: 'delivered',
            structuredReference: '+++090/9337/55493+++',
          },
        ],
        pagination: { total: 1, page: 1, limit: 50 },
      })
    } else if (sandboxEndpoint.includes('leads')) {
      setSandboxResponse({
        status: 'success',
        code: 201,
        message: 'Lead successfully captured from WooCommerce Webhook',
        leadId: 'comp-9921',
      })
    } else {
      setSandboxResponse({
        status: 'online',
        code: 200,
        gateway: 'AS4 Peppol SMP / SML Belgium',
        schematronVersion: 'EN 16931 v1.3.11',
        responseTimeMs: 34,
      })
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
            Developers, REST API & Webhooks Engine
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Integrate WooCommerce, Shopify, Zapier, Make, and external ERPs with PulseWork
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDispatchTestWebhook}
            className="btn-sandbox btn-sandbox-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              backgroundColor: '#10b981',
              borderColor: '#10b981',
            }}
          >
            <Send size={16} />
            <span>⚡ Test Webhook Dispatch</span>
          </button>
        </div>
      </div>

      {/* Test Status Banner */}
      {testWebhookStatus && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '12px',
            color: '#10b981',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{testWebhookStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--sb-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('api_keys')}
          className={`btn-sandbox ${activeTab === 'api_keys' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <Key size={15} style={{ marginRight: '0.4rem' }} />
          REST API Keys ({apiKeys.length})
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`btn-sandbox ${activeTab === 'webhooks' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <Webhook size={15} style={{ marginRight: '0.4rem' }} />
          Outgoing Webhooks & Logs ({webhookEndpoints.length})
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`btn-sandbox ${activeTab === 'sandbox' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <Terminal size={15} style={{ marginRight: '0.4rem' }} />
          Interactive API Sandbox
        </button>
      </div>

      {/* TAB 1: API KEYS */}
      {activeTab === 'api_keys' && (
        <div>
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                Production & Live REST API Keys
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                Bearer token authentication for automated invoicing, Peppol dispatch, and CRM sync.
              </div>
            </div>

            <button
              onClick={() => setIsAddingKey(true)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} /> Create API Key
            </button>
          </div>

          {/* Add Key Form */}
          {isAddingKey && (
            <div
              className="card-sandbox"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--sb-primary)',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Generate New Live API Key
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Key name (e.g. Shopify Storefront / Zapier Sync)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="input-sandbox"
                  style={{ flex: 1, padding: '0.5rem 0.75rem' }}
                />
                <button onClick={() => setIsAddingKey(false)} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button onClick={handleCreateApiKey} className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Generate
                </button>
              </div>
            </div>
          )}

          {/* API Keys Table */}
          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700 }}>KEY NAME</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>API TOKEN</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>PERMISSIONS</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700 }}>LAST USED</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr key={k.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.85rem' }}>
                      {k.name}
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', backgroundColor: 'var(--sb-bg)', borderRadius: '4px' }}>
                          {k.secretKey.slice(0, 12)}••••••••••••••••
                        </code>
                        <button
                          onClick={() => handleCopy(k.secretKey, k.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-primary)' }}
                        >
                          {copiedKeyId === k.id ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {k.permissions.map((p, idx) => (
                          <span key={idx} className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.62rem' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                      {k.lastUsedAt ? k.lastUsedAt.slice(0, 16).replace('T', ' ') : 'Never'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteApiKey(k.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div>
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                Active Webhook Endpoints & Live Event Stream
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                PulseWork pushes JSON events to your HTTPS endpoints in real-time when invoices are paid, quotes accepted, or deals won.
              </div>
            </div>

            <button
              onClick={() => setIsAddingWebhook(true)}
              className="btn-sandbox btn-sandbox-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} /> Add Webhook
            </button>
          </div>

          {/* Add Webhook Drawer */}
          {isAddingWebhook && (
            <div
              className="card-sandbox"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--sb-primary)',
              }}
            >
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Add New Webhook Subscription
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="input-sandbox"
                  style={{ padding: '0.5rem 0.75rem' }}
                />
                <input
                  type="text"
                  placeholder="Description (e.g. ERP Invoices Bridge)"
                  value={newWebhookDesc}
                  onChange={(e) => setNewWebhookDesc(e.target.value)}
                  className="input-sandbox"
                  style={{ padding: '0.5rem 0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={() => setIsAddingWebhook(false)} className="btn-sandbox btn-sandbox-outline" style={{ padding: '0.45rem 1rem' }}>
                  Cancel
                </button>
                <button onClick={handleCreateWebhook} className="btn-sandbox btn-sandbox-primary" style={{ padding: '0.45rem 1.25rem' }}>
                  Save Webhook
                </button>
              </div>
            </div>
          )}

          {/* Webhook Endpoints List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {webhookEndpoints.map((ep) => (
              <div key={ep.id} className="card-sandbox" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.68rem' }}>
                    ACTIVE
                  </span>
                  <button
                    onClick={() => deleteWebhookEndpoint(ep.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sb-danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)', marginBottom: '0.2rem' }}>
                  {ep.description}
                </div>
                <code style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', wordBreak: 'break-all', display: 'block', marginBottom: '0.5rem' }}>
                  {ep.url}
                </code>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {ep.events.map((ev, idx) => (
                    <span key={idx} className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.62rem' }}>
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Logs */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem' }}>
            Live Webhook Delivery Logs
          </h4>
          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>EVENT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>DESTINATION URL</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>LATENCY</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.72rem', fontWeight: 700 }}>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {webhookLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--sb-border)', fontSize: '0.78rem' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--sb-primary)' }}>
                      {log.event}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--sb-body)' }}>
                      {log.url}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.65rem' }}>
                        200 OK
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--sb-body)' }}>{log.responseTimeMs} ms</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--sb-body)' }}>{log.timestamp.slice(11, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: API SANDBOX */}
      {activeTab === 'sandbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              REST API Explorer & Console
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Select API Endpoint
              </label>
              <select
                value={sandboxEndpoint}
                onChange={(e) => setSandboxEndpoint(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.55rem 0.75rem', fontWeight: 700 }}
              >
                <option value="GET /api/v1/invoices">GET /api/v1/invoices — Fetch all issued invoices</option>
                <option value="POST /api/v1/leads">POST /api/v1/leads — Create new customer from Webhook</option>
                <option value="GET /api/v1/peppol/status">GET /api/v1/peppol/status — Peppol AS4 Network Health</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                cURL Snippet
              </label>
              <textarea
                readOnly
                rows={4}
                value={`curl -X ${sandboxEndpoint.split(' ')[0]} "https://api.pulsework.io${sandboxEndpoint.split(' ')[1]}" \\
  -H "Authorization: Bearer pw_live_8f99a3c892e10f92b4578103c8901248" \\
  -H "Content-Type: application/json"`}
                className="input-sandbox"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.72rem', padding: '0.65rem' }}
              />
            </div>

            <button
              onClick={handleRunSandbox}
              className="btn-sandbox btn-sandbox-primary"
              style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Play size={15} /> Execute API Call
            </button>
          </div>

          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              Live HTTP JSON Response
            </h4>
            <pre
              style={{
                backgroundColor: 'var(--sb-bg)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--sb-border)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'var(--sb-heading)',
                minHeight: '220px',
                overflowX: 'auto',
                margin: 0,
              }}
            >
              {sandboxResponse ? JSON.stringify(sandboxResponse, null, 2) : '// Click "Execute API Call" to preview response'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
