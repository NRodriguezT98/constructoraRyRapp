'use client'

import { motion } from 'framer-motion'
import { Cake, FileText, Heart, User } from 'lucide-react'

import * as styles from '@/app/clientes/[id]/cliente-detalle.styles'
import { calculateAge, formatDateCompact } from '@/lib/utils/date.utils'
import {
  formatearNumeroDocumento,
  SIGLAS_DOCUMENTO,
} from '@/lib/utils/documento.utils'
import { formatNombreApellido } from '@/lib/utils/string.utils'
import type { Cliente } from '@/modules/clientes/types'
import { ESTADOS_CIVILES } from '@/modules/clientes/types'

interface InfoPersonalCardProps {
  cliente: Cliente
}

const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export function InfoPersonalCard({ cliente }: InfoPersonalCardProps) {
  const nombreCompleto = formatNombreApellido(
    cliente.nombres,
    cliente.apellidos
  )
  const edad = cliente.fecha_nacimiento
    ? calculateAge(cliente.fecha_nacimiento)
    : null

  return (
    <motion.div
      {...fadeInLeft}
      className='group relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800/90'
    >
      {/* Accent bar left */}
      <div className='absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-cyan-500 to-blue-600' />

      {/* Header */}
      <div className='flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-2.5 dark:border-gray-700/60 dark:from-cyan-950/30 dark:to-blue-950/30'>
        <div
          className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.cliente} shadow-sm shadow-cyan-500/30`}
        >
          <User className={styles.infoCardClasses.icon} />
        </div>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
          Información Personal
        </h3>
      </div>

      {/* Nombre completo */}
      <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40'>
          <User className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-gray-400 dark:text-gray-500'>
            Nombre Completo
          </p>
          <p className='text-sm font-bold text-gray-900 dark:text-white'>
            {nombreCompleto}
          </p>
        </div>
      </div>

      {/* Documento */}
      <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/40'>
          <FileText className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-gray-400 dark:text-gray-500'>
            {SIGLAS_DOCUMENTO[cliente.tipo_documento] ?? cliente.tipo_documento}
          </p>
          <p className='font-mono text-sm font-semibold tracking-wider text-gray-900 dark:text-white'>
            {formatearNumeroDocumento(cliente.numero_documento)}
          </p>
        </div>
      </div>

      {/* Estado Civil */}
      <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40'>
          <Heart className='h-3.5 w-3.5 text-rose-500 dark:text-rose-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-gray-400 dark:text-gray-500'>
            Estado Civil
          </p>
          {cliente.estado_civil ? (
            <span className='inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'>
              {ESTADOS_CIVILES[cliente.estado_civil]}
            </span>
          ) : (
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              No indica
            </p>
          )}
        </div>
      </div>

      {/* Fecha de Nacimiento + Edad */}
      <div className='flex items-center gap-3 px-4 py-2.5'>
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40'>
          <Cake className='h-3.5 w-3.5 text-amber-500 dark:text-amber-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs text-gray-400 dark:text-gray-500'>
            Fecha de Nacimiento
          </p>
          {cliente.fecha_nacimiento ? (
            <div className='flex items-center gap-2'>
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                {formatDateCompact(cliente.fecha_nacimiento)}
              </p>
              {edad !== null && (
                <span className='inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                  {edad} años
                </span>
              )}
            </div>
          ) : (
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              No indica
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
