/**
 * PasoResumenNuevo - Paso 5: Resumen final
 * ✅ Componente presentacional puro
 * ✅ Sin lógica innecesaria
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

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'

interface PasoResumenProps {
  formData: Partial<ViviendaSchemaType>
  proyectoNombre?: string | null
  manzanaNombre?: string | null
  gastosNotariales?: number
  numeroVivienda?: number | null
}

export function PasoResumenNuevo({
  formData,
  proyectoNombre,
  manzanaNombre,
  gastosNotariales = 5_000_000,
  numeroVivienda,
}: PasoResumenProps) {
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
        {
          label: 'Proyecto',
          value: proyectoNombre || 'No disponible',
          icon: Building2,
        },
        {
          label: 'Manzana',
          value: manzanaNombre || 'No disponible',
          icon: MapPin,
        },
        {
          label: 'Número de Casa',
          value:
            formData.numero || numeroVivienda
              ? `#${formData.numero || numeroVivienda}`
              : 'No disponible',
          icon: Home,
        },
      ],
    },
    {
      title: 'Linderos',
      icon: Compass,
      color: 'purple',
      items: [
        { label: '⬆️ Norte', value: formData.lindero_norte || 'No definido' },
        { label: '⬇️ Sur', value: formData.lindero_sur || 'No definido' },
        {
          label: '➡️ Oriente',
          value: formData.lindero_oriente || 'No definido',
        },
        {
          label: '⬅️ Occidente',
          value: formData.lindero_occidente || 'No definido',
        },
      ],
    },
    {
      title: 'Información Legal',
      icon: FileText,
      color: 'green',
      items: [
        {
          label: 'Matrícula Inmobiliaria',
          value: formData.matricula_inmobiliaria || 'No ingresada',
          icon: FileText,
        },
        {
          label: 'Nomenclatura',
          value: formData.nomenclatura || 'No ingresada',
          icon: MapPin,
        },
        {
          label: 'Área Lote',
          value: formData.area_lote
            ? `${formData.area_lote} m²`
            : 'No ingresada',
          icon: Maximize,
        },
        {
          label: 'Área Construida',
          value: formData.area_construida
            ? `${formData.area_construida} m²`
            : 'No ingresada',
          icon: Maximize,
        },
        {
          label: 'Tipo Vivienda',
          value: formData.tipo_vivienda || 'No seleccionado',
          icon: Home,
        },
      ],
    },
    {
      title: 'Información Financiera',
      icon: DollarSign,
      color: 'orange',
      items: [
        {
          label: 'Valor Base',
          value: formatCurrency(formData.valor_base ?? 0),
          icon: DollarSign,
        },
        {
          label: 'Gastos Notariales',
          value: formatCurrency(gastosNotariales),
          icon: FileText,
        },
        {
          label: 'Es Esquinera',
          value: formData.es_esquinera ? 'Sí' : 'No',
          icon: CheckCircle,
        },
        ...(formData.es_esquinera
          ? [
              {
                label: 'Recargo Esquinera',
                value: formatCurrency(formData.recargo_esquinera ?? 0),
                icon: DollarSign,
              },
            ]
          : []),
        {
          label: 'Valor Total',
          value: formatCurrency(
            (formData.valor_base || 0) +
              gastosNotariales +
              (formData.recargo_esquinera || 0)
          ),
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
      className='space-y-3'
    >
      {/* Título del paso */}
      <div>
        <h2 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
          Resumen Final
        </h2>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Revisa la información antes de guardar la vivienda
        </p>
      </div>

      {/* Secciones de resumen */}
      <div className='space-y-3'>
        {sections.map((section, sectionIndex) => {
          const SectionIcon = section.icon

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className='rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800'
            >
              {/* Header de sección */}
              <div className='mb-2 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700'>
                <div
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 flex items-center justify-center shadow-lg`}
                >
                  <SectionIcon className='h-4 w-4 text-white' />
                </div>
                <h3 className='text-base font-bold text-gray-900 dark:text-white'>
                  {section.title}
                </h3>
              </div>

              {/* Items de la sección */}
              <div className='space-y-2'>
                {section.items.map((item, itemIndex) => {
                  const ItemIcon = 'icon' in item ? item.icon : null
                  return (
                    <div
                      key={itemIndex}
                      className={`flex items-start gap-2 py-1 ${
                        'highlight' in item && item.highlight
                          ? 'rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-2 dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30'
                          : ''
                      }`}
                    >
                      {ItemIcon && (
                        <ItemIcon
                          className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            'highlight' in item && item.highlight
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      )}
                      <div className='min-w-0 flex-1'>
                        <p
                          className={`text-xs font-medium ${
                            'highlight' in item && item.highlight
                              ? 'text-orange-900 dark:text-orange-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`mt-0.5 text-sm ${
                            'highlight' in item && item.highlight
                              ? 'bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-lg font-bold text-transparent'
                              : 'font-semibold text-gray-900 dark:text-white'
                          }`}
                        >
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
      <div className='flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
        <CheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
        <div>
          <p className='mb-1 text-sm font-medium text-green-900 dark:text-green-100'>
            ¡Todo listo!
          </p>
          <p className='text-xs text-green-700 dark:text-green-300'>
            Haz clic en &quot;Guardar Vivienda&quot; para registrar esta
            vivienda en el sistema.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
