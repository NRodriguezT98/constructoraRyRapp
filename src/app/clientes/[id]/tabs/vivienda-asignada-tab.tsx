/**
 * ============================================
 * COMPONENTE PRESENTACIONAL PURO: ViviendaAsignadaTab
 * ============================================
 *
 * ✅ SEPARACIÓN ESTRICTA DE RESPONSABILIDADES
 * - Componente: SOLO UI presentacional
 * - Hook: TODA la lógica (useViviendaAsignadaTab)
 *
 * Tab que muestra la vivienda asignada al cliente con:
 * - Progreso de validación de fuentes de pago
 * - Requisitos faltantes para desembolso
 * - Métricas y estados
 *
 * IMPORTANTE: Este tab NO registra desembolsos.
 * Los desembolsos se registran desde el módulo de Abonos.
 *
 * @version 2.0.0 - 2025-12-11 - Refactorizado con separación estricta
 */

'use client'

import { AlertCircle, ArrowUp, Building2, CheckCircle2, Home, IdCard, XCircle } from 'lucide-react'

import { HistorialVersionesModal } from '@/modules/clientes/components'
import { SubirCartaModal } from '@/modules/clientes/components/fuentes-pago'
import type { Cliente } from '@/modules/clientes/types'
import {
    FuentePagoCard,
    ModalMarcarPasoCompletado
} from '@/modules/fuentes-pago/components'

import { viviendaAsignadaTabStyles as styles } from './vivienda-asignada-tab.styles'
import {
    AccionesSection,
    EditarFuentesPagoModal,
    MetricasDashboard,
    ProgressBarProminente,
    UltimosAbonosSection,
} from './vivienda-asignada/components'
import { useViviendaAsignadaTab } from './vivienda-asignada/hooks'

// ============================================
// TYPES
// ============================================

interface ViviendaAsignadaTabProps {
  cliente: Cliente
}

// ============================================
// COMPONENTE PRINCIPAL - SOLO UI
// ============================================

export function ViviendaAsignadaTab({ cliente }: ViviendaAsignadaTabProps) {
  // ✅ Hook con TODA la lógica
  const {
    // Estado
    viviendas,
    viviendaActiva,
    isLoading,
    isLoadingDetalle,
    stats,
    fuentesPago,
    abonos,
    totales,
    diasDesdeUltimoAbono,

    // Validación documento
    tieneDocumentoFisico,
    cargandoDoc,

    // Modales
    showHistorial,
    viviendaSeleccionadaId,
    modalSubirCartaOpen,
    fuenteParaCarta,
    modalMarcarPasoOpen,
    pasoSeleccionado,
    isEditarFuentesOpen,
    isGenerating,

    // Handlers
    verDetalleVivienda,
    volverALista,
    navegarAAsignarVivienda,
    navegarARegistrarAbono,
    abrirHistorial,
    cerrarHistorial,
    abrirModalSubirCarta,
    cerrarModalSubirCarta,
    handleSuccessSubirCarta,
    abrirModalMarcarPaso,
    cerrarModalMarcarPaso,
    handleConfirmarPaso,
    handleGenerarPDF,
    abrirEditarFuentes,
    cerrarEditarFuentes,
    guardarFuentes,
  } = useViviendaAsignadaTab({ cliente }) as any

  // =====================================================
  // RENDER: Loading State
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando información de vivienda...
          </p>
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER: Vista Detallada (Vivienda Activa)
  // =====================================================

  // Si tiene vivienda asignada, mostrar detalle directamente
  if (viviendas.length > 0 && !viviendaActiva) {
    // Auto-seleccionar la primera (única) vivienda
    verDetalleVivienda(viviendas[0])
    return null
  }

  if (viviendaActiva) {
    const valorFinal = viviendaActiva.valorFinal

    return (
      <div className={styles.container.detalle}>
        {/* Header */}
        <div className={styles.header.container}>
          <div>
            <h3 className={styles.header.detalleTitle}>
              <Building2 className={styles.header.detalleIcon} />
              {viviendaActiva.proyecto?.nombre || 'Proyecto'}
            </h3>
            <div className={styles.detalle.info}>
              <Home className={styles.detalle.infoIcon} />
              <span className={styles.detalle.infoText}>
                {viviendaActiva.vivienda?.manzanas?.nombre
                  ? `${viviendaActiva.vivienda.manzanas.nombre} - `
                  : ''}
                Casa {viviendaActiva.vivienda?.numero || '—'}
              </span>
              <span className={styles.detalle.separator}>•</span>
              <span
                className={`${styles.detalle.estadoBadge} ${
                  viviendaActiva.estado === 'Activa'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}
              >
                {viviendaActiva.estado}
              </span>
            </div>
          </div>
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
            {/* Acciones STICKY */}
            <div className="sticky top-0 z-20 -mx-1 px-1 pt-2 pb-3 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <AccionesSection
                estado={viviendaActiva.estado}
                onRegistrarAbono={() => navegarARegistrarAbono(viviendaActiva.id)}
                onRenunciar={() => alert('❌ Modal de Renuncia en desarrollo')}
                onGenerarPDF={handleGenerarPDF}
                disabled={isGenerating}
              />
            </div>

            {/* Dashboard de Métricas Reorganizado */}
            <MetricasDashboard
              valorVivienda={
                (viviendaActiva.vivienda as any)?.valor_base ||
                (viviendaActiva.valor_negociado || 0) - 5000000
              }
              gastosNotariales={5000000}
              recargoEsquinera={(viviendaActiva.vivienda as any)?.recargo_esquinera || 0}
              descuento={viviendaActiva.descuento_aplicado || 0}
              valorFinal={valorFinal}
              totalPagado={totales.totalAbonado}
              totalFuentesPago={totales.totalFuentesPago}
              saldoPendiente={totales.saldoPendiente}
              fuentesCount={fuentesPago.length}
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
                      Hace <strong>{diasDesdeUltimoAbono} días</strong> que no se registra un
                      abono. Considera hacer seguimiento con el cliente.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Barra de Progreso */}
            <ProgressBarProminente
              valorTotal={valorFinal}
              totalAbonado={totales.totalAbonado}
              totalFuentesPago={totales.totalFuentesPago}
              diasDesdeUltimoAbono={diasDesdeUltimoAbono}
            />

            {/* Fuentes de Pago con Sistema de Validación */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Fuentes de Pago ({fuentesPago.length})
                </h3>
                <button
                  onClick={abrirEditarFuentes}
                  className="px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                  Editar Fuentes
                </button>
              </div>

              {isLoadingDetalle ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
                </div>
              ) : fuentesPago.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No hay fuentes de pago configuradas
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {fuentesPago.map((fuente: any) => (
                    <div key={fuente.id} className="space-y-2">
                      <FuentePagoCard
                        fuente={{
                          id: fuente.id,
                          tipo: fuente.tipo,
                          monto_aprobado: fuente.monto,
                          monto_recibido: fuente.monto_recibido,
                          entidad: fuente.entidad,
                          numero_referencia: fuente.numero_referencia,
                        }}
                        clienteId={cliente.id}
                        onMarcarPaso={(pasoId, paso) => abrirModalMarcarPaso(paso)}
                        onVerDocumento={documentoId => {
                          alert(`Ver documento ${documentoId}`)
                        }}
                      />
                      {/* Comentado temporalmente - FuentePagoCard ya muestra toda la info */}
                      {/* <EstadoDocumentacionFuenteCard
                        fuentePagoId={fuente.id}
                        compacto={true}
                      /> */}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

        {/* Modal de Editar Fuentes */}
        <EditarFuentesPagoModal
          isOpen={isEditarFuentesOpen}
          onClose={cerrarEditarFuentes}
          fuentesActuales={fuentesPago}
          valorFinal={viviendaActiva?.valorFinal || 0}
          onGuardar={guardarFuentes as any}
          viviendaNumero={
            viviendaActiva?.vivienda
              ? `${viviendaActiva.vivienda.manzanas?.nombre || ''}${viviendaActiva.vivienda.numero}`
              : undefined
          }
          clienteNombre={cliente.nombre_completo}
        />
      </div>
    )
  }

  // =====================================================
  // RENDER: Empty State (Sin vivienda asignada)
  // =====================================================

  // ✅ Validar requisitos para asignar vivienda
  const tieneNumeroCedula = cliente.numero_documento && cliente.numero_documento.trim() !== ''
  const documentoCompleto = tieneNumeroCedula && tieneDocumentoFisico

  return (
    <div className={styles.container.base}>
      {/* Empty State Premium */}
      <div className={styles.empty.container}>
        {/* Icono con gradiente */}
        <div className={styles.empty.iconWrapper}>
          <Home className={styles.empty.icon} />
        </div>

        {/* Título y descripción */}
        <h3 className={styles.empty.title}>Sin vivienda asignada</h3>
        <p className={styles.empty.description}>
          Este cliente aún no tiene una vivienda asignada. Para poder asignar una vivienda
          y gestionar el proceso de compra, asegúrate de completar los requisitos necesarios.
        </p>

        {/* Checklist de requisitos */}
        <div className={styles.empty.checklistContainer}>
          <div className={styles.empty.checklistHeader}>
            <IdCard className="w-4 h-4" />
            <span>Requisitos para asignar vivienda</span>
          </div>

          <div className={styles.empty.checklistItems}>
            {/* Requisito 1: Número de documento */}
            <div className={styles.empty.checklistItem}>
              {tieneNumeroCedula ? (
                <CheckCircle2 className={styles.empty.checklistIconSuccess} />
              ) : (
                <XCircle className={styles.empty.checklistIconPending} />
              )}
              <div className="flex-1">
                <p className={tieneNumeroCedula ? styles.empty.checklistTextSuccess : styles.empty.checklistTextPending}>
                  Número de documento registrado
                </p>
                {!tieneNumeroCedula && (
                  <p className={styles.empty.checklistSubtext}>
                    Edita la información del cliente (tab Información General) y agrega su cédula/pasaporte
                  </p>
                )}
              </div>
            </div>

            {/* Requisito 2: Documento físico escaneado */}
            <div className={styles.empty.checklistItem}>
              {cargandoDoc ? (
                <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : tieneDocumentoFisico ? (
                <CheckCircle2 className={styles.empty.checklistIconSuccess} />
              ) : (
                <XCircle className={styles.empty.checklistIconPending} />
              )}
              <div className="flex-1">
                <p className={tieneDocumentoFisico ? styles.empty.checklistTextSuccess : styles.empty.checklistTextPending}>
                  Documento de identidad escaneado (archivo físico)
                </p>
                {!tieneDocumentoFisico && !cargandoDoc && (
                  <p className={styles.empty.checklistSubtext}>
                    Debes subir el archivo escaneado de la cédula/pasaporte en la pestaña <strong>Documentos</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - Dinámico según estado */}
        {!tieneDocumentoFisico ? (
          <div className={styles.empty.ctaContainer}>
            <div className={styles.empty.ctaInfo}>
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className={styles.empty.ctaTitle}>
                  📋 Sigue estos pasos para habilitar la asignación
                </p>
                <ol className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-3 space-y-2 list-none">
                  {!tieneNumeroCedula && (
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                      <div>
                        <strong className="text-orange-600 dark:text-orange-400">Edita el cliente</strong> y registra su número de cédula/pasaporte en Información General
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{!tieneNumeroCedula ? '2' : '1'}</span>
                    <div>
                      <strong className="text-orange-600 dark:text-orange-400">Haz clic en el botón naranja</strong> de abajo o ve a la pestaña <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-semibold">Documentos</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{!tieneNumeroCedula ? '3' : '2'}</span>
                    <div>
                      <strong className="text-orange-600 dark:text-orange-400">Presiona el botón naranja</strong> <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">📄 Subir Cédula/Pasaporte</span> en la esquina superior derecha
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{!tieneNumeroCedula ? '4' : '3'}</span>
                    <div>
                      <strong className="text-orange-600 dark:text-orange-400">Sube el archivo</strong> (cédula/pasaporte escaneado) y completa el formulario
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">✓</span>
                    <div>
                      <strong className="text-emerald-600 dark:text-emerald-400">¡Listo!</strong> El botón "Asignar Vivienda" del header se habilitará automáticamente
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            <button
              onClick={() => {
                const documentosTab = document.querySelector('[data-tab="documentos"]') as HTMLButtonElement
                documentosTab?.click()
              }}
              className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 animate-pulse"
            >
              <IdCard className="w-5 h-5" />
              Ir a Documentos para subir archivo
            </button>
          </div>
        ) : (
          <div className={styles.empty.ctaContainer}>
            <div className={styles.empty.ctaInfo}>
              <ArrowUp className={styles.empty.ctaIcon} />
              <div>
                <p className={styles.empty.ctaTitle}>
                  ✅ ¡Todo listo! Usa el botón en el encabezado
                </p>
                <p className={styles.empty.ctaDescription}>
                  El botón "Asignar Vivienda" en el header superior te permitirá seleccionar una vivienda disponible de cualquier proyecto activo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className={styles.empty.footerInfo}>
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <p className={styles.empty.footerText}>
            <strong>¿Por qué se requiere el documento?</strong> Es necesario para generar los contratos, validar la identidad del cliente y gestionar el proceso legal de compra-venta de la vivienda.
          </p>
        </div>
      </div>
      {showHistorial && viviendaSeleccionadaId ? (
        <HistorialVersionesModal
          negociacionId={viviendaSeleccionadaId}
          isOpen={showHistorial}
          onClose={cerrarHistorial}
        />
      ) : null}

      {fuenteParaCarta && (
        <SubirCartaModal
          isOpen={modalSubirCartaOpen}
          onClose={cerrarModalSubirCarta}
          fuente={fuenteParaCarta}
          clienteId={cliente.id}
          onSuccess={handleSuccessSubirCarta}
        />
      )}

      <ModalMarcarPasoCompletado
        isOpen={modalMarcarPasoOpen}
        paso={pasoSeleccionado}
        onClose={cerrarModalMarcarPaso}
        onConfirmar={handleConfirmarPaso as any}
      />
    </div>
  )
}
