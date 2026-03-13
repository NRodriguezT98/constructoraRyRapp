/**
 * ============================================
 * COMPONENTE: DesgloseViviendaSection
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Sección que muestra el desglose financiero de la vivienda
 *
 * Features:
 * - Valor base de la vivienda
 * - Gastos notariales
 * - Recargos aplicables (esquinera, altura, otros)
 * - Descuentos aplicados
 * - Total final calculado
 *
 * @version 1.0.0 - 2025-12-04
 */

'use client'

import { Calculator, FileText, Home, Minus, Plus, TrendingUp } from 'lucide-react'

// ============================================
// TYPES
// ============================================

interface DesgloseItem {
  concepto: string
  monto: number
  tipo: 'base' | 'suma' | 'resta'
  descripcion?: string
}

interface DesgloseViviendaSectionProps {
  valorBase: number
  gastosNotariales?: number
  esquinera?: number
  altura?: number
  otrosRecargos?: number
  descuentoAplicado?: number
  viviendaNumero?: string
  viviendaManzana?: string
  loading?: boolean
}

// ============================================
// COMPONENTE
// ============================================

export function DesgloseViviendaSection({
  valorBase,
  gastosNotariales = 0,
  esquinera = 0,
  altura = 0,
  otrosRecargos = 0,
  descuentoAplicado = 0,
  viviendaNumero,
  viviendaManzana,
  loading = false,
}: DesgloseViviendaSectionProps) {
  // Calcular total final
  const totalRecargos = gastosNotariales + esquinera + altura + otrosRecargos
  const valorFinal = valorBase + totalRecargos - descuentoAplicado

  // Construir items de desglose
  const items: DesgloseItem[] = []

  // Siempre mostrar valor base
  items.push({
    concepto: 'Valor Base Vivienda',
    monto: valorBase,
    tipo: 'base',
    descripcion: viviendaNumero && viviendaManzana
      ? `Vivienda ${viviendaNumero} - Manzana ${viviendaManzana}`
      : 'Valor inicial de la vivienda',
  })

  // Agregar gastos notariales si existen
  if (gastosNotariales > 0) {
    items.push({
      concepto: 'Gastos Notariales',
      monto: gastosNotariales,
      tipo: 'suma',
      descripcion: 'Escrituración y registro',
    })
  }

  // Agregar recargo esquinera si existe
  if (esquinera > 0) {
    items.push({
      concepto: 'Recargo Esquinera',
      monto: esquinera,
      tipo: 'suma',
      descripcion: 'Ubicación privilegiada',
    })
  }

  // Agregar otros recargos
  if (altura > 0) {
    items.push({
      concepto: 'Recargo por Altura',
      monto: altura,
      tipo: 'suma',
      descripcion: 'Pisos superiores',
    })
  }

  if (otrosRecargos > 0) {
    items.push({
      concepto: 'Otros Recargos',
      monto: otrosRecargos,
      tipo: 'suma',
    })
  }

  // Agregar descuento
  if (descuentoAplicado > 0) {
    items.push({
      concepto: 'Descuento Aplicado',
      monto: descuentoAplicado,
      tipo: 'resta',
      descripcion: 'Promoción o negociación',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Cargando desglose...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-white" />
          <h3 className="text-base font-bold text-white">
            Desglose de Vivienda
          </h3>
        </div>
      </div>

      {/* Desglose Items */}
      <div className="p-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={`
              p-3 rounded-lg border transition-all
              ${
                item.tipo === 'base'
                  ? 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800'
                  : item.tipo === 'suma'
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Icono y concepto */}
              <div className="flex items-start gap-2 flex-1">
                {item.tipo === 'base' ? (
                  <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                ) : item.tipo === 'suma' ? (
                  <Plus className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={`
                      text-sm font-semibold
                      ${
                        item.tipo === 'base'
                          ? 'text-cyan-900 dark:text-cyan-100'
                          : item.tipo === 'suma'
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-rose-900 dark:text-rose-100'
                      }
                    `}
                  >
                    {item.tipo === 'resta' && '- '}
                    {item.concepto}
                  </p>
                  {item.descripcion && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {item.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Monto */}
              <div className="text-right">
                <p
                  className={`
                    text-base font-bold tabular-nums
                    ${
                      item.tipo === 'base'
                        ? 'text-cyan-700 dark:text-cyan-300'
                        : item.tipo === 'suma'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-rose-700 dark:text-rose-300'
                    }
                  `}
                >
                  ${item.monto.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Total Final */}
        <div className="mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white" />
                <p className="text-sm font-bold text-white">
                  VALOR FINAL
                </p>
              </div>
              <p className="text-2xl font-bold text-white tabular-nums">
                ${valorFinal.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Detalle del cálculo */}
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>
                  {descuentoAplicado > 0
                    ? 'Base + Notariales + Recargos - Descuentos'
                    : 'Base + Notariales + Recargos'
                  }
                </span>
                <span className="font-mono">
                  ${valorBase.toLocaleString('es-CO')}
                  {gastosNotariales > 0 && ` + $${gastosNotariales.toLocaleString('es-CO')}`}
                  {(esquinera + altura + otrosRecargos) > 0 && ` + $${(esquinera + altura + otrosRecargos).toLocaleString('es-CO')}`}
                  {descuentoAplicado > 0 && ` - $${descuentoAplicado.toLocaleString('es-CO')}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Este desglose refleja el valor total de la negociación incluyendo todos los conceptos aplicables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
