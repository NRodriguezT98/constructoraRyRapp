/**
 * Paso 1: Información Básica
 * Cliente, Proyecto, Vivienda, Valores y Notas
 */

'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    ChevronRight,
    DollarSign,
    Home,
    MessageSquare,
    User,
} from 'lucide-react'
import { animations, modalStyles } from '../styles'
import type { ProyectoBasico, ViviendaDetalle } from '../types'

interface Paso1InfoBasicaProps {
  clienteNombre?: string
  proyectos: ProyectoBasico[]
  viviendas: ViviendaDetalle[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  viviendaIdProp?: string
  onProyectoChange: (proyectoId: string) => void
  onViviendaChange: (viviendaId: string) => void
  onValorNegociadoChange: (valor: number) => void
  onDescuentoChange: (descuento: number) => void
  onNotasChange: (notas: string) => void
}

export function Paso1InfoBasica({
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  proyectoSeleccionado,
  viviendaId,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  viviendaIdProp,
  onProyectoChange,
  onViviendaChange,
  onDescuentoChange,
  onNotasChange,
}: Paso1InfoBasicaProps) {
  return (
    <motion.div {...animations.step} className={modalStyles.content.fullWidth}>
      {/* Info del Cliente */}
      <div className={modalStyles.card.info}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cliente</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {clienteNombre || 'Cliente seleccionado'}
            </p>
          </div>
        </div>
      </div>

      {/* Proyecto */}
      <div>
        <label className={modalStyles.field.label}>
          <Building2 className="h-4 w-4 text-blue-500 inline-block mr-2" />
          Proyecto
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <select
            value={proyectoSeleccionado}
            onChange={(e) => onProyectoChange(e.target.value)}
            disabled={cargandoProyectos || !!viviendaIdProp}
            className={modalStyles.field.select}
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        </div>
      </div>

      {/* Vivienda */}
      <div>
        <label className={modalStyles.field.label}>
          <Home className="h-4 w-4 text-blue-500 inline-block mr-2" />
          Vivienda
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <select
            value={viviendaId}
            onChange={(e) => onViviendaChange(e.target.value)}
            disabled={!proyectoSeleccionado || cargandoViviendas || !!viviendaIdProp}
            className={modalStyles.field.select}
          >
            <option value="">
              {cargandoViviendas
                ? 'Cargando viviendas...'
                : !proyectoSeleccionado
                  ? 'Primero selecciona un proyecto'
                  : viviendas.length === 0
                    ? 'No hay viviendas disponibles'
                    : 'Selecciona una vivienda'}
            </option>
            {viviendas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.manzana_nombre ? `Manzana ${v.manzana_nombre} - ` : ''}Casa {v.numero}
              </option>
            ))}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        </div>
      </div>

      {/* Valor de la Vivienda (Read-only) */}
      <div>
        <label className={modalStyles.field.label}>
          <DollarSign className="h-4 w-4 text-blue-500 inline-block mr-2" />
          Valor de la Vivienda
          <span className="text-xs text-gray-500 ml-2">(auto-llenado desde vivienda)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            readOnly
            value={valorNegociado ? valorNegociado.toLocaleString('es-CO') : '0'}
            placeholder="Selecciona una vivienda"
            className={modalStyles.field.inputReadonly + ' pl-8'}
          />
        </div>
        {valorNegociado > 0 && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Si hay descuento, configúralo abajo para ajustar el valor final
          </p>
        )}
      </div>

      {/* Descuento */}
      <div>
        <label className={modalStyles.field.label}>
          <DollarSign className="h-4 w-4 text-blue-500 inline-block mr-2" />
          Descuento Aplicado
          <span className="text-xs text-gray-500 ml-2">(opcional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="text"
            value={descuentoAplicado ? descuentoAplicado.toLocaleString('es-CO') : ''}
            onChange={(e) => {
              const valor = e.target.value.replace(/\./g, '').replace(/,/g, '')
              const numero = Number(valor)
              if (!isNaN(numero)) {
                onDescuentoChange(numero)
              }
            }}
            placeholder="0"
            className={modalStyles.field.input + ' pl-8'}
          />
        </div>
      </div>

      {/* Valor Total */}
      {(valorNegociado > 0 || descuentoAplicado > 0) && (
        <div className={modalStyles.card.success}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Total a Financiar
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${valorTotal.toLocaleString('es-CO')}
            </span>
          </div>
          {descuentoAplicado > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Descuento: -${descuentoAplicado.toLocaleString('es-CO')} (
              {((descuentoAplicado / valorNegociado) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      )}

      {/* Notas */}
      <div>
        <label className={modalStyles.field.label}>
          <MessageSquare className="h-4 w-4 text-blue-500 inline-block mr-2" />
          Notas
          <span className="text-xs text-gray-500 ml-2">(opcional)</span>
        </label>
        <textarea
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          rows={4}
          placeholder="Información adicional sobre la negociación..."
          className={modalStyles.field.textarea}
        />
      </div>
    </motion.div>
  )
}
