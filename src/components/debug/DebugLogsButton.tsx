'use client'

import { DebugLogger } from '@/lib/utils/debug-logger'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, FileText, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Botón flotante para visualizar logs persistidos
 * Solo visible en desarrollo
 */
export function DebugLogsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.log('🔵 [DEBUG BUTTON] Botón de debug montado en la página')
  }, [])

  const handleOpen = () => {
    const allLogs = DebugLogger.getLogs()
    console.log('🔵 [DEBUG BUTTON] Abriendo modal con', allLogs.length, 'logs')
    setLogs(allLogs)
    setIsOpen(true)

    // También imprimir en consola
    DebugLogger.printLogs()
  }

  const handleCopyLogs = async () => {
    try {
      // Formatear logs como texto legible
      const logsText = logs
        .map((log, index) => {
          const icon = log.level === 'ERROR' ? '❌' : log.level === 'WARN' ? '⚠️' : '📝'
          let text = `${index + 1}. ${icon} [${log.timestamp}] [${log.component}] ${log.message}`
          if (log.data) {
            text += `\n   Data: ${JSON.stringify(log.data, null, 2)}`
          }
          return text
        })
        .join('\n\n')

      const fullText = `========== DEBUG LOGS (${logs.length}) ==========\n\n${logsText}\n\n================================`

      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      console.log('✅ [DEBUG BUTTON] Logs copiados al portapapeles')

      // Reset después de 2 segundos
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('❌ [DEBUG BUTTON] Error al copiar logs:', error)
      alert('Error al copiar logs. Intenta seleccionar y copiar manualmente.')
    }
  }

  const handleClear = () => {
    DebugLogger.clearLogs()
    setLogs([])
    setIsOpen(false)
  }

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[99999] w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center ring-4 ring-blue-500/20"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        title="Ver logs de debug (click aquí)"
        animate={{
          boxShadow: [
            '0 10px 40px rgba(59, 130, 246, 0.3)',
            '0 10px 60px rgba(99, 102, 241, 0.5)',
            '0 10px 40px rgba(59, 130, 246, 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <FileText className="w-6 h-6" />
      </motion.button>

      {/* Modal de logs */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Debug Logs ({logs.length})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLogs}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Logs
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logs */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No hay logs registrados
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-xs">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          log.level === 'ERROR'
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                            : log.level === 'WARN'
                            ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <span
                            className={`inline-flex items-center justify-center w-14 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.level === 'ERROR'
                                ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100'
                                : log.level === 'WARN'
                                ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100'
                                : 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            }`}
                          >
                            {log.level}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                            .{new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            [{log.component}]
                          </span>
                        </div>
                        <div className="text-gray-900 dark:text-gray-100 ml-16">
                          {log.message}
                        </div>
                        {log.data && (
                          <pre className="mt-2 ml-16 text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
