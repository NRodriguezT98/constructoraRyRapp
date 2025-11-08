'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    DollarSign,
    Phone,
    User,
} from 'lucide-react'

import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/shared/utils'

interface InfoTabProps {
  vivienda: Vivienda
}

/**
 * Tab de información general de la vivienda
 * Layout optimizado en 3 columnas: Técnica, Financiera, Linderos
 * Diseño moderno con glassmorphism y gradientes sutiles
 */
export function InfoTab({ vivienda }: InfoTabProps) {
  return (
    <motion.div
      key="info"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {/* COLUMNA 1: Información Técnica */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Información Técnica
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400">Datos registrales</p>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-4">
            {vivienda.matricula_inmobiliaria && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Matrícula Inmobiliaria</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-wide">
                  {vivienda.matricula_inmobiliaria}
                </p>
              </div>
            )}
            {vivienda.nomenclatura && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Nomenclatura Catastral</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {vivienda.nomenclatura}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Área Construida</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {vivienda.area_construida || 'N/A'} m²
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Área de Lote</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {vivienda.area_lote || 'N/A'} m²
                </p>
              </div>
            </div>
          </div>

          {/* Cliente Asignado (si aplica) */}
          {vivienda.estado !== 'Disponible' && vivienda.clientes && (
            <div className="mt-6 pt-6 border-t border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cliente Asignado</h4>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {vivienda.clientes.nombre_completo || 'No disponible'}
                </p>
                {vivienda.clientes.telefono && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium">{vivienda.clientes.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* COLUMNA 2: Información Financiera */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Información Financiera
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Valores y costos</p>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Valor Base</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatCurrency(vivienda.valor_base || vivienda.valor_total)}
              </p>
            </div>

            {vivienda.es_esquinera && vivienda.recargo_esquinera > 0 && (
              <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-amber-200/30 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🏘️</span>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Recargo Esquinera</p>
                </div>
                <p className="text-base font-bold text-amber-700 dark:text-amber-300">
                  + {formatCurrency(vivienda.recargo_esquinera)}
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-800/30">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Gastos Notariales</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(vivienda.gastos_notariales || 0)}
              </p>
            </div>

            {/* Valor Total Destacado */}
            <div className="relative mt-4 p-5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)] rounded-xl" />
              <div className="relative z-10">
                <p className="text-xs font-medium text-emerald-100 mb-1">💰 Valor Total</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(vivienda.valor_total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* COLUMNA 3: Linderos */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-50/80 to-sky-50/80 dark:from-cyan-950/30 dark:to-sky-950/30 border border-cyan-200/50 dark:border-cyan-800/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-2xl">🧭</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Linderos
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">Colindancias</p>
            </div>
          </div>

          {/* Data - Grid de linderos */}
          <div className="space-y-3">
            {/* Norte */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 hover:border-cyan-400/50 dark:hover:border-cyan-600/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <span className="text-sm">⬆️</span>
                </div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Norte</p>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white pl-10">
                {vivienda.lindero_norte || 'No especificado'}
              </p>
            </div>

            {/* Sur */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 hover:border-cyan-400/50 dark:hover:border-cyan-600/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                  <span className="text-sm">⬇️</span>
                </div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Sur</p>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white pl-10">
                {vivienda.lindero_sur || 'No especificado'}
              </p>
            </div>

            {/* Oriente */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 hover:border-cyan-400/50 dark:hover:border-cyan-600/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md">
                  <span className="text-sm">➡️</span>
                </div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Oriente</p>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white pl-10">
                {vivienda.lindero_oriente || 'No especificado'}
              </p>
            </div>

            {/* Occidente */}
            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-cyan-200/30 dark:border-cyan-800/30 hover:border-cyan-400/50 dark:hover:border-cyan-600/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-sm">⬅️</span>
                </div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Occidente</p>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white pl-10">
                {vivienda.lindero_occidente || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
