'use client'

import { Button } from '@/components/ui/button'
import { useAbonos } from '@/modules/abonos/hooks'
import { containerStyles, textStyles } from '@/modules/abonos/styles'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Calendar, CreditCard, DollarSign, Home, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Página de detalle de cliente y gestión de abonos
 * Muestra: info cliente, vivienda, fuentes de pago, historial
 */
export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.clienteId as string

  const { negociaciones, isLoading } = useAbonos()

  // Buscar la negociación del cliente
  const negociacion = useMemo(
    () => negociaciones.find((n) => n.cliente.id === clienteId),
    [negociaciones, clienteId]
  )

  if (isLoading) {
    return (
      <div className={containerStyles.section}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!negociacion) {
    return (
      <div className={containerStyles.section}>
        <div className="text-center py-16">
          <User className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className={textStyles.heading}>Cliente no encontrado</h3>
          <p className={textStyles.muted}>
            No se encontró información para este cliente
          </p>
          <Button onClick={() => router.push('/abonos')} className="mt-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    )
  }

  const { cliente, vivienda, proyecto, fuentes_pago } = negociacion
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()
  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const valorTotal = negociacion.valor_total || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  // DEBUG: Verificar datos de contacto
  console.log('📋 Datos de cliente:', {
    nombre: nombreCompleto,
    telefono: cliente.telefono,
    email: cliente.email,
    tieneContacto: !!(cliente.telefono || cliente.email)
  })

  return (
    <div className={containerStyles.section}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header compacto con botón de regreso */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/abonos')}
              className="gap-1.5 h-9 px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className={textStyles.title}>Gestión de Abonos</h1>
              <p className={textStyles.subtitle}>Cliente: {nombreCompleto}</p>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white h-9 px-3 gap-1.5">
            <CreditCard className="w-4 h-4" />
            Registrar Abono
          </Button>
        </div>

        {/* Card de información - Layout optimizado 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna izquierda: Cliente + Vivienda (2/3 del espacio) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {/* Header con info del cliente */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {nombreCompleto}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CC {cliente.numero_documento}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {negociacion.estado}
              </span>
            </div>

            {/* Grid de información combinada - 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Datos de contacto */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Contacto
                </h4>
                <div className="space-y-1.5 text-xs">
                  {cliente.telefono ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">📞</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cliente.telefono}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                      <span>📞</span>
                      <span className="italic">No registrado</span>
                    </div>
                  )}
                  {cliente.email ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">✉️</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {cliente.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                      <span>✉️</span>
                      <span className="italic">No registrado</span>
                    </div>
                  )}
                  {cliente.ciudad && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">📍</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cliente.ciudad}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de la vivienda */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Vivienda
                </h4>
                <div className="space-y-1.5 text-xs">
                  {proyecto && (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1.5 rounded">
                      <Building2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {proyecto.nombre}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {vivienda.manzana && `Mz. ${vivienda.manzana.nombre}`} - Casa N° {vivienda.numero}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Área:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {vivienda.area} m²
                    </span>
                  </div>
                  {vivienda.tipo_vivienda && (
                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {vivienda.tipo_vivienda}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen Financiero (1/3 del espacio) */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Resumen Financiero
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Valor Total destacado */}
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5 border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                  Valor Total
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${valorTotal.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Abonado y Pendiente - Grid compacto */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-100/80 dark:bg-green-900/40 rounded p-2">
                  <p className="text-xs text-green-700 dark:text-green-400 mb-0.5">
                    Abonado
                  </p>
                  <p className="text-base font-bold text-green-600 dark:text-green-400">
                    ${totalAbonado.toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="bg-orange-100/80 dark:bg-orange-900/40 rounded p-2">
                  <p className="text-xs text-orange-700 dark:text-orange-400 mb-0.5">
                    Pendiente
                  </p>
                  <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                    ${saldoPendiente.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="pt-1.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Progreso
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {porcentajePagado.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/70 dark:bg-gray-800/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${porcentajePagado}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fuentes de Pago - Más compactas */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Fuentes de Pago
          </h3>

          {fuentes_pago && fuentes_pago.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fuentes_pago.map((fuente) => {
                const porcentajeFuente =
                  fuente.monto_aprobado > 0
                    ? ((fuente.monto_recibido || 0) / fuente.monto_aprobado) * 100
                    : 0

                return (
                  <div
                    key={fuente.id}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    {/* Header con título y porcentaje */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {fuente.tipo}
                        </h4>
                        {fuente.entidad && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {fuente.entidad}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ml-2 flex-shrink-0 ${
                          porcentajeFuente >= 100
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : porcentajeFuente > 0
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {porcentajeFuente.toFixed(0)}%
                      </span>
                    </div>

                    {/* Grid de montos - 3 columnas compactas */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Aprobado</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          ${fuente.monto_aprobado.toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Recibido</p>
                        <p className="text-xs font-bold text-green-600 dark:text-green-400">
                          ${(fuente.monto_recibido || 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-orange-600 dark:text-orange-400 mb-0.5">Pendiente</p>
                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          ${(fuente.saldo_pendiente || 0).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso mejorada */}
                    <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {porcentajeFuente > 0 ? (
                        <div
                          className={`h-full transition-all duration-500 ${
                            porcentajeFuente >= 100
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(porcentajeFuente, 100)}%` }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            Sin abonos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
              No hay fuentes de pago registradas
            </p>
          )}
        </div>

        {/* Historial de Abonos - Por implementar */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Historial de Abonos
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aún no hay abonos registrados</p>
            <p className="text-xs mt-1">
              Los abonos aparecerán aquí una vez registrados
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
