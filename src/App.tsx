import React, { useState, Suspense, lazy } from 'react'
import { useApp } from './context/AppContext'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { Deal, Invoice } from './types'
import { ShieldCheck, RefreshCw } from 'lucide-react'

// View Loading Fallback
const ViewLoadingFallback: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(63, 120, 224, 0.2)',
          borderTopColor: '#3f78e0',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--sb-text-muted)' }}>
        Loading view...
      </span>
    </div>
  </div>
)

// Lazy loaded Views for optimal bundle size & code splitting
const DashboardView = lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })))
const CRMView = lazy(() => import('./components/crm/CRMView').then(m => ({ default: m.CRMView })))
const DealsKanbanView = lazy(() => import('./components/deals/DealsKanbanView').then(m => ({ default: m.DealsKanbanView })))
const QuotesView = lazy(() => import('./components/quotes/QuotesView').then(m => ({ default: m.QuotesView })))
const ProjectsView = lazy(() => import('./components/projects/ProjectsView').then(m => ({ default: m.ProjectsView })))
const InvoicesView = lazy(() => import('./components/invoices/InvoicesView').then(m => ({ default: m.InvoicesView })))
const PeppolHubView = lazy(() => import('./components/peppol/PeppolHubView').then(m => ({ default: m.PeppolHubView })))
const CalendarView = lazy(() => import('./components/calendar/CalendarView').then(m => ({ default: m.CalendarView })))
const ProductsView = lazy(() => import('./components/products/ProductsView').then(m => ({ default: m.ProductsView })))
const SettingsView = lazy(() => import('./components/settings/SettingsView').then(m => ({ default: m.SettingsView })))
const ExpensesView = lazy(() => import('./components/expenses/ExpensesView').then(m => ({ default: m.ExpensesView })))
const BankingReconciliationView = lazy(() => import('./components/banking/BankingReconciliationView').then(m => ({ default: m.BankingReconciliationView })))
const SubscriptionsView = lazy(() => import('./components/subscriptions/SubscriptionsView').then(m => ({ default: m.SubscriptionsView })))
const ContractsView = lazy(() => import('./components/contracts/ContractsView').then(m => ({ default: m.ContractsView })))
const AccountantView = lazy(() => import('./components/accountant/AccountantView').then(m => ({ default: m.AccountantView })))
const ClientPortalView = lazy(() => import('./components/portal/ClientPortalView').then(m => ({ default: m.ClientPortalView })))
const DevelopersView = lazy(() => import('./components/developers/DevelopersView').then(m => ({ default: m.DevelopersView })))
const IntegrationsView = lazy(() => import('./components/integrations/IntegrationsView').then(m => ({ default: m.IntegrationsView })))
const WorkOrdersView = lazy(() => import('./components/workorders/WorkOrdersView').then(m => ({ default: m.WorkOrdersView })))
const DunningView = lazy(() => import('./components/dunning/DunningView').then(m => ({ default: m.DunningView })))
const CashFlowForecastView = lazy(() => import('./components/cashflow/CashFlowForecastView').then(m => ({ default: m.CashFlowForecastView })))
const MileageView = lazy(() => import('./components/mileage/MileageView').then(m => ({ default: m.MileageView })))
const ProcurementView = lazy(() => import('./components/procurement/ProcurementView').then(m => ({ default: m.ProcurementView })))
const SecurityHubView = lazy(() => import('./components/security/SecurityHubView').then(m => ({ default: m.SecurityHubView })))
const UserManagementView = lazy(() => import('./components/users/UserManagementView').then(m => ({ default: m.UserManagementView })))

// Enterprise Suite Components
const PulseAIHubView = lazy(() => import('./components/ai/PulseAIHubView').then(m => ({ default: m.PulseAIHubView })))
const HelpdeskView = lazy(() => import('./components/helpdesk/HelpdeskView').then(m => ({ default: m.HelpdeskView })))
const PulseHRView = lazy(() => import('./components/hr/PulseHRView').then(m => ({ default: m.PulseHRView })))
const ExecutiveBIView = lazy(() => import('./components/bi/ExecutiveBIView').then(m => ({ default: m.ExecutiveBIView })))
const MultiLocationInventoryView = lazy(() => import('./components/inventory/MultiLocationInventoryView').then(m => ({ default: m.MultiLocationInventoryView })))
const DocumentTemplateDesignerView = lazy(() => import('./components/templates/DocumentTemplateDesignerView').then(m => ({ default: m.DocumentTemplateDesignerView })))
const ModuleStoreView = lazy(() => import('./components/modules/ModuleStoreView').then(m => ({ default: m.ModuleStoreView })))

// Modals & Overlays
const LockScreenOverlay = lazy(() => import('./components/security/LockScreenOverlay').then(m => ({ default: m.LockScreenOverlay })))
const TwoFactorChallengeModal = lazy(() => import('./components/security/TwoFactorChallengeModal').then(m => ({ default: m.TwoFactorChallengeModal })))
const InteractiveProposalViewerModal = lazy(() => import('./components/quotes/InteractiveProposalViewerModal').then(m => ({ default: m.InteractiveProposalViewerModal })))
const DealModal = lazy(() => import('./components/deals/DealModal').then(m => ({ default: m.DealModal })))
const QuoteBuilderModal = lazy(() => import('./components/quotes/QuoteBuilderModal').then(m => ({ default: m.QuoteBuilderModal })))
const ProjectModal = lazy(() => import('./components/projects/ProjectModal').then(m => ({ default: m.ProjectModal })))
const InvoiceEditorModal = lazy(() => import('./components/invoices/InvoiceEditorModal').then(m => ({ default: m.InvoiceEditorModal })))
const CompanyModal = lazy(() => import('./components/crm/CompanyModal').then(m => ({ default: m.CompanyModal })))
const SendEmailModal = lazy(() => import('./components/email/SendEmailModal').then(m => ({ default: m.SendEmailModal })))
const SpotlightSearchModal = lazy(() => import('./components/layout/SpotlightSearchModal').then(m => ({ default: m.SpotlightSearchModal })))
const ThemeCustomizerModal = lazy(() => import('./components/settings/ThemeCustomizerModal').then(m => ({ default: m.ThemeCustomizerModal })))

const FirstRunInstaller = lazy(() => import('./components/setup/FirstRunInstaller').then(m => ({ default: m.FirstRunInstaller })))
const LoginView = lazy(() => import('./components/auth/LoginView').then(m => ({ default: m.LoginView })))

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
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <FirstRunInstaller />
      </Suspense>
    )
  }

  // If user is not authenticated, display enterprise login screen
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <LoginView />
      </Suspense>
    )
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
          <Suspense fallback={<ViewLoadingFallback />}>
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
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  )
}
export default App
