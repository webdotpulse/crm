import { Invoice, Company, CompanyProfile } from '../types'

/**
 * Generates standard-compliant Peppol BIS Billing 3.0 (EN 16931) UBL 2.1 XML
 */
export function generatePeppolUblXml(
  invoice: Invoice,
  seller: CompanyProfile,
  buyer: Company
): string {
  const sanitize = (str: string | undefined | null) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const formatAmount = (num: number) => (Number(num) || 0).toFixed(2)
  const formatQty = (num: number) => (Number(num) || 0).toFixed(2)

  // Map unit to standard UN/ECE Recommendation 20 unit codes
  const mapUnitCode = (unit: string) => {
    const u = (unit || '').toLowerCase()
    if (u.includes('hour') || u.includes('hr') || u === 'h') return 'HUR'
    if (u.includes('day') || u === 'd') return 'DAY'
    if (u.includes('month') || u === 'mo') return 'MON'
    if (u.includes('item') || u.includes('unit') || u.includes('pc') || u === 'pcs') return 'C62'
    if (u.includes('pack') || u.includes('pkg')) return 'PK'
    if (u.includes('km')) return 'KMT'
    return 'C62'
  }

  // Group items by tax rate & category
  const taxSubtotalsMap = new Map<
    string,
    { rate: number; category: string; taxableBase: number; taxAmount: number }
  >()

  invoice.items.forEach((item) => {
    const key = `${item.taxCategory}_${item.vatRate}`
    const existing = taxSubtotalsMap.get(key) || {
      rate: item.vatRate,
      category: item.taxCategory,
      taxableBase: 0,
      taxAmount: 0,
    }
    const itemNet = item.quantity * item.unitPrice * (1 - item.discountPercent / 100)
    const itemTax = itemNet * (item.vatRate / 100)

    existing.taxableBase += itemNet
    existing.taxAmount += itemTax
    taxSubtotalsMap.set(key, existing)
  })

  const taxSubtotals = Array.from(taxSubtotalsMap.values())

  const isCreditNote = invoice.total < 0 || invoice.number.startsWith('CN-')
  const rootTag = isCreditNote ? 'CreditNote' : 'Invoice'
  const typeCode = isCreditNote ? '381' : '380'
  const qtyTag = isCreditNote ? 'cbc:CreditedQuantity' : 'cbc:InvoicedQuantity'
  const lineTag = isCreditNote ? 'cac:CreditNoteLine' : 'cac:InvoiceLine'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<${rootTag} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${rootTag}-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  
  <!-- Peppol BIS Billing 3.0 / EN 16931 Mandatory Header Identifiers -->
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${sanitize(invoice.number)}</cbc:ID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${invoice.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>${typeCode}</cbc:InvoiceTypeCode>
  ${invoice.notes ? `<cbc:Note>${sanitize(invoice.notes)}</cbc:Note>` : ''}
  <cbc:DocumentCurrencyCode>${invoice.currency || 'EUR'}</cbc:DocumentCurrencyCode>
  <cbc:BuyerReference>${sanitize(buyer.name)}</cbc:BuyerReference>

  <!-- Accounting Supplier Party (Seller) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="${seller.peppolScheme || '0208'}">${sanitize(seller.peppolEndpoint)}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${seller.peppolScheme || '0208'}">${sanitize(seller.peppolEndpoint)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${sanitize(seller.legalName || seller.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${sanitize(seller.address)}</cbc:StreetName>
        <cbc:CityName>${sanitize(seller.city)}</cbc:CityName>
        <cbc:PostalZone>${sanitize(seller.postalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${seller.countryCode || 'BE'}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${sanitize(seller.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${sanitize(seller.legalName || seller.name)}</cbc:RegistrationName>
        <cbc:CompanyID schemeID="${seller.peppolScheme || '0208'}">${sanitize(seller.peppolEndpoint)}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Name>${sanitize(seller.name)} Billing Dept</cbc:Name>
        <cbc:Telephone>${sanitize(seller.phone)}</cbc:Telephone>
        <cbc:ElectronicMail>${sanitize(seller.email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Accounting Customer Party (Buyer) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="${buyer.peppolScheme || '0208'}">${sanitize(buyer.peppolEndpoint || buyer.vatNumber?.replace(/[^0-9]/g, ''))}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${buyer.peppolScheme || '0208'}">${sanitize(buyer.peppolEndpoint || buyer.vatNumber?.replace(/[^0-9]/g, ''))}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${sanitize(buyer.legalName || buyer.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${sanitize(buyer.address)}</cbc:StreetName>
        <cbc:CityName>${sanitize(buyer.city)}</cbc:CityName>
        <cbc:PostalZone>${sanitize(buyer.postalCode)}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${buyer.countryCode || 'BE'}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${sanitize(buyer.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${sanitize(buyer.legalName || buyer.name)}</cbc:RegistrationName>
        <cbc:CompanyID schemeID="${buyer.peppolScheme || '0208'}">${sanitize(buyer.peppolEndpoint || buyer.vatNumber?.replace(/[^0-9]/g, ''))}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:ElectronicMail>${sanitize(buyer.email)}</cbc:ElectronicMail>
        <cbc:Telephone>${sanitize(buyer.phone)}</cbc:Telephone>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Payment Means (SEPA Credit Transfer with Structured Reference) -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode name="SEPA Credit Transfer">58</cbc:PaymentMeansCode>
    <cbc:PaymentID>${sanitize(invoice.structuredReference || invoice.number)}</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${sanitize(seller.iban.replace(/\s+/g, ''))}</cbc:ID>
      <cbc:Name>${sanitize(seller.legalName || seller.name)}</cbc:Name>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${sanitize(seller.bic)}</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>

  ${invoice.paymentTerms ? `
  <cac:PaymentTerms>
    <cbc:Note>${sanitize(invoice.paymentTerms)}</cbc:Note>
  </cac:PaymentTerms>` : ''}

  <!-- Tax Total & Category Breakdowns -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(invoice.taxTotal)}</cbc:TaxAmount>
    ${taxSubtotals
      .map(
        (sub) => `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(sub.taxableBase)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(sub.taxAmount)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${sub.category || 'S'}</cbc:ID>
        <cbc:Percent>${sub.rate.toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`
      )
      .join('')}
  </cac:TaxTotal>

  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(invoice.subtotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(invoice.subtotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(invoice.total)}</cbc:TaxInclusiveAmount>
    <cbc:PrepaidAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(invoice.amountPaid || 0)}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(Math.max(0, invoice.total - (invoice.amountPaid || 0)))}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Lines -->
  ${invoice.items
    .map((item, idx) => {
      const unitCode = mapUnitCode(item.unit)
      const lineNet = item.quantity * item.unitPrice * (1 - item.discountPercent / 100)
      return `
  <${lineTag}>
    <cbc:ID>${idx + 1}</cbc:ID>
    <${qtyTag} unitCode="${unitCode}">${formatQty(item.quantity)}</${qtyTag}>
    <cbc:LineExtensionAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(lineNet)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${sanitize(item.description)}</cbc:Description>
      <cbc:Name>${sanitize(item.description.slice(0, 100))}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${item.taxCategory || 'S'}</cbc:ID>
        <cbc:Percent>${item.vatRate.toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${invoice.currency || 'EUR'}">${formatAmount(item.unitPrice)}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="${unitCode}">1</cbc:BaseQuantity>
    </cac:Price>
  </${lineTag}>`
    })
    .join('')}
</${rootTag}>`

  return xml.trim()
}

/**
 * Generates Belgian / European structured payment reference: +++XXX/XXXX/XXXXX+++
 */
export function generateStructuredReference(seedNumber: number | string): string {
  const cleanSeed = String(seedNumber).replace(/[^0-9]/g, '').slice(-10).padStart(10, '0')
  const numVal = BigInt(cleanSeed)
  const mod97 = Number(numVal % 97n)
  const check = mod97 === 0 ? 97 : mod97
  const checkStr = String(check).padStart(2, '0')
  const full12 = cleanSeed + checkStr
  return `+++${full12.slice(0, 3)}/${full12.slice(3, 7)}/${full12.slice(7, 12)}+++`
}
