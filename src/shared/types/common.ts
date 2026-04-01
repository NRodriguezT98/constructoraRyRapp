/**
 * Tipos comunes utilizados en toda la aplicación
 */

// Tipos de respuesta API
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Tipos de estado
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T = unknown> {
  data?: T
  loading: boolean
  error?: string
}

// Tipos de ordenamiento
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

// Tipos de filtro
export interface FilterConfig {
  field: string
  value: unknown
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in'
}

// Tipos de paginación
export interface PaginationConfig {
  page: number
  pageSize: number
}

// Tipos de búsqueda
export interface SearchConfig {
  query: string
  fields?: string[]
}

// Opciones de select
export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
  icon?: string
}

// Metadata de archivos
export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy?: string
}

// Auditoría
export interface AuditInfo {
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

// Usuario (simplificado)
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
}

// Notificación
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}
