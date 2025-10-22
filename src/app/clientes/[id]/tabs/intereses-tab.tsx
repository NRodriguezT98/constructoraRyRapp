'use client'

/**
 * Tab de Intereses - Historial Simple
 *
 * Muestra todos los intereses del cliente con:
 * - Estado (Activo/Descartado)
 * - Proyecto y vivienda (si aplica)
 * - Origen (cómo se enteró)
 * - Notas y fechas
 * - Acciones: Descartar, Convertir a Negociación
 *
 * ⚠️ NOMBRES VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

import { useListaIntereses } from '@/modules/clientes/hooks'
import type { Cliente } from '@/modules/clientes/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Clock,
    Heart,
    Home,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    TrendingUp,
    User,
    X,
} from 'lucide-react'
import { useState } from 'react'
import * as styles from '../cliente-detalle.styles'

interface InteresesTabProps {
  cliente: Cliente
  onRegistrarInteres?: () => void
}

// Iconos para origen
const ICONOS_ORIGEN: Record<string, typeof Phone> = {
  'Visita Presencial': User,
  'Llamada Telefónica': Phone,
  'WhatsApp': MessageSquare,
  'Email': Mail,
  'Redes Sociales': Heart,
  'Referido': User,
  'Sitio Web': Building2,
  'Otro': AlertCircle,
}

export function InteresesTab({ cliente, onRegistrarInteres }: InteresesTabProps) {
  const { intereses, loading, stats, descartarInteres, filtrarPorEstado, estadoFiltro, recargar } = useListaIntereses(cliente.id)
  const [descartando, setDescartando] = useState<string | null>(null)

  const estadisticas = cliente.estadisticas

  // Descartar interés
  const handleDescartar = async (interesId: string) => {
    if (!confirm('¿Estás seguro de descartar este interés?')) return

    setDescartando(interesId)
    try {
      await descartarInteres(interesId, 'Cliente ya no está interesado')
      await recargar()
    } catch (error) {
      console.error('Error al descartar:', error)
      alert('Error al descartar el interés')
    } finally {
      setDescartando(null)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-10'>
        <div className='text-center'>
          <div className='mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600'></div>
          <p className='mt-3 text-xs text-gray-600 dark:text-gray-400'>Cargando intereses...</p>
        </div>
      </div>
    )
  }

  if (intereses.length === 0 && !estadoFiltro) {
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
    <div className='space-y-4'>
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
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            {/* Total Negociaciones */}
            <div className='rounded-lg border-2 border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-700 dark:bg-blue-900/20'>
              <TrendingUp className='mx-auto mb-1.5 h-6 w-6 text-blue-600 dark:text-blue-400' />
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {estadisticas.total_negociaciones}
              </p>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                Total Negociaciones
              </p>
            </div>

            {/* Activas */}
            <div className='rounded-lg border-2 border-green-200 bg-green-50 p-3 text-center dark:border-green-700 dark:bg-green-900/20'>
              <CheckCircle2 className='mx-auto mb-1.5 h-6 w-6 text-green-600 dark:text-green-400' />
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {estadisticas.negociaciones_activas}
              </p>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>Activas</p>
            </div>

            {/* Completadas */}
            <div className='rounded-lg border-2 border-purple-200 bg-purple-50 p-3 text-center dark:border-purple-700 dark:bg-purple-900/20'>
              <CheckCircle2 className='mx-auto mb-1.5 h-6 w-6 text-purple-600 dark:text-purple-400' />
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {estadisticas.negociaciones_completadas}
              </p>
              <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>Completadas</p>
            </div>
          </div>

          {/* Última negociación */}
          {estadisticas.ultima_negociacion && (
            <div className='mt-3 rounded-lg bg-blue-100 px-3 py-2.5 text-center dark:bg-blue-900/40'>
              <div className='flex items-center justify-center gap-1.5 text-xs text-blue-900 dark:text-blue-100'>
                <Clock className='h-3.5 w-3.5' />
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

      {/* Filtros y Estadísticas de Intereses */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-1.5'>
          <button
            onClick={() => filtrarPorEstado(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              estadoFiltro === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => filtrarPorEstado('Activo')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              estadoFiltro === 'Activo'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🟢 Activos ({stats.activos})
          </button>
          <button
            onClick={() => filtrarPorEstado('Descartado')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              estadoFiltro === 'Descartado'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            ⚪ Descartados ({stats.descartados})
          </button>
        </div>

        <button
          onClick={onRegistrarInteres}
          className='inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors'
        >
          <Plus className='h-3.5 w-3.5' />
          Registrar Nuevo Interés
        </button>
      </div>

      {/* Lista de Intereses */}
      {intereses.length === 0 ? (
        <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50'>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            No hay intereses con el filtro seleccionado
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {intereses.map((interes) => {
            const IconoOrigen = ICONOS_ORIGEN[interes.origen || 'Otro'] || AlertCircle
            const esActivo = interes.estado === 'Activo'

            return (
              <div
                key={interes.id}
                className={`rounded-lg border-2 p-4 shadow-sm transition-all hover:shadow-md ${
                  esActivo
                    ? 'border-purple-200 bg-white dark:border-purple-700 dark:bg-purple-900/10'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                {/* Header del interés */}
                <div className='mb-2.5 flex items-start justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      esActivo
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        esActivo
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                        {interes.proyecto_nombre}
                      </h4>
                      {interes.origen && (
                        <div className='mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400'>
                          <IconoOrigen className='h-3 w-3' />
                          <span>{interes.origen}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      esActivo
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {esActivo ? '🟢 Activo' : '⚪ Descartado'}
                  </span>
                </div>

                {/* Vivienda (si existe) */}
                {interes.vivienda_numero && (
                  <div className={`mb-2.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
                    esActivo
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'bg-gray-100 dark:bg-gray-700/50'
                  }`}>
                    <Home className={`h-3.5 w-3.5 ${
                      esActivo
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium ${
                      esActivo
                        ? 'text-purple-900 dark:text-purple-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {interes.manzana_nombre ? `${interes.manzana_nombre} - ` : ''}Casa {interes.vivienda_numero}
                    </span>
                    {interes.vivienda_valor && (
                      <span className='ml-auto text-xs font-semibold text-gray-900 dark:text-gray-100'>
                        ${interes.vivienda_valor.toLocaleString('es-CO')}
                      </span>
                    )}
                  </div>
                )}

                {/* Notas (si existen) */}
                {interes.notas && (
                  <div className='mb-2.5 flex items-start gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-gray-800/50'>
                    <MessageSquare className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500' />
                    <p className='flex-1 text-xs italic text-gray-600 dark:text-gray-400'>
                      &quot;{interes.notas}&quot;
                    </p>
                  </div>
                )}

                {/* Footer: Fecha y Acciones */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400'>
                    <Clock className='h-3 w-3' />
                    <span>
                      {formatDistanceToNow(new Date(interes.fecha_interes), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>

                  {/* Acciones solo para intereses activos */}
                  {esActivo && (
                    <div className='flex items-center gap-1.5'>
                      <button
                        onClick={() => handleDescartar(interes.id)}
                        disabled={descartando === interes.id}
                        className='inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1 text-[10px] font-medium text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                      >
                        <X className='h-3 w-3' />
                        {descartando === interes.id ? 'Descartando...' : 'Descartar'}
                      </button>
                      {/* TODO: Botón convertir a negociación */}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
