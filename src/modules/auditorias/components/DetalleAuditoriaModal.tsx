/**
 * DetalleAuditoriaModal - Modal detallado para mostrar información de auditoría
 *
 * Muestra información contextual según el módulo:
 * - Proyectos: nombre, ubicación, manzanas, viviendas, presupuesto
 * - Viviendas: nombre, precio, área, proyecto, manzana
 * - Clientes: nombre completo, documento, teléfono, email
 * - Negociaciones: cliente, vivienda, valor, estado
 * - Otros: información genérica
 *
 * ✅ DISEÑO PREMIUM:
 * - Modal con glassmorphism
 * - Secciones colapsables
 * - Iconos contextuales
 * - Modo oscuro completo
 */

'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CreditCard,
    DollarSign,
    Edit3,
    FileText,
    Home,
    MapPin,
    Phone,
    Trash2,
    User,
    Users,
    X
} from 'lucide-react'
import { useState } from 'react'
import type { AuditLogRecord } from '../types'

interface DetalleAuditoriaModalProps {
  registro: AuditLogRecord
  onClose: () => void
}

export function DetalleAuditoriaModal({ registro, onClose }: DetalleAuditoriaModalProps) {
  const [seccionAbierta, setSeccionAbierta] = useState<string>('principal')

  const toggleSeccion = (seccion: string) => {
    setSeccionAbierta(seccionAbierta === seccion ? '' : seccion)
  }

  const getAccionLabel = (accion: string) => {
    switch (accion) {
      case 'CREATE': return 'Creación'
      case 'UPDATE': return 'Actualización'
      case 'DELETE': return 'Eliminación'
      default: return accion
    }
  }

  const getAccionBadge = (accion: string) => {
    switch (accion) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-500/30 text-green-700 dark:text-green-400 font-bold shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            Creación
          </span>
        )
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-400 font-bold shadow-lg">
            <Edit3 className="w-5 h-5" />
            Actualización
          </span>
        )
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-rose-500/20 dark:from-red-500/20 dark:to-rose-500/20 border border-red-500/30 text-red-700 dark:text-red-400 font-bold shadow-lg">
            <Trash2 className="w-5 h-5" />
            Eliminación
          </span>
        )
      default:
        return <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold">{accion}</span>
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatearDinero = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor)
  }

  // Renderizar detalles específicos según el módulo
  const renderDetallesProyecto = () => {
    const metadata = registro.metadata || {}
    const manzanas = metadata.manzanas_detalle || []

    return (
      <div className="space-y-6">
        {/* Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre del Proyecto</label>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {metadata.proyecto_nombre || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ubicación</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
              {metadata.proyecto_ubicacion || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
                {metadata.proyecto_estado || 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Presupuesto</label>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              {metadata.proyecto_presupuesto_formateado || formatearDinero(metadata.proyecto_presupuesto || 0)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Responsable</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {metadata.proyecto_responsable || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Phone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              {metadata.proyecto_telefono || 'N/A'}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {metadata.proyecto_descripcion && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descripción</label>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              {metadata.proyecto_descripcion}
            </p>
          </div>
        )}

        {/* Manzanas */}
        {manzanas.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Manzanas Creadas ({metadata.total_manzanas || manzanas.length})
              </label>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                Total: {metadata.total_viviendas_planificadas || 0} viviendas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {manzanas.map((manzana: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-102 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                        Manzana {manzana.nombre}
                      </h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold capitalize">
                        {manzana.estado || 'planificada'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>Viviendas:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{manzana.numero_viviendas}</span>
                      </div>
                      {manzana.precio_base && (
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                          <span>Precio base:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {formatearDinero(manzana.precio_base)}
                          </span>
                        </div>
                      )}
                      {manzana.superficie_total && (
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                          <span>Superficie:</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {manzana.superficie_total} m²
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha de Inicio</label>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              {metadata.proyecto_fecha_inicio ? new Date(metadata.proyecto_fecha_inicio).toLocaleDateString('es-ES') : 'N/A'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha Fin Estimada</label>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              {metadata.proyecto_fecha_fin_estimada ? new Date(metadata.proyecto_fecha_fin_estimada).toLocaleDateString('es-ES') : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDetallesVivienda = () => {
    const metadata = registro.metadata || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre</label>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              {metadata.vivienda_nombre || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Número</label>
            <div className="text-base font-bold text-gray-900 dark:text-white">
              #{metadata.vivienda_numero || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor Base</label>
            <div className="flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400">
              <DollarSign className="w-5 h-5" />
              {metadata.vivienda_valor_formateado || formatearDinero(metadata.vivienda_valor_base || 0)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
              {metadata.vivienda_estado || 'N/A'}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Área</label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.vivienda_area || 'N/A'} m²
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Habitaciones / Baños</label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.vivienda_habitaciones || 0} hab. / {metadata.vivienda_banos || 0} baños
            </div>
          </div>

          {metadata.proyecto_nombre && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto</label>
              <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {metadata.proyecto_nombre}
              </div>
            </div>
          )}

          {metadata.manzana_nombre && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manzana</label>
              <div className="text-base text-gray-900 dark:text-white">
                Manzana {metadata.manzana_nombre}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDetallesCliente = () => {
    const metadata = registro.metadata || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nombre Completo</label>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {metadata.cliente_nombre_completo || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Documento</label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.cliente_tipo_documento || 'CC'} {metadata.cliente_numero_documento || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Phone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              {metadata.cliente_telefono || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.cliente_email || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ciudad</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
              {metadata.cliente_ciudad || 'N/A'}, {metadata.cliente_departamento || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
              {metadata.cliente_estado || 'N/A'}
            </span>
          </div>

          {metadata.cliente_origen && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Origen</label>
              <div className="text-base text-gray-900 dark:text-white">
                {metadata.cliente_origen}
              </div>
            </div>
          )}

          {metadata.cliente_referido_por && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Referido por</label>
              <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                <Users className="w-5 h-5 text-gray-400" />
                {metadata.cliente_referido_por}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDetallesNegociacion = () => {
    const metadata = registro.metadata || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cliente</label>
            <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {metadata.cliente_nombre || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Documento</label>
            <div className="text-base text-gray-900 dark:text-white">
              {metadata.cliente_documento || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vivienda</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Home className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              {metadata.vivienda_nombre || `#${metadata.vivienda_numero}` || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto</label>
            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {metadata.proyecto_nombre || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor Total</label>
            <div className="flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400">
              <DollarSign className="w-5 h-5" />
              {metadata.negociacion_valor_formateado || formatearDinero(metadata.negociacion_valor_total || 0)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold capitalize">
              {metadata.negociacion_estado || 'N/A'}
            </span>
          </div>

          {metadata.negociacion_cuota_inicial && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cuota Inicial</label>
              <div className="flex items-center gap-2 text-base text-gray-900 dark:text-white">
                <CreditCard className="w-5 h-5 text-gray-400" />
                {formatearDinero(metadata.negociacion_cuota_inicial)}
              </div>
            </div>
          )}

          {metadata.negociacion_saldo_pendiente && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saldo Pendiente</label>
              <div className="text-base font-bold text-red-600 dark:text-red-400">
                {formatearDinero(metadata.negociacion_saldo_pendiente)}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderDetallesGenericos = () => {
    return (
      <div className="space-y-4">
        {registro.datosNuevos && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Datos del Registro</label>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
              <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(registro.datosNuevos, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {registro.metadata && Object.keys(registro.metadata).length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Metadata Adicional</label>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
              <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(registro.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {registro.cambiosEspecificos && Object.keys(registro.cambiosEspecificos).length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Cambios Específicos</label>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 overflow-auto max-h-64 border border-gray-200 dark:border-gray-700">
              <pre className="text-xs text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(registro.cambiosEspecificos, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDetallesModulo = () => {
    switch (registro.modulo) {
      case 'proyectos':
        return renderDetallesProyecto()
      case 'viviendas':
        return renderDetallesVivienda()
      case 'clientes':
        return renderDetallesCliente()
      case 'negociaciones':
        return renderDetallesNegociacion()
      default:
        return renderDetallesGenericos()
    }
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 px-8 py-6">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Detalles de Auditoría
                  </h3>
                  <p className="text-blue-100 text-sm mt-0.5 capitalize">
                    {registro.modulo || registro.tabla} • {getAccionLabel(registro.accion)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body con scroll */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-8">
            <div className="space-y-6">
              {/* Información de la Acción */}
              <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  {getAccionBadge(registro.accion)}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Realizado por</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {registro.usuarioEmail}
                      {registro.usuarioRol && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium capitalize">
                          {registro.usuarioRol}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha y Hora</p>
                  <p className="text-base text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatearFecha(registro.fechaEvento)}
                  </p>
                </div>
              </div>

              {/* Detalles del Módulo */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Información Detallada
                </h4>
                {renderDetallesModulo()}
              </div>

              {/* JSON Completo (colapsable) */}
              {(registro.datosNuevos || registro.cambiosEspecificos || registro.metadata) && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSeccion('json')}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Ver datos técnicos (JSON)
                    </span>
                    {seccionAbierta === 'json' ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {seccionAbierta === 'json' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {renderDetallesGenericos()}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-900 dark:text-white font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
