'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO (REFACTORIZADO 2025-11-27)
 * UltimosAbonosSection - 100% Separación de Responsabilidades
 *
 * CAMBIOS:
 * - ✅ Lógica movida a useUltimosAbonosSection hook
 * - ✅ Estilos centralizados en ultimos-abonos-section.styles.ts
 * - ✅ Diseño compact (p-6 → p-3, gap-2.5 → gap-2)
 * - ✅ Paleta rosa/púrpura/índigo (negociaciones)
 * - ✅ Glassmorphism aplicado
 * - ✅ formatDateCompact en lugar de formatDistanceToNow
 */

import { Calendar, DollarSign, ExternalLink, Receipt } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { useUltimosAbonosSection } from '@/modules/clientes/hooks/useUltimosAbonosSection'

import {
    getBadgeMetodoClassName,
    ultimosAbonosSectionStyles as styles,
} from './ultimos-abonos-section.styles'

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_recibo?: string
  observaciones?: string
}

interface UltimosAbonosSectionProps {
  abonos: Abono[]
  onVerTodos?: () => void
}

export function UltimosAbonosSection({ abonos, onVerTodos }: UltimosAbonosSectionProps) {
  // ✅ Hook con TODA la lógica
  const {
    abonosMostrar,
    totalMostrados,
    hayMasAbonos,
    subtitulo,
    tieneAbonos,
  } = useUltimosAbonosSection({ abonos, limite: 5 })

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <div className={styles.header.left}>
          <h3 className={styles.header.title}>
            <Receipt className={styles.header.titleIcon} />
            Últimos Abonos
          </h3>
          <p className={styles.header.subtitle}>{subtitulo}</p>
        </div>
        {onVerTodos ? (
          <button onClick={onVerTodos} className={styles.header.button}>
            {hayMasAbonos ? 'Ver en Módulo Abonos' : 'Ir a Módulo Abonos'}
            <ExternalLink className={styles.header.buttonIcon} />
          </button>
        ) : null}
      </div>

      {/* Lista de Abonos */}
      {!tieneAbonos ? (
        <div className={styles.empty.container}>
          <DollarSign className={styles.empty.icon} />
          <p className={styles.empty.text}>
            Aún no se han registrado abonos para esta negociación
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 Usa el botón <strong className="text-emerald-600 dark:text-emerald-400">"Registrar Abono"</strong> arriba para comenzar
          </p>
        </div>
      ) : (
        <div className={styles.lista}>
          {abonosMostrar.map((abono) => (
            <div key={abono.id} className={styles.item.container}>
              {/* Icono */}
              <div className={styles.item.iconContainer}>
                <DollarSign className={styles.item.icon} />
              </div>

              {/* Contenido */}
              <div className={styles.item.content}>
                <div className={styles.item.header}>
                  <p className={styles.item.monto}>
                    ${abono.monto.toLocaleString('es-CO')}
                  </p>
                  <span className={getBadgeMetodoClassName(abono.metodo_pago)}>
                    {abono.metodo_pago}
                  </span>
                </div>
                <div className={styles.item.footer}>
                  <Calendar className={styles.item.footerIcon} />
                  <span>{formatDateCompact(abono.fecha_abono)}</span>
                  {abono.numero_recibo ? (
                    <>
                      <span>•</span>
                      <span>Recibo #{abono.numero_recibo}</span>
                    </>
                  ) : null}
                </div>
                {abono.observaciones ? (
                  <p className={styles.item.observaciones}>
                    {abono.observaciones}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {tieneAbonos ? (
        <div className={styles.total.container}>
          <div className={styles.total.row}>
            <span className={styles.total.label}>
              Total Abonado (últimos {abonosMostrar.length})
            </span>
            <span className={styles.total.value}>
              ${totalMostrados.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
