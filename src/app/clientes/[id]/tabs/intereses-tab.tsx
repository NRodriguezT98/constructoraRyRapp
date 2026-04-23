'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Tab de Intereses - Refactorizado
 *
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - TODA la lógica está en useInteresesTab hook
 * - Este componente SOLO renderiza UI
 *
 * ⚠️ NOMBRES VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 */

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Info,
  Lightbulb,
  ListChecks,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  TrendingUp,
  User,
  X,
} from 'lucide-react'

import { ModalDescartarInteres } from '@/modules/clientes/components/modals/modal-descartar-interes'
import { useInteresesTab } from '@/modules/clientes/hooks'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { SectionLoadingSpinner } from '@/shared/components/ui'

import { interesesTabStyles } from './intereses-tab.styles'

interface InteresesTabProps {
  cliente: Cliente
  onRegistrarInteres?: () => void
}

// Iconos para origen
const ICONOS_ORIGEN: Record<string, typeof Phone> = {
  'Visita Presencial': User,
  'Llamada Telefónica': Phone,
  WhatsApp: MessageSquare,
  Email: Mail,
  'Redes Sociales': Heart,
  Referido: User,
  'Sitio Web': Building2,
  Otro: AlertCircle,
}

export function InteresesTab({
  cliente,
  onRegistrarInteres,
}: InteresesTabProps) {
  const { puede, esAdmin } = usePermisosQuery()
  const canEdit = esAdmin || puede('clientes', 'registrar_interes')

  // ✅ Hook con TODA la lógica
  const {
    intereses,
    loading,
    stats,
    estadoFiltro,
    descartando,
    abrirModalDescartar,
    cancelarDescartar,
    confirmarDescartar,
    interesADescartar,
    filtrarPorEstado,
  } = useInteresesTab({ clienteId: cliente.id })

  if (loading) {
    return (
      <SectionLoadingSpinner
        label='Cargando intereses...'
        moduleName='clientes'
        icon={Heart}
      />
    )
  }

  if (intereses.length === 0 && !estadoFiltro) {
    return (
      <motion.div
        className={interesesTabStyles.emptyState.container}
        {...interesesTabStyles.animations.fadeInUp}
      >
        {/* Icono con gradiente */}
        <div className='flex justify-center'>
          <motion.div
            className={interesesTabStyles.emptyState.iconWrapper}
            {...interesesTabStyles.animations.scaleIn}
          >
            <Heart className={interesesTabStyles.emptyState.icon} />
          </motion.div>
        </div>

        {/* Título y descripción */}
        <h3 className={interesesTabStyles.emptyState.title}>
          Sin Intereses Registrados
        </h3>
        <p className={interesesTabStyles.emptyState.description}>
          Este cliente aún no ha manifestado interés en ningún proyecto o
          vivienda específica. Registra su primer interés para iniciar el
          proceso comercial.
        </p>

        {/* Checklist de beneficios */}
        <div className={interesesTabStyles.emptyState.checklistContainer}>
          <div className={interesesTabStyles.emptyState.checklistHeader}>
            <ListChecks className='h-4 w-4' />
            ¿Qué puedes hacer?
          </div>

          <div className={interesesTabStyles.emptyState.checklistItems}>
            <div className={interesesTabStyles.emptyState.checklistItem}>
              <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30'>
                <Home className='h-3 w-3 text-pink-600 dark:text-pink-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p
                  className={interesesTabStyles.emptyState.checklistTextPending}
                >
                  Registrar interés en proyectos o viviendas específicas
                </p>
                <p className={interesesTabStyles.emptyState.checklistSubtext}>
                  Vincula al cliente con las viviendas que le interesan
                </p>
              </div>
            </div>

            <div className={interesesTabStyles.emptyState.checklistItem}>
              <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30'>
                <Building2 className='h-3 w-3 text-pink-600 dark:text-pink-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p
                  className={interesesTabStyles.emptyState.checklistTextPending}
                >
                  Hacer seguimiento del proceso comercial
                </p>
                <p className={interesesTabStyles.emptyState.checklistSubtext}>
                  Rastrea el origen y estado de cada interés
                </p>
              </div>
            </div>

            <div className={interesesTabStyles.emptyState.checklistItem}>
              <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30'>
                <TrendingUp className='h-3 w-3 text-pink-600 dark:text-pink-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p
                  className={interesesTabStyles.emptyState.checklistTextPending}
                >
                  Ver estadísticas y métricas comerciales
                </p>
                <p className={interesesTabStyles.emptyState.checklistSubtext}>
                  Analiza el desempeño y conversión del cliente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={interesesTabStyles.emptyState.ctaContainer}>
          <div className={interesesTabStyles.emptyState.ctaInfo}>
            <Lightbulb className={interesesTabStyles.emptyState.ctaIcon} />
            <div className='flex-1'>
              <h4 className={interesesTabStyles.emptyState.ctaTitle}>
                Comienza ahora
              </h4>
              <p className={interesesTabStyles.emptyState.ctaDescription}>
                Presiona el botón para registrar el primer interés de este
                cliente. Podrás seleccionar proyectos o viviendas específicas,
                indicar el origen del contacto y agregar observaciones
                relevantes.
              </p>
            </div>
          </div>

          {canEdit ? (
            <button
              onClick={onRegistrarInteres}
              className={interesesTabStyles.emptyState.ctaButton}
            >
              <Plus className='h-4 w-4' />
              Registrar Nuevo Interés
            </button>
          ) : null}
        </div>

        {/* Footer informativo */}
        <div className={interesesTabStyles.emptyState.footerInfo}>
          <Info className={interesesTabStyles.emptyState.footerIcon} />
          <p className={interesesTabStyles.emptyState.footerText}>
            Los intereses te permiten hacer seguimiento comercial desde el
            primer contacto hasta la asignación de vivienda. Son fundamentales
            para medir la conversión y el desempeño del equipo de ventas.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        {/* STATS - Intereses del Cliente */}
        <div className='rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
          <div className='mb-3 flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
            <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Intereses del Cliente
            </h3>
          </div>
          <div className='flex flex-wrap gap-2'>
            {/* Total */}
            <div className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 dark:border-gray-600 dark:bg-gray-700'>
              <span className='text-xs font-bold text-gray-900 dark:text-gray-100'>
                {stats.total}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                Total
              </span>
            </div>
            {/* Activos */}
            <div className='flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 dark:border-green-800 dark:bg-green-900/20'>
              <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500' />
              <span className='text-xs font-bold text-green-700 dark:text-green-400'>
                {stats.activos}
              </span>
              <span className='text-xs text-green-600 dark:text-green-500'>
                Activos
              </span>
            </div>
            {/* Descartados */}
            <div className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-gray-600 dark:bg-gray-700/50'>
              <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
              <span className='text-xs font-bold text-gray-600 dark:text-gray-400'>
                {stats.descartados}
              </span>
              <span className='text-xs text-gray-500 dark:text-gray-500'>
                Descartados
              </span>
            </div>
            {/* Convertidos */}
            <div className='flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 dark:border-cyan-800 dark:bg-cyan-900/20'>
              <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500' />
              <span className='text-xs font-bold text-cyan-700 dark:text-cyan-400'>
                {stats.convertidos}
              </span>
              <span className='text-xs text-cyan-600 dark:text-cyan-500'>
                Convertidos
              </span>
            </div>
          </div>
          {stats.total > 0 && (
            <div className='mt-2.5 border-t border-gray-100 pt-2.5 dark:border-gray-700'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                <span className='font-semibold text-cyan-600 dark:text-cyan-400'>
                  {Math.round((stats.convertidos / stats.total) * 100)}% de
                  conversión
                </span>{' '}
                ({stats.convertidos} de {stats.total} intereses derivaron en
                negociación)
              </p>
            </div>
          )}
        </div>

        {/* FILTER BAR + CTA */}
        <div className='sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-3 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex flex-wrap gap-1.5'>
              <button
                onClick={() => filtrarPorEstado(null)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  estadoFiltro === null
                    ? 'bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => filtrarPorEstado('Activo')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  estadoFiltro === 'Activo'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current' />
                Activos ({stats.activos})
              </button>
              <button
                onClick={() => filtrarPorEstado('Descartado')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  estadoFiltro === 'Descartado'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current' />
                Descartados ({stats.descartados})
              </button>
              <button
                onClick={() => filtrarPorEstado('Convertido')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  estadoFiltro === 'Convertido'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current' />
                Convertidos ({stats.convertidos})
              </button>
            </div>
            {canEdit ? (
              <button
                onClick={onRegistrarInteres}
                className='inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/40 active:scale-[0.98]'
              >
                <Plus className='h-3.5 w-3.5' />
                Registrar Interés
              </button>
            ) : null}
          </div>
        </div>

        {/* CARDS */}
        {intereses.length === 0 ? (
          <div className='rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/30'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              No hay intereses con el filtro seleccionado
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {intereses.map(interes => {
              const IconoOrigen =
                ICONOS_ORIGEN[interes.origen || 'Otro'] || AlertCircle
              const esActivo = interes.estado === 'Activo'
              const esConvertido = interes.estado === 'Convertido'
              const esDescartado = interes.estado === 'Descartado'

              return (
                <motion.div
                  key={interes.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`overflow-hidden rounded-xl border border-l-4 border-gray-200/50 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/90 ${
                    esActivo
                      ? 'border-l-cyan-500'
                      : esConvertido
                        ? 'border-l-indigo-500'
                        : 'border-l-gray-300 dark:border-l-gray-600'
                  } ${esDescartado ? 'opacity-60' : ''}`}
                >
                  <div className='p-4'>
                    {/* Header */}
                    <div className='mb-3 flex items-start justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-2.5'>
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                            esActivo
                              ? 'bg-cyan-100 dark:bg-cyan-900/30'
                              : esConvertido
                                ? 'bg-indigo-100 dark:bg-indigo-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                        >
                          <Building2
                            className={`h-5 w-5 ${
                              esActivo
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : esConvertido
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}
                          />
                        </div>
                        <div className='min-w-0'>
                          <h4 className='truncate text-sm font-semibold text-gray-900 dark:text-gray-100'>
                            {interes.proyecto_nombre}
                          </h4>
                          {interes.origen && (
                            <div className='mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400'>
                              <IconoOrigen className='h-3 w-3 flex-shrink-0' />
                              <span className='truncate'>{interes.origen}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* State badge */}
                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          esActivo
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                            : esConvertido
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            esActivo
                              ? 'bg-cyan-500'
                              : esConvertido
                                ? 'bg-indigo-500'
                                : 'bg-gray-400'
                          }`}
                        />
                        {interes.estado}
                      </span>
                    </div>

                    {/* Vivienda pill */}
                    {interes.vivienda_numero && (
                      <div className='mb-2.5'>
                        <p className='mb-1 ml-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500'>
                          Vivienda de interés
                        </p>
                        <div
                          className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 ${
                            esActivo
                              ? 'bg-cyan-50 dark:bg-cyan-900/20'
                              : esConvertido
                                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                : 'bg-gray-100 dark:bg-gray-700/50'
                          }`}
                        >
                          <Home
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                              esActivo
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : esConvertido
                                  ? 'text-indigo-500 dark:text-indigo-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              esActivo
                                ? 'text-cyan-900 dark:text-cyan-100'
                                : esConvertido
                                  ? 'text-indigo-900 dark:text-indigo-100'
                                  : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {interes.manzana_nombre
                              ? `${interes.manzana_nombre} · `
                              : ''}
                            Casa {interes.vivienda_numero}
                          </span>
                          {interes.vivienda_valor && (
                            <div className='ml-auto flex items-baseline gap-1'>
                              <span className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
                                Valor ref.
                              </span>
                              <span className='text-xs font-bold text-gray-900 dark:text-gray-100'>
                                $
                                {interes.vivienda_valor.toLocaleString('es-CO')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notas originales del interés */}
                    {interes.notas && (
                      <div className='mb-2.5 flex items-start gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 dark:bg-gray-800/50'>
                        <MessageSquare className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500' />
                        <div className='min-w-0 flex-1'>
                          <p className='mb-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500'>
                            Notas del interés
                          </p>
                          <p className='text-xs italic text-gray-600 dark:text-gray-400'>
                            &quot;{interes.notas}&quot;
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Motivo del descarte — solo cuando está descartado */}
                    {esDescartado && interes.motivo_descarte && (
                      <div className='mb-2.5 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 dark:border-red-800/50 dark:bg-red-950/30'>
                        <X className='mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400 dark:text-red-500' />
                        <div className='min-w-0 flex-1'>
                          <p className='mb-0.5 text-[10px] font-semibold text-red-500 dark:text-red-400'>
                            Motivo del descarte
                          </p>
                          <p className='text-xs text-red-700 dark:text-red-300'>
                            {interes.motivo_descarte}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className='flex items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-700'>
                      <div className='flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500'>
                        <Clock className='h-3 w-3' />
                        <span>
                          {formatDistanceToNow(
                            new Date(interes.fecha_interes),
                            {
                              addSuffix: true,
                              locale: es,
                            }
                          )}
                        </span>
                      </div>
                      {esActivo && canEdit ? (
                        <button
                          onClick={() => abrirModalDescartar(interes)}
                          disabled={descartando === interes.id}
                          className='inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                        >
                          <X className='h-3 w-3' />
                          {descartando === interes.id
                            ? 'Descartando...'
                            : 'Descartar'}
                        </button>
                      ) : null}
                      {esConvertido && (
                        <span className='inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400'>
                          <CheckCircle2 className='h-3.5 w-3.5' />
                          Negociación iniciada
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación para descartar interés */}
      <ModalDescartarInteres
        interes={interesADescartar}
        descartando={descartando !== null}
        onConfirmar={confirmarDescartar}
        onCancelar={cancelarDescartar}
      />
    </>
  )
}
