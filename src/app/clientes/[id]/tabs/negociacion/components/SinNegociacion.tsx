'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  Home,
  Info,
  ListChecks,
  Lock,
  ShieldOff,
  TrendingUp,
  Wallet,
} from 'lucide-react'

interface SinNegociacionProps {
  canAsignarVivienda?: boolean
}

export function SinNegociacion({
  canAsignarVivienda = false,
}: SinNegociacionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-white/90 via-indigo-50/90 to-violet-50/90 p-5 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-indigo-950/50'
    >
      {/* Icono con gradiente */}
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/30'
        >
          <Home className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      {/* Título y descripción */}
      <h3 className='bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-indigo-100'>
        Sin Vivienda Asignada
      </h3>
      <p className='mx-auto max-w-sm text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
        Cuando este cliente tenga una vivienda asignada, aquí podrás gestionar
        su plan de pagos, fuentes de financiación y seguimiento de abonos.
      </p>

      {/* Checklist de beneficios */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-3 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40'>
        <div className='mb-2.5 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <ListChecks className='h-4 w-4' />
          ¿Qué desbloquea una vivienda asignada?
        </div>
        <div className='space-y-2'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <DollarSign className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Plan de pagos y fuentes de financiación
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Cuota inicial, crédito hipotecario, Mi Casa Ya y más
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <TrendingUp className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Seguimiento de abonos en tiempo real
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Historial de pagos, saldo pendiente y porcentaje pagado
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30'>
              <Wallet className='h-3 w-3 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Control financiero completo
              </p>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Barra de avance, descuentos aplicados y gastos notariales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action — varía según permiso */}
      {canAsignarVivienda ? (
        <div className='rounded-xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 p-3 backdrop-blur-sm dark:border-indigo-800/50 dark:from-indigo-950/30 dark:via-violet-950/30 dark:to-purple-950/30'>
          <div className='flex items-start gap-3 text-left'>
            <Lock className='mt-1 h-6 w-6 flex-shrink-0 animate-pulse text-indigo-600 dark:text-indigo-400' />
            <div className='flex-1'>
              <h4 className='mb-1 text-sm font-bold text-indigo-900 dark:text-indigo-100'>
                ¿Cómo comenzar?
              </h4>
              <p className='text-xs leading-relaxed text-indigo-700 dark:text-indigo-300'>
                Usa el botón <strong>&ldquo;Asignar Vivienda&rdquo;</strong> en
                la parte superior de este perfil para vincular una vivienda
                disponible a este cliente e iniciar la negociación.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 p-3 backdrop-blur-sm dark:border-gray-700/50 dark:from-gray-900/30 dark:via-slate-900/30 dark:to-gray-900/30'>
          <div className='flex items-start gap-3 text-left'>
            <ShieldOff className='mt-1 h-6 w-6 flex-shrink-0 text-gray-400 dark:text-gray-500' />
            <div className='flex-1'>
              <h4 className='mb-1 text-sm font-bold text-gray-700 dark:text-gray-300'>
                Pendiente de asignación
              </h4>
              <p className='text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
                Este cliente aún no tiene una vivienda asignada. Cuando un
                usuario autorizado realice la asignación, aquí verás toda la
                información de la negociación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className='flex items-start gap-3 border-t border-gray-200 pt-3 text-left dark:border-gray-700'>
        <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400' />
        <p className='text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
          La negociación es el núcleo del proceso de venta. Registra todos los
          movimientos financieros del cliente desde la asignación hasta la
          escrituración.
        </p>
      </div>
    </motion.div>
  )
}
