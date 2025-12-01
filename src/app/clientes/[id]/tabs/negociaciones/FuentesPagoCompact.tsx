'use client'

/**
 * ============================================
 * COMPONENTE: FuentesPagoCompact
 * ============================================
 *
 * ✅ VISTA COMPACTA DE FUENTES DE PAGO
 * Lista inline con bullets mostrando tipo, monto y porcentaje.
 *
 * Formato: 💳 Tipo: $Monto (%) • 🏦 Tipo: $Monto (%)
 *
 * @version 2.0.0 - 2025-01-26 (Refactorizado desde FuentesPagoSection)
 */

import { Edit, Plus, Wallet } from 'lucide-react'
import { useMemo } from 'react'

import { EditarFuentesPagoModal, type FuentePagoEditable } from './EditarFuentesPagoModal'
import { useEditarFuentesPago } from './hooks/useEditarFuentesPago'

// ============================================
// TYPES
// ============================================

interface FuentePago {
  id?: string // Agregado para edición
  tipo: string
  monto: number
  monto_recibido?: number
  entidad?: string
  numero_referencia?: string
  detalles?: string
}

interface FuentesPagoCompactProps {
  negociacionId: string // Agregado para edición
  fuentesPago: FuentePago[]
  valorTotal: number
  negociacionEstado?: string
  onEditar?: () => void // Deprecated: usar modal interno
}

// ============================================
// ICONOS POR TIPO
// ============================================

const ICONOS_TIPO: Record<string, string> = {
  'Cuota Inicial': '🏠',
  'Crédito Hipotecario': '💳',
  'Crédito Bancario': '💳',
  'Subsidio Caja de Compensación': '🏦',
  'Subsidio Mi Casa Ya': '🏦',
  Subsidio: '🏦',
  Otros: '💰',
}

// ============================================
// COMPONENTE
// ============================================

export function FuentesPagoCompact({
  negociacionId,
  fuentesPago,
  valorTotal,
  negociacionEstado = 'Activa',
  onEditar, // Deprecated pero mantenido para compatibilidad
}: FuentesPagoCompactProps) {
  // =====================================================
  // HOOKS
  // =====================================================

  const { isModalOpen, abrirModal, cerrarModal, guardarFuentes } = useEditarFuentesPago({
    negociacionId,
  })

  // =====================================================
  // CÁLCULOS
  // =====================================================

  const totalFuentes = useMemo(() => {
    return fuentesPago.reduce((sum, fuente) => sum + fuente.monto, 0)
  }, [fuentesPago])

  const porcentajeCubierto = useMemo(() => {
    if (valorTotal <= 0) return 0
    return Math.min((totalFuentes / valorTotal) * 100, 100)
  }, [totalFuentes, valorTotal])

  const fuentesConPorcentaje = useMemo(() => {
    return fuentesPago.map((fuente) => {
      const montoRecibido = fuente.monto_recibido || 0
      const porcentajePagado = fuente.monto > 0 ? (montoRecibido / fuente.monto) * 100 : 0
      const icono = ICONOS_TIPO[fuente.tipo] || '💰'
      return {
        ...fuente,
        montoRecibido,
        porcentajePagado,
        icono,
      }
    })
  }, [fuentesPago])

  const puedeEditar = negociacionEstado === 'Activa'
  const tieneFuentes = fuentesPago.length > 0

  // Transformar datos para el modal
  const fuentesEditables: FuentePagoEditable[] = useMemo(() => {
    return fuentesPago.map(f => ({
      id: f.id,
      tipo: f.tipo,
      monto: f.monto,
      monto_recibido: f.monto_recibido || 0,
      entidad: f.entidad,
      numero_referencia: f.numero_referencia,
      detalles: f.detalles,
    }));
  }, [fuentesPago])

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Fuentes de Pago
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {porcentajeCubierto.toFixed(0)}% del valor total configurado
            </p>
          </div>
          <button
            onClick={abrirModal}
            disabled={!puedeEditar}
            title={puedeEditar ? 'Editar fuentes de pago' : 'No se puede editar en este estado'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              puedeEditar
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

      {/* Lista de fuentes (tabla con mini-barras) */}
      {!tieneFuentes ? (
        <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay fuentes de pago configuradas
          </p>
          {onEditar && puedeEditar ? (
            <button
              onClick={onEditar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Configurar Fuentes
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2.5 border-t border-gray-200 dark:border-gray-700 pt-3">
          {fuentesConPorcentaje.map((fuente, index) => (
            <div key={index} className="space-y-1.5">
              {/* Header: Icono + Tipo + Monto */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fuente.icono}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {fuente.tipo}
                  </span>
                </div>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  ${(fuente.monto || 0).toLocaleString('es-CO')}
                </span>
              </div>

              {/* Mini-barra de progreso */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  style={{
                    backgroundImage: fuente.porcentajePagado === 0
                      ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(156, 163, 175, 0.3) 4px, rgba(156, 163, 175, 0.3) 8px)'
                      : undefined
                  }}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fuente.porcentajePagado >= 100
                        ? 'bg-emerald-500'
                        : fuente.porcentajePagado > 0
                        ? 'bg-amber-500'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.min(fuente.porcentajePagado, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${
                  fuente.porcentajePagado >= 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : fuente.porcentajePagado > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {fuente.porcentajePagado.toFixed(0)}% pagado
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Modal de Edición */}
      <EditarFuentesPagoModal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        fuentesActuales={fuentesEditables}
        valorFinal={valorTotal}
        onGuardar={guardarFuentes}
      />
    </>
  )
}
