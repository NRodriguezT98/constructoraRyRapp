'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Home, User } from 'lucide-react'
import Link from 'next/link'
import { NegociacionConAbonos } from '../types'

interface ClienteCardProps {
  negociacion: NegociacionConAbonos
}

/**
 * Tarjeta compacta de cliente con resumen de negociación
 * Diseño tipo lista con hover effect
 */
export function ClienteCard({ negociacion }: ClienteCardProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()

  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const valorTotal = negociacion.valor_total || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  // Construir descripción completa de la vivienda
  const descripcionVivienda = vivienda.numero
    ? `Casa N° ${vivienda.numero}`
    : 'Vivienda'

  return (
    <Link href={`/abonos/${cliente.id}`}>
      <motion.div
        className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.01, y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Fila principal */}
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Columna izquierda: Cliente */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mb-0.5">
                {nombreCompleto}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                CC {cliente.numero_documento}
              </p>

              {/* Info de la vivienda - debajo del nombre */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 flex-wrap">
                {proyecto && (
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    <Building2 className="w-3 h-3" />
                    <span className="font-medium">{proyecto.nombre}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                  <Home className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">
                    {vivienda.manzana?.nombre ? `Mz. ${vivienda.manzana.nombre}` : ''}
                    {vivienda.manzana?.nombre && vivienda.numero ? ' - ' : ''}
                    {vivienda.numero ? `Casa N° ${vivienda.numero}` : 'Vivienda'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen financiero */}
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  ${(valorTotal / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded px-2 py-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pagado</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  ${(totalAbonado / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded px-2 py-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pendiente</p>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                  ${(saldoPendiente / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>

            {/* Ícono de acción */}
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>

        {/* Barra de progreso - debajo */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Progreso de pago
            </span>
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {porcentajePagado.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 shadow-sm"
              style={{ width: `${porcentajePagado}%` }}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
