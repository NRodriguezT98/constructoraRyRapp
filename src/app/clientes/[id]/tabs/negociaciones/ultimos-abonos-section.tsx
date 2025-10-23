'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, DollarSign, ExternalLink, Receipt } from 'lucide-react'

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_recibo?: string
  observaciones?: string
}

interface UltimosAbonosSectionProps {
  abonos: Abono[]
  onVerTodos?: () => void
}

const METODOS_PAGO_CONFIG = {
  'Efectivo': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'Transferencia': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Cheque': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Tarjeta': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
}

export function UltimosAbonosSection({ abonos, onVerTodos }: UltimosAbonosSectionProps) {
  const abonosMostrar = abonos.slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Últimos Abonos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {abonos.length === 0
              ? 'No hay abonos registrados'
              : `${abonosMostrar.length} de ${abonos.length} abonos`}
          </p>
        </div>
        {abonos.length > 5 && onVerTodos && (
          <button
            onClick={onVerTodos}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            Ver Todos
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lista de Abonos */}
      {abonosMostrar.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aún no se han registrado abonos para esta negociación
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {abonosMostrar.map((abono) => {
            const metodoPagoClass = METODOS_PAGO_CONFIG[abono.metodo_pago as keyof typeof METODOS_PAGO_CONFIG] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'

            return (
              <div
                key={abono.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Icono */}
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${abono.monto.toLocaleString('es-CO')}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${metodoPagoClass}`}>
                      {abono.metodo_pago}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(abono.fecha_abono), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                    {abono.numero_recibo && (
                      <>
                        <span>•</span>
                        <span>Recibo #{abono.numero_recibo}</span>
                      </>
                    )}
                  </div>
                  {abono.observaciones && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {abono.observaciones}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total de Abonos */}
      {abonosMostrar.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Abonado (últimos {abonosMostrar.length})
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${abonosMostrar.reduce((sum, a) => sum + a.monto, 0).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
