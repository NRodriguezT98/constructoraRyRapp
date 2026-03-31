'use client'

/**
 * RebalancearModal
 *
 * Modal Admin-only para ajustar el plan financiero de una negociación.
 * Sub-componentes extraídos en ./rebalancear/
 */

import { useEffect, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Lock, Plus, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'
import {
    calcularRestriccionesFuente,
    validarRebalanceo,
} from '@/shared/utils/reglas-cierre-financiero'

import type { AjusteLocal, DatosRebalanceo, FuAlteNueva } from '../hooks'
import { MOTIVOS_AJUSTE, getFuenteColor } from '../hooks'

import type { CambioEnriquecido, NuevaEnriquecida } from './rebalancear'
import { AdvertenciaDocumentos, FilaFuente, FilaNueva } from './rebalancear'

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface RebalancearModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesPago: FuentePago[]
  valorVivienda: number
  tiposDisponibles: { nombre: string; descripcion: string; requiere_entidad?: boolean; color?: string }[]
  /** Todos los tipos activos (no solo los disponibles), para lookup de config: requiere_entidad, etc. */
  tiposConfig: { nombre: string; requiere_entidad?: boolean }[]
  /** Mapa tipo_fuente → títulos de documentos obligatorios (desde requisitos_fuentes_pago_config) */
  requisitosMap: Map<string, string[]>
  onGuardar: (datos: DatosRebalanceo) => void
  isGuardando: boolean
}

export function RebalancearModal({
  isOpen,
  onClose,
  fuentesPago,
  valorVivienda,
  tiposDisponibles,
  tiposConfig,
  requisitosMap,
  onGuardar,
  isGuardando,
}: RebalancearModalProps) {
  // ── Estado local ──────────────────────────────────────────
  const [ajustes, setAjustes] = useState<AjusteLocal[]>([])
  const [nuevas, setNuevas] = useState<FuAlteNueva[]>([])
  const [motivo, setMotivo] = useState('')
  const [notas, setNotas] = useState('')
  const [mostrarNuevaFuente, setMostrarNuevaFuente] = useState(false)

  const [mostrandoAdvertencia, setMostrandoAdvertencia] = useState(false)

  // Mapa nombre → config para lookup sin hardcodear nombres de tipos
  const tiposConfigMap = useMemo(
    () => new Map(tiposConfig.map((t) => [t.nombre, t])),
    [tiposConfig]
  )

  // Sincronizar cuando abren el modal
  useEffect(() => {
    if (!isOpen) return
    setMostrandoAdvertencia(false)
    setAjustes(
      fuentesPago.map((f) => ({
        id: f.id,
        tipo: f.tipo,
        montoOriginal: f.monto_aprobado,
        montoEditable: f.capital_para_cierre ?? f.monto_aprobado,
        entidad: f.entidad ?? '',
        entidadEditable: f.entidad ?? '',
        paraEliminar: false,
        monto_recibido: f.monto_recibido ?? 0,
        capital_para_cierre: f.capital_para_cierre,
        tienePlanCuotas: esCreditoConstructora(f.tipo) && f.capital_para_cierre !== null,
      }))
    )
    setNuevas([])
    setMotivo('')
    setNotas('')
    setMostrarNuevaFuente(false)
  }, [isOpen, fuentesPago])

  // ── Restricciones por fuente ────────────────────────────
  const restriccionesMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calcularRestriccionesFuente>>()
    for (const a of ajustes) {
      map.set(a.id, calcularRestriccionesFuente({
        id: a.id,
        tipo: a.tipo,
        monto_aprobado: a.montoOriginal,
        capital_para_cierre: a.capital_para_cierre,
        monto_recibido: a.monto_recibido,
        tienePlanCuotas: a.tienePlanCuotas,
      }))
    }
    return map
  }, [ajustes])

  // ── Cálculos en tiempo real ───────────────────────────────
  const subtotal = useMemo(() => {
    const activas = ajustes.filter((a) => !a.paraEliminar).reduce((s, a) => {
      const r = restriccionesMap.get(a.id)
      // Para fuentes bloqueadas (crédito con plan), usar capital_para_cierre
      // Para fuentes editables, usar el valor que el usuario escribió
      const monto = r && !r.puedeEditarMonto && a.capital_para_cierre !== null
        ? a.capital_para_cierre
        : a.montoEditable
      return s + monto
    }, 0)
    const agregadas = nuevas.reduce((s, n) => s + n.monto, 0)
    return activas + agregadas
  }, [ajustes, nuevas, restriccionesMap])

  const diferencia = valorVivienda - subtotal
  const estaBalanceado = Math.abs(diferencia) < 1

  // ── Validación global antes de guardar ────────────────────
  const erroresRebalanceo = useMemo(() => {
    return validarRebalanceo(
      ajustes.map((a) => ({
        id: a.id,
        montoEditable: a.montoEditable,
        paraEliminar: a.paraEliminar,
        restricciones: restriccionesMap.get(a.id)!,
      })),
      valorVivienda,
      subtotal,
    )
  }, [ajustes, restriccionesMap, valorVivienda, subtotal])

  const motivoRequiereNotas = motivo === 'Otro'
  const puedeGuardar =
    estaBalanceado &&
    erroresRebalanceo.length === 0 &&
    motivo !== '' &&
    (!motivoRequiereNotas || notas.trim() !== '') &&
    !isGuardando

  // ── Detectar cambios que generarán requisitos de documentos ─────────────
  // Fuentes existentes que requerirán nueva documentación (solo tipos que requieren docs según BD)
  const fuentesExistentesQueInvalidan = useMemo<CambioEnriquecido[]>(() => {
    return ajustes
      .filter((a) => !a.paraEliminar)
      .filter((a) => {
        // Solo advertir para tipos que requieren documentos — desde BD, no hardcodeado
        if (!tiposConfigMap.get(a.tipo)?.requiere_entidad) return false
        const cambioEntidad = a.entidadEditable !== a.entidad
        const aumentoMonto = a.montoEditable > a.montoOriginal // disminuir NO requiere docs
        return cambioEntidad || aumentoMonto
      })
      .map((a) => {
        const cambioEntidad = a.entidadEditable !== a.entidad
        const aumentoMonto = a.montoEditable > a.montoOriginal
        const motivoCambio =
          cambioEntidad && aumentoMonto ? 'ambos' : cambioEntidad ? 'entidad' : 'monto'
        return {
          tipo: a.tipo,
          motivoCambio,
          entidadAnterior: cambioEntidad ? (a.entidad || 'Sin entidad') : undefined,
          entidadNueva: cambioEntidad ? (a.entidadEditable || 'Sin entidad') : undefined,
          montoAnterior: aumentoMonto ? a.montoOriginal : undefined,
          montoNuevo: aumentoMonto ? a.montoEditable : undefined,
          documentos: requisitosMap.get(a.tipo) ?? [],
        }
      })
  }, [ajustes, tiposConfigMap, requisitosMap])

  // Fuentes nuevas que requerirán documentación (según flag requiere_entidad de BD)
  const fuentesNuevasQueNecesitanCarta = useMemo<NuevaEnriquecida[]>(() => {
    return nuevas
      .filter((n) => tiposConfigMap.get(n.tipo)?.requiere_entidad ?? false)
      .map((n) => ({
        tipo: n.tipo,
        documentos: requisitosMap.get(n.tipo) ?? [],
      }))
  }, [nuevas, tiposConfigMap, requisitosMap])

  const hayCambiosConAdvertencia =
    fuentesExistentesQueInvalidan.length > 0 || fuentesNuevasQueNecesitanCarta.length > 0

  // ── Handlers ──────────────────────────────────────────────

  const handleCambioMonto = (id: string, monto: number) => {
    setAjustes((prev) => prev.map((a) => (a.id === id ? { ...a, montoEditable: monto } : a)))
  }

  const handleCambioEntidad = (id: string, entidad: string) => {
    setAjustes((prev) => prev.map((a) => (a.id === id ? { ...a, entidadEditable: entidad } : a)))
  }

  const handleToggleEliminar = (id: string) => {
    setAjustes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, paraEliminar: !a.paraEliminar } : a))
    )
  }

  const handleAgregarTipo = (tipo: string) => {
    setNuevas((prev) => [...prev, { tipo, monto: 0, entidad: '' }])
    setMostrarNuevaFuente(false)
  }

  const handleCambioNueva = (index: number, campo: keyof FuAlteNueva, valor: string | number) => {
    setNuevas((prev) => prev.map((n, i) => (i === index ? { ...n, [campo]: valor } : n)))
  }

  const handleEliminarNueva = (index: number) => {
    setNuevas((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGuardar = () => {
    if (!puedeGuardar) return
    // Si hay cambios que generan advertencia y aún no se confirmó → mostrar aviso
    if (hayCambiosConAdvertencia && !mostrandoAdvertencia) {
      setMostrandoAdvertencia(true)
      return
    }
    onGuardar({ ajustes, nuevas, motivo, notas })
  }

  // Portal fix: evitar que transforms de padres rompan position:fixed
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay — z-[9999] garantiza cobertura total incluyendo headers fijos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-850 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">
                      Ajustar Cierre Financiero
                    </h2>
                    <p className="text-xs text-cyan-100 mt-0.5">Solo Administrador</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subheader: valor objetivo */}
              <div className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700/50 px-5 py-3 flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Valor de la vivienda</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {formatCurrency(valorVivienda)}
                </p>
              </div>

              {/* Body scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {/* Fuentes existentes */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Fuentes configuradas
                  </p>
                  {ajustes.map((ajuste) => (
                    <FilaFuente
                      key={ajuste.id}
                      ajuste={ajuste}
                      restricciones={restriccionesMap.get(ajuste.id)!}
                      onChange={handleCambioMonto}
                      onCambioEntidad={handleCambioEntidad}
                      onToggleEliminar={handleToggleEliminar}
                      requiereEntidad={tiposConfigMap.get(ajuste.tipo)?.requiere_entidad ?? false}
                    />
                  ))}
                </div>

                {/* Fuentes nuevas */}
                {nuevas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Nuevas fuentes
                    </p>
                    {nuevas.map((fuente, i) => (
                      <FilaNueva
                        key={i}
                        fuente={fuente}
                        index={i}
                        onChange={handleCambioNueva}
                        onEliminar={handleEliminarNueva}
                        requiereEntidad={tiposConfigMap.get(fuente.tipo)?.requiere_entidad ?? false}
                      />
                    ))}
                  </div>
                )}

                {/* Botón agregar fuente */}
                {tiposDisponibles.length > 0 && (
                  <div>
                    {!mostrarNuevaFuente ? (
                      <button
                        type="button"
                        onClick={() => setMostrarNuevaFuente(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar fuente de pago
                      </button>
                    ) : (
                      <div className="rounded-lg border border-cyan-200 dark:border-cyan-800/50 overflow-hidden">
                        <p className="text-xs font-semibold text-gray-500 px-3 pt-3 pb-2">
                          Seleccionar tipo de fuente:
                        </p>
                        <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                          {tiposDisponibles.map((tipo) => {
                            const color = getFuenteColor(tipo.nombre)
                            return (
                              <button
                                key={tipo.nombre}
                                type="button"
                                onClick={() => handleAgregarTipo(tipo.nombre)}
                                className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 hover:bg-cyan-50/60 dark:hover:bg-cyan-900/10 transition-colors"
                              >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color.barra}`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {tipo.nombre}
                                  </p>
                                  {tipo.descripcion && (
                                    <p className="text-xs text-gray-400">{tipo.descripcion}</p>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <div className="px-3 pb-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                          <button
                            type="button"
                            onClick={() => setMostrarNuevaFuente(false)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Motivo del cambio */}
                <div className="pt-1 space-y-2 border-t border-gray-100 dark:border-gray-700/50">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Motivo del cambio <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 dark:text-white"
                  >
                    <option value="">Seleccionar motivo...</option>
                    {MOTIVOS_AJUSTE.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  {motivoRequiereNotas && (
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Describe el motivo del cambio... (requerido)"
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                    />
                  )}

                  {motivo && motivo !== 'Otro' && (
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Notas adicionales (opcional)"
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                    />
                  )}
                </div>
              </div>

              {/* Footer fijo: balance + botones */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 flex-shrink-0 space-y-3">
                {/* Advertencia: cambios que invalidarán cartas */}
                <AdvertenciaDocumentos
                  visible={mostrandoAdvertencia}
                  fuentesExistentes={fuentesExistentesQueInvalidan}
                  fuentesNuevas={fuentesNuevasQueNecesitanCarta}
                />

                {/* Errores de validación de montos mínimos */}
                {erroresRebalanceo.filter((e) => e.campo !== 'balance').length > 0 ? (
                  <div className="space-y-1">
                    {erroresRebalanceo
                      .filter((e) => e.campo !== 'balance')
                      .map((err) => (
                        <p
                          key={err.campo}
                          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          {err.mensaje}
                        </p>
                      ))}
                  </div>
                ) : null}

                {/* Balance indicator */}
                <div
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl ${
                    estaBalanceado
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60'
                  }`}
                >
                  {estaBalanceado ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${estaBalanceado ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}
                      >
                        {estaBalanceado
                          ? '✅ Ecuación balanceada'
                          : diferencia > 0
                            ? `❌ Déficit: ${formatCurrency(Math.abs(diferencia))}`
                            : `❌ Excedente: ${formatCurrency(Math.abs(diferencia))}`}
                      </span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {formatCurrency(subtotal)} / {formatCurrency(valorVivienda)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isGuardando}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={!puedeGuardar}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      puedeGuardar
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-gray-100 dark:bg-gray-700/40 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isGuardando
                    ? 'Guardando...'
                    : mostrandoAdvertencia && hayCambiosConAdvertencia
                      ? 'Entendido, guardar'
                      : 'Guardar cambios'
                  }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
