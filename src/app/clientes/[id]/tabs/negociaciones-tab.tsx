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
import { AlertCircle, Building2, ChevronLeft, Home, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { HistorialVersionesModal } from '@/modules/clientes/components'
import { FuentesPagoSection, SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import { useGenerarReportePDF } from '@/modules/clientes/hooks'
import {
    useNegociacionDetalle,
    useNegociacionesQuery,
    type NegociacionConValores,
} from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { Cliente } from '@/modules/clientes/types'
import { Tooltip } from '@/shared/components/ui'

import {
    AccionesSection,
    MetricasDashboard,
    NegociacionCardCompact,
    ProgressBarProminente,
    UltimosAbonosSection
} from './negociaciones'
import { negociacionesAnimations, negociacionesTabStyles as styles } from './negociaciones-tab.styles'
import { EditarFuentesPagoModal } from './negociaciones/EditarFuentesPagoModal'
import { useEditarFuentesPago } from './negociaciones/hooks/useEditarFuentesPago'

// ============================================
// TYPES
// ============================================

interface NegociacionesTabProps {
  cliente: Cliente
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function NegociacionesTab({ cliente }: NegociacionesTabProps) {
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

  // Modal de subir carta
  const [modalSubirCartaOpen, setModalSubirCartaOpen] = useState(false)
  const [fuenteParaCarta, setFuenteParaCarta] = useState<{
    id: string
    tipo: string
    entidad?: string
    monto_aprobado: number
    vivienda?: { numero: string; manzana: string }
    cliente?: { nombre_completo: string }
  } | null>(null)

  // =====================================================
  // REACT QUERY: Detalle de negociación activa
  // =====================================================

  const {
    fuentesPago,
    abonos,
    totales,
    diasDesdeUltimoAbono,
    isLoading: isLoadingDetalle,
  } = useNegociacionDetalle({
    negociacionId: negociacionActiva?.id || null,
    enabled: !!negociacionActiva,
  })

  // =====================================================
  // HOOK: Generar reporte PDF
  // =====================================================

  const { generarReporte, isGenerating } = useGenerarReportePDF()

  // =====================================================
  // HOOK: Editar fuentes de pago
  // =====================================================

  const {
    isModalOpen: isEditarFuentesOpen,
    abrirModal: abrirEditarFuentes,
    cerrarModal: cerrarEditarFuentes,
    guardarFuentes,
  } = useEditarFuentesPago({
    negociacionId: negociacionActiva?.id || '',
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

  const handleGenerarPDF = async () => {
    if (!negociacionActiva) return

    await generarReporte({
      cliente,
      negociacion: negociacionActiva as any, // Cast temporal (tipos compatibles)
      fuentesPago: fuentesPago as any,
      abonos: abonos as any,
      totales,
      diasDesdeUltimoAbono,
      generadoPor: 'Nicolás Rodríguez', // TODO: obtener del contexto de auth
    })
  }

  const handleSubirCarta = (fuenteId: string) => {
    // Buscar la fuente en la lista actual
    const fuente = fuentesPago.find((f) => f.id === fuenteId)
    if (!fuente || !negociacionActiva) {
      console.error('❌ Fuente o negociación no encontrada:', { fuenteId, negociacionActiva })
      return
    }

    // Preparar datos completos para el modal (título inteligente)
    const datosParaModal = {
      id: fuente.id,
      tipo: fuente.tipo,
      entidad: fuente.entidad || undefined,
      monto_aprobado: fuente.monto, // ✅ El campo es 'monto', no 'monto_aprobado'
      // Datos de vivienda para título
      vivienda: negociacionActiva.vivienda
        ? {
            numero: negociacionActiva.vivienda.numero,
            manzana: negociacionActiva.vivienda.manzanas?.nombre || '',
          }
        : undefined,
      // Datos de cliente para título
      cliente: {
        nombre_completo: cliente.nombre_completo,
      },
    }

    console.log('📤 Datos para modal de carta:', {
      fuenteId,
      negociacionActiva: {
        vivienda: negociacionActiva.vivienda,
        viviendaManzana: negociacionActiva.vivienda?.manzanas,
      },
      cliente: {
        nombre_completo: cliente.nombre_completo,
      },
      datosParaModal,
    })

    setFuenteParaCarta(datosParaModal)

    // Abrir modal
    setModalSubirCartaOpen(true)
  }

  const cerrarModalSubirCarta = () => {
    setModalSubirCartaOpen(false)
    setFuenteParaCarta(null)
  }

  const handleSuccessSubirCarta = () => {
    // Invalidar queries para actualizar UI
    invalidarNegociaciones()
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
          <div className="space-y-2.5">
            {/* Acciones STICKY - Siempre visibles arriba */}
            <div className="sticky top-0 z-50 -mx-1 px-1 pt-2 pb-3">
              <AccionesSection
                estado={negociacionActiva.estado}
                onRegistrarAbono={() => navegarARegistrarAbono(negociacionActiva.id)}
                onRenunciar={() => alert('❌ Modal de Renuncia en desarrollo')}
                onGenerarPDF={handleGenerarPDF}
                disabled={isGenerating}
              />
            </div>

            {/* Dashboard de Métricas */}
            <MetricasDashboard
              valorBase={negociacionActiva.valor_negociado || 0}
              descuento={negociacionActiva.descuento_aplicado || 0}
              totalPagado={totales.totalAbonado}
              saldoPendiente={totales.saldoPendiente}
            />

            {/* Alert: Sin pagos recientes */}
            {diasDesdeUltimoAbono !== null && diasDesdeUltimoAbono > 30 ? (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 dark:border-rose-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                      ⚠️ Sin pagos recientes
                    </p>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                      Hace <strong>{diasDesdeUltimoAbono} días</strong> que no se registra un abono.
                      Considera hacer seguimiento con el cliente.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Barra de Progreso Prominente */}
            <ProgressBarProminente
              valorTotal={valorFinal}
              totalAbonado={totales.totalAbonado}
              totalFuentesPago={totales.totalFuentesPago}
              diasDesdeUltimoAbono={diasDesdeUltimoAbono}
            />

            {/* Fuentes de Pago con Estado de Documentación */}
            <FuentesPagoSection
              fuentesPago={fuentesPago.map(f => ({
                id: f.id,
                tipo: f.tipo,
                monto_aprobado: f.monto,
                monto_recibido: f.monto_recibido,
                entidad: f.entidad,
                numero_referencia: f.numero_referencia,
                // Campos de documentación (calcular dinámicamente si es necesario)
                estado_documentacion: 'Pendiente', // TODO: implementar lógica
                carta_aprobacion_url: undefined,
                saldo_pendiente: f.monto - f.monto_recibido,
                porcentaje_completado: (f.monto_recibido / f.monto) * 100,
              }))}
              loading={isLoadingDetalle}
              onEditarFuentes={abrirEditarFuentes}
              onSubirCarta={handleSubirCarta}
            />

            {/* Últimos Abonos */}
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
          </div>
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

      {/* Modal de Editar Fuentes */}
      {negociacionActiva && (
        <EditarFuentesPagoModal
          isOpen={isEditarFuentesOpen}
          onClose={cerrarEditarFuentes}
          fuentesActuales={fuentesPago.map(f => ({
            id: f.id,
            tipo: f.tipo,
            monto: f.monto,
            monto_recibido: f.monto_recibido,
            entidad: f.entidad,
            numero_referencia: f.numero_referencia,
            detalles: f.detalles,
          }))}
          valorFinal={negociacionActiva.valorFinal}
          onGuardar={guardarFuentes}
        />
      )}

      {/* Modal de Subir Carta de Aprobación */}
      {fuenteParaCarta && (
        <SubirCartaModal
          isOpen={modalSubirCartaOpen}
          onClose={cerrarModalSubirCarta}
          fuente={fuenteParaCarta}
          clienteId={cliente.id}
          onSuccess={handleSuccessSubirCarta}
        />
      )}
    </div>
  )
}
