'use client'

import { DollarSign, Info, MapPin } from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatArea, formatCurrency } from '@/shared/utils'

import * as styles from '@/app/viviendas/[slug]/vivienda-detalle.styles'

interface InfoTabProps {
  vivienda: Vivienda
  onAsignarCliente?: () => void
}

/**
 * Tab de información de la vivienda
 * Componente de presentación puro (sigue patrón de GeneralTab de proyectos)
 */
export function InfoTab({ vivienda }: InfoTabProps) {
  // Calcular progreso de pagos si aplica
  const porcentajePagado = vivienda.porcentaje_pagado || 0

  return (
    <div
      key='info'
      className='space-y-3 animate-fade-in'
    >
      {/* Barra de Progreso de Pagos (solo si está asignada o vendida) */}
      {vivienda.estado !== 'Disponible' && (
        <div
          className={`${styles.progressClasses.container} animate-slide-down`}
          style={{ animationDelay: '100ms' }}
        >
          <div className={styles.progressClasses.header}>
            <div className={styles.progressClasses.leftSection}>
              <div className={styles.progressClasses.iconContainer}>
                <DollarSign className={styles.progressClasses.icon} />
              </div>
              <div className={styles.progressClasses.titleSection}>
                <p className={styles.progressClasses.title}>
                  Progreso de Pagos
                </p>
                <p className={styles.progressClasses.subtitle}>
                  Calculado según abonos realizados
                </p>
              </div>
            </div>
            <div className={styles.progressClasses.rightSection}>
              <p className={styles.progressClasses.percentage}>
                {porcentajePagado}%
              </p>
              <p className={styles.progressClasses.percentageLabel}>
                Pagado
              </p>
            </div>
          </div>

          {/* Barra con gradiente animado */}
          <div className={styles.progressClasses.bar}>
            <div
              className={styles.progressClasses.barFill}
              style={{ width: `${porcentajePagado}%`, transition: 'width 1.5s ease-out 0.1s' }}
            >
              <div className={`${styles.progressClasses.shimmer} animate-shimmer`}></div>
            </div>
          </div>

          {/* Milestones */}
          <div className={styles.progressClasses.milestones}>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {formatCurrency(vivienda.valor_total || 0)}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Total
              </div>
            </div>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {formatCurrency(vivienda.total_abonado || 0)}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Abonado
              </div>
            </div>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {formatCurrency((vivienda.valor_total || 0) - (vivienda.total_abonado || 0))}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Saldo
              </div>
            </div>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {vivienda.cantidad_abonos || 0}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>
                Abonos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: Información Financiera - Full Width Hero Destacado */}
      <div
        className={`${styles.infoCardClasses.card} animate-slide-down`}
        style={{ animationDelay: '150ms' }}
      >
        <div className={styles.infoCardClasses.header}>
          <div
            className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.valor}`}
          >
            <DollarSign className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>
            Información Financiera
          </h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          {/* Grid Horizontal: Mini-Cards al Mismo Nivel */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
            {/* Valor Total */}
            <div className='relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg hover:shadow-xl transition-shadow'>
              <div className='absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
              <div className='relative z-10'>
                <div className='flex items-center gap-1.5 mb-2'>
                  <DollarSign className='w-4 h-4 text-orange-100' />
                  <p className='text-xs font-semibold text-orange-100 uppercase tracking-wide'>Total</p>
                </div>
                <p className='text-2xl font-black text-white mb-0.5'>
                  {formatCurrency(vivienda.valor_total || 0)}
                </p>
                <p className='text-xs text-orange-100/80'>Precio final</p>
              </div>
            </div>

            {/* Valor Base */}
            <div className='p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-1.5 mb-2'>
                <span className='text-base'>🏠</span>
                <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>Base</p>
              </div>
              <p className='text-2xl font-black text-gray-900 dark:text-white mb-0.5'>
                {formatCurrency(vivienda.valor_base || 0)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Valor inicial</p>
            </div>

            {/* Gastos Notariales */}
            <div className='p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow'>
              <div className='flex items-center gap-1.5 mb-2'>
                <span className='text-base'>📄</span>
                <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>Gastos</p>
              </div>
              <p className='text-2xl font-black text-gray-900 dark:text-white mb-0.5'>
                {formatCurrency(vivienda.gastos_notariales || 0)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Notariales</p>
            </div>

            {/* Recargo Esquinera */}
            {vivienda.es_esquinera && vivienda.recargo_esquinera && vivienda.recargo_esquinera > 0 ? (
              <div className='p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-300 dark:border-yellow-700 shadow-sm hover:shadow-md transition-shadow'>
                <div className='flex items-center gap-1.5 mb-2'>
                  <span className='text-base'>🏘️</span>
                  <p className='text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide'>Recargo</p>
                </div>
                <p className='text-2xl font-black text-yellow-800 dark:text-yellow-300 mb-0.5'>
                  + {formatCurrency(vivienda.recargo_esquinera)}
                </p>
                <p className='text-xs text-yellow-600 dark:text-yellow-500'>Esquinera</p>
              </div>
            ) : (
              <div className='p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 shadow-sm'>
                <div className='flex items-center gap-1.5 mb-2'>
                  <span className='text-base opacity-50'>🏘️</span>
                  <p className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide'>Recargo</p>
                </div>
                <p className='text-2xl font-black text-gray-400 dark:text-gray-600 mb-0.5'>
                  $ 0
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-600'>No aplica</p>
              </div>
            )}
          </div>

          {/* Cliente Asignado (si existe) */}
          {vivienda.estado !== 'Disponible' && vivienda.clientes && (
            <div className='mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md'>
                  <span className='text-base'>👤</span>
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>Cliente Asignado</p>
                  <p className='text-base font-bold text-gray-900 dark:text-white mt-0.5'>
                    {vivienda.clientes.nombres} {vivienda.clientes.apellidos}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 pt-3 border-t border-purple-200 dark:border-purple-800'>
                {vivienda.clientes.telefono && (
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='text-purple-600 dark:text-purple-400'>📞</span>
                    <p className='font-medium text-gray-700 dark:text-gray-300'>{vivienda.clientes.telefono}</p>
                  </div>
                )}
                {vivienda.clientes.email && (
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='text-purple-600 dark:text-purple-400'>📧</span>
                    <p className='text-gray-600 dark:text-gray-400 truncate'>{vivienda.clientes.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: Grid 2 Columnas - Información General + Linderos */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* COLUMNA 1: Información General */}
        <div
          className={`${styles.infoCardClasses.card} animate-slide-down`}
          style={{ animationDelay: '200ms' }}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.detalles}`}
            >
              <Info className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>
              Información General
            </h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            {/* Identificación */}
            <div className='p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/50'>
              <p className='text-xs font-medium text-orange-600 dark:text-orange-400 mb-1'>Identificación</p>
              <p className='text-lg font-bold text-gray-900 dark:text-white'>
                Mz. {vivienda.manzanas?.nombre || 'N/A'} Casa {vivienda.numero}
              </p>
            </div>

            {/* Grid 2x2: Proyecto, Tipo, Áreas */}
            <div className='mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <p className={styles.infoCardClasses.label}>Proyecto</p>
                  <p className={styles.infoCardClasses.value}>
                    {vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'}
                  </p>
                </div>
                <div>
                  <p className={styles.infoCardClasses.label}>Tipo Vivienda</p>
                  <p className={styles.infoCardClasses.value}>
                    {vivienda.tipo_vivienda || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className={styles.infoCardClasses.label}>Área Construida</p>
                  <p className='text-base font-bold text-gray-900 dark:text-white font-mono'>
                    {formatArea(vivienda.area_construida)}
                  </p>
                </div>
                <div>
                  <p className={styles.infoCardClasses.label}>Área de Lote</p>
                  <p className='text-base font-bold text-gray-900 dark:text-white font-mono'>
                    {formatArea(vivienda.area_lote)}
                  </p>
                </div>
              </div>
            </div>

            {/* Matrícula y Nomenclatura (si existen) */}
            {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
              <div className='mt-4 space-y-2'>
                {vivienda.matricula_inmobiliaria && (
                  <div className='p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700'>
                    <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5'>Matrícula Inmobiliaria</p>
                    <p className='text-sm font-mono font-semibold text-gray-900 dark:text-white'>
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                )}
                {vivienda.nomenclatura && (
                  <div className='p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700'>
                    <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5'>Nomenclatura Catastral</p>
                    <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                      {vivienda.nomenclatura}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: Linderos */}
        {(vivienda.lindero_norte || vivienda.lindero_sur || vivienda.lindero_oriente || vivienda.lindero_occidente) && (
          <div
            className={`${styles.infoCardClasses.card} animate-slide-down`}
            style={{ animationDelay: '250ms' }}
          >
            <div className={styles.infoCardClasses.header}>
              <div
                className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br from-blue-500 to-cyan-600`}
              >
                <MapPin className={styles.infoCardClasses.icon} />
              </div>
              <h3 className={styles.infoCardClasses.title}>
                Linderos
              </h3>
            </div>
            <div className={styles.infoCardClasses.content}>
              <div className='space-y-3'>
                {vivienda.lindero_norte && (
                  <div className='p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'>
                    <p className='text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 flex items-center gap-1.5'>
                      <span className='text-sm'>⬆️</span> Norte
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>{vivienda.lindero_norte}</p>
                  </div>
                )}
                {vivienda.lindero_sur && (
                  <div className='p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'>
                    <p className='text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1.5 flex items-center gap-1.5'>
                      <span className='text-sm'>⬇️</span> Sur
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>{vivienda.lindero_sur}</p>
                  </div>
                )}
                {vivienda.lindero_oriente && (
                  <div className='p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800'>
                    <p className='text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5 flex items-center gap-1.5'>
                      <span className='text-sm'>➡️</span> Oriente
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>{vivienda.lindero_oriente}</p>
                  </div>
                )}
                {vivienda.lindero_occidente && (
                  <div className='p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800'>
                    <p className='text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5 flex items-center gap-1.5'>
                      <span className='text-sm'>⬅️</span> Occidente
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>{vivienda.lindero_occidente}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
