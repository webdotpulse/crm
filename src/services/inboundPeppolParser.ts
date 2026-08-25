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
 * Helper to find an element in an XML document/node by local tag name (ignoring namespace prefixes)
 */
function findXmlNode(parent: ParentNode | null | undefined, localTagName: string): Element | null {
  if (!parent) return null
  const target = localTagName.toLowerCase()
  // Try getElementsByTagName with both unqualified and qualified name
  const allElements = parent.querySelectorAll ? parent.querySelectorAll('*') : (parent as any).getElementsByTagName?.('*')
  if (allElements) {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const local = (el.localName || el.nodeName.split(':').pop() || '').toLowerCase()
      if (local === target) {
        return el
      }
    }
  }
  return null
}

/**
 * Helper to find all elements matching local tag name
 */
function findXmlNodes(parent: ParentNode | null | undefined, localTagName: string): Element[] {
  if (!parent) return []
  const target = localTagName.toLowerCase()
  const results: Element[] = []
  const allElements = parent.querySelectorAll ? parent.querySelectorAll('*') : (parent as any).getElementsByTagName?.('*')
  if (allElements) {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const local = (el.localName || el.nodeName.split(':').pop() || '').toLowerCase()
      if (local === target) {
        results.push(el)
      }
    }
  }
  return results
}

/**
 * Helper to get text content from a direct or indirect child by local tag name
 */
function getXmlText(parent: ParentNode | null | undefined, localTagName: string): string {
  const node = findXmlNode(parent, localTagName)
  return node?.textContent?.trim() || ''
}

/**
 * Parses Inbound Peppol BIS 3.0 UBL XML string into a structured Expense
 */
export function parseInboundPeppolXml(xmlString: string, fileName?: string): Partial<Expense> {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

    // Supplier Info
    const supplierParty = findXmlNode(xmlDoc, 'AccountingSupplierParty')
    const party = findXmlNode(supplierParty || xmlDoc, 'Party') || supplierParty

    const partyName = getXmlText(party, 'Name') || getXmlText(party, 'RegistrationName')
    const supplierName = partyName || 'Supplier Enterprise'

    const supplierVat = getXmlText(party, 'CompanyID') || getXmlText(party, 'EndpointID')

    const payeeAccount = findXmlNode(xmlDoc, 'PayeeFinancialAccount')
    const supplierIban = getXmlText(payeeAccount, 'ID') || getXmlText(payeeAccount, 'Id')

    // Invoice Meta
    const invoiceNumber = getXmlText(xmlDoc, 'ID') || `INB-${Date.now().toString().slice(-6)}`
    const issueDate = getXmlText(xmlDoc, 'IssueDate') || new Date().toISOString().split('T')[0]
    const dueDate = getXmlText(xmlDoc, 'DueDate') || issueDate
    const currency = getXmlText(xmlDoc, 'DocumentCurrencyCode') || 'EUR'

    // Totals
    const legalMonetary = findXmlNode(xmlDoc, 'LegalMonetaryTotal')
    const taxTotalNode = findXmlNode(xmlDoc, 'TaxTotal')

    const lineExtensionAmount = parseFloat(getXmlText(legalMonetary, 'LineExtensionAmount') || '0')
    const taxTotalAmount = parseFloat(getXmlText(taxTotalNode, 'TaxAmount') || '0')
    const payableAmount = parseFloat(getXmlText(legalMonetary, 'PayableAmount') || '0')

    // Parse Line items
    const items: ExpenseItem[] = []
    const lineNodes = findXmlNodes(xmlDoc, 'InvoiceLine')
    lineNodes.forEach((lineNode, idx) => {
      const itemNode = findXmlNode(lineNode, 'Item')
      const desc = getXmlText(itemNode, 'Name') || getXmlText(itemNode, 'Description') || `Item ${idx + 1}`
      const qty = parseFloat(getXmlText(lineNode, 'InvoicedQuantity') || getXmlText(lineNode, 'BaseQuantity') || '1')
      const priceNode = findXmlNode(lineNode, 'Price')
      const price = parseFloat(getXmlText(priceNode, 'PriceAmount') || '0')
      const taxCategory = findXmlNode(itemNode || lineNode, 'ClassifiedTaxCategory')
      const vatRate = parseFloat(getXmlText(taxCategory, 'Percent') || '21')
      const total = parseFloat(getXmlText(lineNode, 'LineExtensionAmount') || (qty * price).toString())

      items.push({
        id: `exp-item-${idx + 1}`,
        description: desc,
        quantity: qty || 1,
        unitPrice: price || (qty > 0 ? total / qty : total),
        vatRate: isNaN(vatRate) ? 21 : vatRate,
        total: total || (qty * price),
      })
    })

    const category = guessExpenseCategory(`${supplierName} ${items.map((i) => i.description).join(' ')}`)
    const subtotal = lineExtensionAmount || (payableAmount ? payableAmount - taxTotalAmount : 0)
    const total = payableAmount || (subtotal + taxTotalAmount)

    return {
      number: invoiceNumber,
      supplierName,
      supplierVat,
      supplierIban,
      category,
      invoiceDate: issueDate,
      dueDate,
      subtotal: subtotal || 100,
      vatTotal: taxTotalAmount || 21,
      total: total || 121,
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
