'use client'

import { motion } from 'framer-motion'
import { Mail, MapPin, Phone } from 'lucide-react'

import * as styles from '@/app/clientes/[id]/cliente-detalle.styles'
import type { Cliente } from '@/modules/clientes/types'

const EMPTY = 'Sin registrar'

interface ContactoUbicacionCardProps {
  cliente: Cliente
}

const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export function ContactoUbicacionCard({ cliente }: ContactoUbicacionCardProps) {
  const hasLocation =
    cliente.ciudad || cliente.departamento || cliente.direccion

  return (
    <motion.div
      {...fadeInLeft}
      transition={{ delay: 0.1 }}
      className='group relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800/90'
    >
      {/* Accent bar left */}
      <div className='absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-600' />

      {/* Header */}
      <div className='flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 dark:border-gray-700/60 dark:from-blue-950/30 dark:to-indigo-950/30'>
        <div
          className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.contacto} shadow-sm shadow-blue-500/30`}
        >
          <Phone className={styles.infoCardClasses.icon} />
        </div>
        <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
          Contacto y Ubicación
        </h3>
      </div>

      {/* Teléfono Principal */}
      {cliente.telefono ? (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40'>
            <Phone className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Teléfono Principal
            </p>
            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
              {cliente.telefono}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/40'>
            <Phone className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
          </div>
          <div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Teléfono Principal
            </p>
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              {EMPTY}
            </p>
          </div>
        </div>
      )}

      {/* Teléfono Alternativo */}
      {cliente.telefono_alternativo ? (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40'>
            <Phone className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Teléfono Alternativo
            </p>
            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
              {cliente.telefono_alternativo}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/40'>
            <Phone className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
          </div>
          <div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Teléfono Alternativo
            </p>
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              {EMPTY}
            </p>
          </div>
        </div>
      )}

      {/* Email */}
      {cliente.email ? (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40'>
            <Mail className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Correo Electrónico
            </p>
            <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
              {cliente.email}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700/60'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/40'>
            <Mail className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
          </div>
          <div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Correo Electrónico
            </p>
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              {EMPTY}
            </p>
          </div>
        </div>
      )}

      {/* Sección Ubicación */}
      {hasLocation ? (
        <div className='px-4 py-2.5'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40'>
              <MapPin className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='min-w-0 flex-1 space-y-0.5'>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                Ubicación
              </p>
              {cliente.direccion && (
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {cliente.direccion}
                </p>
              )}
              {(cliente.ciudad || cliente.departamento) && (
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {[cliente.ciudad, cliente.departamento]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-3 px-4 py-2.5'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700/40'>
            <MapPin className='h-3.5 w-3.5 text-gray-400 dark:text-gray-500' />
          </div>
          <div>
            <p className='text-xs text-gray-400 dark:text-gray-500'>
              Ubicación
            </p>
            <p className='text-xs italic text-gray-400 dark:text-gray-500'>
              {EMPTY}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
