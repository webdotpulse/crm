import { getAuthHeaders } from './mysqlService'
import {
  Company,
  Deal,
  Invoice,
  Project,
  Task,
  TimeEntry,
  Quotation,
  Contact,
  IndividualClient,
  Product,
  Expense,
  Supplier,
  SubscriptionContract,
  Contract,
  WorkOrder,
  MileageTrip,
  PurchaseOrder,
  DunningNotice,
  SupportTicket,
} from '../types'

const V1_BASE = '/api/v1'

export interface ApiPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  pagination?: ApiPagination
  message?: string
}

export interface ApiSingleResponse<T> {
  success: boolean
  data?: T
  version?: number
  message?: string
  error?: string
  conflict?: boolean
  serverRecord?: T
  serverVersion?: number
}

/**
 * Fetch a paginated and delta-filtered list of resources
 */
export async function fetchResourceList<T>(
  entity: string,
  params?: { page?: number; limit?: number; updated_since?: string }
): Promise<ApiListResponse<T>> {
  try {
    const url = new URL(`${window.location.origin}${V1_BASE}/${entity}`)
    if (params?.page) url.searchParams.set('page', String(params.page))
    if (params?.limit) url.searchParams.set('limit', String(params.limit))
    if (params?.updated_since) url.searchParams.set('updated_since', params.updated_since)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      // Fallback if URL rewrite isn't active: direct v1.php?endpoint=...
      const fallbackUrl = new URL(`${window.location.origin}/api/v1.php`)
      fallbackUrl.searchParams.set('endpoint', entity)
      if (params?.page) fallbackUrl.searchParams.set('page', String(params.page))
      if (params?.limit) fallbackUrl.searchParams.set('limit', String(params.limit))
      if (params?.updated_since) fallbackUrl.searchParams.set('updated_since', params.updated_since)

      const fbRes = await fetch(fallbackUrl.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const fbJson = await fbRes.json()
      return {
        success: Boolean(fbJson.success),
        data: fbJson.data || [],
        pagination: fbJson.pagination,
      }
    }

    const json = await response.json()
    return {
      success: Boolean(json.success),
      data: json.data || [],
      pagination: json.pagination,
    }
  } catch (err: any) {
    return {
      success: false,
      data: [],
      message: err.message,
    }
  }
}

/**
 * Fetch a single resource by ID
 */
export async function fetchResourceById<T>(entity: string, id: string): Promise<ApiSingleResponse<T>> {
  try {
    const response = await fetch(`${V1_BASE}/${entity}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const json = await response.json()
    return {
      success: Boolean(json.success),
      data: json.data,
      message: json.message,
      error: json.error,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

/**
 * Create a new resource (POST /api/v1/{entity})
 */
export async function createResource<T extends { id?: string }>(
  entity: string,
  data: T
): Promise<ApiSingleResponse<T>> {
  try {
    let response = await fetch(`${V1_BASE}/${entity}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok && response.status === 404) {
      // Direct v1.php fallback
      response = await fetch(`/api/v1.php?endpoint=${entity}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
    }

    const json = await response.json()
    return {
      success: Boolean(json.success),
      data: json.data,
      version: json.data?.version || 1,
      message: json.message,
      error: json.error,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

/**
 * Update a resource with Optimistic Locking (PUT /api/v1/{entity}/{id})
 * Detects HTTP 409 Conflict when concurrent edits occur.
 */
export async function updateResource<T extends { id: string; version?: number }>(
  entity: string,
  id: string,
  data: Partial<T>
): Promise<ApiSingleResponse<T>> {
  try {
    let response = await fetch(`${V1_BASE}/${entity}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok && response.status === 404) {
      // Direct v1.php fallback
      response = await fetch(`/api/v1.php?endpoint=${entity}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
    }

    const json = await response.json()

    if (response.status === 409) {
      return {
        success: false,
        conflict: true,
        serverRecord: json.serverRecord,
        serverVersion: json.serverVersion,
        error: json.message || 'Conflict: Record was modified by another session',
      }
    }

    return {
      success: Boolean(json.success),
      data: json.data,
      version: json.version || json.data?.version,
      message: json.message,
      error: json.error,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

/**
 * Delete a resource (DELETE /api/v1/{entity}/{id})
 */
export async function deleteResource(
  entity: string,
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    let response = await fetch(`${V1_BASE}/${entity}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok && response.status === 404) {
      response = await fetch(`/api/v1.php?endpoint=${entity}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
    }

    const json = await response.json()
    return {
      success: Boolean(json.success),
      message: json.message,
      error: json.error,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

// ============================================================================
// Entity-Specific Convenience Typed Handlers
// ============================================================================

// Companies
export const fetchCompaniesApi = () => fetchResourceList<Company>('companies')
export const createCompanyApi = (company: Company) => createResource<Company>('companies', company)
export const updateCompanyApi = (company: Company) => updateResource<Company>('companies', company.id, company)
export const deleteCompanyApi = (id: string) => deleteResource('companies', id)

// Deals
export const fetchDealsApi = () => fetchResourceList<Deal>('deals')
export const createDealApi = (deal: Deal) => createResource<Deal>('deals', deal)
export const updateDealApi = (deal: Deal) => updateResource<Deal>('deals', deal.id, deal)
export const deleteDealApi = (id: string) => deleteResource('deals', id)

// Invoices
export const fetchInvoicesApi = () => fetchResourceList<Invoice>('invoices')
export const createInvoiceApi = (invoice: Invoice) => createResource<Invoice>('invoices', invoice)
export const updateInvoiceApi = (invoice: Invoice) => updateResource<Invoice>('invoices', invoice.id, invoice)
export const deleteInvoiceApi = (id: string) => deleteResource('invoices', id)

// Projects & Tasks
export const fetchProjectsApi = () => fetchResourceList<Project>('projects')
export const createProjectApi = (project: Project) => createResource<Project>('projects', project)
export const updateProjectApi = (project: Project) => updateResource<Project>('projects', project.id, project)
export const deleteProjectApi = (id: string) => deleteResource('projects', id)

export const fetchTasksApi = () => fetchResourceList<Task>('tasks')
export const createTaskApi = (task: Task) => createResource<Task>('tasks', task)
export const updateTaskApi = (task: Task) => updateResource<Task>('tasks', task.id, task)
export const deleteTaskApi = (id: string) => deleteResource('tasks', id)

// Time Entries
export const fetchTimeEntriesApi = () => fetchResourceList<TimeEntry>('time_entries')
export const createTimeEntryApi = (entry: TimeEntry) => createResource<TimeEntry>('time_entries', entry)
export const updateTimeEntryApi = (entry: TimeEntry) => updateResource<TimeEntry>('time_entries', entry.id, entry)
export const deleteTimeEntryApi = (id: string) => deleteResource('time_entries', id)
