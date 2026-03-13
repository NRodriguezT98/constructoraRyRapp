/**
 * 🔘 COMPONENTE: BOTÓN DE REGISTRAR DESEMBOLSO CON TOOLTIP
 *
 * Botón inteligente que:
 * - Cambia texto según tipo (Abono vs Desembolso)
 * - Se deshabilita si falta completar paso del proceso
 * - Muestra tooltip explicativo cuando está deshabilitado
 */

'use client'

import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useValidacionBotonDesembolso } from '../hooks/useValidacionBotonDesembolso'
import type { TipoFuentePago } from '../types'

interface BotonRegistrarDesembolsoProps {
  fuenteId: string
  tipoFuente: TipoFuentePago
  fuenteCompletada: boolean
  onClick: () => void
  className?: string
  colorScheme?: {
    from: string
    to: string
  }
}

export function BotonRegistrarDesembolso({
  fuenteId,
  tipoFuente,
  fuenteCompletada,
  onClick,
  className = '',
  colorScheme = {
    from: 'rgb(59, 130, 246)',
    to: 'rgb(37, 99, 235)',
  },
}: BotonRegistrarDesembolsoProps) {
  const { habilitado, texto, tooltipMensaje, cargando } = useValidacionBotonDesembolso({
    fuenteId,
    tipoFuente,
    fuenteCompletada,
  })

  // Si la fuente está completada, mostrar badge
  if (fuenteCompletada) {
    return (
      <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          ✓ Completada
        </span>
      </div>
    )
  }

  // Si está cargando
  if (cargando) {
    return (
      <Button disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Verificando...
      </Button>
    )
  }

  // Botón habilitado (sin tooltip)
  if (habilitado) {
    return (
      <Button
        onClick={onClick}
        className={className}
        style={{
          background: `linear-gradient(to right, ${colorScheme.from}, ${colorScheme.to})`,
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        {texto}
      </Button>
    )
  }

  // Botón deshabilitado con tooltip
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              disabled
              className={`${className} cursor-not-allowed opacity-60`}
              style={{
                background: `linear-gradient(to right, ${colorScheme.from}, ${colorScheme.to})`,
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {texto}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-gray-900 text-white p-3 rounded-lg shadow-xl"
        >
          <div className="space-y-2">
            <p className="text-sm font-medium">⚠️ Paso del Proceso Requerido</p>
            <p className="text-xs text-gray-300 leading-relaxed">{tooltipMensaje}</p>
            <p className="text-xs text-blue-300 font-medium mt-2">
              💡 Complete el paso en el Proceso de Compra del cliente
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
