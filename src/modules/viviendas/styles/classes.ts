/**
 * 🎨 Estilos para Viviendas
 */

import { cn } from '@/lib/utils'

export const viviendasPageStyles = {
  container: cn(
    'flex flex-col gap-4 p-4',
    'min-h-screen bg-background'
  ),

  header: cn(
    'flex items-center justify-between',
    'mb-4'
  ),

  grid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
  ),

  loadingGrid: cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
  ),

  loadingCard: cn(
    'h-56 bg-muted animate-pulse rounded-lg'
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
    'p-3 border-b bg-muted/30'
  ),

  content: cn(
    'p-3 space-y-2.5'
  ),

  footer: cn(
    'p-3 border-t bg-muted/20',
    'flex items-center justify-between'
  ),

  badge: cn(
    'px-2 py-0.5 rounded-full text-[10px] font-medium'
  ),

  actions: cn(
    'flex items-center gap-1.5'
  ),

  button: cn(
    'p-1.5 rounded-md transition-colors',
    'hover:bg-muted'
  ),
} as const
