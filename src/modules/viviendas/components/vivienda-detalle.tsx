/**
 * ViviendaDetalle - Vista completa de información de una vivienda
 * Muestra todos los detalles técnicos, financieros, documentos y estado
 */

'use client'

import { formatCurrency } from '@/shared/utils'
import { motion } from 'framer-motion'
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Hash,
  Home,
  MapPin,
  MapPinned,
  Ruler,
  User,
  UserPlus,
} from 'lucide-react'
import type { Vivienda } from '../types'

interface ViviendaDetalleProps {
  vivienda: Vivienda
  onAsignarCliente?: () => void
  onVerAbonos?: () => void
  onRegistrarPago?: () => void
  onEditar?: () => void
  onCerrar?: () => void
}

export function ViviendaDetalle({
  vivienda,
  onAsignarCliente,
  onVerAbonos,
  onRegistrarPago,
  onEditar,
  onCerrar,
}: ViviendaDetalleProps) {
  const proyectoNombre = vivienda.manzanas?.proyectos?.nombre || 'Sin proyecto'
  const manzanaNombre = vivienda.manzanas?.nombre || '?'

  const getEstadoColor = () => {
    switch (vivienda.estado) {
      case 'Disponible':
        return 'from-teal-500 via-emerald-500 to-green-500'
      case 'Asignada':
        return 'from-blue-500 via-indigo-500 to-purple-500'
      case 'Pagada':
        return 'from-emerald-600 via-green-600 to-teal-700'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* HEADER */}
      <div className={`bg-gradient-to-r ${getEstadoColor()} text-white p-6 rounded-t-xl -m-6 mb-6`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Manzana {manzanaNombre} - Casa {vivienda.numero}
              </h2>
            </div>
            <div className="flex items-center gap-3 ml-[56px]">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90">{proyectoNombre}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-900 shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              {vivienda.estado}
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                {vivienda.tipo_vivienda || 'Regular'}
              </span>
              {vivienda.es_esquinera && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                  🏘️ Esquinera
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {/* INFORMACIÓN TÉCNICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matrícula */}
          {vivienda.matricula_inmobiliaria && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Matrícula Inmobiliaria
                </h3>
              </div>
              <p className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100 ml-11">
                {vivienda.matricula_inmobiliaria}
              </p>
            </div>
          )}

          {/* Nomenclatura */}
          {vivienda.nomenclatura && (
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MapPinned className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nomenclatura Catastral
                </h3>
              </div>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100 ml-11">
                {vivienda.nomenclatura}
              </p>
            </div>
          )}
        </div>

        {/* ÁREAS */}
        <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Ruler className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
              Información de Áreas
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-11">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                Área Construida
              </p>
              <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                {vivienda.area_construida || 'N/A'} m<sup>2</sup>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-800">
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold mb-1">
                Área de Lote
              </p>
              <p className="text-3xl font-black text-teal-900 dark:text-teal-100">
                {vivienda.area_lote || 'N/A'} m<sup>2</sup>
              </p>
            </div>
          </div>
        </div>

        {/* VALOR COMERCIAL */}
        <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <p className="text-sm font-medium text-white/80">Valor Comercial</p>
              </div>
              <p className="text-4xl font-black tracking-tight">
                {formatCurrency(vivienda.valor_total)}
              </p>
            </div>
            {vivienda.es_esquinera && vivienda.recargo_esquinera > 0 && (
              <div className="text-right">
                <p className="text-xs text-white/70 mb-1">Incluye recargo esquinera</p>
                <p className="text-2xl font-bold text-yellow-200">
                  +{formatCurrency(vivienda.recargo_esquinera)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* INFORMACIÓN DEL CLIENTE (si aplica) */}
        {vivienda.estado !== 'Disponible' && (
          <div className="p-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
                Información del Cliente
              </h3>
            </div>
            <div className="ml-11 space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {/* TODO: Mostrar nombre del cliente */}
                  Cliente Asignado
                </p>
              </div>
              {vivienda.fecha_asignacion && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Asignada el {new Date(vivienda.fecha_asignacion).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACCIONES */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          {vivienda.estado === 'Disponible' && onAsignarCliente && (
            <button
              onClick={onAsignarCliente}
              className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Asignar Cliente</span>
            </button>
          )}

          {vivienda.estado === 'Asignada' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onVerAbonos && (
                <button
                  onClick={onVerAbonos}
                  className="px-5 py-3 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Abonos</span>
                </button>
              )}
              {onRegistrarPago && (
                <button
                  onClick={onRegistrarPago}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Registrar Pago</span>
                </button>
              )}
            </div>
          )}

          {onEditar && (
            <button
              onClick={onEditar}
              className="w-full px-5 py-3 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Vivienda</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
