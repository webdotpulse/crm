import { PurchaseOrder, Expense, ThreeWayMatchResult } from '../types'

export function evaluateThreeWayMatch(po: PurchaseOrder, inboundExpense?: Expense): ThreeWayMatchResult {
  const discrepancies: string[] = []
  let isMatched = true
  let discrepancyEur = 0

  // 1. Check Goods Receipt Status
  const unreceivedItems = po.items.filter((item) => item.quantityReceived < item.quantityOrdered)
  const isFullyReceived = unreceivedItems.length === 0
  const deliveryStatus = isFullyReceived
    ? 'Fully Received & Inspected'
    : po.items.some((i) => i.quantityReceived > 0)
    ? 'Partially Received'
    : 'Awaiting Delivery'

  if (!isFullyReceived) {
    discrepancies.push(`Physical delivery incomplete: ${unreceivedItems.length} line items pending warehouse check.`)
    isMatched = false
  }

  // 2. Check Matching Supplier Invoice
  if (!inboundExpense) {
    discrepancies.push('No inbound supplier invoice (Peppol / PDF) linked to this purchase order.')
    isMatched = false
  } else {
    // Price discrepancy check
    discrepancyEur = Math.round(Math.abs(inboundExpense.total - po.total) * 100) / 100
    if (discrepancyEur > 0.05) {
      discrepancies.push(
        `Invoice total (€${inboundExpense.total.toFixed(2)}) differs from Purchase Order total (€${po.total.toFixed(2)}) by €${discrepancyEur.toFixed(2)}.`
      )
      isMatched = false
    }

    if (!inboundExpense.supplierName.toLowerCase().includes(po.supplierName.toLowerCase().slice(0, 5))) {
      discrepancies.push(`Supplier identity mismatch: PO issued to "${po.supplierName}" but invoice from "${inboundExpense.supplierName}".`)
      isMatched = false
    }
  }

  return {
    isMatched,
    poNumber: po.number,
    invoiceNumber: inboundExpense?.number || 'PENDING',
    deliveryStatus,
    discrepancyEur,
    discrepancies,
    approvedForPayment: isMatched,
  }
}
