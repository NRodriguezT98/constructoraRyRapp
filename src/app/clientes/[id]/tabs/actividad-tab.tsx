'use client'

/**
 * ✅ TAB DE ACTIVIDAD - PROCESO DE NEGOCIACIÓN
 *
 * Muestra el proceso de compra del cliente.
 * Los pasos de validación por fuente se gestionan desde la pestaña
 * de Fuentes de Pago usando el sistema de pasos_fuente_pago.
 */

import { AlertCircle, ClipboardList } from 'lucide-react'

import { useActividadTab } from '@/modules/clientes/hooks'
import { EmptyState } from '@/shared/components/layout/EmptyState'

import * as styles from '../cliente-detalle.styles'

interface ActividadTabProps {
  clienteId: string
}

export function ActividadTab({ clienteId }: ActividadTabProps) {
  // ✅ Hook con TODA la lógica
  const { isLoading, error, hasNegociacionActiva } = useActividadTab({
    clienteId,
  })

  // =====================================================
  // RENDER: Loading State
  // =====================================================

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <div className='relative inline-flex items-center justify-center'>
          <div className='absolute h-20 w-20 animate-ping rounded-full bg-cyan-500/15 dark:bg-cyan-400/10' />
          <div className='absolute h-16 w-16 rounded-full border-2 border-cyan-200/40 dark:border-cyan-800/40' />
          <div className='relative h-14 w-14 animate-spin rounded-full border-4 border-transparent border-r-cyan-400 border-t-cyan-500 dark:border-r-cyan-400 dark:border-t-cyan-300' />
          <ClipboardList className='absolute h-5 w-5 text-cyan-500 dark:text-cyan-400' />
        </div>
        <p className='mt-5 text-sm font-medium text-slate-500 dark:text-slate-400'>
          Cargando proceso…
        </p>
      </div>
    )
  }

  // =====================================================
  // RENDER: Sin Negociación Activa
  // =====================================================

  if (!hasNegociacionActiva) {
    return (
      <div className={styles.emptyStateClasses.container}>
        <EmptyState
          icon={<AlertCircle className='h-12 w-12 text-amber-500' />}
          title={error || 'Sin negociación activa'}
          description='Este cliente no tiene una negociación activa. El proceso de compra se mostrará cuando exista una negociación.'
        />
      </div>
    )
  }

  // =====================================================
  // RENDER: Estado de proceso
  // =====================================================

  return (
    <div className={styles.emptyStateClasses.container}>
      <EmptyState
        icon={<ClipboardList className='h-12 w-12 text-blue-500' />}
        title='Seguimiento de Pasos'
        description='Los requisitos y pasos de validación por fuente de pago se gestionan desde la sección de Abonos del cliente, en cada tarjeta de fuente de pago.'
      />
    </div>
  )
}
