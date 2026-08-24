import { Company, Invoice, CompanyProfile, PeppolTransmissionLog } from '../types'
import { generatePeppolUblXml } from './peppolGenerator'
import { validatePeppolInvoice } from './peppolValidator'

export interface PeppolParticipantInfo {
  scheme: string
  identifier: string
  name: string
  country: string
  registered: boolean
  supportedProfiles: string[]
  accessPointProvider: string
  registrationDate: string
}

// Known participant directory cache for realistic simulation
const SAMPLE_PEPPOL_DIRECTORY: Record<string, PeppolParticipantInfo> = {
  '0208:0842123456': {
    scheme: '0208',
    identifier: '0842.123.456',
    name: 'TechFlow Logistics NV',
    country: 'BE',
    registered: true,
    supportedProfiles: [
      'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
      'urn:oasis:names:specification:ubl:schema:xsd:Order-2',
    ],
    accessPointProvider: 'Billit AS4 Access Point',
    registrationDate: '2022-03-15',
  },
  '0208:0719876543': {
    scheme: '0208',
    identifier: '0719.876.543',
    name: 'Vanguard Retail Europe BV',
    country: 'BE',
    registered: true,
    supportedProfiles: [
      'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    ],
    accessPointProvider: 'UnifiedPost Gateway',
    registrationDate: '2023-01-10',
  },
  '0106:12345678': {
    scheme: '0106',
    identifier: '12345678',
    name: 'NorthStar Digital BV',
    country: 'NL',
    registered: true,
    supportedProfiles: [
      'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    ],
    accessPointProvider: 'Storecove Access Point',
    registrationDate: '2021-08-20',
  },
  '9930:DE312987654': {
    scheme: '9930',
    identifier: 'DE312987654',
    name: 'Aethelgard Consulting GmbH',
    country: 'DE',
    registered: true,
    supportedProfiles: [
      'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
    ],
    accessPointProvider: 'Pagero Peppol Gateway',
    registrationDate: '2020-11-04',
  },
}

/**
 * Look up whether a company is registered in the Peppol Directory (SMP / SML)
 */
export async function lookupPeppolParticipant(
  scheme: string,
  identifier: string
): Promise<PeppolParticipantInfo> {
  const cleanId = identifier.replace(/[^0-9a-zA-Z]/g, '')
  const key = `${scheme}:${cleanId}`

  // Check known cache
  if (SAMPLE_PEPPOL_DIRECTORY[key]) {
    return SAMPLE_PEPPOL_DIRECTORY[key]
  }

  for (const k in SAMPLE_PEPPOL_DIRECTORY) {
    if (k.replace(/[^0-9a-zA-Z]/g, '').includes(cleanId)) {
      return SAMPLE_PEPPOL_DIRECTORY[k]
    }
  }

  // If not found in static list, simulate SMP lookup dynamically
  await new Promise((res) => setTimeout(res, 400))

  const isSimulatedValid = cleanId.length >= 8
  return {
    scheme: scheme || '0208',
    identifier: identifier,
    name: `Registered Entity (${identifier})`,
    country: scheme === '0208' ? 'BE' : scheme === '0106' ? 'NL' : scheme === '9930' ? 'DE' : 'EU',
    registered: isSimulatedValid,
    supportedProfiles: isSimulatedValid
      ? [
          'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
          'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
        ]
      : [],
    accessPointProvider: isSimulatedValid ? 'Certified Peppol AS4 Service Provider' : 'Not Registered',
    registrationDate: isSimulatedValid ? '2024-01-15' : '',
  }
}

/**
 * Simulates dispatching an invoice through the Peppol AS4 Access Point network
 */
export async function dispatchPeppolInvoice(
  invoice: Invoice,
  seller: CompanyProfile,
  buyer: Company
): Promise<{ success: boolean; log: PeppolTransmissionLog; error?: string }> {
  // 1. Run validation
  const validation = validatePeppolInvoice(invoice, seller, buyer)
  if (!validation.isValid) {
    const errorMsg = validation.rules
      .filter((r) => !r.passed && r.severity === 'error')
      .map((r) => r.message)
      .join(', ')
    return {
      success: false,
      error: `Peppol EN 16931 Validation Failed: ${errorMsg}`,
      log: {
        id: `tx-${Date.now()}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        timestamp: new Date().toISOString(),
        status: 'failed',
        recipientEndpoint: buyer.peppolEndpoint || buyer.vatNumber,
        recipientScheme: String(buyer.peppolScheme || '0208'),
        documentType: 'Peppol BIS Billing 3.0 UBL Invoice',
        accessPointReceiptId: '',
        responseMessage: `Validation failed: ${errorMsg}`,
        rawXml: generatePeppolUblXml(invoice, seller, buyer),
      },
    }
  }

  // 2. Generate XML
  const rawXml = generatePeppolUblXml(invoice, seller, buyer)

  // 3. Simulate AS4 Transmission
  await new Promise((res) => setTimeout(res, 600))

  const receiptUUID = `urn:uuid:${crypto.randomUUID ? crypto.randomUUID() : 'c8e1f579-42b3-4f91-886f-' + Math.random().toString(16).slice(2, 10)}`
  const recipientEndpoint = `${buyer.peppolScheme || '0208'}:${buyer.peppolEndpoint || buyer.vatNumber.replace(/[^0-9]/g, '')}`

  const log: PeppolTransmissionLog = {
    id: `tx-${Date.now()}`,
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    timestamp: new Date().toISOString(),
    status: 'success',
    recipientEndpoint,
    recipientScheme: String(buyer.peppolScheme || '0208'),
    documentType: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
    accessPointReceiptId: receiptUUID,
    responseMessage: `AS4 Message Accepted & Delivered via ${seller.peppolAccessPointName || 'Peppol Gateway'}. MDN Receipt Signed.`,
    rawXml,
  }

  return { success: true, log }
}
