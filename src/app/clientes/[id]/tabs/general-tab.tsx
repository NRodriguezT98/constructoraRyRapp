'use client'

/**
 * ✅ COMPONENTE ORQUESTADOR REFACTORIZADO
 * General Tab - Dividido en componentes atómicos
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Este componente SOLO orquesta sub-componentes
 * - Cada sección está en su propio archivo atómico
 * - Hook separado para lógica de navegación
 *
 * COMPONENTES ATÓMICOS:
 * - BannerDocumentacion
 * - ResumenNegociacion (NUEVO: muestra estado financiero de negociación activa)
 * - EstadisticasComerciales (ahora tira horizontal compacta)
 * - InfoPersonalCard
 * - ContactoUbicacionCard
 * - NotasCard
 */

import { useMemo } from 'react'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import type { Cliente } from '@/modules/clientes/types'

import * as styles from '../cliente-detalle.styles'

import {
  BannerDocumentacion,
  ContactoUbicacionCard,
  EstadisticasComerciales,
  InfoPersonalCard,
  NotasCard,
  ResumenNegociacion,
} from './general/components'

interface GeneralTabProps {
  cliente: Cliente
}

export function GeneralTab({ cliente }: GeneralTabProps) {
  // ✅ Hook de validación real de documento de identidad
  const { tieneCedula: tieneDocumento, cargando: cargandoValidacion } =
    useDocumentoIdentidad({
      clienteId: cliente.id,
    })

  const estadisticas = cliente.estadisticas || {
    total_negociaciones: 0,
    negociaciones_activas: 0,
    negociaciones_completadas: 0,
  }

  const tieneNegociacionActiva = estadisticas.negociaciones_activas > 0

  // Extraer negociación activa (datos ya cargados en cliente.negociaciones)
  const negociacionActiva = useMemo(() => {
    if (!cliente.negociaciones?.length) return null
    // Solo considerar negociaciones realmente activas
    const activa = cliente.negociaciones.find(
      n => n.estado === 'Activa' || n.estado === 'Suspendida'
    )
    return activa || null
  }, [cliente.negociaciones])

  return (
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='space-y-3'
    >
      {/* Banner de estado de documentación (oculto si renunció) */}
      {cliente.estado !== 'Renunció' && (
        <BannerDocumentacion
          tieneDocumento={tieneDocumento}
          cargandoValidacion={cargandoValidacion}
          tieneNegociacionActiva={tieneNegociacionActiva}
          onIrADocumentos={() =>
            window.dispatchEvent(
              new CustomEvent('cambiar-tab', { detail: 'documentos' })
            )
          }
        />
      )}

      {/* Resumen financiero de negociación - hero section */}
      {negociacionActiva &&
        (negociacionActiva.valor_total_pagar > 0 ||
          negociacionActiva.valor_total > 0) && (
          <ResumenNegociacion
            negociacion={negociacionActiva}
            clienteId={cliente.id}
          />
        )}

      {/* Tira de estadísticas compacta */}
      <EstadisticasComerciales estadisticas={estadisticas} cliente={cliente} />

      {/* Grid de información: 50/50 */}
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <InfoPersonalCard cliente={cliente} />
        <ContactoUbicacionCard cliente={cliente} />
      </div>

      {/* Auditoría */}
      <div className='flex items-center gap-1.5 px-1'>
        <Clock className='h-3 w-3 flex-shrink-0 text-gray-400 dark:text-gray-500' />
        <p className='text-xs text-gray-400 dark:text-gray-500'>
          Cliente registrado el {formatDateCompact(cliente.fecha_creacion)}
        </p>
      </div>

      {/* Notas (si existen) */}
      <NotasCard cliente={cliente} />
    </motion.div>
  )
}
