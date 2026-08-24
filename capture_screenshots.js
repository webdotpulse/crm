import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

async function run() {
  console.log('🚀 Launching Chrome Headless to capture high-res screenshots...')

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1600,1050',
    ],
    defaultViewport: {
      width: 1600,
      height: 1050,
      deviceScaleFactor: 2,
    },
  })

  const page = await browser.newPage()

  const takeShot = async (filename, waitMs = 500) => {
    await new Promise((r) => setTimeout(r, waitMs))
    const filePath = path.join(SCREENSHOTS_DIR, filename)
    await page.screenshot({ path: filePath, fullPage: false })
    console.log(`✓ Captured: ${filename}`)
  }

  // 1. Dashboard View
  console.log('1. Capturing Dashboard...')
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
  await takeShot('01_dashboard.png', 1000)

  // 2. CRM & Companies View
  console.log('2. Capturing CRM & Companies Directory...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('CRM & Companies')
    )
    if (btn) btn.click()
  })
  await takeShot('02_crm_companies.png', 800)

  // 3. Company Detail Drawer with Peppol Verification
  console.log('3. Capturing Company Detail Drawer & Peppol SMP verification...')
  await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll('tr')).find((r) =>
      r.textContent.includes('TechFlow Logistics NV')
    )
    if (row) row.click()
  })
  await new Promise((r) => setTimeout(r, 600))
  // Click Verify Peppol button
  await page.evaluate(() => {
    const verifyBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Verify Peppol')
    )
    if (verifyBtn) verifyBtn.click()
  })
  await takeShot('03_company_details_peppol.png', 1200)

  // Close drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.modal-content button')
    if (closeBtn) closeBtn.click()
  })
  await new Promise((r) => setTimeout(r, 400))

  // 4. Sales Pipeline (Deals Kanban)
  console.log('4. Capturing Sales Pipeline (Kanban)...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Sales Pipeline')
    )
    if (btn) btn.click()
  })
  await takeShot('04_sales_pipeline_kanban.png', 800)

  // 5. Quotations List
  console.log('5. Capturing Quotations & Proposals List...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Quotations')
    )
    if (btn) btn.click()
  })
  await takeShot('05_quotations_list.png', 800)

  // 6. Client Digital Sign-off Portal
  console.log('6. Capturing Client Digital Sign-off Portal...')
  await page.evaluate(() => {
    const portalBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Portal')
    )
    if (portalBtn) portalBtn.click()
  })
  await takeShot('06_client_proposal_portal.png', 1000)

  // Close portal modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.modal-content button:last-child')
    if (closeBtn) closeBtn.click()
  })
  await new Promise((r) => setTimeout(r, 400))

  // 7. Projects Overview
  console.log('7. Capturing Projects Overview...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Projects & Tasks')
    )
    if (btn) btn.click()
  })
  await takeShot('07_projects_overview.png', 800)

  // 8. Project Detail: Tasks Kanban
  console.log('8. Capturing Project Detail (Tasks Kanban)...')
  await page.evaluate(() => {
    const openBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Open')
    )
    if (openBtn) openBtn.click()
  })
  await takeShot('08_project_tasks_kanban.png', 800)

  // 9. Project Detail: Gantt Chart
  console.log('9. Capturing Project Detail (Interactive Gantt Timeline)...')
  await page.evaluate(() => {
    const ganttTab = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Timeline & Gantt')
    )
    if (ganttTab) ganttTab.click()
  })
  await takeShot('09_project_gantt_timeline.png', 800)

  // 10. Invoices & Billing View
  console.log('10. Capturing Invoices & Billing...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Invoices & Billing')
    )
    if (btn) btn.click()
  })
  await takeShot('10_invoices_peppol_billing.png', 800)

  // 11. Printable Invoice Preview
  console.log('11. Capturing Printable Invoice Preview...')
  await page.evaluate(() => {
    const previewBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.title && b.title.includes('Printable Invoice')
    )
    if (previewBtn) previewBtn.click()
  })
  await takeShot('11_printable_invoice.png', 1000)

  // Close preview modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.modal-content button:last-child')
    if (closeBtn) closeBtn.click()
  })
  await new Promise((r) => setTimeout(r, 400))

  // 12. Peppol Hub: XML Generator
  console.log('12. Capturing Peppol BIS Hub (UBL XML Generator)...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Peppol BIS Hub')
    )
    if (btn) btn.click()
  })
  await takeShot('12_peppol_hub_xml_generator.png', 800)

  // 13. Peppol Hub: EN 16931 Validator
  console.log('13. Capturing Peppol Hub (EN 16931 Validator)...')
  await page.evaluate(() => {
    const validatorTab = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Validator')
    )
    if (validatorTab) validatorTab.click()
  })
  await takeShot('13_peppol_en16931_validator.png', 800)

  // 14. Peppol Hub: Directory Lookup
  console.log('14. Capturing Peppol Directory Lookup...')
  await page.evaluate(() => {
    const lookupTab = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Directory Lookup')
    )
    if (lookupTab) lookupTab.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const lookupSubmit = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Lookup Participant')
    )
    if (lookupSubmit) lookupSubmit.click()
  })
  await takeShot('14_peppol_directory_lookup.png', 1200)

  // 15. Dark Mode Dashboard
  console.log('15. Capturing Dark Mode Theme...')
  await page.evaluate(() => {
    const dashBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Dashboard')
    )
    if (dashBtn) dashBtn.click()
  })
  await new Promise((r) => setTimeout(r, 400))
  await page.evaluate(() => {
    const themeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.title && b.title.includes('Switch to Dark')
    )
    if (themeBtn) themeBtn.click()
  })
  await takeShot('15_dashboard_dark_mode.png', 800)

  await browser.close()
  console.log('\n🎉 All 15 high-resolution screenshots captured in ./screenshots/ directory!')
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err)
  process.exit(1)
})
