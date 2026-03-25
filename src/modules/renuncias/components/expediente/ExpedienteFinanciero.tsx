'use client'

import { CheckCircle2, ExternalLink, Eye, FileText, Loader2, Percent, Receipt, Shield, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { formatDateTimeWithSeconds } from '@/lib/utils/date.utils'
import { generarUrlFirmadaComprobante } from '../../services/renuncias.service'
import type { ExpedienteData } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteFinancieroProps {
  datos: ExpedienteData
}

export function ExpedienteFinanciero({ datos }: ExpedienteFinancieroProps) {
  const { resumenFinanciero, negociacion, renuncia } = datos
  const [abriendo, setAbriendo] = useState(false)
  const [urlVisor, setUrlVisor] = useState<string | null>(null)
  const [visorAbierto, setVisorAbierto] = useState(false)

  // Detectar tipo por extensión del path guardado en BD
  const esImagen = /\.(jpe?g|png|webp|gif)$/i.test(renuncia.comprobante_devolucion_url ?? '')
  const esPDF = /\.pdf$/i.test(renuncia.comprobante_devolucion_url ?? '')

  // Cerrar con Escape
  useEffect(() => {
    if (!visorAbierto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarVisor() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visorAbierto])

  const cerrarVisor = useCallback(() => {
    setVisorAbierto(false)
    setUrlVisor(null)
  }, [])

  const abrirComprobante = useCallback(async () => {
    if (!renuncia.comprobante_devolucion_url || abriendo) return
    setAbriendo(true)
    try {
      const url = await generarUrlFirmadaComprobante(renuncia.comprobante_devolucion_url)
      setUrlVisor(url)
      setVisorAbierto(true)
    } catch {
      alert('No se pudo abrir el comprobante. Intenta de nuevo.')
    } finally {
      setAbriendo(false)
    }
  }, [renuncia.comprobante_devolucion_url, abriendo])

  const metricas = [
    { label: 'Valor negociado', valor: formatCOP(resumenFinanciero.valorNegociado), bg: 'bg-blue-50 dark:bg-blue-950/20', color: 'text-blue-700 dark:text-blue-400' },
    { label: 'Total abonado', valor: formatCOP(resumenFinanciero.totalAbonado), bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Saldo pendiente', valor: formatCOP(resumenFinanciero.saldoPendiente), bg: 'bg-amber-50 dark:bg-amber-950/20', color: 'text-amber-700 dark:text-amber-400' },
    { label: 'Porcentaje pagado', valor: `${resumenFinanciero.porcentajePagado.toFixed(1)}%`, bg: 'bg-purple-50 dark:bg-purple-950/20', color: 'text-purple-700 dark:text-purple-400' },
  ]

  return (
    <div className="space-y-5">
      {/* Métricas principales */}
      <div className={styles.financiero.metricsGrid}>
        {metricas.map(({ label, valor, bg, color }) => (
          <div key={label} className={`${styles.financiero.metricCard} ${bg}`}>
            <p className={`${styles.financiero.metricValue} ${color}`}>{valor}</p>
            <p className={styles.financiero.metricLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Descuento (si aplica) */}
      {resumenFinanciero.descuento ? (
        <div className={styles.financiero.descuentoCard}>
          <p className={styles.financiero.sectionTitle}>
            <Percent className="w-4 h-4 text-amber-600" />
            Descuento aplicado
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{resumenFinanciero.descuento.tipo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Porcentaje</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{resumenFinanciero.descuento.porcentaje}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{formatCOP(resumenFinanciero.descuento.monto)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Motivo</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{resumenFinanciero.descuento.motivo || 'N/A'}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Retención (si aplica) */}
      {resumenFinanciero.retencion ? (
        <div className={styles.financiero.retencionCard}>
          <p className={styles.financiero.sectionTitle}>
            <Shield className="w-4 h-4 text-red-600" />
            Retención aplicada
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monto retenido</p>
              <p className="text-sm font-bold text-red-700 dark:text-red-400">{formatCOP(resumenFinanciero.retencion.monto)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Motivo</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{resumenFinanciero.retencion.motivo}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Monto a devolver / devuelto (destacado) */}
      {(() => {
        const esCerrada = renuncia.estado === 'Cerrada'
        const devolucionEfectuada = esCerrada && renuncia.requiere_devolucion
        return (
          <div className={devolucionEfectuada
            ? 'rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 p-5'
            : styles.financiero.devolucionCard
          }>
            <div className="flex items-center justify-between">
              <div>
                <p className={styles.financiero.sectionTitle}>
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  {devolucionEfectuada ? 'Monto devuelto' : 'Monto a devolver'}
                </p>
                <p className={styles.financiero.devolucionMonto}>{formatCOP(resumenFinanciero.montoADevolver)}</p>
              </div>
              <div className="text-right">
                {devolucionEfectuada ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Devolución efectuada
                  </span>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {renuncia.requiere_devolucion ? 'Requiere devolución' : 'Sin devolución requerida'}
                  </p>
                )}
              </div>
            </div>
            {devolucionEfectuada && (renuncia.metodo_devolucion || renuncia.numero_comprobante || renuncia.fecha_devolucion) ? (
              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {renuncia.fecha_devolucion ? (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Fecha devolución</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{formatDateTimeWithSeconds(renuncia.fecha_devolucion)}</p>
                  </div>
                ) : null}
                {renuncia.metodo_devolucion ? (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Método</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{renuncia.metodo_devolucion}</p>
                  </div>
                ) : null}
                {renuncia.numero_comprobante ? (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">N° comprobante</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{renuncia.numero_comprobante}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })()}

      {/* Documentos vinculados */}
      {(negociacion.promesa_compraventa_url || negociacion.promesa_firmada_url || renuncia.comprobante_devolucion_url) ? (
        <div>
          <p className={styles.financiero.sectionTitle}>
            <FileText className="w-4 h-4 text-gray-500" />
            Documentos vinculados
          </p>
          <div className="space-y-2 mt-2">
            {negociacion.promesa_compraventa_url ? (
              <a href={negociacion.promesa_compraventa_url} target="_blank" rel="noopener noreferrer" className={styles.financiero.docLink}>
                <ExternalLink className="w-3.5 h-3.5" />
                Promesa de compraventa
              </a>
            ) : null}
            {negociacion.promesa_firmada_url ? (
              <a href={negociacion.promesa_firmada_url} target="_blank" rel="noopener noreferrer" className={styles.financiero.docLink}>
                <ExternalLink className="w-3.5 h-3.5" />
                Promesa firmada
              </a>
            ) : null}
            {renuncia.comprobante_devolucion_url ? (
              <button
                type="button"
                onClick={abrirComprobante}
                disabled={abriendo}
                className={`${styles.financiero.docLink} disabled:opacity-60 disabled:cursor-wait`}>
                {abriendo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                Comprobante de devolución
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ── Modal visor de comprobante ── */}
      {visorAbierto && urlVisor && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col bg-black/80 backdrop-blur-sm"
            onClick={cerrarVisor}
          >
            {/* Barra superior */}
            <div
              className="flex items-center justify-between px-4 py-2 bg-gray-900/90 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Comprobante de devolución</span>
              </div>
              <button
                onClick={cerrarVisor}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div
              className="flex-1 overflow-auto flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {esPDF ? (
                <iframe
                  src={urlVisor}
                  className="w-full h-full rounded-lg"
                  style={{ minHeight: '80vh' }}
                  title="Comprobante de devolución"
                />
              ) : esImagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlVisor}
                  alt="Comprobante de devolución"
                  className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                />
              ) : (
                // Fallback: intentar con iframe por si el navegador lo puede manejar
                <iframe
                  src={urlVisor}
                  className="w-full rounded-lg"
                  style={{ minHeight: '80vh' }}
                  title="Comprobante de devolución"
                />
              )}
            </div>

            {/* Hint ESC */}
            <p className="text-center text-xs text-gray-500 pb-2 shrink-0">
              Presiona <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">ESC</kbd> o haz clic fuera para cerrar
            </p>
          </div>,
          document.body,
        )
      }
    </div>
  )
}
