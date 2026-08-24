import { Invoice, Expense, Company, LegalEntity, BelgianVatGridResult, BelgianKlantenlistingCustomer } from '../types'

/**
 * Filter invoices and expenses by selected year and quarter
 */
export function filterByPeriod(
  items: { date: string }[],
  year: number,
  quarter: 1 | 2 | 3 | 4 | 'all'
) {
  return items.filter((item) => {
    const itemDate = new Date(item.date)
    const itemYear = itemDate.getFullYear()
    if (itemYear !== year) return false
    if (quarter === 'all') return true

    const month = itemDate.getMonth() + 1 // 1-12
    const itemQuarter = Math.ceil(month / 3)
    return itemQuarter === quarter
  })
}

/**
 * Computes Belgian VAT Return Grids based on Invoices and Expenses
 */
export function calculateBelgianVatGrids(options: {
  invoices: Invoice[]
  expenses: Expense[]
  year: number
  quarter: 1 | 2 | 3 | 4 | 'all'
}): BelgianVatGridResult {
  const { invoices, expenses, year, quarter } = options

  // Filter invoices for the period
  const filteredInvoices = invoices.filter((inv) => {
    if (inv.status === 'draft') return false
    const d = new Date(inv.issueDate)
    if (d.getFullYear() !== year) return false
    if (quarter === 'all') return true
    return Math.ceil((d.getMonth() + 1) / 3) === quarter
  })

  // Filter expenses for the period
  const filteredExpenses = expenses.filter((exp) => {
    if (exp.status === 'rejected') return false
    const d = new Date(exp.invoiceDate)
    if (d.getFullYear() !== year) return false
    if (quarter === 'all') return true
    return Math.ceil((d.getMonth() + 1) / 3) === quarter
  })

  let grid00 = 0 // 0% rate / intra-community / export
  let grid01 = 0 // 6% rate
  let grid02 = 0 // 12% rate
  let grid03 = 0 // 21% rate
  let grid54 = 0 // Total output VAT

  filteredInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const lineExcl = (item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100))
      const rate = item.vatRate

      if (rate === 0 || item.taxCategory === 'AE' || item.taxCategory === 'Z' || item.taxCategory === 'E') {
        grid00 += lineExcl
      } else if (rate === 6) {
        grid01 += lineExcl
      } else if (rate === 12) {
        grid02 += lineExcl
      } else if (rate === 21 || rate >= 19) {
        grid03 += lineExcl
      } else {
        grid03 += lineExcl
      }
    })
    grid54 += inv.taxTotal
  })

  let grid81 = 0 // Raw materials / goods for resale (hardware)
  let grid82 = 0 // Miscellaneous goods & services (hosting, telecom, consulting, rent)
  let grid83 = 0 // Investment goods / capital goods
  let grid55 = 0 // Deductible input VAT

  filteredExpenses.forEach((exp) => {
    const excl = exp.subtotal
    if (exp.category === 'hardware') {
      grid81 += excl
    } else if (exp.category === 'office_rent' && excl > 5000) {
      grid83 += excl
    } else {
      grid82 += excl
    }
    grid55 += exp.vatTotal
  })

  const diff = grid54 - grid55
  const grid71_netToPay = diff > 0 ? diff : 0
  const grid72_netToRefund = diff < 0 ? Math.abs(diff) : 0

  return {
    grid00: Math.round(grid00 * 100) / 100,
    grid01: Math.round(grid01 * 100) / 100,
    grid02: Math.round(grid02 * 100) / 100,
    grid03: Math.round(grid03 * 100) / 100,
    grid54: Math.round(grid54 * 100) / 100,
    grid81: Math.round(grid81 * 100) / 100,
    grid82: Math.round(grid82 * 100) / 100,
    grid83: Math.round(grid83 * 100) / 100,
    grid55: Math.round(grid55 * 100) / 100,
    grid71_netToPay: Math.round(grid71_netToPay * 100) / 100,
    grid72_netToRefund: Math.round(grid72_netToRefund * 100) / 100,
    totalSalesExclusive: Math.round((grid00 + grid01 + grid02 + grid03) * 100) / 100,
    totalSalesVat: Math.round(grid54 * 100) / 100,
    totalPurchasesExclusive: Math.round((grid81 + grid82 + grid83) * 100) / 100,
    totalPurchasesVat: Math.round(grid55 * 100) / 100,
  }
}

/**
 * Calculates Belgian Annual Client Listing (Jaarlijkse Klantenlisting)
 * Only Belgian clients with valid VAT number & turnover > 250 EUR
 */
export function calculateBelgianKlantenlisting(options: {
  invoices: Invoice[]
  companies: Company[]
  year: number
}): BelgianKlantenlistingCustomer[] {
  const { invoices, companies, year } = options

  // Map totals per company
  const companyTotals: Record<string, { turnover: number; vat: number; company: Company }> = {}

  invoices.forEach((inv) => {
    if (inv.status === 'draft') return
    const d = new Date(inv.issueDate)
    if (d.getFullYear() !== year) return
    if (!inv.companyId) return

    const company = companies.find((c) => c.id === inv.companyId)
    if (!company || !company.vatNumber) return

    const cleanVat = company.vatNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    // Must be Belgian VAT (BE...)
    if (!cleanVat.startsWith('BE')) return

    if (!companyTotals[company.id]) {
      companyTotals[company.id] = { turnover: 0, vat: 0, company }
    }
    companyTotals[company.id].turnover += inv.subtotal
    companyTotals[company.id].vat += inv.taxTotal
  })

  // Filter turnover > 250 EUR threshold
  const results: BelgianKlantenlistingCustomer[] = []
  Object.values(companyTotals).forEach((entry) => {
    if (entry.turnover >= 250) {
      const cleanVat = entry.company.vatNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      results.push({
        vatNumber: entry.company.vatNumber,
        cleanVatNumber: cleanVat.replace('BE', ''),
        companyName: entry.company.name,
        countryCode: 'BE',
        totalTurnover: Math.round(entry.turnover * 100) / 100,
        totalVat: Math.round(entry.vat * 100) / 100,
      })
    }
  })

  return results.sort((a, b) => b.totalTurnover - a.totalTurnover)
}

/**
 * Generates official Belgian Intervat XML for Annual Client Listing
 */
export function generateIntervatKlantenlistingXml(options: {
  declarant: LegalEntity
  year: number
  customers: BelgianKlantenlistingCustomer[]
}): string {
  const { declarant, year, customers } = options
  const cleanDeclarantVat = declarant.vatNumber.replace(/[^0-9]/g, '')
  const totalTurnoverAll = customers.reduce((sum, c) => sum + c.totalTurnover, 0)
  const totalVatAll = customers.reduce((sum, c) => sum + c.totalVat, 0)

  const clientNodes = customers
    .map((cust, idx) => {
      return `    <Client SequenceNumber="${idx + 1}">
      <CompanyVATNumber issuedBy="BE">${cust.cleanVatNumber.padStart(10, '0')}</CompanyVATNumber>
      <TurnOver>${cust.totalTurnover.toFixed(2)}</TurnOver>
      <VATAmount>${cust.totalVat.toFixed(2)}</VATAmount>
    </Client>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<ClientListingConsignment xmlns="http://www.minfin.fgov.be/ClientListingConsignment" ClientListingConsignmentVersion="2.0">
  <Declarant>
    <VATNumber>${cleanDeclarantVat.padStart(10, '0')}</VATNumber>
    <Name>${escapeXml(declarant.legalName || declarant.name)}</Name>
    <Street>${escapeXml(declarant.address)}</Street>
    <PostCode>${escapeXml(declarant.postalCode)}</PostCode>
    <City>${escapeXml(declarant.city)}</City>
    <CountryCode>BE</CountryCode>
    <EmailAddress>${escapeXml(declarant.email)}</EmailAddress>
    <Phone>${escapeXml(declarant.phone)}</Phone>
  </Declarant>
  <Period>${year}</Period>
  <ClientList TurnOverSum="${totalTurnoverAll.toFixed(2)}" VATAmountSum="${totalVatAll.toFixed(2)}" ClientsCount="${customers.length}">
${clientNodes}
  </ClientList>
</ClientListingConsignment>`
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
