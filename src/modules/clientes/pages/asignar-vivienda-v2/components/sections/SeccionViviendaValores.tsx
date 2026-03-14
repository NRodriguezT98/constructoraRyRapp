'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { formatCurrency } from '@/lib/utils/format.utils'
import { ViviendaCombobox } from '@/modules/clientes/components/asignar-vivienda/components'
import type { AsignarViviendaFormData } from '@/modules/clientes/components/asignar-vivienda/schemas'
import type { ViviendaDetalle } from '@/modules/clientes/components/asignar-vivienda/types'

import { styles as s } from '../../styles'

interface SeccionViviendaValoresProps {
  clienteNombre: string
  register: UseFormRegister<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  setValue: UseFormSetValue<AsignarViviendaFormData>
  watch: UseFormWatch<AsignarViviendaFormData>
  // Datos
  proyectos: Array<{ id: string; nombre: string }>
  viviendas: ViviendaDetalle[]
  proyectoSeleccionado: string
  viviendaId: string
  viviendaSeleccionada: ViviendaDetalle | null
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  setProyectoSeleccionado: (id: string) => void
  setViviendaId: (id: string) => void
  // Valores calculados
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  onClearErrorApi?: () => void
}

const TIPOS_DESCUENTO = [
  'Trabajador Empresa',
  'Cliente VIP',
  'Promoción Especial',
  'Pronto Pago',
  'Negociación Comercial',
  'Liquidación',
  'Otro',
] as const

export function SeccionViviendaValores({
  clienteNombre,
  register,
  errors,
  setValue,
  watch,
  proyectos,
  viviendas,
  proyectoSeleccionado,
  viviendaId,
  viviendaSeleccionada,
  cargandoProyectos,
  cargandoViviendas,
  setProyectoSeleccionado,
  setViviendaId,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado: _descuentoAplicado,
  valorTotal,
  onClearErrorApi,
}: SeccionViviendaValoresProps) {
  const aplicarDescuento = watch('aplicar_descuento') as boolean
  const descuentoActual = (watch('descuento_aplicado') as number) ?? 0
  const motivoDescuento = (watch('motivo_descuento') as string) ?? ''
  const valorEscrituraPublica =
    (watch('valor_escritura_publica') as number) ?? 128000000
  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera
  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoActual / valorBaseTotal) * 100).toFixed(1)
      : '0'

  return (
    <div className='space-y-4'>
      {/* Cliente (readonly) */}
      <div className={s.clientChip.wrapper}>
        <span className={s.clientChip.label}>Cliente</span>
        <span className={s.clientChip.value}>{clienteNombre}</span>
      </div>

      {/* Fila: Proyecto + Vivienda */}
      <div className={s.field.grid2}>
        {/* Proyecto */}
        <div>
          <label className={s.field.label}>Proyecto</label>
          <select
            className={s.field.select}
            value={proyectoSeleccionado}
            onChange={e => {
              setProyectoSeleccionado(e.target.value)
              setValue('proyecto_id', e.target.value)
              setViviendaId('')
              setValue('vivienda_id', '')
              onClearErrorApi?.()
            }}
            disabled={cargandoProyectos}
          >
            <option value=''>Seleccionar proyecto</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errors.proyecto_id && (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.proyecto_id.message)}
            </p>
          )}
        </div>

        {/* Vivienda */}
        <div>
          <label className={s.field.label}>Vivienda</label>
          <ViviendaCombobox
            viviendas={viviendas}
            value={viviendaId}
            onChange={id => {
              setViviendaId(id)
              setValue('vivienda_id', id)
              onClearErrorApi?.()
            }}
            disabled={!proyectoSeleccionado || cargandoViviendas}
            placeholder='Busca: A3, B12...'
            error={!!errors.vivienda_id}
          />
          {errors.vivienda_id && (
            <p className={s.field.error}>
              <AlertCircle className='h-3 w-3' />
              {String(errors.vivienda_id.message)}
            </p>
          )}
        </div>
      </div>

      {/* Chips de valores — aparecen al seleccionar vivienda */}
      <AnimatePresence>
        {viviendaSeleccionada && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tres chips */}
            <div className={s.field.grid3}>
              <div className={s.valueChip.wrapper}>
                <span className={s.valueChip.label}>Valor base</span>
                <span className={s.valueChip.value}>
                  {formatCurrency(valorBase)}
                </span>
              </div>
              <div className={s.valueChip.wrapper}>
                <span className={s.valueChip.label}>Gastos Not.</span>
                <span className={s.valueChip.value}>
                  {formatCurrency(gastosNotariales)}
                </span>
              </div>
              {recargoEsquinera > 0 && (
                <div className={s.valueChip.wrapper}>
                  <span className={s.valueChip.label}>Recargo Esq.</span>
                  <span className={s.valueChip.value}>
                    {formatCurrency(recargoEsquinera)}
                  </span>
                </div>
              )}
            </div>

            {/* Total a cubrir */}
            <div className={s.totalRow.wrapper}>
              <span className={s.totalRow.label}>Total a cubrir</span>
              <span className={s.totalRow.value}>
                {formatCurrency(valorTotal)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle descuento */}
      <div className={`${s.field.row} ${s.field.divider}`}>
        <div>
          <p className='text-sm text-zinc-300'>¿Aplicar descuento?</p>
          <p className='mt-0.5 text-xs text-zinc-500'>
            Reduce el total a cubrir
          </p>
        </div>
        <button
          type='button'
          role='switch'
          aria-checked={aplicarDescuento}
          onClick={() => {
            setValue('aplicar_descuento', !aplicarDescuento)
            if (aplicarDescuento) {
              setValue('descuento_aplicado', 0)
              setValue('tipo_descuento', '')
              setValue('motivo_descuento', '')
            }
          }}
        >
          <div className={s.switch.track(aplicarDescuento)}>
            <div className={s.switch.thumb(aplicarDescuento)} />
          </div>
        </button>
      </div>

      {/* Sub-sección descuento */}
      <AnimatePresence>
        {aplicarDescuento && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className='space-y-3 pt-1'>
              <div className={s.field.grid2}>
                {/* Monto descuento */}
                <div>
                  <label className={s.field.label}>Monto descuento</label>
                  <div className='relative'>
                    <span className={s.field.prefix}>$</span>
                    <input
                      type='number'
                      min='0'
                      className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
                      placeholder='0'
                      {...register('descuento_aplicado', {
                        valueAsNumber: true,
                      })}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        setValue('descuento_aplicado', val)
                        onClearErrorApi?.()
                      }}
                    />
                  </div>
                  {errors.descuento_aplicado && (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.descuento_aplicado.message)}
                    </p>
                  )}
                </div>

                {/* Tipo descuento */}
                <div>
                  <label className={s.field.label}>Tipo de descuento</label>
                  <select
                    className={s.field.select}
                    {...register('tipo_descuento')}
                    onChange={e => {
                      setValue('tipo_descuento', e.target.value)
                      onClearErrorApi?.()
                    }}
                  >
                    <option value=''>Seleccionar tipo</option>
                    {TIPOS_DESCUENTO.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_descuento && (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.tipo_descuento.message)}
                    </p>
                  )}
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className={s.field.label}>Motivo del descuento</label>
                <textarea
                  rows={2}
                  className={s.field.textarea}
                  placeholder='Describe el motivo (mín. 10 caracteres)...'
                  maxLength={500}
                  {...register('motivo_descuento')}
                  onChange={e => {
                    setValue('motivo_descuento', e.target.value)
                    onClearErrorApi?.()
                  }}
                />
                <div className='flex items-center justify-between'>
                  {errors.motivo_descuento ? (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.motivo_descuento.message)}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className={s.charCounter}>
                    {motivoDescuento?.length ?? 0}/500 (mín 10)
                  </span>
                </div>
              </div>

              {/* Línea de resumen */}
              {descuentoActual > 0 && (
                <div className={s.discount.summaryRow}>
                  <span className={s.discount.original}>
                    {formatCurrency(valorBaseTotal)}
                  </span>
                  <span className={s.discount.arrow}>→</span>
                  <span className={s.discount.final}>
                    {formatCurrency(valorTotal)}
                  </span>
                  <span className={s.discount.pct}>(-{pctDescuento}%)</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Valor en Escritura Pública */}
      <div className={s.field.divider}>
        <div className='pt-1'>
          <label className={s.field.label}>
            Valor en Escritura Pública
            <span className={s.datoBadge}>Dato legal</span>
          </label>
          <p className={s.field.hint}>
            Solo para efectos legales y bancarios. No afecta el plan financiero.
          </p>
          <div className='relative mt-1'>
            <span className={s.field.prefix}>$</span>
            <input
              type='number'
              min='0'
              className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
              {...register('valor_escritura_publica', { valueAsNumber: true })}
              onChange={e => {
                setValue(
                  'valor_escritura_publica',
                  parseFloat(e.target.value) || 0
                )
              }}
            />
          </div>
          {valorEscrituraPublica > 0 && valorTotal > 0 && (
            <p className={s.field.hint}>
              Diferencia con valor real:{' '}
              {formatCurrency(Math.abs(valorTotal - valorEscrituraPublica))}
            </p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className={s.field.label}>Notas adicionales (opcional)</label>
        <textarea
          rows={2}
          className={s.field.textarea}
          placeholder='Observaciones o acuerdos adicionales...'
          {...register('notas')}
          onChange={e => setValue('notas', e.target.value)}
        />
      </div>
    </div>
  )
}
