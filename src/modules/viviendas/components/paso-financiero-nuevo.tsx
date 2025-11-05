/**
 * PasoFinancieroNuevo - Paso 4: Información financiera
 * ✅ Diseño compacto estándar
 * ✅ Formato de moneda en inputs
 * ✅ Gastos notariales automáticos
 */

'use client'

import { cn } from '@/shared/utils/helpers'
import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, TrendingUp } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'
import type { ConfiguracionRecargo, ResumenFinanciero } from '../types'
import { formatCurrencyInput, parseCurrency } from '../utils'

interface PasoFinancieroProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  resumenFinanciero: ResumenFinanciero
  configuracionRecargos: ConfiguracionRecargo[]
}

export function PasoFinancieroNuevo({ register, errors, watch, setValue, resumenFinanciero, configuracionRecargos }: PasoFinancieroProps) {
  const valorBase = watch('valor_base') || 0
  const esEsquinera = watch('es_esquinera') || false
  const recargoEsquinera = watch('recargo_esquinera') || 0

  // Filtrar recargos de tipo esquinera
  const recargosEsquinera = configuracionRecargos.filter(r =>
    r.tipo.toLowerCase().includes('esquinera') && r.activo
  )

  // Formatear moneda para display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Título del paso */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Información Financiera
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define el valor base y recargos de la vivienda
        </p>
      </div>

      {/* Valor Base */}
      <div className={styles.field.container}>
        <label htmlFor="valor_base" className={styles.field.label}>
          Valor Base <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <DollarSign className={styles.field.inputIcon} />
          <input
            id="valor_base"
            type="text"
            value={formatCurrencyInput(valorBase?.toString() || '')}
            onChange={(e) => {
              const valor = parseCurrency(e.target.value)
              setValue('valor_base', valor)
            }}
            placeholder="$ 50.000.000"
            className={cn(
              styles.field.input,
              errors.valor_base && styles.field.inputError
            )}
          />
        </div>
        {errors.valor_base && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.valor_base.message as string}
          </motion.div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Precio base sin recargos: {formatCurrency(valorBase)}
        </p>
      </div>

      {/* Es Esquinera */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            {...register('es_esquinera')}
            id="es_esquinera"
            type="checkbox"
            className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
          />
          <label htmlFor="es_esquinera" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            ¿Es vivienda esquinera?
          </label>
        </div>

        {/* Recargo Esquinera (solo si es esquinera) */}
        {esEsquinera && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.field.container}
          >
            <label htmlFor="recargo_esquinera" className={styles.field.label}>
              Recargo por Esquinera <span className={styles.field.required}>*</span>
            </label>
            <div className={styles.field.inputWrapper}>
              <TrendingUp className={styles.field.inputIcon} />
              <select
                {...register('recargo_esquinera', { valueAsNumber: true })}
                id="recargo_esquinera"
                className={cn(
                  styles.field.input,
                  errors.recargo_esquinera && styles.field.inputError
                )}
              >
                <option value="0">Selecciona el recargo por esquinera</option>
                {recargosEsquinera.map((recargo) => (
                  <option key={recargo.id} value={recargo.valor}>
                    {recargo.nombre} - {formatCurrency(recargo.valor)}
                  </option>
                ))}
              </select>
            </div>
            {errors.recargo_esquinera && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.recargo_esquinera.message as string}
              </motion.div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recargo adicional: {formatCurrency(recargoEsquinera)}
            </p>
          </motion.div>
        )}
      </div>

      {/* Resumen Financiero */}
      <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">
            Resumen Financiero
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-orange-200 dark:border-orange-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Valor Base:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(resumenFinanciero.valor_base)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-orange-200 dark:border-orange-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">Gastos Notariales (Automático):</span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              + {formatCurrency(resumenFinanciero.gastos_notariales)}
            </span>
          </div>

          {esEsquinera && (
            <div className="flex items-center justify-between py-2 border-b border-orange-200 dark:border-orange-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recargo Esquinera:</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                + {formatCurrency(resumenFinanciero.recargo_esquinera)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <span className="text-base font-bold text-gray-900 dark:text-white">Valor Total:</span>
            <span className="text-xl font-bold bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {formatCurrency(resumenFinanciero.valor_total)}
            </span>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20 p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            ℹ️ <strong>Nota:</strong> Los gastos notariales son un recargo <strong>obligatorio</strong> que se suma automáticamente al valor base de todas las viviendas.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
