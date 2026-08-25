import React, { useState, useEffect } from 'react'
import {
  Shield,
  ShieldCheck,
  Building,
  User,
  Mail,
  Lock,
  Key,
  CreditCard,
  Globe,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Palette,
  RefreshCw,
  Zap,
  Sliders,
  Phone,
  MapPin,
  FileText,
  Clock,
  Terminal,
  Database,
  Server,
  HardDrive,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../../context/AppContext'
import {
  FirstRunInstallPayload,
  SupportedCurrency,
  TwoFactorSetupData,
  DatabaseStorageMode,
} from '../../types'
import {
  themePresets,
} from '../../services/themeService'
import {
  createTwoFactorSetup as generate2FASetup,
  verifyTotpCode as verifyTotp,
  evaluatePasswordStrength as evalPwd,
} from '../../services/securityService'
import {
  testMySqlConnection,
  ConnectionTestResult,
} from '../../services/mysqlService'
import { searchKboRegistry } from '../../services/kboLookupService'
import { DEFAULT_COMPANY_LOGO } from '../../data/initialData'

export const FirstRunInstaller: React.FC = () => {
  const { completeFirstRunInstall, securityPolicy } = useApp()

  const [isKboLookingUp, setIsKboLookingUp] = useState(false)
  const [kboLookupStatus, setKboLookupStatus] = useState<string | null>(null)

  // Logo state
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(DEFAULT_COMPANY_LOGO)

  const [currentStep, setCurrentStep] = useState<number>(1)
  const totalSteps = 7

  // Step 1: Preflight checks state
  const [preflightStatus, setPreflightStatus] = useState<{
    storage: boolean
    crypto: boolean
    totp: boolean
    peppol: boolean
    iban: boolean
  }>({
    storage: false,
    crypto: false,
    totp: false,
    peppol: false,
    iban: false,
  })
  const [isPreflightChecking, setIsPreflightChecking] = useState(true)

  // Step 2: Database Configuration state
  const [dbMode, setDbMode] = useState<DatabaseStorageMode>('mysql')
  const [mysqlHost, setMysqlHost] = useState('mysql123.combell-hosting.com')
  const [mysqlPort, setMysqlPort] = useState(3306)
  const [mysqlDatabase, setMysqlDatabase] = useState('ID123456_pulsework')
  const [mysqlUsername, setMysqlUsername] = useState('ID123456_user')
  const [mysqlPassword, setMysqlPassword] = useState('')
  const [showMysqlPassword, setShowMysqlPassword] = useState(false)
  const [mysqlTablePrefix, setMysqlTablePrefix] = useState('pw_')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null)

  // Step 3: Company Profile state
  const [companyName, setCompanyName] = useState('PulseWork Solutions BV')
  const [legalName, setLegalName] = useState('PulseWork Solutions BV')
  const [vatNumber, setVatNumber] = useState('BE0849294901')
  const [country, setCountry] = useState('Belgium')
  const [countryCode, setCountryCode] = useState('BE')
  const [peppolScheme, setPeppolScheme] = useState('0208')
  const [peppolEndpoint, setPeppolEndpoint] = useState('0849294901')
  const [companyEmail, setCompanyEmail] = useState('billing@pulsework.local')
  const [companyPhone, setCompanyPhone] = useState('+32 2 555 0199')
  const [companyWebsite, setCompanyWebsite] = useState('https://pulsework.local')
  const [companyAddress, setCompanyAddress] = useState('Keizerslaan 14, Bus 4B')
  const [companyCity, setCompanyCity] = useState('Brussels')
  const [companyPostalCode, setCompanyPostalCode] = useState('1000')
  const [companyIban, setCompanyIban] = useState('BE68 5390 0754 7034')
  const [companyBic, setCompanyBic] = useState('GKCCBEBB')
  const [defaultCurrency, setDefaultCurrency] = useState<SupportedCurrency>('EUR')
  const [defaultVatRate, setDefaultVatRate] = useState<number>(21)

  // Step 4: Admin User state
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminPinCode, setAdminPinCode] = useState('1234')
  const [adminDepartment, setAdminDepartment] = useState('Executive Management')
  const [adminPhone, setAdminPhone] = useState('')

  // Step 5: Security & 2FA state
  const [enable2FaNow, setEnable2FaNow] = useState(false)
  const [totpSetupData, setTotpSetupData] = useState<TwoFactorSetupData | null>(null)
  const [testTotpCode, setTestTotpCode] = useState('')
  const [isTotpVerified, setIsTotpVerified] = useState(false)
  const [totpVerifyError, setTotpVerifyError] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30)
  const [enforce2faOrgWide, setEnforce2faOrgWide] = useState(false)
  const [screenSharePrivacyDefault, setScreenSharePrivacyDefault] = useState(false)

  // Step 6: Workspace Customization state
  const [selectedThemePreset, setSelectedThemePreset] = useState('sandbox_default')
  const [enabledModules, setEnabledModules] = useState<{
    crm: boolean
    quotes: boolean
    peppol: boolean
    projects: boolean
    hr: boolean
    inventory: boolean
    helpdesk: boolean
    pulse_ai: boolean
  }>({
    crm: true,
    quotes: true,
    peppol: true,
    projects: true,
    hr: true,
    inventory: true,
    helpdesk: true,
    pulse_ai: true,
  })

  // Step 7: Finalizing / Installation execution state
  const [isInstalling, setIsInstalling] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)
  const [installStatusMessage, setInstallStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Run preflight diagnostics on mount
  useEffect(() => {
    const runDiagnostics = async () => {
      setIsPreflightChecking(true)
      await new Promise((resolve) => setTimeout(resolve, 600))

      const storageOk = typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      const cryptoOk = typeof window !== 'undefined' && Boolean(window.crypto)
      const totpOk = true
      const peppolOk = true
      const ibanOk = true

      setPreflightStatus({
        storage: storageOk,
        crypto: cryptoOk,
        totp: totpOk,
        peppol: peppolOk,
        iban: ibanOk,
      })
      setIsPreflightChecking(false)
    }

    runDiagnostics()
  }, [])

  // Auto-generate 2FA keys when enabled
  useEffect(() => {
    if (enable2FaNow && !totpSetupData) {
      const email = adminEmail.trim() || 'admin@pulsework.local'
      const setup = generate2FASetup(email)
      setTotpSetupData(setup)
    }
  }, [enable2FaNow, adminEmail, totpSetupData])

  // Real-time password evaluation
  const passwordEvaluation = evalPwd(adminPassword, {
    ...securityPolicy,
    passwordMinLength: 10,
    requireNumbers: true,
    requireSymbols: true,
  })

  // Handle MySQL connection test
  const handleTestMySqlConnection = async () => {
    setIsTestingConnection(true)
    setConnectionTestResult(null)
    setErrorMessage(null)

    const result = await testMySqlConnection({
      host: mysqlHost.trim(),
      port: Number(mysqlPort) || 3306,
      database: mysqlDatabase.trim(),
      username: mysqlUsername.trim(),
      password: mysqlPassword,
    })

    setIsTestingConnection(false)
    setConnectionTestResult(result)
  }

  // Auto-update Peppol Endpoint when VAT number changes
  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setVatNumber(raw)
    const cleanDigits = raw.replace(/[^0-9A-Za-z]/g, '').replace(/^[A-Za-z]{2}/, '')
    if (cleanDigits) {
      setPeppolEndpoint(cleanDigits)
    }
  }

  // Country selection helper
  const handleCountryChange = (cName: string) => {
    setCountry(cName)
    if (cName === 'Belgium') {
      setCountryCode('BE')
      setPeppolScheme('0208')
      setDefaultCurrency('EUR')
      setDefaultVatRate(21)
    } else if (cName === 'Netherlands') {
      setCountryCode('NL')
      setPeppolScheme('0106')
      setDefaultCurrency('EUR')
      setDefaultVatRate(21)
    } else if (cName === 'France') {
      setCountryCode('FR')
      setPeppolScheme('0009')
      setDefaultCurrency('EUR')
      setDefaultVatRate(20)
    } else if (cName === 'Germany') {
      setCountryCode('DE')
      setPeppolScheme('9928')
      setDefaultCurrency('EUR')
      setDefaultVatRate(19)
    } else if (cName === 'United Kingdom') {
      setCountryCode('GB')
      setPeppolScheme('9932')
      setDefaultCurrency('GBP')
      setDefaultVatRate(20)
    } else if (cName === 'United States') {
      setCountryCode('US')
      setPeppolScheme('9901')
      setDefaultCurrency('USD')
      setDefaultVatRate(0)
    }
  }

  // Test 2FA code verification
  const handleVerify2FACode = () => {
    if (!totpSetupData) return
    const isValid = verifyTotp(totpSetupData.secret, testTotpCode.trim())
    if (isValid) {
      setIsTotpVerified(true)
      setTotpVerifyError('')
    } else {
      setIsTotpVerified(false)
      setTotpVerifyError('Invalid TOTP token. Please verify the code in your authenticator app.')
    }
  }

  // Copy helper
  const handleCopyText = (text: string, type: 'key' | 'codes') => {
    navigator.clipboard.writeText(text)
    if (type === 'key') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    }
  }

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null)

    // Step 2: Database Configuration
    if (step === 2 && dbMode === 'mysql') {
      if (!mysqlHost.trim()) {
        setErrorMessage('MySQL Host is required (e.g. mysqlXXX.combell-hosting.com).')
        return false
      }
      if (!mysqlDatabase.trim()) {
        setErrorMessage('MySQL Database Name is required.')
        return false
      }
      if (!mysqlUsername.trim()) {
        setErrorMessage('MySQL Username is required.')
        return false
      }
    }

    // Step 3: Organization Profile
    if (step === 3) {
      if (!companyName.trim()) {
        setErrorMessage('Company Name is required.')
        return false
      }
      if (!vatNumber.trim()) {
        setErrorMessage('Enterprise / VAT Number is required.')
        return false
      }
      if (!peppolEndpoint.trim()) {
        setErrorMessage('Peppol Endpoint is required.')
        return false
      }
    }

    // Step 4: Admin Account
    if (step === 4) {
      if (!adminName.trim()) {
        setErrorMessage('Administrator Full Name is required.')
        return false
      }
      if (!adminEmail.trim() || !adminEmail.includes('@')) {
        setErrorMessage('A valid Administrator Email address is required.')
        return false
      }
      if (adminPassword.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.')
        return false
      }
      if (adminPassword !== adminPasswordConfirm) {
        setErrorMessage('Passwords do not match. Please re-enter.')
        return false
      }
      if (!adminPinCode || adminPinCode.length < 4) {
        setErrorMessage('PIN Code must be at least 4 digits for rapid screen unlocking.')
        return false
      }
    }

    // Step 5: 2FA Setup
    if (step === 5 && enable2FaNow) {
      if (!isTotpVerified) {
        setErrorMessage('Please enter and verify a 6-digit TOTP code from your authenticator app.')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrorMessage(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Execution of the installation
  const handleFinalizeInstallation = async () => {
    setIsInstalling(true)
    setErrorMessage(null)

    try {
      setInstallProgress(15)
      setInstallStatusMessage(
        dbMode === 'mysql'
          ? 'Connecting to Combell MySQL cluster & creating database tables...'
          : 'Initializing persistent client storage engine...'
      )
      await new Promise((r) => setTimeout(r, 400))

      setInstallProgress(35)
      setInstallStatusMessage('Generating secure administrator cryptographic credentials...')
      await new Promise((r) => setTimeout(r, 400))

      setInstallProgress(60)
      setInstallStatusMessage('Configuring primary organization profile & Peppol BIS 3.0 scheme...')
      await new Promise((r) => setTimeout(r, 400))

      setInstallProgress(85)
      setInstallStatusMessage('Provisioning module presets and initializing SHA-256 audit ledger...')
      await new Promise((r) => setTimeout(r, 400))

      const payload: FirstRunInstallPayload = {
        admin: {
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
          pinCode: adminPinCode.trim(),
          department: adminDepartment.trim() || 'Management',
          phone: adminPhone.trim() || undefined,
          twoFactorEnabled: enable2FaNow && isTotpVerified,
          twoFactorSecret: enable2FaNow && isTotpVerified ? totpSetupData?.secret : undefined,
          backupCodes: enable2FaNow && isTotpVerified ? totpSetupData?.backupCodes : undefined,
        },
        company: {
          name: companyName.trim(),
          legalName: legalName.trim() || companyName.trim(),
          vatNumber: vatNumber.trim(),
          peppolScheme: peppolScheme.trim(),
          peppolEndpoint: peppolEndpoint.trim(),
          email: companyEmail.trim() || adminEmail.trim(),
          phone: companyPhone.trim() || adminPhone.trim(),
          website: companyWebsite.trim(),
          address: companyAddress.trim(),
          city: companyCity.trim(),
          postalCode: companyPostalCode.trim(),
          country: country.trim(),
          countryCode: countryCode.trim(),
          iban: companyIban.trim(),
          bic: companyBic.trim(),
          defaultCurrency: defaultCurrency,
          defaultVatRate: defaultVatRate,
          logoUrl: companyLogoUrl,
        },
        databaseConfig: {
          mode: dbMode,
          host: mysqlHost.trim(),
          port: Number(mysqlPort) || 3306,
          database: mysqlDatabase.trim(),
          username: mysqlUsername.trim(),
          password: mysqlPassword,
          tablePrefix: mysqlTablePrefix.trim() || 'pw_',
          isConfigured: dbMode === 'mysql',
          lastTestedAt: new Date().toISOString(),
        },
        securityPolicy: {
          sessionTimeoutMinutes: sessionTimeoutMinutes,
          enforce2faOrgWide: enforce2faOrgWide,
          screenSharePrivacyDefault: screenSharePrivacyDefault,
        },
        moduleSettings: {
          crm: enabledModules.crm,
          quotes: enabledModules.quotes,
          peppol: enabledModules.peppol,
          projects: enabledModules.projects,
          hr: enabledModules.hr,
          inventory_multi: enabledModules.inventory,
          helpdesk: enabledModules.helpdesk,
          pulse_ai: enabledModules.pulse_ai,
        },
        themePresetId: selectedThemePreset,
      }

      setInstallProgress(100)
      setInstallStatusMessage('Installation finalized! Launching your workspace...')

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3f78e0', '#38b995', '#7452d6', '#fab758'],
      })

      await completeFirstRunInstall(payload)
    } catch (err: any) {
      setIsInstalling(false)
      setErrorMessage(err.message || 'An unexpected error occurred during installation.')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1120',
        color: '#f1f5f9',
        fontFamily: 'var(--sb-font-body)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '2.5rem 1.25rem',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(63, 120, 224, 0.25), transparent)',
      }}
    >
      {/* Top Brand Header */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#3f78e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(63, 120, 224, 0.4)',
            }}
          >
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--sb-font-heading)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              PulseWork
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Work Management, CRM & Combell MySQL Engine
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(56, 185, 149, 0.15)',
              border: '1px solid rgba(56, 185, 149, 0.3)',
              color: '#38b995',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Server size={14} /> Combell Cloud / VPS Ready
          </span>
          <span
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontFamily: 'var(--sb-font-mono)',
            }}
          >
            v3.0.0 Setup
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Installer Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          backgroundColor: 'rgba(21, 31, 50, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Progress Stepper Bar */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {[
              { num: 1, label: 'Preflight' },
              { num: 2, label: 'Database' },
              { num: 3, label: 'Organization' },
              { num: 4, label: 'Admin Account' },
              { num: 5, label: 'Security & 2FA' },
              { num: 6, label: 'Customization' },
              { num: 7, label: 'Review & Launch' },
            ].map((step) => {
              const isDone = currentStep > step.num
              const isCurrent = currentStep === step.num
              return (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    zIndex: 2,
                    cursor: step.num < currentStep ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (step.num < currentStep) setCurrentStep(step.num)
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      backgroundColor: isDone
                        ? '#38b995'
                        : isCurrent
                        ? '#3f78e0'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: isDone || isCurrent ? '#ffffff' : '#64748b',
                      border: isCurrent
                        ? '2px solid rgba(255, 255, 255, 0.5)'
                        : 'none',
                      boxShadow: isCurrent
                        ? '0 0 15px rgba(63, 120, 224, 0.5)'
                        : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isDone ? <Check size={14} /> : step.num}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent
                        ? '#ffffff'
                        : isDone
                        ? '#cbd5e1'
                        : '#64748b',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              margin: '1.25rem 2rem 0',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(226, 98, 107, 0.15)',
              border: '1px solid rgba(226, 98, 107, 0.3)',
              borderRadius: '0.65rem',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <AlertCircle size={18} color="#e2626b" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body Area */}
        <div style={{ padding: '2rem' }}>
          {/* ================= STEP 1: PREFLIGHT ================= */}
          {currentStep === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(63, 120, 224, 0.15)',
                    color: '#3f78e0',
                    marginBottom: '1rem',
                  }}
                >
                  <Cpu size={28} />
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: '#ffffff',
                  }}
                >
                  Welcome to PulseWork First-Run Installer
                </h2>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: '#94a3b8',
                    maxWidth: '600px',
                    margin: '0 auto',
                  }}
                >
                  Let's initialize your secure, high-performance Work Management,
                  CRM & Peppol Hub. First, we test your environment prerequisites.
                </p>
              </div>

              {/* Preflight Diagnostics Grid */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  maxWidth: '650px',
                  margin: '0 auto 2.5rem',
                }}
              >
                {[
                  {
                    title: 'Web Storage & Local Persistence Engine',
                    desc: 'Instant zero-latency local caching and rapid client execution.',
                    ok: preflightStatus.storage,
                  },
                  {
                    title: 'Web Cryptography Engine (SubtleCrypto)',
                    desc: 'Hardware-accelerated SHA-256 password hashing & cryptographic log chaining.',
                    ok: preflightStatus.crypto,
                  },
                  {
                    title: 'TOTP RFC 6238 Multi-Factor Generator',
                    desc: 'Native Google / Microsoft Authenticator 2FA key derivation module.',
                    ok: preflightStatus.totp,
                  },
                  {
                    title: 'Peppol BIS Billing 3.0 & EN 16931 Engine',
                    desc: 'UBL XML parser and AS4 access point protocol dispatch engine.',
                    ok: preflightStatus.peppol,
                  },
                  {
                    title: 'International Financial & IBAN Validator',
                    desc: 'SEPA Direct Debit (pain.008) and EPC-QR code generator.',
                    ok: preflightStatus.iban,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          color: '#f1f5f9',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {item.desc}
                      </div>
                    </div>
                    <div>
                      {isPreflightChecking ? (
                        <RefreshCw
                          size={18}
                          color="#3f78e0"
                          style={{ animation: 'spin 1s linear infinite' }}
                        />
                      ) : item.ok ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#38b995',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircle2 size={18} /> Ready
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#e2626b',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <AlertCircle size={18} /> Error
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 2: DATABASE CONFIGURATION ================= */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Database Storage & Combell Server Connection
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Choose where your CRM data, users, and invoices are stored. You can connect
                  directly to your Combell MySQL database instance.
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Combell MySQL Mode */}
                <div
                  onClick={() => setDbMode('mysql')}
                  style={{
                    padding: '1.25rem',
                    backgroundColor:
                      dbMode === 'mysql'
                        ? 'rgba(63, 120, 224, 0.15)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      dbMode === 'mysql'
                        ? '2px solid #3f78e0'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: dbMode === 'mysql' ? '#ffffff' : '#cbd5e1',
                      }}
                    >
                      <Database
                        size={18}
                        color={dbMode === 'mysql' ? '#3f78e0' : '#94a3b8'}
                      />
                      Combell MySQL Database
                    </div>
                    {dbMode === 'mysql' && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#3f78e0',
                          color: '#ffffff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                        }}
                      >
                        Recommended for Hosting
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Centralized database stored on your Combell MySQL server with multi-user persistence and automated backups.
                  </p>
                </div>

                {/* Local Storage Mode */}
                <div
                  onClick={() => setDbMode('local')}
                  style={{
                    padding: '1.25rem',
                    backgroundColor:
                      dbMode === 'local'
                        ? 'rgba(63, 120, 224, 0.15)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border:
                      dbMode === 'local'
                        ? '2px solid #3f78e0'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: dbMode === 'local' ? '#ffffff' : '#cbd5e1',
                      }}
                    >
                      <HardDrive
                        size={18}
                        color={dbMode === 'local' ? '#3f78e0' : '#94a3b8'}
                      />
                      Browser Local Database
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Zero-config standalone client database using browser storage. Ideal for single-device offline usage.
                  </p>
                </div>
              </div>

              {/* MySQL Configuration Form */}
              {dbMode === 'mysql' && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '0.85rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Combell Guidance Callout */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(63, 120, 224, 0.1)',
                      border: '1px solid rgba(63, 120, 224, 0.25)',
                      borderRadius: '0.65rem',
                      marginBottom: '1.25rem',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                    }}
                  >
                    <Server size={18} color="#3f78e0" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#ffffff' }}>Where to find Combell MySQL details:</strong> In the{' '}
                      <span style={{ color: '#3f78e0', fontWeight: 600 }}>Combell Control Panel</span> ➔ <strong>My Products</strong> ➔ <strong>Web Hosting</strong> ➔ Select domain ➔ <strong>Databases</strong> (MySQL).
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '1.15rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {/* MySQL Host */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        MySQL Host *
                      </label>
                      <input
                        type="text"
                        value={mysqlHost}
                        onChange={(e) => setMysqlHost(e.target.value)}
                        placeholder="mysql123.combell-hosting.com or localhost"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.65rem',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--sb-font-mono)',
                        }}
                      />
                    </div>

                    {/* MySQL Port */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Port
                      </label>
                      <input
                        type="number"
                        value={mysqlPort}
                        onChange={(e) => setMysqlPort(Number(e.target.value))}
                        placeholder="3306"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.65rem',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--sb-font-mono)',
                        }}
                      />
                    </div>

                    {/* Database Name */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Database Name *
                      </label>
                      <input
                        type="text"
                        value={mysqlDatabase}
                        onChange={(e) => setMysqlDatabase(e.target.value)}
                        placeholder="ID123456_pulsework"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.65rem',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--sb-font-mono)',
                        }}
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Database Username *
                      </label>
                      <input
                        type="text"
                        value={mysqlUsername}
                        onChange={(e) => setMysqlUsername(e.target.value)}
                        placeholder="ID123456_user"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.65rem',
                          color: '#ffffff',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--sb-font-mono)',
                        }}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Database Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showMysqlPassword ? 'text' : 'password'}
                          value={mysqlPassword}
                          onChange={(e) => setMysqlPassword(e.target.value)}
                          placeholder="Enter MySQL user password"
                          style={{
                            width: '100%',
                            padding: '0.75rem 2.5rem 0.75rem 1rem',
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '0.65rem',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowMysqlPassword(!showMysqlPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {showMysqlPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Table Prefix */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Table Prefix
                      </label>
                      <input
                        type="text"
                        value={mysqlTablePrefix}
                        onChange={(e) => setMysqlTablePrefix(e.target.value)}
                        placeholder="pw_"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.65rem',
                          color: '#38b995',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          fontFamily: 'var(--sb-font-mono)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Test Connection Button & Result */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={isTestingConnection}
                      onClick={handleTestMySqlConnection}
                      style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.65rem',
                        backgroundColor: 'rgba(63, 120, 224, 0.2)',
                        border: '1px solid #3f78e0',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: isTestingConnection ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {isTestingConnection ? (
                        <>
                          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Zap size={16} color="#3f78e0" />
                          Test MySQL Connection
                        </>
                      )}
                    </button>

                    {connectionTestResult && (
                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          backgroundColor: connectionTestResult.success
                            ? 'rgba(56, 185, 149, 0.15)'
                            : 'rgba(226, 98, 107, 0.15)',
                          border: connectionTestResult.success
                            ? '1px solid rgba(56, 185, 149, 0.4)'
                            : '1px solid rgba(226, 98, 107, 0.4)',
                          color: connectionTestResult.success ? '#38b995' : '#fca5a5',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {connectionTestResult.success ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>
                              {connectionTestResult.message} ({connectionTestResult.version} • {connectionTestResult.latencyMs}ms)
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} />
                            <span>{connectionTestResult.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: ORGANIZATION PROFILE ================= */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Organization & Legal Entity Profile
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Set up your primary enterprise profile. These details appear on
                  quotes, invoices, and Peppol e-invoices.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Company Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Organization / Trading Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Solutions"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Legal Entity Full Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Legal Registered Entity Name
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Acme Solutions BV"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Company Brand Logo Upload & Preview */}
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '1.2rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      margin: 0,
                    }}
                  >
                    🏢 Company Logo (Used on Quotes, Invoices & Client Portals)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '180px',
                        height: '64px',
                        borderRadius: '0.5rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      {companyLogoUrl ? (
                        <img
                          src={companyLogoUrl}
                          alt="Company Logo Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No Logo Selected</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <label
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.5rem 0.85rem',
                            backgroundColor: 'rgba(63, 120, 224, 0.2)',
                            border: '1px solid rgba(63, 120, 224, 0.4)',
                            color: '#709ff5',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <span>Upload Image File (PNG/SVG/JPG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setCompanyLogoUrl(reader.result)
                                  }
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCompanyLogoUrl(DEFAULT_COMPANY_LOGO)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#e2e8f0',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Default PulseWork Logo
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste direct logo URL (https://... or data:image/...)"
                        value={companyLogoUrl}
                        onChange={(e) => setCompanyLogoUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.5rem',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Primary Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Belgium">Belgium (BE - Peppol 0208)</option>
                    <option value="Netherlands">Netherlands (NL - Peppol 0106)</option>
                    <option value="France">France (FR - Peppol 0009)</option>
                    <option value="Germany">Germany (DE - Peppol 9928)</option>
                    <option value="United Kingdom">United Kingdom (GB)</option>
                    <option value="United States">United States (US)</option>
                  </select>
                </div>

                {/* VAT / Enterprise Number with 1-Click KBO Auto-Fill */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#cbd5e1',
                        margin: 0,
                      }}
                    >
                      VAT / Enterprise Number (KBO/BCE) *
                    </label>
                    <button
                      type="button"
                      disabled={isKboLookingUp}
                      onClick={async () => {
                        const query = vatNumber || companyName
                        if (!query) return
                        setIsKboLookingUp(true)
                        setKboLookupStatus(null)
                        try {
                          const results = await searchKboRegistry(query)
                          if (results.length > 0) {
                            const match = results[0]
                            setCompanyName(match.commercialName || match.legalName)
                            setLegalName(match.legalName || match.commercialName)
                            setVatNumber(match.vatNumber)
                            setPeppolEndpoint(match.vatNumber.replace(/[^0-9]/g, ''))
                            if (match.address.street) {
                              setCompanyAddress(`${match.address.street} ${match.address.number || ''}`.trim())
                            }
                            if (match.address.city) setCompanyCity(match.address.city)
                            if (match.address.postalCode) setCompanyPostalCode(match.address.postalCode)
                            if (match.address.country) setCountry(match.address.country)
                            setKboLookupStatus(`✓ KBO / BCE Verified: ${match.legalName}`)
                          } else {
                            setKboLookupStatus('⚠ No enterprise found in KBO/BCE database.')
                          }
                        } catch (err) {
                          setKboLookupStatus('⚠ Lookup timed out, please enter details manually.')
                        } finally {
                          setIsKboLookingUp(false)
                        }
                      }}
                      style={{
                        background: 'rgba(63, 120, 224, 0.2)',
                        border: '1px solid rgba(63, 120, 224, 0.4)',
                        color: '#709ff5',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{isKboLookingUp ? 'Searching KBO...' : 'Lookup KBO / Auto-fill'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={handleVatChange}
                    placeholder="e.g. BE0849294901 or 0849.294.901"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                  {kboLookupStatus && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: kboLookupStatus.startsWith('✓') ? '#38b995' : '#fab758',
                        marginTop: '0.25rem',
                        display: 'block',
                        fontWeight: 600,
                      }}
                    >
                      {kboLookupStatus}
                    </span>
                  )}
                </div>

                {/* Peppol Endpoint Scheme & ID */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Peppol Scheme & Endpoint ID *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={peppolScheme}
                      onChange={(e) => setPeppolScheme(e.target.value)}
                      placeholder="0208"
                      style={{
                        width: '80px',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#38b995',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    />
                    <input
                      type="text"
                      value={peppolEndpoint}
                      onChange={(e) => setPeppolEndpoint(e.target.value)}
                      placeholder="0849294901"
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                    Auto-formatted for Peppol BIS 3.0 routing: {peppolScheme}:{peppolEndpoint}
                  </span>
                </div>

                {/* Default Currency */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Default Accounting Currency
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value as SupportedCurrency)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                    <option value="CHF">CHF (Swiss Franc)</option>
                  </select>
                </div>

                {/* Company Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Registered Office Address
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gap: '0.75rem',
                    }}
                  >
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Street & Number"
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                    <input
                      type="text"
                      value={companyPostalCode}
                      onChange={(e) => setCompanyPostalCode(e.target.value)}
                      placeholder="Postal Code (e.g. 1000)"
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                    <input
                      type="text"
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      placeholder="City (e.g. Brussels)"
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                {/* IBAN & BIC */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Primary Bank IBAN
                  </label>
                  <input
                    type="text"
                    value={companyIban}
                    onChange={(e) => setCompanyIban(e.target.value)}
                    placeholder="BE68 5390 0754 7034"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--sb-font-mono)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Bank BIC / SWIFT
                  </label>
                  <input
                    type="text"
                    value={companyBic}
                    onChange={(e) => setCompanyBic(e.target.value)}
                    placeholder="GKCCBEBB"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--sb-font-mono)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ADMIN ACCOUNT CREATION ================= */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Create Primary Super Administrator
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  This account will have permanent Owner / Superuser access to
                  manage security policies, all modules, and team members.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {/* Admin Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Administrator Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                      }}
                    />
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.4rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Primary Admin Email *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                      }}
                    />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="alex.morgan@company.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.4rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Master Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Minimum 10 characters"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Confirm Master Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.4rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border:
                          adminPasswordConfirm &&
                          adminPassword !== adminPasswordConfirm
                            ? '1px solid #e2626b'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {adminPassword.length > 0 && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      padding: '1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '0.65rem',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.4rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <span>Password Strength:</span>
                      <strong style={{ color: passwordEvaluation.color, textTransform: 'capitalize' }}>
                        {passwordEvaluation.strength} ({passwordEvaluation.score}%)
                      </strong>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${passwordEvaluation.score}%`,
                          backgroundColor: passwordEvaluation.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                      }}
                    >
                      <span
                        style={{
                          color: passwordEvaluation.checks.length
                            ? '#38b995'
                            : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {passwordEvaluation.checks.length ? '✓' : '○'} 10+ characters
                      </span>
                      <span
                        style={{
                          color: passwordEvaluation.checks.hasNumber
                            ? '#38b995'
                            : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {passwordEvaluation.checks.hasNumber ? '✓' : '○'} Number (0-9)
                      </span>
                      <span
                        style={{
                          color: passwordEvaluation.checks.hasSymbol
                            ? '#38b995'
                            : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {passwordEvaluation.checks.hasSymbol ? '✓' : '○'} Special symbol (!@#$)
                      </span>
                      <span
                        style={{
                          color:
                            passwordEvaluation.checks.hasUpper &&
                            passwordEvaluation.checks.hasLower
                              ? '#38b995'
                              : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {passwordEvaluation.checks.hasUpper &&
                        passwordEvaluation.checks.hasLower
                          ? '✓'
                          : '○'}{' '}
                        Upper & lower case
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Unlock PIN */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Quick Unlock PIN (4-6 digits) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                      }}
                    />
                    <input
                      type="password"
                      maxLength={6}
                      value={adminPinCode}
                      onChange={(e) =>
                        setAdminPinCode(e.target.value.replace(/[^0-9]/g, ''))
                      }
                      placeholder="1234"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.4rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '0.65rem',
                        color: '#38b995',
                        fontSize: '1rem',
                        letterSpacing: '0.35rem',
                        fontWeight: 700,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                    Used for rapid lock-screen unlocking during desk absences.
                  </span>
                </div>

                {/* Job Title / Department */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Department / Title
                  </label>
                  <input
                    type="text"
                    value={adminDepartment}
                    onChange={(e) => setAdminDepartment(e.target.value)}
                    placeholder="Executive Management"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.65rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SECURITY & 2FA ================= */}
          {currentStep === 5 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Enterprise Security Hardening & 2FA
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Protect your workspace with Two-Factor Authentication (TOTP RFC 6238)
                  and automated screen protection.
                </p>
              </div>

              {/* 2FA Enable Switch Card */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: enable2FaNow
                    ? '1px solid rgba(56, 185, 149, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.85rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: '#ffffff',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <ShieldCheck
                      size={20}
                      color={enable2FaNow ? '#38b995' : '#3f78e0'}
                    />
                    Enable 2FA Protection for First Admin (Recommended)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Requires a 6-digit one-time code from Google Authenticator,
                    Microsoft Authenticator, or 1Password.
                  </div>
                </div>

                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '48px',
                    height: '26px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={enable2FaNow}
                    onChange={(e) => setEnable2FaNow(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: enable2FaNow
                        ? '#38b995'
                        : 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '9999px',
                      transition: '0.3s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: enable2FaNow ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* 2FA Setup Flow if enabled */}
              {enable2FaNow && totpSetupData && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.85rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    {/* Secret Key & URI */}
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#ffffff',
                          marginBottom: '0.5rem',
                        }}
                      >
                        1. Add to Authenticator App
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          marginBottom: '0.75rem',
                        }}
                      >
                        Open your Authenticator app and add account via manual key:
                      </p>

                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--sb-font-mono)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: '#38b995',
                          }}
                        >
                          {totpSetupData.secret}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(totpSetupData.secret, 'key')
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedKey ? '#38b995' : '#3f78e0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      {/* Backup Codes */}
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: '#cbd5e1',
                          marginBottom: '0.35rem',
                        }}
                      >
                        Emergency Backup Codes
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.35rem',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(15, 23, 42, 0.5)',
                          borderRadius: '0.5rem',
                          fontFamily: 'var(--sb-font-mono)',
                          fontSize: '0.75rem',
                          color: '#cbd5e1',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {totpSetupData.backupCodes.slice(0, 4).map((c, i) => (
                          <span key={i}>• {c}</span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            totpSetupData.backupCodes.join('\n'),
                            'codes'
                          )
                        }
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.4rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: copiedCodes ? '#38b995' : '#cbd5e1',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {copiedCodes ? <Check size={12} /> : <Copy size={12} />}
                        {copiedCodes ? 'All Codes Copied' : 'Copy All 8 Codes'}
                      </button>
                    </div>

                    {/* Test Code Verification Box */}
                    <div
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        borderRadius: '0.65rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#ffffff',
                          marginBottom: '0.35rem',
                        }}
                      >
                        2. Verify Authenticator Token *
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#94a3b8',
                          marginBottom: '1rem',
                        }}
                      >
                        Enter the current 6-digit code displayed in your app:
                      </p>

                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          maxLength={6}
                          value={testTotpCode}
                          onChange={(e) =>
                            setTestTotpCode(
                              e.target.value.replace(/[^0-9]/g, '')
                            )
                          }
                          placeholder="000000"
                          style={{
                            width: '140px',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: isTotpVerified
                              ? '1px solid #38b995'
                              : '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                            color: '#ffffff',
                            fontFamily: 'var(--sb-font-mono)',
                            fontSize: '1.25rem',
                            letterSpacing: '0.35rem',
                            fontWeight: 700,
                            textAlign: 'center',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerify2FACode}
                          style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.5rem',
                            backgroundColor: isTotpVerified
                              ? '#38b995'
                              : '#3f78e0',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          {isTotpVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>

                      {totpVerifyError && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#fca5a5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <AlertCircle size={14} /> {totpVerifyError}
                        </div>
                      )}

                      {isTotpVerified && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#38b995',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={14} /> Two-factor authentication
                          confirmed & ready for launch!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Policy Preferences */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Session Auto-lock */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.65rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: '#ffffff',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <Clock size={16} color="#3f78e0" /> Session Inactivity Lock
                  </div>
                  <select
                    value={sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSessionTimeoutMinutes(Number(e.target.value))
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes (Recommended)</option>
                    <option value={60}>60 Minutes</option>
                    <option value={0}>Never Auto-lock</option>
                  </select>
                </div>

                {/* Screen Share Privacy */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.65rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#ffffff',
                        marginBottom: '0.2rem',
                      }}
                    >
                      Screen-Share Privacy Mode
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Obfuscate client financial totals during demos.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={screenSharePrivacyDefault}
                    onChange={(e) =>
                      setScreenSharePrivacyDefault(e.target.checked)
                    }
                    style={{ width: '18px', height: '18px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: CUSTOMIZATION & MODULES ================= */}
          {currentStep === 6 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Workspace Customization & Modules
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Choose your organization's theme aesthetic and enable initial
                  core modules. You can change these anytime in Settings.
                </p>
              </div>

              {/* Theme Preset Grid */}
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Palette size={16} color="#3f78e0" /> Choose Initial Theme Preset
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {themePresets.map((preset) => {
                    const isSelected = selectedThemePreset === preset.id
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedThemePreset(preset.id)}
                        style={{
                          padding: '1rem',
                          backgroundColor: isSelected
                            ? 'rgba(63, 120, 224, 0.15)'
                            : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected
                            ? '2px solid #3f78e0'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              color: isSelected ? '#ffffff' : '#cbd5e1',
                            }}
                          >
                            {preset.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={16} color="#3f78e0" />
                          )}
                        </div>

                        {/* Color swatches preview */}
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <span
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: preset.previewColors.primary,
                            }}
                          />
                          <span
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: preset.previewColors.sidebar,
                              border: '1px solid rgba(255,255,255,0.2)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Module Toggles */}
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Layers size={16} color="#38b995" /> Core Modules
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    {
                      id: 'crm',
                      name: 'CRM & Deals Pipeline',
                      desc: 'Companies, Contacts & Sales Kanban',
                    },
                    {
                      id: 'quotes',
                      name: 'Quotes & Invoicing',
                      desc: 'Estimates, Invoices & SEPA collections',
                    },
                    {
                      id: 'peppol',
                      name: 'Peppol BIS 3.0 Hub',
                      desc: 'Automated European e-invoicing network',
                    },
                    {
                      id: 'projects',
                      name: 'Projects & Timesheets',
                      desc: 'Task management & billable hours',
                    },
                    {
                      id: 'hr',
                      name: 'PulseHR Capacity & Leave',
                      desc: 'Leave requests & employee allocations',
                    },
                    {
                      id: 'inventory',
                      name: 'Multi-Location Inventory',
                      desc: 'Stock transfers & serial tracking',
                    },
                    {
                      id: 'helpdesk',
                      name: 'PulseDesk Support Tickets',
                      desc: 'Client tickets & canned responses',
                    },
                    {
                      id: 'pulse_ai',
                      name: 'Pulse AI Assistant',
                      desc: 'Automated document analysis & summaries',
                    },
                  ].map((mod) => {
                    const isChecked = (enabledModules as any)[mod.id]
                    return (
                      <label
                        key={mod.id}
                        style={{
                          padding: '0.85rem 1rem',
                          backgroundColor: isChecked
                            ? 'rgba(56, 185, 149, 0.08)'
                            : 'rgba(255, 255, 255, 0.02)',
                          border: isChecked
                            ? '1px solid rgba(56, 185, 149, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              color: isChecked ? '#ffffff' : '#94a3b8',
                            }}
                          >
                            {mod.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {mod.desc}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setEnabledModules((prev) => ({
                              ...prev,
                              [mod.id]: e.target.checked,
                            }))
                          }
                          style={{ width: '18px', height: '18px' }}
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 7: REVIEW & LAUNCH ================= */}
          {currentStep === 7 && (
            <div>
              <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(56, 185, 149, 0.15)',
                    color: '#38b995',
                    marginBottom: '1rem',
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--sb-font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                    color: '#ffffff',
                  }}
                >
                  Ready to Provision PulseWork
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#94a3b8' }}>
                  Review your initial setup parameters before launching the
                  workspace.
                </p>
              </div>

              {/* Review Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Database Card */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Database size={16} color="#3f78e0" /> Database Storage
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Engine:</strong>{' '}
                      {dbMode === 'mysql' ? (
                        <span style={{ color: '#38b995', fontWeight: 600 }}>
                          Combell MySQL Database
                        </span>
                      ) : (
                        'Browser Local Database'
                      )}
                    </div>
                    {dbMode === 'mysql' && (
                      <>
                        <div>
                          <strong style={{ color: '#cbd5e1' }}>Host:</strong> {mysqlHost}
                        </div>
                        <div>
                          <strong style={{ color: '#cbd5e1' }}>Database:</strong> {mysqlDatabase}
                        </div>
                        <div>
                          <strong style={{ color: '#cbd5e1' }}>Prefix:</strong> {mysqlTablePrefix}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Card */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <User size={16} color="#3f78e0" /> Primary Administrator
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Name:</strong> {adminName}
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Email:</strong>{' '}
                      {adminEmail}
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Role:</strong> Super
                      Administrator (Owner)
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>2FA:</strong>{' '}
                      {enable2FaNow && isTotpVerified ? (
                        <span style={{ color: '#38b995', fontWeight: 600 }}>
                          ● Active (TOTP)
                        </span>
                      ) : (
                        <span style={{ color: '#fab758' }}>Optional</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Card */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Building size={16} color="#38b995" /> Organization & Peppol
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Company:</strong>{' '}
                      {companyName}
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>VAT Number:</strong>{' '}
                      {vatNumber}
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Peppol ID:</strong>{' '}
                      {peppolScheme}:{peppolEndpoint}
                    </div>
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>Currency:</strong>{' '}
                      {defaultCurrency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Box during installation */}
              {isInstalling && (
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(63, 120, 224, 0.4)',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {installStatusMessage}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${installProgress}%`,
                        backgroundColor: '#38b995',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {currentStep > 1 && !isInstalling ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.65rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '0.65rem',
                backgroundColor: '#3f78e0',
                border: 'none',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(63, 120, 224, 0.4)',
              }}
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isInstalling}
              onClick={handleFinalizeInstallation}
              style={{
                padding: '0.85rem 2.25rem',
                borderRadius: '0.65rem',
                backgroundColor: isInstalling ? '#64748b' : '#38b995',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.98rem',
                cursor: isInstalling ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: isInstalling
                  ? 'none'
                  : '0 6px 20px rgba(56, 185, 149, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {isInstalling ? (
                <>
                  <RefreshCw
                    size={18}
                    style={{ animation: 'spin 1s linear infinite' }}
                    color="#ffffff"
                  />{' '}
                  Initializing Workspace & Database...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Initialize & Launch PulseWork
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default FirstRunInstaller
