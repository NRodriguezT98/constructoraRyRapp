/**
 * Componente: Diff de Fuentes de Pago
 * Muestra los cambios realizados entre versiones de fuentes de pago
 * ✅ Separación de responsabilidades: Usa helpers para lógica, solo renderiza
 */

'use client'

import { CheckCircle2, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { detectarCambiosFuentes, filtrarCambiosReales, formatCurrency } from '../historial-helpers'

interface DiffFuentesPagoProps {
  fuentesActuales: any[]
  fuentesAnteriores: any[]
}

export function DiffFuentesPago({ fuentesActuales, fuentesAnteriores }: DiffFuentesPagoProps) {
  // ✅ Usar helpers para lógica
  const cambios = detectarCambiosFuentes(fuentesActuales, fuentesAnteriores)
  const cambiosReales = filtrarCambiosReales(cambios)

  // Calcular total de fuentes actuales
  const totalFuentes = fuentesActuales.reduce(
    (sum, fuente) => sum + (fuente.monto_aprobado || 0),
    0
  )

  if (cambiosReales.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        No se detectaron cambios en las fuentes de pago
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-3 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
        <p className="text-xs font-bold text-purple-900 dark:text-purple-100 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Detalle de cambios realizados:
        </p>
      </div>

      {/* Lista de cambios */}
      {cambiosReales.map((cambio, index) => (
        <div
          key={index}
          className={`p-2.5 rounded-lg border text-xs ${
            cambio.tipo === 'agregada'
              ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
              : cambio.tipo === 'eliminada'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {/* Icono */}
            {cambio.tipo === 'agregada' ? (
              <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            ) : cambio.tipo === 'eliminada' ? (
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            )}

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-xs ${
                  cambio.tipo === 'agregada'
                    ? 'text-green-900 dark:text-green-100'
                    : cambio.tipo === 'eliminada'
                    ? 'text-rose-900 dark:text-rose-100'
                    : 'text-blue-900 dark:text-blue-100'
                }`}
              >
                {cambio.tipo === 'agregada' && '✅ Agregada: '}
                {cambio.tipo === 'eliminada' && '❌ Eliminada: '}
                {cambio.tipo === 'modificada' && '🔄 Modificada: '}
                {cambio.fuente.tipo}
              </p>

              {/* Detalles: Fuente agregada */}
              {cambio.tipo === 'agregada' && (
                <div className="mt-1 space-y-0.5 text-green-700 dark:text-green-300">
                  <p>• Monto: {formatCurrency(cambio.fuente.monto_aprobado || 0)}</p>
                  {cambio.fuente.entidad && <p>• Entidad: {cambio.fuente.entidad}</p>}
                </div>
              )}

              {/* Detalles: Fuente eliminada */}
              {cambio.tipo === 'eliminada' && (
                <div className="mt-1 text-rose-700 dark:text-rose-300">
                  <p>• Se eliminó: {formatCurrency(cambio.fuente.monto_aprobado || 0)}</p>
                </div>
              )}

              {/* Detalles: Fuente modificada */}
              {cambio.tipo === 'modificada' && cambio.cambiosDetectados && (
                <div className="mt-1.5 space-y-1">
                  {/* Cambio de monto */}
                  {cambio.cambiosDetectados.monto && (
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 dark:text-rose-400 line-through text-xs">
                        {formatCurrency(cambio.cambiosDetectados.monto.anterior)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold text-xs">
                        {formatCurrency(cambio.cambiosDetectados.monto.nuevo)}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          cambio.cambiosDetectados.monto.nuevo > cambio.cambiosDetectados.monto.anterior
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        (
                        {cambio.cambiosDetectados.monto.nuevo > cambio.cambiosDetectados.monto.anterior
                          ? '+'
                          : ''}
                        {formatCurrency(
                          cambio.cambiosDetectados.monto.nuevo - cambio.cambiosDetectados.monto.anterior
                        )}
                        )
                      </span>
                    </div>
                  )}

                  {/* Cambio de entidad */}
                  {cambio.cambiosDetectados.entidad && (
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      • Entidad: {cambio.cambiosDetectados.entidad.anterior || 'Sin entidad'} →{' '}
                      {cambio.cambiosDetectados.entidad.nuevo || 'Sin entidad'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Separador */}
      <div className="my-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />

      {/* Estado Final de Fuentes */}
      <div className="mt-4 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <p className="text-xs font-bold text-cyan-900 dark:text-cyan-100">
            Estado final de fuentes en esta versión:
          </p>
        </div>

        {fuentesActuales.length === 0 ? (
          <p className="text-xs text-cyan-700 dark:text-cyan-300 italic text-center py-2">
            Sin fuentes de pago activas
          </p>
        ) : (
          <div className="space-y-2">
            {fuentesActuales.map((fuente, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800 border border-cyan-200 dark:border-cyan-700"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {fuente.tipo}
                  </p>
                  {fuente.entidad && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {fuente.entidad}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    {formatCurrency(fuente.monto_aprobado || 0)}
                  </p>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="pt-2 border-t border-cyan-200 dark:border-cyan-700">
              <div className="flex items-center justify-between p-2 rounded-md bg-cyan-100 dark:bg-cyan-900/50">
                <p className="text-xs font-bold text-cyan-900 dark:text-cyan-100">
                  Total fuentes de pago:
                </p>
                <p className="text-base font-bold text-cyan-700 dark:text-cyan-300">
                  {formatCurrency(totalFuentes)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
