import React, { useState } from 'react'
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
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AIExtractionResult, Expense, ExpenseCategory } from '../../types'
import { formatCurrency } from '../../services/currencyService'

const OCR_PRESETS: {
  id: string
  title: string
  subtitle: string
  icon: string
  data: AIExtractionResult
}[] = [
  {
    id: 'ocr-aws',
    title: 'Amazon Web Services (AWS)',
    subtitle: 'Cloud Infrastructure & S3 Storage',
    icon: '☁️',
    data: {
      supplierName: 'Amazon Web Services EMEA SARL',
      supplierVat: 'LU26375245',
      supplierIban: 'LU92 0019 4006 4470 0000',
      invoiceNumber: 'INV-AWS-2026-89421',
      invoiceDate: '2026-08-01',
      dueDate: '2026-08-31',
      subtotal: 482.50,
      vatTotal: 101.33,
      total: 583.83,
      currency: 'EUR',
      category: 'hosting_software',
      confidence: 98.8,
      detectedPaymentMethod: 'direct_debit',
      lineItems: [
        { id: 'li-1', description: 'Amazon Elastic Compute Cloud (EC2) EU (Frankfurt)', quantity: 1, unitPrice: 284.00, vatRate: 21, total: 284.00 },
        { id: 'li-2', description: 'Amazon Relational Database Service (RDS Postgres Multi-AZ)', quantity: 1, unitPrice: 148.50, vatRate: 21, total: 148.50 },
        { id: 'li-3', description: 'Amazon Simple Storage Service (S3) & CloudFront CDN', quantity: 1, unitPrice: 50.00, vatRate: 21, total: 50.00 },
      ],
    },
  },
  {
    id: 'ocr-coolblue',
    title: 'Coolblue Business B.V.',
    subtitle: 'Hardware: 2x Dell UltraSharp 4K Monitors',
    icon: '🖥️',
    data: {
      supplierName: 'Coolblue België BVBA',
      supplierVat: 'BE0897222384',
      supplierIban: 'BE71 0015 6789 0123',
      invoiceNumber: 'CB-2026-099418',
      invoiceDate: '2026-08-14',
      dueDate: '2026-08-28',
      subtotal: 649.00,
      vatTotal: 136.29,
      total: 785.29,
      currency: 'EUR',
      category: 'hardware',
      confidence: 99.2,
      detectedPaymentMethod: 'card',
      lineItems: [
        { id: 'li-1', description: 'Dell UltraSharp U2723QE 27" 4K USB-C Hub Monitor', quantity: 2, unitPrice: 324.50, vatRate: 21, total: 649.00 },
      ],
    },
  },
  {
    id: 'ocr-total',
    title: 'TotalEnergies Mobility',
    subtitle: 'Fleet Fuel & High-Power EV Charging',
    icon: '⛽',
    data: {
      supplierName: 'TotalEnergies Marketing Belgium NV',
      supplierVat: 'BE0403063907',
      supplierIban: 'BE44 0012 3456 7899',
      invoiceNumber: 'TE-MOB-2026-8841',
      invoiceDate: '2026-08-20',
      dueDate: '2026-09-05',
      subtotal: 94.20,
      vatTotal: 19.78,
      total: 113.98,
      currency: 'EUR',
      category: 'travel_meals',
      confidence: 96.5,
      detectedPaymentMethod: 'card',
      lineItems: [
        { id: 'li-1', description: 'High-Power EV Fast Charging 175kW (Antwerp E19)', quantity: 1, unitPrice: 42.10, vatRate: 21, total: 42.10 },
        { id: 'li-2', description: 'Diesel Fuel B7 (Brussels Keizerslaan)', quantity: 32.5, unitPrice: 1.603, vatRate: 21, total: 52.10 },
      ],
    },
  },
  {
    id: 'ocr-proximus',
    title: 'Proximus Enterprise',
    subtitle: 'Fiber Internet & Unlimited 5G Lines',
    icon: '📶',
    data: {
      supplierName: 'Proximus NV van Publiek Recht',
      supplierVat: 'BE0202239951',
      supplierIban: 'BE33 0000 0000 4567',
      invoiceNumber: 'PROX-2026-087192',
      invoiceDate: '2026-08-10',
      dueDate: '2026-08-25',
      subtotal: 189.50,
      vatTotal: 39.80,
      total: 229.30,
      currency: 'EUR',
      category: 'telecom',
      confidence: 97.9,
      detectedPaymentMethod: 'direct_debit',
      lineItems: [
        { id: 'li-1', description: 'Proximus Bizz All-in Fiber Ultra 1Gbps / 500Mbps', quantity: 1, unitPrice: 109.50, vatRate: 21, total: 109.50 },
        { id: 'li-2', description: 'Enterprise Mobile 5G Unlimited VIP (x2 lines)', quantity: 2, unitPrice: 40.00, vatRate: 21, total: 80.00 },
      ],
    },
  },
]

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
  const [selectedOcrPreset, setSelectedOcrPreset] = useState<string>('ocr-aws')
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [extractedData, setExtractedData] = useState<AIExtractionResult>(OCR_PRESETS[0].data)
  const [expenseSavedSuccess, setExpenseSavedSuccess] = useState<boolean>(false)

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
      text: `Hello! I am your PulseAI Financial and Business Intelligence Assistant. I analyze your real-time CRM clients, pending invoices, cashflow forecasts, and project milestones. How can I assist you today?`,
      timestamp: 'Just now',
    },
  ])
  const [userInput, setUserInput] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleSimulateScan = (presetId: string) => {
    const preset = OCR_PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    setSelectedOcrPreset(presetId)
    setIsScanning(true)
    setExpenseSavedSuccess(false)

    setTimeout(() => {
      setExtractedData(preset.data)
      setIsScanning(false)
    }, 900)
  }

  const handleApproveExpense = () => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      number: extractedData.invoiceNumber,
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
      items: extractedData.lineItems.map((li) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        vatRate: li.vatRate,
        total: li.total,
      })),
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

    // Generate intelligent contextual response
    setTimeout(() => {
      const qLower = textToSend.toLowerCase()
      let aiResponseText = ''
      let actionLabel: string | undefined
      let actionView: string | undefined

      if (qLower.includes('overdue') || qLower.includes('unpaid') || qLower.includes('invoice')) {
        const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'issued')
        const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.total - i.amountPaid), 0)
        aiResponseText = `You currently have ${overdueInvoices.length} outstanding invoices totaling **${formatCurrency(overdueTotal, selectedCurrency)}**.\n\nTop priority: **${overdueInvoices[0]?.number || 'BE-INV-2026-001'}** (€${overdueInvoices[0]?.total || 4200}) is pending payment. I recommend issuing a 1st Statutory Dunning notice (+€40 fee under Book XIX CEL).`
        actionLabel = 'Go to Dunning & Invoices'
        actionView = 'dunning'
      } else if (qLower.includes('email') || qLower.includes('draft') || qLower.includes('reminder')) {
        aiResponseText = `Here is a drafted reminder email for **TechFlow Logistics NV**:\n\n*Subject: Friendly Payment Reminder - Invoice #BE-INV-2026-001*\n\n"Dear Finance Team,\n\nWe would like to remind you that invoice #BE-INV-2026-001 for the amount of €4,235.00 was due on 2026-08-15. Please ensure settlement via structured reference +++090/9337/55493+++ to avoid automated statutory recovery fees.\n\nKind regards,\nPulseWork Billing Team"`
        actionLabel = 'Review Open Invoices'
        actionView = 'invoices'
      } else if (qLower.includes('project') || qLower.includes('risk') || qLower.includes('budget')) {
        const inProgressProjects = projects.filter((p) => p.status === 'in_progress')
        aiResponseText = `Currently tracking ${inProgressProjects.length} active projects. **TechFlow Fleet ERP Integration** has consumed 82% of its budgeted hours with 2 key sprint milestones remaining. Recommended action: Allocate 10 additional hours or issue a supplementary change order quote.`
        actionLabel = 'Open Projects View'
        actionView = 'projects'
      } else {
        const wonDeals = deals.filter((d) => d.stage === 'won')
        const wonTotal = wonDeals.reduce((sum, d) => sum + d.value, 0)
        aiResponseText = `Summary of current operations: Total won pipeline value is **${formatCurrency(wonTotal, selectedCurrency)}** across ${wonDeals.length} closed deals. 90-day cash flow forecast projects positive operational liquidity. You can inspect comprehensive Executive BI analytics or run an OCR extraction.`
        actionLabel = 'View Executive BI'
        actionView = 'bi'
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
    }, 600)
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
          {/* Left Column: Sample selector & Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Upload Box */}
            <div
              className="card-sandbox"
              style={{
                padding: '1.5rem',
                border: '2px dashed var(--sb-primary)',
                backgroundColor: 'rgba(63, 120, 224, 0.03)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleSimulateScan(selectedOcrPreset)}
            >
              <UploadCloud size={36} color="var(--sb-primary)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sb-heading)' }}>
                Drag & Drop Bill or Receipt PDF
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>
                Supports PDF, PNG, JPG, and scanned smartphone images
              </div>
              <div style={{ marginTop: '0.85rem' }}>
                <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.7rem' }}>
                  ⚡ Auto-Extracts VAT & Line Items
                </span>
              </div>
            </div>

            {/* Test Sample Bills Picker */}
            <div className="card-sandbox" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Try Pre-Configured Test Invoices:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {OCR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSimulateScan(preset.id)}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '0.65rem 0.75rem',
                      textAlign: 'left',
                      borderRadius: 'var(--sb-radius)',
                      border: selectedOcrPreset === preset.id ? '1.5px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                      backgroundColor: selectedOcrPreset === preset.id ? 'var(--sb-primary-soft)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', marginRight: '0.65rem' }}>{preset.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sb-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {preset.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {preset.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
            ) : (
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
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Expense successfully registered in PulseWork P&L Ledger!</span>
                  </div>
                )}

                {/* Metadata Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Invoice Date</div>
                    <div style={{ fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>{extractedData.invoiceDate}</div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Due Date</div>
                    <div style={{ fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>{extractedData.dueDate}</div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Category</div>
                    <div style={{ fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                      {extractedData.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Supplier IBAN</div>
                    <div style={{ fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem', fontSize: '0.76rem', fontFamily: 'monospace' }}>
                      {extractedData.supplierIban || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Extracted Line Items Table */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Itemized Line Items
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>Description</th>
                        <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'center' }}>VAT %</th>
                        <th style={{ padding: '0.6rem 0.75rem', fontWeight: 700, textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.lineItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--sb-heading)' }}>{item.description}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>€{item.unitPrice.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{item.vatRate}%</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--sb-heading)' }}>
                            €{item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-body)' }}>
                      <span>Subtotal (Excl. VAT):</span>
                      <strong>€{extractedData.subtotal.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sb-body)' }}>
                      <span>VAT Total (21%):</span>
                      <strong>€{extractedData.vatTotal.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', borderTop: '1px solid var(--sb-border)', paddingTop: '0.5rem' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: 'var(--sb-primary)' }}>€{extractedData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEAL INTELLIGENCE & WIN PROBABILITY */}
      {activeTab === 'deal_insights' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {deals.map((deal) => {
              const client = companies.find((c) => c.id === deal.companyId)
              const healthScore = deal.stage === 'won' ? 100 : deal.stage === 'lost' ? 15 : deal.probability + 12
              const winProbability = deal.probability

              return (
                <div key={deal.id} className="card-sandbox" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          {deal.stage} Stage
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                          {deal.title}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>
                          {client?.name || 'Prospect Client'} • Value: <strong>{formatCurrency(deal.value, selectedCurrency)}</strong>
                        </div>
                      </div>

                      {/* AI Health Gauge */}
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          border: `3px solid ${healthScore >= 75 ? '#38b995' : healthScore >= 50 ? '#fab758' : '#e2626b'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'var(--sb-surface)',
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                          {healthScore}
                        </span>
                        <span style={{ fontSize: '0.55rem', color: 'var(--sb-body)', textTransform: 'uppercase' }}>Score</span>
                      </div>
                    </div>

                    {/* Win Probability Bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        <span>Predicted Win Probability:</span>
                        <span style={{ color: 'var(--sb-primary)' }}>{winProbability}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--sb-border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${winProbability}%`, height: '100%', backgroundColor: 'var(--sb-primary)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    {/* AI Factor Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--sb-success-text)' }}>
                        <CheckCircle2 size={13} />
                        <span>Client is registered on Peppol network with strong credit rating.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                        <Zap size={13} color="var(--sb-warning)" />
                        <span>Interactive proposal sent with 3 optional service add-ons.</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Next Action */}
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--sb-primary-soft)', borderRadius: 'var(--sb-radius)', border: '1px solid rgba(63, 120, 224, 0.2)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--sb-primary)', textTransform: 'uppercase' }}>
                      Recommended Next-Best Action
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sb-heading)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Schedule follow-up demo call with executive sponsor before validUntil date.
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
              onClick={() => handleSendChat('Draft a friendly payment reminder email for TechFlow Logistics NV')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', border: '1px solid var(--sb-border)', borderRadius: '9999px', backgroundColor: 'var(--sb-surface)' }}
            >
              ✉️ Draft Reminder Email
            </button>
            <button
              onClick={() => handleSendChat('Which projects are currently at risk of exceeding hours budget?')}
              className="btn-sandbox btn-sandbox-ghost"
              style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', border: '1px solid var(--sb-border)', borderRadius: '9999px', backgroundColor: 'var(--sb-surface)' }}
            >
              🚀 Project Hours Risk
            </button>
          </div>

          {/* Chat History Area */}
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatMessages.map((msg, idx) => {
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
              placeholder="Ask PulseAI anything about your CRM, invoices, projects, or tax obligations..."
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
