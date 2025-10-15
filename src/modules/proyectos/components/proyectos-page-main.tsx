'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { staggerContainer } from '../../../shared/styles/animations'
import { Modal } from '../../../shared/components/ui/Modal'
import { useProyectos, useProyectosFiltrados } from '../hooks/useProyectos'
import { ProyectosHeader } from './proyectos-header'
import { ProyectosSearch } from './proyectos-search'
import { ProyectosLista } from './proyectos-lista'
import { ProyectosEmpty } from './proyectos-empty'
import { ProyectosSkeleton } from './proyectos-skeleton'
import { ProyectosForm } from './proyectos-form'
import type { ProyectoFormData, Proyecto } from '../types'

export function ProyectosPage() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [proyectoEliminar, setProyectoEliminar] = useState<string | null>(null)

  const { crearProyecto, actualizarProyecto, eliminarProyecto, cargando } = useProyectos()
  const { proyectos } = useProyectosFiltrados()

  const handleAbrirModal = () => setModalAbierto(true)
  const handleCerrarModal = () => {
    setModalAbierto(false)
    setModalEditar(false)
    setProyectoEditar(null)
  }

  const handleCrearProyecto = async (data: ProyectoFormData) => {
    try {
      await crearProyecto(data)
      handleCerrarModal()
    } catch (error) {
      console.error('Error al crear proyecto:', error)
    }
  }

  const handleEditarProyecto = (proyecto: Proyecto) => {
    setProyectoEditar(proyecto)
    setModalEditar(true)
  }

  const handleActualizarProyecto = async (data: ProyectoFormData) => {
    if (!proyectoEditar) return
    try {
      await actualizarProyecto(proyectoEditar.id, data)
      handleCerrarModal()
    } catch (error) {
      console.error('Error al actualizar proyecto:', error)
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
      console.error('Error al eliminar proyecto:', error)
    }
  }

  const proyectoEliminando = proyectos.find(p => p.id === proyectoEliminar)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <ProyectosHeader onNuevoProyecto={handleAbrirModal} />

        <ProyectosSearch />

        {cargando ? (
          <ProyectosSkeleton />
        ) : proyectos.length === 0 ? (
          <ProyectosEmpty onCrear={handleAbrirModal} />
        ) : (
          <ProyectosLista
            proyectos={proyectos}
            onEdit={handleEditarProyecto}
            onDelete={handleEliminarProyecto}
          />
        )}
      </motion.div>

      {/* Modal Crear Proyecto */}
      <Modal
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        title="Nuevo Proyecto"
        description="Completa la información del nuevo proyecto de construcción"
        size="xl"
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
        title="Editar Proyecto"
        description="Actualiza la información del proyecto"
        size="xl"
      >
        {proyectoEditar && (
          <ProyectosForm
            onSubmit={handleActualizarProyecto}
            onCancel={handleCerrarModal}
            isLoading={cargando}
            initialData={proyectoEditar}
          />
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={modalEliminar}
        onClose={() => {
          setModalEliminar(false)
          setProyectoEliminar(null)
        }}
        title="Eliminar Proyecto"
        description="Esta acción no se puede deshacer"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro de que deseas eliminar el proyecto{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              "{proyectoEliminando?.nombre}"
            </span>
            ?
          </p>
          {proyectoEliminando && proyectoEliminando.manzanas.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                ⚠️ Este proyecto tiene <strong>{proyectoEliminando.manzanas.length} manzana(s)</strong> que también serán eliminadas.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalEliminar(false)
                setProyectoEliminar(null)
              }}
              disabled={cargando}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              disabled={cargando}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {cargando ? 'Eliminando...' : 'Eliminar Proyecto'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}