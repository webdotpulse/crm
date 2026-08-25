import { LanguageCode, TranslationDictionary } from '../types'

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation
  nav_dashboard: { nl: 'Dashboard', fr: 'Tableau de bord', en: 'Dashboard', de: 'Übersicht', es: 'Panel Principal' },
  nav_crm: { nl: 'CRM & Relaties', fr: 'CRM & Clients', en: 'CRM & Clients', de: 'CRM & Kunden', es: 'CRM y Clientes' },
  nav_calendar: { nl: 'Kalender & Planning', fr: 'Calendrier & Planning', en: 'Calendar & Planner', de: 'Kalender & Planer', es: 'Calendario y Agenda' },
  nav_deals: { nl: 'Verkooppijplijn', fr: 'Pipeline Commercial', en: 'Sales Pipeline', de: 'Vertriebspipeline', es: 'Pipeline de Ventas' },
  nav_quotes: { nl: 'Offertes', fr: 'Devis & Propositions', en: 'Quotations', de: 'Angebote', es: 'Presupuestos' },
  nav_contracts: { nl: 'Contracten & SLA', fr: 'Contrats & SLA', en: 'Contracts & SLAs', de: 'Verträge & SLAs', es: 'Contratos y SLAs' },
  nav_subscriptions: { nl: 'Abonnementen & MRR', fr: 'Abonnements & MRR', en: 'Subscriptions & MRR', de: 'Abonnements & MRR', es: 'Suscripciones e Ingresos Recurrentes' },
  nav_workorders: { nl: 'Digitale Werkbonnen', fr: 'Bons de Travail', en: 'Work Orders', de: 'Arbeitsaufträge', es: 'Partes de Trabajo' },
  nav_projects: { nl: 'Projecten & Taken', fr: 'Projets & Tâches', en: 'Projects & Tasks', de: 'Projekte & Aufgaben', es: 'Proyectos y Tareas' },
  nav_products: { nl: 'Producten & Voorraad', fr: 'Produits & Stocks', en: 'Products & Stock', de: 'Produkte & Lager', es: 'Productos e Inventario' },
  nav_inventory_multi: { nl: 'Multi-Locatie Voorraad', fr: 'Stock Multi-Emplacements', en: 'Multi-Location Stock', de: 'Lager & Filialen', es: 'Stock Multi-Ubicación' },
  nav_invoices: { nl: 'Facturatie & Billing', fr: 'Facturation & Recouvrement', en: 'Invoices & Billing', de: 'Rechnungen & Fakturierung', es: 'Facturas y Cobros' },
  nav_dunning: { nl: 'Aanmaningen & Incasso', fr: 'Rappels & Contentieux', en: 'Dunning & Recovery', de: 'Mahnwesen & Inkasso', es: 'Reclamaciones e Impagos' },
  nav_expenses: { nl: 'Aankoop & Uitgaven', fr: 'Achats & Dépenses', en: 'Expenses (P&L)', de: 'Ausgaben & Einkauf', es: 'Gastos y Compras' },
  nav_procurement: { nl: 'Bestelbonnen (PO)', fr: 'Bons de Commande', en: 'Purchase Orders', de: 'Bestellungen (PO)', es: 'Órdenes de Compra' },
  nav_mileage: { nl: 'Kilometerregistratie', fr: 'Frais Kilométriques', en: 'Mileage & Travel', de: 'Fahrtenbuch & Km', es: 'Registro de Kilometraje' },
  nav_banking: { nl: 'Bankafstemming & CODA', fr: 'Rapprochement Bancaire', en: 'Bank Reconciliation', de: 'Bankabstimmung & CODA', es: 'Conciliación Bancaria' },
  nav_cashflow: { nl: 'AI Cashflow & Prognose', fr: 'IA Trésorerie & Prévisions', en: 'AI Cash Flow Forecast', de: 'KI Liquidität & Prognose', es: 'Previsión de Flujo de Caja' },
  nav_accountant: { nl: 'Belgische BTW & Fiscus', fr: 'TVA Belge & Fiscalité', en: 'Belgian VAT & Tax', de: 'MwSt. & Buchhaltung', es: 'IVA y Fiscalidad' },
  nav_peppol: { nl: 'Peppol BIS Hub', fr: 'Hub Peppol BIS', en: 'Peppol BIS Hub', de: 'Peppol BIS Hub', es: 'Red Peppol BIS' },
  nav_integrations: { nl: 'Integraties & Marketplace', fr: 'Intégrations & Marketplace', en: 'Integrations Hub', de: 'Integrationen & Hub', es: 'Hub de Integraciones' },
  nav_portal: { nl: 'Klantportaal Extranet', fr: 'Portail Client Extranet', en: 'Client Extranet', de: 'Kundenportal Extranet', es: 'Portal del Cliente' },
  nav_developers: { nl: 'REST API & Webhooks', fr: 'API REST & Webhooks', en: 'REST API & Webhooks', de: 'REST API & Webhooks', es: 'API REST y Webhooks' },
  nav_security: { nl: 'Beveiliging & 2FA', fr: 'Sécurité & 2FA', en: 'Security & 2FA Hub', de: 'Sicherheit & 2FA', es: 'Seguridad y 2FA' },
  nav_settings: { nl: 'Instellingen & Entiteiten', fr: 'Paramètres & Entités', en: 'Settings & Entities', de: 'Einstellungen & Entitäten', es: 'Configuración y Entidades' },

  // New Enterprise Modules Navigation
  nav_helpdesk: { nl: 'PulseDesk Helpdesk', fr: 'PulseDesk Support Client', en: 'PulseDesk Helpdesk', de: 'PulseDesk Support', es: 'PulseDesk Soporte' },
  nav_hr: { nl: 'PulseHR Capaciteit & Verlof', fr: 'PulseHR RH & Congés', en: 'PulseHR Capacity & Leave', de: 'PulseHR Personal & Urlaub', es: 'PulseHR Capacidad y Permisos' },
  nav_bi: { nl: 'Executive BI & Digests', fr: 'BI Exécutive & Rapports', en: 'Executive BI & Analytics', de: 'Executive BI & Berichte', es: 'BI Ejecutivo e Informes' },
  nav_pulse_ai: { nl: 'PulseAI & OCR Studio', fr: 'PulseAI & Studio OCR', en: 'PulseAI & Smart OCR', de: 'PulseAI & OCR Studio', es: 'PulseAI y Reconocimiento OCR' },
  nav_template_designer: { nl: 'Document Designer', fr: 'Créateur de Documents', en: 'Document Designer', de: 'Vorlagen Designer', es: 'Diseñador de Documentos' },
  nav_module_store: { nl: 'Module Store & Preset', fr: 'Magasin de Modules', en: 'Module Hub & Presets', de: 'Modul Store & Presets', es: 'Tienda de Módulos' },

  // General Actions & Terms
  btn_save: { nl: 'Opslaan', fr: 'Enregistrer', en: 'Save', de: 'Speichern', es: 'Guardar' },
  btn_cancel: { nl: 'Annuleren', fr: 'Annuler', en: 'Cancel', de: 'Abbrechen', es: 'Cancelar' },
  btn_sync: { nl: 'Synchroniseren', fr: 'Synchroniser', en: 'Sync Now', de: 'Synchronisieren', es: 'Sincronizar' },
  btn_download_pdf: { nl: 'Download PDF', fr: 'Télécharger PDF', en: 'Download PDF', de: 'PDF Herunterladen', es: 'Descargar PDF' },
  btn_send_peppol: { nl: 'Verzend via Peppol', fr: 'Envoyer via Peppol', en: 'Send via Peppol', de: 'Über Peppol Senden', es: 'Enviar por Peppol' },
  btn_enable: { nl: 'Inschakelen', fr: 'Activer', en: 'Enable', de: 'Aktivieren', es: 'Activar' },
  btn_disable: { nl: 'Uitschakelen', fr: 'Désactiver', en: 'Disable', de: 'Deaktivieren', es: 'Desactivar' },
  btn_apply_preset: { nl: 'Preset Toepassen', fr: 'Appliquer Préréglage', en: 'Apply Preset', de: 'Preset Anwenden', es: 'Aplicar Perfil' },
  status_paid: { nl: 'Betaald', fr: 'Payé', en: 'Paid', de: 'Bezahlt', es: 'Pagado' },
  status_issued: { nl: 'Verzonden', fr: 'Émis', en: 'Issued', de: 'Ausgestellt', es: 'Emitido' },
  status_overdue: { nl: 'Vervallen', fr: 'En retard', en: 'Overdue', de: 'Überfällig', es: 'Vencido' },
  status_draft: { nl: 'Concept', fr: 'Brouillon', en: 'Draft', de: 'Entwurf', es: 'Borrador' },
}

export function translate(key: string, lang: LanguageCode = 'nl'): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang]
  }
  if (TRANSLATIONS[key] && TRANSLATIONS[key]['en']) {
    return TRANSLATIONS[key]['en']
  }
  return key
}
