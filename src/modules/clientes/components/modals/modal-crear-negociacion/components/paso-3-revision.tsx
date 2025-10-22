'use client'

import type { TipoFuentePago } from '@/modules/clientes/types'
import { motion } from 'framer-motion'
import { Building2, DollarSign, Edit2, FileText, User } from 'lucide-react'
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
    <div className="flex items-center justify-between mb-3">
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
      className="space-y-4"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
        <SectionHeader
          icon={User}
          title="Información Básica"
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
        <SectionHeader
          icon={DollarSign}
          title="Valores Financieros"
          onEdit={goToStep ? () => goToStep(1) : undefined}
        />

        <dl className="space-y-2.5">
          <div className="flex items-center justify-between py-1.5">
            <dt className="text-xs text-gray-600 dark:text-gray-400">Valor de la Vivienda</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              ${valorNegociado.toLocaleString('es-CO')}
            </dd>
          </div>

          {descuentoAplicado > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center justify-between py-1.5">
                <dt className="text-xs text-gray-600 dark:text-gray-400">Descuento Aplicado</dt>
                <dd className="text-sm font-medium text-green-600 dark:text-green-400">
                  -${descuentoAplicado.toLocaleString('es-CO')}
                </dd>
              </div>
            </>
          )}

          <div className="h-px bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center justify-between py-1.5 bg-blue-50 dark:bg-blue-950/30 -mx-4 px-4 rounded-lg">
            <dt className="text-xs font-medium text-blue-900 dark:text-blue-100">Valor Total</dt>
            <dd className="text-base font-semibold text-blue-600 dark:text-blue-400">
              ${valorTotal.toLocaleString('es-CO')}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
        <SectionHeader
          icon={Building2}
          title="Fuentes de Pago"
          onEdit={goToStep ? () => goToStep(2) : undefined}
        />

        {fuentes.length > 0 ? (
          <dl className="space-y-2.5">
            {fuentes.map(({ tipo, config }) => (
              <div key={tipo} className="flex items-center justify-between py-1.5">
                <dt className="text-xs text-gray-600 dark:text-gray-400">
                  {getFuenteLabel(tipo)}
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  ${config?.monto_aprobado?.toLocaleString('es-CO') || '0'}
                </dd>
              </div>
            ))}

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center justify-between py-1.5 bg-green-50 dark:bg-green-950/30 -mx-4 px-4 rounded-lg">
              <dt className="text-xs font-medium text-green-900 dark:text-green-100">Total Fuentes</dt>
              <dd className="text-base font-semibold text-green-600 dark:text-green-400">
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
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
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

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3">
        <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
          Revisa cuidadosamente toda la información antes de crear la negociación
        </p>
      </div>
    </motion.div>
  )
}
