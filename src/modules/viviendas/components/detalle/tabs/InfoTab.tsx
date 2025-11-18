'use client'

import { motion } from 'framer-motion'
import { DollarSign, Info, MapPin } from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/shared/utils'

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
    <motion.div
      key='info'
      {...styles.animations.fadeInUp}
      className='space-y-3'
    >
      {/* Barra de Progreso de Pagos (solo si está asignada o vendida) */}
      {vivienda.estado !== 'Disponible' && (
        <motion.div
          {...styles.animations.fadeInUp}
          transition={{ delay: 0.1 }}
          className={styles.progressClasses.container}
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
            <motion.div
              className={styles.progressClasses.barFill}
              initial={{ width: 0 }}
              animate={{ width: `${porcentajePagado}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
            >
              <div className={`${styles.progressClasses.shimmer} animate-shimmer`}></div>
            </motion.div>
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
        </motion.div>
      )}

      {/* Cards de Información - Layout 2 columnas optimizado */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* COLUMNA 1: Datos Generales (Técnicos + Ubicación fusionados) */}
        <motion.div
          {...styles.animations.fadeInLeft}
          className={styles.infoCardClasses.card}
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
            <div className='mt-4 grid grid-cols-2 gap-3'>
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
                  {vivienda.area_construida?.toString() || 'N/A'} m²
                </p>
              </div>
              <div>
                <p className={styles.infoCardClasses.label}>Área de Lote</p>
                <p className='text-base font-bold text-gray-900 dark:text-white font-mono'>
                  {vivienda.area_lote?.toString() || 'N/A'} m²
                </p>
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

            {/* Linderos en grid 2x2 compacto */}
            {(vivienda.lindero_norte || vivienda.lindero_sur || vivienda.lindero_oriente || vivienda.lindero_occidente) && (
              <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2'>
                  <MapPin className='w-3.5 h-3.5' />
                  Linderos
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {vivienda.lindero_norte && (
                    <div className='p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'>
                      <p className='text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5'>⬆️ Norte</p>
                      <p className='text-xs text-gray-900 dark:text-white line-clamp-2'>{vivienda.lindero_norte}</p>
                    </div>
                  )}
                  {vivienda.lindero_sur && (
                    <div className='p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'>
                      <p className='text-xs font-medium text-orange-600 dark:text-orange-400 mb-0.5'>⬇️ Sur</p>
                      <p className='text-xs text-gray-900 dark:text-white line-clamp-2'>{vivienda.lindero_sur}</p>
                    </div>
                  )}
                  {vivienda.lindero_oriente && (
                    <div className='p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800'>
                      <p className='text-xs font-medium text-rose-600 dark:text-rose-400 mb-0.5'>➡️ Oriente</p>
                      <p className='text-xs text-gray-900 dark:text-white line-clamp-2'>{vivienda.lindero_oriente}</p>
                    </div>
                  )}
                  {vivienda.lindero_occidente && (
                    <div className='p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800'>
                      <p className='text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5'>⬅️ Occidente</p>
                      <p className='text-xs text-gray-900 dark:text-white line-clamp-2'>{vivienda.lindero_occidente}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* COLUMNA 2: Información Financiera + Cliente */}
        <motion.div
          {...styles.animations.fadeInLeft}
          transition={{ delay: 0.1 }}
          className={styles.infoCardClasses.card}
        >
          <div className={styles.infoCardClasses.header}>
            <div
              className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br ${styles.gradients.valor}`}
            >
              <DollarSign className={styles.infoCardClasses.icon} />
            </div>
            <h3 className={styles.infoCardClasses.title}>Información Financiera</h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            {/* Valor Base */}
            <div className='p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200/50 dark:border-orange-800/50'>
              <p className='text-xs font-medium text-orange-600 dark:text-orange-400 mb-1'>Valor Base</p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {formatCurrency(vivienda.valor_base || 0)}
              </p>
            </div>

            {/* Grid de detalles financieros */}
            <div className='mt-4 space-y-3'>
              {vivienda.es_esquinera && vivienda.recargo_esquinera && vivienda.recargo_esquinera > 0 && (
                <div className='p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-lg'>🏘️</span>
                    <p className='text-xs font-medium text-yellow-600 dark:text-yellow-400'>Recargo Esquinera</p>
                  </div>
                  <p className='text-lg font-bold text-yellow-700 dark:text-yellow-300'>
                    + {formatCurrency(vivienda.recargo_esquinera)}
                  </p>
                </div>
              )}

              <div className='p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700'>
                <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>Gastos Notariales</p>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                  {formatCurrency(vivienda.gastos_notariales || 0)}
                </p>
              </div>
            </div>

            {/* Valor Total - Destacado con gradiente */}
            <div className='mt-4 relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl shadow-orange-500/30'>
              <div className='absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
              <div className='relative z-10'>
                <p className='text-xs font-medium text-orange-100 mb-1 flex items-center gap-1'>
                  💰 Valor Total
                </p>
                <p className='text-3xl font-bold text-white'>
                  {formatCurrency(vivienda.valor_total || 0)}
                </p>
              </div>
            </div>

            {/* Cliente Asignado - Expandido con más info */}
            {vivienda.estado !== 'Disponible' && vivienda.clientes && (
              <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30'>
                    <span className='text-base'>👤</span>
                  </div>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>Cliente Asignado</p>
                </div>
                <div className='p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50 space-y-2'>
                  <div>
                    <p className='text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5'>Nombre Completo</p>
                    <p className='text-base font-bold text-gray-900 dark:text-white'>
                      {vivienda.clientes.nombres} {vivienda.clientes.apellidos}
                    </p>
                  </div>
                  {vivienda.clientes.telefono && (
                    <div className='flex items-center gap-2 pt-2 border-t border-purple-200 dark:border-purple-800'>
                      <span className='text-purple-600 dark:text-purple-400'>📞</span>
                      <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                        {vivienda.clientes.telefono}
                      </p>
                    </div>
                  )}
                  {vivienda.clientes.email && (
                    <div className='flex items-center gap-2 pt-1 border-t border-purple-200 dark:border-purple-800'>
                      <span className='text-purple-600 dark:text-purple-400'>📧</span>
                      <p className='text-xs text-gray-700 dark:text-gray-300'>
                        {vivienda.clientes.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
