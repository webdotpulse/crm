import { Expense, ExpenseCategory, ExpenseItem } from '../types'

/**
 * Categorize supplier automatically based on supplier name or description
 */
export function guessExpenseCategory(text: string): ExpenseCategory {
  const lower = text.toLowerCase()
  if (lower.includes('aws') || lower.includes('amazon') || lower.includes('google cloud') || lower.includes('azure') || lower.includes('github') || lower.includes('digitalocean') || lower.includes('hosting') || lower.includes('combell') || lower.includes('domain') || lower.includes('slack') || lower.includes('notion')) {
    return 'hosting_software'
  }
  if (lower.includes('proximus') || lower.includes('telenet') || lower.includes('orange') || lower.includes('base') || lower.includes('telecom') || lower.includes('mobile')) {
    return 'telecom'
  }
  if (lower.includes('rent') || lower.includes('office') || lower.includes('huur') || lower.includes('kantoor') || lower.includes('building')) {
    return 'office_rent'
  }
  if (lower.includes('consult') || lower.includes('freelance') || lower.includes('developer') || lower.includes('subcontractor') || lower.includes('agency')) {
    return 'subcontractors'
  }
  if (lower.includes('dell') || lower.includes('apple') || lower.includes('hardware') || lower.includes('lenovo') || lower.includes('coolblue') || lower.includes('server')) {
    return 'hardware'
  }
  if (lower.includes('flight') || lower.includes('train') || lower.includes('hotel') || lower.includes('restaurant') || lower.includes('sncb') || lower.includes('uber') || lower.includes('taxi')) {
    return 'travel_meals'
  }
  if (lower.includes('accountant') || lower.includes('lawyer') || lower.includes('notary') || lower.includes('juridisch') || lower.includes('advocaat') || lower.includes('audit')) {
    return 'professional_services'
  }
  if (lower.includes('ads') || lower.includes('marketing') || lower.includes('facebook') || lower.includes('meta') || lower.includes('linkedin') || lower.includes('google ads')) {
    return 'marketing'
  }
  return 'other'
}

/**
 * Parses Inbound Peppol BIS 3.0 UBL XML string into a structured Expense
 */
export function parseInboundPeppolXml(xmlString: string, fileName?: string): Partial<Expense> {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    // Supplier Info
    const supplierParty = xmlDoc.querySelector('AccountingSupplierParty > Party')
    const supplierName = supplierParty?.querySelector('PartyName > Name')?.textContent ||
      supplierParty?.querySelector('PartyLegalEntity > RegistrationName')?.textContent ||
      'Supplier Enterprise'

    const supplierVat = supplierParty?.querySelector('PartyTaxScheme > CompanyID')?.textContent ||
      supplierParty?.querySelector('EndpointID')?.textContent ||
      ''

    const supplierIban = xmlDoc.querySelector('PaymentMeans > PayeeFinancialAccount > Id')?.textContent || ''

    // Invoice Meta
    const invoiceNumber = xmlDoc.querySelector('Invoice > ID')?.textContent || `INB-${Date.now().toString().slice(-6)}`
    const issueDate = xmlDoc.querySelector('IssueDate')?.textContent || new Date().toISOString().split('T')[0]
    const dueDate = xmlDoc.querySelector('DueDate')?.textContent || issueDate
    const currency = xmlDoc.querySelector('DocumentCurrencyCode')?.textContent || 'EUR'

    // Totals
    const lineExtensionAmount = parseFloat(xmlDoc.querySelector('LegalMonetaryTotal > LineExtensionAmount')?.textContent || '0')
    const taxTotalAmount = parseFloat(xmlDoc.querySelector('TaxTotal > TaxAmount')?.textContent || '0')
    const payableAmount = parseFloat(xmlDoc.querySelector('LegalMonetaryTotal > PayableAmount')?.textContent || '0')

    // Parse Line items
    const items: ExpenseItem[] = []
    const lineNodes = xmlDoc.querySelectorAll('InvoiceLine')
    lineNodes.forEach((lineNode, idx) => {
      const desc = lineNode.querySelector('Item > Name')?.textContent || lineNode.querySelector('Item > Description')?.textContent || `Item ${idx + 1}`
      const qty = parseFloat(lineNode.querySelector('InvoicedQuantity')?.textContent || '1')
      const price = parseFloat(lineNode.querySelector('Price > PriceAmount')?.textContent || '0')
      const vatRate = parseFloat(lineNode.querySelector('ClassifiedTaxCategory > Percent')?.textContent || '21')
      const total = parseFloat(lineNode.querySelector('LineExtensionAmount')?.textContent || (qty * price).toString())

      items.push({
        id: `exp-item-${idx + 1}`,
        description: desc,
        quantity: qty || 1,
        unitPrice: price || total,
        vatRate: vatRate || 21,
        total: total || (qty * price),
      })
    })

    const category = guessExpenseCategory(`${supplierName} ${items.map((i) => i.description).join(' ')}`)

    return {
      number: invoiceNumber,
      supplierName,
      supplierVat,
      supplierIban,
      category,
      invoiceDate: issueDate,
      dueDate,
      subtotal: lineExtensionAmount || (payableAmount - taxTotalAmount),
      vatTotal: taxTotalAmount,
      total: payableAmount || (lineExtensionAmount + taxTotalAmount),
      currency,
      status: 'pending',
      isPeppolInbound: true,
      peppolXml: xmlString,
      items: items.length > 0 ? items : undefined,
      notes: `Imported via Peppol BIS 3.0 inbound gateway from ${supplierName}. File: ${fileName || 'ubl-invoice.xml'}`,
    }
  } catch (err) {
    console.error('Failed to parse inbound Peppol XML:', err)
    return {
      number: `INB-ERR-${Date.now().toString().slice(-4)}`,
      supplierName: 'Unknown Supplier',
      category: 'other',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      subtotal: 100,
      vatTotal: 21,
      total: 121,
      currency: 'EUR',
      status: 'pending',
      isPeppolInbound: true,
      peppolXml: xmlString,
      notes: 'Imported with fallback defaults.',
    }
  }
}
