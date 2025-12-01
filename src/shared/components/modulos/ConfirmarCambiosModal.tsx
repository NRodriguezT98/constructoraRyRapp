/**
 * ConfirmarCambiosModal - Componente COMPARTIDO entre módulos
 * ✅ Componente presentacional con theming dinámico
 * ✅ Reutilizable en proyectos, viviendas, clientes, etc.
 * ✅ Paleta de colores según moduleName
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    X
} from 'lucide-react'

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

export interface CambioDetectado {
  campo: string
  label: string
  valorAnterior: string | number
  valorNuevo: string | number
  icono: any
  categoria: string
}

interface CategoriaConfig {
  titulo: string
  icono: any
}

interface ConfirmarCambiosModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: CambioDetectado[]
  categoriasConfig: Record<string, CategoriaConfig>
  isLoading?: boolean
  moduleName?: ModuleName
  tituloEntidad?: string // "vivienda", "proyecto", "cliente", etc.
}

export function ConfirmarCambiosModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  categoriasConfig,
  isLoading = false,
  moduleName = 'proyectos',
  tituloEntidad = 'registro',
}: ConfirmarCambiosModalProps) {
  const theme = moduleThemes[moduleName]

  // Agrupar cambios por categoría
  const cambiosPorCategoria = cambios.reduce((acc, cambio) => {
    if (!acc[cambio.categoria]) {
      acc[cambio.categoria] = []
    }
    acc[cambio.categoria].push(cambio)
    return acc
  }, {} as Record<string, CambioDetectado[]>)

  const totalCambios = cambios.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative my-4 w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 ${theme.classes.bg.gradient}`}>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirmar Cambios</h3>
                <p className="text-white/80 text-xs">Revisa los cambios antes de guardar</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {totalCambios === 0 ? (
            /* Sin cambios */
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No se detectaron cambios
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                No has modificado ningún campo. Puedes cerrar este modal o volver atrás para realizar cambios.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumen */}
              <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${theme.classes.bg.light} ${theme.classes.border.base}`}>
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${theme.classes.text.primary}`} />
                <p className={`text-xs ${theme.classes.text.dark}`}>
                  <strong className={`font-bold ${theme.classes.text.primary}`}>
                    {totalCambios}
                  </strong>{' '}
                  cambio(s) detectados en {tituloEntidad}
                </p>
              </div>

              {/* Cambios por categoría */}
              {Object.entries(cambiosPorCategoria).map(([categoria, cambiosCategoria]) => {
                const config = categoriasConfig[categoria]
                if (!config) return null

                const IconoCategoria = config.icono

                return (
                  <div
                    key={categoria}
                    className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Header categoría */}
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-sm ${theme.classes.bg.gradient}`}>
                          <IconoCategoria className="w-3.5 h-3.5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {config.titulo} ({cambiosCategoria.length})
                        </h4>
                      </div>
                    </div>

                    {/* Lista de cambios */}
                    <div className="p-3 space-y-2.5">
                      {cambiosCategoria.map((cambio, index) => {
                        const Icono = cambio.icono

                        return (
                          <div key={index} className="space-y-1.5">
                            {/* Label */}
                            <div className="flex items-center gap-1.5">
                              <Icono className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {cambio.label}
                              </span>
                            </div>

                            {/* Diff compacto en una línea */}
                            <div className="pl-5 flex items-center gap-2 text-xs flex-wrap">
                              {/* Anterior */}
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                                Anterior:
                              </span>
                              <span className="text-red-800 dark:text-red-200 line-through">
                                {cambio.valorAnterior}
                              </span>

                              {/* Separador */}
                              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />

                              {/* Nuevo */}
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                                Nuevo:
                              </span>
                              <span className="text-green-800 dark:text-green-200 font-semibold">
                                {cambio.valorNuevo}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Advertencia */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong className="font-semibold">⚠️ Cambios permanentes:</strong> Estos cambios se guardarán en el sistema.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {totalCambios > 0 && (
          <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${theme.classes.button.primary}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
