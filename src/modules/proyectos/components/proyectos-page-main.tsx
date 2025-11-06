'use client'

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../../shared/components/ui/Modal'
import { useDetectarCambios } from '../hooks/useDetectarCambios'
// ✅ REACT QUERY: Nuevos hooks con cache inteligente
import {
  useEstadisticasProyectosQuery,
  useProyectoConValidacion,
  useProyectosFiltradosQuery,
  useProyectosQuery,
} from '../hooks'
import { proyectosPageStyles as styles } from '../styles/proyectos-page.styles'
import type { Proyecto, ProyectoFormData } from '../types'
import { ConfirmarCambiosModal } from './ConfirmarCambiosModal'
import { ProyectosEmpty } from './proyectos-empty'
import { ProyectosForm } from './proyectos-form'
import { ProyectosLista } from './proyectos-lista'
import { ProyectosNoResults } from './proyectos-no-results'
import { ProyectosSkeleton } from './proyectos-skeleton'
import { ProyectosFiltrosPremium } from './ProyectosFiltrosPremium'
import { ProyectosHeaderPremium } from './ProyectosHeaderPremium'
import { ProyectosMetricasPremium } from './ProyectosMetricasPremium'

/**
 * Permisos del usuario (pasados desde Server Component)
 */
interface ProyectosPageProps {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canView?: boolean
  isAdmin?: boolean
}

/**
 * Página principal de proyectos
 * Orquesta todos los componentes hijos
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Recibe permisos como props desde Server Component
 * - No necesita validar autenticación (ya validada)
 * - Solo maneja UI y lógica de negocio
 */
export function ProyectosPage({
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canView = true,
  isAdmin = false,
}: ProyectosPageProps = {}) {
  // ✅ Debug logs comentados (funcionalidad verificada)
  // console.log('🏗️ [PROYECTOS MAIN] Client Component montado con permisos:', {
  //   canCreate,
  //   canEdit,
  //   canDelete,
  //   canView,
  //   isAdmin,
  // })

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [proyectoEliminar, setProyectoEliminar] = useState<string | null>(null)
  const [modalConfirmarCambios, setModalConfirmarCambios] = useState(false)
  const [datosEdicion, setDatosEdicion] = useState<ProyectoFormData | null>(null)
  const [datosConfirmacion, setDatosConfirmacion] = useState<{
    proyectoId: string
    data: ProyectoFormData
  } | null>(null)

  // ✅ REACT QUERY: Hooks con cache inteligente (reemplazan Zustand)
  const { crearProyecto, actualizarProyecto, eliminarProyecto, cargando, actualizando } =
    useProyectosQuery()
  const { proyectos, filtros, actualizarFiltros, limpiarFiltros, totalProyectos } = useProyectosFiltradosQuery()
  const estadisticas = useEstadisticasProyectosQuery()

  // ✅ Hook optimizado: Carga proyecto con validación de manzanas (1 query con JOIN)
  const {
    data: proyectoConValidacion,
    isLoading: cargandoValidacion,
  } = useProyectoConValidacion(proyectoEditar?.id)

  // Detectar si hay filtros activos
  const hayFiltrosActivos = Boolean(filtros.busqueda || filtros.estado)

  // Hook para detectar cambios
  const cambiosDetectados = useDetectarCambios(proyectoEditar, datosEdicion)

  // Proyecto que se va a eliminar (lookup por ID)
  const proyectoEliminando = proyectos.find(p => p.id === proyectoEliminar)

  const handleAbrirModal = () => setModalAbierto(true)

  const handleCerrarModal = () => {
    setModalAbierto(false)
    setModalEditar(false)
    setProyectoEditar(null)
    setModalConfirmarCambios(false)
    setDatosEdicion(null)
    setDatosConfirmacion(null)
  }

  const handleCrearProyecto = async (data: ProyectoFormData) => {
    try {
      await crearProyecto(data)
      handleCerrarModal()
    } catch (error) {
      // Error ya manejado por React Query con toast
    }
  }

  const handleEditarProyecto = (proyecto: Proyecto) => {
    setProyectoEditar(proyecto)
    setModalEditar(true)
  }

  const handleActualizarProyecto = async (data: ProyectoFormData) => {
    if (!proyectoEditar) return

    // Guardar datos para confirmación
    setDatosEdicion(data)
    setDatosConfirmacion({
      proyectoId: proyectoEditar.id,
      data: data,
    })

    // Abrir modal de confirmación de cambios
    setModalConfirmarCambios(true)
  }

  const confirmarActualizacion = async () => {
    if (!datosConfirmacion) return

    try {
      await actualizarProyecto(datosConfirmacion.proyectoId, datosConfirmacion.data)
      handleCerrarModal()
    } catch (error) {
      // Error ya manejado por React Query con toast
    }
  }

  const handleEliminarProyecto = async (id: string) => {
    setProyectoEliminar(id)
    setModalEliminar(true)
  }

  const confirmarEliminar = async () => {
    if (!proyectoEliminar) return

    try {
      await eliminarProyecto(proyectoEliminar)
      setModalEliminar(false)
      setProyectoEliminar(null)
    } catch (error) {
      // Error ya manejado por React Query con toast
    }
  }

  return (
    <div className={styles.container.page}>
      {/* Animación simplificada para navegación instantánea */}
      <motion.div {...styles.animations.container} className={styles.container.content}>
        {/* Header Premium */}
        <ProyectosHeaderPremium
          onNuevoProyecto={canCreate ? handleAbrirModal : undefined}
          totalProyectos={estadisticas.total}
        />

        {/* Métricas Premium */}
        <ProyectosMetricasPremium
          totalProyectos={estadisticas.total}
          enProceso={estadisticas.enProceso}
          completados={estadisticas.completados}
        />

        {/* Filtros Premium */}
        <ProyectosFiltrosPremium
          totalResultados={proyectos.length}
          filtros={filtros}
          onActualizarFiltros={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Contenido Principal */}
        {cargando ? (
          <ProyectosSkeleton />
        ) : proyectos.length === 0 ? (
          // Si hay filtros activos pero no hay resultados → NoResults
          // Si NO hay filtros y no hay proyectos → Empty
          hayFiltrosActivos ? (
            <ProyectosNoResults
              onLimpiarFiltros={limpiarFiltros}
              tieneBusqueda={Boolean(filtros.busqueda)}
              tieneEstado={Boolean(filtros.estado)}
            />
          ) : (
            <ProyectosEmpty onCrear={canCreate ? handleAbrirModal : undefined} />
          )
        ) : (
          <ProyectosLista
            proyectos={proyectos}
            onEdit={canEdit ? handleEditarProyecto : undefined}
            onDelete={canDelete ? handleEliminarProyecto : undefined}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </motion.div>

      {/* Modal Crear Proyecto */}
      <Modal
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        title='Nuevo Proyecto'
        description='Completa la información del nuevo proyecto de construcción'
        size='xl'
        gradientColor='orange'
        icon={<Building2 className="w-6 h-6 text-white" />}
      >
        <ProyectosForm
          onSubmit={handleCrearProyecto}
          onCancel={handleCerrarModal}
          isLoading={cargando}
        />
      </Modal>

      {/* Modal Editar Proyecto */}
      <Modal
        isOpen={modalEditar}
        onClose={handleCerrarModal}
        title='Editar Proyecto'
        description='Actualiza la información del proyecto'
        size='xl'
        gradientColor='orange'
        icon={<Building2 className="w-6 h-6 text-white" />}
        closeOnEscape={!modalConfirmarCambios}
        closeOnBackdrop={!modalConfirmarCambios}
      >
        {cargandoValidacion ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando datos del proyecto...
              </p>
            </div>
          </div>
        ) : proyectoConValidacion ? (
          <ProyectosForm
            onSubmit={handleActualizarProyecto}
            onCancel={handleCerrarModal}
            isLoading={cargando}
            initialData={{
              nombre: proyectoConValidacion.nombre,
              descripcion: proyectoConValidacion.descripcion,
              ubicacion: proyectoConValidacion.ubicacion,
              fechaInicio: proyectoConValidacion.fechaInicio,
              fechaFinEstimada: proyectoConValidacion.fechaFinEstimada,
              presupuesto: proyectoConValidacion.presupuesto,
              estado: proyectoConValidacion.estado,
              responsable: proyectoConValidacion.responsable,
              telefono: proyectoConValidacion.telefono,
              email: proyectoConValidacion.email,
              // ✅ Manzanas CON validación pre-cargada (sin queries adicionales)
              manzanas: proyectoConValidacion.manzanas.map(m => ({
                id: m.id,
                nombre: m.nombre,
                totalViviendas: m.totalViviendas,
                precioBase: 0, // No está en DB pero se requiere en tipo
                superficieTotal: 0,
                ubicacion: '',
                // ✅ Datos de validación (para el formulario)
                cantidadViviendasCreadas: m.cantidadViviendasCreadas,
                esEditable: m.esEditable,
                motivoBloqueado: m.motivoBloqueado,
              })),
            }}
            isEditing={true}
          />
        ) : null}
      </Modal>

      {/* Modal Confirmar Cambios */}
      <ConfirmarCambiosModal
        isOpen={modalConfirmarCambios}
        onClose={() => setModalConfirmarCambios(false)}
        onConfirm={confirmarActualizacion}
        cambios={cambiosDetectados}
        isLoading={actualizando}
      />

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => {
          setModalEliminar(false)
          setProyectoEliminar(null)
        }}
        title='Eliminar Proyecto'
        description='Esta acción no se puede deshacer'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            ¿Estás seguro de que deseas eliminar el proyecto{' '}
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              "{proyectoEliminando?.nombre}"
            </span>
            ?
          </p>
          {proyectoEliminando && proyectoEliminando.manzanas.length > 0 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
              <p className='text-sm text-red-800 dark:text-red-300'>
                ⚠️ Este proyecto tiene{' '}
                <strong>{proyectoEliminando.manzanas.length} manzana(s)</strong>{' '}
                que también serán eliminadas.
              </p>
            </div>
          )}
          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={() => {
                setModalEliminar(false)
                setProyectoEliminar(null)
              }}
              disabled={cargando}
              className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={confirmarEliminar}
              disabled={cargando}
              className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50'
            >
              {cargando ? 'Eliminando...' : 'Eliminar Proyecto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
