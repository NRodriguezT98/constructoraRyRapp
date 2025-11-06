'use client'

import { construirURLVivienda } from '@/lib/utils/slug.utils'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Modal } from '../../../shared/components/ui/Modal'
import { useViviendasList } from '../hooks/useViviendasList'
import { viviendasStyles as styles } from '../styles/viviendas.styles'
import { FormularioVivienda } from './formulario-vivienda'
import { ViviendasEmpty } from './viviendas-empty'
import { ViviendasFilters } from './viviendas-filters'
import { ViviendasHeader } from './viviendas-header'
import { ViviendasLista } from './viviendas-lista'
import { ViviendasSkeleton } from './viviendas-skeleton'
import { ViviendasStats } from './viviendas-stats'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface PermisosUsuario {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canView: boolean
  isAdmin: boolean
}

interface ViviendasPageMainProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * Página principal de viviendas
 * Orquesta todos los componentes hijos
 * Lógica delegada a useViviendasList
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 */
export function ViviendasPageMain({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: ViviendasPageMainProps = {}) {
  console.log('🏠 [VIVIENDAS MAIN] Client Component montado con permisos:', {
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
  })

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

  const handleVerDetalle = (vivienda: any) => {
    // Validar que tenemos id y numero
    if (!vivienda?.id || !vivienda?.numero) {
      console.error('handleVerDetalle - Datos inválidos:', { vivienda })
      toast.error('Error: Datos de vivienda incompletos')
      return
    }

    // Construir URL amigable con slug
    const url = construirURLVivienda(
      {
        id: vivienda.id,
        numero: vivienda.numero
      },
      vivienda.manzanas?.nombre || undefined,
      vivienda.manzanas?.proyectos?.nombre || undefined
    )
    router.push(url as any)
  }

  const viviendaEliminando = viviendas.find(v => v.id === viviendaEliminar)

  return (
    <div className={styles.container.page}>
      {/* Animación simplificada para navegación instantánea */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={styles.container.content}
      >
        {/* Header - Navegación a vista dedicada */}
        <ViviendasHeader
          totalViviendas={estadisticas.total}
        />

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
          resultadosCount={viviendas.length}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ViviendasSkeleton />
        ) : viviendas.length === 0 ? (
          <ViviendasEmpty onCrear={abrirModalCrear} />
        ) : (
          <ViviendasLista
            viviendas={viviendas}
            onVerDetalle={handleVerDetalle}
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
