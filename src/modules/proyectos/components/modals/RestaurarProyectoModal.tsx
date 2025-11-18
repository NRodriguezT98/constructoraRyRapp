/**
 * RestaurarProyectoModal - Modal de confirmación para restaurar proyectos archivados
 * ✅ Confirma antes de restaurar
 * ✅ Muestra información del proyecto archivado
 * ✅ Tema verde/esmeralda para acción de restauración
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArchiveRestore, X } from 'lucide-react'

interface RestaurarProyectoModalProps {
  isOpen: boolean
  nombreProyecto: string
  fechaArchivado?: string | null
  motivoArchivo?: string | null
  onConfirm: () => void
  onCancel: () => void
  restaurando?: boolean
}

export function RestaurarProyectoModal({
  isOpen,
  nombreProyecto,
  fechaArchivado,
  motivoArchivo,
  onConfirm,
  onCancel,
  restaurando = false,
}: RestaurarProyectoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header con gradiente verde */}
              <div className="relative h-32 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-6">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />

                <button
                  onClick={onCancel}
                  disabled={restaurando}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <ArchiveRestore className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Restaurar Proyecto
                    </h2>
                    <p className="text-green-100 text-sm">
                      El proyecto volverá a estar activo
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Proyecto a restaurar */}
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                    Proyecto:
                  </p>
                  <p className="text-base font-bold text-green-900 dark:text-green-300">
                    {nombreProyecto}
                  </p>
                </div>

                {/* Información de archivado */}
                {(fechaArchivado || motivoArchivo) && (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2">
                    {fechaArchivado && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Archivado el:
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(fechaArchivado).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                    {motivoArchivo && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                          Motivo:
                        </p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {motivoArchivo}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Información importante */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Al restaurar este proyecto:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Volverá a aparecer en la lista de proyectos activos</li>
                      <li>• Se podrá editar y gestionar normalmente</li>
                      <li>• Las estadísticas lo incluirán nuevamente</li>
                    </ul>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={restaurando}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={restaurando}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {restaurando ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
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
                        Restaurando...
                      </>
                    ) : (
                      <>
                        <ArchiveRestore className="w-4 h-4" />
                        Restaurar Proyecto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
