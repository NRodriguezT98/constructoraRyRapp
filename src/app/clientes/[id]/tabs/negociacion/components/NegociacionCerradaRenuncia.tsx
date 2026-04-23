'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  ExternalLink,
  FileX,
  Home,
  Info,
  Shield,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'

interface NegociacionCerradaRenunciaProps {
  fechaRenuncia?: string | null
}

export function NegociacionCerradaRenuncia({
  fechaRenuncia,
}: NegociacionCerradaRenunciaProps) {
  const router = useRouter()
  const { esAdmin, puede } = usePermisosQuery()
  const canVerRenuncias = esAdmin || puede('renuncias', 'ver')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-4 rounded-xl border border-gray-200/50 bg-gradient-to-br from-white/90 via-red-50/90 to-rose-50/90 p-5 text-center shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-red-950/50'
    >
      {/* Icono con gradiente */}
      <div className='flex justify-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className='flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 shadow-2xl shadow-red-500/30'
        >
          <FileX className='h-8 w-8 text-white' />
        </motion.div>
      </div>

      {/* Título y descripción */}
      <h3 className='bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-gray-100 dark:to-red-100'>
        Negociación Cerrada por Renuncia
      </h3>
      <p className='mx-auto max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400'>
        Este cliente renunció a su negociación. La vivienda fue liberada y las
        fuentes de pago desactivadas. Los detalles completos están disponibles
        en el módulo de Renuncias.
      </p>

      {/* Fecha de renuncia */}
      {fechaRenuncia ? (
        <div className='inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1.5 dark:border-red-800/50 dark:bg-red-900/30'>
          <Clock className='h-3.5 w-3.5 text-red-500 dark:text-red-400' />
          <span className='text-xs font-semibold text-red-700 dark:text-red-300'>
            Renunció el {formatDateCompact(fechaRenuncia)}
          </span>
        </div>
      ) : null}

      {/* Info card */}
      <div className='rounded-xl border border-gray-200/80 bg-white/60 p-3 text-left shadow-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/40'>
        <div className='mb-2.5 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300'>
          <Shield className='h-4 w-4' />
          Acciones realizadas automáticamente
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <FileX className='h-3 w-3 text-red-600 dark:text-red-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Negociación cerrada permanentemente
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
              <Home className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Vivienda liberada y disponible
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50'>
              <Wallet className='h-3 w-3 text-gray-600 dark:text-gray-400' />
            </div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Fuentes de pago inactivadas
            </p>
          </div>
        </div>
      </div>

      {/* CTA — Ir a módulo de Renuncias */}
      <div className='rounded-xl border border-red-200/50 bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 p-3 backdrop-blur-sm dark:border-red-800/50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30'>
        <div className='flex items-start gap-4 text-left'>
          <Info className='mt-1 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400' />
          <div className='flex-1'>
            <h4 className='mb-1 text-sm font-bold text-red-900 dark:text-red-100'>
              Consulta los detalles completos
            </h4>
            <p className='text-xs leading-relaxed text-red-700 dark:text-red-300'>
              En el módulo de Renuncias encontrarás el motivo, snapshots de
              datos, estado de devolución y toda la información histórica de
              esta renuncia.
            </p>
          </div>
        </div>

        {canVerRenuncias ? (
          <button
            onClick={() => router.push('/renuncias')}
            className='mt-3 inline-flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-red-600 hover:via-rose-700 hover:to-pink-700 hover:shadow-2xl hover:shadow-red-500/40 active:scale-[0.98]'
          >
            <ExternalLink className='h-4 w-4' />
            Ver en módulo de Renuncias
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
