/**
 * ViviendaCardAsignada - Card completa con TODA la información
 * Muestra: Cliente, Proyecto, Matrícula, Nomenclatura, Progreso de Pago completo
 */

import { formatCurrency, formatDate } from '@/shared/utils'
import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    DollarSign,
    Edit, Eye, FileCheck,
    Hash,
    Home, MapPin,
    MapPinned,
    Sparkles,
    TrendingUp,
    User
} from 'lucide-react'
import type { Vivienda } from '../../types'

interface ViviendaCardAsignadaProps {
  vivienda: Vivienda
  onVerDetalle?: () => void
  onVerAbonos?: () => void
  onRegistrarPago?: () => void
  onEditar?: () => void
}

export function ViviendaCardAsignada({
  vivienda,
  onVerDetalle,
  onVerAbonos,
  onRegistrarPago,
  onEditar,
}: ViviendaCardAsignadaProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const cliente = vivienda.clientes

  // Calcular financiero
  const valorTotal = vivienda.valor_total || 0
  const abonado = vivienda.total_abonado || 0
  const pendiente = valorTotal - abonado
  const porcentaje = valorTotal ? (abonado / valorTotal) * 100 : 0

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 p-3">
        {/* Botones de acción (superior derecho) */}
        <div className="flex items-start justify-end gap-1 mb-1.5">
          {onVerDetalle && (
            <button
              onClick={onVerDetalle}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              title="Ver detalle"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onEditar && (
            <button
              onClick={onEditar}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              title="Editar"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Icono + Título + Badge Estado */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{proyectoNombre}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ASIGNADA
          </span>
        </div>

        {/* Badges tipo vivienda + esquinera */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold">
            {vivienda.tipo_vivienda || 'Regular'}
          </span>
          {vivienda.es_esquinera && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              Esquinera
            </span>
          )}
        </div>

        {/* SECCIÓN: Cliente Asignado */}
        <div className="mb-2.5 rounded-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            Cliente Asignado
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-blue-900 dark:text-blue-100 truncate">
                {cliente?.nombre_completo || 'Sin asignar'}
              </h4>
              {vivienda.fecha_asignacion && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(vivienda.fecha_asignacion)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN: Información Técnica (si existe) */}
        {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
          <div className="mb-2.5 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200/50 dark:border-slate-700/50 p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              Información Legal
            </div>
            <div className="space-y-1.5">
              {vivienda.matricula_inmobiliaria && (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Hash className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Matrícula</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono truncate">
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                </div>
              )}
              {vivienda.nomenclatura && (
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                    <MapPinned className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Nomenclatura</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {vivienda.nomenclatura}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN: Progreso de Pago */}
        <div className="mb-2.5 rounded-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-700 p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Progreso de Pago
            </div>
            <div className="text-lg font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {porcentaje.toFixed(1)}%
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 transition-all duration-700 shadow-lg shadow-emerald-500/50"
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          {/* Detalles financieros */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Valor Total:</span>
              <span className="font-bold">{formatCurrency(valorTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold">✅ Abonado:</span>
              <span className="font-bold">{formatCurrency(abonado)}</span>
            </div>
            <div className="flex justify-between text-amber-700 dark:text-amber-300">
              <span className="font-semibold">📊 Pendiente:</span>
              <span className="font-bold">{formatCurrency(pendiente)}</span>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {onVerAbonos && (
              <button
                onClick={onVerAbonos}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Abonos ({vivienda.cantidad_abonos || 0})
              </button>
            )}
            {onRegistrarPago && (
              <button
                onClick={onRegistrarPago}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Pago
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
