import { MySqlDatabaseConfig, FirstRunInstallPayload, UserAccount } from '../types'

const API_BASE = '/api/db.php'
const AUTH_API = '/api/auth.php'
const JWT_STORAGE_KEY = 'pulsework_jwt_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(JWT_STORAGE_KEY) || localStorage.getItem(JWT_STORAGE_KEY) || null
}

export function setAuthToken(token: string | null, remember: boolean = true): void {
  if (typeof window === 'undefined') return
  if (token) {
    if (remember) {
      localStorage.setItem(JWT_STORAGE_KEY, token)
    } else {
      sessionStorage.setItem(JWT_STORAGE_KEY, token)
    }
  } else {
    localStorage.removeItem(JWT_STORAGE_KEY)
    sessionStorage.removeItem(JWT_STORAGE_KEY)
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export interface AuthLoginResult {
  success: boolean
  token?: string
  user?: Partial<UserAccount>
  requires2fa?: boolean
  message?: string
  error?: string
}

export async function loginServerApi(
  emailOrName: string,
  password?: string,
  totpCode?: string,
  rememberMe: boolean = true
): Promise<AuthLoginResult> {
  try {
    const response = await fetch(`${AUTH_API}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrName,
        password: password || '',
        totpCode: totpCode || '',
      }),
    })

    const result = await response.json()
    if (result.success && result.token) {
      setAuthToken(result.token, rememberMe)
      return {
        success: true,
        token: result.token,
        user: result.user,
        message: result.message,
      }
    }

    return {
      success: false,
      requires2fa: Boolean(result.requires2fa),
      message: result.message || 'Login failed',
      error: result.message || result.error || 'Authentication error',
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Could not connect to authentication server.',
    }
  }
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  version?: string
  latencyMs?: number
  tablesCount?: number
  error?: string
}

export interface BootstrapResult {
  configured: boolean
  installed: boolean
  engine?: string
  data?: any
  dbConfig?: Partial<MySqlDatabaseConfig>
  message?: string
  error?: string
}

export async function testMySqlConnection(
  config: Partial<MySqlDatabaseConfig>
): Promise<ConnectionTestResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)

    const response = await fetch(`${API_BASE}?action=test_connection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        database: config.database || '',
        username: config.username || '',
        password: config.password || '',
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        message: result.message || 'Connected to MySQL server successfully.',
        version: result.server_version || 'MySQL 8.0',
        latencyMs: result.latency_ms || 15,
        tablesCount: result.tables_count || 0,
      }
    } else {
      return {
        success: false,
        message: result.message || result.error || 'Failed to connect to database.',
        error: result.error,
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out. Please verify host, port, and database firewall rules.',
      }
    }
    return {
      success: false,
      message: 'Could not reach database bridge API (/api/db.php).',
      error: err.message,
    }
  }
}

export async function initializeMySqlSchema(
  config: Partial<MySqlDatabaseConfig>,
  initialData?: {
    admin?: any
    companyProfile?: any
    legalEntity?: any
    auditLog?: any
  }
): Promise<{ success: boolean; message: string; tablesCreated?: number }> {
  try {
    const response = await fetch(`${API_BASE}?action=initialize_schema`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        database: config.database || '',
        username: config.username || '',
        password: config.password || '',
        tablePrefix: config.tablePrefix || 'pw_',
        initialData,
      }),
    })

    const result = await response.json()
    return {
      success: Boolean(result.success),
      message: result.message || 'Database schema initialized.',
      tablesCreated: result.tables_created || 30,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to initialize database schema.',
    }
  }
}

export async function checkServerBootstrap(): Promise<BootstrapResult> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(`${API_BASE}?action=bootstrap`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return { configured: false, installed: false }
    }

    const result = await response.json()
    return {
      configured: Boolean(result.configured),
      installed: Boolean(result.installed),
      engine: result.engine,
      data: result.data,
      dbConfig: result.dbConfig,
      message: result.message,
    }
  } catch (err: any) {
    return {
      configured: false,
      installed: false,
      error: err.message,
    }
  }
}

export async function checkMySqlStatus(): Promise<{
  configured: boolean
  installed?: boolean
  host?: string
  database?: string
  tablesCount?: number
  message?: string
}> {
  try {
    const response = await fetch(`${API_BASE}?action=status`, {
      headers: getAuthHeaders(),
    })
    const result = await response.json()
    return {
      configured: Boolean(result.configured),
      installed: Boolean(result.installed),
      host: result.host,
      database: result.database,
      tablesCount: result.users_count || 0,
      message: result.message,
    }
  } catch (err: any) {
    return {
      configured: false,
      installed: false,
      message: err.message,
    }
  }
}

export async function syncDataToMySql(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}?action=sync_all`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ data }),
    })
    const result = await response.json().catch(() => null)
    if (result && typeof result === 'object') {
      return {
        success: Boolean(result.success),
        message: result.message || (result.success ? 'Data synchronized with database.' : 'Sync failed.'),
      }
    }
    return {
      success: response.ok,
      message: response.ok ? 'Data synchronized with database.' : `Server returned HTTP ${response.status}`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Sync failed.',
    }
  }
}

export const saveDataToDatabase = syncDataToMySql
export const fetchDatabaseState = checkServerBootstrap
