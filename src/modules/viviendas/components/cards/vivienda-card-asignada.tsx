/**
 * ViviendaCardAsignada - Card completa con TODA la información
 * Muestra: Cliente, Proyecto, Matrícula, Nomenclatura, Progreso de Pago completo
 */

import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  FileCheck,
  Hash,
  Home,
  MapPin,
  MapPinned,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react'

import { formatCurrency, formatDate } from '@/shared/utils'

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
      className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      {/* HEADER */}
      <div className='relative z-10 p-3'>
        {/* Botones de acción (superior derecho) */}
        <div className='mb-1.5 flex items-start justify-end gap-1'>
          {onVerDetalle && (
            <button
              onClick={onVerDetalle}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
              title='Ver detalle'
            >
              <Eye className='h-3.5 w-3.5' />
            </button>
          )}
          {onEditar && (
            <button
              onClick={onEditar}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-blue-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'
              title='Editar'
            >
              <Edit className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        {/* Icono + Título + Badge Estado */}
        <div className='mb-2 flex items-start gap-2.5'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'>
            <Home className='h-4 w-4 text-white' />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate text-sm font-bold text-gray-900 dark:text-white'>
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
              <Building2 className='h-3 w-3' />
              <span className='truncate'>{proyectoNombre}</span>
            </p>
          </div>
          <span className='inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-2 py-0.5 text-xs font-bold text-white shadow-md shadow-blue-500/30'>
            <div className='h-1.5 w-1.5 rounded-full bg-white' />
            ASIGNADA
          </span>
        </div>

        {/* Badges tipo vivienda + esquinera */}
        <div className='mb-2.5 flex items-center gap-1.5'>
          <span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
            {vivienda.tipo_vivienda || 'Regular'}
          </span>
          {vivienda.es_esquinera && (
            <span className='inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white'>
              <Sparkles className='h-3 w-3' />
              Esquinera
            </span>
          )}
        </div>

        {/* SECCIÓN: Cliente Asignado */}
        <div className='mb-2.5 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2.5 dark:border-blue-700 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20'>
          <div className='mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300'>
            <User className='h-3.5 w-3.5' />
            Cliente Asignado
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600'>
              <User className='h-3.5 w-3.5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='truncate text-xs font-black text-blue-900 dark:text-blue-100'>
                {cliente?.nombre_completo || 'Sin asignar'}
              </h4>
              {vivienda.fecha_asignacion && (
                <p className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                  <Calendar className='h-3 w-3' />
                  {formatDate(vivienda.fecha_asignacion)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN: Información Técnica (si existe) */}
        {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
          <div className='mb-2.5 rounded-lg border-2 border-slate-200/50 bg-gradient-to-br from-slate-50 to-gray-50 p-2.5 dark:border-slate-700/50 dark:from-slate-900/20 dark:to-gray-900/20'>
            <div className='mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300'>
              <MapPin className='h-3.5 w-3.5' />
              Información Legal
            </div>
            <div className='space-y-1.5'>
              {vivienda.matricula_inmobiliaria && (
                <div className='flex items-center gap-1.5'>
                  <div className='flex-shrink-0 rounded-md bg-blue-100 p-1 dark:bg-blue-900/30'>
                    <Hash className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                      Matrícula
                    </p>
                    <p className='truncate font-mono text-xs font-bold text-gray-900 dark:text-white'>
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                </div>
              )}
              {vivienda.nomenclatura && (
                <div className='flex items-center gap-1.5'>
                  <div className='flex-shrink-0 rounded-md bg-purple-100 p-1 dark:bg-purple-900/30'>
                    <MapPinned className='h-3 w-3 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400'>
                      Nomenclatura
                    </p>
                    <p className='truncate text-xs font-bold text-gray-900 dark:text-white'>
                      {vivienda.nomenclatura}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN: Progreso de Pago */}
        <div className='mb-2.5 rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-2.5 dark:border-emerald-700 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20'>
          <div className='mb-1.5 flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300'>
              <TrendingUp className='h-3.5 w-3.5' />
              Progreso de Pago
            </div>
            <div className='bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-lg font-black text-transparent'>
              {porcentaje.toFixed(1)}%
            </div>
          </div>

          {/* Barra de progreso */}
          <div className='mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 shadow-lg shadow-emerald-500/50 transition-all duration-700'
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>

          {/* Detalles financieros */}
          <div className='space-y-1 text-xs'>
            <div className='flex justify-between text-gray-700 dark:text-gray-300'>
              <span className='font-semibold'>Valor Total:</span>
              <span className='font-bold'>{formatCurrency(valorTotal)}</span>
            </div>
            <div className='flex justify-between text-emerald-700 dark:text-emerald-300'>
              <span className='font-semibold'>✅ Abonado:</span>
              <span className='font-bold'>{formatCurrency(abonado)}</span>
            </div>
            <div className='flex justify-between text-amber-700 dark:text-amber-300'>
              <span className='font-semibold'>📊 Pendiente:</span>
              <span className='font-bold'>{formatCurrency(pendiente)}</span>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className='flex items-center justify-between gap-2 border-t border-gray-200 pt-2 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            {onVerAbonos && (
              <button
                onClick={onVerAbonos}
                className='flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
              >
                <FileCheck className='h-3.5 w-3.5' />
                Abonos ({vivienda.cantidad_abonos || 0})
              </button>
            )}
            {onRegistrarPago && (
              <button
                onClick={onRegistrarPago}
                className='flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs font-bold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg'
              >
                <DollarSign className='h-3.5 w-3.5' />
                Pago
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
