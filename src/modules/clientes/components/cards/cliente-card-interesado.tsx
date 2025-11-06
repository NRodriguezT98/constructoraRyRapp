/**
 * ClienteCardInteresado - Card para clientes en estado "Interesado"
 * Muestra información básica de contacto, origen, fecha de registro e intereses activos
 */

'use client'

import { CanDelete, CanEdit } from '@/modules/usuarios/components'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Building2, Clock, Edit, Eye, Home, Mail, MapPin, Phone, Tag, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { interesesService } from '../../services/intereses.service'
import { clientesStyles, fadeInUp } from '../../styles'
import type { ClienteInteres, ClienteResumen } from '../../types'

interface ClienteCardInteresadoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInteresado({
  cliente,
  onVer,
  onEditar,
  onEliminar
}: ClienteCardInteresadoProps) {
  const [interesesActivos, setInteresesActivos] = useState<ClienteInteres[]>([])
  const [cargandoIntereses, setCargandoIntereses] = useState(false)

  // Cargar intereses activos del cliente
  useEffect(() => {
    const cargarIntereses = async () => {
      setCargandoIntereses(true)
      try {
        const intereses = await interesesService.obtenerInteresesCliente(cliente.id, true)
        setInteresesActivos(intereses)
      } catch (error) {
        console.error('Error cargando intereses:', error)
      } finally {
        setCargandoIntereses(false)
      }
    }

    cargarIntereses()
  }, [cliente.id])

  // Función para obtener la clase del badge según el estado
  const getBadgeClass = () => {
    return clientesStyles.badgeInteresado
  }

  // Calcular tiempo relativo
  const tiempoRelativo = cliente.fecha_creacion
    ? formatDistanceToNow(new Date(cliente.fecha_creacion), {
        addSuffix: true,
        locale: es
      })
    : 'Recientemente'

  return (
    <motion.div
      className='overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-lg transition-all hover:shadow-2xl dark:border-purple-800 dark:bg-gray-800'
      variants={fadeInUp}
      layout
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Header con gradiente - BOTONES EN ESQUINA */}
      <div className='relative h-24 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 p-6'>
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
          <CanEdit modulo="clientes">
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
          </CanEdit>
          <CanDelete modulo="clientes">
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
          </CanDelete>
        </div>

        {/* Icono flotante del cliente */}
        <div className='absolute -bottom-6 left-6'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-white shadow-xl dark:border-gray-800 dark:bg-gray-800'>
            <User className='h-6 w-6 text-purple-600' />
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
            <span className={`flex-shrink-0 ${clientesStyles.badge} ${getBadgeClass()}`}>
              {cliente.estado}
            </span>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {cliente.tipo_documento} {cliente.numero_documento}
          </p>
        </div>

        {/* Información de contacto */}
        <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
          {cliente.telefono && (
            <div className='flex items-center gap-2'>
              <Phone className='h-4 w-4 flex-shrink-0' />
              <span>{cliente.telefono}</span>
            </div>
          )}
          {cliente.email && (
            <div className='flex items-center gap-2'>
              <Mail className='h-4 w-4 flex-shrink-0' />
              <span className='min-w-0 truncate' title={cliente.email}>
                {cliente.email}
              </span>
            </div>
          )}
          {cliente.ciudad && (
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 flex-shrink-0' />
              <span
                className='min-w-0 truncate'
                title={`${cliente.ciudad}${cliente.departamento ? `, ${cliente.departamento}` : ''}`}
              >
                {cliente.ciudad}
                {cliente.departamento && `, ${cliente.departamento}`}
              </span>
            </div>
          )}
        </div>

        {/* Intereses Activos */}
        {!cargandoIntereses && interesesActivos.length > 0 && (
          <div className='mt-4 space-y-2 border-t border-gray-100 pt-4 dark:border-gray-700'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Interesado en:
            </p>
            {interesesActivos.map((interes) => (
              <motion.div
                key={interes.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='group rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-3 transition-all hover:shadow-md dark:from-purple-900/20 dark:to-violet-900/20'
              >
                {/* Proyecto */}
                <div className='flex items-start gap-2'>
                  <Building2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400' />
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium text-purple-900 dark:text-purple-100'>
                      {interes.proyecto_nombre}
                    </p>
                    {interes.proyecto_estado && (
                      <p className='text-xs text-purple-600 dark:text-purple-400'>
                        {interes.proyecto_estado}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vivienda específica (si existe) */}
                {interes.vivienda_numero && (
                  <div className='mt-2 flex items-center gap-2 rounded-md bg-white/50 px-2 py-1 dark:bg-gray-800/50'>
                    <Home className='h-3.5 w-3.5 text-purple-500' />
                    <span className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                      Manzana {interes.manzana_nombre} - Casa {interes.vivienda_numero}
                    </span>
                    {interes.vivienda_valor && (
                      <span className='ml-auto text-xs text-gray-600 dark:text-gray-400'>
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(interes.vivienda_valor)}
                      </span>
                    )}
                  </div>
                )}

                {/* Notas del interés (si existen) */}
                {interes.notas && (
                  <p className='mt-2 line-clamp-2 text-xs italic text-gray-600 dark:text-gray-400'>
                    "{interes.notas}"
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Origen y Fecha */}
        <div className='mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400'>
          {/* Origen */}
          {cliente.origen && (
            <div className='flex items-center gap-1.5'>
              <Tag className='h-3.5 w-3.5' />
              <span>{cliente.origen}</span>
            </div>
          )}

          {/* Fecha relativa */}
          <div className='flex items-center gap-1.5'>
            <Clock className='h-3.5 w-3.5' />
            <span>{tiempoRelativo}</span>
          </div>
        </div>

        {/* Estadísticas */}
        {cliente.estadisticas && (
          <div className='mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700'>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>Total</p>
              <p className='mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {cliente.estadisticas.total_negociaciones}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>Activas</p>
              <p className='mt-1 text-2xl font-bold text-green-600 dark:text-green-400'>
                {cliente.estadisticas.negociaciones_activas}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>Completas</p>
              <p className='mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {cliente.estadisticas.negociaciones_completadas}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
