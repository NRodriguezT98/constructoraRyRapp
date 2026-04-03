/**
 * generarReciboPDF
 *
 * Helper cliente para generar y descargar el recibo PDF de un abono.
 * Usa `@react-pdf/renderer` con import dinámico para no aumentar el
 * bundle inicial de la app.
 *
 * ⚠️ Solo se puede llamar desde código cliente (browser).
 */

import type React from 'react'

import type { DocumentProps } from '@react-pdf/renderer'

import type { AbonoParaDetalle } from '../abono-detalle-modal/useAbonoDetalle'

function formatNumeroRecibo(n: number): string {
  return `RYR-${String(n).padStart(4, '0')}`
}

export async function generarYDescargarRecibo(
  abono: AbonoParaDetalle,
  opciones?: {
    logoUrl?: string
    valorTotal?: number
    totalAbonado?: number
    saldoPendiente?: number
  }
): Promise<void> {
  // Calcular URL absoluta del logo para @react-pdf/renderer (no acepta paths relativos en browser)
  const logoUrl =
    opciones?.logoUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo1.png`
      : undefined)

  // Import dinámico para evitar SSR issues con @react-pdf/renderer
  const { pdf } = await import('@react-pdf/renderer')
  const { createElement } = await import('react')
  const { ReciboAbonoPDF } = await import('./ReciboAbonoPDF')

  const elemento = createElement(ReciboAbonoPDF, {
    abono,
    logoUrl,
    valorTotal: opciones?.valorTotal,
    totalAbonado: opciones?.totalAbonado,
    saldoPendiente: opciones?.saldoPendiente,
  })

  // El tipo FunctionComponentElement no coincide exactamente con lo que espera pdf(),
  // pero en runtime funciona correctamente (ReciboAbonoPDF devuelve un Document)
  const blob = await pdf(
    elemento as unknown as React.ReactElement<DocumentProps>
  ).toBlob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `Recibo-${formatNumeroRecibo(abono.numero_recibo)}-${abono.cliente.apellidos}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar la URL de objeto después de la descarga
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
