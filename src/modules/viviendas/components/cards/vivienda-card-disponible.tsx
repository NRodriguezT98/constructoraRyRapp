/**
 * ViviendaCardDisponible - Card con misma estructura que asignada pero con empty states
 * Altura idéntica a ViviendaCardAsignada
 */

import { motion } from 'framer-motion'
import {
  Building2,
  Edit,
  Eye,
  Hash,
  Home,
  MapPin,
  MapPinned,
  Sparkles,
  TrendingUp,
  UserPlus,
} from 'lucide-react'

import { formatCurrency } from '@/shared/utils'

import type { Vivienda } from '../../types'

interface ViviendaCardDisponibleProps {
  vivienda: Vivienda
  onVerDetalle?: () => void
  onAsignarCliente?: () => void
  onEditar?: () => void
}

export function ViviendaCardDisponible({
  vivienda,
  onVerDetalle,
  onAsignarCliente,
  onEditar,
}: ViviendaCardDisponibleProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'

  return (
    <motion.div
      className='group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 dark:border-gray-700/50 dark:bg-gray-800/80'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

      {/* HEADER */}
      <div className='relative z-10 p-3'>
        {/* Botones de acción (superior derecho) */}
        <div className='mb-1.5 flex items-start justify-end gap-1'>
          {onVerDetalle && (
            <button
              onClick={onVerDetalle}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-emerald-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
              title='Ver detalle'
            >
              <Eye className='h-3.5 w-3.5' />
            </button>
          )}
          {onEditar && (
            <button
              onClick={onEditar}
              className='rounded-lg p-1 text-gray-600 transition-all hover:bg-emerald-100 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400'
              title='Editar'
            >
              <Edit className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        {/* Icono + Título + Badge Estado */}
        <div className='mb-2 flex items-start gap-2.5'>
          <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg'>
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
          <span className='inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-xs font-bold text-white shadow-md shadow-emerald-500/30'>
            <div className='h-1.5 w-1.5 rounded-full bg-white' />
            DISPONIBLE
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

        {/* SECCIÓN: Cliente Asignado - EMPTY STATE */}
        <div className='mb-2.5 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-2.5 dark:border-gray-600 dark:from-gray-900/20 dark:to-slate-900/20'>
          <div className='mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
            <UserPlus className='h-3.5 w-3.5' />
            Cliente Asignado
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 opacity-50'>
              <UserPlus className='h-3.5 w-3.5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <h4 className='text-xs font-semibold italic text-gray-400 dark:text-gray-500'>
                Sin cliente asignado
              </h4>
              <p className='text-[10px] text-gray-400 dark:text-gray-500'>
                Disponible para asignación
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Información Legal (condicional) */}
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

        {/* SECCIÓN: Progreso de Pago - EMPTY STATE */}
        <div className='mb-2.5 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-2.5 dark:border-gray-600 dark:from-gray-900/20 dark:to-slate-900/20'>
          <div className='mb-1.5 flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
              <TrendingUp className='h-3.5 w-3.5' />
              Progreso de Pago
            </div>
            <div className='text-lg font-black text-gray-300 dark:text-gray-600'>
              0%
            </div>
          </div>

          {/* Barra de progreso vacía */}
          <div className='mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
            <div className='h-full w-0 rounded-full bg-gray-300 dark:bg-gray-600' />
          </div>

          {/* Detalles financieros - Empty state con misma altura */}
          <div className='space-y-1 text-xs'>
            <div className='flex justify-between text-gray-400 dark:text-gray-500'>
              <span className='font-semibold'>Valor Total:</span>
              <span className='font-bold'>
                {formatCurrency(vivienda.valor_base || 0)}
              </span>
            </div>
            <div className='flex justify-between text-gray-400 dark:text-gray-500'>
              <span className='font-semibold'>✅ Abonado:</span>
              <span className='font-bold'>$ 0</span>
            </div>
            <div className='flex justify-between text-gray-400 dark:text-gray-500'>
              <span className='font-semibold'>📊 Pendiente:</span>
              <span className='font-bold'>
                {formatCurrency(vivienda.valor_base || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className='flex items-center justify-between gap-2 border-t border-gray-200 pt-2 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            {onAsignarCliente && (
              <button
                onClick={onAsignarCliente}
                className='flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 text-xs font-bold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg'
              >
                <UserPlus className='h-3.5 w-3.5' />
                Asignar Cliente
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
