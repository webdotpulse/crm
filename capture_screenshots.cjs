const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

const CHROME_PATH = '/usr/bin/google-chrome'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function capture() {
  console.log('🚀 Launching Chrome for High-Res Screenshots capture...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })

  console.log(`🌐 Navigating to ${BASE_URL}...`)
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
  await sleep(1500)

  // 1. Dashboard Light
  console.log('📸 01_dashboard.png')
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_dashboard.png') })

  // 2. CRM Companies (B2B)
  console.log('📸 02_crm_companies.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('CRM')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_crm_companies.png') })

  // 3. CRM Individuals (B2C)
  console.log('📸 03_crm_b2c_individuals.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Private Individuals')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_crm_b2c_individuals.png') })

  // 4. CRM Contacts & Employers
  console.log('📸 04_crm_contacts_employers.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('All Contacts')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_crm_contacts_employers.png') })

  // 5. Calendar Month Planner
  console.log('📸 05_calendar_month_planner.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Calendar')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_calendar_month_planner.png') })

  // 6. Calendar Agenda List
  console.log('📸 06_calendar_agenda_list.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Agenda List')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_calendar_agenda_list.png') })

  // 7. Products & Stock Inventory
  console.log('📸 07_products_stock_inventory.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Products')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_products_stock_inventory.png') })

  // 8. Sales Pipeline Kanban
  console.log('📸 08_sales_pipeline_kanban.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Pipeline')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_sales_pipeline_kanban.png') })

  // 9. Quotations List
  console.log('📸 09_quotations_list.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Quotations')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_quotations_list.png') })

  // 10. Client Proposal Sign-off Portal Modal
  console.log('📸 10_client_proposal_portal.png')
  await page.evaluate(() => {
    const previewBtn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Client View') || el.title === 'Client Sign-off Portal'
    )
    if (previewBtn) previewBtn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_client_proposal_portal.png') })

  // Close proposal modal
  await page.keyboard.press('Escape')
  await sleep(400)

  // 11. Projects Overview
  console.log('📸 11_projects_overview.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Projects')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_projects_overview.png') })

  // 12. Project Gantt Timeline
  console.log('📸 12_project_gantt_timeline.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Gantt')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_project_gantt_timeline.png') })

  // 13. Invoices & Billing
  console.log('📸 13_invoices_peppol_billing.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Invoices')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_invoices_peppol_billing.png') })

  // 14. Printable Invoice View
  console.log('📸 14_printable_invoice.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('View PDF') || el.title === 'View Printable Invoice'
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_printable_invoice.png') })

  // Close invoice print modal
  await page.keyboard.press('Escape')
  await sleep(400)

  // 15. Peppol Hub & XML Generator
  console.log('📸 15_peppol_hub_xml_generator.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Peppol')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_peppol_hub_xml_generator.png') })

  // 16. Peppol Schematron EN 16931 Validator
  console.log('📸 16_peppol_en16931_validator.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('EN 16931 Validator')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_peppol_en16931_validator.png') })

  // 17. Expenses & Accounts Payable (NEW)
  console.log('📸 17_expenses_accounts_payable.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Expenses')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_expenses_accounts_payable.png') })

  // 18. Bank Statement Reconciliation & OGM (NEW)
  console.log('📸 18_banking_coda_reconciliation.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Reconciliation')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '18_banking_coda_reconciliation.png') })

  // 19. Subscriptions & MRR Engine (NEW)
  console.log('📸 19_subscriptions_mrr_engine.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Subscriptions')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '19_subscriptions_mrr_engine.png') })

  // 20. Contracts & SLAs (NEW)
  console.log('📸 20_contracts_sla_management.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Contracts')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '20_contracts_sla_management.png') })

  // 21. Belgian VAT Declaration & Klantenlisting (NEW)
  console.log('📸 21_accountant_belgian_vat_grids.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Belgian VAT')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '21_accountant_belgian_vat_grids.png') })

  // 22. Client Extranet Portal (NEW)
  console.log('📸 22_client_extranet_portal.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Client Extranet')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '22_client_extranet_portal.png') })

  // 23. Developers REST API & Webhooks (NEW)
  console.log('📸 23_developers_api_webhooks.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('REST API')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '23_developers_api_webhooks.png') })

  // 24. Settings Legal Entities
  console.log('📸 24_settings_multi_entities.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Settings')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '24_settings_multi_entities.png') })

  // 25. Dashboard Dark Mode
  console.log('📸 25_dashboard_dark_mode.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Dashboard')
    )
    if (btn) btn.click()
  })
  await sleep(600)
  await page.evaluate(() => {
    const toggle = document.querySelector('button[title*="Dark"], button[title*="Theme"]')
    if (toggle) toggle.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '25_dashboard_dark_mode.png') })

  await browser.close()
  console.log(`\n🎉 Successfully captured all 25 high-resolution screenshots in ${SCREENSHOTS_DIR}`)
}

capture().catch((err) => {
  console.error('Screenshot capture error:', err)
  process.exit(1)
})
