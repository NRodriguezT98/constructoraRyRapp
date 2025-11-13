'use client'

import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertCircle, Building2 } from 'lucide-react'

import { useVistaPreference } from '@/shared/hooks/useVistaPreference'
import { Modal } from '../../../shared/components/ui/Modal'
import {
    useEstadisticasProyectosQuery,
    useProyectoConValidacion,
    useProyectosFiltradosQuery,
    useProyectosQuery,
} from '../hooks'
import { useDetectarCambios } from '../hooks/useDetectarCambios'
// ✅ REACT QUERY: Nuevos hooks con cache inteligente
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
import { ProyectosTabla } from './ProyectosTabla'

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

  // ✅ Query client para invalidar queries manualmente
  const queryClient = useQueryClient()

  // ✅ REACT QUERY: Hooks con cache inteligente (reemplazan Zustand)
  const { crearProyecto, actualizarProyecto, eliminarProyecto, cargando, creando, actualizando, eliminando } =
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

  // Hook para preferencia de vista (cards vs tabla)
  const [vista, setVista] = useVistaPreference({ moduleName: 'proyectos' })

  // Estado para manejar cierre con confirmación
  const [modalConfirmarDescarte, setModalConfirmarDescarte] = useState(false)
  const [hayFormularioConCambios, setHayFormularioConCambios] = useState(false)

  // Proyecto que se va a eliminar (lookup por ID)
  const proyectoEliminando = proyectos.find(p => p.id === proyectoEliminar)

  const handleAbrirModal = () => {
    setProyectoEditar(null) // ✅ Resetear al crear nuevo
    setModalAbierto(true)
  }

  // ✅ Cerrar directo (sin confirmación)
  const handleCerrarModal = () => {
    setModalAbierto(false)
    setModalEditar(false)
    // ❌ NO resetear proyectoEditar aquí - se mantiene para próxima edición
    // setProyectoEditar(null)
    setModalConfirmarCambios(false)
    setDatosEdicion(null)
    setDatosConfirmacion(null)
    setModalConfirmarDescarte(false)
    setHayFormularioConCambios(false)
  }

  // ✅ Intentar cerrar (con validación de cambios)
  const handleIntentarCerrarModal = () => {
    // Si hay cambios sin guardar, mostrar modal de confirmación
    if (hayFormularioConCambios) {
      setModalConfirmarDescarte(true)
    } else {
      // Sin cambios, cerrar directo
      handleCerrarModal()
    }
  }

  // ✅ Confirmar descarte de cambios
  const confirmarDescartarCambios = () => {
    setModalConfirmarDescarte(false)
    handleCerrarModal()
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
      const proyectoActualizado = await actualizarProyecto(datosConfirmacion.proyectoId, datosConfirmacion.data)

      // ✅ Invalidar la query de validación para forzar recarga con datos frescos
      await queryClient.invalidateQueries({
        queryKey: ['proyecto-validacion', datosConfirmacion.proyectoId]
      })

      // ✅ Actualizar el proyecto en edición con los datos frescos
      if (proyectoActualizado) {
        setProyectoEditar(proyectoActualizado)
      }

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

        {/* Filtros Premium con toggle de vista */}
        <ProyectosFiltrosPremium
          totalResultados={proyectos.length}
          filtros={filtros}
          onActualizarFiltros={actualizarFiltros}
          onLimpiarFiltros={limpiarFiltros}
          vista={vista}
          onCambiarVista={setVista}
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
        ) : vista === 'cards' ? (
          <ProyectosLista
            proyectos={proyectos}
            onEdit={canEdit ? handleEditarProyecto : undefined}
            onDelete={canDelete ? handleEliminarProyecto : undefined}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ) : (
          <ProyectosTabla
            proyectos={proyectos}
            onView={handleEditarProyecto}
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
        onClose={handleIntentarCerrarModal}
        title='Nuevo Proyecto'
        description='Completa la información del nuevo proyecto de construcción'
        size='xl'
        gradientColor='orange'
        icon={<Building2 className="w-6 h-6 text-white" />}
        closeOnBackdrop={!hayFormularioConCambios}
        closeOnEscape={!hayFormularioConCambios}
      >
        <ProyectosForm
          onSubmit={handleCrearProyecto}
          onCancel={handleIntentarCerrarModal}
          isLoading={creando}
          onHasChanges={setHayFormularioConCambios}
        />
      </Modal>

      {/* Modal Editar Proyecto */}
      <Modal
        isOpen={modalEditar}
        onClose={handleIntentarCerrarModal}
        title='Editar Proyecto'
        description='Actualiza la información del proyecto'
        size='xl'
        gradientColor='orange'
        icon={<Building2 className="w-6 h-6 text-white" />}
        closeOnEscape={!hayFormularioConCambios}
        closeOnBackdrop={!hayFormularioConCambios}
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
            isLoading={actualizando}
            initialData={{
              id: proyectoConValidacion.id,
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
            onHasChanges={setHayFormularioConCambios}
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
        gradientColor='orange'
        compact={true}
      >
        <div className='space-y-3'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            ¿Estas seguro de eliminar{' '}
            <span className='font-semibold text-gray-900 dark:text-gray-100'>
              "{proyectoEliminando?.nombre}"
            </span>
            ?
          </p>
          {proyectoEliminando && proyectoEliminando.manzanas.length > 0 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-900/20'>
              <p className='text-xs text-red-800 dark:text-red-300'>
                ⚠️ Incluye <strong>{proyectoEliminando.manzanas.length} manzana(s)</strong>
              </p>
            </div>
          )}
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={() => {
                setModalEliminar(false)
                setProyectoEliminar(null)
              }}
              disabled={eliminando}
              className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={confirmarEliminar}
              disabled={eliminando}
              className='rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {eliminando && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Descarte de Cambios */}
      <Modal
        isOpen={modalConfirmarDescarte}
        onClose={() => setModalConfirmarDescarte(false)}
        title='¿Descartar cambios?'
        description={modalEditar ? 'Las modificaciones no se guardarán' : 'El proyecto no se creará'}
        size='sm'
        gradientColor='orange'
        icon={<AlertCircle className="w-6 h-6 text-white" />}
        compact={true}
      >
        <div className='space-y-3'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {modalEditar
              ? 'Hay cambios sin guardar en el proyecto.'
              : 'Has comenzado a llenar el formulario de creación.'}
          </p>
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={() => setModalConfirmarDescarte(false)}
              className='px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            >
              {modalEditar ? 'Continuar editando' : 'Continuar creando'}
            </button>
            <button
              type='button'
              onClick={confirmarDescartarCambios}
              className='px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all'
            >
              Descartar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
