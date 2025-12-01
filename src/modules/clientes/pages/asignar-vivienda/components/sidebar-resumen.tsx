/**
 * Sidebar: Resumen Financiero Premium con Glassmorphism
 * Diseño Cyan→Blue con preview en tiempo real
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Home,
    Percent,
    TrendingDown,
} from 'lucide-react'

import type { FuentePagoConfig } from '@/modules/clientes/components/asignar-vivienda/types'
import type { TipoFuentePago } from '@/modules/clientes/types'

import { animations, pageStyles as s } from '../styles'

// Mapeo de tipos de fuente a nombres legibles
const FUENTE_LABELS: Record<string, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

const getFuenteLabel = (tipo: TipoFuentePago | string): string => {
  return FUENTE_LABELS[tipo] || tipo
}

interface SidebarResumenProps {
  currentStep: 1 | 2 | 3
  viviendaNumero?: string
  valorVivienda: number
  descuentoAplicado: number
  valorTotal: number
  fuentesConfiguradas: {
    tipo: TipoFuentePago
    config: FuentePagoConfig
  }[]
  totalFuentes: number
  sumaCierra: boolean
  progressStep1: number
  progressStep2: number
}

export function SidebarResumen({
  currentStep,
  viviendaNumero,
  valorVivienda,
  descuentoAplicado,
  valorTotal,
  fuentesConfiguradas,
  totalFuentes,
  sumaCierra,
  progressStep1,
  progressStep2,
}: SidebarResumenProps) {
  const diferencia = valorTotal - totalFuentes
  const porcentajeDescuento = valorVivienda > 0
    ? ((descuentoAplicado / valorVivienda) * 100).toFixed(1)
    : '0'

  return (
    <motion.div {...animations.sidebar} className={s.sidebar.container}>
      {/* Vivienda Seleccionada */}
      {viviendaNumero && (
        <div className={s.sidebar.card}>
          <h3 className={s.sidebar.title}>
            <Home className={s.sidebar.titleIcon} />
            Vivienda
          </h3>
          <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
            {viviendaNumero}
          </p>
        </div>
      )}

      {/* Resumen Financiero */}
      <div className={s.sidebar.card}>
        <h3 className={s.sidebar.title}>
          <DollarSign className={s.sidebar.titleIcon} />
          Resumen Financiero
        </h3>

        <div className="space-y-3">
          {/* Valor Vivienda */}
          <div>
            <p className={s.sidebar.label}>Valor Vivienda</p>
            <p className={s.sidebar.value}>
              ${valorVivienda.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Descuento */}
          {descuentoAplicado > 0 && (
            <>
              <div className={s.sidebar.divider} />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 font-medium flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Descuento
                  </p>
                  <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-bold">
                    <Percent className="w-3.5 h-3.5" />
                    {porcentajeDescuento}%
                  </span>
                </div>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  -${descuentoAplicado.toLocaleString('es-CO')}
                </p>
              </div>
            </>
          )}

          {/* Total a Financiar */}
          <div className={s.sidebar.divider} />
          <div>
            <p className={s.sidebar.label}>Total a Financiar</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ${valorTotal.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Fuentes de Pago (Solo en Paso 2 y 3) */}
      {currentStep >= 2 && (
        <div className={s.sidebar.card}>
          <h3 className={s.sidebar.title}>
            <DollarSign className={s.sidebar.titleIcon} />
            Fuentes de Pago
          </h3>

          <div className="space-y-3">
            {/* Total Fuentes */}
            <div>
              <p className={s.sidebar.label}>Total Configurado</p>
              <p className={s.sidebar.value}>
                ${totalFuentes.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Estado de Cierre */}
            <div className={s.sidebar.divider} />
            {sumaCierra ? (
              <div className="flex items-start gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold">Cierre completo</p>
                  <p className="text-xs mt-0.5">Las fuentes cubren el total</p>
                </div>
              </div>
            ) : diferencia !== 0 ? (
              <div className="flex items-start gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold">
                    {diferencia > 0 ? 'Faltan' : 'Excedente'}
                  </p>
                  <p className="text-xs font-semibold mt-0.5">
                    ${Math.abs(diferencia).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Sin configurar</p>
              </div>
            )}

            {/* Lista de Fuentes */}
            {fuentesConfiguradas.length > 0 && (
              <>
                <div className={s.sidebar.divider} />
                <div className="space-y-2.5">
                  {fuentesConfiguradas.map((fuente) => {
                    const porcentaje = ((fuente.config.monto_aprobado / valorTotal) * 100).toFixed(0)

                    return (
                      <div key={fuente.tipo} className={s.sidebar.item}>
                        <span className={s.sidebar.itemLabel}>
                          {getFuenteLabel(fuente.tipo)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                            {porcentaje}%
                          </span>
                          <span className={s.sidebar.itemValue}>
                            ${fuente.config.monto_aprobado.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Progreso por Paso */}
      <div className={s.sidebar.card}>
        <h3 className={s.sidebar.title}>Progreso</h3>

        <div className="space-y-3">
          {/* Paso 1 */}
          <div className={s.progress.container}>
            <div className={s.progress.label}>
              <span>Paso 1: Información</span>
              <span>{progressStep1}%</span>
            </div>
            <div className={s.progress.bar}>
              <motion.div
                className={s.progress.fill}
                initial={{ width: 0 }}
                animate={{ width: `${progressStep1}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Paso 2 */}
          <div className={s.progress.container}>
            <div className={s.progress.label}>
              <span>Paso 2: Fuentes</span>
              <span>{progressStep2}%</span>
            </div>
            <div className={s.progress.bar}>
              <motion.div
                className={s.progress.fill}
                initial={{ width: 0 }}
                animate={{ width: `${progressStep2}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
