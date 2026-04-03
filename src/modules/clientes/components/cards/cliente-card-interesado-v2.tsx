/**
 * ClienteCardInteresado V2 - Diseño Premium Rediseñado
 *
 * Estructura IDÉNTICA a ClienteCardActivo pero con contenido adaptado
 */

'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Calendar,
  Edit,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  Users,
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import { useClienteIntereses } from '../../hooks/useClienteIntereses'
import type { ClienteResumen } from '../../types'

interface ClienteCardInteresadoProps {
  cliente: ClienteResumen
  tieneCedula?: boolean
  tieneNegociacion?: boolean
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInteresado({
  cliente,
  onVer,
  onEditar,
  onEliminar,
}: ClienteCardInteresadoProps) {
  const { intereses, isLoading } = useClienteIntereses(cliente.id)
  const interesActual = intereses[0]

  // Calcular edad desde fecha_nacimiento
  const calcularEdad = (fechaNacimiento?: string): number | null => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const edad = calcularEdad(cliente.fecha_nacimiento)

  return (
    <motion.div
      className='group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onVer?.(cliente)}
    >
      {/* Glow effect */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      <div className='relative z-10 flex flex-col p-4'>
        {/* Contenido con flex-1 para que ocupe espacio disponible */}
        <div className='flex-1 space-y-3'>
          {/* === HEADER SECTION === */}
          <div className='space-y-2'>
            {/* Fila 1: Cliente + Actions */}
            <div className='flex items-center justify-between'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg'>
                  <User className='h-6 w-6 text-white' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='line-clamp-2 text-base font-bold leading-tight text-gray-900 dark:text-white'>
                    {formatNombreCompleto(cliente.nombre_completo)}
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    <span className='font-semibold text-cyan-600 dark:text-cyan-400'>
                      {cliente.tipo_documento}
                    </span>{' '}
                    {cliente.numero_documento}
                  </p>
                </div>
              </div>
              {/* Actions */}
              <div className='flex flex-shrink-0 gap-1'>
                {onEditar && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onEditar(cliente)
                    }}
                    className='rounded-lg p-1.5 text-gray-600 transition-all hover:bg-cyan-100 hover:text-cyan-600 dark:text-gray-400 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-400'
                    title='Editar'
                  >
                    <Edit className='h-4 w-4' />
                  </button>
                )}
                {onEliminar && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onEliminar(cliente)
                    }}
                    className='rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                    title='Eliminar'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
            {/* Fila 2: Badge */}
            <div className='flex justify-end'>
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-cyan-500/50'>
                <div className='h-1.5 w-1.5 rounded-full bg-white' />
                INTERESADO
              </span>
            </div>
          </div>

          {/* === INTERÉS SECTION (PRIMERO) === */}
          <div className='space-y-2.5'>
            {isLoading ? (
              <div className='animate-pulse rounded-lg bg-gray-100 px-3 py-4 dark:bg-gray-800'>
                <div className='h-16 rounded bg-gray-200 dark:bg-gray-700' />
              </div>
            ) : interesActual ? (
              <>
                {/* Proyecto destacado */}
                <div className='rounded-lg border border-indigo-200/50 bg-gradient-to-br from-indigo-50 to-purple-50 px-3 py-2.5 dark:border-indigo-800/50 dark:from-indigo-950/30 dark:to-purple-950/30'>
                  <div className='mb-2 flex items-center gap-2'>
                    <div className='rounded-lg bg-white p-2 shadow-sm dark:bg-gray-900/50'>
                      <Building2 className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                    </div>
                    <p className='text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300'>
                      Interesado en:
                    </p>
                  </div>
                  {/* Grid 2x2: Fila 1 (Proyecto|Ubicación) + Fila 2 (Manzana|Casa) */}
                  <div className='grid grid-cols-2 gap-2'>
                    {/* Proyecto */}
                    <div className='flex items-center gap-1.5'>
                      <Building2 className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-500' />
                      <div>
                        <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Proyecto
                        </p>
                        <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                          {interesActual.proyecto_nombre || 'No especifica'}
                        </p>
                      </div>
                    </div>
                    {/* Ubicación */}
                    <div className='flex items-center gap-1.5'>
                      <MapPin className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-500' />
                      <div>
                        <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Ubicación
                        </p>
                        <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                          {interesActual.proyecto_ubicacion || 'No especifica'}
                        </p>
                      </div>
                    </div>
                    {/* Manzana */}
                    <div className='flex items-center gap-1.5'>
                      <Home className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400' />
                      <div>
                        <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Manzana
                        </p>
                        <p className='text-sm font-bold text-gray-900 dark:text-white'>
                          {interesActual.manzana_nombre || 'No especifica'}
                        </p>
                      </div>
                    </div>
                    {/* Casa */}
                    <div className='flex items-center gap-1.5'>
                      <Home className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400' />
                      <div>
                        <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                          Casa
                        </p>
                        <p className='text-sm font-bold text-gray-900 dark:text-white'>
                          {interesActual.vivienda_numero
                            ? `#${interesActual.vivienda_numero}`
                            : 'No especifica'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='rounded-lg border border-dashed border-gray-300 bg-gray-100 px-3 py-4 dark:border-gray-700 dark:bg-gray-800/50'>
                <div className='flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400'>
                  <Home className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    Sin interés registrado
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* === CONTACTO SECTION (SEGUNDO) === */}
          <div className='rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 px-3 py-2.5 dark:border-cyan-700 dark:from-cyan-900/20 dark:to-blue-900/20'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-lg bg-white p-2 shadow-sm dark:bg-gray-900/50'>
                <User className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
              </div>
              <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300'>
                Información Personal
              </p>
            </div>
            {/* Grid 2x2: Fila 1 (Teléfono|Email) + Fila 2 (Estado Civil|Edad) */}
            <div className='grid grid-cols-2 gap-2'>
              <div className='flex items-center gap-1.5'>
                <Phone className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-500' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Teléfono
                  </p>
                  <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                    {cliente.telefono || 'No especifica'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <Mail className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-500' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Email
                  </p>
                  <p className='truncate text-xs font-bold text-gray-900 dark:text-white'>
                    {cliente.email || 'No especifica'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <Heart className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-500' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Estado Civil
                  </p>
                  <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                    {cliente.estado_civil || 'No especifica'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <Users className='h-3.5 w-3.5 text-cyan-600 dark:text-cyan-500' />
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Edad
                  </p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    {edad !== null ? `${edad} años` : 'No especifica'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === ACTION BUTTON === */}
        {interesActual && (
          <motion.button
            onClick={() => logger.info('Ver interés:', cliente.id)}
            className='w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className='flex items-center justify-center gap-2'>
              <ArrowRight className='h-4 w-4' />
              <span>Ver Interés</span>
            </div>
          </motion.button>
        )}

        {/* === FOOTER === */}
        <div className='flex items-center gap-1.5 border-t border-gray-200 pt-2 dark:border-gray-700'>
          <Calendar className='h-3.5 w-3.5 text-gray-400 dark:text-gray-600' />
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            Registrado {formatDateShort(cliente.fecha_creacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
