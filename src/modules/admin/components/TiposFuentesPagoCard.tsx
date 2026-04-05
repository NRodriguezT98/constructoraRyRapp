'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import { useTiposFuentesPago } from '../hooks'

export function TiposFuentesPagoCard() {
  const { loading, resultado, verificarFuentes, crearFuentesPredeterminadas } =
    useTiposFuentesPago()

  return (
    <div className='overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl shadow-blue-500/10 dark:border-blue-900/50 dark:bg-gray-800'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 p-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
            <Database className='h-6 w-6 text-white' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Fuentes de Pago Predeterminadas
            </h2>
            <p className='text-sm text-blue-100'>
              Configuración inicial del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='space-y-4 p-6'>
        {/* Acciones */}
        <div className='flex gap-3'>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={verificarFuentes}
            disabled={loading}
            className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
            <span>Verificar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={crearFuentesPredeterminadas}
            disabled={loading}
            className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <CheckCircle2 className='h-4 w-4' />
            )}
            <span>Crear Fuentes Predeterminadas</span>
          </motion.button>
        </div>

        {/* Resultado */}
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              resultado.tipo === 'success'
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : resultado.tipo === 'error'
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
            }`}
          >
            <div className='flex items-start gap-3'>
              {resultado.tipo === 'success' ? (
                <CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400' />
              ) : resultado.tipo === 'error' ? (
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
              ) : (
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400' />
              )}
              <div className='flex-1'>
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
                    className={`mt-1 text-sm ${
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
              <div className='mt-4 space-y-2'>
                {resultado.fuentes.map(fuente => (
                  <div
                    key={fuente.id}
                    className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800'
                  >
                    <span className='text-xl'>
                      {fuente.es_subsidio ? '🎁' : '💰'}
                    </span>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {fuente.nombre}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {fuente.descripcion}
                      </p>
                    </div>
                    <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
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
