import React, { useState } from 'react'
import {
  Calculator,
  Download,
  FileSpreadsheet,
  FileCode2,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  calculateBelgianVatGrids,
  calculateBelgianKlantenlisting,
  generateIntervatKlantenlistingXml,
} from '../../services/accountantExport'
import { formatCurrency } from '../../services/currencyService'

export const AccountantView: React.FC = () => {
  const { invoices, expenses, companies, activeLegalEntity, selectedCurrency } = useApp()

  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4 | 'all'>(3)
  const [activeTab, setActiveTab] = useState<'vat_grids' | 'klantenlisting' | 'export_packages'>('vat_grids')

  // Calculate VAT Grids
  const vatGrids = calculateBelgianVatGrids({
    invoices,
    expenses,
    year: selectedYear,
    quarter: selectedQuarter,
  })

  // Calculate Annual Klantenlisting
  const klantenlisting = calculateBelgianKlantenlisting({
    invoices,
    companies,
    year: selectedYear,
  })

  const totalKlantenTurnover = klantenlisting.reduce((sum, c) => sum + c.totalTurnover, 0)
  const totalKlantenVat = klantenlisting.reduce((sum, c) => sum + c.totalVat, 0)

  // Download Klantenlisting XML
  const handleDownloadKlantenlistingXml = () => {
    const xml = generateIntervatKlantenlistingXml({
      declarant: activeLegalEntity,
      year: selectedYear,
      customers: klantenlisting,
    })
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Klantenlisting_${selectedYear}_${activeLegalEntity.vatNumber.replace(/\D/g, '')}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Download Universal Accountant JSON Package
  const handleDownloadAccountantPackage = () => {
    const pkg = {
      manifest: {
        exportedAt: new Date().toISOString(),
        legalEntity: activeLegalEntity,
        software: 'PulseWork SMB Suite v2.5',
        year: selectedYear,
        quarter: selectedQuarter,
      },
      vatReturnSummary: vatGrids,
      annualKlantenlisting: klantenlisting,
      salesInvoices: invoices.filter((i) => i.status !== 'draft'),
      supplierPurchases: expenses.filter((e) => e.status !== 'rejected'),
    }

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PulseWork_Accountant_Export_${selectedYear}_Q${selectedQuarter}.json`
    a.click()
    URL.revokeObjectURL(url)
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
            Belgian & EU Accountant Hub
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            VAT Return Grids (00–83), Intervat Annual Klantenlisting & seamless accounting export
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="input-sandbox"
            style={{ padding: '0.55rem 0.85rem', fontWeight: 700 }}
          >
            <option value={2026}>Fiscal Year 2026</option>
            <option value={2025}>Fiscal Year 2025</option>
          </select>

          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value === 'all' ? 'all' : (parseInt(e.target.value, 10) as any))}
            className="input-sandbox"
            style={{ padding: '0.55rem 0.85rem', fontWeight: 700 }}
          >
            <option value={3}>Quarter 3 (Jul - Sep)</option>
            <option value={2}>Quarter 2 (Apr - Jun)</option>
            <option value={1}>Quarter 1 (Jan - Mar)</option>
            <option value={4}>Quarter 4 (Oct - Dec)</option>
            <option value="all">Full Year (Q1-Q4)</option>
          </select>

          <button
            onClick={handleDownloadAccountantPackage}
            className="btn-sandbox btn-sandbox-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
          >
            <Download size={16} />
            <span>Export Accountant ZIP / JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--sb-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('vat_grids')}
          className={`btn-sandbox ${activeTab === 'vat_grids' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <Calculator size={15} style={{ marginRight: '0.4rem' }} />
          Belgian VAT Return Grids (00–83)
        </button>

        <button
          onClick={() => setActiveTab('klantenlisting')}
          className={`btn-sandbox ${activeTab === 'klantenlisting' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <FileCode2 size={15} style={{ marginRight: '0.4rem' }} />
          Annual Client Listing (Klantenlisting)
        </button>

        <button
          onClick={() => setActiveTab('export_packages')}
          className={`btn-sandbox ${activeTab === 'export_packages' ? 'btn-sandbox-primary' : 'btn-sandbox-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
        >
          <FileSpreadsheet size={15} style={{ marginRight: '0.4rem' }} />
          Accounting Software Integrations
        </button>
      </div>

      {/* TAB 1: VAT RETURN GRIDS */}
      {activeTab === 'vat_grids' && (
        <div>
          {/* Summary Status Box */}
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem 1.75rem',
              marginBottom: '1.5rem',
              backgroundColor: vatGrids.grid71_netToPay > 0 ? 'rgba(63, 120, 224, 0.06)' : 'rgba(16, 185, 129, 0.06)',
              border: `1px solid ${vatGrids.grid71_netToPay > 0 ? 'rgba(63, 120, 224, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sb-body)' }}>
                Official Belgian VAT Declaration Balance ({selectedYear} {selectedQuarter === 'all' ? 'Full Year' : `Q${selectedQuarter}`})
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
                {vatGrids.grid71_netToPay > 0 ? (
                  <span style={{ color: 'var(--sb-primary)' }}>
                    {formatCurrency(vatGrids.grid71_netToPay, selectedCurrency)} (Net VAT Payable — Grid 71)
                  </span>
                ) : (
                  <span style={{ color: '#10b981' }}>
                    {formatCurrency(vatGrids.grid72_netToRefund, selectedCurrency)} (VAT Refund Due — Grid 72)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.25rem' }}>
                Total Output VAT (Grid 54): {formatCurrency(vatGrids.grid54, selectedCurrency)} • Deductible Input VAT (Grid 55): {formatCurrency(vatGrids.grid55, selectedCurrency)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                <CheckCircle2 size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                Intervat Compatible
              </span>
            </div>
          </div>

          {/* Grids Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Sales Grids (Output) */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Outgoing Sales & Services (Outbound)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 00</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>0% Rate / Intra-Community / Export</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid00, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 01</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>6% Reduced Rate (Food, Books)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid01, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 02</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>12% Intermediate Rate (Catering)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid02, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 03</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>21% Standard Rate (Services & IT)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid03, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.85rem', backgroundColor: 'var(--sb-primary-soft)', borderRadius: '8px', border: '1px solid var(--sb-primary)' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-primary)', fontSize: '0.9rem' }}>Grid 54 (Total Output VAT)</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Total VAT charged to clients</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--sb-primary)' }}>
                    {formatCurrency(vatGrids.grid54, selectedCurrency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Inbound Purchases Grids */}
            <div className="card-sandbox" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                Inbound Purchases & Expenses (Deductible)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 81</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Raw Materials & Merchandise for Resale</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid81, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 82</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Diverse Goods & Services (Hosting, Telecom, Office)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid82, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--sb-bg)', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: 'var(--sb-heading)', fontSize: '0.85rem' }}>Grid 83</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Investment & Capital Equipment (&gt; €1,000)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--sb-heading)' }}>
                    {formatCurrency(vatGrids.grid83, selectedCurrency)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.85rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <div>
                    <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>Grid 55 (Total Deductible VAT)</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>Total VAT recoverable from supplier bills</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#10b981' }}>
                    {formatCurrency(vatGrids.grid55, selectedCurrency)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNUAL KLANTENLISTING */}
      {activeTab === 'klantenlisting' && (
        <div>
          <div
            className="card-sandbox"
            style={{
              padding: '1.25rem 1.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sb-body)' }}>
                Belgian Annual Client Listing (Jaarlijkse Klantenlisting {selectedYear})
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>
                {klantenlisting.length} Belgian VAT-Registered Clients with Turnover &gt; €250.00
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', marginTop: '0.2rem' }}>
                Total Turnover: <strong>{formatCurrency(totalKlantenTurnover, selectedCurrency)}</strong> • Total VAT: <strong>{formatCurrency(totalKlantenVat, selectedCurrency)}</strong>
              </div>
            </div>

            <button
              onClick={handleDownloadKlantenlistingXml}
              className="btn-sandbox btn-sandbox-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
            >
              <Download size={16} />
              <span>Download Intervat XML File</span>
            </button>
          </div>

          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    BELGIAN VAT NUMBER
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                    COMPANY NAME
                  </th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                    TAXABLE BASE (EXCL. VAT)
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                    VAT CHARGED
                  </th>
                </tr>
              </thead>
              <tbody>
                {klantenlisting.map((cust, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {cust.vatNumber}
                    </td>
                    <td style={{ padding: '1rem 1rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
                      {cust.companyName}
                    </td>
                    <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {formatCurrency(cust.totalTurnover, selectedCurrency)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 700, color: 'var(--sb-body)' }}>
                      {formatCurrency(cust.totalVat, selectedCurrency)}
                    </td>
                  </tr>
                ))}

                {klantenlisting.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                      No Belgian clients exceeding the €250 annual threshold in {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNTING INTEGRATIONS */}
      {activeTab === 'export_packages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              ⚡ Exact Online & Yuki
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Standard UBL XML invoice exports paired with Belgian CODA bank statement logs.
            </p>
            <button
              onClick={handleDownloadAccountantPackage}
              className="btn-sandbox btn-sandbox-outline"
              style={{ width: '100%', padding: '0.5rem' }}
            >
              Export Exact / Yuki Bundle
            </button>
          </div>

          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              ⚡ WinBooks & Octopus
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Structured VAT audit file with journal entries mapped to Belgian standard general accounts (PCMN / MAR).
            </p>
            <button
              onClick={handleDownloadAccountantPackage}
              className="btn-sandbox btn-sandbox-outline"
              style={{ width: '100%', padding: '0.5rem' }}
            >
              Export WinBooks / Octopus Audit
            </button>
          </div>

          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              ⚡ Silverfin & ClearFacts
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', lineHeight: 1.5, margin: '0 0 1rem' }}>
              Cloud accounting synchronization with customer VAT listings and quarterly P&L ledger.
            </p>
            <button
              onClick={handleDownloadAccountantPackage}
              className="btn-sandbox btn-sandbox-outline"
              style={{ width: '100%', padding: '0.5rem' }}
            >
              Export Silverfin Sync File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
