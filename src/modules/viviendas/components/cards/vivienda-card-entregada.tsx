/**
 * ViviendaCardEntregada - Card completa con TODA la información
 * Muestra: Cliente, Proyecto, Información Legal, Estado 100% Pagada
 */

import { motion } from 'framer-motion'
import { 
  Home, MapPin, Building2, User, Phone, Calendar, Hash, MapPinned,
  Edit, Eye, FileCheck, CheckCircle2
} from 'lucide-react'

import { formatCurrency, formatDate } from '@/shared/utils'

import type { Vivienda } from '../../types'

interface ViviendaCardEntregadaProps {
  vivienda: Vivienda
  onVerDetalle?: () => void
  onVerAbonos?: () => void
  onEditar?: () => void
}

export function ViviendaCardEntregada({
  vivienda,
  onVerDetalle,
  onVerAbonos,
  onEditar,
}: ViviendaCardEntregadaProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'
  const cliente = vivienda.clientes

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-violet-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 p-5">
        {/* Botones de acción (superior derecho) */}
        <div className="flex items-start justify-end gap-1.5 mb-3">
          {onVerDetalle && (
            <button
              onClick={onVerDetalle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEditar && (
            <button
              onClick={onEditar}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Icono + Título principal */}
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
              Manzana {manzanaNombre} Casa {vivienda.numero}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {proyectoNombre}
            </p>
          </div>
          {/* Badge Estado Pagada */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-md shadow-green-500/30">
            <CheckCircle2 className="w-4 h-4" />
            PAGADA
          </span>
        </div>

        {/* SECCIÓN: Cliente */}
        <div className="mb-4 rounded-xl bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-black text-purple-900 dark:text-purple-100 truncate">
                {cliente?.nombre_completo || 'Cliente no asignado'}
              </h4>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {cliente?.telefono && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
                <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cliente.telefono}</span>
              </div>
            )}
            {vivienda.fecha_entrega && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {formatDate(vivienda.fecha_entrega)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN: Información Técnica (si existe) */}
        {(vivienda.matricula_inmobiliaria || vivienda.nomenclatura) && (
          <div className="mb-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-200/50 dark:border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              Información Legal
            </div>
            <div className="grid grid-cols-2 gap-3">
              {vivienda.matricula_inmobiliaria && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Matrícula</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono truncate">
                      {vivienda.matricula_inmobiliaria}
                    </p>
                  </div>
                </div>
              )}
              {vivienda.nomenclatura && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                    <MapPinned className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Nomenclatura</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {vivienda.nomenclatura}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECCIÓN: Estado Completado */}
        <div className="mb-4 rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Vivienda Pagada
            </div>
          </div>

          {/* Estado de pago completo */}
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600 mb-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm font-black text-green-700 dark:text-green-300 uppercase mb-1">
              100% Pagada
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
              Completamente Cancelada
            </p>
          </div>

          {/* Valor total */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Valor Total:</span>
            <span className="text-base font-black text-gray-900 dark:text-white">
              {formatCurrency(vivienda.valor_total)}
            </span>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {onVerAbonos && (
              <button
                onClick={onVerAbonos}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
              >
                <FileCheck className="w-4 h-4" />
                Ver Abonos
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              Proceso completado
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
