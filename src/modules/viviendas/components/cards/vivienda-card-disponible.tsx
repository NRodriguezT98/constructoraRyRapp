/**
 * ViviendaCardDisponible - Card para viviendas disponibles
 * Componente presentacional puro
 */

import { formatCurrency } from '@/shared/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Home, MapPin, UserPlus, FileText, Hash, MapPinned, Ruler, Eye, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { viviendaCardExtendedStyles as styles } from '../../styles'
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
  
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false)
      }
    }

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuAbierto])

  const handleAccion = (accion: () => void) => {
    setMenuAbierto(false)
    accion()
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* HEADER */}
      <div className="px-6 py-5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Manzana {manzanaNombre} Casa {vivienda.numero}
              </h3>
            </div>
            
            {/* Proyecto justo debajo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white/90">{proyectoNombre}</p>
            </div>
          </div>

          {/* Badges en columna */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-600 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Disponible
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm">
                {vivienda.tipo_vivienda || 'Regular'}
              </span>
              {vivienda.es_esquinera && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                  🏘️ Esquinera
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-5">
        
        {/* SECCIÓN: DETALLES TÉCNICOS - ANCHO COMPLETO */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 mb-5 pb-2 border-b border-slate-300 dark:border-slate-600">
            <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Detalles Técnicos
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Matrícula - Ancho completo */}
            {vivienda.matricula_inmobiliaria && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                  <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    Matrícula
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                    {vivienda.matricula_inmobiliaria}
                  </p>
                </div>
              </div>
            )}

            {/* Nomenclatura - Ancho completo */}
            {vivienda.nomenclatura && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-200">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                  <MapPinned className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    Nomenclatura
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {vivienda.nomenclatura}
                  </p>
                </div>
              </div>
            )}

            {/* Áreas - Ancho completo */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors duration-200">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Áreas
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Construida</p>
                    <div className="w-px h-4 bg-blue-300 dark:bg-blue-700"></div>
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                      {vivienda.area_construida || 'N/A'} m<sup>2</sup>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Lote</p>
                    <div className="w-px h-4 bg-green-300 dark:bg-green-700"></div>
                    <p className="text-xs font-bold text-green-900 dark:text-green-100">
                      {vivienda.area_lote || 'N/A'} m<sup>2</sup>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: VALOR COMERCIAL - SIMPLIFICADO */}
        <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1 flex items-center gap-2">
                <span className="text-xl">💰</span>
                Valor Comercial
              </p>
              <p className="text-3xl font-black tracking-tight" title={formatCurrency(vivienda.valor_total)}>
                {formatCurrency(vivienda.valor_total)}
              </p>
            </div>
            {vivienda.es_esquinera && vivienda.recargo_esquinera > 0 && (
              <div className="text-right">
                <p className="text-xs text-white/70 mb-1">Incluye recargo esquinera</p>
                <p className="text-lg font-bold text-yellow-200">
                  +{formatCurrency(vivienda.recargo_esquinera)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - Menú de acciones */}
      <div className="px-6 py-3 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 group"
            aria-label="Menú de acciones"
          >
            <MoreVertical className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          <AnimatePresence>
            {menuAbierto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10"
              >
                <div className="py-1">
                  {onVerDetalle && (
                    <button
                      onClick={() => handleAccion(onVerDetalle)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-3"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalle</span>
                    </button>
                  )}
                  {onAsignarCliente && (
                    <button
                      onClick={() => handleAccion(onAsignarCliente)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-3"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Asignar Cliente</span>
                    </button>
                  )}
                  {onEditar && (
                    <button
                      onClick={() => handleAccion(onEditar)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
