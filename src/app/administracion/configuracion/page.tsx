/**
 * ConfiguracionPage - Vista principal de configuración de recargos
 * ✅ Tabla con CRUD completo
 * ✅ Modal para crear/editar
 * ✅ Diseño estándar compacto
 */

'use client'

import { FormularioConfiguracion } from '@/modules/configuracion/components/formulario-configuracion'
import { useConfiguracion } from '@/modules/configuracion/hooks/useConfiguracion'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle,
    DollarSign,
    Edit2,
    Plus,
    Settings,
    Trash2,
    XCircle,
} from 'lucide-react'
import { useState } from 'react'

export default function ConfiguracionPage() {
  const {
    configuraciones,
    loading,
    error,
    modoEdicion,
    configuracionSeleccionada,
    crear,
    actualizar,
    eliminar,
    toggleActivo,
    abrirEdicion,
    abrirCreacion,
    cerrarModal,
  } = useConfiguracion()

  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      gastos_notariales: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      recargo_esquinera: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      recargo_especial: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      otros: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
    }
    return colores[tipo] || colores.otros
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      gastos_notariales: 'Gastos Notariales',
      recargo_esquinera: 'Recargo Esquinera',
      recargo_especial: 'Recargo Especial',
      otros: 'Otros',
    }
    return labels[tipo] || tipo
  }

  const handleEliminar = async (id: string) => {
    const exito = await eliminar(id)
    if (exito) {
      setConfirmEliminar(null)
    }
  }

  const handleGuardar = async (datos: any) => {
    if (configuracionSeleccionada) {
      return await actualizar(configuracionSeleccionada.id, datos)
    } else {
      return await crear(datos)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-6 shadow-2xl shadow-blue-500/20"
        >
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-bold text-white">Recargos</h1>
                  <p className="text-blue-100 dark:text-blue-200 text-xs">
                    Gestiona gastos notariales y recargos • {configuraciones.length} recargos
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={abrirCreacion}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nueva Recargo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {configuraciones.map((config) => (
                  <motion.tr
                    key={config.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTipoColor(config.tipo)}`}>
                        {getTipoLabel(config.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {config.nombre}
                        </p>
                        {config.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {config.descripcion}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(config.valor)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActivo(config.id, !config.activo)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: config.activo
                            ? 'rgb(134 239 172 / 0.2)'
                            : 'rgb(248 113 113 / 0.2)',
                          color: config.activo ? 'rgb(22 163 74)' : 'rgb(220 38 38)',
                        }}
                      >
                        {config.activo ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {config.activo ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => abrirEdicion(config)}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfirmEliminar(config.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {configuraciones.length === 0 && (
            <div className="p-12 text-center">
              <Settings className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No hay recargos configurados</p>
              <button
                onClick={abrirCreacion}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Crear el primer recargo
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de formulario */}
      <AnimatePresence>
        {modoEdicion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={cerrarModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {configuracionSeleccionada ? 'Editar Recargo' : 'Nuevo Recargo'}
              </h2>
              <FormularioConfiguracion
                configuracion={configuracionSeleccionada}
                onGuardar={handleGuardar}
                onCancelar={cerrarModal}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {confirmEliminar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setConfirmEliminar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  ¿Eliminar recargo?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEliminar(confirmEliminar)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setConfirmEliminar(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
