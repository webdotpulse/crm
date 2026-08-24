export type PeppolScheme = 
  | '0208' // Belgium KBO/BCE
  | '0106' // Netherlands KvK
  | '0190' // Netherlands OIN
  | '9930' // Germany VAT
  | '9944' // Austria VAT
  | '0088' // EAN Location Code / GLN
  | '0007' // Sweden Org Number
  | '0192' // Norway Org Number
  | '9920' // Spain VAT
  | '9956' // Belgium VAT (General)
  | '9925' // Italy VAT

export interface Company {
  id: string
  name: string
  legalName?: string
  vatNumber: string
  peppolScheme: PeppolScheme | string
  peppolEndpoint: string
  peppolRegistered?: boolean
  email: string
  phone: string
  website?: string
  address: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  status: 'lead' | 'prospect' | 'customer' | 'partner' | 'inactive'
  tags: string[]
  notes?: string
  createdAt: string
}

export interface Contact {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  isPrimary?: boolean
  avatar?: string
  createdAt: string
}

export type DealStage = 'lead' | 'qualified' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  title: string
  companyId: string
  contactId?: string
  value: number
  currency: string
  stage: DealStage
  probability: number // percentage (e.g. 75)
  expectedCloseDate: string
  notes?: string
  createdAt: string
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  vatRate: number // 0, 6, 12, 21
  total: number
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface Quotation {
  id: string
  number: string
  dealId?: string
  companyId: string
  contactId?: string
  title: string
  issueDate: string
  validUntilDate: string
  items: QuoteItem[]
  subtotal: number
  taxTotal: number
  total: number
  currency: string
  status: QuoteStatus
  terms?: string
  clientSignedAt?: string
  clientSignedBy?: string
  clientNotes?: string
  convertedToProjectId?: string
  convertedToInvoiceId?: string
  createdAt: string
}

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold'

export interface Project {
  id: string
  title: string
  quoteId?: string
  companyId: string
  status: ProjectStatus
  startDate: string
  endDate: string
  budgetHours: number
  budgetAmount: number
  hourlyRate: number
  progressPercent: number
  description?: string
  color?: string
  createdAt: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  assignee: string
  priority: TaskPriority
  status: TaskStatus
  estimatedHours: number
  loggedHours: number
  dueDate: string
  startDate?: string
  createdAt: string
}

export interface TimeEntry {
  id: string
  projectId: string
  taskId?: string
  memberName: string
  date: string
  hours: number
  description: string
  isBillable: boolean
  hourlyRate: number
  invoiceId?: string
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  vatRate: number
  total: number
  taxCategory: 'S' | 'Z' | 'E' | 'AE' // Standard, Zero, Exempt, Reverse Charge
}

export interface TaxBreakdownItem {
  rate: number
  taxCategory: string
  taxableAmount: number
  taxAmount: number
}

export type InvoiceStatus = 'draft' | 'issued' | 'peppol_sent' | 'paid' | 'partial' | 'overdue'
export type PeppolStatus = 'not_sent' | 'valid' | 'invalid' | 'transmitted' | 'delivered' | 'failed'

export interface Invoice {
  id: string
  number: string
  quoteId?: string
  projectId?: string
  companyId: string
  contactId?: string
  issueDate: string
  dueDate: string
  reference?: string
  structuredReference: string // e.g. +++090/9337/55493+++
  items: InvoiceItem[]
  subtotal: number
  taxBreakdown: TaxBreakdownItem[]
  taxTotal: number
  total: number
  amountPaid: number
  currency: string
  status: InvoiceStatus
  peppolStatus: PeppolStatus
  peppolMessageId?: string
  peppolDeliveredAt?: string
  notes?: string
  paymentTerms?: string
  createdAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  method: 'sepa' | 'bank_transfer' | 'card' | 'peppol_payment' | 'other'
  reference?: string
  note?: string
  createdAt: string
}

export interface PeppolValidationRuleResult {
  ruleId: string
  category: 'schema' | 'business_rule' | 'schematron'
  severity: 'error' | 'warning' | 'info'
  message: string
  field?: string
  passed: boolean
}

export interface PeppolValidationReport {
  isValid: boolean
  invoiceNumber: string
  customizationId: string
  profileId: string
  timestamp: string
  rules: PeppolValidationRuleResult[]
  errorCount: number
  warningCount: number
}

export interface PeppolTransmissionLog {
  id: string
  invoiceId: string
  invoiceNumber: string
  timestamp: string
  status: 'success' | 'failed'
  recipientEndpoint: string
  recipientScheme: string
  documentType: string
  accessPointReceiptId: string
  responseMessage: string
  rawXml: string
}

export interface CompanyProfile {
  name: string
  legalName: string
  vatNumber: string
  peppolScheme: string
  peppolEndpoint: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  iban: string
  bic: string
  defaultVatRate: number
  defaultCurrency: string
  peppolAccessPointName: string
  peppolAccessPointUrl: string
  peppolApiKey: string
  peppolSenderId: string
}
