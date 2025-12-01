'use client'

/**
 * 🗑️ COMPONENTE PRESENTACIONAL: DocumentosEliminadosLista (Admin Only - Premium UX)
 *
 * Papelera global unificada de todos los módulos
 * - Multi-módulo: Proyectos, Viviendas, Clientes
 * - Estadísticas premium con gradientes
 * - Filtros avanzados: Módulo, Búsqueda, Fechas, Ordenamiento
 * - Cards con badges de módulo
 * - Diseño profesional con glassmorphism
 */

import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, FileText, Filter, Home, RefreshCw, Search, Trash2, TrendingDown, User, X } from 'lucide-react'

import { EmptyState } from '@/shared/components/layout/EmptyState'
import { LoadingState } from '@/shared/components/layout/LoadingState'
import { ConfirmacionModal } from '@/shared/components/modals'
import { useDocumentosEliminados } from '../../hooks'
import { DocumentoEliminadoCard } from './documento-eliminado-card'

// Configuración visual por módulo
const MODULOS_CONFIG = {
  proyectos: {
    icono: FileText,
    label: 'Proyectos',
    color: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  viviendas: {
    icono: Home,
    label: 'Viviendas',
    color: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  clientes: {
    icono: User,
    label: 'Clientes',
    color: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
  },
} as const

type ModuloKey = keyof typeof MODULOS_CONFIG

export function DocumentosEliminadosLista() {
  const {
    documentos,
    documentosOriginales,
    cargando,
    error,
    estadisticas,
    busqueda,
    setBusqueda,
    moduloFiltro,
    setModuloFiltro,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    ordenamiento,
    setOrdenamiento,
    handleRestaurar,
    handleEliminarDefinitivo,
    restaurando,
    eliminando,
    refrescar,
    modalRestaurar,
    setModalRestaurar,
    confirmarRestaurar,
    modalEliminar,
    setModalEliminar,
    confirmarEliminarDefinitivo,
    confirmacionTexto,
    setConfirmacionTexto,
  } = useDocumentosEliminados()

  // Estados de carga/error
  if (cargando) {
    return (
      <LoadingState
        message="Cargando papelera de todos los módulos..."
        detail="Consultando proyectos, viviendas y más..."
      />
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="w-12 h-12" />}
        title="Error al cargar papelera"
        description={error.message}
      />
    )
  }

  const hayFiltrosActivos = busqueda || moduloFiltro !== 'todos' || fechaDesde || fechaHasta

  return (
    <div className="space-y-4">
      {/* 📊 ESTADÍSTICAS PREMIUM - Grid con gradientes */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Total global */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-gray-500/10 dark:from-red-900/20 dark:to-gray-900/20 border border-red-200/50 dark:border-red-800/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-gray-600 flex items-center justify-center shadow-lg shadow-red-500/50">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {estadisticas.total}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                Total Eliminados
              </p>
            </div>
          </div>
        </motion.div>

        {/* Proyectos */}
        {Object.entries(estadisticas.porModulo).map(([modulo, cantidad]) => {
          const config = MODULOS_CONFIG[modulo as ModuloKey]
          if (!config) return null
          const IconoModulo = config.icono

          return (
            <motion.div
              key={modulo}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => setModuloFiltro(modulo as any)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                  <IconoModulo className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-2xl font-bold bg-gradient-to-br ${config.color} bg-clip-text text-transparent`}>
                    {cantidad}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">
                    {config.label}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 🔍 FILTROS AVANZADOS - Sticky */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-red-500/10"
      >
        {/* Fila 1: Búsqueda, Módulo, Ordenamiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Búsqueda */}
          <div className="relative">
            <label htmlFor="search-global" className="sr-only">Buscar en todos los módulos</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              id="search-global"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, entidad, usuario..."
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm placeholder:text-gray-400"
            />
          </div>

          {/* Filtro por módulo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={moduloFiltro}
              onChange={(e) => setModuloFiltro(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm appearance-none"
              aria-label="Filtrar por módulo"
            >
              <option value="todos">Todos los módulos</option>
              {Object.entries(MODULOS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="relative">
            <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm appearance-none"
              aria-label="Ordenar por"
            >
              <option value="recientes">Más recientes primero</option>
              <option value="antiguos">Más antiguos primero</option>
              <option value="alfabetico">Orden alfabético</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Rango de fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              aria-label="Desde fecha"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
              aria-label="Hasta fecha"
            />
          </div>
        </div>

        {/* Barra de estado y acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            <span className="font-bold text-red-600 dark:text-red-400">{estadisticas.filtrados}</span> de{' '}
            <span className="font-bold">{estadisticas.total}</span> documentos
          </p>
          <div className="flex items-center gap-2">
            {hayFiltrosActivos ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setBusqueda('')
                  setModuloFiltro('todos')
                  setFechaDesde('')
                  setFechaHasta('')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </motion.button>
            ) : null}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refrescar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 📋 LISTA DE DOCUMENTOS ELIMINADOS */}
      {documentos.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="w-12 h-12" />}
          title={hayFiltrosActivos ? 'Sin resultados' : 'Papelera vacía'}
          description={
            hayFiltrosActivos
              ? 'No se encontraron documentos con los filtros aplicados'
              : 'No hay documentos eliminados en ningún módulo'
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {documentos.map((documento: any, index: number) => {
            const config = MODULOS_CONFIG[documento.modulo as ModuloKey]
            const IconoModulo = config?.icono || FileText

            return (
              <motion.div
                key={documento.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="relative"
              >
                {/* Card mejorado con header integrado */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Header con badge de módulo y metadata */}
                  <div className={`px-4 py-3 border-b-2 ${config?.borderColor} bg-gradient-to-r ${config?.bgLight} dark:from-gray-800 dark:to-gray-800`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      {/* Badge de módulo con label explícito */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config?.color} flex items-center justify-center shadow-md`}>
                          <IconoModulo className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Módulo:</span>
                            <span className={`text-xs font-bold ${config?.textColor}`}>
                              {config?.label || documento.modulo}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">
                            {documento.entidad_nombre || 'Sin información'}
                          </span>
                        </div>
                      </div>

                      {/* Metadata adicional con labels explícitos */}
                      <div className="flex flex-col gap-1 text-xs">
                        {documento.usuario && (
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <User className="w-3 h-3" />
                            <span className="font-semibold text-[10px]">Eliminado por:</span>
                            <span className="text-[10px]">{documento.usuario.nombres} {documento.usuario.apellidos}</span>
                          </div>
                        )}
                        {documento.fecha_actualizacion && (
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                            <Calendar className="w-3 h-3" />
                            <span className="font-semibold text-[10px]">Fecha eliminación:</span>
                            <span className="text-[10px] bg-white/50 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                              {new Date(documento.fecha_actualizacion).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card original (sin header duplicado) */}
                  <DocumentoEliminadoCard
                    documento={documento}
                    modulo={documento.modulo as 'proyectos' | 'viviendas' | 'clientes'}
                    onRestaurarTodo={(id, titulo) => handleRestaurar(id, titulo, documento.modulo)}
                    onEliminarDefinitivo={(id, titulo) => handleEliminarDefinitivo(id, titulo, documento.modulo)}
                    restaurando={restaurando === documento.id}
                    eliminando={eliminando === documento.id}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
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
