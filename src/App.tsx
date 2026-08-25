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
import { WorkOrdersView } from './components/workorders/WorkOrdersView'
import { DunningView } from './components/dunning/DunningView'
import { CashFlowForecastView } from './components/cashflow/CashFlowForecastView'
import { MileageView } from './components/mileage/MileageView'
import { ProcurementView } from './components/procurement/ProcurementView'
import { SecurityHubView } from './components/security/SecurityHubView'
import { LockScreenOverlay } from './components/security/LockScreenOverlay'
import { TwoFactorChallengeModal } from './components/security/TwoFactorChallengeModal'

// New Enterprise Suite Components
import { PulseAIHubView } from './components/ai/PulseAIHubView'
import { HelpdeskView } from './components/helpdesk/HelpdeskView'
import { PulseHRView } from './components/hr/PulseHRView'
import { ExecutiveBIView } from './components/bi/ExecutiveBIView'
import { MultiLocationInventoryView } from './components/inventory/MultiLocationInventoryView'
import { DocumentTemplateDesignerView } from './components/templates/DocumentTemplateDesignerView'
import { ModuleStoreView } from './components/modules/ModuleStoreView'
import { InteractiveProposalViewerModal } from './components/quotes/InteractiveProposalViewerModal'

import { DealModal } from './components/deals/DealModal'
import { QuoteBuilderModal } from './components/quotes/QuoteBuilderModal'
import { ProjectModal } from './components/projects/ProjectModal'
import { InvoiceEditorModal } from './components/invoices/InvoiceEditorModal'
import { CompanyModal } from './components/crm/CompanyModal'
import { SendEmailModal } from './components/email/SendEmailModal'
import { SpotlightSearchModal } from './components/layout/SpotlightSearchModal'
import { ThemeCustomizerModal } from './components/settings/ThemeCustomizerModal'

import { Deal, Invoice, Quotation } from './types'
import { FirstRunInstaller } from './components/setup/FirstRunInstaller'
import { LoginView } from './components/auth/LoginView'
import { UserManagementView } from './components/users/UserManagementView'
import { ShieldCheck, RefreshCw } from 'lucide-react'

export const App: React.FC = () => {
  const {
    isInstalled,
    isBootstrapChecking,
    isAuthenticated,
    currentView,
    setCurrentView,
    isPrivacyModeActive,
    activeInteractiveProposalQuote,
    setActiveInteractiveProposalQuote,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp()

  // If server bootstrap check is in progress on a new computer
  if (isBootstrapChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0b1120',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f8fafc',
          fontFamily: 'var(--sb-font-body)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(63, 120, 224, 0.15)',
            border: '1px solid rgba(63, 120, 224, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3f78e0',
            marginBottom: '1.25rem',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          GridCRM
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
          Connecting to workspace & database...
        </div>
      </div>
    )
  }

  // If first run installation has not been executed, display the installer
  if (!isInstalled) {
    return <FirstRunInstaller />
  }

  // If user is not authenticated, display enterprise login screen
  if (!isAuthenticated) {
    return <LoginView />
  }

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
    <div
      data-privacy={isPrivacyModeActive ? 'true' : undefined}
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--sb-bg)', overflowX: 'hidden' }}
    >
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

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

          {currentView === 'workorders' && <WorkOrdersView />}

          {currentView === 'projects' && (
            <ProjectsView onOpenQuickModal={handleOpenQuickModal} />
          )}

          {currentView === 'products' && <ProductsView />}

          {currentView === 'procurement' && <ProcurementView />}

          {currentView === 'mileage' && <MileageView />}

          {currentView === 'invoices' && (
            <InvoicesView
              onOpenQuickModal={handleOpenQuickModal}
              onInspectPeppol={handleInspectPeppol}
            />
          )}

          {currentView === 'dunning' && <DunningView />}

          {currentView === 'expenses' && <ExpensesView />}

          {currentView === 'banking' && <BankingReconciliationView />}

          {currentView === 'cashflow' && <CashFlowForecastView />}

          {currentView === 'accountant' && <AccountantView />}

          {currentView === 'peppol' && (
            <PeppolHubView selectedInvoice={peppolSelectedInvoice} />
          )}

          {currentView === 'portal' && <ClientPortalView />}

          {currentView === 'developers' && <DevelopersView />}

          {currentView === 'integrations' && <IntegrationsView />}

          {currentView === 'security' && <SecurityHubView />}

          {currentView === 'users' && <UserManagementView />}

          {currentView === 'pulse_ai' && <PulseAIHubView />}

          {currentView === 'helpdesk' && <HelpdeskView />}

          {currentView === 'hr' && <PulseHRView />}

          {currentView === 'bi' && <ExecutiveBIView />}

          {currentView === 'inventory_multi' && <MultiLocationInventoryView />}

          {currentView === 'template_designer' && <DocumentTemplateDesignerView />}

          {currentView === 'module_store' && <ModuleStoreView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Interactive Web Proposal Viewer Modal */}
      {activeInteractiveProposalQuote && (
        <InteractiveProposalViewerModal
          quote={activeInteractiveProposalQuote}
          onClose={() => setActiveInteractiveProposalQuote(null)}
        />
      )}

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

      {/* Global Security Modals & Overlays */}
      <LockScreenOverlay />
      <TwoFactorChallengeModal />

      {/* Global Spotlight Search & Theme Customizer Drawers */}
      <SpotlightSearchModal />
      <ThemeCustomizerModal />
    </div>
  )
}
export default App
