import { LanguageCode, TranslationDictionary } from '../types'

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation
  nav_dashboard: { nl: 'Dashboard', fr: 'Tableau de bord', en: 'Dashboard', de: 'Übersicht' },
  nav_crm: { nl: 'CRM & Relaties', fr: 'CRM & Clients', en: 'CRM & Clients', de: 'CRM & Kunden' },
  nav_calendar: { nl: 'Kalender & Planning', fr: 'Calendrier & Planning', en: 'Calendar & Planner', de: 'Kalender & Planer' },
  nav_deals: { nl: 'Verkooppijplijn', fr: 'Pipeline Commercial', en: 'Sales Pipeline', de: 'Vertriebspipeline' },
  nav_quotes: { nl: 'Offertes', fr: 'Devis & Propositions', en: 'Quotations', de: 'Angebote' },
  nav_contracts: { nl: 'Contracten & SLA', fr: 'Contrats & SLA', en: 'Contracts & SLAs', de: 'Verträge & SLAs' },
  nav_subscriptions: { nl: 'Abonnementen & MRR', fr: 'Abonnements & MRR', en: 'Subscriptions & MRR', de: 'Abonnements & MRR' },
  nav_workorders: { nl: 'Digitale Werkbonnen', fr: 'Bons de Travail', en: 'Work Orders', de: 'Arbeitsaufträge' },
  nav_projects: { nl: 'Projecten & Taken', fr: 'Projets & Tâches', en: 'Projects & Tasks', de: 'Projekte & Aufgaben' },
  nav_products: { nl: 'Producten & Voorraad', fr: 'Produits & Stocks', en: 'Products & Stock', de: 'Produkte & Lager' },
  nav_invoices: { nl: 'Facturatie & Billing', fr: 'Facturation & Recouvrement', en: 'Invoices & Billing', de: 'Rechnungen & Fakturierung' },
  nav_dunning: { nl: 'Aanmaningen & Incasso', fr: 'Rappels & Contentieux', en: 'Dunning & Recovery', de: 'Mahnwesen & Inkasso' },
  nav_expenses: { nl: 'Aankoop & Uitgaven', fr: 'Achats & Dépenses', en: 'Expenses (P&L)', de: 'Ausgaben & Einkauf' },
  nav_procurement: { nl: 'Bestelbonnen (PO)', fr: 'Bons de Commande', en: 'Purchase Orders', de: 'Bestellungen (PO)' },
  nav_mileage: { nl: 'Kilometerregistratie', fr: 'Frais Kilométriques', en: 'Mileage & Travel', de: 'Fahrtenbuch & Km' },
  nav_banking: { nl: 'Bankafstemming & CODA', fr: 'Rapprochement Bancaire', en: 'Bank Reconciliation', de: 'Bankabstimmung & CODA' },
  nav_cashflow: { nl: 'AI Cashflow & Prognose', fr: 'IA Trésorerie & Prévisions', en: 'AI Cash Flow Forecast', de: 'KI Liquidität & Prognose' },
  nav_accountant: { nl: 'Belgische BTW & Fiscus', fr: 'TVA Belge & Fiscalité', en: 'Belgian VAT & Tax', de: 'MwSt. & Buchhaltung' },
  nav_peppol: { nl: 'Peppol BIS Hub', fr: 'Hub Peppol BIS', en: 'Peppol BIS Hub', de: 'Peppol BIS Hub' },
  nav_integrations: { nl: 'Integraties & Marketplace', fr: 'Intégrations & Marketplace', en: 'Integrations Hub', de: 'Integrationen & Hub' },
  nav_portal: { nl: 'Klantportaal Extranet', fr: 'Portail Client Extranet', en: 'Client Extranet', de: 'Kundenportal Extranet' },
  nav_developers: { nl: 'REST API & Webhooks', fr: 'API REST & Webhooks', en: 'REST API & Webhooks', de: 'REST API & Webhooks' },
  nav_settings: { nl: 'Instellingen & Entiteiten', fr: 'Paramètres & Entités', en: 'Settings & Entities', de: 'Einstellungen & Entitäten' },

  // General Actions & Terms
  btn_save: { nl: 'Opslaan', fr: 'Enregistrer', en: 'Save', de: 'Speichern' },
  btn_cancel: { nl: 'Annuleren', fr: 'Annuler', en: 'Cancel', de: 'Abbrechen' },
  btn_sync: { nl: 'Synchroniseren', fr: 'Synchroniser', en: 'Sync Now', de: 'Synchronisieren' },
  btn_download_pdf: { nl: 'Download PDF', fr: 'Télécharger PDF', en: 'Download PDF', de: 'PDF Herunterladen' },
  btn_send_peppol: { nl: 'Verzend via Peppol', fr: 'Envoyer via Peppol', en: 'Send via Peppol', de: 'Über Peppol Senden' },
  status_paid: { nl: 'Betaald', fr: 'Payé', en: 'Paid', de: 'Bezahlt' },
  status_issued: { nl: 'Verzonden', fr: 'Émis', en: 'Issued', de: 'Ausgestellt' },
  status_overdue: { nl: 'Vervallen', fr: 'En retard', en: 'Overdue', de: 'Überfällig' },
  status_draft: { nl: 'Concept', fr: 'Brouillon', en: 'Draft', de: 'Entwurf' },
}

export function translate(key: string, lang: LanguageCode = 'nl'): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang]
  }
  return key
}
