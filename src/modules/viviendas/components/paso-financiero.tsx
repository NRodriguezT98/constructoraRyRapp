'use client'

import { DollarSign } from 'lucide-react'

import { LABELS, OPCIONES_RECARGO, PLACEHOLDERS } from '../constants'
import { fieldClasses, financieroClasses, sectionClasses } from '../styles/vivienda-form.styles'
import type { ConfiguracionRecargo, ResumenFinanciero } from '../types'
import { formatCurrencyInput, parseCurrency } from '../utils'

import { ResumenFinancieroCard } from './resumen-financiero-card'

interface PasoFinancieroProps {
  valorBase: number | undefined
  esEsquinera: boolean
  recargoEsquinera: number
  resumen: ResumenFinanciero
  configuracionRecargos: ConfiguracionRecargo[]
  errores: Record<string, string>
  onChange: (campo: string, valor: any) => void
  onToggleEsquinera: (checked: boolean) => void
}

/**
 * Paso 4: Información Financiera
 * Valor base, toggle esquinera, select de recargo y resumen en vivo
 */
export function PasoFinanciero({
  valorBase,
  esEsquinera,
  recargoEsquinera,
  resumen,
  configuracionRecargos,
  errores,
  onChange,
  onToggleEsquinera,
}: PasoFinancieroProps) {
  // Filtrar solo recargos de tipo esquinera
  const recargosEsquinera = configuracionRecargos.filter((r) =>
    r.tipo.includes('esquinera')
  )

  // Si no hay configuración cargada, usar valores por defecto
  const opcionesRecargo = recargosEsquinera.length > 0
    ? recargosEsquinera.map((r) => ({
        label: r.nombre,
        value: r.valor,
        tipo: r.tipo,
      }))
    : OPCIONES_RECARGO

  return (
    <div className={sectionClasses.container}>
      <div className={sectionClasses.card}>
        <div className={sectionClasses.header}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className={sectionClasses.title}>Información Financiera</h2>
              <p className={sectionClasses.subtitle}>
                Define el valor base y recargos aplicables
              </p>
            </div>
          </div>
        </div>

        <div className={financieroClasses.container}>
          {/* Valor Base */}
          <div className={financieroClasses.valorBaseGroup.container}>
            <label htmlFor="valor_base" className={fieldClasses.label}>
              💵 {LABELS.VALOR_BASE}
              <span className={fieldClasses.required}>*</span>
            </label>
            <div className={financieroClasses.valorBaseGroup.inputWrapper}>
              <span className={financieroClasses.valorBaseGroup.prefix}>$</span>
              <input
                id="valor_base"
                type="text"
                value={formatCurrencyInput(valorBase?.toString() || '')}
                onChange={(e) => {
                  const valor = parseCurrency(e.target.value)
                  onChange('valor_base', valor)
                }}
                placeholder={PLACEHOLDERS.VALOR}
                className={`${financieroClasses.valorBaseGroup.input} ${errores.valor_base ? fieldClasses.input.error : ''}`}
              />
            </div>
            {errores.valor_base && (
              <p className={fieldClasses.error}>{errores.valor_base}</p>
            )}
            <p className={fieldClasses.hint}>
              Escribe el valor base de la vivienda sin recargos
            </p>
          </div>

          {/* Toggle Casa Esquinera */}
          <div className={financieroClasses.toggleGroup.container}>
            <label htmlFor="es_esquinera" className={financieroClasses.toggleGroup.label}>
              🏠 {LABELS.CASA_ESQUINERA}
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={esEsquinera}
              onClick={() => onToggleEsquinera(!esEsquinera)}
              className={`${financieroClasses.toggleGroup.toggle} ${
                esEsquinera
                  ? financieroClasses.toggleGroup.toggleActive
                  : financieroClasses.toggleGroup.toggleInactive
              }`}
            >
              <span
                className={`${financieroClasses.toggleGroup.toggleButton} ${
                  esEsquinera
                    ? financieroClasses.toggleGroup.toggleButtonActive
                    : financieroClasses.toggleGroup.toggleButtonInactive
                }`}
              />
            </button>
          </div>

          {/* Select de Recargo (solo si toggle activo) */}
          {esEsquinera && (
            <div className={financieroClasses.selectRecargo.container}>
              <label htmlFor="recargo_esquinera" className={fieldClasses.label}>
                💰 {LABELS.SELECCIONAR_RECARGO}
                <span className={fieldClasses.required}>*</span>
              </label>
              <select
                id="recargo_esquinera"
                value={recargoEsquinera}
                onChange={(e) => onChange('recargo_esquinera', parseInt(e.target.value))}
                className={`${financieroClasses.selectRecargo.select} ${errores.recargo_esquinera ? fieldClasses.select.error : ''}`}
              >
                <option value="0">{PLACEHOLDERS.RECARGO}</option>
                {opcionesRecargo.map((opcion) => (
                  <option key={opcion.tipo} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              {errores.recargo_esquinera && (
                <p className={fieldClasses.error}>{errores.recargo_esquinera}</p>
              )}
            </div>
          )}

          {/* Resumen Financiero EN VIVO */}
          <div className="mt-8">
            <ResumenFinancieroCard resumen={resumen} mostrarDesglose={true} />
          </div>

          {/* Nota informativa */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ℹ️ <strong>Nota:</strong> Los gastos notariales son un recargo{' '}
              <strong>obligatorio</strong> que se suma automáticamente al valor base de
              todas las viviendas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
