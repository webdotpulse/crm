import React, { createContext, useContext, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import {
  Company,
  Contact,
  Deal,
  DealStage,
  Quotation,
  QuoteItem,
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  Invoice,
  InvoiceItem,
  Payment,
  CompanyProfile,
  PeppolTransmissionLog,
} from '../types'
import {
  initialCompanyProfile,
  initialCompanies,
  initialContacts,
  initialDeals,
  initialQuotations,
  initialProjects,
  initialTasks,
  initialTimeEntries,
  initialInvoices,
  initialPayments,
  initialPeppolLogs,
} from '../data/initialData'
import { generateStructuredReference } from '../services/peppolGenerator'
import { dispatchPeppolInvoice } from '../services/peppolDispatcher'

export type ViewType =
  | 'dashboard'
  | 'crm'
  | 'deals'
  | 'quotes'
  | 'projects'
  | 'invoices'
  | 'peppol'
  | 'settings'

interface ActiveTimer {
  isRunning: boolean
  projectId?: string
  taskId?: string
  description: string
  seconds: number
  startTime?: number
}

interface AppContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
  selectedCompanyId: string | null
  setSelectedCompanyId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Profile & Entities
  companyProfile: CompanyProfile
  updateCompanyProfile: (profile: CompanyProfile) => void

  companies: Company[]
  addCompany: (comp: Omit<Company, 'id' | 'createdAt'>) => Company
  updateCompany: (comp: Company) => void
  deleteCompany: (id: string) => void

  contacts: Contact[]
  addContact: (cont: Omit<Contact, 'id' | 'createdAt'>) => Contact
  updateContact: (cont: Contact) => void
  deleteContact: (id: string) => void

  deals: Deal[]
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Deal
  updateDeal: (deal: Deal) => void
  moveDealStage: (dealId: string, newStage: DealStage) => void
  deleteDeal: (id: string) => void

  quotations: Quotation[]
  addQuotation: (quote: Omit<Quotation, 'id' | 'createdAt'>) => Quotation
  updateQuotation: (quote: Quotation) => void
  signQuotation: (quoteId: string, signerName: string, notes?: string) => void
  convertQuoteToProject: (quoteId: string) => Project | null
  convertQuoteToInvoice: (quoteId: string) => Invoice | null
  deleteQuotation: (id: string) => void

  projects: Project[]
  addProject: (proj: Omit<Project, 'id' | 'createdAt'>) => Project
  updateProject: (proj: Project) => void
  deleteProject: (id: string) => void

  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'loggedHours'>) => Task
  updateTask: (task: Task) => void
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void
  deleteTask: (id: string) => void

  timeEntries: TimeEntry[]
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => TimeEntry
  updateTimeEntry: (entry: TimeEntry) => void
  deleteTimeEntry: (id: string) => void
  invoiceProjectTimeEntries: (projectId: string) => Invoice | null

  invoices: Invoice[]
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt'>) => Invoice
  updateInvoice: (inv: Invoice) => void
  deleteInvoice: (id: string) => void
  sendInvoiceViaPeppol: (invoiceId: string) => Promise<{ success: boolean; error?: string }>
  recordPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void

  payments: Payment[]
  peppolLogs: PeppolTransmissionLog[]

  // Timer
  activeTimer: ActiveTimer
  startTimer: (projectId?: string, taskId?: string, description?: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopAndSaveTimer: () => void
  resetTimer: () => void
  setTimerDescription: (desc: string) => void
  setTimerProject: (projectId: string) => void
  setTimerTask: (taskId: string) => void

  // Demo / System
  resetToDemoData: () => void
  exportDataJson: () => string
  importDataJson: (jsonStr: string) => boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_PREFIX = 'pulsework_crm_'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or defaults
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(`${STORAGE_PREFIX}theme`) as 'light' | 'dark') || 'light'
  })

  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}profile`)
    return saved ? JSON.parse(saved) : initialCompanyProfile
  })

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}companies`)
    return saved ? JSON.parse(saved) : initialCompanies
  })

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}contacts`)
    return saved ? JSON.parse(saved) : initialContacts
  })

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}deals`)
    return saved ? JSON.parse(saved) : initialDeals
  })

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}quotes`)
    return saved ? JSON.parse(saved) : initialQuotations
  })

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}projects`)
    return saved ? JSON.parse(saved) : initialProjects
  })

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}tasks`)
    return saved ? JSON.parse(saved) : initialTasks
  })

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}times`)
    return saved ? JSON.parse(saved) : initialTimeEntries
  })

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}invoices`)
    return saved ? JSON.parse(saved) : initialInvoices
  })

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}payments`)
    return saved ? JSON.parse(saved) : initialPayments
  })

  const [peppolLogs, setPeppolLogs] = useState<PeppolTransmissionLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}peppol_logs`)
    return saved ? JSON.parse(saved) : initialPeppolLogs
  })

  const [activeTimer, setActiveTimer] = useState<ActiveTimer>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}timer`)
    return saved ? JSON.parse(saved) : { isRunning: false, description: '', seconds: 0 }
  })

  // Synchronize with LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(`${STORAGE_PREFIX}theme`, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}profile`, JSON.stringify(companyProfile))
  }, [companyProfile])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}companies`, JSON.stringify(companies))
  }, [companies])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}contacts`, JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}deals`, JSON.stringify(deals))
  }, [deals])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}quotes`, JSON.stringify(quotations))
  }, [quotations])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}projects`, JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}times`, JSON.stringify(timeEntries))
  }, [timeEntries])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(payments))
  }, [payments])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}peppol_logs`, JSON.stringify(peppolLogs))
  }, [peppolLogs])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}timer`, JSON.stringify(activeTimer))
  }, [activeTimer])

  // Timer Tick
  useEffect(() => {
    let interval: any
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer.isRunning])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Company Actions
  const addCompany = (compData: Omit<Company, 'id' | 'createdAt'>): Company => {
    const newComp: Company = {
      ...compData,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setCompanies((prev) => [newComp, ...prev])
    return newComp
  }

  const updateCompany = (comp: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === comp.id ? comp : c)))
  }

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id))
  }

  // Contact Actions
  const addContact = (contData: Omit<Contact, 'id' | 'createdAt'>): Contact => {
    const newContact: Contact = {
      ...contData,
      id: `cont-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setContacts((prev) => [newContact, ...prev])
    return newContact
  }

  const updateContact = (cont: Contact) => {
    setContacts((prev) => prev.map((c) => (c.id === cont.id ? cont : c)))
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  // Deal Actions
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setDeals((prev) => [newDeal, ...prev])
    return newDeal
  }

  const updateDeal = (deal: Deal) => {
    setDeals((prev) => prev.map((d) => (d.id === deal.id ? deal : d)))
  }

  const moveDealStage = (dealId: string, newStage: DealStage) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const isWon = newStage === 'won'
          if (isWon && d.stage !== 'won') {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            })
          }
          return {
            ...d,
            stage: newStage,
            probability: isWon ? 100 : newStage === 'lost' ? 0 : d.probability,
          }
        }
        return d
      })
    )
  }

  const deleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }

  // Quotation Actions
  const addQuotation = (quoteData: Omit<Quotation, 'id' | 'createdAt'>): Quotation => {
    const newQuote: Quotation = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setQuotations((prev) => [newQuote, ...prev])
    return newQuote
  }

  const updateQuotation = (quote: Quotation) => {
    setQuotations((prev) => prev.map((q) => (q.id === quote.id ? quote : q)))
  }

  const signQuotation = (quoteId: string, signerName: string, notes?: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoteId) {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
          })
          return {
            ...q,
            status: 'accepted',
            clientSignedAt: new Date().toISOString(),
            clientSignedBy: signerName,
            clientNotes: notes,
          }
        }
        return q
      })
    )
  }

  const convertQuoteToProject = (quoteId: string): Project | null => {
    const quote = quotations.find((q) => q.id === quoteId)
    if (!quote) return null

    const totalHours = quote.items
      .filter((i) => i.unit.includes('hour') || i.unit.includes('hr'))
      .reduce((sum, i) => sum + i.quantity, 0) || Math.round(quote.subtotal / 110)

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: quote.title || `Project for ${companies.find((c) => c.id === quote.companyId)?.name || 'Client'}`,
      quoteId: quote.id,
      companyId: quote.companyId,
      status: 'in_progress',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      budgetHours: totalHours,
      budgetAmount: quote.subtotal,
      hourlyRate: 110,
      progressPercent: 0,
      description: `Project initialized from accepted quotation ${quote.number}.`,
      color: '#3f78e0',
      createdAt: new Date().toISOString(),
    }

    setProjects((prev) => [newProject, ...prev])

    // Generate initial tasks from quote line items
    const generatedTasks: Task[] = quote.items.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      projectId: newProject.id,
      title: item.description,
      assignee: 'Unassigned',
      priority: 'medium',
      status: 'todo',
      estimatedHours: item.quantity,
      loggedHours: 0,
      dueDate: newProject.endDate,
      createdAt: new Date().toISOString(),
    }))

    setTasks((prev) => [...generatedTasks, ...prev])

    // Mark quote as converted
    setQuotations((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, convertedToProjectId: newProject.id } : q))
    )

    return newProject
  }

  const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
    const quote = quotations.find((q) => q.id === quoteId)
    if (!quote) return null

    const nextInvoiceNum = `INV-2026-${String(invoices.length + 183).padStart(4, '0')}`
    const invoiceItems: InvoiceItem[] = quote.items.map((qi, idx) => ({
      id: `ii-${Date.now()}-${idx}`,
      description: qi.description,
      quantity: qi.quantity,
      unit: qi.unit,
      unitPrice: qi.unitPrice,
      discountPercent: qi.discountPercent,
      vatRate: qi.vatRate,
      total: qi.total,
      taxCategory: qi.vatRate === 0 ? 'AE' : 'S',
    }))

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: nextInvoiceNum,
      quoteId: quote.id,
      companyId: quote.companyId,
      contactId: quote.contactId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      reference: quote.number,
      structuredReference: generateStructuredReference(Date.now()),
      items: invoiceItems,
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
      currency: quote.currency || 'EUR',
      status: 'issued',
      peppolStatus: 'valid',
      notes: `Invoice generated from quotation ${quote.number}. ${quote.terms || ''}`,
      paymentTerms: 'Payment within 30 days.',
      createdAt: new Date().toISOString(),
    }

    setInvoices((prev) => [newInvoice, ...prev])

    setQuotations((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, convertedToInvoiceId: newInvoice.id } : q))
    )

    return newInvoice
  }

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id))
  }

  // Project Actions
  const addProject = (projData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProj: Project = {
      ...projData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setProjects((prev) => [newProj, ...prev])
    return newProj
  }

  const updateProject = (proj: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? proj : p)))
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
  }

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'loggedHours'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      loggedHours: 0,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }

  const updateTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
  }

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  // Time Tracking Actions
  const addTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `time-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setTimeEntries((prev) => [newEntry, ...prev])

    // Update logged hours on task if linked
    if (newEntry.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newEntry.taskId
            ? { ...t, loggedHours: (t.loggedHours || 0) + newEntry.hours }
            : t
        )
      )
    }

    return newEntry
  }

  const updateTimeEntry = (entry: TimeEntry) => {
    setTimeEntries((prev) => prev.map((t) => (t.id === entry.id ? entry : t)))
  }

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((t) => t.id !== id))
  }

  const invoiceProjectTimeEntries = (projectId: string): Invoice | null => {
    const proj = projects.find((p) => p.id === projectId)
    if (!proj) return null

    const unbilledEntries = timeEntries.filter(
      (t) => t.projectId === projectId && t.isBillable && !t.invoiceId
    )

    if (unbilledEntries.length === 0) return null

    const totalHours = unbilledEntries.reduce((sum, e) => sum + e.hours, 0)
    const rate = proj.hourlyRate || 110
    const subtotal = totalHours * rate
    const vatRate = 21
    const taxTotal = subtotal * (vatRate / 100)
    const total = subtotal + taxTotal
    const nextInvoiceNum = `INV-2026-${String(invoices.length + 183).padStart(4, '0')}`

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: nextInvoiceNum,
      projectId: proj.id,
      companyId: proj.companyId,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      reference: `TIME-${proj.title.slice(0, 12).toUpperCase()}`,
      structuredReference: generateStructuredReference(Date.now()),
      items: [
        {
          id: `ii-${Date.now()}`,
          description: `Services rendered for ${proj.title} (${totalHours.toFixed(1)} billable hours @ €${rate}/hr)`,
          quantity: totalHours,
          unit: 'hours',
          unitPrice: rate,
          discountPercent: 0,
          vatRate: 21,
          total: subtotal,
          taxCategory: 'S',
        },
      ],
      subtotal,
      taxBreakdown: [
        {
          rate: 21,
          taxCategory: 'S',
          taxableAmount: subtotal,
          taxAmount: taxTotal,
        },
      ],
      taxTotal,
      total,
      amountPaid: 0,
      currency: 'EUR',
      status: 'issued',
      peppolStatus: 'valid',
      notes: `Invoiced from tracked project timesheets.`,
      paymentTerms: 'Payment within 30 days.',
      createdAt: new Date().toISOString(),
    }

    setInvoices((prev) => [newInvoice, ...prev])

    // Mark entries as invoiced
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.projectId === projectId && e.isBillable && !e.invoiceId
          ? { ...e, invoiceId: newInvoice.id }
          : e
      )
    )

    return newInvoice
  }

  // Invoice & Peppol Actions
  const addInvoice = (invData: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setInvoices((prev) => [newInv, ...prev])
    return newInv
  }

  const updateInvoice = (inv: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === inv.id ? inv : i)))
  }

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id))
  }

  const sendInvoiceViaPeppol = async (
    invoiceId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) return { success: false, error: 'Invoice not found' }

    const buyer = companies.find((c) => c.id === inv.companyId)
    if (!buyer) return { success: false, error: 'Customer company details not found' }

    const result = await dispatchPeppolInvoice(inv, companyProfile, buyer)

    // Append log
    setPeppolLogs((prev) => [result.log, ...prev])

    if (result.success) {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId
            ? {
                ...i,
                status: 'peppol_sent',
                peppolStatus: 'delivered',
                peppolMessageId: result.log.accessPointReceiptId,
                peppolDeliveredAt: result.log.timestamp,
              }
            : i
        )
      )
      return { success: true }
    } else {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId ? { ...i, peppolStatus: 'invalid' } : i
        )
      )
      return { success: false, error: result.error }
    }
  }

  const recordPayment = (payData: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setPayments((prev) => [newPayment, ...prev])

    // Update invoice balance
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payData.invoiceId) {
          const newPaid = (inv.amountPaid || 0) + payData.amount
          const isFullyPaid = newPaid >= inv.total - 0.05
          return {
            ...inv,
            amountPaid: newPaid,
            status: isFullyPaid ? 'paid' : 'partial',
          }
        }
        return inv
      })
    )
  }

  // Timer Controls
  const startTimer = (projectId?: string, taskId?: string, description?: string) => {
    setActiveTimer({
      isRunning: true,
      projectId: projectId || activeTimer.projectId,
      taskId: taskId || activeTimer.taskId,
      description: description || activeTimer.description || 'General Work',
      seconds: activeTimer.seconds,
      startTime: Date.now(),
    })
  }

  const pauseTimer = () => {
    setActiveTimer((prev) => ({ ...prev, isRunning: false }))
  }

  const resumeTimer = () => {
    setActiveTimer((prev) => ({ ...prev, isRunning: true, startTime: Date.now() }))
  }

  const stopAndSaveTimer = () => {
    if (activeTimer.seconds >= 30 && activeTimer.projectId) {
      const hours = Math.max(0.1, Number((activeTimer.seconds / 3600).toFixed(2)))
      const proj = projects.find((p) => p.id === activeTimer.projectId)
      addTimeEntry({
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        memberName: 'Koen De Vries',
        date: new Date().toISOString().slice(0, 10),
        hours,
        description: activeTimer.description || 'Logged via live timer widget',
        isBillable: true,
        hourlyRate: proj?.hourlyRate || 110,
      })
    }
    setActiveTimer({ isRunning: false, description: '', seconds: 0 })
  }

  const resetTimer = () => {
    setActiveTimer({ isRunning: false, description: '', seconds: 0 })
  }

  const setTimerDescription = (desc: string) => {
    setActiveTimer((prev) => ({ ...prev, description: desc }))
  }

  const setTimerProject = (projectId: string) => {
    setActiveTimer((prev) => ({ ...prev, projectId }))
  }

  const setTimerTask = (taskId: string) => {
    setActiveTimer((prev) => ({ ...prev, taskId }))
  }

  // Demo / System
  const resetToDemoData = () => {
    setCompanies(initialCompanies)
    setContacts(initialContacts)
    setDeals(initialDeals)
    setQuotations(initialQuotations)
    setProjects(initialProjects)
    setTasks(initialTasks)
    setTimeEntries(initialTimeEntries)
    setInvoices(initialInvoices)
    setPayments(initialPayments)
    setPeppolLogs(initialPeppolLogs)
    setCompanyProfile(initialCompanyProfile)
    setActiveTimer({ isRunning: false, description: '', seconds: 0 })
    localStorage.clear()
  }

  const exportDataJson = (): string => {
    const data = {
      companyProfile,
      companies,
      contacts,
      deals,
      quotations,
      projects,
      tasks,
      timeEntries,
      invoices,
      payments,
      peppolLogs,
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (parsed.companies && parsed.invoices) {
        if (parsed.companyProfile) setCompanyProfile(parsed.companyProfile)
        if (parsed.companies) setCompanies(parsed.companies)
        if (parsed.contacts) setContacts(parsed.contacts)
        if (parsed.deals) setDeals(parsed.deals)
        if (parsed.quotations) setQuotations(parsed.quotations)
        if (parsed.projects) setProjects(parsed.projects)
        if (parsed.tasks) setTasks(parsed.tasks)
        if (parsed.timeEntries) setTimeEntries(parsed.timeEntries)
        if (parsed.invoices) setInvoices(parsed.invoices)
        if (parsed.payments) setPayments(parsed.payments)
        if (parsed.peppolLogs) setPeppolLogs(parsed.peppolLogs)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        selectedProjectId,
        setSelectedProjectId,
        selectedCompanyId,
        setSelectedCompanyId,
        searchQuery,
        setSearchQuery,
        companyProfile,
        updateCompanyProfile: setCompanyProfile,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        deals,
        addDeal,
        updateDeal,
        moveDealStage,
        deleteDeal,
        quotations,
        addQuotation,
        updateQuotation,
        signQuotation,
        convertQuoteToProject,
        convertQuoteToInvoice,
        deleteQuotation,
        projects,
        addProject,
        updateProject,
        deleteProject,
        tasks,
        addTask,
        updateTask,
        moveTaskStatus,
        deleteTask,
        timeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        invoiceProjectTimeEntries,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        sendInvoiceViaPeppol,
        recordPayment,
        payments,
        peppolLogs,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopAndSaveTimer,
        resetTimer,
        setTimerDescription,
        setTimerProject,
        setTimerTask,
        resetToDemoData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
