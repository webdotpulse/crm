const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const ARTIFACTS_DIR = '/home/koen/.gemini/antigravity-ide/brain/774eab25-1a34-4972-aacb-5a09e35788a4'
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

const CHROME_PATH = '/usr/bin/google-chrome'
const BASE_URL = 'http://localhost:5174'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function capture() {
  console.log('🚀 Launching Chrome for Security & 2FA Screenshots...')
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

  // 1. Navigate to Security & 2FA Hub
  console.log('🛡️ Opening Security & 2FA Hub...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Security')
    )
    if (btn) btn.click()
  })
  await sleep(800)
  const sc1 = path.join(SCREENSHOTS_DIR, '01_security_hub.png')
  await page.screenshot({ path: sc1 })
  fs.copyFileSync(sc1, path.join(ARTIFACTS_DIR, '01_security_hub.png'))
  console.log('📸 Saved 01_security_hub.png')

  // 2. Open 2FA Setup Modal (QR Code & Secret)
  console.log('📱 Opening 2FA Setup Modal...')
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
    const btn = btns.find((el) => el.textContent.includes('Reconfigure 2FA') || el.textContent.includes('Configure 2FA'))
    if (btn) btn.click()
  })
  await sleep(600)
  const sc2 = path.join(SCREENSHOTS_DIR, '02_2fa_setup_qr.png')
  await page.screenshot({ path: sc2 })
  fs.copyFileSync(sc2, path.join(ARTIFACTS_DIR, '02_2fa_setup_qr.png'))
  console.log('📸 Saved 02_2fa_setup_qr.png')

  // 3. Advance to Step 2 (Verification) & Step 3 (Backup Codes)
  console.log('🔑 Advancing to Step 2 Verification and Step 3 Backup codes...')
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find((el) =>
      el.textContent.includes('Use Code & Next') || el.textContent.includes('Continue to Verification')
    )
    if (nextBtn) nextBtn.click()
  })
  await sleep(500)

  // Click insert demo code & verify
  await page.evaluate(() => {
    const insertBtn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Insert'))
    if (insertBtn) insertBtn.click()
    const verifyBtn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Verify Code'))
    if (verifyBtn) verifyBtn.click()
  })
  await sleep(600)
  const sc3 = path.join(SCREENSHOTS_DIR, '03_2fa_backup_codes.png')
  await page.screenshot({ path: sc3 })
  fs.copyFileSync(sc3, path.join(ARTIFACTS_DIR, '03_2fa_backup_codes.png'))
  console.log('📸 Saved 03_2fa_backup_codes.png')

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('input[type="checkbox"]')
    if (closeBtn) closeBtn.click()
    const enableBtn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Enable 2FA Protection'))
    if (enableBtn) enableBtn.click()
  })
  await sleep(600)

  // 4. Team RBAC & Access Tab
  console.log('👥 Opening Team Access & RBAC Tab...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Team Access & RBAC'))
    if (btn) btn.click()
  })
  await sleep(500)
  const sc4 = path.join(SCREENSHOTS_DIR, '04_team_rbac.png')
  await page.screenshot({ path: sc4 })
  fs.copyFileSync(sc4, path.join(ARTIFACTS_DIR, '04_team_rbac.png'))
  console.log('📸 Saved 04_team_rbac.png')

  // 5. SHA-256 Audit Trail Tab
  console.log('📜 Opening Audit Trail Tab...')
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Audit Trail'))
    if (btn) btn.click()
  })
  await sleep(500)
  const sc5 = path.join(SCREENSHOTS_DIR, '05_audit_trail.png')
  await page.screenshot({ path: sc5 })
  fs.copyFileSync(sc5, path.join(ARTIFACTS_DIR, '05_audit_trail.png'))
  console.log('📸 Saved 05_audit_trail.png')

  // 6. Test Lock Screen Overlay
  console.log('🔒 Testing Full Screen Lock Overlay...')
  await page.evaluate(() => {
    const lockBtn = document.getElementById('btn-lock-screen-manual') || Array.from(document.querySelectorAll('button')).find((b) => b.title && b.title.includes('Lock Screen'))
    if (lockBtn) lockBtn.click()
  })
  await sleep(700)
  const sc6 = path.join(SCREENSHOTS_DIR, '06_lock_screen.png')
  await page.screenshot({ path: sc6 })
  fs.copyFileSync(sc6, path.join(ARTIFACTS_DIR, '06_lock_screen.png'))
  console.log('📸 Saved 06_lock_screen.png')

  // 7. Unlock screen
  console.log('🔓 Unlocking screen...')
  await page.evaluate(() => {
    const unlockBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Unlock Now'))
    if (unlockBtn) unlockBtn.click()
  })
  await sleep(700)

  // 8. Test Settings Security Tab
  console.log('⚙️ Testing Settings -> Security & 2FA Tab...')
  await page.evaluate(() => {
    const settingsNav = Array.from(document.querySelectorAll('.sidebar-nav-item')).find((el) =>
      el.textContent.includes('Settings')
    )
    if (settingsNav) settingsNav.click()
  })
  await sleep(600)
  await page.evaluate(() => {
    const secTab = Array.from(document.querySelectorAll('button')).find((el) => el.textContent.includes('Security & 2FA'))
    if (secTab) secTab.click()
  })
  await sleep(600)
  const sc7 = path.join(SCREENSHOTS_DIR, '07_settings_security_tab.png')
  await page.screenshot({ path: sc7 })
  fs.copyFileSync(sc7, path.join(ARTIFACTS_DIR, '07_settings_security_tab.png'))
  console.log('📸 Saved 07_settings_security_tab.png')

  await browser.close()
  console.log('🎉 All Security & 2FA Screenshots captured successfully!')
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err)
  process.exit(1)
})
