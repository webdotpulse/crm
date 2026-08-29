import puppeteer from 'puppeteer-core'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const screenshotsDir = path.join(rootDir, 'screenshots')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

async function run() {
  console.log('🚀 Starting Vite preview server...')
  
  const viteProcess = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
    cwd: rootDir,
    stdio: 'pipe',
    env: { ...process.env, PATH: `/home/koen/.local/node-v22.14.0-linux-x64/bin:${process.env.PATH}` },
  })

  viteProcess.stdout.on('data', (d) => console.log(`[Vite] ${d.toString().trim()}`))
  viteProcess.stderr.on('data', (d) => console.error(`[Vite ERR] ${d.toString().trim()}`))

  // Wait for server to be responsive
  let serverReady = false
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4173')
      if (res.ok) {
        serverReady = true
        console.log('✅ Vite server is ready on http://127.0.0.1:4173')
        break
      }
    } catch (e) {
      await sleep(500)
    }
  }

  if (!serverReady) {
    console.error('❌ Failed to connect to Vite preview server.')
    viteProcess.kill()
    process.exit(1)
  }

  console.log('🌐 Launching headless Chrome...')
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1.5,
    },
  })

  const page = await browser.newPage()

  // Initialize localStorage for logged-in and installed state
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    localStorage.setItem('pulsework_installed', 'true')
    localStorage.setItem('pulsework_authenticated', 'true')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1000)

  // Helper to click tab or button by regex text
  const clickButtonByText = async (textPattern) => {
    const clicked = await page.evaluate((pattern) => {
      const elements = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="button"]'))
      const match = elements.find((b) => b.textContent && new RegExp(pattern, 'i').test(b.textContent.trim()))
      if (match) {
        match.click()
        return true
      }
      return false
    }, textPattern)
    await sleep(700)
    return clicked
  }

  // Helper to capture screenshot
  const capture = async (filename, description) => {
    const filePath = path.join(screenshotsDir, filename)
    await sleep(600)
    await page.screenshot({ path: filePath, fullPage: false })
    console.log(`📸 [${description}] -> screenshots/${filename}`)
  }

  // Set View helper via window.__crm_app
  const setView = async (viewName) => {
    await page.evaluate((v) => {
      if (window.__crm_app && window.__crm_app.setCurrentView) {
        window.__crm_app.setCurrentView(v)
      }
      // Reset any active modals & project selection
      if (window.__setQuickModalType) {
        window.__setQuickModalType(null)
      }
      if (window.__crm_app && window.__crm_app.setSelectedProjectId) {
        window.__crm_app.setSelectedProjectId(null)
      }
      if (window.__crm_app && window.__crm_app.setIsThemeCustomizerOpen) {
        window.__crm_app.setIsThemeCustomizerOpen(false)
      }
      if (window.__crm_app && window.__crm_app.setIsSpotlightOpen) {
        window.__crm_app.setIsSpotlightOpen(false)
      }
      if (window.__crm_app && window.__crm_app.setActiveInteractiveProposalQuote) {
        window.__crm_app.setActiveInteractiveProposalQuote(null)
      }
      if (window.__crm_app && window.__crm_app.closeStepUpChallenge) {
        window.__crm_app.closeStepUpChallenge()
      }
      if (window.__crm_app && window.__crm_app.unlockScreen) {
        window.__crm_app.unlockScreen('1234')
      }
    }, viewName)
    await sleep(800)
  }

  console.log('✨ Starting comprehensive screenshot capture for all pages, settings, and modules...')

  // 1. Dashboard
  await setView('dashboard')
  await capture('01_dashboard.png', 'Main Dashboard Overview & KPIs')

  // 2. CRM - Companies
  await setView('crm')
  await clickButtonByText('Companies')
  await capture('02_crm_companies.png', 'CRM B2B Companies Directory')

  // 3. CRM - Individuals
  await clickButtonByText('Individuals')
  await capture('03_crm_individuals.png', 'CRM B2C Individuals Directory')

  // 4. CRM - Contacts
  await clickButtonByText('Contacts')
  await capture('04_crm_contacts.png', 'CRM Contact Persons & Employers')

  // 5. Calendar & Planner
  await setView('calendar')
  await capture('05_calendar_planner.png', 'Calendar & Scheduler Planner')

  // 6. Sales Deals Kanban
  await setView('deals')
  await capture('06_sales_pipeline_kanban.png', 'Sales Pipeline Deals Kanban')

  // 7. Quotations
  await setView('quotes')
  await capture('07_quotations.png', 'Quotations & Dynamic Proposals')

  // 8. Work Orders (Werkbonnen)
  await setView('workorders')
  await capture('08_workorders_field_service.png', 'Field Service Digital Werkbonnen')

  // 9. Contracts & SLAs
  await setView('contracts')
  await capture('09_contracts_slas.png', 'Contracts, SLAs & SHA-256 Signatures')

  // 10. Subscriptions & MRR
  await setView('subscriptions')
  await capture('10_subscriptions_mrr.png', 'Subscriptions & Retainers MRR')

  // 11. Projects Delivery Overview
  await setView('projects')
  await sleep(1000)
  await capture('11_projects_overview.png', 'Projects Delivery Overview')

  // 12. Project Detail - Tasks Kanban
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h3'))
    if (headings.length > 0) {
      headings[0].click()
    }
  })
  await sleep(1000)
  await clickButtonByText('Tasks Kanban')
  await capture('12_project_tasks_kanban.png', 'Project Detail - Tasks Kanban')

  // 13. Project Detail - Gantt Chart
  await clickButtonByText('Timeline & Gantt')
  await capture('13_project_gantt_chart.png', 'Project Detail - Gantt Milestone Timeline')

  // 14. Project Detail - Timesheet
  await clickButtonByText('Timesheets')
  await capture('14_project_timesheets.png', 'Project Detail - Timesheets & Billable Hours')

  // 15. Project Detail - Finances
  await clickButtonByText('Finances & Billing')
  await capture('15_project_finances.png', 'Project Detail - Financial Budget & Invoicing')

  // Reset selected project
  await clickButtonByText('Back to Projects')
  await sleep(600)

  // 16. Products & Catalog
  await setView('products')
  await capture('16_products_catalog.png', 'Products & Service Catalog')

  // 17. Multi-Location Inventory - Warehouses & Vans
  await setView('inventory_multi')
  await clickButtonByText('Warehouses & Vans')
  await capture('17_inventory_multi_locations.png', 'Multi-Location Warehouses & Service Vans')

  // 18. Inventory Transfers
  await clickButtonByText('Stock Transfers')
  await capture('18_inventory_transfers.png', 'Multi-Depot Stock Transfer Orders')

  // 19. Inventory Serials & Batches
  await clickButtonByText('Serials & Batches')
  await capture('19_inventory_serials_batches.png', 'Serial & Batch Items Tracking')

  // 20. Inventory Barcode Scanner
  await clickButtonByText('Barcode Scanner')
  await capture('20_inventory_barcode_scanner.png', 'Live Barcode & QR Scanner Interface')

  // 21. Procurement & Bestelbonnen
  await setView('procurement')
  await capture('21_procurement_purchase_orders.png', 'Purchase Orders (Bestelbonnen) & 3-Way Match')

  // 22. Mileage & Trip Log
  await setView('mileage')
  await capture('22_mileage_trips.png', 'Belgian Mileage Tracking & Trip Logs')

  // 23. User Management & RBAC
  await setView('users')
  await capture('23_users_rbac_management.png', 'User Management & RBAC Roles')

  // 24. PulseDesk Helpdesk
  await setView('helpdesk')
  await capture('24_helpdesk_tickets.png', 'PulseDesk Support Tickets & SLA Countdown')

  // 25. HR Capacity Heatmap
  await setView('hr')
  await clickButtonByText('Capacity Heatmap')
  await capture('25_hr_capacity_heatmap.png', 'PulseHR Capacity & Workload Heatmap')

  // 26. HR Leave Planner
  await clickButtonByText('Time-Off & Holidays')
  await capture('26_hr_leave_planner.png', 'PulseHR Leave Requests & Holidays')

  // 27. HR Reimbursements
  await clickButtonByText('SEPA Reimbursements')
  await capture('27_hr_reimbursements.png', 'PulseHR SEPA Expense & Mileage Reimbursements')

  // 28. Invoices & Commercial Billing
  await setView('invoices')
  await capture('28_invoices_billing.png', 'Invoices, Overdue Tracking & Billing')

  // 29. Executive BI & KPIs
  await setView('bi')
  await capture('29_executive_bi_kpis.png', 'Executive BI Analytics & KPIs')

  // 30. Dunning & Legal Debt Collection
  await setView('dunning')
  await capture('30_dunning_debt_collection.png', 'Book XIX CEL Legal Dunning & Bailiff Pipeline')

  // 31. Expenses & Supplier Bills (P&L)
  await setView('expenses')
  await capture('31_expenses_pnl.png', 'Expenses & Supplier Bills (P&L)')

  // 32. Banking Reconciliation
  await setView('banking')
  await capture('32_banking_reconciliation.png', 'Bank Reconciliation & Modulo-97 Auto-Matching')

  // 33. AI Cashflow Prognose
  await setView('cashflow')
  await capture('33_ai_cashflow_forecast.png', '30-60-90 Day AI Cashflow Forecast')

  // 34. VAT & Tax Grids
  await setView('accountant')
  await clickButtonByText('Belgian VAT Return Grids')
  await capture('34_vat_tax_belgian_grids.png', 'Belgian Intervat VAT Grids 00–83')

  // 35. VAT Klantenlisting
  await clickButtonByText('Annual Client Listing')
  await capture('35_vat_tax_klantenlisting.png', 'Annual Belgian B2B Klantenlisting')

  // 36. EU OSS Tax Declaration
  await clickButtonByText('EU OSS')
  await capture('36_vat_tax_eu_oss.png', 'EU OSS Cross-Border Tax Engine')

  // 37. PulseAI Hub - Smart OCR Extractor
  await setView('pulse_ai')
  await clickButtonByText('Smart OCR Extractor')
  await capture('37_pulse_ai_ocr_studio.png', 'PulseAI Supplier Receipt OCR Studio')

  // 38. PulseAI Hub - Deal Intelligence
  await clickButtonByText('Deal Intelligence')
  await capture('38_pulse_ai_deal_insights.png', 'PulseAI Deal Health & Win Intelligence')

  // 39. PulseAI Hub - Chat Assistant
  await clickButtonByText('AI Command Console')
  await capture('39_pulse_ai_chat_assistant.png', 'PulseAI Natural Language Chat Assistant')

  // 40. Document Template Designer
  await setView('template_designer')
  await capture('40_document_template_designer.png', 'Document Template Designer & WYSIWYG Editor')

  // 41. Integrations Hub
  await setView('integrations')
  await capture('41_integrations_hub.png', 'Enterprise Connectors & Integrations Hub')

  // 42. Peppol Hub - XML Generator
  await setView('peppol')
  await clickButtonByText('UBL XML Generator')
  await capture('42_peppol_xml_generator.png', 'Peppol BIS 3.0 UBL 2.1 XML Generator & Inspector')

  // 43. Peppol Hub - Schematron Validator
  await clickButtonByText('EN 16931 Validator')
  await capture('43_peppol_schematron_validator.png', 'EN 16931 Schematron Rules Validator')

  // 44. Peppol Hub - Directory Lookup
  await clickButtonByText('Peppol Directory Lookup')
  await capture('44_peppol_directory_lookup.png', 'OpenPeppol SMP / SML Participant Directory Lookup')

  // 45. Peppol Hub - AS4 Gateway Logs
  await clickButtonByText('AS4 Transmission Logs')
  await capture('45_peppol_as4_transmission_logs.png', 'Peppol AS4 MDN Transmission Logs')

  // 46. Client Extranet Self-Service Portal
  await setView('portal')
  await capture('46_client_extranet_portal.png', 'Client Extranet Self-Service Portal')

  // 47. Developer REST API & Webhooks
  await setView('developers')
  await capture('47_developer_rest_api.png', 'Developer REST API Keys & Webhook Subscriptions')

  // 48. Security & 2FA Hub
  await setView('security')
  await capture('48_security_2fa_hub.png', 'Security & 2FA Hub, TOTP & Audit Logs')

  // 49. Module Store & Industry Presets
  await setView('module_store')
  await capture('49_module_store_presets.png', '28-Module Store & 1-Click Industry Presets')

  // 50. Settings - Legal Entities
  await setView('settings')
  await clickButtonByText('Legal Entities')
  await capture('50_settings_legal_entities.png', 'Settings: Multi-Entity & Legal Company Profiles')

  // 51. Settings - VAT Rates
  await clickButtonByText('VAT & Tax Rates')
  await capture('51_settings_vat_rates.png', 'Settings: VAT Rates & Tax Categories')

  // 52. Settings - Templates
  await clickButtonByText('Email & Document Templates')
  await capture('52_settings_templates.png', 'Settings: Email & Document Notification Templates')

  // 53. Settings - Branding & Theme
  await clickButtonByText('Theme & Custom Styling')
  await capture('53_settings_branding_theme.png', 'Settings: SandBox Design System, Palette & Typography')

  // 54. Settings - Security Policy
  await clickButtonByText('Security & 2FA')
  await capture('54_settings_security_policy.png', 'Settings: Security Policy, PIN & Screen-Share Privacy')

  // 55. Settings - Backup & Database
  await clickButtonByText('Backup & Reset')
  await capture('55_settings_backup_database.png', 'Settings: Database Engine, JSON Export & Backup')

  // 56. Quick Modal: New Deal
  await setView('deals')
  await page.evaluate(() => {
    if (window.__setQuickModalType) {
      window.__setQuickModalType('deal')
    }
  })
  await sleep(700)
  await capture('56_modal_new_deal.png', 'New Deal Modal')

  // 57. Quick Modal: Quote Builder
  await page.evaluate(() => {
    if (window.__setQuickModalType) {
      window.__setQuickModalType('quote')
    }
  })
  await sleep(700)
  await capture('57_modal_quote_builder.png', 'Dynamic Quote Builder Modal')

  // 58. Quick Modal: New Project
  await page.evaluate(() => {
    if (window.__setQuickModalType) {
      window.__setQuickModalType('project')
    }
  })
  await sleep(700)
  await capture('58_modal_new_project.png', 'New Project Modal')

  // 59. Quick Modal: Commercial Invoice Editor
  await page.evaluate(() => {
    if (window.__setQuickModalType) {
      window.__setQuickModalType('invoice')
    }
  })
  await sleep(700)
  await capture('59_modal_invoice_editor.png', 'Commercial Invoice Editor Modal')

  // 60. Quick Modal: New Company
  await page.evaluate(() => {
    if (window.__setQuickModalType) {
      window.__setQuickModalType('company')
    }
  })
  await sleep(700)
  await capture('60_modal_new_company.png', 'New Company / KBO Directory Modal')

  // 61. Interactive Web Proposal Viewer
  await setView('quotes')
  await sleep(1200)
  await clickButtonByText('Proposal')
  await sleep(1200)
  await capture('61_modal_interactive_proposal_viewer.png', 'Client Interactive Proposal Viewer with Sign-on-Screen')

  // Close proposal modal
  await page.evaluate(() => {
    if (window.__crm_app && window.__crm_app.setActiveInteractiveProposalQuote) {
      window.__crm_app.setActiveInteractiveProposalQuote(null)
    }
  })
  await sleep(600)

  // 62. Theme Customizer Drawer
  await setView('dashboard')
  await page.evaluate(() => {
    window.__crm_app.setIsThemeCustomizerOpen(true)
  })
  await sleep(700)
  await capture('62_theme_customizer_drawer.png', 'Theme Customizer Drawer')

  // Close theme customizer
  await page.evaluate(() => {
    window.__crm_app.setIsThemeCustomizerOpen(false)
  })

  // 63. Spotlight Search Modal (Ctrl+K)
  await page.evaluate(() => {
    window.__crm_app.setIsSpotlightOpen(true)
  })
  await sleep(700)
  await capture('63_spotlight_search.png', 'Global Spotlight Quick Search (Ctrl+K)')

  // Close spotlight search
  await page.evaluate(() => {
    window.__crm_app.setIsSpotlightOpen(false)
  })

  // 64. Dark Mode Dashboard
  await page.evaluate(() => {
    window.__crm_app.toggleTheme()
  })
  await sleep(700)
  await capture('64_dashboard_dark_mode.png', 'Dashboard in Dark Theme Mode')

  // Reset theme back to light
  await page.evaluate(() => {
    window.__crm_app.toggleTheme()
  })

  // 65. Enterprise Login Screen
  await page.evaluate(() => {
    localStorage.setItem('pulsework_authenticated', 'false')
    sessionStorage.removeItem('pulsework_authenticated')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1000)
  await capture('65_login_screen.png', 'Enterprise Login Screen')

  // 66. First-Run Setup Installer
  await page.evaluate(() => {
    localStorage.removeItem('pulsework_installed')
    localStorage.removeItem('pulsework_authenticated')
    localStorage.removeItem('pulsework_crm_state_v3_users')
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(1000)
  await capture('66_first_run_installer.png', 'First-Run Setup & Database Installer')

  // Clean up and close browser
  await browser.close()
  viteProcess.kill()

  console.log('🎉 ALL SCREENSHOTS SUCCESSFULLY GENERATED IN ./screenshots/')
}

run().catch((err) => {
  console.error('❌ Screenshot script error:', err)
  process.exit(1)
})
