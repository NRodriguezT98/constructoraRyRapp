/**
 * ClienteCardActivo V2 - Diseño Premium Rediseñado
 *
 * Principios de diseño:
 * 1. Jerarquía visual clara
 * 2. Información escalonada por importancia
 * 3. Uso inteligente del espacio
 * 4. Consistencia entre estados (Activo/Interesado)
 */

'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Edit,
    Eye,
    Home,
    MapPin,
    Trash2,
    TrendingUp,
    UserCheck,
    Wallet,
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import type { ClienteResumen } from '../../types'
import { clienteCardThemes } from './cliente-card-base.styles'

interface ClienteCardActivoProps {
  cliente: ClienteResumen
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onRegistrarAbono?: (cliente: ClienteResumen) => void
}

export function ClienteCardActivo({
  cliente,
  onVer,
  onEditar,
  onEliminar,
  onRegistrarAbono,
}: ClienteCardActivoProps) {
  const theme = clienteCardThemes.Activo

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // ⚡ Usar datos de vivienda que ya vienen del servicio (sin consulta adicional)
  const vivienda = cliente.vivienda

  // Si no tiene datos de vivienda, mostrar skeleton
  if (!vivienda) {
    return (
      <div className="rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-4">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    )
  }

  // Mapear datos desde cliente.vivienda a la estructura que espera el componente
  const datosVivienda = {
    proyecto: vivienda.nombre_proyecto || 'Sin proyecto',
    ubicacion: vivienda.ubicacion_proyecto || 'Sin ubicación',
    manzana: vivienda.nombre_manzana || 'N/A',
    numero: vivienda.numero_vivienda || 'N/A',
    valorTotal: vivienda.valor_total || 0,
    valorPagado: vivienda.total_abonado || 0,
    saldoPendiente: vivienda.saldo_pendiente || 0,
    porcentaje: vivienda.valor_total && vivienda.valor_total > 0
      ? Math.round((vivienda.total_abonado || 0) / vivienda.valor_total * 100)
      : 0,
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 p-4 flex flex-col min-h-[500px]">

        {/* Contenido con flex-1 para que ocupe espacio disponible */}
        <div className="flex-1 space-y-3">
          {/* === HEADER SECTION === */}
          <div className="space-y-2">
          {/* Fila 1: Cliente + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {formatNombreCompleto(cliente.nombre_completo)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cliente.tipo_documento}</span> {cliente.numero_documento}
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              {onVer && (
                <button
                  onClick={() => onVer(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEditar && (
                <button
                  onClick={() => onEditar(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onEliminar && (
                <button
                  onClick={() => onEliminar(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Fila 2: Badge */}
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/50">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ACTIVO
            </span>
          </div>
        </div>

        {/* === VIVIENDA SECTION === */}
        <div className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-900/50 shadow-sm">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Vivienda Asignada
            </p>
          </div>
          {/* Grid 2x2: Fila 1 (Proyecto|Ubicación) + Fila 2 (Manzana|Casa) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Proyecto */}
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{datosVivienda.proyecto}</p>
              </div>
            </div>
            {/* Ubicación */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ubicación</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{datosVivienda.ubicacion}</p>
              </div>
            </div>
            {/* Manzana */}
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manzana</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{datosVivienda.manzana}</p>
              </div>
            </div>
            {/* Casa */}
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Casa</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">#{datosVivienda.numero}</p>
              </div>
            </div>
          </div>
        </div>

        {/* === FINANCIAL SECTION === */}
        <div className="space-y-2.5">
          {/* Financial Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total */}
            <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Total</p>
              </div>
              <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(datosVivienda.valorTotal)}
              </p>
            </div>

            {/* Pagado */}
            <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <p className="text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">Pagado</p>
              </div>
              <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(datosVivienda.valorPagado)}
              </p>
            </div>

            {/* Saldo */}
            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <p className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">Saldo</p>
              </div>
              <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(datosVivienda.saldoPendiente)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Progreso de Pago</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {datosVivienda.porcentaje}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${datosVivienda.porcentaje}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
        </div>

        {/* === ACTION BUTTON === */}
        {onRegistrarAbono && (
          <motion.button
            onClick={() => onRegistrarAbono(cliente)}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>Registrar Abono</span>
            </div>
          </motion.button>
        )}

        {/* === FOOTER === */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Registrado {formatDateShort(cliente.fecha_creacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
