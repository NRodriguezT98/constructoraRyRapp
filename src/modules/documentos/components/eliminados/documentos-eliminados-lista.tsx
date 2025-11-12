'use client'

/**
 * 🗑️ COMPONENTE PRESENTACIONAL: DocumentosEliminadosLista
 *
 * Lista de documentos eliminados (soft delete) - Solo Admin
 * - Tabla responsive con documentos eliminados
 * - Acciones: Restaurar | Eliminar Definitivo
 * - Filtros: Búsqueda, Proyecto
 * - Diseño compacto, paleta rojo/gris
 */

import { motion } from 'framer-motion'
import { AlertTriangle, Search, Trash2 } from 'lucide-react'

import { EmptyState } from '@/shared/components/layout/EmptyState'
import { LoadingState } from '@/shared/components/layout/LoadingState'
import { ConfirmacionModal } from '@/shared/components/modals'
import { useDocumentosEliminados } from '../../hooks'
import { DocumentoEliminadoCard } from './documento-eliminado-card'

/**
 * Tipo extendido con relaciones de Supabase (JOIN)
 * Incluye: proyectos, usuario, categoria
 */
type DocumentoConRelaciones = {
  id: string
  titulo: string
  version: number
  proyectos?: {
    id: string
    nombre: string
    codigo?: string
  }
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
  [key: string]: unknown // Otras propiedades de DocumentoProyecto
}

// Tipo para proyecto único en filtro
type ProyectoFiltro = {
  id: string
  nombre: string
  codigo?: string
}

export function DocumentosEliminadosLista() {
  const {
    documentos,
    documentosOriginales,
    cargando,
    error,
    estadisticas,
    busqueda,
    setBusqueda,
    proyectoFiltro,
    setProyectoFiltro,
    handleRestaurar,
    handleEliminarDefinitivo,
    restaurando,
    eliminando,
    // 🆕 Modales
    modalRestaurar,
    setModalRestaurar,
    confirmarRestaurar,
    modalEliminar,
    setModalEliminar,
    confirmarEliminarDefinitivo,
    confirmacionTexto,
    setConfirmacionTexto,
  } = useDocumentosEliminados()

  /**
   * Type assertion: documentos vienen de Supabase con relaciones (proyectos, usuario)
   * por JOIN en el service, pero TypeScript solo conoce el tipo base DocumentoProyecto
   */
  const docsConRelaciones = documentosOriginales as unknown as DocumentoConRelaciones[]

  // Estados de carga/error
  if (cargando) return <LoadingState message="Cargando documentos eliminados..." />
  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="w-12 h-12" />}
        title="Error al cargar"
        description={error.message}
      />
    )
  }

  // Extraer proyectos únicos para filtro
  const proyectosUnicos: ProyectoFiltro[] = Array.from(
    new Map(
      docsConRelaciones
        .map((doc) => doc.proyectos)
        .filter((p): p is ProyectoFiltro => p !== null && p !== undefined && 'id' in p)
        .map((p) => [p.id, p])
    ).values()
  )

  return (
    <div className="space-y-4">
      {/* 🔍 FILTROS - Sticky, horizontal, compacto */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-red-500/10"
      >
        <div className="flex items-center gap-2">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <label htmlFor="search-eliminados" className="sr-only">
              Buscar documentos
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              id="search-eliminados"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, categoría, proyecto..."
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Filtro por proyecto */}
          <select
            value={proyectoFiltro}
            onChange={(e) => setProyectoFiltro(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm min-w-[180px]"
            aria-label="Filtrar por proyecto"
          >
            <option value="todos">Todos los proyectos</option>
            {proyectosUnicos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {estadisticas.filtrados} de {estadisticas.total} documentos eliminados
          </p>
          {busqueda || proyectoFiltro !== 'todos' ? (
            <button
              onClick={() => {
                setBusqueda('')
                setProyectoFiltro('todos')
              }}
              className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </motion.div>

      {/* 📋 LISTA DE DOCUMENTOS ELIMINADOS */}
      {documentos.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="w-12 h-12" />}
          title={busqueda || proyectoFiltro !== 'todos' ? 'Sin resultados' : 'Papelera vacía'}
          description={
            busqueda || proyectoFiltro !== 'todos'
              ? 'No se encontraron documentos con los filtros aplicados'
              : 'No hay documentos eliminados'
          }
        />
      ) : (
        <div className="space-y-3">
          {documentos.map((documento, index) => (
            <motion.div
              key={documento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DocumentoEliminadoCard
                documento={documento}
                onRestaurarTodo={handleRestaurar}
                onEliminarDefinitivo={handleEliminarDefinitivo}
                restaurando={restaurando === documento.id}
                eliminando={eliminando === documento.id}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* 🆕 MODALES CUSTOM */}
      {/* Modal: Confirmar restauración */}
      <ConfirmacionModal
        isOpen={modalRestaurar.isOpen}
        onClose={() => setModalRestaurar({ isOpen: false, documentoId: '', titulo: '' })}
        onConfirm={confirmarRestaurar}
        variant="success"
        title="¿Restaurar documento?"
        message={
          <>
            <p className="mb-2">
              El documento <strong>{modalRestaurar.titulo}</strong> volverá a la lista de
              documentos activos.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Podrás encontrarlo en su proyecto correspondiente.
            </p>
          </>
        }
        confirmText="Sí, restaurar"
        isLoading={restaurando !== null}
        loadingText="Restaurando..."
      />

      {/* Modal: Confirmar eliminación definitiva con prompt */}
      <ConfirmacionModal
        isOpen={modalEliminar.isOpen}
        onClose={() => {
          setModalEliminar({ isOpen: false, documentoId: '', titulo: '' })
          setConfirmacionTexto('')
        }}
        onConfirm={confirmarEliminarDefinitivo}
        variant="danger"
        title="⚠️ Eliminar PERMANENTEMENTE"
        message={
          <div className="space-y-4">
            <p className="font-semibold text-left">
              Esta acción NO se puede deshacer. Se eliminará:
            </p>
            <ul className="text-left text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>Documento: <strong>{modalEliminar.titulo}</strong></li>
              <li>Registro de la base de datos</li>
              <li>Archivo del almacenamiento</li>
              <li>Historial de versiones</li>
            </ul>
            <div className="pt-2 border-t border-red-200 dark:border-red-800">
              <label htmlFor="confirm-delete" className="block text-sm font-medium mb-2 text-left">
                Escribe <span className="font-mono bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">ELIMINAR</span> para confirmar:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmacionTexto}
                onChange={(e) => setConfirmacionTexto(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white dark:bg-gray-900"
                autoFocus
              />
            </div>
          </div>
        }
        confirmText="Eliminar definitivo"
        isLoading={eliminando !== null}
        loadingText="Eliminando..."
      />
    </div>
  )
}
