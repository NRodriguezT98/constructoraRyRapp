/**
 * PreviewSidebar - Sidebar sticky con preview en tiempo real
 * ✅ Diseño compacto estándar
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Building2,
    CheckCircle,
    Circle,
    Compass,
    DollarSign,
    Eye,
    FileText,
    Home,
    MapPin,
    Maximize,
} from 'lucide-react'
import { useMemo } from 'react'
import type { ResumenFinanciero } from '../types'

interface PreviewData {
  proyecto: string | null
  manzana: string | null
  numero: string
  linderos: {
    norte: string
    sur: string
    oriente: string
    occidente: string
  }
  legal: {
    matricula: string
    nomenclatura: string
    areaLote: number | null
    areaConstruida: number | null
    tipo: string
  }
  financiero: {
    valorBase: number | null
    esEsquinera: boolean
    recargoEsquinera: number | null
    valorTotal: number
  }
}

interface PreviewSidebarProps {
  data: PreviewData
  proyectoNombre?: string | null
  manzanaNombre?: string | null
  resumenFinanciero?: ResumenFinanciero
}

export function PreviewSidebar({ data, proyectoNombre, manzanaNombre, resumenFinanciero }: PreviewSidebarProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // Calcular completitud de cada sección
  const completitud = useMemo(() => {
    return {
      ubicacion: !!(data.proyecto && data.manzana && data.numero),
      linderos: !!(data.linderos.norte && data.linderos.sur && data.linderos.oriente && data.linderos.occidente),
      legal: !!(data.legal.matricula && data.legal.nomenclatura && data.legal.areaLote && data.legal.areaConstruida && data.legal.tipo),
      financiero: !!(data.financiero.valorBase),
    }
  }, [data])

  const progresoTotal = useMemo(() => {
    const completadas = Object.values(completitud).filter(Boolean).length
    return Math.round((completadas / 4) * 100)
  }, [completitud])

  const sections = [
    {
      id: 'ubicacion',
      title: 'Ubicación',
      icon: MapPin,
      color: 'blue',
      completa: completitud.ubicacion,
      items: [
        { label: 'Proyecto', value: proyectoNombre || 'No seleccionado', icon: Building2 },
        { label: 'Manzana', value: manzanaNombre || 'No seleccionada', icon: MapPin },
        { label: 'Número', value: data.numero || 'No ingresado', icon: Home },
      ],
    },
    {
      id: 'linderos',
      title: 'Linderos',
      icon: Compass,
      color: 'purple',
      completa: completitud.linderos,
      items: [
        { label: 'Norte', value: data.linderos.norte ? '✓' : '✗' },
        { label: 'Sur', value: data.linderos.sur ? '✓' : '✗' },
        { label: 'Oriente', value: data.linderos.oriente ? '✓' : '✗' },
        { label: 'Occidente', value: data.linderos.occidente ? '✓' : '✗' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: FileText,
      color: 'green',
      completa: completitud.legal,
      items: [
        { label: 'Matrícula', value: data.legal.matricula || 'No ingresada', icon: FileText },
        { label: 'Áreas', value: data.legal.areaLote ? `${data.legal.areaLote} m²` : 'No ingresadas', icon: Maximize },
        { label: 'Tipo', value: data.legal.tipo || 'No seleccionado', icon: Home },
      ],
    },
    {
      id: 'financiero',
      title: 'Financiero',
      icon: DollarSign,
      color: 'orange',
      completa: completitud.financiero,
      items: resumenFinanciero ? [
        { label: 'Valor Base', value: formatCurrency(resumenFinanciero.valor_base), icon: DollarSign },
        { label: 'Gastos Notariales', value: formatCurrency(resumenFinanciero.gastos_notariales), icon: FileText },
        ...(resumenFinanciero.recargo_esquinera > 0 ? [{ label: 'Recargo Esquinera', value: formatCurrency(resumenFinanciero.recargo_esquinera), icon: Home }] : []),
        { label: 'Valor Total', value: formatCurrency(resumenFinanciero.valor_total), icon: DollarSign, highlight: true },
      ] : [
        { label: 'Valor Total', value: formatCurrency(data.financiero.valorTotal), icon: DollarSign, highlight: true },
      ],
    },
  ]

  return (
    <div className="sticky top-24 space-y-4">
      {/* Header del Preview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vista Previa</h3>
            <p className="text-xs text-orange-100 dark:text-orange-200">En tiempo real</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white">
            <span>Completitud</span>
            <span className="font-bold">{progresoTotal}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progresoTotal}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
        </div>
      </motion.div>

      {/* Secciones de preview */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const SectionIcon = section.icon

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-lg"
            >
              {/* Header de sección */}
              <div className="flex items-center gap-2 mb-3">
                {section.completa ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                )}
                <SectionIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h4>
              </div>

              {/* Items de la sección */}
              <div className="space-y-2">
                <AnimatePresence>
                  {section.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon

                    return (
                      <motion.div
                        key={`item-${itemIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-2 text-xs ${
                          item.highlight
                            ? 'p-2 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800'
                            : ''
                        }`}
                      >
                        {ItemIcon && (
                          <ItemIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            item.highlight
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${
                            item.highlight
                              ? 'text-orange-900 dark:text-orange-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.label}
                          </p>
                          <p className={`mt-0.5 truncate ${
                            item.highlight
                              ? 'font-bold text-sm bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.value}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Nota final */}
      {progresoTotal === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
        >
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
            ¡Formulario completo! Puedes guardar la vivienda.
          </p>
        </motion.div>
      )}
    </div>
  )
}
