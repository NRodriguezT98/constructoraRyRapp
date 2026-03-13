/**
 * ============================================
 * UTILIDAD: showToast
 * ============================================
 * Wrapper sobre sonner que utiliza el componente AppToast
 * personalizado. Usar SIEMPRE esto en lugar de toast.success() directo.
 *
 * @example
 * showToast.success('Guardado correctamente')
 * showToast.error('Error al guardar', { description: 'Intenta nuevamente' })
 */

import { createElement } from 'react'
import { toast } from 'sonner'

import { AppToast, type ToastType } from '@/shared/components/ui/AppToast'

interface ToastOptions {
  description?: string
  duration?: number
}

function show(type: ToastType, title: string, opts?: ToastOptions) {
  return toast.custom(
    (id) =>
      createElement(AppToast, {
        toastId: id,
        type,
        title,
        description: opts?.description,
      }),
    {
      duration: opts?.duration ?? (type === 'error' ? 5000 : 4000),
      // sin richColors ni estilos de sonner — el componente maneja todo
      unstyled: true,
    }
  )
}

export const showToast = {
  success: (title: string, opts?: ToastOptions) => show('success', title, opts),
  error:   (title: string, opts?: ToastOptions) => show('error',   title, opts),
  info:    (title: string, opts?: ToastOptions) => show('info',    title, opts),
  warning: (title: string, opts?: ToastOptions) => show('warning', title, opts),
}
