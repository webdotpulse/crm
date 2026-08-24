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
} from '../data/initialData'
import { dispatchPeppolInvoice } from '../services/peppolDispatcher'

export type AppView =
  | 'dashboard'
  | 'crm'
  | 'deals'
  | 'quotes'
  | 'projects'
  | 'invoices'
  | 'peppol'
  | 'calendar'
  | 'products'
  | 'settings'

interface AppContextType {
  // Navigation & Theme
  currentView: AppView
  setCurrentView: (view: AppView) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void

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
    setPeppolLogs([])
    localStorage.clear()
  }

  const exportDataJson = (): string => {
    const backup = {
      version: '2.0.0',
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
