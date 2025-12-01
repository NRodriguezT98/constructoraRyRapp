'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO (REFACTORIZADO 2025-11-27)
 * FuentesPagoSection - 100% Separación de Responsabilidades
 *
 * CAMBIOS:
 * - ✅ Cálculos movidos a useFuentesPagoSection hook
 * - ✅ Estilos centralizados en fuentes-pago-section.styles.ts
 * - ✅ Diseño compact (p-6 → p-3, gap-3 → gap-2)
 * - ✅ Paleta rosa/púrpura/índigo (negociaciones)
 * - ✅ Glassmorphism aplicado
 */

import { DollarSign, Edit, Plus, Wallet } from 'lucide-react'

import { useFuentesPagoSection } from '@/modules/clientes/hooks/useFuentesPagoSection'

import {
    getTipoConfig,
    fuentesPagoSectionStyles as styles,
} from './fuentes-pago-section.styles'

interface FuentePago {
  tipo: 'Cuota Inicial' | 'Crédito Bancario' | 'Subsidio' | 'Otros'
  monto: number
  detalles?: string
  entidad?: string
  numero_referencia?: string
  monto_recibido?: number
}

interface FuentesPagoSectionProps {
  fuentesPago: FuentePago[]
  valorTotal: number
  negociacionEstado?: string
  onEditar?: () => void
}

export function FuentesPagoSection({
  fuentesPago,
  valorTotal,
  negociacionEstado = 'Activa',
  onEditar,
}: FuentesPagoSectionProps) {
  // ✅ Hook con TODA la lógica
  const {
    totalFuentes,
    porcentajeCubierto,
    fuentesConInfo,
    puedeEditar,
    tooltipEditar,
    tieneFuentes,
  } = useFuentesPagoSection({ fuentesPago, valorTotal, negociacionEstado })

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <div className={styles.header.left}>
          <h3 className={styles.header.title}>
            <Wallet className={styles.header.titleIcon} />
            Fuentes de Pago
          </h3>
          <p className={styles.header.subtitle}>
            {porcentajeCubierto}% del valor total configurado
          </p>
        </div>
        {onEditar ? (
          <button
            onClick={onEditar}
            disabled={!puedeEditar}
            title={tooltipEditar}
            className={`${styles.header.buttonEditar} ${
              puedeEditar
                ? styles.header.buttonEditarEnabled
                : styles.header.buttonEditarDisabled
            }`}
          >
            <Edit className={styles.header.buttonEditarIcon} />
            Editar
          </button>
        ) : null}
      </div>

      {/* Lista de Fuentes */}
      {!tieneFuentes ? (
        <div className={styles.empty.container}>
          <DollarSign className={styles.empty.icon} />
          <p className={styles.empty.text}>No hay fuentes de pago configuradas</p>
          {onEditar ? (
            <button onClick={onEditar} className={styles.empty.button}>
              <Plus className={styles.empty.buttonIcon} />
              Configurar Fuentes
            </button>
          ) : null}
        </div>
      ) : (
        <div className={styles.grid}>
          {fuentesConInfo.map((fuente, index) => {
            const config = getTipoConfig(fuente.tipo)
            const IconoFuente = config.icon

            return (
              <div
                key={index}
                className={`${styles.card.container} ${config.bg} ${config.border}`}
              >
                <div className={styles.card.content}>
                  <div className={`${styles.card.iconContainer} ${config.bg}`}>
                    <IconoFuente className={`${styles.card.icon} ${config.text}`} />
                  </div>
                  <div className={styles.card.info}>
                    <h4 className={`${styles.card.titulo} ${config.text}`}>
                      {fuente.tipo}
                    </h4>
                    <p className={styles.card.monto}>
                      ${fuente.monto.toLocaleString('es-CO')}
                    </p>
                    <div className={styles.card.progressContainer}>
                      <div className={styles.card.progressBar}>
                        <div
                          className={`${styles.card.progressFill} bg-gradient-to-r ${config.gradient}`}
                          style={{ width: `${fuente.porcentaje}%` }}
                        />
                      </div>
                      <span className={styles.card.progressPorcentaje}>
                        {fuente.porcentajeTexto}%
                      </span>
                    </div>

                    {/* Entidad */}
                    {fuente.entidad ? (
                      <div className={styles.card.entidad}>
                        <span className={styles.card.entidadText}>
                          🏦 {fuente.entidad}
                        </span>
                      </div>
                    ) : null}

                    {/* Referencia */}
                    {fuente.numero_referencia ? (
                      <div className={styles.card.referencia}>
                        <span className={styles.card.referenciaText}>
                          Ref: {fuente.numero_referencia}
                        </span>
                      </div>
                    ) : null}

                    {/* Detalles */}
                    {fuente.detalles && !fuente.entidad ? (
                      <p className={styles.card.detalles}>{fuente.detalles}</p>
                    ) : null}

                    {/* Badge completada */}
                    {fuente.estaCompletada ? (
                      <div className={styles.card.badgeCompletada}>
                        <DollarSign className={styles.card.badgeIcon} />
                        Completada
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Total */}
      {tieneFuentes ? (
        <div className={styles.total.container}>
          <div className={styles.total.row}>
            <span className={styles.total.label}>Total Configurado</span>
            <span className={styles.total.value}>
              ${totalFuentes.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
