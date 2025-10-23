'use client'

import { CreditCard, DollarSign, Edit, Plus, Wallet } from 'lucide-react'

interface FuentePago {
  tipo: 'Cuota Inicial' | 'Crédito Bancario' | 'Subsidio' | 'Otros'
  monto: number
  detalles?: string
  entidad?: string // Banco o entidad financiera
  numero_referencia?: string // Número de crédito o referencia
  monto_recibido?: number // Para validar si se puede editar
}

interface FuentesPagoSectionProps {
  fuentesPago: FuentePago[]
  valorTotal: number
  negociacionEstado?: string // Para validar si se puede editar
  onEditar?: () => void
}

const TIPOS_CONFIG = {
  'Cuota Inicial': {
    icon: Wallet,
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700',
  },
  'Crédito Bancario': {
    icon: CreditCard,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700',
  },
  'Subsidio': {
    icon: DollarSign,
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-700',
  },
  'Otros': {
    icon: Wallet,
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-600',
  },
}

export function FuentesPagoSection({ fuentesPago, valorTotal, negociacionEstado = 'Activa', onEditar }: FuentesPagoSectionProps) {
  const totalFuentes = fuentesPago.reduce((sum, f) => sum + f.monto, 0)
  const porcentajeCubierto = valorTotal > 0 ? (totalFuentes / valorTotal) * 100 : 0

  // 🔒 VALIDACIÓN: Solo se puede editar si la negociación está Activa
  // y NO todas las fuentes han sido completadas
  const puedeEditar = negociacionEstado === 'Activa'

  const tooltipEditar = !puedeEditar
    ? 'No se pueden editar fuentes de pago en negociaciones cerradas o suspendidas'
    : 'Editar fuentes de pago configuradas'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Fuentes de Pago
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {porcentajeCubierto.toFixed(0)}% del valor total configurado
          </p>
        </div>
        {onEditar && (
          <button
            onClick={onEditar}
            disabled={!puedeEditar}
            title={tooltipEditar}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm hover:shadow-md ${
              puedeEditar
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {/* Lista de Fuentes */}
      {fuentesPago.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            No hay fuentes de pago configuradas
          </p>
          {onEditar && (
            <button
              onClick={onEditar}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Configurar Fuentes
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fuentesPago.map((fuente, index) => {
            const config = TIPOS_CONFIG[fuente.tipo] || TIPOS_CONFIG['Otros']
            const IconoFuente = config.icon
            const porcentaje = valorTotal > 0 ? (fuente.monto / valorTotal) * 100 : 0

            return (
              <div
                key={index}
                className={`${config.bg} ${config.border} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${config.bg} p-2 rounded-lg`}>
                    <IconoFuente className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${config.text} mb-1`}>
                      {fuente.tipo}
                    </h4>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      ${fuente.monto.toLocaleString('es-CO')}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-white dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${config.bg.replace('100', '500').replace('900/30', '500')} transition-all`}
                          style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {porcentaje.toFixed(0)}%
                      </span>
                    </div>

                    {/* 🏦 MOSTRAR BANCO Y REFERENCIA */}
                    {fuente.entidad && (
                      <div className="mb-1.5">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          🏦 {fuente.entidad}
                        </span>
                      </div>
                    )}
                    {fuente.numero_referencia && (
                      <div className="mb-1.5">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Ref: {fuente.numero_referencia}
                        </span>
                      </div>
                    )}

                    {/* Detalles adicionales */}
                    {fuente.detalles && !fuente.entidad && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {fuente.detalles}
                      </p>
                    )}

                    {/* 🔒 Indicador si está completada */}
                    {fuente.monto_recibido && fuente.monto_recibido >= fuente.monto && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                        <DollarSign className="w-3 h-3" />
                        Completada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total */}
      {fuentesPago.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Configurado
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
