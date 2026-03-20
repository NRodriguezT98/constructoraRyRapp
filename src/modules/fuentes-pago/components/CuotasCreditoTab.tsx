/**
 * CuotasCreditoTab
 *
 * Orquestador de la pestaña de cuotas para un crédito con la constructora.
 * El plan es un calendario de referencia — los pagos se registran como abonos
 * normales y el estado se computa desde la vista SQL.
 */

'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useCuotasCredito } from '../hooks/useCuotasCredito'
import { ConfigurarPlanCredito } from './ConfigurarPlanCredito'
import { PanelResumenCredito } from './PanelResumenCredito'
import { ReestructurarCreditoModal } from './ReestructurarCreditoModal'
import { TablaAmortizacion } from './TablaAmortizacion'

interface CuotasCreditoTabProps {
  fuentePagoId: string
  negociacionId: string
  /** Pre-fills the capital field in the "Configurar plan" form */
  montoFuente?: number
  onPagoCuotaRegistrado?: () => void
  /**
   * Modo lectura: oculta "Configurar plan" y "Reestructurar".
   * Usar en Abonos (solo informar). Quitar en Cierre Financiero / Negociación.
   */
  readonly?: boolean
}

export function CuotasCreditoTab({
  fuentePagoId,
  negociacionId,
  montoFuente,
  readonly = false,
}: CuotasCreditoTabProps) {
  const {
    credito, periodos, resumen, cargando, procesando, error, recargar,
    reestructurar, crearPlan,
    proximaCuota, progresoCredito,
  } = useCuotasCredito({ fuentePagoId, negociacionId })

  const [mostrarReestructurar, setMostrarReestructurar] = useState(false)

  // Capital pendiente real: capital original - capital efectivamente aplicado (desde períodos)
  const capitalPendienteReal = useMemo(() => {
    if (!credito || periodos.length === 0) return 0
    const capitalAplicado = periodos.reduce((s, p) => s + (p.capital_aplicado ?? 0), 0)
    return Math.max(0, Math.round(credito.capital - capitalAplicado))
  }, [credito, periodos])

  // Cuotas no cubiertas: Atrasado + En curso + Futuro
  const cuotasNoCubiertas = useMemo(() => {
    return periodos.filter(p => p.estado_periodo !== 'Cubierto').length
  }, [periodos])

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Cargando cuotas...</span>
      </div>
    )
  }

  if (!credito || periodos.length === 0) {
    if (readonly) {
      return (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 p-6 text-center dark:border-indigo-700/50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan de cuotas no configurado</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ve al detalle de la negociación para configurar el plan de pagos.
          </p>
        </div>
      )
    }
    return (
      <ConfigurarPlanCredito
        montoAprobado={montoFuente}
        crearPlan={crearPlan}
        procesando={procesando}
        error={error}
        onPlanCreado={recargar}
      />
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PanelResumenCredito
        credito={credito}
        resumen={resumen!}
        proximaCuota={proximaCuota}
        progresoCredito={progresoCredito}
        procesando={procesando}
        onReestructurar={readonly ? undefined : () => setMostrarReestructurar(true)}
      />

      <TablaAmortizacion periodos={periodos} />

      {!readonly && mostrarReestructurar && credito ? (
        <ReestructurarCreditoModal
          fuentePagoId={fuentePagoId}
          creditoActual={credito}
          capitalPendiente={capitalPendienteReal}
          cuotasPendientes={cuotasNoCubiertas}
          procesando={procesando}
          onConfirmar={async (params) => {
            const ok = await reestructurar(params)
            if (ok) {
              setMostrarReestructurar(false)
              await recargar()
            }
          }}
          onCerrar={() => setMostrarReestructurar(false)}
        />
      ) : null}
    </div>
  )
}
