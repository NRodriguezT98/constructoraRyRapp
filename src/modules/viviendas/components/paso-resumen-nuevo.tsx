/**
 * PasoResumenNuevo - Paso 5: Resumen final
 * ✅ Diseño compacto estándar
 */

'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    CheckCircle,
    Compass,
    DollarSign,
    FileText,
    Home,
    MapPin,
    Maximize,
} from 'lucide-react'

interface PasoResumenProps {
  formData: any
  proyectoNombre?: string | null
  manzanaNombre?: string | null
}

export function PasoResumenNuevo({ formData, proyectoNombre, manzanaNombre }: PasoResumenProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const sections = [
    {
      title: 'Ubicación',
      icon: MapPin,
      color: 'blue',
      items: [
        { label: 'Proyecto', value: proyectoNombre || 'No seleccionado', icon: Building2 },
        { label: 'Manzana', value: manzanaNombre || 'No seleccionada', icon: MapPin },
        { label: 'Número', value: formData.numero || 'No ingresado', icon: Home },
      ],
    },
    {
      title: 'Linderos',
      icon: Compass,
      color: 'purple',
      items: [
        { label: '⬆️ Norte', value: formData.lindero_norte || 'No definido' },
        { label: '⬇️ Sur', value: formData.lindero_sur || 'No definido' },
        { label: '➡️ Oriente', value: formData.lindero_oriente || 'No definido' },
        { label: '⬅️ Occidente', value: formData.lindero_occidente || 'No definido' },
      ],
    },
    {
      title: 'Información Legal',
      icon: FileText,
      color: 'green',
      items: [
        { label: 'Matrícula Inmobiliaria', value: formData.matricula_inmobiliaria || 'No ingresada', icon: FileText },
        { label: 'Nomenclatura', value: formData.nomenclatura || 'No ingresada', icon: MapPin },
        { label: 'Área Lote', value: formData.area_lote ? `${formData.area_lote} m²` : 'No ingresada', icon: Maximize },
        { label: 'Área Construida', value: formData.area_construida ? `${formData.area_construida} m²` : 'No ingresada', icon: Maximize },
        { label: 'Tipo Vivienda', value: formData.tipo_vivienda || 'No seleccionado', icon: Home },
      ],
    },
    {
      title: 'Información Financiera',
      icon: DollarSign,
      color: 'orange',
      items: [
        { label: 'Valor Base', value: formatCurrency(formData.valor_base), icon: DollarSign },
        { label: 'Es Esquinera', value: formData.es_esquinera ? 'Sí' : 'No', icon: CheckCircle },
        ...(formData.es_esquinera ? [{ label: 'Recargo Esquinera', value: formatCurrency(formData.recargo_esquinera), icon: DollarSign }] : []),
        {
          label: 'Valor Total',
          value: formatCurrency((formData.valor_base || 0) + (formData.recargo_esquinera || 0)),
          icon: DollarSign,
          highlight: true,
        },
      ],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Título del paso */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Resumen Final
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa la información antes de guardar la vivienda
        </p>
      </div>

      {/* Secciones de resumen */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => {
          const SectionIcon = section.icon

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-lg"
            >
              {/* Header de sección */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 flex items-center justify-center shadow-lg`}>
                  <SectionIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>

              {/* Items de la sección */}
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => {
                  const ItemIcon = item.icon

                  return (
                    <div
                      key={itemIndex}
                      className={`flex items-start gap-3 py-2 ${
                        item.highlight
                          ? 'p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800'
                          : ''
                      }`}
                    >
                      {ItemIcon && (
                        <ItemIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          item.highlight
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                          item.highlight
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.label}
                        </p>
                        <p className={`text-sm mt-0.5 ${
                          item.highlight
                            ? 'font-bold text-xl bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent'
                            : 'font-semibold text-gray-900 dark:text-white'
                        }`}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Nota final */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
            ¡Todo listo!
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Haz clic en "Guardar Vivienda" para registrar esta vivienda en el sistema.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
