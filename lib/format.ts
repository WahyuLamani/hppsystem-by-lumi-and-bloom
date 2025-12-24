import { format } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format currency ke Rupiah
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format number dengan separator ribuan
 */
export function formatNumber(num: number | string, decimals: number = 0): string {
  const number = typeof num === 'string' ? parseFloat(num) : num
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

/**
 * Format date ke format Indonesia
 */
export function formatDate(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: id })
}

/**
 * Format date ke format ISO untuk input date
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Parse input currency (remove non-numeric chars)
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '')
  return parseInt(cleaned) || 0
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `${formatNumber(num, 2)}%`
}

/**
 * Truncate text dengan ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Generate kode otomatis
 */
export function generateCode(prefix: string, number: number, length: number = 3): string {
  const paddedNumber = number.toString().padStart(length, '0')
  return `${prefix}-${paddedNumber}`
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}