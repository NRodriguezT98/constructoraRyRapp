'use client'

/**
 * ============================================
 * COMPONENTE: FuentesPagoSection
 * ============================================
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * Sección que muestra tarjetas de fuentes de pago
 *
 * Features:
 * - Lista de fuentes con estado de documentación
 * - Botón para editar fuentes
 * - Botón para subir carta por fuente
 * - Loading/empty states
 *
 * @version 1.0.0 - 2025-12-01
 */

import { Edit, FileText } from 'lucide-react'

import { type FuentePago } from './FuentePagoCard'
import { fuentesPagoSectionStyles as styles } from './FuentesPagoSection.styles'

// ============================================
// TYPES
// ============================================

interface FuentesPagoSectionProps {
  fuentesPago: FuentePago[]
  loading?: boolean
  onEditarFuentes?: () => void
  onSubirCarta?: (fuenteId: string) => void
}

// ============================================
// COMPONENTE
// ============================================

export function FuentesPagoSection({
  fuentesPago,
  loading = false,
  onEditarFuentes,
  onSubirCarta,
}: FuentesPagoSectionProps) {
  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Cargando fuentes de pago...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (fuentesPago.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyContainer}>
          <FileText className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No hay fuentes de pago configuradas</p>
          <p className={styles.emptySubtitle}>
            Edita la negociación para agregar las fuentes de financiamiento
          </p>
        </div>
      </div>
    )
  }

  // Calcular total de fuentes
  const totalFuentes = fuentesPago.reduce((sum, f) => sum + f.monto_aprobado, 0)
  const totalRecibido = fuentesPago.reduce((sum, f) => sum + (f.monto_recibido || 0), 0)

  // Calcular estado de documentación
  const fuentesConDocumento = fuentesPago.filter(f => f.carta_aprobacion_url).length
  const fuentesSinDocumento = fuentesPago.length - fuentesConDocumento
  const todasConDocumento = fuentesSinDocumento === 0

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <div className="flex-1">
          <h3 className={styles.header.title}>
            <FileText className={styles.header.icon} />
            Fuentes de Pago ({fuentesPago.length})
          </h3>
          <p className={styles.header.subtitle}>
            {todasConDocumento ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ Todas las fuentes tienen documentación completa
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠️ {fuentesSinDocumento} fuente{fuentesSinDocumento > 1 ? 's' : ''} sin documentación
              </span>
            )}
          </p>
        </div>

        {onEditarFuentes && (
          <button onClick={onEditarFuentes} className={styles.header.button}>
            <Edit className="w-4 h-4" />
            <span>Editar Fuentes</span>
          </button>
        )}
      </div>

      {/* Diseño tabla ultra compacta */}
      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 backdrop-blur-sm">
          {/* Header de tabla */}
          <div className="grid grid-cols-[2fr,1fr,1fr,1fr,50px] gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Fuente</div>
            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Monto</div>
            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Recibido</div>
            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">Pendiente</div>
            <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">%</div>
          </div>

          {/* Rows */}
          {fuentesPago.map((fuente, index) => {
            const porcentaje = fuente.monto_aprobado > 0
              ? Math.round((fuente.monto_recibido / fuente.monto_aprobado) * 100)
              : 0

            return (
              <div
                key={fuente.id}
                className={`group grid grid-cols-[2fr,1fr,1fr,1fr,50px] gap-2 px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-500/5 transition-colors ${
                  index !== fuentesPago.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/20' : ''
                }`}
              >
                {/* Fuente info */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{fuente.tipo}</p>
                    {/* Mostrar badge SOLO si requiere carta Y no la tiene */}
                    {fuente.tipo !== 'Cuota Inicial' && !fuente.carta_aprobacion_url && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
                        SIN CARTA
                      </span>
                    )}
                  </div>
                  {fuente.entidad && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-0.5">{fuente.entidad}</p>
                  )}
                </div>

                {/* Monto */}
                <div className="flex items-center justify-center">
                  <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">
                    ${fuente.monto_aprobado.toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Recibido */}
                <div className="flex items-center justify-center">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 tabular-nums">
                    ${fuente.monto_recibido.toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Pendiente */}
                <div className="flex items-center justify-center">
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
                    ${(fuente.monto_aprobado - fuente.monto_recibido).toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Porcentaje circular compacto */}
                <div className="flex items-center justify-center">
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <svg className="w-9 h-9 transform -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700/50"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 15}`}
                        strokeDashoffset={`${2 * Math.PI * 15 * (1 - porcentaje / 100)}`}
                        className={`transition-all duration-500 ${
                          porcentaje === 100
                            ? 'text-green-500'
                            : porcentaje > 0
                            ? 'text-cyan-500'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-900 dark:text-white">
                      {porcentaje}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="mt-3 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800">
            <p className="text-sm font-bold text-white">Total Fuentes de Pago:</p>
            <p className="text-lg font-bold text-white tabular-nums">
              ${totalFuentes.toLocaleString('es-CO')}
            </p>
          </div>
          {totalRecibido > 0 && (
            <div className="mt-2 flex items-center justify-between px-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Recibido:</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
                ${totalRecibido.toLocaleString('es-CO')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
