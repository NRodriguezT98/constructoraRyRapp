/**
 * Paso 1: Información Básica
 * ✅ REFACTORIZADO: React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Sistema touchedFields (validación progresiva)
 * ✅ Diseño compacto premium
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Home,
  MessageSquare,
  User,
} from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { pageStyles as s } from '@/modules/clientes/pages/asignar-vivienda/styles'
import type { ProyectoBasico, ViviendaDetalle } from '../types'
import { ViviendaCombobox } from './vivienda-combobox'

interface Paso1InfoBasicaRefactoredProps {
  // React Hook Form
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  touchedFields: any
  setValue: (name: string, value: any) => void
  watch: (name?: string | string[]) => any

  // Data
  clienteNombre?: string
  proyectos: ProyectoBasico[]
  viviendas: ViviendaDetalle[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  viviendaIdProp?: string

  // Handlers
  onProyectoChange: (proyectoId: string) => void
  onViviendaChange: (viviendaId: string) => void
}

export function Paso1InfoBasicaRefactored({
  register,
  errors,
  touchedFields,
  setValue,
  watch,
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  viviendaIdProp,
  onProyectoChange,
  onViviendaChange,
}: Paso1InfoBasicaRefactoredProps) {
  // Observar valores del formulario
  const proyecto_id = watch('proyecto_id')
  const vivienda_id = watch('vivienda_id')
  const valor_negociado = watch('valor_negociado')
  const descuento_aplicado = watch('descuento_aplicado')
  const valor_total = valor_negociado - descuento_aplicado

  // Calcular progreso (2 campos obligatorios: proyecto y vivienda)
  const camposCompletados = [
    !!proyecto_id,
    !!vivienda_id,
  ].filter(Boolean).length

  const porcentajeProgreso = Math.round((camposCompletados / 2) * 100)

  // Helper para clases de input (igual que proyectos/viviendas)
  const getInputClasses = (fieldName: string) => {
    const hasError = errors[fieldName]
    return `${s.input.base} ${
      hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
    }`
  }

  // Helper para mostrar error (igual que proyectos/viviendas)
  const showError = (fieldName: string) => {
    return errors[fieldName]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Información Guía */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-50/90 to-blue-50/90 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200/50 dark:border-cyan-800/50 rounded-lg p-2.5 shadow-lg">
        <p className="text-xs text-cyan-800 dark:text-cyan-200 leading-relaxed">
          <span className="font-bold">📋 Instrucciones:</span> Selecciona el <span className="font-semibold">proyecto</span> y la <span className="font-semibold">vivienda</span> que deseas asignar. El valor se cargará automáticamente. Opcionalmente puedes aplicar un descuento.
        </p>
      </div>

      {/* Barra de Progreso */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-2.5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Progreso: {camposCompletados}/2 campos obligatorios
          </span>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {porcentajeProgreso}%
          </span>
        </div>
        <div className="h-1.5 bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeProgreso}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Cliente Seleccionado */}
      <div className={s.alert.info}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
            Cliente Seleccionado
          </p>
          <p className="text-sm font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mt-0.5">
            {clienteNombre || 'Cliente seleccionado'}
          </p>
        </div>
      </div>

      {/* Grid de Campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Proyecto */}
        <div className="space-y-1">
          <label className={s.label.base}>
            <Building2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            Proyecto
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <select
              {...register('proyecto_id')}
              disabled={cargandoProyectos || !!viviendaIdProp}
              onChange={(e) => {
                setValue('proyecto_id', e.target.value)
                onProyectoChange(e.target.value)
              }}
              className={getInputClasses('proyecto_id')}
            >
              <option value="">Selecciona un proyecto</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
          </div>
          {showError('proyecto_id') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.proyecto_id?.message as string}
            </p>
          )}
        </div>

        {/* Vivienda */}
        <div className="space-y-1">
          <label className={s.label.base}>
            <Home className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Vivienda
            <span className="text-red-500 ml-0.5">*</span>
          </label>

          <ViviendaCombobox
            viviendas={viviendas}
            value={vivienda_id}
            onChange={(id) => {
              setValue('vivienda_id', id)
              onViviendaChange(id)
            }}
            disabled={!proyecto_id || cargandoViviendas || !!viviendaIdProp}
            placeholder="Busca por manzana o número (ej: A3)"
          />

          {showError('vivienda_id') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.vivienda_id?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Valores Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Valor de la Vivienda (readonly) */}
        <div className="space-y-1">
          <label className={s.label.base}>
            <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
            Valor de la Vivienda
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-normal">
              (auto-llenado)
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              readOnly
              value={valor_negociado ? valor_negociado.toLocaleString('es-CO') : '0'}
              placeholder="Selecciona una vivienda"
              className="w-full px-4 py-3 pl-8 backdrop-blur-xl bg-gray-50/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-not-allowed"
            />
          </div>
          {valor_negociado > 0 && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Valor cargado desde vivienda
            </p>
          )}
        </div>

        {/* Descuento */}
        <div className="space-y-1">
          <label className={s.label.base}>
            <DollarSign className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            Descuento Aplicado
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-normal">
              (opcional)
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={descuento_aplicado ? descuento_aplicado.toLocaleString('es-CO') : ''}
              onChange={(e) => {
                const valor = e.target.value.replace(/\./g, '').replace(/,/g, '')
                const numero = Number(valor)
                if (!isNaN(numero)) {
                  setValue('descuento_aplicado', numero)
                }
              }}
              placeholder="0"
              className={`${getInputClasses('descuento_aplicado')} pl-8`}
            />
          </div>
          {showError('descuento_aplicado') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.descuento_aplicado?.message as string}
            </p>
          )}
          {descuento_aplicado > 0 && descuento_aplicado < valor_negociado && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Descuento aplicado: {((descuento_aplicado / valor_negociado) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-1">
        <label className={s.label.base}>
          <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          Notas / Observaciones
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-normal">
            (opcional)
          </span>
        </label>
        <textarea
          {...register('notas')}
          rows={2}
          placeholder="Ej: Cliente solicitó descuento por pronto pago, tiene preferencia por segundo piso..."
          className={s.input.base}
        />
      </div>

      {/* Resumen del Valor Total */}
      {valor_total > 0 && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50 rounded-lg p-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
              Valor Total a Financiar:
            </span>
            <span className="text-base font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ${valor_total.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
