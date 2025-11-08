/**
 * ClienteCardInactivo - Card para clientes inactivos
 * Diseño minimalista destacando la falta de actividad reciente
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, Edit, Eye, Trash2, UserX } from 'lucide-react'

import { clientesStyles, fadeInUp } from '../../styles'
import type { ClienteResumen } from '../../types'

interface ClienteCardInactivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInactivo({
  cliente,
  onVer,
  onEditar,
  onEliminar
}: ClienteCardInactivoProps) {
  // Calcular tiempo relativo desde última actualización
  const ultimaActualizacion = cliente.fecha_actualizacion
    ? formatDistanceToNow(new Date(cliente.fecha_actualizacion), {
        addSuffix: true,
        locale: es
      })
    : 'Hace mucho tiempo'

  return (
    <motion.div
      className='overflow-hidden rounded-2xl border border-gray-300 bg-white opacity-75 shadow-lg transition-all hover:opacity-100 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800'
      variants={fadeInUp}
      layout
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Header con gradiente GRIS (Inactivo) */}
      <div className='relative h-24 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-6'>
        <div className='bg-grid-white/[0.05] absolute inset-0 bg-[length:20px_20px]' />

        {/* Botones de acción en esquina superior derecha */}
        <div className='relative flex items-start justify-end gap-1'>
          {onVer && (
            <button
              type='button'
              onClick={() => onVer(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Ver detalles'
            >
              <Eye className='h-4 w-4' />
            </button>
          )}
          {onEditar && (
            <button
              type='button'
              onClick={() => onEditar(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Editar cliente'
            >
              <Edit className='h-4 w-4' />
            </button>
          )}
          {onEliminar && (
            <button
              type='button'
              onClick={() => onEliminar(cliente)}
              className='rounded-lg p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20'
              title='Eliminar cliente'
            >
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Icono flotante de usuario inactivo */}
        <div className='absolute -bottom-6 left-6'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white shadow-xl dark:border-gray-800 dark:bg-gray-800'>
            <UserX className='h-6 w-6 text-gray-500' />
          </div>
        </div>
      </div>

      {/* Contenido - PT-10 para espacio del icono */}
      <div className='px-6 pb-5 pt-10'>
        {/* Título y badge */}
        <div className='mb-4'>
          <div className='mb-2 flex items-start justify-between gap-3'>
            <h3
              className='line-clamp-1 text-xl font-bold text-gray-900 dark:text-white'
              title={cliente.nombre_completo}
            >
              {cliente.nombre_completo}
            </h3>
            <span className={`flex-shrink-0 ${clientesStyles.badge} ${clientesStyles.badgeInactivo}`}>
              {cliente.estado}
            </span>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {cliente.tipo_documento} {cliente.numero_documento}
          </p>
        </div>

        {/* Información básica de contacto */}
        <div className='mb-4 space-y-2 text-sm text-gray-500 dark:text-gray-500'>
          {cliente.email && (
            <div className='truncate' title={cliente.email}>
              📧 {cliente.email}
            </div>
          )}
          {cliente.telefono && (
            <div>
              📞 {cliente.telefono}
            </div>
          )}
        </div>

        {/* Alerta de inactividad */}
        <div className='mb-4 flex items-start gap-3 rounded-lg border-2 border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-900/20'>
          <AlertCircle className='h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400' />
          <div className='flex-1'>
            <p className='text-sm font-semibold text-orange-800 dark:text-orange-300'>
              Sin actividad reciente
            </p>
            <p className='mt-1 text-xs text-orange-700 dark:text-orange-400'>
              Considera contactar para reactivar el interés
            </p>
          </div>
        </div>

        {/* Última actualización */}
        <div className='flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400'>
          <div className='flex items-center gap-1.5'>
            <Clock className='h-3.5 w-3.5' />
            <span>Última actualización</span>
          </div>
          <span className='font-medium'>{ultimaActualizacion}</span>
        </div>

        {/* Estadísticas (si existen) */}
        {cliente.estadisticas && cliente.estadisticas.total_negociaciones > 0 && (
          <div className='mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700'>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-500 dark:text-gray-500'>Total</p>
              <p className='mt-1 text-xl font-bold text-gray-400 dark:text-gray-500'>
                {cliente.estadisticas.total_negociaciones}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-500 dark:text-gray-500'>Activas</p>
              <p className='mt-1 text-xl font-bold text-gray-400 dark:text-gray-500'>
                {cliente.estadisticas.negociaciones_activas}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-500 dark:text-gray-500'>Cerradas</p>
              <p className='mt-1 text-xl font-bold text-gray-400 dark:text-gray-500'>
                {cliente.estadisticas.negociaciones_completadas}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
