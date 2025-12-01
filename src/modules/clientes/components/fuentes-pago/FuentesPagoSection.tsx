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

import { FuentePagoCard, type FuentePago } from './FuentePagoCard'
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

  // Calcular pendientes
  const pendientesDoc = fuentesPago.filter(
    f => f.estado_documentacion === 'Pendiente Documentación'
  ).length

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <div>
          <h3 className={styles.header.title}>
            <FileText className={styles.header.icon} />
            Fuentes de Pago ({fuentesPago.length})
          </h3>
          <p className={styles.header.subtitle}>
            {pendientesDoc > 0 ? (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ {pendientesDoc} carta(s) de aprobación pendiente(s)
              </span>
            ) : (
              'Todas las fuentes tienen documentación completa'
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

      {/* Grid de tarjetas */}
      <div className={styles.grid}>
        {fuentesPago.map((fuente) => (
          <FuentePagoCard
            key={fuente.id}
            fuente={fuente}
            onSubirCarta={onSubirCarta}
          />
        ))}
      </div>
    </div>
  )
}
