'use client'

/**
 * ============================================
 * COMPONENTE: AppToast
 * ============================================
 * Toast completamente personalizado. Se usa via showToast.ts,
 * nunca directamente. Usa toast.custom() de sonner.
 *
 * Diseño: dark card, borde izquierdo de color, icono Lucide
 */

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// TIPOS
// ============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface AppToastProps {
  toastId: string | number
  type: ToastType
  title: string
  description?: string
}

// ============================================
// CONFIGURACIÓN POR TIPO
// ============================================

const CONFIG: Record<ToastType, {
  Icon: React.FC<{ className?: string }>
  iconClass: string
  barClass: string
}> = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-400',
    barClass: 'bg-emerald-500',
  },
  error: {
    Icon: XCircle,
    iconClass: 'text-red-400',
    barClass: 'bg-red-500',
  },
  info: {
    Icon: Info,
    iconClass: 'text-blue-400',
    barClass: 'bg-blue-500',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-400',
    barClass: 'bg-amber-400',
  },
}

// ============================================
// COMPONENTE
// ============================================

export function AppToast({ toastId, type, title, description }: AppToastProps) {
  const { Icon, iconClass, barClass } = CONFIG[type]

  return (
    <div
      className={`
        relative flex w-[360px] items-start gap-3 overflow-hidden
        rounded-xl border border-white/[0.07] bg-gray-950
        p-4 pr-10 shadow-[0_24px_64px_rgba(0,0,0,0.55)]
      `}
    >
      {/* Borde izquierdo de color — el indicador primario de tipo */}
      <div className={`absolute inset-y-0 left-0 w-[3px] ${barClass}`} />

      {/* Ícono */}
      <Icon className={`mt-px h-[15px] w-[15px] shrink-0 ${iconClass}`} />

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-snug text-white">
          {title}
        </p>
        {description && (
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/45">
            {description}
          </p>
        )}
      </div>

      {/* Botón cerrar */}
      <button
        onClick={() => toast.dismiss(toastId)}
        aria-label="Cerrar notificación"
        className="absolute right-2.5 top-[13px] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-white/25 transition-colors hover:bg-white/[0.08] hover:text-white/60"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
