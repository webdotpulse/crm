import {
  Company,
  IndividualClient,
  Contact,
  Deal,
  Quotation,
  Project,
  Task,
  TimeEntry,
  Invoice,
  Payment,
  CompanyProfile,
  LegalEntity,
  Product,
  CalendarEvent,
  DocumentTemplate,
  EmailTemplate,
  VatRate,
  Expense,
  Supplier,
  BankStatement,
  BankTransaction,
  SubscriptionContract,
  Contract,
  ApiKey,
  WebhookEndpoint,
  WebhookEventLog,
  IntegrationConfig,
  WorkOrder,
  MileageTrip,
  PurchaseOrder,
  UserAccount,
  SecurityPolicy,
  ActiveSession,
  SecurityAuditLog,
  SupportTicket,
  CannedResponse,
  StaffMemberCapacity,
  LeaveRequest,
  PublicHoliday,
  ReimbursementBatch,
  WarehouseLocation,
  StockTransferOrder,
  SerialBatchItem,
  ScheduledDigestConfig,
  CustomReportConfig,
  OssVatCountryRate,
  WysiwygDocumentTemplate,
} from '../types'

// ============================================================================
// 1. COMPANY PROFILE & LEGAL ENTITIES
// ============================================================================

export const initialCompanyProfile: CompanyProfile = {
  name: 'PulseWork Solutions BV',
  legalName: 'PulseWork Solutions BV',
  vatNumber: 'BE0849294901',
  peppolScheme: '0208',
  peppolEndpoint: '0849294901',
  email: 'billing@pulsework.io',
  phone: '+32 2 555 0199',
  website: 'https://pulsework.io',
  address: 'Keizerslaan 14, Bus 4B',
  city: 'Brussels',
  postalCode: '1000',
  country: 'Belgium',
  countryCode: 'BE',
  iban: 'BE68 5390 0754 7034',
  bic: 'GKCCBEBB',
  defaultVatRate: 21,
  defaultCurrency: 'EUR',
  peppolAccessPointName: 'Billit AS4 Access Point Gateway',
  peppolAccessPointUrl: 'https://api.billit.be/v1/peppol/as4',
  peppolApiKey: '',
  peppolSenderId: 'iso6523-actorid-upis::0208:0849294901',
}

export const initialLegalEntities: LegalEntity[] = [
  {
    id: 'ent-be-1',
    name: 'PulseWork Belgium HQ',
    legalName: 'PulseWork Solutions BV',
    vatNumber: 'BE0849294901',
    peppolScheme: '0208',
    peppolEndpoint: '0849294901',
    email: 'billing@pulsework.io',
    phone: '+32 2 555 0199',
    website: 'https://pulsework.io',
    address: 'Keizerslaan 14, Bus 4B',
    city: 'Brussels',
    postalCode: '1000',
    country: 'Belgium',
    countryCode: 'BE',
    iban: 'BE68 5390 0754 7034',
    bic: 'GKCCBEBB',
    defaultCurrency: 'EUR',
    invoicePrefix: 'BE-INV-',
    isDefault: true,
    accentColor: '#3f78e0',
  },
]

// ============================================================================
// 2. CORE CRM DATA (CLEAN EMPTY COLLECTIONS)
// ============================================================================

export const initialCompanies: Company[] = []
export const initialIndividuals: IndividualClient[] = []
export const initialContacts: Contact[] = []
export const initialProducts: Product[] = []
export const initialEvents: CalendarEvent[] = []
export const initialDeals: Deal[] = []
export const initialQuotations: Quotation[] = []
export const initialProjects: Project[] = []
export const initialTasks: Task[] = []
export const initialTimeEntries: TimeEntry[] = []
export const initialInvoices: Invoice[] = []
export const initialPayments: Payment[] = []
export const initialSuppliers: Supplier[] = []
export const initialExpenses: Expense[] = []
export const initialBankStatements: BankStatement[] = []
export const initialBankTransactions: BankTransaction[] = []
export const initialSubscriptions: SubscriptionContract[] = []
export const initialContracts: Contract[] = []
export const initialApiKeys: ApiKey[] = []
export const initialWebhookEndpoints: WebhookEndpoint[] = []
export const initialWebhookLogs: WebhookEventLog[] = []
export const initialWorkOrders: WorkOrder[] = []
export const initialMileageTrips: MileageTrip[] = []
export const initialPurchaseOrders: PurchaseOrder[] = []
export const initialTickets: SupportTicket[] = []
export const initialLeaveRequests: LeaveRequest[] = []
export const initialReimbursementBatches: ReimbursementBatch[] = []
export const initialStockTransfers: StockTransferOrder[] = []
export const initialSerialBatchItems: SerialBatchItem[] = []

// ============================================================================
// 3. SYSTEM TEMPLATES & VAT CONFIGURATION
// ============================================================================

export const initialDocumentTemplates: DocumentTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Standard Commercial Proposal',
    type: 'quotation',
    category: 'web_development',
    title: 'Proposal for Professional Services',
    description: 'Standard proposal including deliverables, timeline, milestones, and payment schedule.',
    defaultTerms: '30% upfront deposit on contract signing, 40% on milestone delivery, 30% on completion. 30 days payment term.',
    defaultNotes: 'All intellectual property rights transferred upon final settlement.',
    defaultVatRate: 21,
    items: [
      {
        id: 'ti-1',
        description: 'Professional Consulting & Technical Implementation',
        quantity: 10,
        unit: 'hours',
        unitPrice: 110.0,
        discountPercent: 0,
        vatRate: 21,
        total: 1100.0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-2',
    name: 'Maintenance & SLA Support Agreement',
    type: 'quotation',
    category: 'retainer',
    title: 'Software Maintenance & SLA Agreement',
    description: 'Continuous monitoring, updates, automated backups, and dedicated support hours.',
    defaultTerms: 'Billed monthly in advance via SEPA direct debit. 30 days cancellation notice.',
    defaultNotes: 'Includes priority response time during business hours.',
    defaultVatRate: 21,
    items: [
      {
        id: 'ti-2',
        description: 'Monthly Maintenance & Support SLA',
        quantity: 1,
        unit: 'month',
        unitPrice: 450.0,
        discountPercent: 0,
        vatRate: 21,
        total: 450.0,
      },
    ],
    createdAt: new Date().toISOString(),
  },
]

export const initialEmailTemplates: EmailTemplate[] = [
  {
    id: 'et-1',
    name: 'Send Commercial Quotation',
    type: 'quote_send',
    subject: 'Quotation {{document_number}} from {{company_name}} — {{title}}',
    bodyHtml: `Dear {{client_name}},

Thank you for the opportunity to partner with you. We are pleased to present our formal quotation **{{document_number}}** for a total amount of **{{total_amount}}**.

You can review the full project proposal and digitally approve it online at your convenience:
👉 [Click here to review and sign your quotation online]({{signature_link}})

This proposal is valid until **{{due_date}}**. Should you have any questions or require custom adjustments, please feel free to reach out.

Kind regards,
**{{company_name}}**
{{company_email}} | {{company_phone}}`,
    variables: ['client_name', 'document_number', 'title', 'total_amount', 'due_date', 'signature_link', 'company_name', 'company_email', 'company_phone'],
  },
  {
    id: 'et-2',
    name: 'Send Invoice with Peppol Reference',
    type: 'invoice_send',
    subject: 'Invoice {{document_number}} from {{company_name}} [Ref: {{payment_reference}}]',
    bodyHtml: `Dear {{client_name}},

Please find attached invoice **{{document_number}}** amounting to **{{total_amount}}**, issued on {{issue_date}} with due date **{{due_date}}**.

Electronic Invoicing Notice:
This invoice has been prepared according to the European Standard EN 16931 and transmitted via the OpenPeppol e-Delivery Network.

Payment Coordinates:
- Bank Account (IBAN): {{company_iban}}
- BIC / SWIFT: {{company_bic}}
- Structured Reference: **{{payment_reference}}**

Thank you for your prompt settlement!

Kind regards,
**{{company_name}} Billing Team**`,
    variables: ['client_name', 'document_number', 'total_amount', 'issue_date', 'due_date', 'payment_reference', 'company_iban', 'company_bic', 'company_name'],
  },
  {
    id: 'et-3',
    name: 'Friendly Payment Reminder',
    type: 'payment_reminder',
    subject: 'Friendly Reminder: Invoice {{document_number}} is due for payment',
    bodyHtml: `Dear {{client_name}},

We hope you are doing well. According to our accounts, invoice **{{document_number}}** for **{{total_amount}}** was due on **{{due_date}}** and remains outstanding.

Could you please verify if payment has been processed?

Payment Details:
- Amount: **{{total_amount}}**
- Structured Reference: **{{payment_reference}}**
- IBAN: {{company_iban}}

If payment has recently been made, please disregard this message.

Kind regards,
**{{company_name}} Accounting**`,
    variables: ['client_name', 'document_number', 'total_amount', 'due_date', 'payment_reference', 'company_iban', 'company_name'],
  },
]

export const initialVatRates: VatRate[] = [
  { id: 'vat-be-21', name: 'Standard (BE/NL)', rate: 21, countryCode: 'BE', taxCategory: 'S', isDefault: true, description: 'Standard VAT rate for services and goods' },
  { id: 'vat-be-12', name: 'Intermediate (BE)', rate: 12, countryCode: 'BE', taxCategory: 'AA', isDefault: false, description: 'Restaurant, social housing' },
  { id: 'vat-be-6', name: 'Reduced (BE)', rate: 6, countryCode: 'BE', taxCategory: 'AA', isDefault: false, description: 'Renovation > 10 years, books, basic food' },
  { id: 'vat-eu-0-ae', name: 'Reverse Charge (Intra-Community 0%)', rate: 0, countryCode: 'EU', taxCategory: 'AE', isDefault: false, description: 'B2B cross-border reverse charge within EU' },
  { id: 'vat-eu-0-z', name: 'Zero-Rated (Export 0%)', rate: 0, countryCode: 'EU', taxCategory: 'Z', isDefault: false, description: 'Export outside EU' },
  { id: 'vat-de-19', name: 'Standard (DE 19%)', rate: 19, countryCode: 'DE', taxCategory: 'S', isDefault: false, description: 'Standard VAT rate Germany' },
  { id: 'vat-nl-9', name: 'Reduced (NL 9%)', rate: 9, countryCode: 'NL', taxCategory: 'AA', isDefault: false, description: 'Reduced VAT rate Netherlands' },
]

export const initialCannedResponses: CannedResponse[] = [
  {
    id: 'canned-1',
    title: 'Standard Greeting & Ticket Acknowledgement',
    category: 'general',
    shortcut: '!hello',
    content: 'Hello, thank you for reaching out to PulseWork Support. We have received your request and our team is actively reviewing the details. We will update you shortly.',
  },
  {
    id: 'canned-2',
    title: 'Invoice / Peppol Delivery Confirmation',
    category: 'billing',
    shortcut: '!peppol',
    content: 'Thank you for your inquiry. We have verified your electronic invoice transmission. The UBL 2.1 XML document has been validated and accepted by the Peppol Access Point network.',
  },
  {
    id: 'canned-3',
    title: 'Ticket Resolved Notification',
    category: 'general',
    shortcut: '!resolved',
    content: 'We are pleased to inform you that your request has been fully resolved. If you have any further questions or require additional assistance, please feel free to reopen this ticket or reply to this message.',
  },
]

export const initialPublicHolidays: PublicHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day (Nieuwjaar)", countryCode: 'BE' },
  { date: '2026-04-06', name: 'Easter Monday (Paasmaandag)', countryCode: 'BE' },
  { date: '2026-05-01', name: 'Labour Day (Dag van de Arbeid)', countryCode: 'BE' },
  { date: '2026-05-14', name: 'Ascension Day (O.L.H. Hemelvaart)', countryCode: 'BE' },
  { date: '2026-05-25', name: 'Whit Monday (Pinkstermaandag)', countryCode: 'BE' },
  { date: '2026-07-21', name: 'Belgian National Holiday (Nationale Feestdag)', countryCode: 'BE' },
  { date: '2026-08-15', name: 'Assumption of Mary (O.L.V. Hemelvaart)', countryCode: 'BE' },
  { date: '2026-11-01', name: "All Saints' Day (Allerheiligen)", countryCode: 'BE' },
  { date: '2026-11-11', name: 'Armistice Day (Wapenstilstand)', countryCode: 'BE' },
  { date: '2026-12-25', name: 'Christmas Day (Kerstmis)', countryCode: 'BE' },
]

export const initialWarehouseLocations: WarehouseLocation[] = [
  {
    id: 'loc-main',
    name: 'Main Central Warehouse',
    code: 'WH-MAIN',
    type: 'warehouse',
    address: 'Central Logistics Center',
    city: 'Brussels',
    managerName: 'Operations Lead',
    isActive: true,
  },
]

export const initialScheduledDigests: ScheduledDigestConfig[] = [
  {
    id: 'dig-weekly-exec',
    title: 'Executive Financial & Pipeline Digest',
    cadence: 'weekly',
    recipients: ['admin@pulsework.local'],
    includeKpis: true,
    includeOverdueAlerts: true,
    includePnlSummary: true,
    includeTopDeals: true,
    nextSendDate: '2026-09-01',
    enabled: false,
  },
]

export const initialCustomReports: CustomReportConfig[] = [
  {
    id: 'rep-vat-quarterly',
    name: 'Quarterly VAT & Financial Audit',
    dimension: 'month',
    metric: 'revenue',
    dateRange: 'this_year',
    chartType: 'bar',
  },
]

export const initialOssVatRates: OssVatCountryRate[] = [
  { countryCode: 'NL', countryName: 'Netherlands', standardVatRate: 21, flagEmoji: '🇳🇱' },
  { countryCode: 'FR', countryName: 'France', standardVatRate: 20, flagEmoji: '🇫🇷' },
  { countryCode: 'DE', countryName: 'Germany', standardVatRate: 19, flagEmoji: '🇩🇪' },
  { countryCode: 'ES', countryName: 'Spain', standardVatRate: 21, flagEmoji: '🇪🇸' },
  { countryCode: 'IT', countryName: 'Italy', standardVatRate: 22, flagEmoji: '🇮🇹' },
  { countryCode: 'LU', countryName: 'Luxembourg', standardVatRate: 17, flagEmoji: '🇱🇺' },
  { countryCode: 'AT', countryName: 'Austria', standardVatRate: 20, flagEmoji: '🇦🇹' },
  { countryCode: 'IE', countryName: 'Ireland', standardVatRate: 23, flagEmoji: '🇮🇪' },
]

export const initialWysiwygTemplates: WysiwygDocumentTemplate[] = [
  {
    id: 'wysiwyg-be-default',
    name: 'Modern Executive (Belgian Standard)',
    documentType: 'invoice',
    isDefault: true,
    createdAt: new Date().toISOString(),
    styleConfig: {
      primaryColor: '#3f78e0',
      secondaryColor: '#2b3445',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 'standard',
      headerLayout: 'modern_minimal',
      showLogo: true,
      logoPosition: 'left',
      logoSize: 'medium',
      showEpcQrCode: true,
      qrPosition: 'bottom_right',
      showFooterLegalText: true,
      customFooterText: 'PulseWork Solutions BV • KEIZERSLAAN 14, 1000 BRUSSELS • RPR BRUSSEL • BE 0849.294.901',
      showItemDescriptions: true,
      showItemUnits: true,
      tableHeaderBg: '#f1f5f9',
      borderRadius: 8,
      pageMarginMm: 15,
    },
  },
]

// ============================================================================
// 4. SECURITY, RBAC & USER ACCOUNTS (EMPTY FOR FIRST-RUN INITIALIZATION)
// ============================================================================

export const initialUsers: UserAccount[] = []

export const initialStaffCapacities: StaffMemberCapacity[] = []

export const initialSecurityPolicy: SecurityPolicy = {
  passwordMinLength: 10,
  requireNumbers: true,
  requireSymbols: true,
  sessionTimeoutMinutes: 30,
  maxFailedAttempts: 5,
  enforce2faOrgWide: false,
  stepUp2faForFinancials: false,
  stepUp2faForPeppol: false,
  stepUp2faForApiKeys: false,
  screenSharePrivacyDefault: false,
  auditLoggingRetentionDays: 365,
}

export const initialActiveSessions: ActiveSession[] = []

export const initialSecurityAuditLogs: SecurityAuditLog[] = []

// ============================================================================
// 5. INTEGRATIONS HUB (CLEAN READY-TO-CONNECT STATE)
// ============================================================================

export const initialIntegrations: IntegrationConfig[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar Sync',
    tagline: 'Two-way calendar sync',
    description: 'Two-way synchronization between CRM appointments, site visits, and Google Workspace calendar.',
    category: 'calendar',
    enabled: false,
    status: 'disconnected',
    icon: '📅',
    features: ['Appointment sync', 'Site visit scheduling', 'Technician planner sync'],
    credentials: {
      accountEmail: '',
      calendarId: 'primary',
      autoSyncEvents: true,
    },
    settingFields: [
      { key: 'accountEmail', label: 'Google Account Email', type: 'text', placeholder: 'user@organization.com', required: true },
      { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', required: true },
      { key: 'autoSyncEvents', label: 'Auto-sync events bi-directionally', type: 'checkbox' },
    ],
    logs: [],
  },
  {
    id: 'octopus',
    name: 'Octopus Accountancy Gateway',
    tagline: 'Belgian bookkeeping bridge',
    description: 'Real-time sales & purchase invoice journal synchronization with Octopus Accountancy software.',
    category: 'accounting',
    enabled: false,
    status: 'disconnected',
    icon: '🐙',
    features: ['Sales journals 700000', 'Purchase journals 600000', 'Automatic VAT grid posting'],
    credentials: {
      dossierNumber: '',
      apiKey: '',
      salesJournal: '700000',
      purchaseJournal: '600000',
    },
    settingFields: [
      { key: 'dossierNumber', label: 'Octopus Dossier Number', type: 'text', placeholder: 'BE-OCT-00000', required: true },
      { key: 'apiKey', label: 'Octopus API Access Token', type: 'password', required: true },
      { key: 'salesJournal', label: 'Default Sales Journal (Grootboek 70xxxx)', type: 'text', placeholder: '700000' },
      { key: 'purchaseJournal', label: 'Default Purchase Journal (Grootboek 60xxxx)', type: 'text', placeholder: '600000' },
    ],
    logs: [],
  },
  {
    id: 'ponto',
    name: 'Ponto PSD2 Open Banking',
    tagline: 'Automated bank feeds',
    description: 'Automated bank account transaction feeds via Isabel Group Ponto PSD2 API for instant reconciliation.',
    category: 'banking',
    enabled: false,
    status: 'disconnected',
    icon: '🏦',
    features: ['Live IBAN feed', 'Belgian OGM matching', 'Instant statement ingestion'],
    credentials: {
      clientId: '',
      clientSecret: '',
      connectedAccounts: '',
    },
    settingFields: [
      { key: 'clientId', label: 'Ponto Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Ponto Client Secret', type: 'password', required: true },
      { key: 'connectedAccounts', label: 'Authorized IBAN Accounts', type: 'text', placeholder: 'BE68 5390 0754 7034' },
    ],
    logs: [],
  },
  {
    id: 'solvari',
    name: 'Solvari Lead Generator Webhook',
    tagline: 'Inbound construction leads',
    description: 'Inbound webhook integration for home improvement & construction leads from Solvari.be/nl.',
    category: 'leads',
    enabled: false,
    status: 'disconnected',
    icon: '⚡',
    features: ['Instant CRM lead creation', 'Pipeline deal value auto-assignment', 'SMS notification trigger'],
    credentials: {
      partnerId: '',
      webhookSecret: '',
      autoCreateDeals: true,
      defaultPipelineStage: 'lead',
    },
    settingFields: [
      { key: 'partnerId', label: 'Solvari Partner ID', type: 'text', required: true },
      { key: 'webhookSecret', label: 'HMAC Webhook Secret', type: 'password', required: true },
      { key: 'autoCreateDeals', label: 'Auto-create Sales Deal in Pipeline', type: 'checkbox' },
    ],
    logs: [],
  },
  {
    id: 'exact_online',
    name: 'Exact Online Enterprise ERP',
    tagline: 'Enterprise general ledger',
    description: 'Bi-directional general ledger synchronization, inventory management, and accounts receivable matching.',
    category: 'accounting',
    enabled: false,
    status: 'disconnected',
    icon: '📊',
    features: ['Multi-currency GL sync', 'Stock level synchronization', 'Debtor aging analysis'],
    credentials: {
      divisionId: '',
      clientId: '',
      clientSecret: '',
      environment: 'https://start.exactonline.be',
    },
    settingFields: [
      { key: 'divisionId', label: 'Exact Online Division ID', type: 'text', required: true },
      { key: 'clientId', label: 'OAuth2 Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'OAuth2 Client Secret', type: 'password', required: true },
      {
        key: 'environment',
        label: 'Regional Endpoint',
        type: 'select',
        options: [
          { label: 'Exact Online Belgium (start.exactonline.be)', value: 'https://start.exactonline.be' },
          { label: 'Exact Online Netherlands (start.exactonline.nl)', value: 'https://start.exactonline.nl' },
        ],
      },
    ],
    logs: [],
  },
  {
    id: 'yuki',
    name: 'Yuki Financial Processing',
    tagline: 'Document accounting sync',
    description: 'Automated UBL 2.1 & Peppol BIS 3.0 document drop into Yuki accounting domains.',
    category: 'accounting',
    enabled: false,
    status: 'disconnected',
    icon: '📑',
    features: ['Direct UBL 2.1 delivery', 'Peppol BIS 3.0 gateway', 'Automatic expense reconciliation'],
    credentials: {
      domainName: '',
      accessKey: '',
      administrationId: '',
    },
    settingFields: [
      { key: 'domainName', label: 'Yuki Domain Name', type: 'text', placeholder: 'enterprise.yukiworks.be', required: true },
      { key: 'accessKey', label: 'Webservice Access Key (SOAP/REST)', type: 'password', required: true },
      { key: 'administrationId', label: 'Administration GUID', type: 'text', required: true },
    ],
    logs: [],
  },
  {
    id: 'mollie',
    name: 'Mollie Payments (Bancontact & iDEAL)',
    tagline: 'Online payment gateways',
    description: 'Instant online payment links on quotes and invoices supporting Bancontact, iDEAL, and Payconiq.',
    category: 'payments',
    enabled: false,
    status: 'disconnected',
    icon: '💳',
    features: ['Bancontact & Payconiq', 'iDEAL (NL)', 'Automated invoice settlement'],
    credentials: {
      apiKey: '',
      profileId: '',
      testMode: false,
    },
    settingFields: [
      { key: 'apiKey', label: 'Mollie API Key (Live or Test)', type: 'password', required: true },
      { key: 'profileId', label: 'Mollie Website Profile ID', type: 'text', placeholder: 'pfl_...' },
      { key: 'testMode', label: 'Use Test Sandbox Mode', type: 'checkbox' },
    ],
    logs: [],
  },
  {
    id: 'stripe',
    name: 'Stripe International Card & SEPA Gateway',
    tagline: 'Credit card & SEPA processing',
    description: 'Accept credit card payments, Apple Pay, Google Pay, and recurring SEPA Direct Debit mandates.',
    category: 'payments',
    enabled: false,
    status: 'disconnected',
    icon: '💳',
    features: ['Visa / Mastercard / Amex', 'Apple Pay & Google Pay', 'SEPA Direct Debit subscriptions'],
    credentials: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    settingFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', required: true },
      { key: 'secretKey', label: 'Secret API Key', type: 'password', placeholder: 'sk_live_...', required: true },
      { key: 'webhookSecret', label: 'Signing Webhook Secret', type: 'password', placeholder: 'whsec_...' },
    ],
    logs: [],
  },
]
