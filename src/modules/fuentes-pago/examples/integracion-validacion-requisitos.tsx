/**
 * ============================================
 * EJEMPLO: Integración de Estado de Documentación en Fuentes de Pago
 * ============================================
 *
 * Este archivo muestra cómo integrar el nuevo sistema de validación
 * de requisitos en la sección de fuentes de pago del cliente.
 *
 * UBICACIÓN: src/app/clientes/[id]/tabs/fuentes-pago/page.tsx
 *
 * @version 1.0.0 - 2025-12-12
 */

'use client'

import { FileText, Upload } from 'lucide-react'
import { useState } from 'react'

// Importar el nuevo componente
import { EstadoDocumentacionFuenteCard } from '@/modules/fuentes-pago/components'
import type { RequisitoDocumento } from '@/modules/fuentes-pago/services'

// Importar componentes existentes
import { FuentePagoCard, type FuentePago } from '@/modules/clientes/components/fuentes-pago/FuentePagoCard'

// ============================================
// EJEMPLO DE INTEGRACIÓN
// ============================================

interface FuentesPagoConValidacionSectionProps {
  fuentesPago: FuentePago[]
  clienteId: string
  onSubirDocumento?: (fuenteId: string, requisito: RequisitoDocumento) => void
}

export function FuentesPagoConValidacionSection({
  fuentesPago,
  clienteId,
  onSubirDocumento,
}: FuentesPagoConValidacionSectionProps) {
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState<string | null>(
    fuentesPago[0]?.id || null
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fuentes de Pago
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestión de fuentes de financiamiento y requisitos
          </p>
        </div>
      </div>

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Lista de fuentes (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {fuentesPago.map((fuente) => (
            <div
              key={fuente.id}
              onClick={() => setFuenteSeleccionada(fuente.id)}
              className={`cursor-pointer transition-all ${
                fuenteSeleccionada === fuente.id
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <FuentePagoCard fuente={fuente} />
            </div>
          ))}
        </div>

        {/* Columna 2: Panel de requisitos (1/3) - NUEVO ⭐ */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Header del panel */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Validación de Requisitos
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {fuenteSeleccionada
                  ? 'Verifica el estado de documentación de la fuente seleccionada'
                  : 'Selecciona una fuente para ver sus requisitos'}
              </p>
            </div>

            {/* Card de estado de documentación - NUEVO COMPONENTE ⭐ */}
            {fuenteSeleccionada ? (
              <EstadoDocumentacionFuenteCard
                fuentePagoId={fuenteSeleccionada}
                onSubirDocumento={(requisito) => {
                  if (onSubirDocumento) {
                    onSubirDocumento(fuenteSeleccionada, requisito)
                  }
                }}
              />
            ) : (
              <div className="backdrop-blur-xl bg-gray-50/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Selecciona una fuente para ver sus requisitos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EJEMPLO DE USO EN PÁGINA
// ============================================

/**
 * PASO 1: Importar en tu página de fuentes de pago
 *
 * ```tsx
 * import { FuentesPagoConValidacionSection } from './components/FuentesPagoConValidacionSection'
 * ```
 */

/**
 * PASO 2: Usar en el componente
 *
 * ```tsx
 * export function FuentesPagoTab({ clienteId }: Props) {
 *   const { fuentes, loading } = useFuentesPago(clienteId)
 *   const [modalSubirDocumento, setModalSubirDocumento] = useState<{
 *     fuenteId: string
 *     requisito: RequisitoDocumento
 *   } | null>(null)
 *
 *   return (
 *     <>
 *       <FuentesPagoConValidacionSection
 *         fuentesPago={fuentes}
 *         clienteId={clienteId}
 *         onSubirDocumento={(fuenteId, requisito) => {
 *           setModalSubirDocumento({ fuenteId, requisito })
 *         }}
 *       />
 *
 *       {modalSubirDocumento && (
 *         <DocumentoUploadModal
 *           isOpen={true}
 *           onClose={() => setModalSubirDocumento(null)}
 *           clienteId={clienteId}
 *           metadata={{
 *             fuente_pago_id: modalSubirDocumento.fuenteId,
 *             tipo_documento: modalSubirDocumento.requisito.tipo_documento
 *           }}
 *         />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */

/**
 * PASO 3: Ejecutar migraciones SQL
 *
 * ```bash
 * npm run db:exec supabase/migrations/20251212_sistema_validacion_requisitos_fuentes.sql
 * npm run db:exec supabase/migrations/20251212_actualizar_trigger_documentos_pendientes.sql
 * ```
 */

/**
 * PASO 4: Regenerar tipos (opcional pero recomendado)
 *
 * ```bash
 * npm run types:generate
 * ```
 */
