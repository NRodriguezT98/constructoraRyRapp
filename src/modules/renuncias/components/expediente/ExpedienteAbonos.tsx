'use client'

import { ChevronDown, ChevronUp, ExternalLink, Receipt, XCircle } from 'lucide-react'
import { useState } from 'react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { AbonoExpediente } from '../../types'
import { formatCOP } from '../../utils/renuncias.utils'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteAbonosProps {
  abonos: AbonoExpediente[]
}

export function ExpedienteAbonos({ abonos }: ExpedienteAbonosProps) {
  const [mostrarAnulados, setMostrarAnulados] = useState(false)

  if (abonos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 dark:text-gray-500">
        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay abonos registrados para esta negociación</p>
      </div>
    )
  }

  const activos = abonos.filter(a => a.estado === 'Activo')
  const anulados = abonos.filter(a => a.estado !== 'Activo')
  const totalActivos = activos.reduce((sum, a) => sum + a.monto, 0)

  return (
    <div className="space-y-4">
      {/* Resumen arriba */}
      <div className={styles.abonos.resumen}>
        <div className={styles.abonos.resumenGrid}>
          <div className={styles.abonos.resumenItem}>
            <p className={styles.abonos.resumenValue}>{activos.length}</p>
            <p className={styles.abonos.resumenLabel}>Abonos activos</p>
          </div>
          <div className={styles.abonos.resumenItem}>
            <p className={`${styles.abonos.resumenValue} text-emerald-700 dark:text-emerald-400`}>{formatCOP(totalActivos)}</p>
            <p className={styles.abonos.resumenLabel}>Total abonado</p>
          </div>
          <div className={styles.abonos.resumenItem}>
            <p className={styles.abonos.resumenValue}>{anulados.length}</p>
            <p className={styles.abonos.resumenLabel}>Anulados</p>
          </div>
          <div className={styles.abonos.resumenItem}>
            <p className={styles.abonos.resumenValue}>{abonos.length}</p>
            <p className={styles.abonos.resumenLabel}>Total registros</p>
          </div>
        </div>
      </div>

      {/* Abonos activos — siempre visibles */}
      {activos.length > 0 ? (
        <>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Abonos activos durante la negociación
          </p>
          <AbonosTable abonos={activos} />
          <AbonosMobile abonos={activos} />
        </>
      ) : (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No hubo abonos activos en esta negociación</p>
        </div>
      )}

      {/* Abonos anulados — colapsable */}
      {anulados.length > 0 ? (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <button
            type="button"
            onClick={() => setMostrarAnulados(!mostrarAnulados)}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            {anulados.length} abono{anulados.length !== 1 ? 's' : ''} anulado{anulados.length !== 1 ? 's' : ''}
            {mostrarAnulados ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {mostrarAnulados ? (
            <div className="mt-3 opacity-60">
              <AbonosTable abonos={anulados} />
              <AbonosMobile abonos={anulados} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

// ==========================================
// SUB-COMPONENTES INTERNOS
// ==========================================

function AbonosTable({ abonos }: { abonos: AbonoExpediente[] }) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className={styles.abonos.table}>
        <thead className={styles.abonos.thead}>
          <tr>
            <th className={styles.abonos.th}>#</th>
            <th className={styles.abonos.th}>Fecha</th>
            <th className={styles.abonos.th}>Fuente</th>
            <th className={styles.abonos.th}>Monto</th>
            <th className={styles.abonos.th}>Método</th>
            <th className={styles.abonos.th}>Referencia</th>
            <th className={styles.abonos.th}>Estado</th>
            <th className={styles.abonos.th}></th>
          </tr>
        </thead>
        <tbody className={styles.abonos.tbody}>
          {abonos.map((abono) => (
            <tr key={abono.id} className={styles.abonos.tr}>
              <td className={styles.abonos.td}>{abono.numero_recibo ?? '—'}</td>
              <td className={styles.abonos.td}>{formatDateCompact(abono.fecha_abono)}</td>
              <td className={styles.abonos.td}>{abono.fuente_tipo}</td>
              <td className={styles.abonos.tdBold}>{formatCOP(abono.monto)}</td>
              <td className={styles.abonos.td}>{abono.metodo_pago ?? '—'}</td>
              <td className={styles.abonos.td}>{abono.numero_referencia ?? '—'}</td>
              <td className={styles.abonos.td}>
                <span className={abono.estado === 'Activo' ? styles.abonos.badgeActivo : styles.abonos.badgeAnulado}>
                  {abono.estado === 'Activo' ? 'Válido' : abono.estado}
                </span>
              </td>
              <td className={styles.abonos.td}>
                {abono.comprobante_url ? (
                  <a href={abono.comprobante_url} target="_blank" rel="noopener noreferrer" className={styles.abonos.comprobante}>
                    <ExternalLink className="w-3 h-3" />
                    Ver
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AbonosMobile({ abonos }: { abonos: AbonoExpediente[] }) {
  return (
    <div className="sm:hidden space-y-2">
      {abonos.map((abono) => (
        <div key={abono.id} className={styles.abonos.mobileCard}>
          <div className={styles.abonos.mobileRow}>
            <span className="text-xs text-gray-500">
              #{abono.numero_recibo ?? '—'} • {formatDateCompact(abono.fecha_abono)}
            </span>
            <span className={abono.estado === 'Activo' ? styles.abonos.badgeActivo : styles.abonos.badgeAnulado}>
              {abono.estado === 'Activo' ? 'Válido' : abono.estado}
            </span>
          </div>
          <div className={styles.abonos.mobileRow}>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCOP(abono.monto)}</span>
            <span className="text-xs text-gray-500">{abono.fuente_tipo}</span>
          </div>
          {abono.metodo_pago ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">{abono.metodo_pago} {abono.numero_referencia ? `• ${abono.numero_referencia}` : ''}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
