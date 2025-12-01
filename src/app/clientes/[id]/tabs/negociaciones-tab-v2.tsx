'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO V2 (REDISEÑADO 2025-01-26)
 * Tab de Negociaciones - React Query + Diseño Compacto
 *
 * CAMBIOS PRINCIPALES:
 * - ✅ MIGRADO A REACT QUERY: useNegociacionesQuery, useNegociacionDetalle
 * - ✅ DISEÑO TABLA HORIZONTAL: NegociacionCardCompact (barra estado + info + valores + acciones)
 * - ✅ PALETA CYAN/AZUL: módulo clientes (consistencia visual)
 * - ✅ SEPARACIÓN ESTRICTA: Zero lógica en componente, todo en hooks
 * - ✅ CACHE AUTOMÁTICO: React Query maneja invalidación y refetch
 * - ✅ LOADING/ERROR STATES: Optimizados con React Query
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Building2, ChevronLeft, Home, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { HistorialVersionesModal } from '@/modules/clientes/components'
import {
    useNegociacionDetalle,
    useNegociacionesQuery,
    type NegociacionConValores,
} from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { Cliente } from '@/modules/clientes/types'
import { Tooltip } from '@/shared/components/ui'

import {
    AccionesSection,
    FuentesPagoSection,
    NegociacionCardCompact,
    ProgressSection,
    UltimosAbonosSection,
} from './negociaciones'
import { negociacionesAnimations, negociacionesTabStyles as styles } from './negociaciones-tab.styles'

// ============================================
// TYPES
// ============================================

interface NegociacionesTabV2Props {
  cliente: Cliente
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function NegociacionesTabV2({ cliente }: NegociacionesTabV2Props) {
  const router = useRouter()

  // =====================================================
  // REACT QUERY HOOKS (Separación de Responsabilidades)
  // =====================================================

  const { negociaciones, isLoading, stats, invalidarNegociaciones } = useNegociacionesQuery({
    clienteId: cliente.id,
  })

  // =====================================================
  // ESTADO LOCAL (Solo UI - Modal y vista activa)
  // =====================================================

  const [negociacionActiva, setNegociacionActiva] = useState<NegociacionConValores | null>(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const [negociacionSeleccionada, setNegociacionSeleccionada] = useState<string | null>(null)

  // =====================================================
  // REACT QUERY: Detalle de negociación activa
  // =====================================================

  const {
    fuentesPago,
    abonos,
    totales,
    isLoading: isLoadingDetalle,
  } = useNegociacionDetalle({
    negociacionId: negociacionActiva?.id || null,
    enabled: !!negociacionActiva,
  })

  // =====================================================
  // HANDLERS (Solo navegación y cambios de vista)
  // =====================================================

  const verDetalleNegociacion = (negociacion: NegociacionConValores) => {
    setNegociacionActiva(negociacion)
  }

  const volverALista = () => {
    setNegociacionActiva(null)
  }

  const abrirHistorial = (negociacionId: string) => {
    setNegociacionSeleccionada(negociacionId)
    setShowHistorial(true)
  }

  const cerrarHistorial = () => {
    setShowHistorial(false)
    setNegociacionSeleccionada(null)
  }

  // Navegación
  const navegarACrearNegociacion = () => {
    const clienteSlug = construirURLCliente({
      id: cliente.id,
      nombre_completo: cliente.nombre_completo,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    })
      .split('/')
      .pop()

    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/clientes/${clienteSlug}/negociaciones/crear?nombre=${encodeURIComponent(nombreCliente)}` as any
    )
  }

  const navegarAAsignarVivienda = () => {
    const clienteSlug = construirURLCliente({
      id: cliente.id,
      nombre_completo: cliente.nombre_completo,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
    })
      .split('/')
      .pop()

    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/clientes/${clienteSlug}/asignar-vivienda?nombre=${encodeURIComponent(nombreCliente)}` as any
    )
  }

  const navegarARegistrarAbono = (negociacionId: string) => {
    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/abonos?cliente_id=${cliente.id}&negociacion_id=${negociacionId}&cliente_nombre=${encodeURIComponent(nombreCliente)}` as any
    )
  }

  // =====================================================
  // RENDER: Loading State
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Cargando negociaciones...</p>
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER: Vista Detallada
  // =====================================================

  if (negociacionActiva) {
    const valorFinal = negociacionActiva.valorFinal

    return (
      <div className={styles.container.detalle}>
        {/* Header con botón volver */}
        <div className={styles.header.container}>
          <div>
            <h3 className={styles.header.detalleTitle}>
              <Building2 className={styles.header.detalleIcon} />
              {negociacionActiva.proyecto?.nombre || 'Proyecto'}
            </h3>
            <div className={styles.detalle.info}>
              <Home className={styles.detalle.infoIcon} />
              <span className={styles.detalle.infoText}>
                {negociacionActiva.vivienda?.manzanas?.nombre
                  ? `${negociacionActiva.vivienda.manzanas.nombre} - `
                  : ''}
                Casa {negociacionActiva.vivienda?.numero || '—'}
              </span>
              <span className={styles.detalle.separator}>•</span>
              <span
                className={`${styles.detalle.estadoBadge} ${
                  negociacionActiva.estado === 'Activa'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}
              >
                {negociacionActiva.estado}
              </span>
            </div>
          </div>

          <button onClick={volverALista} className={styles.buttons.outline}>
            <ChevronLeft className="w-4 h-4" />
            Volver a la lista
          </button>
        </div>

        {/* Loading detalle */}
        {isLoadingDetalle ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Cargando detalles...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Secciones */}
            <ProgressSection
              valorNegociado={negociacionActiva.valor_negociado || 0}
              descuento={negociacionActiva.descuento_aplicado || 0}
              totalAbonado={totales.totalAbonado}
              totalFuentesPago={totales.totalFuentesPago}
            />

            <FuentesPagoSection
              fuentesPago={fuentesPago}
              valorTotal={valorFinal}
              negociacionEstado={negociacionActiva.estado}
              onEditar={() => {
                alert('⚠️ Modal de edición de fuentes de pago en desarrollo')
              }}
            />

            <UltimosAbonosSection
              abonos={abonos.map((abono: any) => ({
                id: abono.id,
                monto: abono.monto,
                fecha_abono: abono.fecha_abono,
                metodo_pago: abono.metodo_pago,
                numero_recibo: abono.numero_recibo,
                observaciones: abono.observaciones,
              }))}
              onVerTodos={() => {
                alert(
                  `📊 Vista completa: ${abonos.length} abonos - Total: $${totales.totalAbonado.toLocaleString('es-CO')}`
                )
              }}
            />

            <AccionesSection
              estado={negociacionActiva.estado}
              onRegistrarAbono={() => navegarARegistrarAbono(negociacionActiva.id)}
              onSuspender={() => alert('⏸️ Modal de Suspender en desarrollo')}
              onRenunciar={() => alert('❌ Modal de Renuncia en desarrollo')}
              onGenerarPDF={() => alert('📄 Generación de PDF en desarrollo')}
            />
          </>
        )}
      </div>
    )
  }

  // =====================================================
  // RENDER: Vista de Lista (Tabla Horizontal Compacta)
  // =====================================================

  return (
    <div className={styles.container.base}>
      {/* Header con estadísticas y botón crear */}
      <div className={styles.header.container}>
        <div>
          <h3 className={styles.header.title}>Negociaciones ({stats.total})</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {stats.activas} Activas
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              {stats.completadas} Completadas
            </span>
            {stats.suspendidas > 0 ? (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {stats.suspendidas} Suspendidas
                </span>
              </>
            ) : null}
          </div>
        </div>

        <Tooltip content="Crear nueva negociación para este cliente" side="left">
          <button onClick={navegarACrearNegociacion} className={styles.buttons.primary}>
            <Plus className="w-3.5 h-3.5" />
            Crear Negociación
          </button>
        </Tooltip>
      </div>

      {/* Empty State */}
      {negociaciones.length === 0 ? (
        <div className={styles.empty.container}>
          <Building2 className={styles.empty.icon} />
          <h3 className={styles.empty.title}>Sin negociaciones activas</h3>
          <p className={styles.empty.description}>
            Este cliente no tiene negociaciones registradas todavía.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Lista de Negociaciones (Cards Horizontales) */}
          {negociaciones.map((negociacion) => (
            <NegociacionCardCompact
              key={negociacion.id}
              negociacion={negociacion}
              onVerDetalle={verDetalleNegociacion}
              onVerHistorial={abrirHistorial}
            />
          ))}
        </div>
      )}

      {/* FAB: Botón flotante cuando hay muchas negociaciones */}
      <AnimatePresence>
        {negociaciones.length > 5 ? (
          <Tooltip content="Crear nueva negociación" side="left">
            <motion.button
              {...negociacionesAnimations.fab}
              onClick={navegarAAsignarVivienda}
              className={styles.buttons.fab}
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </Tooltip>
        ) : null}
      </AnimatePresence>

      {/* Modal de Historial */}
      {negociacionSeleccionada ? (
        <HistorialVersionesModal
          negociacionId={negociacionSeleccionada}
          isOpen={showHistorial}
          onClose={cerrarHistorial}
        />
      ) : null}
    </div>
  )
}
