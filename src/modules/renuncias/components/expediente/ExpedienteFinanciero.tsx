'use client'

import { CheckCircle2, ExternalLink, FileText, Percent, Receipt, Shield } from 'lucide-react'

import { formatDateTimeWithSeconds } from '@/lib/utils/date.utils'

import type { ExpedienteData } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'

import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteFinancieroProps {
  datos: ExpedienteData
}

export function ExpedienteFinanciero({ datos }: ExpedienteFinancieroProps) {
  const { resumenFinanciero, negociacion, renuncia } = datos

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

      {/* Documentos vinculados (promesas de la negociación) */}
      {(negociacion.promesa_compraventa_url || negociacion.promesa_firmada_url) ? (
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
          </div>
        </div>
      ) : null}

    </div>
  )
}
