'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { construirURLVivienda } from '@/lib/utils/slug.utils'
import { Modal } from '@/shared/components/ui/Modal'

import { useVistaPreference } from '@/shared/hooks/useVistaPreference'

import { useViviendasList } from '../hooks/useViviendasList'
import { viviendasStyles as styles } from '../styles/viviendas.styles'
import type { Vivienda } from '../types'

import { EditarViviendaModal } from './editar-vivienda-modal'
import { ViviendasEmpty } from './viviendas-empty'
import { ViviendasHeader } from './viviendas-header'
import { ViviendasLista } from './viviendas-lista'
import { ViviendasSkeleton } from './viviendas-skeleton'
import { ViviendasStats } from './viviendas-stats'
import { ViviendasFiltrosPremium } from './ViviendasFiltrosPremium'
import { ViviendasTabla } from './ViviendasTabla'

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
  const router = useRouter()
  const {
    viviendas, // Para cards (paginadas)
    viviendasFiltradas, // Para tabla (todas filtradas)
    cargando,
    modalEliminar,
    viviendaEliminar,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    refrescar,
    estadisticas,
    totalFiltradas,
    proyectos,
    // Paginación (solo para cards)
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    cambiarPagina,
    cambiarItemsPorPagina,
  } = useViviendasList()

  // Hook para preferencia de vista (cards vs tabla)
  const [vista, setVista] = useVistaPreference({ moduleName: 'viviendas' })

  // ============================================
  // ESTADO MODAL EDITAR
  // ============================================
  const [modalEditar, setModalEditar] = useState(false)
  const [viviendaEditar, setViviendaEditar] = useState<Vivienda | null>(null)

  const handleVerDetalle = (vivienda: any) => {
    console.log('🔍 handleVerDetalle called with:', vivienda)

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

  // ============================================
  // HANDLER: EDITAR VIVIENDA
  // ============================================
  const handleEditarVivienda = (vivienda: Vivienda) => {
    console.log('✏️ Editar vivienda:', vivienda)
    setViviendaEditar(vivienda)
    setModalEditar(true)
  }

  const handleEditarSuccess = (viviendaActualizada: Vivienda) => {
    console.log('✅ Vivienda actualizada:', viviendaActualizada)
    // Refrescar lista para mostrar cambios
    refrescar()
    setModalEditar(false)
    setViviendaEditar(null)
  }

  // Buscar en viviendasFiltradas para que funcione en ambas vistas
  const viviendaEliminando = viviendasFiltradas?.find(v => v.id === viviendaEliminar)

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

        {/* Filtros Premium */}
        <ViviendasFiltrosPremium
          filtros={filtros}
          onActualizarFiltros={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          totalResultados={totalFiltradas}
          proyectos={proyectos}
          vista={vista}
          onCambiarVista={setVista}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ViviendasSkeleton />
        ) : viviendas.length === 0 ? (
          <ViviendasEmpty onCrear={() => router.push('/viviendas/nueva')} />
        ) : vista === 'cards' ? (
          <ViviendasLista
            viviendas={viviendas} // ← Viviendas paginadas (hook maneja paginación)
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
            onEditar={canEdit ? handleEditarVivienda : undefined}
            onEliminar={abrirModalEliminar}
            // Paginación
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalItems={totalFiltradas}
            itemsPorPagina={itemsPorPagina}
            onCambiarPagina={cambiarPagina}
            onCambiarItemsPorPagina={cambiarItemsPorPagina}
          />
        ) : (
          <ViviendasTabla
            viviendas={viviendasFiltradas} // ← Todas las viviendas filtradas (TanStack Table maneja paginación)
            onView={handleVerDetalle}
            onEdit={canEdit ? handleEditarVivienda : undefined}
            onDelete={abrirModalEliminar}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </motion.div>

      {/* Modal Editar Vivienda */}
      <EditarViviendaModal
        isOpen={modalEditar}
        vivienda={viviendaEditar}
        onClose={() => {
          setModalEditar(false)
          setViviendaEditar(null)
        }}
        onSuccess={handleEditarSuccess}
      />

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
