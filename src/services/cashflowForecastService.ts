import {
  Invoice,
  Expense,
  SubscriptionContract,
  FinancialHealthMetrics,
  CashFlowDailyPoint,
  AiFinancialInsight,
  BankTransaction,
} from '../types'

export function generate90DayCashFlowForecast(
  invoices: Invoice[],
  expenses: Expense[],
  subscriptions: SubscriptionContract[],
  bankTransactions: BankTransaction[] = [],
  startingCash: number = 0
): { dailyPoints: CashFlowDailyPoint[]; metrics: FinancialHealthMetrics } {
  const dailyPoints: CashFlowDailyPoint[] = []
  const today = new Date()
  let runningCash = startingCash

  // Calculate monthly recurring revenue (MRR)
  const activeMrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      if (s.cadence === 'monthly') return sum + s.total
      if (s.cadence === 'quarterly') return sum + s.total / 3
      if (s.cadence === 'annually') return sum + s.total / 12
      return sum + s.total
    }, 0)

  // Calculate average daily recurring expenses
  const monthlyRecurringExpenses = expenses
    .filter((e) => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + e.total, 0) / (expenses.length > 0 ? 2 : 1)

  // Calculate real VAT liability
  const totalSalesVat = invoices
    .filter((i) => i.status !== 'draft')
    .reduce((sum, i) => sum + (i.taxTotal || 0), 0)
  const totalPurchasesVat = expenses
    .filter((e) => e.status !== 'rejected')
    .reduce((sum, e) => sum + (e.vatTotal || 0), 0)
  const estimatedVatReserveEur = Math.max(0, Math.round((totalSalesVat - totalPurchasesVat) * 100) / 100)

  // Calculate net profit estimate for corporate tax
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
  const totalExp = expenses.filter((e) => e.status !== 'rejected').reduce((sum, e) => sum + e.total, 0)
  const netProfit = Math.max(0, totalRevenue - totalExp)
  const estimatedCorporateTaxEur = Math.round(netProfit * 0.25 * 100) / 100

  let totalProjectedIncome90 = 0
  let totalProjectedExpenses90 = 0

  for (let i = 0; i <= 90; i++) {
    const currentDate = new Date(today.getTime() + i * 86400000)
    const dateStr = currentDate.toISOString().slice(0, 10)
    const dayOfMonth = currentDate.getDate()

    let dailyIncome = 0
    let dailyExpense = 0

    // Check specific scheduled invoice collections due on this date
    const invoicesDue = invoices.filter((inv) => {
      if (inv.status !== 'issued' && inv.status !== 'overdue') return false
      const invDue = new Date(inv.dueDate)
      const diff = Math.floor((invDue.getTime() - currentDate.getTime()) / 86400000)
      return diff === 0
    })

    invoicesDue.forEach((inv) => {
      dailyIncome += inv.total - (inv.amountPaid || 0)
    })

    // Subscriptions bill on the 1st and 15th of the month
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      dailyIncome += activeMrr / 2
    }

    // Regular expenses scheduled throughout month
    if (monthlyRecurringExpenses > 0) {
      if (dayOfMonth === 25) {
        dailyExpense += monthlyRecurringExpenses * 0.6
      } else if (dayOfMonth === 5) {
        dailyExpense += monthlyRecurringExpenses * 0.4
      }
    }

    // Quarterly Belgian VAT payment on 20th of month (April, July, Oct, Jan)
    const month = currentDate.getMonth() + 1
    if ((month === 1 || month === 4 || month === 7 || month === 10) && dayOfMonth === 20 && estimatedVatReserveEur > 0) {
      dailyExpense += estimatedVatReserveEur
    }

    runningCash += dailyIncome - dailyExpense
    totalProjectedIncome90 += dailyIncome
    totalProjectedExpenses90 += dailyExpense

    const vatReserve = Math.max(0, runningCash * 0.18)

    dailyPoints.push({
      date: dateStr,
      confirmedCash: i === 0 ? startingCash : runningCash,
      projectedIncome: dailyIncome,
      projectedExpenses: dailyExpense,
      netCashBalance: Math.round(runningCash * 100) / 100,
      vatReserveObligation: Math.round(vatReserve * 100) / 100,
    })
  }

  // Calculate DSO (Days Sales Outstanding)
  const totalReceivables = invoices
    .filter((i) => i.status === 'issued' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0)

  const totalSales = invoices.reduce((sum, i) => sum + i.total, 0)
  const dsoDays = totalSales > 0 ? Math.round((totalReceivables / totalSales) * 60) + 14 : 0

  const totalOutflows = (monthlyRecurringExpenses * 2) || (totalReceivables > 0 ? 1000 : 0)
  const liquidityRatio = totalOutflows > 0 ? Math.round(((startingCash + totalReceivables) / totalOutflows) * 10) / 10 : (startingCash > 0 ? 10 : 0)

  const insights: AiFinancialInsight[] = []

  if (activeMrr > 0) {
    insights.push({
      id: 'ins-mrr',
      type: 'opportunity',
      title: 'Accelerate Cash Collection with Direct Debit',
      description: `You have €${activeMrr.toFixed(2)} in active monthly retainer subscriptions. Enrolling clients in SEPA Direct Debit will shorten payment cycles.`,
      impactEur: activeMrr,
      actionLabel: 'Generate SEPA XML Batch',
      metricName: 'DSO Optimization',
    })
  }

  if (totalReceivables > 0) {
    insights.push({
      id: 'ins-receivables',
      type: 'tax',
      title: 'Outstanding Accounts Receivable',
      description: `You have €${totalReceivables.toFixed(2)} in pending or overdue receivables. Send reminders to ensure healthy working capital.`,
      impactEur: totalReceivables,
      actionLabel: 'Inspect Invoices',
      metricName: 'Accounts Receivable',
    })
  }

  if (estimatedVatReserveEur > 0) {
    insights.push({
      id: 'ins-vat',
      type: 'tax',
      title: 'Quarterly VAT Reserve Obligation',
      description: `Estimated net VAT obligation is €${estimatedVatReserveEur.toFixed(2)}. Ensure sufficient liquidity before the statutory deadline.`,
      impactEur: -estimatedVatReserveEur,
      actionLabel: 'Inspect VAT Grids',
      metricName: 'Intervat Tax Reserve',
    })
  }

  return {
    dailyPoints,
    metrics: {
      currentCashEur: startingCash,
      projectedCash90DaysEur: Math.round(runningCash * 100) / 100,
      dsoDays,
      liquidityRatio,
      estimatedVatReserveEur,
      estimatedCorporateTaxEur,
      insights,
    },
  }
}
