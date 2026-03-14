'use client'

/**
 * RebalancearModal
 *
 * Modal Admin-only para ajustar el plan financiero de una negociación.
 *
 * Permite en una sola operación atómica:
 * - Modificar montos de fuentes existentes
 * - Agregar nuevas fuentes (ej: subsidio que entró)
 * - Desactivar fuentes que salieron de la ecuación
 *
 * La ecuación debe cerrar exactamente antes de poder guardar.
 * Motivo obligatorio para trazabilidad en audit_log.
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, FileWarning, Lock, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { formatCurrency } from '@/shared/utils/format'
import type { AjusteLocal, DatosRebalanceo, FuAlteNueva } from '../hooks'
import { MOTIVOS_AJUSTE, getFuenteColor } from '../hooks'

// ============================================
// ENTIDADES POR TIPO DE FUENTE
// ============================================

const BANCOS_HIPOTECARIO = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Agrario',
  'Fondo Nacional del Ahorro',
  'Banco Pichincha',
  'Scotiabank Colpatria',
  'Itaú',
  'Otro',
] as const

const CAJAS_COMPENSACION_LIST = [
  'Comfenalco',
  'Comfandi',
  'Compensar',
  'Comfama',
  'Cafam',
  'Comfamiliar',
  'Comfacor',
  'Comparta',
  'Cofrem',
  'Comfacundi',
  'Comfaoriente',
  'Comfamiliar Risaralda',
  'Otro',
] as const

function getEntidadesParaTipo(tipo: string): readonly string[] {
  if (tipo === 'Crédito Hipotecario') return BANCOS_HIPOTECARIO
  if (tipo === 'Subsidio Caja Compensación') return CAJAS_COMPENSACION_LIST
  return []
}

// ============================================
// HELPERS
// ============================================

function parseMonto(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

function formatMontoInput(value: number): string {
  if (!value) return ''
  return value.toLocaleString('es-CO')
}

// ============================================
// COMPONENTE: Fila de fuente editable
// ============================================

function FilaFuente({
  ajuste,
  onChange,
  onCambioEntidad,
  onToggleEliminar,
}: {
  ajuste: AjusteLocal
  onChange: (id: string, monto: number) => void
  onCambioEntidad: (id: string, entidad: string) => void
  onToggleEliminar: (id: string) => void
}) {
  const color = getFuenteColor(ajuste.tipo)
  const [inputValue, setInputValue] = useState(formatMontoInput(ajuste.montoEditable))
  const entidades = getEntidadesParaTipo(ajuste.tipo)
  const mostrarEntidad = ajuste.tipo !== 'Cuota Inicial'

  useEffect(() => {
    setInputValue(formatMontoInput(ajuste.montoEditable))
  }, [ajuste.montoEditable])

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(ajuste.id, numero)
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
        ajuste.paraEliminar
          ? 'opacity-40 bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-600'
          : 'bg-white dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50'
      }`}
    >
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${color.barra}`} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold text-gray-900 dark:text-white ${ajuste.paraEliminar ? 'line-through' : ''}`}
        >
          {ajuste.tipo}
        </p>

        {/* Entidad: solo lectura al eliminar, editable en modo activo */}
        {ajuste.paraEliminar ? (
          ajuste.entidad ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">{ajuste.entidad}</p>
          ) : null
        ) : mostrarEntidad ? (
          entidades.length > 0 ? (
            <select
              value={ajuste.entidadEditable}
              onChange={(e) => onCambioEntidad(ajuste.id, e.target.value)}
              className="mt-1 w-full text-xs bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500 text-gray-700 dark:text-gray-300"
            >
              <option value="">Seleccionar entidad...</option>
              {entidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Entidad"
              value={ajuste.entidadEditable}
              onChange={(e) => onCambioEntidad(ajuste.id, e.target.value)}
              className="mt-1 w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:border-cyan-500 text-gray-600 dark:text-gray-400 placeholder:text-gray-300"
            />
          )
        ) : null}
      </div>

      {!ajuste.paraEliminar && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            className="w-36 text-right text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 tabular-nums"
            placeholder="0"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onToggleEliminar(ajuste.id)}
        title={ajuste.paraEliminar ? 'Restaurar fuente' : 'Quitar fuente'}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
          ajuste.paraEliminar
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200'
            : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
        }`}
      >
        {ajuste.paraEliminar ? (
          <Plus className="w-3.5 h-3.5" />
        ) : (
          <Minus className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  )
}

// ============================================
// COMPONENTE: Fila de fuente NUEVA
// ============================================

function FilaNueva({
  fuente,
  index,
  onChange,
  onEliminar,
}: {
  fuente: FuAlteNueva
  index: number
  onChange: (index: number, campo: keyof FuAlteNueva, valor: string | number) => void
  onEliminar: (index: number) => void
}) {
  const color = getFuenteColor(fuente.tipo)
  const [inputValue, setInputValue] = useState(formatMontoInput(fuente.monto))
  const entidades = getEntidadesParaTipo(fuente.tipo)
  const mostrarEntidad = fuente.tipo !== 'Cuota Inicial'

  const handleChange = (raw: string) => {
    const soloDigitos = raw.replace(/[^0-9]/g, '')
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : 0
    setInputValue(soloDigitos ? numero.toLocaleString('es-CO') : '')
    onChange(index, 'monto', numero)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg p-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/80 dark:border-emerald-800/40">
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${color.barra}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{fuente.tipo}</p>
        {mostrarEntidad && (
          entidades.length > 0 ? (
            <select
              value={fuente.entidad}
              onChange={(e) => onChange(index, 'entidad', e.target.value)}
              className="mt-1 w-full text-xs bg-white dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500 text-gray-700 dark:text-gray-300"
            >
              <option value="">Seleccionar entidad...</option>
              {entidades.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Entidad (opcional)"
              value={fuente.entidad}
              onChange={(e) => onChange(index, 'entidad', e.target.value)}
              className="mt-1 w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 focus:outline-none focus:border-cyan-500 text-gray-600 dark:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          )
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-medium">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-36 text-right text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 tabular-nums"
          placeholder="0"
        />
      </div>

      <button
        type="button"
        onClick={() => onEliminar(index)}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface RebalancearModalProps {
  isOpen: boolean
  onClose: () => void
  fuentesPago: FuentePago[]
  valorVivienda: number
  tiposDisponibles: { nombre: string; descripcion: string }[]
  onGuardar: (datos: DatosRebalanceo) => void
  isGuardando: boolean
}

export function RebalancearModal({
  isOpen,
  onClose,
  fuentesPago,
  valorVivienda,
  tiposDisponibles,
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

  // Sincronizar cuando abren el modal
  useEffect(() => {
    if (!isOpen) return
    setMostrandoAdvertencia(false)
    setAjustes(
      fuentesPago.map((f) => ({
        id: f.id,
        tipo: f.tipo,
        montoOriginal: f.monto_aprobado,
        montoEditable: f.monto_aprobado,
        entidad: f.entidad ?? '',
        entidadEditable: f.entidad ?? '',
        paraEliminar: false,
      }))
    )
    setNuevas([])
    setMotivo('')
    setNotas('')
    setMostrarNuevaFuente(false)
  }, [isOpen, fuentesPago])

  // ── Cálculos en tiempo real ───────────────────────────────
  const subtotal = useMemo(() => {
    const activas = ajustes.filter((a) => !a.paraEliminar).reduce((s, a) => s + a.montoEditable, 0)
    const agregadas = nuevas.reduce((s, n) => s + n.monto, 0)
    return activas + agregadas
  }, [ajustes, nuevas])

  const diferencia = valorVivienda - subtotal
  const estaBalanceado = Math.abs(diferencia) < 1
  const motivoRequiereNotas = motivo === 'Otro'
  const puedeGuardar =
    estaBalanceado &&
    motivo !== '' &&
    (!motivoRequiereNotas || notas.trim() !== '') &&
    !isGuardando

  // ── Detectar cambios que invalidarán cartas de aprobación ─────────────
  // Fuentes existentes: cambia entidad o aumenta monto
  const fuentesExistentesQueInvalidan = useMemo(() => {
    return ajustes
      .filter((a) => !a.paraEliminar)
      .filter((a) => {
        const cambioEntidad = a.entidadEditable !== a.entidad
        const aumentoMonto = a.montoEditable > a.montoOriginal
        return cambioEntidad || aumentoMonto
      })
      .map((a) => a.tipo)
  }, [ajustes])

  // Fuentes nuevas que requerirán carta (no Cuota Inicial)
  const fuentesNuevasQueNecesitanCarta = useMemo(() => {
    return nuevas
      .filter((n) => n.tipo !== 'Cuota Inicial')
      .map((n) => n.tipo)
  }, [nuevas])

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
                      Rebalancear Plan Financiero
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
                      onChange={handleCambioMonto}
                      onCambioEntidad={handleCambioEntidad}
                      onToggleEliminar={handleToggleEliminar}
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
                <AnimatePresence>
                  {mostrandoAdvertencia && hayCambiosConAdvertencia && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2 overflow-hidden"
                    >
                      <div className="flex items-start gap-2">
                        <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-tight">
                            ¿Confirmar? Algunos documentos quedarán pendientes
                          </p>
                        </div>
                      </div>

                      {fuentesExistentesQueInvalidan.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Cartas que se invalidarán (por cambio de entidad o aumento de monto):
                          </p>
                          {fuentesExistentesQueInvalidan.map((tipo) => (
                            <div key={tipo} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                              <span>{tipo} — deberás subir nueva Carta de Aprobación</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {fuentesNuevasQueNecesitanCarta.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Fuentes nuevas que requerirán carta:
                          </p>
                          {fuentesNuevasQueNecesitanCarta.map((tipo) => (
                            <div key={tipo} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              <span>{tipo} — Carta de Aprobación requerida antes de desembolso</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-amber-600 dark:text-amber-500 italic">
                        El sistema quedará bloqueado para desembolsos hasta que se adjunten los documentos.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

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
