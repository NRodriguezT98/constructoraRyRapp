'use client'

import { ArrowRightLeft, Banknote, Check, FileCheck, Info } from 'lucide-react'

import type { MetodoPago, ModoRegistro } from '../../types'
import { METODO_PAGO_GRADIENTE, type ColorScheme } from './ModalRegistroPago.styles'

interface MetodosPagoProps {
  modo: ModoRegistro
  metodosDisponibles: MetodoPago[]
  metodoPago: MetodoPago | null
  onMetodoChange: (metodo: MetodoPago) => void
  colorScheme: ColorScheme
}

const METODO_CONFIG: Record<MetodoPago, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  Efectivo: { label: 'Efectivo', Icon: Banknote },
  Transferencia: { label: 'Transferencia', Icon: ArrowRightLeft },
  Cheque: { label: 'Cheque', Icon: FileCheck },
  Consignación: { label: 'Consignación', Icon: ArrowRightLeft },
  PSE: { label: 'PSE', Icon: ArrowRightLeft },
  'Tarjeta de Crédito': { label: 'Tarjeta Crédito', Icon: ArrowRightLeft },
  'Tarjeta de Débito': { label: 'Tarjeta Débito', Icon: ArrowRightLeft },
}

export function MetodosPago({
  modo,
  metodosDisponibles,
  metodoPago,
  onMetodoChange,
}: MetodosPagoProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Método de pago <span className="text-red-500">*</span>
      </p>

      <div className="grid grid-cols-3 gap-2">
        {metodosDisponibles.map((metodo) => {
          const config = METODO_CONFIG[metodo]
          if (!config) return null
          const { label, Icon } = config
          const seleccionado = metodoPago === metodo
          const gradiente = METODO_PAGO_GRADIENTE[metodo] ?? 'from-gray-500 to-gray-600'

          return (
            <button
              key={metodo}
              type="button"
              onClick={() => onMetodoChange(metodo)}
              className={`relative p-3 rounded-xl border-2 transition-all ${
                seleccionado
                  ? `bg-gradient-to-br ${gradiente} border-transparent text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {seleccionado ? (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-white" />
                </span>
              ) : null}
              <Icon className={`w-5 h-5 mx-auto mb-1 ${seleccionado ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              <p className={`text-xs font-semibold text-center leading-tight ${seleccionado ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
              </p>
            </button>
          )
        })}
      </div>

      {modo === 'desembolso' ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          Los desembolsos bancarios no admiten pagos en efectivo
        </p>
      ) : null}
    </div>
  )
}
