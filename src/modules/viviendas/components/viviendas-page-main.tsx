'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Modal } from '../../../shared/components/ui/Modal'
import { useViviendasList } from '../hooks/useViviendasList'
import { viviendasListStyles as styles } from '../styles/viviendasList.styles'
import { FormularioVivienda } from './formulario-vivienda'
import { ViviendasEmpty } from './viviendas-empty'
import { ViviendasFilters } from './viviendas-filters'
import { ViviendasHeader } from './viviendas-header'
import { ViviendasLista } from './viviendas-lista'
import { ViviendasSkeleton } from './viviendas-skeleton'
import { ViviendasStats } from './viviendas-stats'

/**
 * Página principal de viviendas
 * Orquesta todos los componentes hijos
 * Lógica delegada a useViviendasList
 */
export function ViviendasPageMain() {
  const router = useRouter()
  const {
    viviendas,
    cargando,
    modalAbierto,
    modalEditar,
    viviendaEditar,
    modalEliminar,
    viviendaEliminar,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    refrescar,
    estadisticas,
    totalFiltradas,
  } = useViviendasList()

  const handleVerDetalle = (viviendaId: string) => {
    router.push(`/viviendas/${viviendaId}` as any)
  }

  const viviendaEliminando = viviendas.find(v => v.id === viviendaEliminar)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        {/* Header */}
        <ViviendasHeader onNuevaVivienda={abrirModalCrear} totalViviendas={estadisticas.total} />

        {/* Estadísticas */}
        <ViviendasStats
          total={estadisticas.total}
          disponibles={estadisticas.disponibles}
          asignadas={estadisticas.asignadas}
          entregadas={estadisticas.entregadas}
          valorTotal={estadisticas.valorTotal}
        />

        {/* Filtros */}
        <ViviendasFilters
          filtros={filtros}
          onFiltrosChange={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ViviendasSkeleton />
        ) : viviendas.length === 0 ? (
          <ViviendasEmpty onCrear={abrirModalCrear} />
        ) : (
          <ViviendasLista
            viviendas={viviendas}
            onVerDetalle={(vivienda) => handleVerDetalle(vivienda.id)}
            onAsignarCliente={(vivienda) => {
              console.log('Asignar cliente a:', vivienda)
              // TODO: Implementar lógica de asignación
            }}
            onVerAbonos={(vivienda) => {
              console.log('Ver abonos de:', vivienda)
              // TODO: Implementar vista de abonos
            }}
            onRegistrarPago={(vivienda) => {
              console.log('Registrar pago para:', vivienda)
              // TODO: Implementar registro de pago
            }}
            onGenerarEscritura={(vivienda) => {
              console.log('Generar escritura para:', vivienda)
              // TODO: Implementar generación de escritura
            }}
            onEditar={abrirModalEditar}
            onEliminar={abrirModalEliminar}
          />
        )}
      </motion.div>

      {/* Modal Crear Vivienda */}
      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title="Nueva Vivienda"
        description="Completa la información de la nueva vivienda en 5 pasos"
        size="xl"
      >
        <FormularioVivienda
          onSuccess={() => {
            cerrarModal()
            refrescar()
          }}
          onCancel={cerrarModal}
        />
      </Modal>

      {/* Modal Editar Vivienda */}
      <Modal
        isOpen={modalEditar}
        onClose={cerrarModal}
        title="Editar Vivienda"
        description="Actualiza la información de la vivienda"
        size="xl"
      >
        {viviendaEditar && (
          <FormularioVivienda
            viviendaId={viviendaEditar.id}
            onSuccess={() => {
              cerrarModal()
              refrescar()
            }}
            onCancel={cerrarModal}
          />
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={cancelarEliminar}
        title="Eliminar Vivienda"
        description="Esta acción no se puede deshacer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar la vivienda{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              "#{viviendaEliminando?.numero}"
            </span>
            ?
          </p>

          {viviendaEliminando?.matricula_inmobiliaria && (
            <div className={styles.deleteModal.warning}>
              <p className={styles.deleteModal.warningText}>
                ⚠️ Matrícula:{' '}
                <strong>{viviendaEliminando.matricula_inmobiliaria}</strong>
              </p>
            </div>
          )}

          <div className={styles.deleteModal.actions}>
            <button
              type="button"
              onClick={cancelarEliminar}
              disabled={cargando}
              className={styles.deleteModal.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              disabled={cargando}
              className={styles.deleteModal.deleteButton}
            >
              {cargando ? 'Eliminando...' : 'Eliminar Vivienda'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
