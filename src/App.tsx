import React, { useState } from 'react'
import { useApp } from './context/AppContext'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { DashboardView } from './components/dashboard/DashboardView'
import { CRMView } from './components/crm/CRMView'
import { DealsKanbanView } from './components/deals/DealsKanbanView'
import { QuotesView } from './components/quotes/QuotesView'
import { ProjectsView } from './components/projects/ProjectsView'
import { InvoicesView } from './components/invoices/InvoicesView'
import { PeppolHubView } from './components/peppol/PeppolHubView'
import { CalendarView } from './components/calendar/CalendarView'
import { ProductsView } from './components/products/ProductsView'
import { SettingsView } from './components/settings/SettingsView'
import { ExpensesView } from './components/expenses/ExpensesView'
import { BankingReconciliationView } from './components/banking/BankingReconciliationView'
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView'
import { ContractsView } from './components/contracts/ContractsView'
import { AccountantView } from './components/accountant/AccountantView'
import { ClientPortalView } from './components/portal/ClientPortalView'
import { DevelopersView } from './components/developers/DevelopersView'
import { IntegrationsView } from './components/integrations/IntegrationsView'

import { DealModal } from './components/deals/DealModal'
import { QuoteBuilderModal } from './components/quotes/QuoteBuilderModal'
import { ProjectModal } from './components/projects/ProjectModal'
import { InvoiceEditorModal } from './components/invoices/InvoiceEditorModal'
import { CompanyModal } from './components/crm/CompanyModal'
import { SendEmailModal } from './components/email/SendEmailModal'

import { Deal, Invoice, Quotation } from './types'

export const App: React.FC = () => {
  const { currentView, setCurrentView } = useApp()

  // Quick Action Modal states
  const [quickModalType, setQuickModalType] = useState<
    'deal' | 'quote' | 'project' | 'invoice' | 'company' | null
  >(null)
  const [dealForQuote, setDealForQuote] = useState<Deal | null>(null)
  const [peppolSelectedInvoice, setPeppolSelectedInvoice] = useState<Invoice | null>(null)

  // Email modal state
  const [emailModalData, setEmailModalData] = useState<{
    recipientEmail: string
    recipientName: string
    documentType?: 'quote' | 'invoice' | 'deal' | 'project'
    document?: any
  } | null>(null)

  const handleOpenQuickModal = (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => {
    setDealForQuote(null)
    setQuickModalType(type)
  }

  const handleGenerateQuoteFromDeal = (deal: Deal) => {
    setDealForQuote(deal)
    setQuickModalType('quote')
  }

  const handleInspectPeppol = (invoice: Invoice) => {
    setPeppolSelectedInvoice(invoice)
    setCurrentView('peppol')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sb-bg)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar onOpenQuickModal={handleOpenQuickModal} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentView === 'dashboard' && (
            <DashboardView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'crm' && (
            <CRMView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'calendar' && <CalendarView />}

          {currentView === 'deals' && (
            <DealsKanbanView
              onOpenQuickModal={handleOpenQuickModal}
              onGenerateQuoteFromDeal={handleGenerateQuoteFromDeal}
            />
          )}

          {currentView === 'quotes' && (
            <QuotesView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'contracts' && <ContractsView />}

          {currentView === 'subscriptions' && <SubscriptionsView />}

          {currentView === 'projects' && (
            <ProjectsView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'products' && <ProductsView />}

          {currentView === 'invoices' && (
            <InvoicesView
              onOpenQuickModal={handleOpenQuickModal}
              onInspectPeppol={handleInspectPeppol}
            />
          )}

          {currentView === 'expenses' && <ExpensesView />}

          {currentView === 'banking' && <BankingReconciliationView />}

          {currentView === 'accountant' && <AccountantView />}

          {currentView === 'peppol' && (
            <PeppolHubView selectedInvoice={peppolSelectedInvoice} />
          )}

          {currentView === 'portal' && <ClientPortalView />}

          {currentView === 'developers' && <DevelopersView />}

          {currentView === 'integrations' && <IntegrationsView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      {quickModalType === 'deal' && (
        <DealModal onClose={() => setQuickModalType(null)} />
      )}

      {quickModalType === 'quote' && (
        <QuoteBuilderModal
          fromDeal={dealForQuote}
          onClose={() => {
            setQuickModalType(null)
            setDealForQuote(null)
          }}
        />
      )}

      {quickModalType === 'project' && (
        <ProjectModal onClose={() => setQuickModalType(null)} />
      )}

      {quickModalType === 'invoice' && (
        <InvoiceEditorModal onClose={() => setQuickModalType(null)} />
      )}

      {quickModalType === 'company' && (
        <CompanyModal onClose={() => setQuickModalType(null)} />
      )}

      {emailModalData && (
        <SendEmailModal
          recipientEmail={emailModalData.recipientEmail}
          recipientName={emailModalData.recipientName}
          documentType={emailModalData.documentType}
          document={emailModalData.document}
          onClose={() => setEmailModalData(null)}
        />
      )}
    </div>
  )
}
export default App
