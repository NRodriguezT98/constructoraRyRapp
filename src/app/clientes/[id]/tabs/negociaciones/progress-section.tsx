'use client'

import { DollarSign, TrendingUp } from 'lucide-react'

interface ProgressSectionProps {
  valorNegociado: number
  descuento: number
  totalAbonado: number
  totalFuentesPago: number
}

export function ProgressSection({
  valorNegociado,
  descuento,
  totalAbonado,
  totalFuentesPago,
}: ProgressSectionProps) {
  const valorFinal = valorNegociado - descuento
  const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0
  const porcentajeFuentes = valorFinal > 0 ? (totalFuentesPago / valorFinal) * 100 : 0

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-xl p-6 border-2 border-purple-100 dark:border-gray-700 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Progreso de Pago
        </h3>
      </div>

      {/* Grid de Valores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {/* Valor Base */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Valor Base</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${valorNegociado.toLocaleString('es-CO')}
          </p>
        </div>

        {/* Descuento */}
        {descuento > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Descuento</span>
            </div>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              -${descuento.toLocaleString('es-CO')}
            </p>
          </div>
        )}

        {/* Valor Final */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Valor Final</span>
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            ${valorFinal.toLocaleString('es-CO')}
          </p>
        </div>

        {/* Total Abonado */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Total Abonado</span>
          </div>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
            ${totalAbonado.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Barra de Progreso - Abonos */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progreso de Abonos
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {porcentajePagado.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
          />
        </div>
      </div>

      {/* Barra de Progreso - Fuentes de Pago */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fuentes de Pago Configuradas
          </span>
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {porcentajeFuentes.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(porcentajeFuentes, 100)}%` }}
          />
        </div>
      </div>

      {/* Saldo Pendiente */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Saldo Pendiente
          </span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${(valorFinal - totalAbonado).toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}
