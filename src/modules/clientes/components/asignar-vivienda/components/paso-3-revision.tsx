'use client'

import { motion } from 'framer-motion'
import { Building2, DollarSign, Download, Edit2, FileText, Info, User } from 'lucide-react'

import type { TipoFuentePago } from '@/modules/clientes/types'

import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import type { FuentePagoConfig, ViviendaDetalle } from '../types'

interface FuenteConfiguracion {
  tipo: TipoFuentePago
  config: FuentePagoConfig
}

interface Paso3RevisionProps {
  clienteNombre?: string
  proyectoNombre: string
  vivienda?: ViviendaDetalle
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  fuentes: FuenteConfiguracion[]
  goToStep?: (step: number) => void
}

// Mapeo de tipos de fuente a nombres legibles
const FUENTE_LABELS: Record<string, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

// Función helper para obtener nombre legible
const getFuenteLabel = (tipo: TipoFuentePago | string): string => {
  return FUENTE_LABELS[tipo] || tipo
}

export function Paso3Revision({
  clienteNombre,
  proyectoNombre,
  vivienda,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  fuentes,
  goToStep,
}: Paso3RevisionProps) {

  const InfoField = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <dt className="text-[10px] text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{value}</dd>
    </div>
  )

  const SectionHeader = ({
    icon: Icon,
    title,
    onEdit
  }: {
    icon: any
    title: string
    onEdit?: () => void
  }) => (
    <div className="flex items-center justify-between mb-2">
      <h3 className="flex items-center gap-1.5 text-base font-medium text-gray-900 dark:text-white">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        {title}
      </h3>
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          Editar
        </button>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Botón Descargar PDF */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // TODO: Implementar generación de PDF
          alert('📄 Función de descarga PDF en desarrollo.\n\nEl PDF incluirá:\n✅ Información completa de la negociación\n✅ Datos del cliente y vivienda\n✅ Desglose de fuentes de pago\n✅ Resumen financiero\n✅ Fecha y hora de creación')
        }}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
      >
        <Download className="w-4 h-4" />
        Descargar Resumen en PDF
      </motion.button>

      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 space-y-2.5 shadow-xl hover:shadow-2xl transition-shadow">
        <SectionHeader
          icon={User}
          title="Información Básica"
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <InfoField label="Cliente" value={clienteNombre || 'Cliente'} />
          <InfoField label="Proyecto" value={proyectoNombre} />
          <InfoField
            label="Vivienda"
            value={`${vivienda?.manzana_nombre ? `Manzana ${vivienda.manzana_nombre} - ` : ''}Casa ${vivienda?.numero || ''}`}
          />
          <InfoField
            label="Valor Negociado"
            value={`$${valorNegociado.toLocaleString('es-CO')}`}
          />
        </dl>
      </div>

      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 space-y-2.5 shadow-xl hover:shadow-2xl transition-shadow">
        <SectionHeader
          icon={DollarSign}
          title="Valores Financieros"
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className="space-y-1.5">
          <div className="flex items-center justify-between py-1">
            <dt className="text-xs text-gray-600 dark:text-gray-400">Valor de la Vivienda</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              ${valorNegociado.toLocaleString('es-CO')}
            </dd>
          </div>

          {descuentoAplicado > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between py-1">
                <dt className="text-xs text-gray-600 dark:text-gray-400">Descuento Aplicado</dt>
                <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                  -${descuentoAplicado.toLocaleString('es-CO')}
                </dd>
              </div>
            </>
          )}

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center justify-between py-1.5 bg-gradient-to-br from-cyan-50/90 to-blue-50/90 dark:from-cyan-950/30 dark:to-blue-950/30 -mx-4 px-4 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
            <dt className="text-sm font-bold text-cyan-900 dark:text-cyan-100">Valor Total</dt>
            <dd className="text-lg font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ${valorTotal.toLocaleString('es-CO')}
            </dd>
          </div>
        </dl>
      </div>

      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 space-y-2.5 shadow-xl hover:shadow-2xl transition-shadow">
        <SectionHeader
          icon={Building2}
          title="Fuentes de Pago"
          onEdit={goToStep ? () => goToStep(2) : undefined}
        />

        {fuentes.length > 0 ? (
          <dl className="space-y-1.5">
            {fuentes.map(({ tipo, config }) => (
              <div key={tipo} className="flex items-center justify-between py-1">
                <dt className="text-xs text-gray-600 dark:text-gray-400">
                  {getFuenteLabel(tipo)}
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  ${config?.monto_aprobado?.toLocaleString('es-CO') || '0'}
                </dd>
              </div>
            ))}

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center justify-between py-1.5 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 -mx-4 px-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <dt className="text-sm font-bold text-green-900 dark:text-green-100">Total Fuentes</dt>
              <dd className="text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ${fuentes.reduce((sum, f) => sum + (f.config?.monto_aprobado || 0), 0).toLocaleString('es-CO')}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            No se configuraron fuentes de pago
          </p>
        )}
      </div>

      {notas && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 space-y-2.5 shadow-xl hover:shadow-2xl transition-shadow">
          <SectionHeader
            icon={FileText}
            title="Notas"
            onEdit={goToStep ? () => goToStep(1) : undefined}
          />
          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {notas}
          </p>
        </div>
      )}

      <div className={s.alert.info}>
        <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
          Revisa cuidadosamente toda la información antes de crear la negociación
        </p>
      </div>
    </motion.div>
  )
}
