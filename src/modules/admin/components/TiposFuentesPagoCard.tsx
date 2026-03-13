'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Database, Loader2, RefreshCw } from 'lucide-react'

import { useTiposFuentesPago } from '../hooks'

export function TiposFuentesPagoCard() {
  const { loading, resultado, verificarFuentes, crearFuentesPredeterminadas } = useTiposFuentesPago()

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl shadow-blue-500/10 border border-blue-200 dark:border-blue-900/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Fuentes de Pago Predeterminadas</h2>
            <p className="text-blue-100 text-sm">Configuración inicial del sistema</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Acciones */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={verificarFuentes}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Verificar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={crearFuentesPredeterminadas}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Crear Fuentes Predeterminadas</span>
          </motion.button>
        </div>

        {/* Resultado */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              resultado.tipo === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : resultado.tipo === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {resultado.tipo === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : resultado.tipo === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    resultado.tipo === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : resultado.tipo === 'error'
                        ? 'text-red-900 dark:text-red-100'
                        : 'text-yellow-900 dark:text-yellow-100'
                  }`}
                >
                  {resultado.mensaje}
                </p>
                {resultado.detalle && (
                  <p
                    className={`text-sm mt-1 ${
                      resultado.tipo === 'success'
                        ? 'text-green-700 dark:text-green-300'
                        : resultado.tipo === 'error'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {resultado.detalle}
                  </p>
                )}
              </div>
            </div>

            {/* Lista de fuentes */}
            {resultado.fuentes && resultado.fuentes.length > 0 && (
              <div className="mt-4 space-y-2">
                {resultado.fuentes.map((fuente) => (
                  <div
                    key={fuente.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-xl">{fuente.es_subsidio ? '🎁' : '💰'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {fuente.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{fuente.descripcion}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      #{fuente.orden}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
