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
import { LoadingState } from '@/shared/components/layout/LoadingState'

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
      <div className='py-12'>
        <LoadingState message='Cargando proceso de negociación...' />
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
