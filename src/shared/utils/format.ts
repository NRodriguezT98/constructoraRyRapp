/**
 * Utilidades para formateo de datos
 */

// Formatear números
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

// Formatear moneda
export const formatCurrency = (
  amount: number,
  currency = 'COP'
): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatear porcentaje
export const formatPercentage = (
  value: number,
  decimals = 1
): string => {
  return `${formatNumber(value, decimals)}%`
}

// Formatear fechas
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' } as const,
    long: { day: '2-digit', month: 'long', year: 'numeric' } as const,
    full: {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    } as const,
  }

  return new Intl.DateTimeFormat('es-CO', formats[format]).format(d)
}

// Formatear hora
export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Formatear fecha y hora
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`
}

// Formatear teléfono
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// Formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Formatear tiempo relativo
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  return 'hace un momento'
}

// Truncar texto
export const truncate = (text: string, length = 50): string => {
  if (text.length <= length) return text
  return `${text.substring(0, length)}...`
}

// Capitalizar primera letra
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Capitalizar cada palabra
export const capitalizeWords = (text: string): string => {
  return text.split(' ').map(capitalize).join(' ')
}

// Slugify texto
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
