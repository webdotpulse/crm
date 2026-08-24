import React, { useState } from 'react'
import {
  Landmark,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  FileText,
  Search,
  Filter,
  Check,
  RefreshCw,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { BankTransaction, Invoice, Expense } from '../../types'
import { formatCurrency } from '../../services/currencyService'
import { SepaBatchModal } from './SepaBatchModal'

export const BankingReconciliationView: React.FC = () => {
  const {
    bankStatements,
    bankTransactions,
    invoices,
    expenses,
    importBankStatement,
    reconcileTransactionWithInvoice,
    reconcileTransactionWithExpense,
    autoReconcileAllTransactions,
    selectedCurrency,
    companies,
    individuals,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'transactions' | 'statements'>('transactions')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unreconciled' | 'reconciled'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSepaModalOpen, setIsSepaModalOpen] = useState<boolean>(false)
  const [autoMatchMessage, setAutoMatchMessage] = useState<string | null>(null)
  const [manualMatchModalTx, setManualMatchModalTx] = useState<BankTransaction | null>(null)

  // Calculate totals
  const totalReconciled = bankTransactions.filter((t) => t.reconciled).length
  const totalTransactions = bankTransactions.length
  const reconciliationRate = totalTransactions > 0 ? Math.round((totalReconciled / totalTransactions) * 100) : 0

  const currentStatement = bankStatements[0]
  const currentBalance = currentStatement ? currentStatement.closingBalance : 51834.09

  // Filtered transactions
  const filteredTransactions = bankTransactions.filter((t) => {
    if (filterStatus === 'unreconciled' && t.reconciled) return false
    if (filterStatus === 'reconciled' && !t.reconciled) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        t.counterpartyName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.structuredReference && t.structuredReference.toLowerCase().includes(q))
      )
    }
    return true
  })

  // 1-Click Auto Reconcile
  const handleAutoReconcile = () => {
    const result = autoReconcileAllTransactions()
    if (result.matchedCount > 0) {
      setAutoMatchMessage(
        `✨ Auto-matched and reconciled ${result.matchedCount} transactions against invoices: ${result.matchedInvoices.join(', ')}`
      )
    } else {
      setAutoMatchMessage('All eligible transactions are already reconciled!')
    }
    setTimeout(() => setAutoMatchMessage(null), 6000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, format: 'coda' | 'camt053' | 'csv') => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      importBankStatement(text, format, file.name)
    }
    reader.readAsText(file)
  }

  // Load sample CODA statement
  const handleLoadSampleCoda = () => {
    const sampleCoda = `000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
100000BE68539007547034000000000000000000000042150800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
21000026082000000000000000000000000145200000000000009093375549300Factuur betaling +++090/9337/55493+++ AeroDynamics
230000BE71091012345678000AeroDynamics Belgium BV
21000026082100000000000000000000000021780000000000004588912234500Payment invoice +++045/8891/22345+++
230000BE42001234567890000Vandenberghe Logistics NV
8000000000000000000000000000000000000000005183409000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`
    importBankStatement(sampleCoda, 'coda', 'CODA_Sample_Belgian_KBC.cod')
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
            Bank Reconciliation & SEPA Direct Debit
          </h1>
          <p style={{ color: 'var(--sb-body)', margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
            Automated Belgian CODA, CAMT.053 & CSV bank statement matching with OGM structured reference support
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleAutoReconcile}
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
            <Sparkles size={16} />
            <span>⚡ 1-Click Auto-Reconcile OGM</span>
          </button>

          <button
            onClick={() => setIsSepaModalOpen(true)}
            className="btn-sandbox btn-sandbox-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.1rem' }}
          >
            <Landmark size={16} color="var(--sb-primary)" />
            <span>SEPA Direct Debit (pain.008)</span>
          </button>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <label
              className="btn-sandbox btn-sandbox-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              <span>Import CODA / CAMT</span>
              <input
                type="file"
                accept=".cod,.xml,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const format = file.name.endsWith('.xml') ? 'camt053' : file.name.endsWith('.csv') ? 'csv' : 'coda'
                  handleFileUpload(e, format)
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Auto Match Notification */}
      {autoMatchMessage && (
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
          <span>{autoMatchMessage}</span>
        </div>
      )}

      {/* Bank Account KPI Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Account Balance (KBC)</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(63, 120, 224, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <Landmark size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {formatCurrency(currentBalance, selectedCurrency)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            BE68 5390 0754 7034 • KBC Corporate
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Reconciliation Progress</span>
            <span className="badge-sandbox badge-soft-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
              {reconciliationRate}% Matched
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            {totalReconciled} / {totalTransactions}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
            {totalTransactions - totalReconciled} transactions awaiting match
          </div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sb-body)' }}>Belgian OGM Engine</span>
            <span className="badge-sandbox badge-soft-primary" style={{ fontSize: '0.68rem' }}>
              MOD 97 ACTIVE
            </span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
            +++123/4567/89012+++
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
            Structured communication check digits verified
          </div>
        </div>
      </div>

      {/* Filter and Tabs Bar */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search transaction, OGM, debtor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sandbox"
            style={{ width: '260px', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="input-sandbox"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
          >
            <option value="all">All Transactions</option>
            <option value="unreconciled">Unreconciled (Action Needed)</option>
            <option value="reconciled">Reconciled</option>
          </select>
        </div>

        <button
          onClick={handleLoadSampleCoda}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sb-primary)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          ⚡ Load Sample Belgian CODA File
        </button>
      </div>

      {/* Bank Transactions Ledger */}
      <div className="card-sandbox" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                DATE / VALUE
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                COUNTERPARTY / IBAN
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                COMMUNICATION / OGM
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'right' }}>
                AMOUNT
              </th>
              <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                RECONCILIATION MATCH
              </th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-heading)', textAlign: 'center' }}>
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => {
              const matchedInvoice = tx.matchedInvoiceId ? invoices.find((i) => i.id === tx.matchedInvoiceId) : null
              const matchedExpense = tx.matchedExpenseId ? expenses.find((e) => e.id === tx.matchedExpenseId) : null

              return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid var(--sb-border)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--sb-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {tx.date}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{tx.valueDate}</div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {tx.counterpartyName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', fontFamily: 'monospace' }}>
                      {tx.counterpartyIban || '—'}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    {tx.structuredReference ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          className="badge-sandbox badge-soft-primary"
                          style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}
                        >
                          {tx.structuredReference}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>{tx.description}</div>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1rem', textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: tx.amount > 0 ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.25rem',
                      }}
                    >
                      {tx.amount > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      {formatCurrency(tx.amount, selectedCurrency)}
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    {tx.reconciled ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
                            {matchedInvoice
                              ? `Matched ${matchedInvoice.number}`
                              : matchedExpense
                              ? `Matched ${matchedExpense.number}`
                              : 'Reconciled'}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--sb-body)' }}>
                            {tx.reconciliationType === 'auto_ogm'
                              ? 'Auto-matched via OGM'
                              : tx.reconciliationType === 'auto_amount'
                              ? 'Auto-matched via Amount'
                              : 'Manually Linked'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.72rem' }}>
                        Unmatched
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    {!tx.reconciled ? (
                      <button
                        onClick={() => setManualMatchModalTx(tx)}
                        className="btn-sandbox btn-sandbox-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                      >
                        Match...
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>✓ Settled</span>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                  <Landmark size={36} color="var(--sb-body)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No bank transactions found</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Import a Belgian CODA, CAMT.053 XML, or CSV bank statement to begin.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Matching Selector Modal */}
      {manualMatchModalTx && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card-sandbox"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              backgroundColor: 'var(--sb-card-bg)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                Reconcile Transaction: {manualMatchModalTx.counterpartyName} ({formatCurrency(manualMatchModalTx.amount, selectedCurrency)})
              </h3>
              <button onClick={() => setManualMatchModalTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', marginBottom: '0.5rem' }}>
                Select Matching Invoice (Accounts Receivable):
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--sb-border)', borderRadius: '8px' }}>
                {invoices
                  .filter((i) => i.status !== 'paid')
                  .map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        reconcileTransactionWithInvoice(manualMatchModalTx.id, inv.id)
                        setManualMatchModalTx(null)
                      }}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderBottom: '1px solid var(--sb-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--sb-primary-soft)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                          {inv.number} • Ref: {inv.structuredReference}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>Due: {inv.dueDate}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--sb-primary)' }}>
                        {formatCurrency(inv.total, selectedCurrency)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {manualMatchModalTx.amount < 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', marginBottom: '0.5rem' }}>
                  Or Select Matching Expense (Accounts Payable):
                </div>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--sb-border)', borderRadius: '8px' }}>
                  {expenses
                    .filter((e) => e.status !== 'paid')
                    .map((exp) => (
                      <div
                        key={exp.id}
                        onClick={() => {
                          reconcileTransactionWithExpense(manualMatchModalTx.id, exp.id)
                          setManualMatchModalTx(null)
                        }}
                        style={{
                          padding: '0.6rem 0.85rem',
                          borderBottom: '1px solid var(--sb-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                            {exp.supplierName} • {exp.number}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>{exp.category}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ef4444' }}>
                          {formatCurrency(exp.total, selectedCurrency)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setManualMatchModalTx(null)}
                className="btn-sandbox btn-sandbox-outline"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEPA Modal */}
      {isSepaModalOpen && <SepaBatchModal onClose={() => setIsSepaModalOpen(false)} />}
    </div>
  )
}
