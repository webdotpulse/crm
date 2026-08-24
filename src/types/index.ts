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

export type ClientType = 'company' | 'individual' | 'contact'
export type SupportedCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF'

export interface ExchangeRate {
  currency: SupportedCurrency
  symbol: string
  rateToEur: number
  lastUpdated: string
}

// B2B Company
export interface Company {
  id: string
  clientType?: 'company'
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

// B2C Individual / Private Person
export interface IndividualClient {
  id: string
  clientType: 'individual'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  countryCode: string
  nationalId?: string // National register / personal tax ID
  status: 'lead' | 'prospect' | 'customer' | 'partner' | 'inactive'
  tags: string[]
  notes?: string
  avatar?: string
  createdAt: string
}

// Company Employee / Employer / Contact
export interface Contact {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  department?: string
  isEmployer?: boolean
  canBeBilledDirectly?: boolean
  isPrimary?: boolean
  avatar?: string
  createdAt: string
}

// Multi-Entity / Issuing Legal Companies
export interface LegalEntity {
  id: string
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
  defaultCurrency: string
  invoicePrefix: string // e.g. "BE-INV-" or "NL-INV-"
  isDefault: boolean
  logoUrl?: string
  accentColor?: string
}

// Products & Stock Management
export type ProductCategory = 
  | 'service' 
  | 'hardware' 
  | 'software_license' 
  | 'subscription' 
  | 'physical_product'

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: ProductCategory
  type: 'physical' | 'service' | 'digital'
  buyPrice: number
  sellPrice: number
  vatRate: number
  unit: string // 'pcs', 'hours', 'days', 'licenses', 'months'
  stockQuantity: number
  minStockAlert: number
  imageUrl?: string
  barcode?: string
  isActive: boolean
  createdAt: string
}

// Calendar & Planner
export type CalendarEventType = 
  | 'meeting' 
  | 'call' 
  | 'deadline' 
  | 'site_visit' 
  | 'task_milestone' 
  | 'quote_followup'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  eventType: CalendarEventType
  startDate: string // ISO timestamp or YYYY-MM-DDTHH:mm
  endDate: string
  allDay: boolean
  clientType?: ClientType
  clientId?: string
  clientName?: string
  projectId?: string
  dealId?: string
  assignee: string
  location?: string
  videoMeetingUrl?: string
  color?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
}

// Document Templates (Quotations & Invoices)
export interface DocumentTemplate {
  id: string
  name: string
  type: 'quotation' | 'invoice'
  category: string
  title: string
  description: string
  items: QuoteItem[]
  defaultTerms?: string
  defaultNotes?: string
  defaultVatRate?: number
  createdAt: string
}

// Email Integration & Templates
export type EmailTemplateType = 
  | 'quote_send' 
  | 'invoice_send' 
  | 'payment_reminder' 
  | 'project_milestone' 
  | 'welcome' 
  | 'custom'

export interface EmailTemplate {
  id: string
  name: string
  type: EmailTemplateType
  subject: string
  bodyHtml: string
  variables: string[] // e.g. ['client_name', 'document_number', 'total_amount', 'due_date', 'payment_reference']
}

export interface EmailMessage {
  id: string
  to: string
  recipientName: string
  subject: string
  body: string
  sentAt: string
  status: 'sent' | 'queued'
  relatedType?: 'quote' | 'invoice' | 'deal' | 'project'
  relatedId?: string
}

// Configurable VAT Rates
export interface VatRate {
  id: string
  name: string
  rate: number
  countryCode: string
  taxCategory: 'S' | 'Z' | 'E' | 'AE' | 'AA'
  isDefault?: boolean
  description?: string
}

export type DealStage = 'lead' | 'qualified' | 'meeting' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  title: string
  clientType?: ClientType
  companyId?: string
  individualId?: string
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
  productId?: string
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
  legalEntityId?: string
  dealId?: string
  clientType?: ClientType
  companyId?: string
  individualId?: string
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
  clientType?: ClientType
  companyId?: string
  individualId?: string
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
  productId?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  vatRate: number
  total: number
  taxCategory: 'S' | 'Z' | 'E' | 'AE' | 'AA'
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
  legalEntityId?: string // Issuing company entity
  quoteId?: string
  projectId?: string
  clientType?: ClientType
  companyId?: string
  individualId?: string
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

// ==========================================
// 1. EXPENSES & INBOUND PEPPOL
// ==========================================
export type ExpenseCategory =
  | 'hosting_software'
  | 'subcontractors'
  | 'office_rent'
  | 'hardware'
  | 'telecom'
  | 'travel_meals'
  | 'professional_services'
  | 'marketing'
  | 'other'

export type ExpenseStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface ExpenseItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  total: number
}

export interface Expense {
  id: string
  number: string // e.g. EXP-2026-001 or Supplier invoice number
  supplierName: string
  supplierVat?: string
  supplierIban?: string
  category: ExpenseCategory
  invoiceDate: string
  dueDate: string
  subtotal: number
  vatTotal: number
  total: number
  currency: string
  status: ExpenseStatus
  paymentMethod?: 'bank_transfer' | 'direct_debit' | 'card' | 'cash'
  paymentDate?: string
  isPeppolInbound?: boolean
  peppolXml?: string
  receiptUrl?: string
  notes?: string
  projectId?: string
  legalEntityId?: string
  items?: ExpenseItem[]
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  vatNumber?: string
  peppolEndpoint?: string
  email?: string
  phone?: string
  iban?: string
  bic?: string
  defaultCategory: ExpenseCategory
  address?: string
  city?: string
  country?: string
  notes?: string
  createdAt: string
}

// ==========================================
// 2. BANK RECONCILIATION & SEPA DIRECT DEBIT
// ==========================================
export interface BankTransaction {
  id: string
  statementId?: string
  date: string
  valueDate?: string
  amount: number // positive for incoming credit, negative for debit
  currency: string
  counterpartyName: string
  counterpartyIban: string
  counterpartyBic?: string
  description: string
  structuredReference?: string // e.g. +++090/9337/55493+++
  reconciled: boolean
  matchedInvoiceId?: string
  matchedExpenseId?: string
  reconciledAt?: string
  reconciliationType?: 'auto_ogm' | 'auto_amount' | 'manual'
}

export interface BankStatement {
  id: string
  statementNumber: string
  accountIban: string
  accountName: string
  fileName: string
  importDate: string
  format: 'coda' | 'camt053' | 'csv'
  openingBalance: number
  closingBalance: number
  currency: string
  transactionCount: number
  reconciledCount: number
}

export interface SepaDirectDebitBatch {
  id: string
  batchReference: string
  collectionDate: string
  creditorName: string
  creditorIban: string
  creditorBic: string
  creditorId: string
  invoiceIds: string[]
  totalAmount: number
  transactionCount: number
  generatedXml: string
  createdAt: string
}

// ==========================================
// 3. RECURRING INVOICES & SUBSCRIPTIONS
// ==========================================
export type BillingCadence = 'monthly' | 'quarterly' | 'biannually' | 'annually'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending_renewal'

export interface SubscriptionContract {
  id: string
  contractNumber: string
  title: string
  clientType: ClientType
  companyId?: string
  individualId?: string
  cadence: BillingCadence
  status: SubscriptionStatus
  startDate: string
  nextBillingDate: string
  autoRenew: boolean
  autoSendPeppol: boolean
  autoSendEmail: boolean
  items: QuoteItem[]
  subtotal: number
  vatTotal: number
  total: number
  currency: string
  notes?: string
  legalEntityId?: string
  lastInvoiceId?: string
  createdAt: string
}

// ==========================================
// 4. BELGIAN & EU ACCOUNTANT & VAT DECLARATION
// ==========================================
export interface BelgianVatGridResult {
  grid00: number // Sales at 0% (intra-community / reverse charge)
  grid01: number // Sales at 6%
  grid02: number // Sales at 12%
  grid03: number // Sales at 21%
  grid54: number // Total output VAT payable on sales
  grid81: number // Inbound purchases: raw materials / merchandise
  grid82: number // Inbound purchases: miscellaneous goods & services
  grid83: number // Inbound purchases: investment / capital goods
  grid55: number // Deductible input VAT on expenses
  grid71_netToPay: number // Grid 54 - Grid 55 (if > 0)
  grid72_netToRefund: number // Grid 55 - Grid 54 (if > 0)
  totalSalesExclusive: number
  totalSalesVat: number
  totalPurchasesExclusive: number
  totalPurchasesVat: number
}

export interface BelgianKlantenlistingCustomer {
  vatNumber: string
  cleanVatNumber: string
  companyName: string
  countryCode: string
  totalTurnover: number
  totalVat: number
}

// ==========================================
// 5. CONTRACTS & SLA LIFECYCLE MANAGEMENT
// ==========================================
export type ContractType = 'nda' | 'msa' | 'sla' | 'handover' | 'custom'
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'expired' | 'terminated'

export interface ContractSignatureAudit {
  signerName: string
  signerEmail: string
  signerRole?: string
  signatureDataUrl: string
  ipAddress: string
  timestamp: string
  userAgent: string
  documentChecksumSha256: string
  certificateId: string
}

export interface Contract {
  id: string
  contractNumber: string
  title: string
  type: ContractType
  status: ContractStatus
  clientType: ClientType
  companyId?: string
  individualId?: string
  effectiveDate: string
  expiryDate?: string
  value?: number
  currency?: string
  contentHtml: string
  legalEntityId?: string
  signatures: {
    issuerSignature?: ContractSignatureAudit
    clientSignature?: ContractSignatureAudit
  }
  createdAt: string
  updatedAt: string
}

// ==========================================
// 6. DEVELOPER, WEBHOOKS & REST API
// ==========================================
export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  secretKey: string
  permissions: string[]
  lastUsedAt?: string
  createdAt: string
  expiresAt?: string
  status: 'active' | 'revoked'
}

export interface WebhookEndpoint {
  id: string
  url: string
  description: string
  events: string[]
  secret: string
  status: 'active' | 'paused'
  failureCount: number
  createdAt: string
}

export interface WebhookEventLog {
  id: string
  endpointId?: string
  url: string
  event: string
  payloadJson: string
  statusCode: number
  status: 'success' | 'failed'
  responseTimeMs: number
  timestamp: string
}

// ==========================================
// 7. INTEGRATIONS HUB (8 CORE CONNECTORS)
// ==========================================
export type IntegrationId =
  | 'google_calendar'
  | 'octopus'
  | 'ponto'
  | 'solvari'
  | 'exact_online'
  | 'yuki'
  | 'mollie'
  | 'stripe'

export type IntegrationCategory =
  | 'calendar'
  | 'accounting'
  | 'banking'
  | 'leads'
  | 'payments'

export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error'

export interface IntegrationSettingField {
  key: string
  label: string
  type: 'text' | 'password' | 'select' | 'checkbox'
  options?: { label: string; value: string }[]
  placeholder?: string
  description?: string
  required?: boolean
}

export interface IntegrationLog {
  id: string
  timestamp: string
  type: 'sync' | 'webhook' | 'auth' | 'error'
  status: 'success' | 'warning' | 'error'
  message: string
  details?: any
}

export interface IntegrationConfig {
  id: IntegrationId
  name: string
  tagline: string
  description: string
  category: IntegrationCategory
  enabled: boolean
  status: IntegrationStatus
  icon: string
  badge?: string
  features: string[]
  credentials: Record<string, any>
  settingFields: IntegrationSettingField[]
  lastSyncAt?: string
  syncCount?: number
  logs: IntegrationLog[]
}

// ==========================================
// 8. AUTOMATED BELGIAN DUNNING & DEBT COLLECTION
// ==========================================
export type DunningStage = 'reminder_1' | 'formal_notice' | 'bailiff_notice'
export type DunningStatus = 'pending' | 'sent' | 'paid' | 'disputed' | 'escalated_to_bailiff'

export interface DunningNotice {
  id: string
  invoiceId: string
  stage: DunningStage
  stageNumber: number // 1, 2, 3
  issuedDate: string
  dueDate: string
  daysOverdue: number
  principalAmount: number
  statutoryFee: number // Official €40 statutory recovery fee (Book XIX CEL / EU Directive 2011/7/EU)
  interestAmount: number // Statutory late interest
  totalClaimAmount: number
  paymentLinkUrl: string
  sentVia: 'email' | 'postal' | 'sms'
  status: DunningStatus
  notes?: string
  bailiffDossierId?: string
}

export interface DunningCase {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  originalAmount: number
  amountPaid: number
  balanceDue: number
  dueDate: string
  daysOverdue: number
  currentStage: DunningStage
  totalStatutoryFees: number
  totalInterest: number
  totalClaim: number
  status: DunningStatus
  notices: DunningNotice[]
  lastContactDate?: string
}

// ==========================================
// 9. MOBILE DIGITAL WORK ORDERS (WERKBONNEN)
// ==========================================
export type WorkOrderStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'signed' | 'invoiced'

export interface WorkOrderLaborItem {
  id: string
  technicianName: string
  date: string
  hours: number
  hourlyRate: number
  description: string
}

export interface WorkOrderMaterialItem {
  id: string
  productId?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface WorkOrderPhoto {
  id: string
  url: string
  caption: string
  takenAt: string
  type: 'before' | 'after' | 'site'
}

export interface WorkOrderSignature {
  signedBy: string
  signatureImage: string // Base64 PNG
  signedAt: string
  signerTitle: string
  legalDisclaimer: string
  gpsLocation?: string
}

export interface WorkOrder {
  id: string
  number: string // e.g. WB-2026-001
  title: string
  clientType: ClientType
  companyId?: string
  individualId?: string
  contactId?: string
  address: string
  city: string
  postalCode: string
  scheduledDate: string
  scheduledTime?: string
  completedDate?: string
  technicianName: string
  technicianPhone?: string
  status: WorkOrderStatus
  description: string
  laborItems: WorkOrderLaborItem[]
  materialItems: WorkOrderMaterialItem[]
  travelKilometers: number
  travelRatePerKm: number
  photos: WorkOrderPhoto[]
  signature?: WorkOrderSignature
  invoiceId?: string
  internalNotes?: string
  createdAt: string
  updatedAt?: string
}

// ==========================================
// 10. BELGIAN KBO / BCE LIVE COMPANY SEARCH
// ==========================================
export interface KboActivity {
  code: string
  description: string
}

export interface KboCompanyResult {
  enterpriseNumber: string // e.g. 0849.294.901
  vatNumber: string // e.g. BE0849294901
  legalName: string
  commercialName?: string
  legalForm: string // BV, NV, VOF, CommV, Eenmanszaak
  legalStatus: 'active' | 'bankrupt' | 'ceased' | 'liquidated'
  address: {
    street: string
    number: string
    box?: string
    postalCode: string
    city: string
    country: string
  }
  establishmentUnitsCount: number
  naceCodes: KboActivity[]
  registrationDate: string
  source: string
}

// ==========================================
// 11. AI FINANCIAL CO-PILOT & CASH FLOW FORECASTING
// ==========================================
export interface CashFlowDailyPoint {
  date: string
  confirmedCash: number
  projectedIncome: number
  projectedExpenses: number
  netCashBalance: number
  vatReserveObligation: number
}

export interface AiFinancialInsight {
  id: string
  type: 'warning' | 'opportunity' | 'tax' | 'anomaly'
  title: string
  description: string
  impactEur: number
  actionLabel?: string
  metricName?: string
}

export interface FinancialHealthMetrics {
  currentCashEur: number
  projectedCash90DaysEur: number
  dsoDays: number // Days Sales Outstanding
  liquidityRatio: number // Current Ratio
  estimatedVatReserveEur: number
  estimatedCorporateTaxEur: number
  insights: AiFinancialInsight[]
}

// ==========================================
// 12. MULTI-LANGUAGE (NL / FR / EN / DE)
// ==========================================
export type LanguageCode = 'nl' | 'fr' | 'en' | 'de'

export interface TranslationDictionary {
  [key: string]: Record<LanguageCode, string>
}

// ==========================================
// 13. VEHICLE MILEAGE & TRAVEL EXPENSES (KILOMETERS)
// ==========================================
export type VehicleType = 'private_car' | 'company_car' | 'bicycle' | 'ev_car' | 'motorcycle'

export interface MileageTrip {
  id: string
  date: string
  driverName: string
  purpose: string
  originAddress: string
  destinationAddress: string
  distanceKm: number
  isRoundTrip: boolean
  vehicleType: VehicleType
  ratePerKm: number // €0.4415 for car, €0.35 for bicycle
  totalAllowanceEur: number
  companyId?: string
  projectId?: string
  reimbursed: boolean
  createdAt: string
}

// ==========================================
// 14. SUPPLIER PURCHASE ORDERS & 3-WAY MATCH (BESTELBONNEN)
// ==========================================
export type PurchaseOrderStatus =
  | 'draft'
  | 'issued'
  | 'partially_received'
  | 'received'
  | 'matched'
  | 'cancelled'

export interface PurchaseOrderItem {
  id: string
  productId?: string
  description: string
  quantityOrdered: number
  quantityReceived: number
  unit: string
  unitPrice: number
  vatRate: number
  lineTotal: number
}

export interface PurchaseOrder {
  id: string
  number: string // e.g. PO-2026-001
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDeliveryDate: string
  status: PurchaseOrderStatus
  items: PurchaseOrderItem[]
  subtotal: number
  vatTotal: number
  total: number
  matchedExpenseId?: string
  deliveryNotes?: string
  createdAt: string
}

export interface ThreeWayMatchResult {
  isMatched: boolean
  poNumber: string
  invoiceNumber: string
  deliveryStatus: string
  discrepancyEur: number
  discrepancies: string[]
  approvedForPayment: boolean
}

// CRM Theme & Custom Styling Engine
export type ThemePresetId =
  | 'standard-white'
  | 'elemis-blue'
  | 'emerald-growth'
  | 'royal-violet'
  | 'ocean-teal'
  | 'sunset-amber'
  | 'crimson-rose'
  | 'midnight-obsidian'
  | 'minimal-slate'

export type FontFamilyOption =
  | 'Urbanist'
  | 'Inter'
  | 'Plus Jakarta Sans'
  | 'Outfit'
  | 'Manrope'
  | 'Space Grotesk'

export type BorderRadiusOption = 'sharp' | 'subtle' | 'modern' | 'rounded' | 'pill'
export type DensityOption = 'compact' | 'comfortable' | 'spacious'
export type SidebarStyleOption = 'white' | 'dark' | 'glass' | 'brand'

export interface CustomThemeConfig {
  preset: ThemePresetId
  primaryColor: string
  primaryHoverColor?: string
  primarySoftColor?: string
  secondaryColor?: string
  sidebarBgMode: 'white' | 'dark' | 'glass' | 'brand' | 'custom'
  sidebarBgCustom?: string
  navbarBgMode: 'white' | 'dark' | 'glass' | 'custom'
  navbarBgCustom?: string
  cardBgCustom?: string
  pageBgCustom?: string
  borderRadius: BorderRadiusOption
  fontFamily: FontFamilyOption
  density: DensityOption
  customCss?: string
  customBrandName?: string
  customLogoUrl?: string
}



