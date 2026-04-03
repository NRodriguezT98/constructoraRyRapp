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
  Hash,
  Home,
  Layers,
  MapPin,
  Trash2,
  TrendingUp,
  UserCheck,
  Wallet,
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'

import type { ClienteResumen } from '../../types'

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
      <div className='rounded-2xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80'>
        <div className='h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700' />
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
    porcentaje:
      vivienda.valor_total && vivienda.valor_total > 0
        ? Math.round(
            ((vivienda.total_abonado || 0) / vivienda.valor_total) * 100
          )
        : 0,
  }

  return (
    <motion.div
      className='group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onVer?.(cliente)}
    >
      {/* Glow effect */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      <div className='relative z-10 flex flex-col p-4'>
        {/* Contenido con flex-1 para que ocupe espacio disponible */}
        <div className='flex-1 space-y-3'>
          {/* === HEADER SECTION === */}
          <div className='space-y-2'>
            {/* Fila 1: Cliente + Actions */}
            <div className='flex items-center justify-between'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg'>
                  <UserCheck className='h-6 w-6 text-white' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='line-clamp-2 text-base font-bold leading-tight text-gray-900 dark:text-white'>
                    {formatNombreCompleto(cliente.nombre_completo)}
                  </h3>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                      {cliente.tipo_documento}
                    </span>{' '}
                    {cliente.numero_documento}
                  </p>
                </div>
              </div>
              {/* Actions */}
              <div className='flex flex-shrink-0 gap-1'>
                {onEditar && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onEditar(cliente)
                    }}
                    className='rounded-lg p-1.5 text-gray-600 transition-all hover:bg-emerald-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
                    title='Editar'
                  >
                    <Edit className='h-4 w-4' />
                  </button>
                )}
                {onEliminar && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onEliminar(cliente)
                    }}
                    className='rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                    title='Eliminar'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
            {/* Fila 2: Badge */}
            <div className='flex justify-end'>
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-emerald-500/50'>
                <div className='h-1.5 w-1.5 rounded-full bg-white' />
                ACTIVO
              </span>
            </div>
          </div>

          {/* === VIVIENDA SECTION === */}
          <div className='rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-3 py-2.5 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-teal-900/20'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-lg bg-white p-2 shadow-sm dark:bg-gray-900/50'>
                <Home className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
              </div>
              <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300'>
                Vivienda Asignada
              </p>
            </div>
            {/* Grid 2x2: Fila 1 (Proyecto|Ubicación) + Fila 2 (Manzana|Casa) */}
            <div className='grid grid-cols-2 gap-2'>
              {/* Proyecto */}
              <div className='flex items-center gap-1.5'>
                <Building2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500' />
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Proyecto
                  </p>
                  <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                    {datosVivienda.proyecto}
                  </p>
                </div>
              </div>
              {/* Ubicación */}
              <div className='flex items-center gap-1.5'>
                <MapPin className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500' />
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Ubicación
                  </p>
                  <p className='truncate text-sm font-bold text-gray-900 dark:text-white'>
                    {datosVivienda.ubicacion}
                  </p>
                </div>
              </div>
              {/* Manzana */}
              <div className='flex items-center gap-1.5'>
                <Layers className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400' />
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Manzana
                  </p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    {datosVivienda.manzana}
                  </p>
                </div>
              </div>
              {/* Casa */}
              <div className='flex items-center gap-1.5'>
                <Hash className='h-3.5 w-3.5 text-gray-600 dark:text-gray-400' />
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                    Casa
                  </p>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    #{datosVivienda.numero}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* === FINANCIAL SECTION === */}
          <div className='space-y-2.5'>
            {/* Financial Grid */}
            <div className='grid grid-cols-3 gap-2'>
              {/* Total */}
              <div className='rounded-lg border border-blue-200/50 bg-blue-50 px-3 py-2 dark:border-blue-800/50 dark:bg-blue-950/30'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <Wallet className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  <p className='text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300'>
                    Total
                  </p>
                </div>
                <p className='text-xs font-extrabold text-gray-900 dark:text-white'>
                  {formatCurrency(datosVivienda.valorTotal)}
                </p>
              </div>

              {/* Pagado */}
              <div className='rounded-lg border border-green-200/50 bg-green-50 px-3 py-2 dark:border-green-800/50 dark:bg-green-950/30'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <CheckCircle2 className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                  <p className='text-[10px] font-bold uppercase tracking-wide text-green-700 dark:text-green-300'>
                    Pagado
                  </p>
                </div>
                <p className='text-xs font-extrabold text-gray-900 dark:text-white'>
                  {formatCurrency(datosVivienda.valorPagado)}
                </p>
              </div>

              {/* Saldo */}
              <div className='rounded-lg border border-red-200/50 bg-red-50 px-3 py-2 dark:border-red-800/50 dark:bg-red-950/30'>
                <div className='mb-1 flex items-center gap-1.5'>
                  <AlertCircle className='h-3.5 w-3.5 text-red-600 dark:text-red-400' />
                  <p className='text-[10px] font-bold uppercase tracking-wide text-red-700 dark:text-red-300'>
                    Saldo
                  </p>
                </div>
                <p className='text-xs font-extrabold text-gray-900 dark:text-white'>
                  {formatCurrency(datosVivienda.saldoPendiente)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/30'>
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Progreso de Pago
                  </span>
                </div>
                <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                  {datosVivienda.porcentaje}%
                </span>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <motion.div
                  className='absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500'
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
            onClick={e => {
              e.stopPropagation()
              onRegistrarAbono(cliente)
            }}
            className='w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className='flex items-center justify-center gap-2'>
              <Wallet className='h-4 w-4' />
              <span>Registrar Abono</span>
            </div>
          </motion.button>
        )}

        {/* === FOOTER === */}
        <div className='flex items-center gap-1.5 border-t border-gray-200 pt-2 dark:border-gray-700'>
          <Calendar className='h-3.5 w-3.5 text-gray-400 dark:text-gray-600' />
          <span className='text-xs text-gray-500 dark:text-gray-400'>
            Registrado {formatDateShort(cliente.fecha_creacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
