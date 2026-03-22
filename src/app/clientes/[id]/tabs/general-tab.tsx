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
import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { construirURLCliente } from '@/lib/utils/slug.utils'
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
  const router = useRouter()

  // ✅ Hook de validación real de documento de identidad
  const { tieneCedula: tieneDocumento, cargando: cargandoValidacion } = useDocumentoIdentidad({
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
    return (
      cliente.negociaciones.find((n) => n.estado === 'Activa' || n.estado === 'Suspendida') ||
      cliente.negociaciones[0] ||
      null
    )
  }, [cliente.negociaciones])

  const handleIniciarAsignacion = () => {
    if (!tieneDocumento) {
      window.dispatchEvent(new CustomEvent('cambiar-tab', { detail: 'documentos' }))
      return
    }

    const clienteSlug = construirURLCliente({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    })
      .split('/')
      .pop()

    router.push(
      `/clientes/${clienteSlug}/asignar-vivienda?nombre=${encodeURIComponent(cliente.nombres + ' ' + cliente.apellidos)}`
    )
  }

  return (
    <motion.div key="info" {...styles.animations.fadeInUp} className="space-y-3">
      {/* Banner de estado de documentación */}
      <BannerDocumentacion
        tieneDocumento={tieneDocumento}
        cargandoValidacion={cargandoValidacion}
        tieneNegociacionActiva={tieneNegociacionActiva}
      />

      {/* Resumen financiero de negociación - hero section */}
      {negociacionActiva && (negociacionActiva.valor_total_pagar > 0 || negociacionActiva.valor_total > 0) && (
        <ResumenNegociacion negociacion={negociacionActiva} clienteId={cliente.id} />
      )}

      {/* Tira de estadísticas compacta */}
      <EstadisticasComerciales estadisticas={estadisticas} cliente={cliente} />

      {/* Grid de información: 50/50 */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <InfoPersonalCard cliente={cliente} />
        <ContactoUbicacionCard cliente={cliente} />
      </div>

      {/* Auditoría */}
      <div className="flex items-center gap-1.5 px-1">
        <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Cliente registrado el {formatDateCompact(cliente.fecha_creacion)}
        </p>
      </div>

      {/* Notas (si existen) */}
      <NotasCard cliente={cliente} />
    </motion.div>
  )
}
