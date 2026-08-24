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

  // 1. Standard Crisp White Navigation & Dashboard
  console.log('📸 01_dashboard.png (Standard Crisp White)')
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_dashboard.png') })

  // 2. Spotlight Search Modal (Triggered by Search Input)
  console.log('📸 32_spotlight_search_modal.png')
  await page.click('#global-search-input')
  await sleep(600)
  await page.waitForSelector('.spotlight-input', { visible: true })
  await page.type('.spotlight-input', 'Invoice')
  await sleep(600)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '32_spotlight_search_modal.png') })

  // Close Spotlight
  await page.keyboard.press('Escape')
  await sleep(500)

  // 3. Theme Customizer Drawer (Open from Topbar)
  console.log('📸 33_theme_customizer_drawer.png')
  await page.click('#btn-theme-customizer')
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '33_theme_customizer_drawer.png') })

  // Close Drawer
  await page.evaluate(() => {
    const doneBtn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent === 'Done'
    )
    if (doneBtn) doneBtn.click()
  })
  await sleep(500)

  // 4. Settings -> Theme Customizer Tab
  console.log('📸 34_settings_theme_branding.png')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Settings')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Theme & Custom Styling')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '34_settings_theme_branding.png') })

  await browser.close()
  console.log('✅ Screenshot capture complete!')
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err)
  process.exit(1)
})
