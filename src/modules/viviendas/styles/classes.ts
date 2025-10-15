/**
 * 🎨 Estilos para Viviendas
 */

import { cn } from '@/lib/utils'

export const viviendasPageStyles = {
  container: cn(
    'flex flex-col gap-6 p-6',
    'min-h-screen bg-background'
  ),

  header: cn(
    'flex items-center justify-between',
    'mb-6'
  ),

  grid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  ),

  loadingGrid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
  ),

  loadingCard: cn(
    'h-64 bg-muted animate-pulse rounded-lg'
  ),
} as const

export const viviendaCardStyles = {
  card: cn(
    'group relative',
    'bg-card rounded-lg border shadow-sm',
    'hover:shadow-md transition-all duration-200',
    'overflow-hidden'
  ),

  header: cn(
    'p-4 border-b bg-muted/30'
  ),

  content: cn(
    'p-4 space-y-3'
  ),

  footer: cn(
    'p-4 border-t bg-muted/20',
    'flex items-center justify-between'
  ),

  badge: cn(
    'px-2 py-1 rounded-full text-xs font-medium'
  ),

  actions: cn(
    'flex items-center gap-2'
  ),

  button: cn(
    'p-2 rounded-md transition-colors',
    'hover:bg-muted'
  ),
} as const
