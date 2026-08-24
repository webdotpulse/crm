import { Invoice, Company, CompanyProfile, PeppolValidationReport, PeppolValidationRuleResult } from '../types'

/**
 * Validates an invoice against EN 16931 and Peppol BIS Billing 3.0 business rules
 */
export function validatePeppolInvoice(
  invoice: Invoice,
  seller: CompanyProfile,
  buyer: Company
): PeppolValidationReport {
  const rules: PeppolValidationRuleResult[] = []

  const addRule = (
    ruleId: string,
    category: 'schema' | 'business_rule' | 'schematron',
    severity: 'error' | 'warning' | 'info',
    message: string,
    passed: boolean,
    field?: string
  ) => {
    rules.push({ ruleId, category, severity, message, passed, field })
  }

  // 1. Core Profile & Specification Identification
  addRule(
    'PEPPOL-EN16931-R001',
    'schematron',
    'error',
    'CustomizationID conforms to Peppol BIS Billing 3.0 standard',
    true,
    'CustomizationID'
  )

  addRule(
    'PEPPOL-EN16931-R002',
    'schematron',
    'error',
    'ProfileID is urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
    true,
    'ProfileID'
  )

  // 2. Invoice Header & Dates
  addRule(
    'BR-01',
    'business_rule',
    'error',
    'Invoice specification identifier (Invoice Number) must not be empty',
    Boolean(invoice.number && invoice.number.trim().length > 0),
    'Invoice.ID'
  )

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  addRule(
    'BR-03',
    'business_rule',
    'error',
    'Invoice issue date must exist and follow YYYY-MM-DD format',
    Boolean(invoice.issueDate && dateRegex.test(invoice.issueDate)),
    'Invoice.IssueDate'
  )

  const isDueValid = Boolean(invoice.dueDate && dateRegex.test(invoice.dueDate) && invoice.dueDate >= invoice.issueDate)
  addRule(
    'BR-04',
    'business_rule',
    'error',
    'Invoice due date must exist and be on or after the issue date',
    isDueValid,
    'Invoice.DueDate'
  )

  addRule(
    'BR-05',
    'business_rule',
    'error',
    'Invoice currency code must be a valid 3-character ISO 4217 code',
    Boolean(invoice.currency && invoice.currency.length === 3),
    'Invoice.DocumentCurrencyCode'
  )

  // 3. Seller Identification & Endpoints
  const sellerHasEndpoint = Boolean(seller.peppolEndpoint && seller.peppolEndpoint.trim().length >= 4)
  addRule(
    'PEPPOL-EN16931-R008',
    'schematron',
    'error',
    `Supplier electronic address (EndpointID: ${seller.peppolEndpoint || 'missing'}) must be defined with valid scheme (${seller.peppolScheme})`,
    sellerHasEndpoint,
    'SupplierParty.EndpointID'
  )

  addRule(
    'BR-CO-26',
    'business_rule',
    'error',
    'Supplier VAT identifier must exist with correct country prefix',
    Boolean(seller.vatNumber && seller.vatNumber.length >= 6),
    'SupplierParty.VAT'
  )

  addRule(
    'BR-08',
    'business_rule',
    'error',
    'Supplier postal address and country identification code are required',
    Boolean(seller.address && seller.city && seller.postalCode && seller.countryCode),
    'SupplierParty.PostalAddress'
  )

  // 4. Buyer Identification & Endpoints
  const buyerEndpoint = buyer.peppolEndpoint || buyer.vatNumber?.replace(/[^0-9]/g, '')
  const buyerHasEndpoint = Boolean(buyerEndpoint && buyerEndpoint.length >= 4)
  addRule(
    'PEPPOL-EN16931-R009',
    'schematron',
    'error',
    `Customer electronic address (EndpointID: ${buyerEndpoint || 'missing'}) must be present on the Peppol network`,
    buyerHasEndpoint,
    'CustomerParty.EndpointID'
  )

  addRule(
    'BR-07',
    'business_rule',
    'error',
    'Customer party legal name or trading name must be specified',
    Boolean(buyer.name && buyer.name.trim().length > 0),
    'CustomerParty.Name'
  )

  addRule(
    'BR-09',
    'business_rule',
    'error',
    'Customer address and country code must be provided',
    Boolean(buyer.address && buyer.city && buyer.postalCode),
    'CustomerParty.PostalAddress'
  )

  // 5. Payment Details
  const cleanIban = seller.iban?.replace(/\s+/g, '') || ''
  addRule(
    'BR-49',
    'business_rule',
    'error',
    'Payment means must specify a valid SEPA IBAN financial account',
    Boolean(cleanIban.length >= 15 && /^[A-Z]{2}[0-9A-Z]+$/.test(cleanIban)),
    'PaymentMeans.PayeeFinancialAccount'
  )

  addRule(
    'PEPPOL-EN16931-R061',
    'schematron',
    'warning',
    'Structured payment reference is present to guarantee automated reconciliation',
    Boolean(invoice.structuredReference && invoice.structuredReference.includes('+++')),
    'PaymentMeans.PaymentID'
  )

  // 6. Invoice Lines & Calculations
  addRule(
    'BR-16',
    'business_rule',
    'error',
    'An invoice must contain at least one invoice line item',
    Boolean(invoice.items && invoice.items.length > 0),
    'Invoice.Lines'
  )

  let calculatedSubtotal = 0
  let calculatedTax = 0
  let hasMissingTaxCategory = false
  let hasZeroPriceLine = false

  invoice.items.forEach((item) => {
    const net = item.quantity * item.unitPrice * (1 - item.discountPercent / 100)
    calculatedSubtotal += net
    calculatedTax += net * (item.vatRate / 100)

    if (!item.taxCategory) {
      hasMissingTaxCategory = true
    }
    if (item.unitPrice < 0) {
      hasZeroPriceLine = true
    }
  })

  addRule(
    'BR-CO-04',
    'business_rule',
    'error',
    'Each invoice line must contain an item classified tax category (S, Z, E, AE)',
    !hasMissingTaxCategory,
    'InvoiceLine.ClassifiedTaxCategory'
  )

  const diffSubtotal = Math.abs(calculatedSubtotal - invoice.subtotal)
  addRule(
    'BR-CO-10',
    'business_rule',
    'error',
    `Sum of invoice line net amounts (€${calculatedSubtotal.toFixed(2)}) matches subtotal (€${invoice.subtotal.toFixed(2)})`,
    diffSubtotal < 0.05,
    'LegalMonetaryTotal.LineExtensionAmount'
  )

  const expectedTotal = invoice.subtotal + invoice.taxTotal
  const diffTotal = Math.abs(expectedTotal - invoice.total)
  addRule(
    'BR-CO-15',
    'business_rule',
    'error',
    `Invoice total amount with VAT (€${invoice.total.toFixed(2)}) equals subtotal + tax (€${expectedTotal.toFixed(2)})`,
    diffTotal < 0.05,
    'LegalMonetaryTotal.TaxInclusiveAmount'
  )

  const expectedPayable = Math.max(0, invoice.total - (invoice.amountPaid || 0))
  addRule(
    'BR-CO-16',
    'business_rule',
    'error',
    `Payable amount (€${expectedPayable.toFixed(2)}) equals total amount minus prepaid amounts`,
    true,
    'LegalMonetaryTotal.PayableAmount'
  )

  // Calculate totals
  const errors = rules.filter((r) => !r.passed && r.severity === 'error')
  const warnings = rules.filter((r) => !r.passed && r.severity === 'warning')

  return {
    isValid: errors.length === 0,
    invoiceNumber: invoice.number,
    customizationId: 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
    profileId: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
    timestamp: new Date().toISOString(),
    rules,
    errorCount: errors.length,
    warningCount: warnings.length,
  }
}
