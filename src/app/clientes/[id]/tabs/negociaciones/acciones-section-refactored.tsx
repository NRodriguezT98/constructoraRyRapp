'use client'

/**
 * ✅ COMPONENTE PRESENTACIONAL PURO (REFACTORIZADO 2025-11-27)
 * AccionesSection - 100% Separación de Responsabilidades
 *
 * CAMBIOS:
 * - ✅ Lógica movida a useAccionesSection hook
 * - ✅ Estilos centralizados en acciones-section.styles.ts
 * - ✅ Diseño compact (p-6 → p-3, gap-3 → gap-2)
 * - ✅ Paleta rosa/púrpura/índigo (negociaciones)
 * - ✅ Glassmorphism aplicado
 */

import { AlertCircle, XCircle } from 'lucide-react'

import { useAccionesSection } from '@/modules/clientes/hooks/useAccionesSection'
import { Tooltip } from '@/shared/components/ui'

import {
    ACCIONES_CONFIG,
    getBotonClassName,
    accionesSectionStyles as styles,
} from './acciones-section.styles'

interface AccionesSectionProps {
  estado: string
  onRegistrarAbono?: () => void
  onRenunciar?: () => void
  onGenerarPDF?: () => void
  disabled?: boolean
}

export function AccionesSection({
  estado,
  onRegistrarAbono,
  onRenunciar,
  onGenerarPDF,
  disabled = false,
}: AccionesSectionProps) {
  // ✅ Hook con TODA la lógica
  const { estadosComputados, accionesHabilitadas, tooltips } = useAccionesSection({
    estado,
    disabled,
  })

  const acciones = [
    {
      key: 'registrarAbono' as const,
      onClick: onRegistrarAbono,
      habilitada: accionesHabilitadas.registrarAbono,
      tooltip: tooltips.registrarAbono,
    },
    {
      key: 'renunciar' as const,
      onClick: onRenunciar,
      habilitada: accionesHabilitadas.renunciar,
      tooltip: tooltips.renunciar,
    },
    {
      key: 'generarPDF' as const,
      onClick: onGenerarPDF,
      habilitada: accionesHabilitadas.generarPDF,
      tooltip: tooltips.generarPDF,
    },
  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.container}>
        <h3 className={styles.header.title}>
          <AlertCircle className={styles.header.titleIcon} />
          Acciones
        </h3>
        <p className={styles.header.subtitle}>
          Gestiona los procesos de esta negociación
        </p>
      </div>

      {/* Toolbar Horizontal */}
      <div className={styles.toolbar}>
        {acciones.map(({ key, onClick, habilitada, tooltip }) => {
          const config = ACCIONES_CONFIG[key]
          const Icono = config.icon

          return (
            <Tooltip key={key} content={tooltip} side="top">
              <button
                onClick={onClick}
                disabled={!habilitada}
                className={getBotonClassName(key, !habilitada)}
              >
                <Icono className={styles.button.icon} />
                <span>{config.label}</span>
              </button>
            </Tooltip>
          )
        })}
      </div>

      {/* Advertencia si está cerrada */}
      {estadosComputados.isCerrada ? (
        <div className={styles.warning.container}>
          <p className={styles.warning.text}>
            <XCircle className={styles.warning.icon} />
            <span>
              Esta negociación está <strong>{estado}</strong> y no permite más modificaciones.
            </span>
          </p>
        </div>
      ) : null}
    </div>
  )
}
