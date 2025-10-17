'use client'

import type { Cliente } from '@/modules/clientes/types'
import { ESTADOS_INTERES } from '@/modules/clientes/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Building2,
    CheckCircle2,
    Clock,
    Heart,
    Home,
    MessageSquare,
    Plus,
    TrendingUp,
} from 'lucide-react'
import * as styles from '../cliente-detalle.styles'

interface InteresesTabProps {
  cliente: Cliente
  onRegistrarInteres?: () => void
}

export function InteresesTab({ cliente, onRegistrarInteres }: InteresesTabProps) {
  const intereses = cliente.intereses || []
  const estadisticas = cliente.estadisticas

  if (intereses.length === 0) {
    return (
      <div className={styles.emptyStateClasses.container}>
        <Heart className={styles.emptyStateClasses.icon} />
        <h3 className={styles.emptyStateClasses.title}>Sin intereses registrados</h3>
        <p className={styles.emptyStateClasses.description}>
          Este cliente aún no ha registrado interés en ningún proyecto o vivienda.
        </p>
        <button
          onClick={onRegistrarInteres}
          className={styles.emptyStateClasses.button}
        >
          <Plus className='h-4 w-4' />
          Registrar Nuevo Interés
        </button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Estadísticas Comerciales */}
      {estadisticas && (
        <div className={styles.infoCardClasses.card}>
          <div className={styles.infoCardClasses.header}>
            <div
              className={styles.infoCardClasses.iconContainer}
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #dc2626 100%)' }}
            >
              <TrendingUp className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Estadísticas Comerciales</h3>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Total Negociaciones */}
            <div className='rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-700 dark:bg-blue-900/20'>
              <TrendingUp className='mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400' />
              <p className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                {estadisticas.total_negociaciones}
              </p>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Negociaciones
              </p>
            </div>

            {/* Activas */}
            <div className='rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center dark:border-green-700 dark:bg-green-900/20'>
              <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400' />
              <p className='text-3xl font-bold text-green-600 dark:text-green-400'>
                {estadisticas.negociaciones_activas}
              </p>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Activas</p>
            </div>

            {/* Completadas */}
            <div className='rounded-xl border-2 border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-700 dark:bg-purple-900/20'>
              <CheckCircle2 className='mx-auto mb-2 h-8 w-8 text-purple-600 dark:text-purple-400' />
              <p className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                {estadisticas.negociaciones_completadas}
              </p>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Completadas</p>
            </div>
          </div>

          {/* Última negociación */}
          {estadisticas.ultima_negociacion && (
            <div className='mt-4 rounded-lg bg-blue-100 px-4 py-3 text-center dark:bg-blue-900/40'>
              <div className='flex items-center justify-center gap-2 text-sm text-blue-900 dark:text-blue-100'>
                <Clock className='h-4 w-4' />
                <span className='font-medium'>Última negociación:</span>
                <span>
                  {formatDistanceToNow(new Date(estadisticas.ultima_negociacion), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botón para registrar nuevo interés */}
      <div className='flex justify-end'>
        <button
          onClick={onRegistrarInteres}
          className='inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors'
        >
          <Plus className='h-4 w-4' />
          Registrar Nuevo Interés
        </button>
      </div>

      {/* Lista de Intereses */}
      <div className='space-y-4'>
        {intereses.map((interes) => (
          <div
            key={interes.id}
            className='rounded-xl border-2 border-purple-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-purple-700 dark:bg-purple-900/10'
          >
            {/* Header del interés */}
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30'>
                  <Building2 className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900 dark:text-gray-100'>
                    {interes.proyecto_nombre}
                  </h4>
                  {interes.proyecto_ubicacion && (
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {interes.proyecto_ubicacion}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
              <div className='mb-3 flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-900/20'>
                <Home className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                <span className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                  Manzana {interes.manzana_nombre} - Casa {interes.vivienda_numero}
                </span>
              </div>
            )}

            {/* Notas (si existen) */}
            {interes.notas && (
              <div className='mb-3 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50'>
                <MessageSquare className='mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500' />
                <p className='flex-1 text-sm italic text-gray-600 dark:text-gray-400'>
                  {interes.notas}
                </p>
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
  )
}
