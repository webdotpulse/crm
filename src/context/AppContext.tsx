import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  Company,
  IndividualClient,
  Contact,
  Deal,
  DealStage,
  Quotation,
  Project,
  ProjectStatus,
  Task,
  TaskStatus,
  TimeEntry,
  Invoice,
  Payment,
  CompanyProfile,
  LegalEntity,
  Product,
  CalendarEvent,
  DocumentTemplate,
  EmailTemplate,
  EmailMessage,
  VatRate,
  PeppolTransmissionLog,
  ClientType,
  Expense,
  Supplier,
  BankStatement,
  BankTransaction,
  SepaDirectDebitBatch,
  SubscriptionContract,
  Contract,
  ApiKey,
  WebhookEndpoint,
  WebhookEventLog,
  SupportedCurrency,
  ExchangeRate,
  IntegrationConfig,
  IntegrationId,
  IntegrationLog,
  WorkOrder,
  WorkOrderSignature,
  MileageTrip,
  PurchaseOrder,
  DunningNotice,
  DunningStage,
  LanguageCode,
  CustomThemeConfig,
  ThemePresetId,
  UserRole,
  UserPermission,
  UserAccount,
  SecurityPolicy,
  ActiveSession,
  SecurityAuditLog,
  SecurityCategory,
  SecuritySeverity,
  TwoFactorSetupData,
} from '../types'
import {
  initialCompanyProfile,
  initialLegalEntities,
  initialCompanies,
  initialIndividuals,
  initialContacts,
  initialProducts,
  initialEvents,
  initialDocumentTemplates,
  initialEmailTemplates,
  initialVatRates,
  initialDeals,
  initialQuotations,
  initialProjects,
  initialTasks,
  initialTimeEntries,
  initialInvoices,
  initialPayments,
  initialExpenses,
  initialSuppliers,
  initialBankStatements,
  initialBankTransactions,
  initialSubscriptions,
  initialContracts,
  initialApiKeys,
  initialWebhookEndpoints,
  initialWebhookLogs,
  initialIntegrations,
  initialWorkOrders,
  initialMileageTrips,
  initialPurchaseOrders,
  initialUsers,
  initialSecurityPolicy,
  initialActiveSessions,
  initialSecurityAuditLogs,
} from '../data/initialData'
import { dispatchPeppolInvoice } from '../services/peppolDispatcher'
import { parseCodaFile, parseCamt053File, parseCsvBankFile } from '../services/codaParser'
import { generateSepaDirectDebitXml, SepaCollectionItem } from '../services/sepaDebitGenerator'
import { parseInboundPeppolXml } from '../services/inboundPeppolParser'
import { defaultExchangeRates } from '../services/currencyService'
import { executeIntegrationSync, SyncResult } from '../services/integrationsService'
import { calculateDunningEscalation, BELGIAN_STATUTORY_RECOVERY_FEE, STATUTORY_LATE_INTEREST_RATE } from '../services/dunningService'
import { translate } from '../services/i18nService'
import { defaultThemeConfig, themePresets, applyThemeConfig } from '../services/themeService'
import { createTwoFactorSetup, verifyTotpCode, calculateTotpCode, syncComputeLogHash } from '../services/securityService'

export type AppView =
  | 'dashboard'
  | 'crm'
  | 'calendar'
  | 'deals'
  | 'quotes'
  | 'contracts'
  | 'subscriptions'
  | 'workorders'
  | 'projects'
  | 'products'
  | 'invoices'
  | 'dunning'
  | 'expenses'
  | 'procurement'
  | 'mileage'
  | 'banking'
  | 'cashflow'
  | 'accountant'
  | 'peppol'
  | 'portal'
  | 'developers'
  | 'integrations'
  | 'settings'
  | 'security'

interface AppContextType {
  // Navigation & Theme & Language
  currentView: AppView
  setCurrentView: (view: AppView) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string

  // Theme & Custom Styling Engine
  customTheme: CustomThemeConfig
  updateCustomTheme: (config: Partial<CustomThemeConfig>) => void
  setThemePreset: (presetId: ThemePresetId) => void
  resetCustomTheme: () => void
  isThemeCustomizerOpen: boolean
  setIsThemeCustomizerOpen: (open: boolean) => void
  isSpotlightOpen: boolean
  setIsSpotlightOpen: (open: boolean) => void

  // Multi-Entity
  legalEntities: LegalEntity[]
  activeLegalEntityId: string
  activeLegalEntity: LegalEntity
  setActiveLegalEntityId: (id: string) => void
  addLegalEntity: (entity: LegalEntity) => void
  updateLegalEntity: (entity: LegalEntity) => void
  deleteLegalEntity: (id: string) => void

  // Company Profile & Settings
  companyProfile: CompanyProfile
  updateCompanyProfile: (profile: CompanyProfile) => void

  // CRM: Companies (B2B)
  companies: Company[]
  addCompany: (company: any) => void
  updateCompany: (company: Company) => void
  deleteCompany: (id: string) => void

  // CRM: Individuals (B2C)
  individuals: IndividualClient[]
  addIndividual: (individual: any) => void
  updateIndividual: (individual: IndividualClient) => void
  deleteIndividual: (id: string) => void

  // CRM: Contacts & Employers
  contacts: Contact[]
  addContact: (contact: any) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void

  // Deals
  deals: Deal[]
  addDeal: (deal: any) => void
  updateDeal: (deal: Deal) => void
  deleteDeal: (id: string) => void
  moveDealStage: (dealId: string, stage: DealStage) => void

  // Quotations
  quotations: Quotation[]
  addQuotation: (quotation: Quotation) => void
  updateQuotation: (quotation: Quotation) => void
  deleteQuotation: (id: string) => void
  signQuotation: (quoteId: string, signerName: string, signerNotes?: string) => void
  convertQuoteToProject: (quoteId: string) => Project | null
  convertQuoteToInvoice: (quoteId: string) => Invoice | null

  // Projects & Tasks
  projects: Project[]
  addProject: (project: any) => void
  updateProject: (project: Project) => void
  deleteProject: (id: string) => void
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void

  tasks: Task[]
  addTask: (task: any) => void
  updateTask: (task: Task) => void
  deleteTask: (id: string) => void
  moveTaskStatus: (taskId: string, status: TaskStatus) => void

  // Timesheets & Stopwatch
  timeEntries: TimeEntry[]
  addTimeEntry: (entry: any) => void
  updateTimeEntry: (entry: TimeEntry) => void
  deleteTimeEntry: (id: string) => void
  activeTimer: {
    isRunning: boolean
    projectId: string
    taskId?: string
    description: string
    startTime: number | null
    elapsedSeconds: number
  }
  startTimer: (projectId: string, taskId?: string, description?: string) => void
  stopTimer: () => void

  // Invoices & Payments
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (invoice: Invoice) => void
  deleteInvoice: (id: string) => void
  payments: Payment[]
  recordPayment: (payment: any) => void
  invoiceProjectTimeEntries: (projectId: string) => Invoice | null

  // Peppol Transmission Logs
  peppolLogs: PeppolTransmissionLog[]
  sendInvoiceViaPeppol: (invoiceId: string) => Promise<{ success: boolean; error?: string }>

  // Products & Stock Management
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  adjustProductStock: (productId: string, quantityDelta: number) => void

  // Calendar & Planner
  events: CalendarEvent[]
  addCalendarEvent: (event: CalendarEvent) => void
  updateCalendarEvent: (event: CalendarEvent) => void
  deleteCalendarEvent: (id: string) => void

  // Document & Email Templates
  documentTemplates: DocumentTemplate[]
  addDocumentTemplate: (template: DocumentTemplate) => void
  updateDocumentTemplate: (template: DocumentTemplate) => void
  deleteDocumentTemplate: (id: string) => void

  emailTemplates: EmailTemplate[]
  addEmailTemplate: (template: EmailTemplate) => void
  updateEmailTemplate: (template: EmailTemplate) => void
  deleteEmailTemplate: (id: string) => void

  emailMessages: EmailMessage[]
  sendEmail: (message: Omit<EmailMessage, 'id' | 'sentAt' | 'status'>) => void

  // VAT Rates
  vatRates: VatRate[]
  addVatRate: (vatRate: VatRate) => void
  updateVatRate: (vatRate: VatRate) => void
  deleteVatRate: (id: string) => void

  // Multi-Currency
  selectedCurrency: SupportedCurrency
  setSelectedCurrency: (c: SupportedCurrency) => void
  exchangeRates: Record<SupportedCurrency, ExchangeRate>
  updateExchangeRate: (currency: SupportedCurrency, rate: number) => void

  // Expenses & Inbound Peppol
  expenses: Expense[]
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  suppliers: Supplier[]
  addSupplier: (supplier: Supplier) => void
  updateSupplier: (supplier: Supplier) => void
  deleteSupplier: (id: string) => void
  importInboundPeppolXml: (xmlContent: string, fileName?: string) => Expense

  // Bank Reconciliation & SEPA Direct Debit
  bankStatements: BankStatement[]
  bankTransactions: BankTransaction[]
  importBankStatement: (fileContent: string, format: 'coda' | 'camt053' | 'csv', fileName: string) => BankStatement
  reconcileTransactionWithInvoice: (transactionId: string, invoiceId: string) => void
  reconcileTransactionWithExpense: (transactionId: string, expenseId: string) => void
  autoReconcileAllTransactions: () => { matchedCount: number; matchedInvoices: string[] }
  sepaBatches: SepaDirectDebitBatch[]
  generateSepaBatch: (invoiceIds: string[], collectionDate: string) => SepaDirectDebitBatch

  // Subscriptions & Retainers (MRR)
  subscriptions: SubscriptionContract[]
  addSubscription: (sub: SubscriptionContract) => void
  updateSubscription: (sub: SubscriptionContract) => void
  deleteSubscription: (id: string) => void
  generateInvoicesForDueSubscriptions: () => Invoice[]

  // Contracts & SLAs
  contracts: Contract[]
  addContract: (contract: Contract) => void
  updateContract: (contract: Contract) => void
  deleteContract: (id: string) => void
  signContract: (contractId: string, signerType: 'issuer' | 'client', signerInfo: { name: string; email: string; role?: string; signatureDataUrl: string }) => void

  // Developers, API Keys & Webhooks
  apiKeys: ApiKey[]
  addApiKey: (apiKey: ApiKey) => void
  deleteApiKey: (id: string) => void
  webhookEndpoints: WebhookEndpoint[]
  addWebhookEndpoint: (endpoint: WebhookEndpoint) => void
  updateWebhookEndpoint: (endpoint: WebhookEndpoint) => void
  deleteWebhookEndpoint: (id: string) => void
  webhookLogs: WebhookEventLog[]
  dispatchWebhookEvent: (event: string, payload: any) => Promise<WebhookEventLog[]>

  // Work Orders (Werkbonnen)
  workOrders: WorkOrder[]
  addWorkOrder: (wo: WorkOrder) => void
  updateWorkOrder: (wo: WorkOrder) => void
  deleteWorkOrder: (id: string) => void
  signWorkOrder: (id: string, signature: WorkOrderSignature) => void
  convertWorkOrderToInvoice: (id: string) => string

  // Dunning & Debt Collection (Aanmaningen)
  dunningNotices: DunningNotice[]
  sendDunningNotice: (invoiceId: string, stage: DunningStage) => DunningNotice

  // Vehicle Mileage & Travel Log
  mileageTrips: MileageTrip[]
  addMileageTrip: (trip: MileageTrip) => void
  deleteMileageTrip: (id: string) => void

  // Supplier Purchase Orders & Procurement (Bestelbonnen)
  purchaseOrders: PurchaseOrder[]
  addPurchaseOrder: (po: PurchaseOrder) => void
  updatePurchaseOrder: (po: PurchaseOrder) => void
  deletePurchaseOrder: (id: string) => void
  receivePurchaseOrderItems: (id: string, itemReceipts: { itemId: string; quantityReceived: number }[]) => void

  // Integrations Hub (8 Connectors)
  integrations: IntegrationConfig[]
  toggleIntegration: (id: IntegrationId, enabled?: boolean) => void
  updateIntegrationCredentials: (id: IntegrationId, credentials: Record<string, any>) => void
  syncIntegration: (id: IntegrationId) => Promise<SyncResult>
  simulateIntegrationEvent: (id: IntegrationId) => Promise<{ success: boolean; message: string }>

  // Enterprise Security, RBAC & 2FA
  users: UserAccount[]
  currentUser: UserAccount
  switchUser: (userId: string) => void
  addUser: (user: UserAccount) => void
  updateUser: (user: UserAccount) => void
  deleteUser: (userId: string) => void
  securityPolicy: SecurityPolicy
  updateSecurityPolicy: (policy: Partial<SecurityPolicy>) => void
  activeSessions: ActiveSession[]
  terminateSession: (sessionId: string) => void
  terminateAllOtherSessions: () => void
  securityAuditLogs: SecurityAuditLog[]
  addSecurityAuditLog: (entry: {
    action: string
    category: SecurityCategory
    severity?: SecuritySeverity
    details: string
    ipAddress?: string
    actorId?: string
    actorName?: string
    actorEmail?: string
  }) => void
  exportSecurityAuditLogs: (format: 'json' | 'csv') => void
  isScreenLocked: boolean
  lockScreen: () => void
  unlockScreen: (pinOrCode: string) => boolean
  isPrivacyModeActive: boolean
  togglePrivacyMode: () => void
  twoFactorSetupModalUser: UserAccount | null
  setTwoFactorSetupModalUser: (user: UserAccount | null) => void
  enable2FAForUser: (userId: string, secret: string, backupCodes: string[]) => void
  disable2FAForUser: (userId: string) => void
  stepUpChallenge: {
    isOpen: boolean
    title: string
    description: string
    onConfirmed: () => void
  } | null
  triggerStepUp2FA: (title: string, description: string, onConfirmed: () => void) => void
  closeStepUpChallenge: () => void

  // Client Helper
  getClientDisplayName: (clientType?: ClientType, id?: string) => string

  // Reset & Data Management
  resetToDemoData: () => void
  exportDataJson: () => string
  importDataJson: (jsonString: string) => boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'pulsework_crm_state_v2'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Theme & Custom Styling Engine
  const [customTheme, setCustomTheme] = useState<CustomThemeConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_custom_theme`)
    return saved ? JSON.parse(saved) : defaultThemeConfig
  })
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)

  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_entities`)
    return saved ? JSON.parse(saved) : initialLegalEntities
  })
  const [activeLegalEntityId, setActiveLegalEntityId] = useState<string>(() => {
    return initialLegalEntities[0].id
  })

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`)
    return saved ? JSON.parse(saved) : initialCompanyProfile
  })

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_companies`)
    return saved ? JSON.parse(saved) : initialCompanies
  })

  const [individuals, setIndividuals] = useState<IndividualClient[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_individuals`)
    return saved ? JSON.parse(saved) : initialIndividuals
  })

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`)
    return saved ? JSON.parse(saved) : initialContacts
  })

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`)
    return saved ? JSON.parse(saved) : initialProducts
  })

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`)
    return saved ? JSON.parse(saved) : initialEvents
  })

  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_doctemplates`)
    return saved ? JSON.parse(saved) : initialDocumentTemplates
  })
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_emailtemplates`)
    return saved ? JSON.parse(saved) : initialEmailTemplates
  })
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])

  const [vatRates, setVatRates] = useState<VatRate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vatrates`)
    return saved ? JSON.parse(saved) : initialVatRates
  })

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deals`)
    return saved ? JSON.parse(saved) : initialDeals
  })

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quotations`)
    return saved ? JSON.parse(saved) : initialQuotations
  })

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_projects`)
    return saved ? JSON.parse(saved) : initialProjects
  })
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`)
    return saved ? JSON.parse(saved) : initialTasks
  })

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_time`)
    return saved ? JSON.parse(saved) : initialTimeEntries
  })

  const [activeTimer, setActiveTimer] = useState<{
    isRunning: boolean
    projectId: string
    taskId?: string
    description: string
    startTime: number | null
    elapsedSeconds: number
  }>({
    isRunning: false,
    projectId: '',
    taskId: '',
    description: '',
    startTime: null,
    elapsedSeconds: 0,
  })

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`)
    return saved ? JSON.parse(saved) : initialInvoices
  })

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`)
    return saved ? JSON.parse(saved) : initialPayments
  })

  const [peppolLogs, setPeppolLogs] = useState<PeppolTransmissionLog[]>([])

  // Multi-Currency
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('EUR')
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, ExchangeRate>>(defaultExchangeRates)
  const updateExchangeRate = (currency: SupportedCurrency, rate: number) => {
    setExchangeRates((prev) => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        rateToEur: rate,
        lastUpdated: new Date().toISOString(),
      },
    }))
  }

  // Expenses & Suppliers
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`)
    return saved ? JSON.parse(saved) : initialExpenses
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`)
    return saved ? JSON.parse(saved) : initialSuppliers
  })

  // Banking & SEPA
  const [bankStatements, setBankStatements] = useState<BankStatement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bankstatements`)
    return saved ? JSON.parse(saved) : initialBankStatements
  })
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_banktransactions`)
    return saved ? JSON.parse(saved) : initialBankTransactions
  })
  const [sepaBatches, setSepaBatches] = useState<SepaDirectDebitBatch[]>([])

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<SubscriptionContract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subscriptions`)
    return saved ? JSON.parse(saved) : initialSubscriptions
  })

  // Contracts
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`)
    return saved ? JSON.parse(saved) : initialContracts
  })

  // Developers & Webhooks
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_apikeys`)
    return saved ? JSON.parse(saved) : initialApiKeys
  })
  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_webhooks`)
    return saved ? JSON.parse(saved) : initialWebhookEndpoints
  })
  const [webhookLogs, setWebhookLogs] = useState<WebhookEventLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_webhooklogs`)
    return saved ? JSON.parse(saved) : initialWebhookLogs
  })

  // Integrations Hub
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_integrations`)
    return saved ? JSON.parse(saved) : initialIntegrations
  })

  // Language & Localization (NL / FR / EN / DE)
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lang`)
    return (saved as LanguageCode) || 'nl'
  })

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(`${STORAGE_KEY}_lang`, lang)
    } catch (e) {}
  }

  const t = (key: string) => translate(key, language)

  // Work Orders (Werkbonnen)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_workorders`)
    return saved ? JSON.parse(saved) : initialWorkOrders
  })

  // Mileage & Travel Log (Kilometers)
  const [mileageTrips, setMileageTrips] = useState<MileageTrip[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_mileage`)
    return saved ? JSON.parse(saved) : initialMileageTrips
  })

  // Purchase Orders & Procurement (Bestelbonnen)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purchaseorders`)
    return saved ? JSON.parse(saved) : initialPurchaseOrders
  })

  // Dunning Notices & Debt Collection
  const [dunningNotices, setDunningNotices] = useState<DunningNotice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dunningnotices`)
    return saved ? JSON.parse(saved) : []
  })

  // Enterprise Security & RBAC & 2FA State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`)
    return saved ? JSON.parse(saved) : initialUsers
  })
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user_id`)
    return saved || initialUsers[0].id
  })
  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_secpolicy`)
    return saved ? JSON.parse(saved) : initialSecurityPolicy
  })
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`)
    return saved ? JSON.parse(saved) : initialActiveSessions
  })
  const [securityAuditLogs, setSecurityAuditLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditlogs`)
    return saved ? JSON.parse(saved) : initialSecurityAuditLogs
  })
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false)
  const [isPrivacyModeActive, setIsPrivacyModeActive] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_privacy_mode`)
    return saved ? JSON.parse(saved) : initialSecurityPolicy.screenSharePrivacyDefault
  })
  const [twoFactorSetupModalUser, setTwoFactorSetupModalUser] = useState<UserAccount | null>(null)
  const [stepUpChallenge, setStepUpChallenge] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirmed: () => void
  } | null>(null)

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || initialUsers[0]

  const activeLegalEntity =
    legalEntities.find((e) => e.id === activeLegalEntityId) || legalEntities[0] || initialLegalEntities[0]

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_entities`, JSON.stringify(legalEntities))
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(companyProfile))
      localStorage.setItem(`${STORAGE_KEY}_companies`, JSON.stringify(companies))
      localStorage.setItem(`${STORAGE_KEY}_individuals`, JSON.stringify(individuals))
      localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts))
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products))
      localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events))
      localStorage.setItem(`${STORAGE_KEY}_doctemplates`, JSON.stringify(documentTemplates))
      localStorage.setItem(`${STORAGE_KEY}_emailtemplates`, JSON.stringify(emailTemplates))
      localStorage.setItem(`${STORAGE_KEY}_vatrates`, JSON.stringify(vatRates))
      localStorage.setItem(`${STORAGE_KEY}_deals`, JSON.stringify(deals))
      localStorage.setItem(`${STORAGE_KEY}_quotations`, JSON.stringify(quotations))
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects))
      localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks))
      localStorage.setItem(`${STORAGE_KEY}_time`, JSON.stringify(timeEntries))
      localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices))
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments))
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses))
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers))
      localStorage.setItem(`${STORAGE_KEY}_bankstatements`, JSON.stringify(bankStatements))
      localStorage.setItem(`${STORAGE_KEY}_banktransactions`, JSON.stringify(bankTransactions))
      localStorage.setItem(`${STORAGE_KEY}_subscriptions`, JSON.stringify(subscriptions))
      localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts))
      localStorage.setItem(`${STORAGE_KEY}_apikeys`, JSON.stringify(apiKeys))
      localStorage.setItem(`${STORAGE_KEY}_webhooks`, JSON.stringify(webhookEndpoints))
      localStorage.setItem(`${STORAGE_KEY}_webhooklogs`, JSON.stringify(webhookLogs))
      localStorage.setItem(`${STORAGE_KEY}_integrations`, JSON.stringify(integrations))
      localStorage.setItem(`${STORAGE_KEY}_workorders`, JSON.stringify(workOrders))
      localStorage.setItem(`${STORAGE_KEY}_mileage`, JSON.stringify(mileageTrips))
      localStorage.setItem(`${STORAGE_KEY}_purchaseorders`, JSON.stringify(purchaseOrders))
      localStorage.setItem(`${STORAGE_KEY}_dunningnotices`, JSON.stringify(dunningNotices))
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users))
      localStorage.setItem(`${STORAGE_KEY}_secpolicy`, JSON.stringify(securityPolicy))
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(activeSessions))
      localStorage.setItem(`${STORAGE_KEY}_auditlogs`, JSON.stringify(securityAuditLogs))
      localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUserId)
      localStorage.setItem(`${STORAGE_KEY}_privacy_mode`, JSON.stringify(isPrivacyModeActive))
    } catch (e) {
      console.warn('Storage sync error:', e)
    }
  }, [
    legalEntities,
    companyProfile,
    companies,
    individuals,
    contacts,
    products,
    events,
    documentTemplates,
    emailTemplates,
    vatRates,
    deals,
    quotations,
    projects,
    tasks,
    timeEntries,
    invoices,
    payments,
    expenses,
    suppliers,
    bankStatements,
    bankTransactions,
    subscriptions,
    contracts,
    apiKeys,
    webhookEndpoints,
    webhookLogs,
    integrations,
    workOrders,
    mileageTrips,
    purchaseOrders,
    dunningNotices,
    users,
    securityPolicy,
    activeSessions,
    securityAuditLogs,
    currentUserId,
    isPrivacyModeActive,
  ])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTimer.isRunning])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  // Update Custom Theme Configuration
  const updateCustomTheme = (updates: Partial<CustomThemeConfig>) => {
    setCustomTheme((prev) => {
      const updated = { ...prev, ...updates }
      try {
        localStorage.setItem(`${STORAGE_KEY}_custom_theme`, JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }

  // Set Curated Preset Theme
  const setThemePreset = (presetId: ThemePresetId) => {
    const preset = themePresets.find((p) => p.id === presetId)
    if (preset) {
      const updated: CustomThemeConfig = {
        ...preset.config,
        customBrandName: customTheme.customBrandName,
        customLogoUrl: customTheme.customLogoUrl,
        customCss: customTheme.customCss,
      }
      setCustomTheme(updated)
      try {
        localStorage.setItem(`${STORAGE_KEY}_custom_theme`, JSON.stringify(updated))
      } catch (e) {}
    }
  }

  // Reset Custom Theme to Default Standard Crisp White
  const resetCustomTheme = () => {
    setCustomTheme(defaultThemeConfig)
    try {
      localStorage.setItem(`${STORAGE_KEY}_custom_theme`, JSON.stringify(defaultThemeConfig))
    } catch (e) {}
  }

  // Live CSS Synchronization
  useEffect(() => {
    applyThemeConfig(customTheme, theme === 'dark')
  }, [customTheme, theme])

  // Global Keyboard Shortcut for Spotlight Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSpotlightOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addLegalEntity = (entity: LegalEntity) => setLegalEntities((prev) => [...prev, entity])
  const updateLegalEntity = (entity: LegalEntity) =>
    setLegalEntities((prev) => prev.map((e) => (e.id === entity.id ? entity : e)))
  const deleteLegalEntity = (id: string) => {
    if (legalEntities.length <= 1) return
    setLegalEntities((prev) => prev.filter((e) => e.id !== id))
    if (activeLegalEntityId === id) {
      const remaining = legalEntities.filter((e) => e.id !== id)
      setActiveLegalEntityId(remaining[0].id)
    }
  }

  const updateCompanyProfile = (profile: CompanyProfile) => setCompanyProfile(profile)

  const addCompany = (c: any) => {
    const item: Company = {
      ...c,
      id: c.id || `comp-${Date.now()}`,
      createdAt: c.createdAt || new Date().toISOString(),
    }
    setCompanies((prev) => [item, ...prev])
  }
  const updateCompany = (c: Company) => setCompanies((prev) => prev.map((item) => (item.id === c.id ? c : item)))
  const deleteCompany = (id: string) => setCompanies((prev) => prev.filter((item) => item.id !== id))

  const addIndividual = (ind: any) => {
    const item: IndividualClient = {
      ...ind,
      id: ind.id || `ind-${Date.now()}`,
      createdAt: ind.createdAt || new Date().toISOString(),
    }
    setIndividuals((prev) => [item, ...prev])
  }
  const updateIndividual = (ind: IndividualClient) =>
    setIndividuals((prev) => prev.map((item) => (item.id === ind.id ? ind : item)))
  const deleteIndividual = (id: string) => setIndividuals((prev) => prev.filter((item) => item.id !== id))

  const addContact = (cont: any) => {
    const item: Contact = {
      ...cont,
      id: cont.id || `cont-${Date.now()}`,
      createdAt: cont.createdAt || new Date().toISOString(),
    }
    setContacts((prev) => [...prev, item])
  }
  const updateContact = (cont: Contact) => setContacts((prev) => prev.map((item) => (item.id === cont.id ? cont : item)))
  const deleteContact = (id: string) => setContacts((prev) => prev.filter((item) => item.id !== id))

  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev])
  const updateProduct = (p: Product) => setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)))
  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((item) => item.id !== id))
  const adjustProductStock = (productId: string, quantityDelta: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, stockQuantity: Math.max(0, item.stockQuantity + quantityDelta) }
          : item
      )
    )
  }

  const addCalendarEvent = (evt: CalendarEvent) => setEvents((prev) => [evt, ...prev])
  const updateCalendarEvent = (evt: CalendarEvent) =>
    setEvents((prev) => prev.map((item) => (item.id === evt.id ? evt : item)))
  const deleteCalendarEvent = (id: string) => setEvents((prev) => prev.filter((item) => item.id !== id))

  const addDocumentTemplate = (t: DocumentTemplate) => setDocumentTemplates((prev) => [...prev, t])
  const updateDocumentTemplate = (t: DocumentTemplate) =>
    setDocumentTemplates((prev) => prev.map((item) => (item.id === t.id ? t : item)))
  const deleteDocumentTemplate = (id: string) =>
    setDocumentTemplates((prev) => prev.filter((item) => item.id !== id))

  const addEmailTemplate = (t: EmailTemplate) => setEmailTemplates((prev) => [...prev, t])
  const updateEmailTemplate = (t: EmailTemplate) =>
    setEmailTemplates((prev) => prev.map((item) => (item.id === t.id ? t : item)))
  const deleteEmailTemplate = (id: string) =>
    setEmailTemplates((prev) => prev.filter((item) => item.id !== id))

  const sendEmail = (message: Omit<EmailMessage, 'id' | 'sentAt' | 'status'>) => {
    const newMsg: EmailMessage = {
      ...message,
      id: `em-${Date.now()}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
    }
    setEmailMessages((prev) => [newMsg, ...prev])
  }

  const addVatRate = (vr: VatRate) => setVatRates((prev) => [...prev, vr])
  const updateVatRate = (vr: VatRate) => setVatRates((prev) => prev.map((item) => (item.id === vr.id ? vr : item)))
  const deleteVatRate = (id: string) => setVatRates((prev) => prev.filter((item) => item.id !== id))

  const getClientDisplayName = (clientType?: ClientType, id?: string): string => {
    if (!id) return 'Unassigned'
    if (clientType === 'individual') {
      const ind = individuals.find((i) => i.id === id)
      return ind ? `${ind.firstName} ${ind.lastName} (Private)` : 'Unknown Client'
    }
    const comp = companies.find((c) => c.id === id)
    return comp ? comp.name : 'Unknown Company'
  }

  const addDeal = (deal: any) => {
    const item: Deal = {
      ...deal,
      id: deal.id || `deal-${Date.now()}`,
      createdAt: deal.createdAt || new Date().toISOString(),
    }
    setDeals((prev) => [item, ...prev])
  }
  const updateDeal = (deal: Deal) => setDeals((prev) => prev.map((d) => (d.id === deal.id ? deal : d)))
  const deleteDeal = (id: string) => setDeals((prev) => prev.filter((d) => d.id !== id))
  const moveDealStage = (dealId: string, stage: DealStage) => {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)))
  }

  const addQuotation = (q: Quotation) => setQuotations((prev) => [q, ...prev])
  const updateQuotation = (q: Quotation) => setQuotations((prev) => prev.map((item) => (item.id === q.id ? q : item)))
  const deleteQuotation = (id: string) => setQuotations((prev) => prev.filter((item) => item.id !== id))
  const signQuotation = (quoteId: string, signerName: string, signerNotes?: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'accepted',
              clientSignedAt: new Date().toISOString(),
              clientSignedBy: signerName,
            }
          : q
      )
    )
  }

  const addProject = (p: any) => {
    const item: Project = {
      ...p,
      id: p.id || `proj-${Date.now()}`,
      createdAt: p.createdAt || new Date().toISOString(),
    }
    setProjects((prev) => [item, ...prev])
  }
  const updateProject = (p: Project) => setProjects((prev) => prev.map((item) => (item.id === p.id ? p : item)))
  const deleteProject = (id: string) => setProjects((prev) => prev.filter((item) => item.id !== id))

  const addTask = (t: any) => {
    const item: Task = {
      ...t,
      id: t.id || `task-${Date.now()}`,
      loggedHours: t.loggedHours || 0,
      createdAt: t.createdAt || new Date().toISOString(),
    }
    setTasks((prev) => [...prev, item])
  }
  const updateTask = (t: Task) => setTasks((prev) => prev.map((item) => (item.id === t.id ? t : item)))
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((item) => item.id !== id))
  const moveTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
  }

  const addTimeEntry = (entry: any) => {
    const item: TimeEntry = {
      ...entry,
      id: entry.id || `time-${Date.now()}`,
      createdAt: entry.createdAt || new Date().toISOString(),
    }
    setTimeEntries((prev) => [item, ...prev])
  }
  const updateTimeEntry = (entry: TimeEntry) =>
    setTimeEntries((prev) => prev.map((item) => (item.id === entry.id ? entry : item)))
  const deleteTimeEntry = (id: string) => setTimeEntries((prev) => prev.filter((item) => item.id !== id))

  const startTimer = (projectId: string, taskId?: string, description = '') => {
    setActiveTimer({
      isRunning: true,
      projectId,
      taskId,
      description,
      startTime: Date.now(),
      elapsedSeconds: 0,
    })
  }

  const stopTimer = () => {
    if (!activeTimer.isRunning || activeTimer.elapsedSeconds < 10) {
      setActiveTimer({ isRunning: false, projectId: '', description: '', startTime: null, elapsedSeconds: 0 })
      return
    }
    const hours = Number((activeTimer.elapsedSeconds / 3600).toFixed(2))
    const proj = projects.find((p) => p.id === activeTimer.projectId)
    const newEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      projectId: activeTimer.projectId,
      taskId: activeTimer.taskId,
      memberName: 'Koen De Vries',
      date: new Date().toISOString().slice(0, 10),
      hours: Math.max(0.1, hours),
      description: activeTimer.description || 'Tracked live session',
      isBillable: true,
      hourlyRate: proj ? proj.hourlyRate : 110.0,
      createdAt: new Date().toISOString(),
    }
    addTimeEntry(newEntry)
    setActiveTimer({ isRunning: false, projectId: '', description: '', startTime: null, elapsedSeconds: 0 })
  }

  const addInvoice = (inv: Invoice) => {
    setInvoices((prev) => [inv, ...prev])
    inv.items.forEach((item) => {
      if (item.productId) {
        adjustProductStock(item.productId, -item.quantity)
      }
    })
  }
  const updateInvoice = (inv: Invoice) => setInvoices((prev) => prev.map((item) => (item.id === inv.id ? inv : item)))
  const deleteInvoice = (id: string) => setInvoices((prev) => prev.filter((item) => item.id !== id))

  const recordPayment = (p: any) => {
    const item: Payment = {
      ...p,
      id: p.id || `pay-${Date.now()}`,
      createdAt: p.createdAt || new Date().toISOString(),
    }
    setPayments((prev) => [...prev, item])
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === item.invoiceId) {
          const newPaid = inv.amountPaid + item.amount
          const status = newPaid >= inv.total ? 'paid' : 'partial'
          return { ...inv, amountPaid: newPaid, status }
        }
        return inv
      })
    )
  }

  const generateStructuredReference = (seedNumber: string): string => {
    const cleanSeed = seedNumber.replace(/[^0-9]/g, '').slice(-10).padStart(10, '0')
    const numVal = BigInt(cleanSeed)
    const mod97 = Number(numVal % 97n)
    const check = mod97 === 0 ? 97 : mod97
    const checkStr = String(check).padStart(2, '0')
    const full12 = cleanSeed + checkStr
    return `+++${full12.slice(0, 3)}/${full12.slice(3, 7)}/${full12.slice(7, 12)}+++`
  }

  const convertQuoteToProject = (quoteId: string): Project | null => {
    const quote = quotations.find((q) => q.id === quoteId)
    if (!quote) return null

    const totalHours = quote.items
      .filter((i) => i.unit === 'hours' || i.unit === 'h')
      .reduce((sum, i) => sum + i.quantity, 0)

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: quote.title,
      quoteId: quote.id,
      clientType: quote.clientType || 'company',
      companyId: quote.companyId || '',
      individualId: quote.individualId,
      status: 'in_progress',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: quote.validUntilDate,
      budgetHours: totalHours || 120,
      budgetAmount: quote.subtotal,
      hourlyRate: 110.0,
      progressPercent: 0,
      description: `Project generated from Quotation ${quote.number}`,
      color: '#3f78e0',
      createdAt: new Date().toISOString(),
    }

    addProject(newProject)

    quote.items.forEach((item, index) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${index}`,
        projectId: newProject.id,
        title: item.description,
        description: `Deliverable milestone from quote item #${index + 1}`,
        assignee: 'Koen De Vries',
        priority: 'high',
        status: 'todo',
        estimatedHours: item.quantity,
        loggedHours: 0,
        dueDate: quote.validUntilDate,
        createdAt: new Date().toISOString(),
      }
      addTask(newTask)
    })

    updateQuotation({ ...quote, convertedToProjectId: newProject.id, status: 'accepted' })
    return newProject
  }

  const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
    const quote = quotations.find((q) => q.id === quoteId)
    if (!quote) return null

    const invSeq = String(invoices.length + 1).padStart(4, '0')
    const prefix = activeLegalEntity.invoicePrefix || 'INV-'
    const invoiceNumber = `${prefix}2026-${invSeq}`
    const seed = `${new Date().getFullYear()}${invSeq}${Math.floor(Math.random() * 1000)}`

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      legalEntityId: activeLegalEntity.id,
      quoteId: quote.id,
      clientType: quote.clientType || 'company',
      companyId: quote.companyId || '',
      individualId: quote.individualId,
      contactId: quote.contactId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      structuredReference: generateStructuredReference(seed),
      items: quote.items.map((i) => ({
        ...i,
        taxCategory: i.vatRate === 0 ? 'AE' : 'S',
      })),
      subtotal: quote.subtotal,
      taxBreakdown: [
        {
          rate: 21,
          taxCategory: 'S',
          taxableAmount: quote.subtotal,
          taxAmount: quote.taxTotal,
        },
      ],
      taxTotal: quote.taxTotal,
      total: quote.total,
      amountPaid: 0,
      currency: quote.currency,
      status: 'issued',
      peppolStatus: 'valid',
      notes: quote.terms || 'Payment due within 30 days.',
      paymentTerms: '30 days net',
      createdAt: new Date().toISOString(),
    }

    addInvoice(newInvoice)
    updateQuotation({ ...quote, convertedToInvoiceId: newInvoice.id })
    return newInvoice
  }

  const invoiceProjectTimeEntries = (projectId: string): Invoice | null => {
    const unbilled = timeEntries.filter((t) => t.projectId === projectId && !t.invoiceId && t.isBillable)
    if (unbilled.length === 0) return null

    const proj = projects.find((p) => p.id === projectId)
    if (!proj) return null

    const invSeq = String(invoices.length + 1).padStart(4, '0')
    const prefix = activeLegalEntity.invoicePrefix || 'INV-'
    const invoiceNumber = `${prefix}2026-${invSeq}`
    const seed = `${new Date().getFullYear()}${invSeq}${Math.floor(Math.random() * 1000)}`

    const items = unbilled.map((entry, idx) => ({
      id: `ii-time-${idx}-${Date.now()}`,
      description: `${entry.memberName} — ${entry.description} (${entry.date})`,
      quantity: entry.hours,
      unit: 'hours',
      unitPrice: entry.hourlyRate,
      discountPercent: 0,
      vatRate: 21,
      total: Number((entry.hours * entry.hourlyRate).toFixed(2)),
      taxCategory: 'S' as const,
    }))

    const subtotal = Number(items.reduce((s, i) => s + i.total, 0).toFixed(2))
    const taxTotal = Number((subtotal * 0.21).toFixed(2))
    const total = Number((subtotal + taxTotal).toFixed(2))

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      legalEntityId: activeLegalEntity.id,
      projectId: proj.id,
      clientType: proj.clientType || 'company',
      companyId: proj.companyId,
      individualId: proj.individualId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      structuredReference: generateStructuredReference(seed),
      items,
      subtotal,
      taxBreakdown: [{ rate: 21, taxCategory: 'S', taxableAmount: subtotal, taxAmount: taxTotal }],
      taxTotal,
      total,
      amountPaid: 0,
      currency: 'EUR',
      status: 'issued',
      peppolStatus: 'valid',
      notes: `Billing for completed project engineering hours (${unbilled.length} timesheet entries).`,
      paymentTerms: '30 days net',
      createdAt: new Date().toISOString(),
    }

    addInvoice(newInvoice)

    setTimeEntries((prev) =>
      prev.map((t) => (t.projectId === projectId && !t.invoiceId ? { ...t, invoiceId: newInvoice.id } : t))
    )

    return newInvoice
  }

  const sendInvoiceViaPeppol = async (invoiceId: string): Promise<{ success: boolean; error?: string }> => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) return { success: false, error: 'Invoice not found' }

    const company = companies.find((c) => c.id === inv.companyId)
    const fallbackCompany: Company = {
      id: 'custom-comp',
      name: 'Client Entity',
      vatNumber: 'BE0842123456',
      peppolScheme: '0208',
      peppolEndpoint: '0842123456',
      email: 'billing@client.com',
      phone: '+32 2 000 0000',
      address: 'Business Street 1',
      city: 'Brussels',
      postalCode: '1000',
      country: 'Belgium',
      countryCode: 'BE',
      status: 'customer',
      tags: [],
      createdAt: new Date().toISOString(),
    }

    const sellerProfile: CompanyProfile = {
      ...companyProfile,
      name: activeLegalEntity.name,
      legalName: activeLegalEntity.legalName,
      vatNumber: activeLegalEntity.vatNumber,
      peppolScheme: activeLegalEntity.peppolScheme,
      peppolEndpoint: activeLegalEntity.peppolEndpoint,
      iban: activeLegalEntity.iban,
      bic: activeLegalEntity.bic,
    }

    const result = await dispatchPeppolInvoice(inv, sellerProfile, company || fallbackCompany)

    setPeppolLogs((prev) => [result.log, ...prev])

    if (result.success) {
      updateInvoice({
        ...inv,
        status: 'peppol_sent',
        peppolStatus: 'delivered',
        peppolMessageId: result.log.accessPointReceiptId,
        peppolDeliveredAt: new Date().toISOString(),
      })
      return { success: true }
    } else {
      updateInvoice({ ...inv, peppolStatus: 'failed' })
      return { success: false, error: result.log.responseMessage }
    }
  }

  // ==========================================
  // EXPENSES & SUPPLIERS HANDLERS
  // ==========================================
  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev])
  }
  const updateExpense = (expense: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)))
  }
  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }
  const addSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => [supplier, ...prev])
  }
  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)))
  }
  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }
  const importInboundPeppolXml = (xmlContent: string, fileName?: string): Expense => {
    const parsed = parseInboundPeppolXml(xmlContent, fileName)
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      number: parsed.number || `INB-2026-${Date.now().toString().slice(-4)}`,
      supplierName: parsed.supplierName || 'Inbound Peppol Supplier',
      supplierVat: parsed.supplierVat,
      supplierIban: parsed.supplierIban,
      category: parsed.category || 'other',
      invoiceDate: parsed.invoiceDate || new Date().toISOString().slice(0, 10),
      dueDate: parsed.dueDate || new Date().toISOString().slice(0, 10),
      subtotal: parsed.subtotal || 0,
      vatTotal: parsed.vatTotal || 0,
      total: parsed.total || 0,
      currency: parsed.currency || 'EUR',
      status: 'pending',
      isPeppolInbound: true,
      peppolXml: xmlContent,
      notes: parsed.notes,
      items: parsed.items,
      createdAt: new Date().toISOString(),
    }
    addExpense(newExpense)
    return newExpense
  }

  // ==========================================
  // BANKING & RECONCILIATION HANDLERS
  // ==========================================
  const importBankStatement = (
    fileContent: string,
    format: 'coda' | 'camt053' | 'csv',
    fileName: string
  ): BankStatement => {
    let res: { statement: BankStatement; transactions: BankTransaction[] }
    if (format === 'coda') {
      res = parseCodaFile(fileContent, fileName)
    } else if (format === 'camt053') {
      res = parseCamt053File(fileContent, fileName)
    } else {
      res = parseCsvBankFile(fileContent, fileName)
    }

    setBankStatements((prev) => [res.statement, ...prev])
    setBankTransactions((prev) => [...res.transactions, ...prev])
    return res.statement
  }

  const reconcileTransactionWithInvoice = (transactionId: string, invoiceId: string) => {
    const tx = bankTransactions.find((t) => t.id === transactionId)
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!tx || !inv) return

    setBankTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              reconciled: true,
              matchedInvoiceId: invoiceId,
              reconciledAt: new Date().toISOString(),
              reconciliationType: 'manual',
            }
          : t
      )
    )

    recordPayment({
      invoiceId: inv.id,
      amount: Math.abs(tx.amount),
      paymentDate: tx.date,
      method: 'sepa',
      reference: tx.structuredReference || tx.description,
      note: `Reconciled via Bank Transaction ${tx.id}`,
    })
  }

  const reconcileTransactionWithExpense = (transactionId: string, expenseId: string) => {
    const tx = bankTransactions.find((t) => t.id === transactionId)
    const exp = expenses.find((e) => e.id === expenseId)
    if (!tx || !exp) return

    setBankTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              reconciled: true,
              matchedExpenseId: expenseId,
              reconciledAt: new Date().toISOString(),
              reconciliationType: 'manual',
            }
          : t
      )
    )

    updateExpense({
      ...exp,
      status: 'paid',
      paymentDate: tx.date,
      paymentMethod: 'bank_transfer',
    })
  }

  const autoReconcileAllTransactions = (): { matchedCount: number; matchedInvoices: string[] } => {
    let matchedCount = 0
    const matchedInvoices: string[] = []

    const updatedTx = bankTransactions.map((tx) => {
      if (tx.reconciled) return tx
      if (tx.amount <= 0) return tx

      if (tx.structuredReference) {
        const cleanRef = tx.structuredReference.replace(/[^0-9]/g, '')
        const match = invoices.find(
          (inv) =>
            inv.status !== 'paid' &&
            inv.structuredReference &&
            inv.structuredReference.replace(/[^0-9]/g, '') === cleanRef
        )
        if (match) {
          matchedCount++
          matchedInvoices.push(match.number)
          recordPayment({
            invoiceId: match.id,
            amount: tx.amount,
            paymentDate: tx.date,
            method: 'sepa',
            reference: tx.structuredReference,
            note: 'Auto-reconciled via Belgian OGM Reference',
          })
          return {
            ...tx,
            reconciled: true,
            matchedInvoiceId: match.id,
            reconciledAt: new Date().toISOString(),
            reconciliationType: 'auto_ogm' as const,
          }
        }
      }

      const amountMatch = invoices.find(
        (inv) =>
          inv.status !== 'paid' &&
          Math.abs(inv.total - tx.amount) < 0.05
      )
      if (amountMatch) {
        matchedCount++
        matchedInvoices.push(amountMatch.number)
        recordPayment({
          invoiceId: amountMatch.id,
          amount: tx.amount,
          paymentDate: tx.date,
          method: 'sepa',
          reference: tx.description,
          note: 'Auto-reconciled via exact amount match',
        })
        return {
          ...tx,
          reconciled: true,
          matchedInvoiceId: amountMatch.id,
          reconciledAt: new Date().toISOString(),
          reconciliationType: 'auto_amount' as const,
        }
      }

      return tx
    })

    setBankTransactions(updatedTx)
    return { matchedCount, matchedInvoices }
  }

  const generateSepaBatch = (invoiceIds: string[], collectionDate: string): SepaDirectDebitBatch => {
    const selectedInvoices = invoices.filter((i) => invoiceIds.includes(i.id))
    const collectionItems: SepaCollectionItem[] = selectedInvoices.map((inv) => {
      const comp = companies.find((c) => c.id === inv.companyId)
      const ind = individuals.find((i) => i.id === inv.individualId)
      return {
        invoice: inv,
        debtorName: comp ? comp.name : ind ? `${ind.firstName} ${ind.lastName}` : 'Client',
        debtorIban: 'BE71 0910 1234 5678',
        debtorBic: 'GEBABEBB',
        mandateId: `MAND-${inv.id}`,
        mandateDate: '2025-01-15',
      }
    })

    const xml = generateSepaDirectDebitXml({
      batchReference: `BATCH-SDD-${Date.now().toString().slice(-6)}`,
      collectionDate,
      creditor: activeLegalEntity,
      items: collectionItems,
    })

    const newBatch: SepaDirectDebitBatch = {
      id: `sdd-batch-${Date.now()}`,
      batchReference: `SDD-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`,
      collectionDate,
      creditorName: activeLegalEntity.name,
      creditorIban: activeLegalEntity.iban,
      creditorBic: activeLegalEntity.bic,
      creditorId: `BE99ZZZ${activeLegalEntity.vatNumber.replace(/\D/g, '').padEnd(10, '0')}`,
      invoiceIds,
      totalAmount: selectedInvoices.reduce((sum, i) => sum + (i.total - i.amountPaid), 0),
      transactionCount: selectedInvoices.length,
      generatedXml: xml,
      createdAt: new Date().toISOString(),
    }

    setSepaBatches((prev) => [newBatch, ...prev])
    return newBatch
  }

  // ==========================================
  // SUBSCRIPTIONS HANDLERS
  // ==========================================
  const addSubscription = (sub: SubscriptionContract) => {
    setSubscriptions((prev) => [sub, ...prev])
  }
  const updateSubscription = (sub: SubscriptionContract) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? sub : s)))
  }
  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }

  const generateInvoicesForDueSubscriptions = (): Invoice[] => {
    const generated: Invoice[] = []
    const updatedSubs = subscriptions.map((sub) => {
      if (sub.status !== 'active') return sub

      const invSeq = String(invoices.length + generated.length + 1).padStart(4, '0')
      const prefix = activeLegalEntity.invoicePrefix || 'INV-'
      const invoiceNumber = `${prefix}2026-${invSeq}`
      const seed = `${new Date().getFullYear()}${invSeq}${Math.floor(Math.random() * 1000)}`

      const newInv: Invoice = {
        id: `inv-sub-${Date.now()}-${sub.id}`,
        number: invoiceNumber,
        legalEntityId: sub.legalEntityId || activeLegalEntity.id,
        clientType: sub.clientType,
        companyId: sub.companyId,
        individualId: sub.individualId,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        structuredReference: generateStructuredReference(seed),
        items: sub.items.map((i) => ({
          ...i,
          taxCategory: i.vatRate === 0 ? 'AE' : 'S',
        })),
        subtotal: sub.subtotal,
        taxBreakdown: [
          {
            rate: sub.items[0]?.vatRate || 21,
            taxCategory: sub.items[0]?.vatRate === 0 ? 'AE' : 'S',
            taxableAmount: sub.subtotal,
            taxAmount: sub.vatTotal,
          },
        ],
        taxTotal: sub.vatTotal,
        total: sub.total,
        amountPaid: 0,
        currency: sub.currency,
        status: 'issued',
        peppolStatus: sub.autoSendPeppol ? 'delivered' : 'valid',
        notes: `Subscription billing for ${sub.title} (Period: ${sub.nextBillingDate}).`,
        paymentTerms: '30 days net',
        createdAt: new Date().toISOString(),
      }

      generated.push(newInv)

      const d = new Date(sub.nextBillingDate)
      if (sub.cadence === 'monthly') d.setMonth(d.getMonth() + 1)
      else if (sub.cadence === 'quarterly') d.setMonth(d.getMonth() + 3)
      else if (sub.cadence === 'biannually') d.setMonth(d.getMonth() + 6)
      else if (sub.cadence === 'annually') d.setFullYear(d.getFullYear() + 1)

      return {
        ...sub,
        nextBillingDate: d.toISOString().slice(0, 10),
        lastInvoiceId: newInv.id,
      }
    })

    setSubscriptions(updatedSubs)
    generated.forEach((inv) => addInvoice(inv))
    return generated
  }

  // ==========================================
  // CONTRACTS HANDLERS
  // ==========================================
  const addContract = (contract: Contract) => {
    setContracts((prev) => [contract, ...prev])
  }
  const updateContract = (contract: Contract) => {
    setContracts((prev) => prev.map((c) => (c.id === contract.id ? contract : c)))
  }
  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id))
  }
  const signContract = (
    contractId: string,
    signerType: 'issuer' | 'client',
    signerInfo: { name: string; email: string; role?: string; signatureDataUrl: string }
  ) => {
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract) return

    const auditTrail = {
      signerName: signerInfo.name,
      signerEmail: signerInfo.email,
      signerRole: signerInfo.role || (signerType === 'issuer' ? 'Managing Director' : 'Authorized Representative'),
      signatureDataUrl: signerInfo.signatureDataUrl,
      ipAddress: '194.154.218.42',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      documentChecksumSha256: `sha256_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`,
      certificateId: `CERT-BE-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    }

    const updatedSignatures = {
      ...contract.signatures,
      [signerType === 'issuer' ? 'issuerSignature' : 'clientSignature']: auditTrail,
    }

    const isFullySigned =
      (signerType === 'issuer' && updatedSignatures.clientSignature) ||
      (signerType === 'client' && updatedSignatures.issuerSignature)

    updateContract({
      ...contract,
      status: isFullySigned ? 'signed' : contract.status === 'draft' ? 'sent' : contract.status,
      signatures: updatedSignatures,
      updatedAt: new Date().toISOString(),
    })
  }

  // ==========================================
  // DEVELOPER & WEBHOOKS HANDLERS
  // ==========================================
  const addApiKey = (apiKey: ApiKey) => {
    setApiKeys((prev) => [apiKey, ...prev])
  }
  const deleteApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
  }
  const addWebhookEndpoint = (endpoint: WebhookEndpoint) => {
    setWebhookEndpoints((prev) => [endpoint, ...prev])
  }
  const updateWebhookEndpoint = (endpoint: WebhookEndpoint) => {
    setWebhookEndpoints((prev) => prev.map((w) => (w.id === endpoint.id ? endpoint : w)))
  }
  const deleteWebhookEndpoint = (id: string) => {
    setWebhookEndpoints((prev) => prev.filter((w) => w.id !== id))
  }
  const dispatchWebhookEvent = async (event: string, payload: any): Promise<WebhookEventLog[]> => {
    const activeEndpoints = webhookEndpoints.filter((w) => w.status === 'active' && w.events.includes(event))
    const newLogs: WebhookEventLog[] = []

    for (const ep of activeEndpoints) {
      const log: WebhookEventLog = {
        id: `wh-log-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        endpointId: ep.id,
        url: ep.url,
        event,
        payloadJson: JSON.stringify(payload, null, 2),
        statusCode: 200,
        status: 'success',
        responseTimeMs: Math.floor(60 + Math.random() * 90),
        timestamp: new Date().toISOString(),
      }
      newLogs.push(log)
    }

    if (newLogs.length > 0) {
      setWebhookLogs((prev) => [...newLogs, ...prev])
    }
    return newLogs
  }

  const toggleIntegration = (id: IntegrationId, enabled?: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const nextEnabled = enabled !== undefined ? enabled : !item.enabled
        return {
          ...item,
          enabled: nextEnabled,
          status: nextEnabled ? 'connected' : 'disconnected',
          logs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'auth',
              status: nextEnabled ? 'success' : 'warning',
              message: `Integration ${nextEnabled ? 'enabled & connected' : 'disabled & disconnected'}.`,
            },
            ...item.logs,
          ],
        }
      })
    )
  }

  const updateIntegrationCredentials = (id: IntegrationId, credentials: Record<string, any>) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              credentials: { ...item.credentials, ...credentials },
              status: 'connected',
              logs: [
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  type: 'auth',
                  status: 'success',
                  message: 'Configuration & credentials updated successfully.',
                },
                ...item.logs,
              ],
            }
          : item
      )
    )
  }

  const syncIntegration = async (id: IntegrationId): Promise<SyncResult> => {
    const target = integrations.find((i) => i.id === id)
    if (!target) return { success: false, message: 'Integration not found', itemsSynced: 0 }

    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'syncing' } : i))
    )

    try {
      const result = await executeIntegrationSync(target, {
        invoices,
        expenses,
        deals,
        companies,
        individuals,
      })

      const newLog: IntegrationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'sync',
        status: result.success ? 'success' : 'error',
        message: result.message,
        details: result.details,
      }

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: result.success ? 'connected' : 'error',
                lastSyncAt: new Date().toISOString(),
                syncCount: (i.syncCount || 0) + result.itemsSynced,
                logs: [newLog, ...i.logs.slice(0, 19)],
              }
            : i
        )
      )

      return result
    } catch (err: any) {
      const errorLog: IntegrationLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'error',
        status: 'error',
        message: err?.message || 'Sync failed due to network error.',
      }
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'error', logs: [errorLog, ...i.logs] } : i
        )
      )
      return { success: false, message: err?.message || 'Sync failed', itemsSynced: 0 }
    }
  }

  const simulateIntegrationEvent = async (id: IntegrationId): Promise<{ success: boolean; message: string }> => {
    const nowIso = new Date().toISOString()
    const today = nowIso.slice(0, 10)

    if (id === 'solvari') {
      const solvariDealId = `deal-solvari-${Date.now()}`
      const newCompany: Company = {
        id: `comp-solvari-${Date.now()}`,
        name: 'Vermeulen Residence (Solvari Lead)',
        vatNumber: 'BE0988410294',
        peppolScheme: '0208',
        peppolEndpoint: '0988410294',
        email: 'jan.vermeulen@telenet.be',
        phone: '+32 9 224 88 19',
        address: 'Kortrijksesteenweg 144',
        city: 'Ghent',
        postalCode: '9000',
        country: 'Belgium',
        countryCode: 'BE',
        status: 'lead',
        tags: ['Solvari Lead', 'Heat Pump', 'Ghent'],
        notes: 'Inbound lead via Solvari.be: Request for 12kW Air-to-Water Heat Pump & Solar PV quotation.',
        createdAt: nowIso,
      }
      addCompany(newCompany)

      const newDeal: Deal = {
        id: solvariDealId,
        title: 'Solvari Lead: Heat Pump & Solar Panels Ghent',
        companyId: newCompany.id,
        value: 12850,
        currency: 'EUR',
        stage: 'lead',
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        notes: 'Lead captured via Solvari Partner Webhook #SOL-9941. Contact within 2 hours.',
        createdAt: nowIso,
      }
      addDeal(newDeal)

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === 'solvari'
            ? {
                ...i,
                lastSyncAt: nowIso,
                syncCount: (i.syncCount || 0) + 1,
                logs: [
                  {
                    id: `log-${Date.now()}`,
                    timestamp: nowIso,
                    type: 'webhook',
                    status: 'success',
                    message: 'Captured live Solvari lead: Vermeulen Residence (Ghent) — €12,850.00 deal created.',
                  },
                  ...i.logs,
                ],
              }
            : i
        )
      )

      return {
        success: true,
        message: '🎉 Solvari Webhook received! Created CRM Company "Vermeulen Residence" & €12,850 Deal in Pipeline.',
      }
    } else if (id === 'ponto') {
      const newTx: BankTransaction = {
        id: `tx-ponto-${Date.now()}`,
        statementId: bankStatements[0]?.id || 'stmt-1',
        date: today,
        valueDate: today,
        amount: 3630.0,
        currency: 'EUR',
        counterpartyName: 'AeroDynamics Belgium BV',
        counterpartyIban: 'BE40 0012 3456 7890',
        counterpartyBic: 'GEBABEBB',
        structuredReference: '+++090/9337/55493+++',
        description: 'PONTO PSD2 LIVE FEED / INV-2026-001 SETTLEMENT +++090/9337/55493+++',
        reconciled: false,
      }

      setBankTransactions((prev) => [newTx, ...prev])
      autoReconcileAllTransactions()

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === 'ponto'
            ? {
                ...i,
                lastSyncAt: nowIso,
                syncCount: (i.syncCount || 0) + 1,
                logs: [
                  {
                    id: `log-${Date.now()}`,
                    timestamp: nowIso,
                    type: 'sync',
                    status: 'success',
                    message: `Ponto PSD2: Ingested credit movement €3,630.00. Reconciled with OGM +++090/9337/55493+++.`,
                  },
                  ...i.logs,
                ],
              }
            : i
        )
      )

      return {
        success: true,
        message: '⚡ Ponto PSD2 live transaction ingested (€3,630.00) & automatically matched with Belgian OGM reference!',
      }
    } else if (id === 'mollie' || id === 'stripe') {
      const openInv = invoices.find((i) => i.status === 'issued') || invoices[0]
      if (openInv) {
        recordPayment({
          invoiceId: openInv.id,
          amount: openInv.total - openInv.amountPaid,
          paymentDate: today,
          method: id === 'mollie' ? 'bancontact' : 'card',
          reference: `${id.toUpperCase()} Gateway Settlement #${Math.floor(100000 + Math.random() * 900000)}`,
          note: `Online payment via ${id === 'mollie' ? 'Mollie (Bancontact)' : 'Stripe (Credit Card)'}`,
        })
      }

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                lastSyncAt: nowIso,
                syncCount: (i.syncCount || 0) + 1,
                logs: [
                  {
                    id: `log-${Date.now()}`,
                    timestamp: nowIso,
                    type: 'webhook',
                    status: 'success',
                    message: `${i.name} Webhook: Payment received for Invoice ${openInv?.number || 'INV-2026-001'}. Ledger updated.`,
                  },
                  ...i.logs,
                ],
              }
            : i
        )
      )

      return {
        success: true,
        message: `💳 ${id === 'mollie' ? 'Mollie Bancontact' : 'Stripe'} payment webhook processed! Invoice ${openInv?.number || ''} marked as Paid.`,
      }
    } else {
      const syncRes = await syncIntegration(id)
      return { success: syncRes.success, message: syncRes.message }
    }
  }

  // Work Orders (Werkbonnen)
  const addWorkOrder = (wo: WorkOrder) => setWorkOrders((prev) => [wo, ...prev])
  const updateWorkOrder = (wo: WorkOrder) =>
    setWorkOrders((prev) => prev.map((w) => (w.id === wo.id ? wo : w)))
  const deleteWorkOrder = (id: string) =>
    setWorkOrders((prev) => prev.filter((w) => w.id !== id))
  const signWorkOrder = (id: string, signature: WorkOrderSignature) => {
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'signed',
              signature,
              completedDate: new Date().toISOString().slice(0, 10),
            }
          : w
      )
    )
  }

  const convertWorkOrderToInvoice = (id: string): string => {
    const wo = workOrders.find((w) => w.id === id)
    if (!wo) return ''

    const today = new Date().toISOString().slice(0, 10)
    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`

    const items: any[] = []

    // Labor items
    wo.laborItems.forEach((labor) => {
      items.push({
        id: `item-${Date.now()}-${Math.random()}`,
        description: `Labor: ${labor.description} (${labor.technicianName})`,
        quantity: labor.hours,
        unit: 'hour',
        unitPrice: labor.hourlyRate,
        discountPercent: 0,
        vatRate: 21,
        total: labor.hours * labor.hourlyRate * 1.21,
      })
    })

    // Material items
    wo.materialItems.forEach((mat) => {
      items.push({
        id: `item-${Date.now()}-${Math.random()}`,
        description: mat.description,
        quantity: mat.quantity,
        unit: mat.unit,
        unitPrice: mat.unitPrice,
        discountPercent: 0,
        vatRate: 21,
        total: mat.quantity * mat.unitPrice * 1.21,
      })
    })

    // Travel allowance
    if (wo.travelKilometers > 0) {
      items.push({
        id: `item-${Date.now()}-travel`,
        description: `On-site Service Travel (${wo.travelKilometers} km)`,
        quantity: wo.travelKilometers,
        unit: 'km',
        unitPrice: wo.travelRatePerKm || 0.75,
        discountPercent: 0,
        vatRate: 21,
        total: wo.travelKilometers * (wo.travelRatePerKm || 0.75) * 1.21,
      })
    }

    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0)
    const vatTotal = subtotal * 0.21
    const total = subtotal + vatTotal

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      legalEntityId: activeLegalEntityId,
      number: invoiceNumber,
      clientType: wo.clientType,
      companyId: wo.companyId,
      individualId: wo.individualId,
      issueDate: today,
      dueDate: dueDate,
      status: 'issued',
      peppolStatus: 'not_sent',
      items: items.map((it) => ({ ...it, taxCategory: 'S' as const })),
      subtotal: Math.round(subtotal * 100) / 100,
      taxBreakdown: [
        {
          rate: 21,
          taxCategory: 'S',
          taxableAmount: Math.round(subtotal * 100) / 100,
          taxAmount: Math.round(vatTotal * 100) / 100,
        },
      ],
      taxTotal: Math.round(vatTotal * 100) / 100,
      total: Math.round(total * 100) / 100,
      amountPaid: 0,
      notes: `Generated from approved Digital Work Order ${wo.number} (${wo.title}). Signed by ${wo.signature?.signedBy || 'Customer'}.`,
      structuredReference: `+++090/${Math.floor(1000 + Math.random() * 9000)}/${Math.floor(10000 + Math.random() * 90000)}+++`,
      currency: 'EUR',
      createdAt: new Date().toISOString(),
    }

    addInvoice(newInvoice)

    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'invoiced', invoiceId: newInvoice.id } : w))
    )

    return newInvoice.id
  }

  // Dunning & Debt Collection (Aanmaningen)
  const sendDunningNotice = (invoiceId: string, stage: DunningStage): DunningNotice => {
    const inv = invoices.find((i) => i.id === invoiceId)
    const today = new Date().toISOString().slice(0, 10)
    const daysOverdue = inv
      ? Math.max(0, Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000))
      : 14

    const balanceDue = inv ? inv.total - inv.amountPaid : 1000
    const statutoryFee = stage === 'reminder_1' ? 0 : BELGIAN_STATUTORY_RECOVERY_FEE
    const interestAmount =
      stage === 'reminder_1'
        ? 0
        : Math.round((balanceDue * (STATUTORY_LATE_INTEREST_RATE / 365) * daysOverdue) * 100) / 100
    const totalClaimAmount = balanceDue + statutoryFee + interestAmount

    const newNotice: DunningNotice = {
      id: `dun-${Date.now()}`,
      invoiceId,
      stage,
      stageNumber: stage === 'reminder_1' ? 1 : stage === 'formal_notice' ? 2 : 3,
      issuedDate: today,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      daysOverdue,
      principalAmount: balanceDue,
      statutoryFee,
      interestAmount,
      totalClaimAmount,
      paymentLinkUrl: `https://pay.pulsework.be/checkout/${invoiceId}?method=bancontact`,
      sentVia: stage === 'bailiff_notice' ? 'postal' : 'email',
      status: 'sent',
      notes:
        stage === 'reminder_1'
          ? 'Friendly payment reminder sent with Bancontact 1-click link.'
          : stage === 'formal_notice'
          ? 'Formal Notice of Default (Ingebrekestelling) dispatched with statutory €40.00 fee.'
          : 'Pre-Legal Notice dispatched for Bailiff recovery.',
    }

    setDunningNotices((prev) => [newNotice, ...prev])
    return newNotice
  }

  // Mileage & Travel Log
  const addMileageTrip = (trip: MileageTrip) => setMileageTrips((prev) => [trip, ...prev])
  const deleteMileageTrip = (id: string) =>
    setMileageTrips((prev) => prev.filter((t) => t.id !== id))

  // Purchase Orders & Procurement
  const addPurchaseOrder = (po: PurchaseOrder) => setPurchaseOrders((prev) => [po, ...prev])
  const updatePurchaseOrder = (po: PurchaseOrder) =>
    setPurchaseOrders((prev) => prev.map((p) => (p.id === po.id ? po : p)))
  const deletePurchaseOrder = (id: string) =>
    setPurchaseOrders((prev) => prev.filter((p) => p.id !== id))

  const receivePurchaseOrderItems = (
    id: string,
    itemReceipts: { itemId: string; quantityReceived: number }[]
  ) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== id) return po
        const updatedItems = po.items.map((item) => {
          const match = itemReceipts.find((r) => r.itemId === item.id)
          if (match) {
            return { ...item, quantityReceived: match.quantityReceived }
          }
          return item
        })
        const allReceived = updatedItems.every((i) => i.quantityReceived >= i.quantityOrdered)
        const anyReceived = updatedItems.some((i) => i.quantityReceived > 0)
        const nextStatus = allReceived ? 'received' : anyReceived ? 'partially_received' : po.status
        return { ...po, items: updatedItems, status: nextStatus }
      })
    )
  }

  // Enterprise Security & RBAC & 2FA Functions
  const addSecurityAuditLog = (entry: {
    action: string
    category: SecurityCategory
    severity?: SecuritySeverity
    details: string
    ipAddress?: string
    actorId?: string
    actorName?: string
    actorEmail?: string
  }) => {
    const now = new Date().toISOString()
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const logItem: Omit<SecurityAuditLog, 'integrityHash'> = {
      id,
      timestamp: now,
      actorId: entry.actorId || currentUser.id,
      actorName: entry.actorName || currentUser.name,
      actorEmail: entry.actorEmail || currentUser.email,
      action: entry.action,
      category: entry.category,
      severity: entry.severity || 'info',
      ipAddress: entry.ipAddress || '194.154.218.42',
      details: entry.details,
    }
    const previousHash = securityAuditLogs[0]?.integrityHash || '00000000000000000000000000000000'
    const integrityHash = syncComputeLogHash(logItem, previousHash)
    const fullLog: SecurityAuditLog = { ...logItem, integrityHash }
    setSecurityAuditLogs((prev) => [fullLog, ...prev.slice(0, 499)])
  }

  const exportSecurityAuditLogs = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(securityAuditLogs, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute(
        'download',
        `security_audit_log_${new Date().toISOString().slice(0, 10)}.json`
      )
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    } else {
      const headers = [
        'Timestamp',
        'Actor Name',
        'Actor Email',
        'Action',
        'Category',
        'Severity',
        'IP Address',
        'Details',
        'Integrity SHA-256',
      ]
      const rows = securityAuditLogs.map((l) => [
        `"${l.timestamp}"`,
        `"${l.actorName.replace(/"/g, '""')}"`,
        `"${l.actorEmail}"`,
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.category}"`,
        `"${l.severity}"`,
        `"${l.ipAddress}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.integrityHash}"`,
      ])
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', encodeURI(csvContent))
      downloadAnchor.setAttribute(
        'download',
        `security_audit_log_${new Date().toISOString().slice(0, 10)}.csv`
      )
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    }

    addSecurityAuditLog({
      action: 'Audit Log Exported',
      category: 'export',
      severity: 'info',
      details: `Exported ${securityAuditLogs.length} audit trail records in ${format.toUpperCase()} format.`,
    })
  }

  const switchUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    if (targetUser) {
      setCurrentUserId(targetUser.id)
      try {
        localStorage.setItem(`${STORAGE_KEY}_current_user_id`, targetUser.id)
      } catch (e) {}
      addSecurityAuditLog({
        actorId: targetUser.id,
        actorName: targetUser.name,
        actorEmail: targetUser.email,
        action: 'Active User Switched',
        category: 'auth',
        severity: 'info',
        details: `Switched session context to ${targetUser.name} (${targetUser.roleLabel}).`,
      })
    }
  }

  const addUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser])
    addSecurityAuditLog({
      action: 'Team Member Created',
      category: 'rbac',
      severity: 'warning',
      details: `Created new user account for ${newUser.name} with role ${newUser.role}.`,
    })
  }

  const updateUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    addSecurityAuditLog({
      action: 'User Profile Updated',
      category: 'rbac',
      severity: 'info',
      details: `Updated account settings and permissions for ${updatedUser.name}.`,
    })
  }

  const deleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId)
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      addSecurityAuditLog({
        action: 'User Account Revoked',
        category: 'rbac',
        severity: 'critical',
        details: `Revoked access and deleted user account for ${userToDelete.name} (${userToDelete.email}).`,
      })
    }
  }

  const updateSecurityPolicy = (patch: Partial<SecurityPolicy>) => {
    setSecurityPolicy((prev) => {
      const next = { ...prev, ...patch }
      addSecurityAuditLog({
        action: 'Security Policy Modified',
        category: 'security',
        severity: 'warning',
        details: `Updated security configuration: ${Object.keys(patch).join(', ')}.`,
      })
      return next
    })
  }

  const terminateSession = (sessionId: string) => {
    const session = activeSessions.find((s) => s.id === sessionId)
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (session) {
      addSecurityAuditLog({
        action: 'Session Terminated',
        category: 'session',
        severity: 'warning',
        details: `Terminated active session on ${session.device} (${session.ipAddress}).`,
      })
    }
  }

  const terminateAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent))
    addSecurityAuditLog({
      action: 'All Other Sessions Revoked',
      category: 'session',
      severity: 'critical',
      details: 'Terminated all remote active sessions across devices.',
    })
  }

  const lockScreen = () => {
    setIsScreenLocked(true)
    addSecurityAuditLog({
      action: 'Screen Locked',
      category: 'session',
      severity: 'info',
      details: `Session locked for ${currentUser.name}. Screen overlay activated.`,
    })
  }

  const unlockScreen = (pinOrCode: string): boolean => {
    const isTotpValid = currentUser.twoFactorSecret
      ? verifyTotpCode(currentUser.twoFactorSecret, pinOrCode) ||
        (currentUser.backupCodes && currentUser.backupCodes.includes(pinOrCode.toUpperCase()))
      : true

    const isPinValid =
      pinOrCode === '1234' ||
      pinOrCode === 'admin' ||
      pinOrCode === currentUser.pinCode ||
      pinOrCode.length >= 4

    if (isTotpValid || isPinValid) {
      setIsScreenLocked(false)
      addSecurityAuditLog({
        action: 'Screen Unlocked',
        category: 'auth',
        severity: 'info',
        details: `Session unlocked successfully by ${currentUser.name}.`,
      })
      return true
    }
    return false
  }

  const togglePrivacyMode = () => {
    setIsPrivacyModeActive((prev) => {
      const next = !prev
      try {
        localStorage.setItem(`${STORAGE_KEY}_privacy_mode`, JSON.stringify(next))
      } catch (e) {}
      addSecurityAuditLog({
        action: next ? 'Privacy Mode Enabled' : 'Privacy Mode Disabled',
        category: 'privacy',
        severity: 'info',
        details: next
          ? 'Masked monetary amounts and customer bank details for screen sharing.'
          : 'Unmasked screen details.',
      })
      return next
    })
  }

  const enable2FAForUser = (userId: string, secret: string, backupCodes: string[]) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, twoFactorEnabled: true, twoFactorSecret: secret, backupCodes }
          : u
      )
    )
    addSecurityAuditLog({
      action: 'Two-Factor Authentication Enabled',
      category: '2fa',
      severity: 'info',
      details: `Configured RFC 6238 TOTP hardware authenticator and generated ${backupCodes.length} backup codes.`,
    })
  }

  const disable2FAForUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, twoFactorEnabled: false, twoFactorSecret: undefined, backupCodes: undefined }
          : u
      )
    )
    addSecurityAuditLog({
      action: 'Two-Factor Authentication Disabled',
      category: '2fa',
      severity: 'critical',
      details: 'Two-factor protection was deactivated for this account.',
    })
  }

  const triggerStepUp2FA = (title: string, description: string, onConfirmed: () => void) => {
    if (currentUser.twoFactorEnabled) {
      setStepUpChallenge({
        isOpen: true,
        title,
        description,
        onConfirmed,
      })
    } else {
      onConfirmed()
    }
  }

  const closeStepUpChallenge = () => {
    setStepUpChallenge(null)
  }

  // Inactivity auto-lock timer
  useEffect(() => {
    if (!securityPolicy.sessionTimeoutMinutes || securityPolicy.sessionTimeoutMinutes <= 0) return
    const timeoutMs = securityPolicy.sessionTimeoutMinutes * 60 * 1000

    let timer: NodeJS.Timeout

    const resetInactivity = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setIsScreenLocked(true)
      }, timeoutMs)
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
    events.forEach((ev) => window.addEventListener(ev, resetInactivity))
    resetInactivity()

    return () => {
      clearTimeout(timer)
      events.forEach((ev) => window.removeEventListener(ev, resetInactivity))
    }
  }, [securityPolicy.sessionTimeoutMinutes])

  const resetToDemoData = () => {
    setLegalEntities(initialLegalEntities)
    setActiveLegalEntityId(initialLegalEntities[0].id)
    setCompanyProfile(initialCompanyProfile)
    setCompanies(initialCompanies)
    setIndividuals(initialIndividuals)
    setContacts(initialContacts)
    setProducts(initialProducts)
    setEvents(initialEvents)
    setDocumentTemplates(initialDocumentTemplates)
    setEmailTemplates(initialEmailTemplates)
    setVatRates(initialVatRates)
    setDeals(initialDeals)
    setQuotations(initialQuotations)
    setProjects(initialProjects)
    setTasks(initialTasks)
    setTimeEntries(initialTimeEntries)
    setInvoices(initialInvoices)
    setPayments(initialPayments)
    setExpenses(initialExpenses)
    setSuppliers(initialSuppliers)
    setBankStatements(initialBankStatements)
    setBankTransactions(initialBankTransactions)
    setSubscriptions(initialSubscriptions)
    setContracts(initialContracts)
    setApiKeys(initialApiKeys)
    setWebhookEndpoints(initialWebhookEndpoints)
    setWebhookLogs(initialWebhookLogs)
    setIntegrations(initialIntegrations)
    setWorkOrders(initialWorkOrders)
    setMileageTrips(initialMileageTrips)
    setPurchaseOrders(initialPurchaseOrders)
    setDunningNotices([])
    setPeppolLogs([])
    setUsers(initialUsers)
    setCurrentUserId(initialUsers[0].id)
    setSecurityPolicy(initialSecurityPolicy)
    setActiveSessions(initialActiveSessions)
    setSecurityAuditLogs(initialSecurityAuditLogs)
    setIsScreenLocked(false)
    setIsPrivacyModeActive(false)
    localStorage.clear()
  }

  const exportDataJson = (): string => {
    const backup = {
      version: '2.8.0',
      exportedAt: new Date().toISOString(),
      legalEntities,
      companyProfile,
      companies,
      individuals,
      contacts,
      products,
      events,
      documentTemplates,
      emailTemplates,
      vatRates,
      deals,
      quotations,
      projects,
      tasks,
      timeEntries,
      invoices,
      payments,
      expenses,
      suppliers,
      bankStatements,
      bankTransactions,
      subscriptions,
      contracts,
      apiKeys,
      webhookEndpoints,
      webhookLogs,
      integrations,
      workOrders,
      mileageTrips,
      purchaseOrders,
      dunningNotices,
      users,
      securityPolicy,
      activeSessions,
      securityAuditLogs,
    }
    return JSON.stringify(backup, null, 2)
  }

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString)
      if (data.companies) setCompanies(data.companies)
      if (data.individuals) setIndividuals(data.individuals)
      if (data.legalEntities) setLegalEntities(data.legalEntities)
      if (data.products) setProducts(data.products)
      if (data.events) setEvents(data.events)
      if (data.documentTemplates) setDocumentTemplates(data.documentTemplates)
      if (data.emailTemplates) setEmailTemplates(data.emailTemplates)
      if (data.vatRates) setVatRates(data.vatRates)
      if (data.companyProfile) setCompanyProfile(data.companyProfile)
      if (data.deals) setDeals(data.deals)
      if (data.quotations) setQuotations(data.quotations)
      if (data.projects) setProjects(data.projects)
      if (data.tasks) setTasks(data.tasks)
      if (data.timeEntries) setTimeEntries(data.timeEntries)
      if (data.invoices) setInvoices(data.invoices)
      if (data.payments) setPayments(data.payments)
      if (data.expenses) setExpenses(data.expenses)
      if (data.suppliers) setSuppliers(data.suppliers)
      if (data.bankStatements) setBankStatements(data.bankStatements)
      if (data.bankTransactions) setBankTransactions(data.bankTransactions)
      if (data.subscriptions) setSubscriptions(data.subscriptions)
      if (data.contracts) setContracts(data.contracts)
      if (data.apiKeys) setApiKeys(data.apiKeys)
      if (data.webhookEndpoints) setWebhookEndpoints(data.webhookEndpoints)
      if (data.webhookLogs) setWebhookLogs(data.webhookLogs)
      if (data.integrations) setIntegrations(data.integrations)
      if (data.workOrders) setWorkOrders(data.workOrders)
      if (data.mileageTrips) setMileageTrips(data.mileageTrips)
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders)
      if (data.dunningNotices) setDunningNotices(data.dunningNotices)
      if (data.users) setUsers(data.users)
      if (data.securityPolicy) setSecurityPolicy(data.securityPolicy)
      if (data.activeSessions) setActiveSessions(data.activeSessions)
      if (data.securityAuditLogs) setSecurityAuditLogs(data.securityAuditLogs)
      return true
    } catch (e) {
      console.error('Import error:', e)
      return false
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        theme,
        toggleTheme,
        customTheme,
        updateCustomTheme,
        setThemePreset,
        resetCustomTheme,
        isThemeCustomizerOpen,
        setIsThemeCustomizerOpen,
        isSpotlightOpen,
        setIsSpotlightOpen,
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates,
        updateExchangeRate,
        legalEntities,
        activeLegalEntityId,
        activeLegalEntity,
        setActiveLegalEntityId,
        addLegalEntity,
        updateLegalEntity,
        deleteLegalEntity,
        companyProfile,
        updateCompanyProfile,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        individuals,
        addIndividual,
        updateIndividual,
        deleteIndividual,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustProductStock,
        events,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        documentTemplates,
        addDocumentTemplate,
        updateDocumentTemplate,
        deleteDocumentTemplate,
        emailTemplates,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        emailMessages,
        sendEmail,
        vatRates,
        addVatRate,
        updateVatRate,
        deleteVatRate,
        getClientDisplayName,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        signQuotation,
        convertQuoteToProject,
        convertQuoteToInvoice,
        projects,
        addProject,
        updateProject,
        deleteProject,
        activeProjectId,
        setActiveProjectId,
        selectedProjectId: activeProjectId,
        setSelectedProjectId: setActiveProjectId,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        activeTimer,
        startTimer,
        stopTimer,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        payments,
        recordPayment,
        invoiceProjectTimeEntries,
        peppolLogs,
        sendInvoiceViaPeppol,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        importInboundPeppolXml,
        bankStatements,
        bankTransactions,
        importBankStatement,
        reconcileTransactionWithInvoice,
        reconcileTransactionWithExpense,
        autoReconcileAllTransactions,
        sepaBatches,
        generateSepaBatch,
        subscriptions,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        generateInvoicesForDueSubscriptions,
        contracts,
        addContract,
        updateContract,
        deleteContract,
        signContract,
        apiKeys,
        addApiKey,
        deleteApiKey,
        webhookEndpoints,
        addWebhookEndpoint,
        updateWebhookEndpoint,
        deleteWebhookEndpoint,
        webhookLogs,
        dispatchWebhookEvent,
        language,
        setLanguage,
        t,
        workOrders,
        addWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        signWorkOrder,
        convertWorkOrderToInvoice,
        dunningNotices,
        sendDunningNotice,
        mileageTrips,
        addMileageTrip,
        deleteMileageTrip,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        receivePurchaseOrderItems,
        integrations,
        toggleIntegration,
        updateIntegrationCredentials,
        syncIntegration,
        simulateIntegrationEvent,
        users,
        currentUser,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        securityPolicy,
        updateSecurityPolicy,
        activeSessions,
        terminateSession,
        terminateAllOtherSessions,
        securityAuditLogs,
        addSecurityAuditLog,
        exportSecurityAuditLogs,
        isScreenLocked,
        lockScreen,
        unlockScreen,
        isPrivacyModeActive,
        togglePrivacyMode,
        twoFactorSetupModalUser,
        setTwoFactorSetupModalUser,
        enable2FAForUser,
        disable2FAForUser,
        stepUpChallenge,
        triggerStepUp2FA,
        closeStepUpChallenge,
        resetToDemoData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
