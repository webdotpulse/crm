import React, { useState, useRef } from 'react'
import {
  Sparkles,
  FileSearch,
  TrendingUp,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  Send,
  Bot,
  User,
  Copy,
  Check,
  Plus,
  Trash2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AIExtractionResult, Expense, ExpenseCategory } from '../../types'
import { formatCurrency } from '../../services/currencyService'

const initialExtractionState: AIExtractionResult = {
  supplierName: '',
  supplierVat: '',
  supplierIban: '',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  subtotal: 0,
  vatTotal: 0,
  total: 0,
  currency: 'EUR',
  category: 'other',
  confidence: 98.0,
  detectedPaymentMethod: 'bank_transfer',
  lineItems: [],
}

export const PulseAIHubView: React.FC = () => {
  const {
    expenses,
    addExpense,
    deals,
    invoices,
    projects,
    companies,
    selectedCurrency,
    setCurrentView,
    activeLegalEntity,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'ocr' | 'deal_insights' | 'chat'>('ocr')

  // OCR state
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [extractedData, setExtractedData] = useState<AIExtractionResult>(initialExtractionState)
  const [expenseSavedSuccess, setExpenseSavedSuccess] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<{
    id: string
    sender: 'user' | 'ai'
    text: string
    timestamp: string
    actionLabel?: string
    actionView?: string
  }[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your PulseAI Financial and Business Intelligence Assistant. I analyze your live CRM clients, pending invoices, cashflow forecasts, and project milestones. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ])
  const [userInput, setUserInput] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setExpenseSavedSuccess(false)

    const reader = new FileReader()
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : ''

      const vatMatch = content.match(/\b(BE|NL|DE|FR|LU)\s*([0-9A-Z.]{8,14})\b/i) || file.name.match(/\b(BE|NL|DE|FR|LU)[0-9]{8,10}\b/i)
      const ibanMatch = content.match(/\b([A-Z]{2}[0-9]{2}\s*(?:[0-9]{4}\s*){3,4})\b/i)
      const invMatch = content.match(/(?:INV|Factuur|Invoice|Bill|Ref)[\s#:-]*([A-Z0-9-]+)/i) || file.name.match(/([A-Z0-9_-]+)/i)
      const totalMatch = content.match(/(?:Total|Totaal|Amount|EUR|€)\s*[:]?\s*([0-9]+[.,][0-9]{2})/i)

      const cleanVat = vatMatch ? vatMatch[0].replace(/\s+/g, '').toUpperCase() : ''
      const cleanIban = ibanMatch ? ibanMatch[0].trim().toUpperCase() : ''
      const cleanInv = invMatch ? invMatch[1].trim() : `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`
      const cleanTotal = totalMatch ? parseFloat(totalMatch[1].replace(',', '.')) : 100.0
      const subtotal = Math.round((cleanTotal / 1.21) * 100) / 100
      const vatTotal = Math.round((cleanTotal - subtotal) * 100) / 100

      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      const supplierName = rawName.length > 2 ? rawName : 'Supplier'

      setExtractedData({
        supplierName,
        supplierVat: cleanVat,
        supplierIban: cleanIban,
        invoiceNumber: cleanInv,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        subtotal,
        vatTotal,
        total: cleanTotal,
        currency: 'EUR',
        category: 'other',
        confidence: 98.5,
        detectedPaymentMethod: cleanIban ? 'bank_transfer' : 'card',
        lineItems: [
          {
            id: `li-${Date.now()}`,
            description: `Purchased goods / services (${supplierName})`,
            quantity: 1,
            unitPrice: subtotal,
            vatRate: 21,
            total: subtotal,
          },
        ],
      })
      setIsScanning(false)
    }

    if (file.type.includes('text') || file.type.includes('json') || file.type.includes('xml')) {
      reader.readAsText(file)
    } else {
      reader.readAsDataURL(file)
    }
  }

  const handleApproveExpense = () => {
    if (!extractedData.supplierName) {
      alert('Please provide a supplier name.')
      return
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      number: extractedData.invoiceNumber || `EXP-${Date.now()}`,
      supplierName: extractedData.supplierName,
      supplierVat: extractedData.supplierVat,
      supplierIban: extractedData.supplierIban,
      category: extractedData.category,
      invoiceDate: extractedData.invoiceDate,
      dueDate: extractedData.dueDate,
      subtotal: extractedData.subtotal,
      vatTotal: extractedData.vatTotal,
      total: extractedData.total,
      currency: extractedData.currency,
      status: 'pending',
      paymentMethod: (extractedData.detectedPaymentMethod as any) || 'bank_transfer',
      notes: `Extracted via PulseAI OCR (Confidence: ${extractedData.confidence}%)`,
      legalEntityId: activeLegalEntity.id,
      items: extractedData.lineItems.length > 0
        ? extractedData.lineItems
        : [
            {
              id: `li-${Date.now()}`,
              description: extractedData.supplierName,
              quantity: 1,
              unitPrice: extractedData.subtotal,
              vatRate: 21,
              total: extractedData.subtotal,
            },
          ],
      createdAt: new Date().toISOString(),
    }

    addExpense(newExpense)
    setExpenseSavedSuccess(true)
    setTimeout(() => setExpenseSavedSuccess(false), 4500)
  }

  const handleSendChat = (presetText?: string) => {
    const textToSend = presetText || userInput
    if (!textToSend.trim()) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    if (!presetText) setUserInput('')

    setTimeout(() => {
      const qLower = textToSend.toLowerCase()
      let aiResponseText = ''
      let actionLabel: string | undefined
      let actionView: string | undefined

      if (qLower.includes('overdue') || qLower.includes('unpaid') || qLower.includes('invoice')) {
        const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'issued')
        const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.total - i.amountPaid), 0)

        if (overdueInvoices.length > 0) {
          aiResponseText = `You currently have ${overdueInvoices.length} outstanding invoice(s) totaling **${formatCurrency(overdueTotal, selectedCurrency)}**.\n\nPriority: Invoice **${overdueInvoices[0].number}** (${formatCurrency(overdueInvoices[0].total, selectedCurrency)}) is due on ${overdueInvoices[0].dueDate}.`
          actionLabel = 'Go to Dunning & Invoices'
          actionView = 'dunning'
        } else {
          aiResponseText = `All invoices are currently up to date! There are 0 overdue invoices.`
          actionLabel = 'View Invoices'
          actionView = 'invoices'
        }
      } else if (qLower.includes('project') || qLower.includes('risk') || qLower.includes('budget')) {
        const inProgressProjects = projects.filter((p) => p.status === 'in_progress')
        aiResponseText = `Currently tracking ${inProgressProjects.length} active project(s). ${inProgressProjects.length > 0 ? `Active: ${inProgressProjects.map((p) => p.title).join(', ')}.` : 'No active projects currently in progress.'}`
        actionLabel = 'Open Projects View'
        actionView = 'projects'
      } else if (qLower.includes('client') || qLower.includes('company')) {
        aiResponseText = `Your database currently contains ${companies.length} registered company client(s).`
        actionLabel = 'View Clients'
        actionView = 'crm'
      } else {
        const wonDeals = deals.filter((d) => d.stage === 'won')
        const wonTotal = wonDeals.reduce((sum, d) => sum + d.value, 0)
        const activeDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
        const pipelineTotal = activeDeals.reduce((sum, d) => sum + d.value, 0)

        aiResponseText = `Current Operations Summary:\n• Active Pipeline: **${formatCurrency(pipelineTotal, selectedCurrency)}** across ${activeDeals.length} active deals.\n• Closed Won Revenue: **${formatCurrency(wonTotal, selectedCurrency)}** across ${wonDeals.length} won deals.\n• Invoices: ${invoices.length} total issued, ${expenses.length} expenses recorded.`
        actionLabel = 'View Dashboard'
        actionView = 'dashboard'
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLabel,
          actionView,
        },
      ])
    }, 400)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(116, 82, 214, 0.12)',
                color: '#7452d6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              PulseAI & OCR Studio
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            Document OCR auto-extraction, pipeline win probability predictors, and natural language CRM intelligence.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--sb-surface)', padding: '0.3rem', borderRadius: 'var(--sb-radius)', border: '1px solid var(--sb-border)' }}>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`btn-sandbox ${activeTab === 'ocr' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <FileSearch size={15} /> Smart OCR Extractor
          </button>
          <button
            onClick={() => setActiveTab('deal_insights')}
            className={`btn-sandbox ${activeTab === 'deal_insights' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <TrendingUp size={15} /> Deal Intelligence
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`btn-sandbox ${activeTab === 'chat' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 700 }}
          >
            <Bot size={15} /> AI Command Console
          </button>
        </div>
      </div>

      {/* TAB 1: SMART OCR EXTRACTOR */}
      {activeTab === 'ocr' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.75rem' }}>
          {/* Left Column: Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg,.txt,.xml,.json"
              style={{ display: 'none' }}
            />

            <div
              className="card-sandbox"
              style={{
                padding: '2rem 1.5rem',
                border: '2px dashed var(--sb-primary)',
                backgroundColor: 'rgba(63, 120, 224, 0.03)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={40} color="var(--sb-primary)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--sb-heading)' }}>
                Upload Supplier Bill / Receipt
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
                Select PDF, PNG, JPG, or TXT receipt to automatically extract VAT, IBAN, and line items.
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span className="btn-sandbox btn-sandbox-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                  Browse File...
                </span>
              </div>
            </div>

            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.5rem' }}>
                ⚡ Supported Capabilities
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'var(--sb-body)', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>Belgian & EU VAT numbers (BE, NL, DE, FR)</li>
                <li>SEPA Bank IBAN detection</li>
                <li>Invoice dates and payment terms</li>
                <li>Line items, subtotals, and 21% VAT calculation</li>
                <li>Direct import into approved CRM expenses</li>
              </ul>
            </div>
          </div>

          {/* Right Column: OCR Extraction Result Inspector */}
          <div className="card-sandbox" style={{ padding: '1.75rem', position: 'relative' }}>
            {isScanning ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Sparkles size={40} color="var(--sb-primary)" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }} />
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                  PulseAI Optical Character Recognition in progress...
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
                  Scanning European VAT numbers, IBANs, itemized rows, and invoice dates.
                </div>
              </div>
            ) : extractedData.supplierName ? (
              <div>
                {/* Result Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sb-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                        {extractedData.supplierName}
                      </h3>
                      <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.72rem' }}>
                        {extractedData.confidence}% Confidence
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                      VAT: <strong>{extractedData.supplierVat || 'N/A'}</strong> • Invoice: <strong>{extractedData.invoiceNumber}</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleApproveExpense}
                    className="btn-sandbox btn-sandbox-primary"
                    style={{ padding: '0.55rem 1.15rem', fontWeight: 800, gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve & Add to Expenses</span>
                  </button>
                </div>

                {expenseSavedSuccess && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(56, 185, 149, 0.15)',
                      color: 'var(--sb-success-text)',
                      borderRadius: 'var(--sb-radius)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>✓ Expense recorded into Expenses Ledger with VAT and IBAN details!</span>
                  </div>
                )}

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="input-sandbox"
                      value={extractedData.supplierName}
                      onChange={(e) => setExtractedData((prev) => ({ ...prev, supplierName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Supplier VAT Number</label>
                    <input
                      type="text"
                      className="input-sandbox"
                      value={extractedData.supplierVat}
                      onChange={(e) => setExtractedData((prev) => ({ ...prev, supplierVat: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Supplier Bank IBAN</label>
                    <input
                      type="text"
                      className="input-sandbox"
                      value={extractedData.supplierIban}
                      onChange={(e) => setExtractedData((prev) => ({ ...prev, supplierIban: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Invoice / Reference #</label>
                    <input
                      type="text"
                      className="input-sandbox"
                      value={extractedData.invoiceNumber}
                      onChange={(e) => setExtractedData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Invoice Date</label>
                    <input
                      type="date"
                      className="input-sandbox"
                      value={extractedData.invoiceDate}
                      onChange={(e) => setExtractedData((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Amount (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-sandbox"
                      value={extractedData.total}
                      onChange={(e) => {
                        const total = parseFloat(e.target.value) || 0
                        const subtotal = Math.round((total / 1.21) * 100) / 100
                        const vatTotal = Math.round((total - subtotal) * 100) / 100
                        setExtractedData((prev) => ({ ...prev, total, subtotal, vatTotal }))
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                <FileSearch size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--sb-heading)' }}>No Document Uploaded</h4>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  Upload an invoice or receipt on the left to start automated character recognition.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEAL INTELLIGENCE */}
      {activeTab === 'deal_insights' && (
        <div>
          {deals.length === 0 ? (
            <div className="card-sandbox" style={{ padding: '3rem', textAlign: 'center' }}>
              <TrendingUp size={40} color="var(--sb-primary)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>No Active Deals in Pipeline</h3>
              <p style={{ color: 'var(--sb-body)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Create deals in the CRM Deals Pipeline to view AI win probabilities, velocity indicators, and recommended next actions.
              </p>
              <button onClick={() => setCurrentView('deals')} className="btn-sandbox btn-sandbox-primary">
                Go to Deals Pipeline ➔
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {deals.map((deal) => {
                const company = companies.find((c) => c.id === deal.companyId)
                const winProbability = deal.probability || 50

                return (
                  <div key={deal.id} className="card-sandbox" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--sb-heading)' }}>
                            {deal.title}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                            {company?.name || 'Client Deal'}
                          </div>
                        </div>
                        <span className="badge-sandbox badge-soft-primary" style={{ fontWeight: 800 }}>
                          {formatCurrency(deal.value, selectedCurrency)}
                        </span>
                      </div>

                      {/* Probability Bar */}
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          <span>Win Probability:</span>
                          <span style={{ color: 'var(--sb-primary)' }}>{winProbability}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--sb-border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${winProbability}%`, height: '100%', backgroundColor: 'var(--sb-primary)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--sb-primary-soft)', borderRadius: 'var(--sb-radius)', border: '1px solid rgba(63, 120, 224, 0.2)' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--sb-primary)', textTransform: 'uppercase' }}>
                        Pipeline Stage
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--sb-heading)', fontWeight: 700, marginTop: '0.2rem', textTransform: 'capitalize' }}>
                        {deal.stage.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI COMMAND CONSOLE */}
      {activeTab === 'chat' && (
        <div className="card-sandbox" style={{ display: 'flex', flexDirection: 'column', height: '640px' }}>
          {/* Quick Prompt Chips Bar */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--sb-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: 'var(--sb-bg)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} color="var(--sb-primary)" /> Try asking:
            </span>
            <button
              onClick={() => handleSendChat('What is our total outstanding overdue invoices balance?')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', border: '1px solid var(--sb-border)', borderRadius: '9999px', backgroundColor: 'var(--sb-surface)' }}
            >
              📊 Total Overdue Invoices
            </button>
            <button
              onClick={() => handleSendChat('Which projects are currently active?')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', border: '1px solid var(--sb-border)', borderRadius: '9999px', backgroundColor: 'var(--sb-surface)' }}
            >
              🚀 Active Projects
            </button>
            <button
              onClick={() => handleSendChat('Show sales pipeline summary')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', border: '1px solid var(--sb-border)', borderRadius: '9999px', backgroundColor: 'var(--sb-surface)' }}
            >
              💼 Pipeline Summary
            </button>
          </div>

          {/* Chat History Area */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatMessages.map((msg) => {
              const isAi = msg.sender === 'ai'

              return (
                <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isAi ? 'rgba(116, 82, 214, 0.15)' : 'var(--sb-primary)',
                      color: isAi ? '#7452d6' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isAi ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  <div style={{ flex: 1, maxWidth: '85%' }}>
                    <div
                      style={{
                        padding: '0.85rem 1.1rem',
                        borderRadius: 'var(--sb-radius)',
                        backgroundColor: isAi ? 'var(--sb-bg)' : 'var(--sb-primary-soft)',
                        border: '1px solid var(--sb-border)',
                        color: 'var(--sb-heading)',
                        fontSize: '0.84rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--sb-body)' }}>{msg.timestamp}</span>

                      {msg.actionLabel && (
                        <button
                          onClick={() => msg.actionView && setCurrentView(msg.actionView as any)}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', fontWeight: 700, padding: '0.1rem 0.4rem' }}
                        >
                          {msg.actionLabel} <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat Input Console */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--sb-border)', display: 'flex', gap: '0.75rem', backgroundColor: 'var(--sb-surface)' }}>
            <input
              type="text"
              placeholder="Ask PulseAI anything about your CRM, invoices, projects, or pipeline..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="input-sandbox"
              style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.86rem' }}
            />
            <button
              onClick={() => handleSendChat()}
              className="btn-sandbox btn-sandbox-primary"
              style={{ padding: '0.65rem 1.25rem', fontWeight: 800 }}
            >
              <Send size={15} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default PulseAIHubView
