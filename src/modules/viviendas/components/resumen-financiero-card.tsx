'use client'

import { resumenClasses } from '../styles/vivienda-form.styles'
import type { ResumenFinanciero } from '../types'
import { formatCurrency } from '../utils'

interface ResumenFinancieroCardProps {
  resumen: ResumenFinanciero
  mostrarDesglose?: boolean
}

/**
 * Card de resumen financiero reutilizable
 * Muestra el desglose de costos y valor total de la vivienda
 */
export function ResumenFinancieroCard({
  resumen,
  mostrarDesglose = true,
}: ResumenFinancieroCardProps) {
  return (
    <div className={resumenClasses.card}>
      <h3 className={resumenClasses.title}>Resumen Financiero</h3>

      <div className={resumenClasses.list}>
        {/* Valor Base */}
        <div className={resumenClasses.item.container}>
          <span className={resumenClasses.item.label}>Valor Base Vivienda:</span>
          <span className={resumenClasses.item.value}>
            {formatCurrency(resumen.valor_base)}
          </span>
        </div>

        {/* Gastos Notariales */}
        {mostrarDesglose && (
          <>
            <div className={resumenClasses.item.container}>
              <span className={resumenClasses.item.label}>
                Gastos Notariales
                <br />
                <span className="text-xs text-gray-500">(Recargo Obligatorio)</span>
              </span>
              <span className={resumenClasses.item.value}>
                {formatCurrency(resumen.gastos_notariales)}
              </span>
            </div>

            {/* Recargo Esquinera (si aplica) */}
            {resumen.recargo_esquinera > 0 && (
              <div className={resumenClasses.item.container}>
                <span className={resumenClasses.item.label}>
                  Recargo por Casa Esquinera:
                </span>
                <span className={resumenClasses.item.valueHighlight}>
                  {formatCurrency(resumen.recargo_esquinera)}
                </span>
              </div>
            )}

            <div className={resumenClasses.divider} />
          </>
        )}

        {/* Valor Total */}
        <div className={resumenClasses.total.container}>
          <span className={resumenClasses.total.label}>Valor Total de la Vivienda</span>
          <span className={resumenClasses.total.value}>
            {formatCurrency(resumen.valor_total)}
          </span>
        </div>
      </div>
    </div>
  )
}
