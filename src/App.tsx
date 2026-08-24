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
import { SettingsView } from './components/settings/SettingsView'

import { DealModal } from './components/deals/DealModal'
import { QuoteBuilderModal } from './components/quotes/QuoteBuilderModal'
import { ProjectModal } from './components/projects/ProjectModal'
import { InvoiceEditorModal } from './components/invoices/InvoiceEditorModal'
import { CompanyModal } from './components/crm/CompanyModal'

import { Deal, Invoice } from './types'

export const App: React.FC = () => {
  const { currentView, setCurrentView } = useApp()

  // Quick Action Modal states
  const [quickModalType, setQuickModalType] = useState<
    'deal' | 'quote' | 'project' | 'invoice' | 'company' | null
  >(null)
  const [dealForQuote, setDealForQuote] = useState<Deal | null>(null)
  const [peppolSelectedInvoice, setPeppolSelectedInvoice] = useState<Invoice | null>(null)

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

          {currentView === 'deals' && (
            <DealsKanbanView
              onOpenQuickModal={handleOpenQuickModal}
              onGenerateQuoteFromDeal={handleGenerateQuoteFromDeal}
            />
          )}

          {currentView === 'quotes' && (
            <QuotesView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'projects' && (
            <ProjectsView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'invoices' && (
            <InvoicesView
              onOpenQuickModal={handleOpenQuickModal}
              onInspectPeppol={handleInspectPeppol}
            />
          )}

          {currentView === 'peppol' && (
            <PeppolHubView selectedInvoice={peppolSelectedInvoice} />
          )}

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
    </div>
  )
}
export default App
