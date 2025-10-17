/**
 * Componente DetalleCliente - Modal de solo lectura para ver información completa
 */

'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
    BarChart3,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Edit,
    Eye,
    FileText,
    Heart,
    Home,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Trash2,
    TrendingUp,
    User,
    Users,
    X,
    XCircle,
} from 'lucide-react'
import type { Cliente } from '../types'
import { ESTADOS_INTERES, ORIGENES_CLIENTE, TIPOS_DOCUMENTO } from '../types'

interface DetalleClienteProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
  onEditar?: () => void
  onEliminar?: () => void
}

// Componente para mostrar un campo de información
function InfoField({
  icon: Icon,
  label,
  value,
  className = '',
  showEmpty = false,
}: {
  icon: any
  label: string
  value: string | undefined | null
  className?: string
  showEmpty?: boolean
}) {
  // Si no tiene valor y no queremos mostrar vacíos, no renderizar
  if (!value && !showEmpty) return null

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30'>
        <Icon className='h-5 w-5 text-purple-600 dark:text-purple-400' />
      </div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          {label}
        </p>
        <p className={`mt-1 text-base font-semibold ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic'}`}>
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  )
}

// Badge de estado
function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    Interesado: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Clock,
    },
    Activo: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle2,
    },
    Inactivo: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-300',
      icon: XCircle,
    },
  }

  const { bg, text, icon: Icon } = config[estado as keyof typeof config] || config.Interesado

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${bg} ${text}`}
    >
      <Icon className='h-4 w-4' />
      {estado}
    </span>
  )
}

export function DetalleCliente({
  isOpen,
  onClose,
  cliente,
  onEditar,
  onEliminar,
}: DetalleClienteProps) {
  if (!cliente) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900'
          >
            {/* Header con gradiente */}
            <div className='relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-8 py-6'>
              <div className='absolute inset-0 opacity-20'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]' />
              </div>

              <div className='relative flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30'
                  >
                    <User className='h-8 w-8 text-white' />
                  </motion.div>
                  <div>
                    <h2 className='text-2xl font-bold text-white'>
                      {cliente.nombre_completo}
                    </h2>
                    <p className='text-sm text-purple-100'>
                      {TIPOS_DOCUMENTO[cliente.tipo_documento]} - {cliente.numero_documento}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <EstadoBadge estado={cliente.estado} />
                  <button
                    onClick={onClose}
                    className='rounded-xl p-2.5 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:rotate-90'
                    type='button'
                  >
                    <X className='h-6 w-6 transition-transform' />
                  </button>
                </div>
              </div>
            </div>

            {/* Content con scroll */}
            <div className='max-h-[calc(90vh-200px)] overflow-y-auto p-8'>
              <div className='space-y-8'>
                {/* Información Personal */}
                <div>
                  <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    <User className='h-5 w-5 text-purple-500' />
                    Información Personal
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InfoField icon={User} label='Nombres' value={cliente.nombres} showEmpty />
                    <InfoField icon={User} label='Apellidos' value={cliente.apellidos} showEmpty />
                    <InfoField
                      icon={FileText}
                      label='Tipo de Documento'
                      value={TIPOS_DOCUMENTO[cliente.tipo_documento]}
                      showEmpty
                    />
                    <InfoField
                      icon={FileText}
                      label='Número de Documento'
                      value={cliente.numero_documento}
                      showEmpty
                    />
                    <InfoField
                      icon={Calendar}
                      label='Fecha de Nacimiento'
                      value={
                        cliente.fecha_nacimiento
                          ? new Date(cliente.fecha_nacimiento).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : undefined
                      }
                      showEmpty
                    />
                  </div>

                  {/* Documento de Identidad (si existe URL) */}
                  {cliente.documento_identidad_url && (
                    <div className='mt-4'>
                      <a
                        href={cliente.documento_identidad_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:border-blue-700 dark:hover:bg-blue-900/40'
                      >
                        <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                        <div className='flex-1'>
                          <p className='font-semibold text-blue-900 dark:text-blue-100'>
                            Documento de Identidad
                          </p>
                          <p className='text-xs text-blue-600 dark:text-blue-400'>
                            Haz clic para ver o descargar
                          </p>
                        </div>
                        <Eye className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      </a>
                    </div>
                  )}
                </div>

                {/* Información de Contacto */}
                <div>
                  <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    <Phone className='h-5 w-5 text-purple-500' />
                    Información de Contacto
                  </h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InfoField icon={Phone} label='Teléfono Principal' value={cliente.telefono} showEmpty />
                    <InfoField
                      icon={Phone}
                      label='Teléfono Alternativo'
                      value={cliente.telefono_alternativo}
                      showEmpty
                    />
                    <InfoField icon={Mail} label='Correo Electrónico' value={cliente.email} showEmpty />
                    <InfoField icon={MapPin} label='Dirección' value={cliente.direccion} showEmpty />
                    <InfoField icon={Building2} label='Ciudad' value={cliente.ciudad} showEmpty />
                    <InfoField icon={Home} label='Departamento' value={cliente.departamento} showEmpty />
                  </div>
                </div>

                {/* SECCIÓN: INTERESES DEL CLIENTE */}
                {cliente.intereses && cliente.intereses.length > 0 && (
                  <div className='rounded-xl border-2 border-purple-200 bg-purple-50 p-6 dark:border-purple-800 dark:bg-purple-950/30'>
                    <div className='mb-4 flex items-center gap-2 border-b-2 border-purple-300 pb-3 dark:border-purple-700'>
                      <Heart className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                      <h3 className='text-lg font-semibold text-purple-900 dark:text-purple-100'>
                        Intereses Registrados
                      </h3>
                      <span className='ml-auto rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-bold text-white'>
                        {cliente.intereses.length}
                      </span>
                    </div>

                    <div className='space-y-3'>
                      {cliente.intereses.map((interes) => (
                        <div
                          key={interes.id}
                          className='rounded-xl border-2 border-purple-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-purple-700 dark:bg-purple-900/20'
                        >
                          {/* Header del interés */}
                          <div className='mb-3 flex items-start justify-between'>
                            <div className='flex items-center gap-2'>
                              <Building2 className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                              <div>
                                <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                                  {interes.proyecto_nombre}
                                </h4>
                                {interes.proyecto_ubicacion && (
                                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {interes.proyecto_ubicacion}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                interes.estado === 'Activo'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : interes.estado === 'Convertido'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {ESTADOS_INTERES[interes.estado]}
                            </span>
                          </div>

                          {/* Vivienda (si existe) */}
                          {interes.vivienda_numero && (
                            <div className='mb-2 flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-2 dark:bg-purple-900/40'>
                              <Home className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                              <span className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                                Manzana {interes.manzana_nombre} - Casa{' '}
                                {interes.vivienda_numero}
                              </span>
                            </div>
                          )}

                          {/* Notas (si existen) */}
                          {interes.notas && (
                            <div className='mb-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'>
                              <MessageSquare className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500' />
                              <p className='flex-1 italic'>{interes.notas}</p>
                            </div>
                          )}

                          {/* Fecha */}
                          <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                            <Clock className='h-3.5 w-3.5' />
                            <span>
                              Registrado{' '}
                              {formatDistanceToNow(new Date(interes.fecha_interes), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECCIÓN: ESTADÍSTICAS COMERCIALES */}
                {cliente.estadisticas && (
                  <div className='rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30'>
                    <div className='mb-4 flex items-center gap-2 border-b-2 border-blue-300 pb-3 dark:border-blue-700'>
                      <BarChart3 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                      <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-100'>
                        Estadísticas Comerciales
                      </h3>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                      {/* Total Negociaciones */}
                      <div className='rounded-xl border-2 border-blue-200 bg-white p-4 text-center dark:border-blue-700 dark:bg-blue-900/20'>
                        <TrendingUp className='mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400' />
                        <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                          {cliente.estadisticas.total_negociaciones}
                        </p>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Total Negociaciones
                        </p>
                      </div>

                      {/* Activas */}
                      <div className='rounded-xl border-2 border-green-200 bg-white p-4 text-center dark:border-green-700 dark:bg-green-900/20'>
                        <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400' />
                        <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                          {cliente.estadisticas.negociaciones_activas}
                        </p>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Activas
                        </p>
                      </div>

                      {/* Completadas */}
                      <div className='rounded-xl border-2 border-purple-200 bg-white p-4 text-center dark:border-purple-700 dark:bg-purple-900/20'>
                        <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-purple-600 dark:text-purple-400' />
                        <p className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                          {cliente.estadisticas.negociaciones_completadas}
                        </p>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                          Completadas
                        </p>
                      </div>
                    </div>

                    {/* Última negociación */}
                    {cliente.estadisticas.ultima_negociacion && (
                      <div className='mt-4 rounded-lg bg-blue-100 px-4 py-3 text-center dark:bg-blue-900/40'>
                        <div className='flex items-center justify-center gap-2 text-sm text-blue-900 dark:text-blue-100'>
                          <Clock className='h-4 w-4' />
                          <span className='font-medium'>Última negociación:</span>
                          <span>
                            {formatDistanceToNow(
                              new Date(cliente.estadisticas.ultima_negociacion),
                              {
                                addSuffix: true,
                                locale: es,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Información Adicional */}
                <div>
                  <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                    <MessageSquare className='h-5 w-5 text-purple-500' />
                    Información Adicional
                  </h3>
                  <div className='space-y-4'>
                    <InfoField
                      icon={Users}
                      label='¿Cómo nos conoció?'
                      value={cliente.origen ? ORIGENES_CLIENTE[cliente.origen] : undefined}
                      showEmpty
                    />
                    <InfoField
                      icon={Users}
                      label='Referido por'
                      value={cliente.referido_por}
                      showEmpty
                    />
                    {/* Notas (siempre mostrar, aunque sea vacío) */}
                    <div className='rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50'>
                      <p className='mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400'>
                        <MessageSquare className='h-4 w-4' />
                        Notas y Observaciones
                      </p>
                      <p className={`text-base ${cliente.notas ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600 italic'}`}>
                        {cliente.notas || 'Sin notas adicionales'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadatos */}
                <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50'>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-500 dark:text-gray-400'>Creado</p>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {new Date(cliente.fecha_creacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500 dark:text-gray-400'>Última actualización</p>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {new Date(cliente.fecha_actualizacion).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones de acción */}
            <div className='border-t border-gray-200 bg-gray-50 px-8 py-5 dark:border-gray-800 dark:bg-gray-900/50'>
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-xl border-2 border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Cerrar
                </button>

                <div className='flex gap-3'>
                  {onEliminar && (
                    <button
                      type='button'
                      onClick={onEliminar}
                      className='flex items-center gap-2 rounded-xl border-2 border-red-300 px-5 py-2.5 font-medium text-red-700 transition-all hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                    >
                      <Trash2 className='h-5 w-5' />
                      Eliminar
                    </button>
                  )}
                  {onEditar && (
                    <button
                      type='button'
                      onClick={onEditar}
                      className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5'
                    >
                      <Edit className='h-5 w-5' />
                      Editar Cliente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
