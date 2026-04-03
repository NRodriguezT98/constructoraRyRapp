'use client'

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Banknote,
  DollarSign,
  Info,
  Mail,
  MapPin,
  Phone,
  Receipt,
  TrendingUp,
  User,
} from 'lucide-react'

import * as styles from '@/app/viviendas/[slug]/vivienda-detalle.styles'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatArea, formatCurrency } from '@/shared/utils'

interface InfoTabProps {
  vivienda: Vivienda
  onAsignarCliente?: () => void
}

/**
 * Tab de informacion de la vivienda
 * Componente de presentacion puro (sigue patron de GeneralTab de proyectos)
 */
export function InfoTab({ vivienda }: InfoTabProps) {
  // Calcular progreso de pagos si aplica
  const porcentajePagado = vivienda.porcentaje_pagado || 0

  return (
    <div key='info' className='animate-fade-in space-y-3'>
      {/* Barra de Progreso de Pagos (solo si esta asignada o vendida) */}
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
                  {'Calculado seg\u00FAn abonos realizados'}
                </p>
              </div>
            </div>
            <div className={styles.progressClasses.rightSection}>
              <p className={styles.progressClasses.percentage}>
                {porcentajePagado}%
              </p>
              <p className={styles.progressClasses.percentageLabel}>Pagado</p>
            </div>
          </div>

          {/* Barra con gradiente animado */}
          <div className={styles.progressClasses.bar}>
            <div
              className={styles.progressClasses.barFill}
              style={{
                width: `${porcentajePagado}%`,
                transition: 'width 1.5s ease-out 0.1s',
              }}
            >
              <div
                className={`${styles.progressClasses.shimmer} animate-shimmer`}
              ></div>
            </div>
          </div>

          {/* Milestones */}
          <div className={styles.progressClasses.milestones}>
            <div className={styles.progressClasses.milestone}>
              <div className={styles.progressClasses.milestoneValue}>
                {formatCurrency(vivienda.valor_total || 0)}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>Total</div>
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
                {formatCurrency(
                  (vivienda.valor_total || 0) - (vivienda.total_abonado || 0)
                )}
              </div>
              <div className={styles.progressClasses.milestoneLabel}>Saldo</div>
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

      {/* SECCION 1: Informacion Financiera - Full Width Hero Destacado */}
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
            {`Informaci\u00F3n Financiera`}
          </h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          {/* Grid Horizontal: Mini-Cards al Mismo Nivel */}
          <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
            {/* Valor Total */}
            <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-4 shadow-lg transition-shadow hover:shadow-xl'>
              <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
              <div className='relative z-10'>
                <div className='mb-2 flex items-center gap-1.5'>
                  <DollarSign className='h-4 w-4 text-orange-100' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-orange-100'>
                    Valor Total Vivienda
                  </p>
                </div>
                <p className='mb-0.5 text-2xl font-black text-white'>
                  {formatCurrency(vivienda.valor_total || 0)}
                </p>
                <p className='text-xs text-orange-100/80'>Precio final</p>
              </div>
            </div>

            {/* Valor Base */}
            <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Banknote className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
                  Valor Base Vivienda
                </p>
              </div>
              <p className='mb-0.5 text-2xl font-black text-gray-900 dark:text-white'>
                {formatCurrency(vivienda.valor_base || 0)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Valor inicial
              </p>
            </div>

            {/* Gastos Notariales */}
            <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Receipt className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
                  Gastos Notariales
                </p>
              </div>
              <p className='mb-0.5 text-2xl font-black text-gray-900 dark:text-white'>
                {formatCurrency(vivienda.gastos_notariales || 0)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Notariales
              </p>
            </div>

            {/* Recargo Esquinera */}
            {vivienda.es_esquinera &&
            vivienda.recargo_esquinera &&
            vivienda.recargo_esquinera > 0 ? (
              <div className='rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30'>
                <div className='mb-2 flex items-center gap-1.5'>
                  <TrendingUp className='h-4 w-4 text-amber-700 dark:text-amber-400' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400'>
                    Recargo
                  </p>
                </div>
                <p className='mb-0.5 text-2xl font-black text-amber-800 dark:text-amber-300'>
                  + {formatCurrency(vivienda.recargo_esquinera)}
                </p>
                <p className='text-xs text-amber-600 dark:text-amber-500'>
                  Esquinera
                </p>
              </div>
            ) : (
              <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/30'>
                <div className='mb-2 flex items-center gap-1.5'>
                  <TrendingUp className='h-4 w-4 text-gray-400 dark:text-gray-500' />
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                    Recargo
                  </p>
                </div>
                <p className='mb-0.5 text-2xl font-black text-gray-400 dark:text-gray-600'>
                  $ 0
                </p>
                <p className='text-xs text-gray-400 dark:text-gray-600'>
                  No aplica
                </p>
              </div>
            )}
          </div>

          {/* Cliente Asignado (si existe) */}
          {vivienda.estado !== 'Disponible' && vivienda.clientes && (
            <div className='mt-4 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20'>
              <div className='mb-3 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-md'>
                  <User className='h-5 w-5 text-white' />
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400'>
                    Cliente Asignado
                  </p>
                  <p className='mt-0.5 text-base font-bold text-gray-900 dark:text-white'>
                    {vivienda.clientes.nombre_completo}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-4 border-t border-orange-200 pt-3 dark:border-orange-800'>
                {vivienda.clientes.telefono && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-3.5 w-3.5 text-orange-600 dark:text-orange-400' />
                    <p className='font-medium text-gray-700 dark:text-gray-300'>
                      {vivienda.clientes.telefono}
                    </p>
                  </div>
                )}
                {vivienda.clientes.email && (
                  <div className='flex items-center gap-2 text-xs'>
                    <Mail className='h-3.5 w-3.5 text-orange-600 dark:text-orange-400' />
                    <p className='truncate text-gray-600 dark:text-gray-400'>
                      {vivienda.clientes.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCION 2: Grid 2 Columnas - Informacion General + Linderos */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* COLUMNA 1: Informacion General */}
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
              {`Informaci\u00F3n General`}
            </h3>
          </div>
          <div className={styles.infoCardClasses.content}>
            {/* Identificacion */}
            <div className='rounded-lg border border-orange-200/50 bg-gradient-to-br from-orange-50 to-amber-50 p-3 dark:border-orange-800/50 dark:from-orange-950/30 dark:to-amber-950/30'>
              <p className='mb-1 text-xs font-medium text-orange-600 dark:text-orange-400'>{`Identificaci\u00F3n`}</p>
              <p className='text-lg font-bold text-gray-900 dark:text-white'>
                Mz. {vivienda.manzanas?.nombre || 'N/A'} Casa {vivienda.numero}
              </p>
            </div>

            {/* Grid 2x2: Proyecto, Tipo, Areas */}
            <div className='mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/30'>
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
                  <p
                    className={styles.infoCardClasses.label}
                  >{`\u00C1rea Construida`}</p>
                  <p className='font-mono text-base font-bold text-gray-900 dark:text-white'>
                    {formatArea(vivienda.area_construida)}
                  </p>
                </div>
                <div>
                  <p
                    className={styles.infoCardClasses.label}
                  >{`\u00C1rea de Lote`}</p>
                  <p className='font-mono text-base font-bold text-gray-900 dark:text-white'>
                    {formatArea(vivienda.area_lote)}
                  </p>
                </div>
              </div>
            </div>

            {/* Matricula y Nomenclatura (si existen) */}
            {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
              <div className='mt-4 space-y-2'>
                {vivienda.matricula_inmobiliaria && (
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/30'>
                    <p className='mb-0.5 text-xs font-medium text-gray-600 dark:text-gray-400'>{`Matr\u00EDcula Inmobiliaria`}</p>
                    <p className='font-mono text-sm font-semibold text-gray-900 dark:text-white'>
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                )}
                {vivienda.nomenclatura && (
                  <div className='rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/30'>
                    <p className='mb-0.5 text-xs font-medium text-gray-600 dark:text-gray-400'>
                      Nomenclatura Catastral
                    </p>
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
        {(vivienda.lindero_norte ||
          vivienda.lindero_sur ||
          vivienda.lindero_oriente ||
          vivienda.lindero_occidente) && (
          <div
            className={`${styles.infoCardClasses.card} animate-slide-down`}
            style={{ animationDelay: '250ms' }}
          >
            <div className={styles.infoCardClasses.header}>
              <div
                className={`${styles.infoCardClasses.iconContainer} bg-gradient-to-br from-orange-500 to-amber-600`}
              >
                <MapPin className={styles.infoCardClasses.icon} />
              </div>
              <h3 className={styles.infoCardClasses.title}>Linderos</h3>
            </div>
            <div className={styles.infoCardClasses.content}>
              <div className='space-y-3'>
                {vivienda.lindero_norte && (
                  <div className='rounded-lg border border-orange-200/60 bg-orange-50/60 p-3 dark:border-orange-800/40 dark:bg-orange-950/20'>
                    <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400'>
                      <ArrowUp className='h-3.5 w-3.5' /> Norte
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      {vivienda.lindero_norte}
                    </p>
                  </div>
                )}
                {vivienda.lindero_sur && (
                  <div className='rounded-lg border border-orange-200/60 bg-orange-50/60 p-3 dark:border-orange-800/40 dark:bg-orange-950/20'>
                    <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400'>
                      <ArrowDown className='h-3.5 w-3.5' /> Sur
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      {vivienda.lindero_sur}
                    </p>
                  </div>
                )}
                {vivienda.lindero_oriente && (
                  <div className='rounded-lg border border-orange-200/60 bg-orange-50/60 p-3 dark:border-orange-800/40 dark:bg-orange-950/20'>
                    <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400'>
                      <ArrowRight className='h-3.5 w-3.5' /> Oriente
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      {vivienda.lindero_oriente}
                    </p>
                  </div>
                )}
                {vivienda.lindero_occidente && (
                  <div className='rounded-lg border border-orange-200/60 bg-orange-50/60 p-3 dark:border-orange-800/40 dark:bg-orange-950/20'>
                    <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400'>
                      <ArrowLeft className='h-3.5 w-3.5' /> Occidente
                    </p>
                    <p className='text-sm text-gray-900 dark:text-white'>
                      {vivienda.lindero_occidente}
                    </p>
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
