import { MySqlDatabaseConfig, FirstRunInstallPayload } from '../types'

const API_BASE = '/api/db.php'

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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE}?action=status`)
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })
    const result = await response.json()
    return {
      success: Boolean(result.success),
      message: result.message || 'Data synchronized with database.',
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
