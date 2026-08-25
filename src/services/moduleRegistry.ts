import { ModuleId, ModulePresetId, ModuleInfo, ModuleSettings } from '../types'

export const MODULE_REGISTRY: ModuleInfo[] = [
  // 1. Core & CRM
  {
    id: 'crm',
    name: 'CRM & Client Directory',
    tagline: 'B2B Companies, B2C Individuals & Peppol Directory',
    description: 'Centralized client database with automatic Belgian KBO / Dutch KvK lookup and Peppol directory discovery.',
    category: 'core',
    icon: 'Building2',
    enabled: true,
    isCore: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduler',
    tagline: 'Client Meetings, Deadlines & Work Schedule',
    description: 'Visual calendar planner synced with Google Calendar, project milestones, client follow-ups, and field appointments.',
    category: 'core',
    icon: 'Calendar',
    enabled: true,
    isCore: false,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer'],
  },

  // 2. Sales & Commercial
  {
    id: 'deals',
    name: 'Sales Pipeline (Kanban)',
    tagline: 'Opportunity Stages, Win Probabilities & Forecasts',
    description: 'Visual Drag-and-Drop deals pipeline with automated probability weighting, stage conversion, and AI win predictions.',
    category: 'sales_operations',
    icon: 'TrendingUp',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'wholesale'],
  },
  {
    id: 'quotes',
    name: 'Interactive Quotes & Proposals',
    tagline: 'Dynamic Web Proposals with Digital Sign-on-Screen',
    description: 'Send interactive web proposals where clients choose add-on options, adjust quantities in real time, and sign legally.',
    category: 'sales_operations',
    icon: 'FileText',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'contracts',
    name: 'Contracts & SLAs',
    tagline: 'NDAs, Master Service Agreements & Handover Signatures',
    description: 'Digital contract builder with SHA-256 tamper-evident digital signature audit trail and automated renewal tracking.',
    category: 'sales_operations',
    icon: 'PenTool',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'wholesale'],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & Retainers (MRR)',
    tagline: 'Automated Recurring Billing & Retention Analytics',
    description: 'Manage recurring subscription retainers with automated invoice generation and Peppol transmission.',
    category: 'sales_operations',
    icon: 'RefreshCw',
    enabled: true,
    recommendedFor: ['all', 'digital_agency'],
  },
  {
    id: 'workorders',
    name: 'Digital Field Work Orders',
    tagline: 'Mobile Werkbonnen with Material Logs & Sign-on-Glass',
    description: 'Technician work orders with labor logs, van stock parts consumption, photo attachments, and instant client sign-off.',
    category: 'sales_operations',
    icon: 'Wrench',
    enabled: true,
    recommendedFor: ['all', 'field_service'],
  },

  // 3. Operations & Delivery
  {
    id: 'projects',
    name: 'Projects & Task Management',
    tagline: 'Gantt Timelines, Task Kanban & Time Tracking',
    description: 'Manage delivery milestones, billable hour budgets, sprint boards, and convert logged hours to invoices with 1 click.',
    category: 'sales_operations',
    icon: 'FolderKanban',
    enabled: true,
    recommendedFor: ['all', 'digital_agency'],
  },
  {
    id: 'products',
    name: 'Products & Catalog',
    tagline: 'Service Rates, Hardware & Digital Licenses',
    description: 'Multi-category price list with buy/sell margins, default VAT rates, and stock alerts.',
    category: 'logistics',
    icon: 'Package',
    enabled: true,
    recommendedFor: ['all', 'field_service', 'wholesale'],
  },
  {
    id: 'inventory_multi',
    name: 'Multi-Location Stock & Serials',
    tagline: 'Warehouses, Service Vans, QR Scanner & Serial Batches',
    description: 'Track inventory across central depots and mobile service vans, execute stock transfers, and scan QR barcodes live.',
    category: 'logistics',
    icon: 'Boxes',
    enabled: true,
    recommendedFor: ['all', 'field_service', 'wholesale'],
  },
  {
    id: 'procurement',
    name: 'Purchase Orders & 3-Way Match',
    tagline: 'Bestelbonnen, Supplier Tracking & Receipt Verification',
    description: 'Issue purchase orders to suppliers, log partial receipts, and perform 3-way match against incoming invoices.',
    category: 'logistics',
    icon: 'Truck',
    enabled: true,
    recommendedFor: ['all', 'field_service', 'wholesale'],
  },
  {
    id: 'mileage',
    name: 'Vehicle Mileage & Travel Log',
    tagline: 'Official Statutory Km Rates (€0.4415/km) & Trip Tracking',
    description: 'Compliant mileage tracking for personal vehicles, company cars, and bicycle allowances with SEPA reimbursement export.',
    category: 'finance_tax',
    icon: 'Car',
    enabled: true,
    recommendedFor: ['all', 'field_service', 'freelancer'],
  },

  // 4. Finance & Taxation
  {
    id: 'invoices',
    name: 'Invoices & Billing Hub',
    tagline: 'E-Invoicing, Structured OGM References & Payment Tracking',
    description: 'Commercial invoice editor with EU Peppol BIS 3.0 UBL dispatch, OGM structured references, and multi-currency billing.',
    category: 'finance_tax',
    icon: 'Receipt',
    enabled: true,
    isCore: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'dunning',
    name: 'Automated Dunning & Debt Collection',
    tagline: 'Book XIX CEL Recovery Fees (€40) & Bailiff Escalation',
    description: 'Automated 3-stage debt recovery pipeline with official late payment interest and certified lawyer/bailiff dossier export.',
    category: 'finance_tax',
    icon: 'ShieldAlert',
    enabled: true,
    recommendedFor: ['all', 'field_service', 'wholesale', 'digital_agency'],
  },
  {
    id: 'expenses',
    name: 'Expenses & Supplier Bills',
    tagline: 'P&L Purchases, Cost Center Tagging & Receipt OCR',
    description: 'Inbound supplier bill tracking with auto-categorization into Belgian general accounting grids and VAT recovery.',
    category: 'finance_tax',
    icon: 'FileSpreadsheet',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'banking',
    name: 'Bank Reconciliation & SEPA Direct Debit',
    tagline: 'CODA / CAMT.053 Parser & Pain.008 Batch Collections',
    description: 'Automatic reconciliation of bank statement lines via structured references (+++090/9337/55493+++) and SEPA direct debit.',
    category: 'finance_tax',
    icon: 'Landmark',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'cashflow',
    name: 'AI Cash Flow & Liquidity Forecast',
    tagline: '30-60-90 Day Runway Intelligence & VAT Reserves',
    description: 'Real-time projected net cash balance factoring in scheduled income, recurring expenses, and tax obligations.',
    category: 'finance_tax',
    icon: 'Sparkles',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'freelancer', 'wholesale'],
  },
  {
    id: 'accountant',
    name: 'Belgian VAT & EU OSS Tax Engine',
    tagline: 'Grids (00–83), Intervat Klantenlisting & One-Stop-Shop',
    description: 'Quarterly Belgian VAT return calculations, Intervat XML export, and EU OSS country-by-country VAT declaration.',
    category: 'finance_tax',
    icon: 'Calculator',
    enabled: true,
    recommendedFor: ['all', 'freelancer', 'wholesale', 'digital_agency'],
  },
  {
    id: 'peppol',
    name: 'Peppol BIS 3.0 & AS4 Network Hub',
    tagline: 'EN 16931 Validation & Real-time Delivery Receipts',
    description: 'Direct integration with European e-invoicing network, Schematron validation, and AS4 access point receipts.',
    category: 'finance_tax',
    icon: 'FileCode2',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },

  // 5. People & Support
  {
    id: 'helpdesk',
    name: 'PulseDesk: Helpdesk & Omnichannel',
    tagline: 'SLA Countdown Timers, Canned Replies & Ticket Billing',
    description: 'Centralized customer support ticketing system with SLA timers, canned answers, and 1-click conversion to tasks or invoices.',
    category: 'people_support',
    icon: 'Headphones',
    enabled: true,
    recommendedFor: ['all', 'digital_agency'],
  },
  {
    id: 'hr',
    name: 'PulseHR: Capacity & Leave',
    tagline: 'Team Resource Heatmap, EU Holiday Calendars & SEPA Payouts',
    description: 'Weekly team capacity allocation heatmaps, time-off approvals with European public holidays, and reimbursement runs.',
    category: 'people_support',
    icon: 'Users',
    enabled: true,
    recommendedFor: ['all', 'digital_agency'],
  },

  // 6. Intelligence & Customization
  {
    id: 'bi',
    name: 'Executive BI & Scheduled Digests',
    tagline: 'MRR / LTV / CAC Analytics, Custom Pivots & Automated Email Digests',
    description: 'High-level executive metrics, custom multi-dimensional reporting pivot builder, and scheduled PDF email briefs.',
    category: 'ai_automation',
    icon: 'BarChart3',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'wholesale'],
  },
  {
    id: 'pulse_ai',
    name: 'PulseAI & OCR Studio',
    tagline: 'Smart OCR Bill Extractor, Deal Health & Natural Language AI',
    description: 'Intelligent document OCR with automatic expense creation, deal health score gauges, and natural language CRM query assistant.',
    category: 'ai_automation',
    icon: 'Bot',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
  {
    id: 'template_designer',
    name: 'WYSIWYG Document Designer',
    tagline: 'Custom Letterheads, Typography, EPC QR & Live Real-Time Canvas',
    description: 'Visual document designer to customize invoices, quotes, and work orders with brand colors, fonts, and EPC QR codes.',
    category: 'core',
    icon: 'LayoutTemplate',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },

  // 7. Security, Integrations & Dev
  {
    id: 'portal',
    name: 'Client Extranet Portal',
    tagline: 'Self-Service Quote Approvals, Invoices & Project Status',
    description: 'Secure branded portal where clients can download invoices, view project progress, and approve open proposals.',
    category: 'core',
    icon: 'Globe',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'freelancer'],
  },
  {
    id: 'integrations',
    name: 'Integrations Hub (8 Connectors)',
    tagline: 'Exact Online, Yuki, Octopus, Ponto, Solvari, Mollie, Stripe',
    description: 'Pre-built enterprise connectors with automated webhooks, data synchronization, and connection health logs.',
    category: 'core',
    icon: 'Plug',
    enabled: true,
    recommendedFor: ['all', 'digital_agency', 'wholesale'],
  },
  {
    id: 'developers',
    name: 'REST API & Webhooks',
    tagline: 'Scoped API Keys, Event Subscriptions & JSON Payloads',
    description: 'Developer portal for building custom integrations, generating Bearer tokens, and monitoring webhook delivery status.',
    category: 'core',
    icon: 'Code2',
    enabled: true,
    recommendedFor: ['all'],
  },
  {
    id: 'security',
    name: 'Enterprise Security & 2FA Hub',
    tagline: 'TOTP 2-Factor Auth, RBAC Permissions & Tamper-Evident Audit Logs',
    description: 'Enterprise grade security center with TOTP authenticator pairing, session termination, and tamper-evident SHA-256 logs.',
    category: 'core',
    icon: 'ShieldCheck',
    enabled: true,
    isCore: true,
    recommendedFor: ['all', 'digital_agency', 'field_service', 'freelancer', 'wholesale'],
  },
]

export const INDUSTRY_PRESETS: {
  id: ModulePresetId
  name: string
  tagline: string
  description: string
  badge: string
  color: string
  icon: string
  enabledModules: ModuleId[]
}[] = [
  {
    id: 'all',
    name: 'All Modules (Full Enterprise ERP)',
    tagline: 'Complete 28-Module Suite',
    description: 'Enables every single module in PulseWork for full end-to-end enterprise management.',
    badge: 'Enterprise All-in-One',
    color: '#3f78e0',
    icon: 'Crown',
    enabledModules: [
      'crm', 'calendar', 'deals', 'quotes', 'contracts', 'subscriptions', 'workorders',
      'projects', 'products', 'inventory_multi', 'procurement', 'mileage', 'invoices',
      'dunning', 'expenses', 'banking', 'cashflow', 'accountant', 'peppol', 'helpdesk',
      'hr', 'bi', 'pulse_ai', 'template_designer', 'portal', 'integrations', 'developers', 'security'
    ],
  },
  {
    id: 'digital_agency',
    name: 'Digital Agency & Professional Services',
    tagline: 'Client Management, Retainers, Helpdesk & HR Capacity',
    description: 'Optimized for marketing agencies, software consultancies, and creative studios.',
    badge: 'Agency Optimized',
    color: '#7452d6',
    icon: 'Briefcase',
    enabledModules: [
      'crm', 'calendar', 'deals', 'quotes', 'contracts', 'subscriptions', 'projects',
      'invoices', 'expenses', 'banking', 'cashflow', 'accountant', 'peppol', 'helpdesk',
      'hr', 'bi', 'pulse_ai', 'template_designer', 'portal', 'integrations', 'security'
    ],
  },
  {
    id: 'field_service',
    name: 'Field Service & Trades',
    tagline: 'Work Orders, Service Van Stock, Mileage & Invoicing',
    description: 'Tailored for electricians, HVAC, plumbers, installers, and field technicians.',
    badge: 'Field & Trades',
    color: '#38b995',
    icon: 'Wrench',
    enabledModules: [
      'crm', 'calendar', 'quotes', 'workorders', 'products', 'inventory_multi',
      'procurement', 'mileage', 'invoices', 'dunning', 'expenses', 'banking',
      'peppol', 'pulse_ai', 'template_designer', 'security'
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer / Solo Pro',
    tagline: 'Quotations, Invoices, Expenses, Banking & Mileage',
    description: 'Lightweight and laser-focused for self-employed professionals and contractors.',
    badge: 'Solo Pro',
    color: '#fab758',
    icon: 'User',
    enabledModules: [
      'crm', 'calendar', 'quotes', 'invoices', 'expenses', 'banking', 'cashflow',
      'accountant', 'peppol', 'mileage', 'pulse_ai', 'template_designer', 'portal', 'security'
    ],
  },
  {
    id: 'wholesale',
    name: 'Wholesale & Commerce',
    tagline: 'Products, Multi-Warehouse, POs, Peppol & EU OSS VAT',
    description: 'Designed for distributors, B2B merchants, importers, and multi-location retailers.',
    badge: 'Wholesale & Trade',
    color: '#e2626b',
    icon: 'Building2',
    enabledModules: [
      'crm', 'deals', 'quotes', 'contracts', 'products', 'inventory_multi', 'procurement',
      'invoices', 'dunning', 'expenses', 'banking', 'cashflow', 'accountant', 'peppol',
      'bi', 'pulse_ai', 'template_designer', 'integrations', 'security'
    ],
  },
]

export function getDefaultModuleSettings(): ModuleSettings {
  const settings: Partial<ModuleSettings> = {}
  MODULE_REGISTRY.forEach((mod) => {
    settings[mod.id] = true
  })
  return settings as ModuleSettings
}

export function getPresetModuleSettings(presetId: ModulePresetId): ModuleSettings {
  const preset = INDUSTRY_PRESETS.find((p) => p.id === presetId)
  if (!preset) return getDefaultModuleSettings()

  const settings: Partial<ModuleSettings> = {}
  MODULE_REGISTRY.forEach((mod) => {
    settings[mod.id] = preset.enabledModules.includes(mod.id)
  })
  return settings as ModuleSettings
}
