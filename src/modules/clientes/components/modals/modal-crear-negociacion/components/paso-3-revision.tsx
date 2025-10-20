/**
 * Paso 3: Revisión y Confirmación
 * Resumen de toda la información antes de crear
 */

'use client'

import type { TipoFuentePago } from '@/modules/clientes/types'
import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, Home } from 'lucide-react'
import { animations, modalStyles } from '../styles'
import type { FuentePagoConfig, ViviendaDetalle } from '../types'

interface FuenteConfiguracion {
  tipo: TipoFuentePago
  config: FuentePagoConfig
}

interface Paso3RevisionProps {
  clienteNombre?: string
  proyectoNombre: string
  vivienda?: ViviendaDetalle
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  fuentes: FuenteConfiguracion[]
}

export function Paso3Revision({
  clienteNombre,
  proyectoNombre,
  vivienda,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  fuentes,
}: Paso3RevisionProps) {
  return (
    <motion.div {...animations.step} className={modalStyles.content.fullWidth}>
      {/* Información Básica */}
      <div className={modalStyles.card.base}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <Home className="h-5 w-5 text-blue-600" />
          Información Básica
        </h3>

        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Cliente</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {clienteNombre || 'Cliente'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyecto</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {proyectoNombre}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Vivienda</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {vivienda?.manzana_nombre ? `Manzana ${vivienda.manzana_nombre} - ` : ''}Casa{' '}
              {vivienda?.numero || '—'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Valor Negociado
            </dt>
            <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              ${valorNegociado.toLocaleString('es-CO')}
            </dd>
          </div>

          {descuentoAplicado > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Descuento</dt>
              <dd className="mt-1 text-base font-semibold text-orange-600 dark:text-orange-400">
                -${descuentoAplicado.toLocaleString('es-CO')}
              </dd>
            </div>
          )}

          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</dt>
            <dd className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              ${valorTotal.toLocaleString('es-CO')}
            </dd>
          </div>

          {notas && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Notas</dt>
              <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{notas}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Fuentes de Pago Configuradas */}
      <div className={modalStyles.card.base}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Fuentes de Pago Configuradas
        </h3>

        <div className="space-y-3">
          {fuentes.map((fuente) => {
            const porcentaje = ((fuente.config.monto_aprobado / valorTotal) * 100).toFixed(1)

            return (
              <div
                key={fuente.tipo}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{fuente.tipo}</p>
                    {fuente.config.entidad && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {fuente.config.entidad}
                      </p>
                    )}
                    {fuente.config.numero_referencia && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Ref: {fuente.config.numero_referencia}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${fuente.config.monto_aprobado.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{porcentaje}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmación */}
      <div className={modalStyles.card.info}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Importante</h4>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              Al confirmar, se creará la negociación con el cierre financiero completo. La vivienda
              quedará <strong>reservada</strong> y el cliente pasará a estado{' '}
              <strong>Activo</strong>. Podrás empezar a recibir abonos inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
