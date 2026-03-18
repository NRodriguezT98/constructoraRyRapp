'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { AlertCircle, ArrowRight, Banknote, Building2, Calculator, Download, Edit2, Loader2, MapPin, TrendingUp, User } from 'lucide-react'
import { useMemo, useState } from 'react'

import { formatDateForDisplay, getTodayDateString } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import type { FuentePagoConfiguracion, ViviendaDetalle } from '@/modules/clientes/components/asignar-vivienda/types'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useEntidadesFinancierasCombinadas } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'
import { NegociacionPDF } from '../NegociacionPDF'

import { styles as s } from '../../styles'

interface SeccionRevisionProps {
  clienteNombre: string
  proyectoNombre: string
  viviendaSeleccionada: ViviendaDetalle | null
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  aplicarDescuento: boolean
  tipoDescuento: string
  notas: string
  fuentes: FuentePagoConfiguracion[]
  tiposConCampos: TipoFuentePagoConCampos[]
  errorApi: string | null
  creando: boolean
  onGuardar: () => void
  onEditarSeccion1: () => void
  onEditarSeccion2: () => void
}

export function SeccionRevision({
  clienteNombre,
  proyectoNombre,
  viviendaSeleccionada,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado,
  valorTotal,
  aplicarDescuento,
  notas,
  fuentes,
  tiposConCampos,
  errorApi,
  creando,
  onGuardar,
  onEditarSeccion1,
  onEditarSeccion2,
}: SeccionRevisionProps) {
  const { entidades } = useEntidadesFinancierasCombinadas()

  const fuentesActivas = fuentes.filter(f => f.enabled && f.config !== null)

  const viviendaLabel = viviendaSeleccionada
    ? [viviendaSeleccionada.manzana_nombre, `Casa ${viviendaSeleccionada.numero}`]
        .filter(Boolean)
        .join(' · ')
    : '—'

  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera

  const fuentesPDF = useMemo(() => fuentesActivas.map(f => {
    const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
    const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
    const monto = f.config ? obtenerMontoParaCierre(f.config, tipoConCampos, camposConfig) : 0
    const entidadNombre = f.config?.entidad
      ? (entidades.find(e => e.value === f.config!.entidad)?.label ?? f.config.entidad)
      : undefined
    return { nombre: f.tipo, entidad: entidadNombre, monto }
  }), [fuentesActivas, tiposConCampos, entidades])

  const fechaGeneracion = useMemo(
    () => formatDateForDisplay(getTodayDateString()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // estable: calculado solo una vez al montar el componente
  )

  const nombreArchivo = useMemo(
    () =>
      `negociacion-${clienteNombre.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // estable: nombre generado una sola vez al abrir revisión
  )

  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoAplicado / valorBaseTotal) * 100).toFixed(1)
      : '0'

  // Lazy PDF: solo montar PDFDownloadLink cuando el usuario lo solicita
  // Previene el crash del reconciliador de react-pdf por renders intermedios
  const [pdfSolicitado, setPdfSolicitado] = useState(false)

  return (
    <div className='space-y-3'>
      {/* Error de API */}
      {errorApi && (
        <div className={s.revision.errorBanner} role='alert'>
          <AlertCircle className={s.revision.errorIcon} />
          {errorApi}
        </div>
      )}

      {/* Información básica */}
      <div className={s.revision.infoCard}>
        <p className={s.revision.sectionTitle}>
          <User className={s.revision.sectionTitleIcon} />
          Datos de la Negociación
        </p>
        <div className={s.revision.grid}>
          <div>
            <p className={s.revision.label}>
              <User className={s.revision.labelIcon} />
              Cliente
            </p>
            <p className={s.revision.value}>{clienteNombre}</p>
          </div>
          <div>
            <p className={s.revision.label}>
              <Building2 className={s.revision.labelIcon} />
              Proyecto
            </p>
            <p className={s.revision.value}>{proyectoNombre || '—'}</p>
          </div>
          <div>
            <p className={s.revision.label}>
              <MapPin className={s.revision.labelIcon} />
              Vivienda
            </p>
            <p className={s.revision.value}>{viviendaLabel}</p>
          </div>
          {notas && (
            <div className='col-span-2'>
              <p className={s.revision.label}>Notas</p>
              <p className={`${s.revision.value} text-xs`}>{notas}</p>
            </div>
          )}
        </div>
        <button
          type='button'
          onClick={onEditarSeccion1}
          className={s.revision.editLink}
        >
          <Edit2 className='w-3 h-3' />
          Editar vivienda y valores
        </button>
      </div>

      {/* Resumen financiero */}
      <div className={s.revision.financialCard}>
        <p className={s.revision.sectionTitle}>
          <Calculator className={s.revision.sectionTitleIcon} />
          Resumen Financiero
        </p>
        <div className={s.revision.financialRow}>
          <span className={s.revision.financialLabel}>
            <Building2 className={s.revision.financialLabelIcon} />
            Valor base + notariales
          </span>
          <span className={s.revision.financialValue}>
            {formatCurrency(valorBaseTotal)}
          </span>
        </div>

        {aplicarDescuento && descuentoAplicado > 0 && (
          <div className={s.revision.financialRow}>
            <span className={s.revision.financialLabel}>
              Descuento ({pctDescuento}%)
            </span>
            <span className={`${s.revision.financialValue} ${s.revision.descuento}`}>
              −{formatCurrency(descuentoAplicado)}
            </span>
          </div>
        )}

        <div className={s.revision.sepDouble} />

        <div className={s.revision.financialRow}>
          <span className={s.revision.totalLabel}>
            <Calculator className='w-3.5 h-3.5' />
            Total a pagar
          </span>
          <span className={s.revision.totalValue}>
            {formatCurrency(valorTotal)}
          </span>
        </div>
      </div>

      {/* Resumen fuentes */}
      <div className={s.revision.fuentesCard}>
        <p className={s.revision.sectionTitle}>
          <Banknote className={s.revision.sectionTitleIcon} />
          Fuentes de Pago
        </p>
        {fuentesActivas.map(f => {
          const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const monto = f.config ? obtenerMontoParaCierre(f.config, tipoConCampos, camposConfig) : 0

          // Calcular desglose de crédito si aplica (deps primitivos para memoización correcta)
          const params = f.config?.parametrosCredito
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const creditoInfo = useMemo(() => {
            if (!params) return null
            try {
              const fechaDate = typeof params.fechaInicio === 'string'
                ? new Date(params.fechaInicio + 'T12:00:00')
                : params.fechaInicio
              return calcularTablaAmortizacion({ ...params, fechaInicio: fechaDate })
            } catch {
              return null
            }
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [
            params?.capital,
            params?.tasaMensual,
            params?.numCuotas,
            String(params?.fechaInicio),
          ])

          return (
            <div key={f.tipo} className={s.revision.fuenteRow}>
              <div className={s.revision.fuenteDot} />
              <div className='flex-1 min-w-0'>
                <span className={s.revision.fuenteNombre}>{f.tipo}</span>
                {f.config?.entidad && (
                  <span className={`${s.revision.fuenteEntidad} block`}>
                    {entidades.find(e => e.value === f.config!.entidad)?.label ?? f.config.entidad}
                  </span>
                )}
                {creditoInfo && (
                  <div className='mt-1.5 space-y-0.5 text-xs'>
                    <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                      <span>Capital a financiar</span>
                      <span>{formatCurrency(creditoInfo.capital)}</span>
                    </div>
                    <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                      <span className='flex items-center gap-1'>
                        <TrendingUp className='w-3 h-3' />
                        Interés ({params!.tasaMensual}% mens.)
                      </span>
                      <span>+{formatCurrency(creditoInfo.interesTotal)}</span>
                    </div>
                    <div className='flex justify-between font-medium text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-0.5'>
                      <span>Total a pagar al crédito</span>
                      <span>{formatCurrency(creditoInfo.montoTotal)}</span>
                    </div>
                    <div className='text-gray-400 dark:text-gray-500 pt-0.5'>
                      {params!.numCuotas} cuotas de {formatCurrency(creditoInfo.valorCuotaMensual)}/mes
                      {creditoInfo.cuotas[0] && (
                        <> · Primera: {formatDateForDisplay(creditoInfo.cuotas[0].fechaVencimiento.toISOString().split('T')[0])}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className={s.revision.fuenteMonto}>
                {formatCurrency(monto)}
              </span>
            </div>
          )
        })}
        <button
          type='button'
          onClick={onEditarSeccion2}
          className={s.revision.editLink}
        >
          <Edit2 className='w-3 h-3' />
          Editar fuentes de pago
        </button>
      </div>

      {/* Acciones */}
      <div>
        <div className={s.revision.actionRow}>
          <button
            type='button'
            onClick={onGuardar}
            disabled={creando}
            className={s.revision.submitBtn}
          >
            {creando ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <>
                Asignar Vivienda
                <ArrowRight className='h-4 w-4' />
              </>
            )}
          </button>
        </div>

        {pdfSolicitado ? (
          <PDFDownloadLink
            document={
              <NegociacionPDF
                clienteNombre={clienteNombre}
                proyectoNombre={proyectoNombre}
                viviendaLabel={viviendaLabel}
                valorBase={valorBase}
                gastosNotariales={gastosNotariales}
                recargoEsquinera={recargoEsquinera}
                descuentoAplicado={descuentoAplicado}
                valorTotal={valorTotal}
                aplicarDescuento={aplicarDescuento}
                fuentes={fuentesPDF}
                notas={notas}
                fechaGeneracion={fechaGeneracion}
              />
            }
            fileName={nombreArchivo}
            className={s.revision.pdfBtn}
          >
            {({ loading }) => (
              <>
                {loading
                  ? <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  : <Download className='h-3.5 w-3.5' />}
                {loading ? 'Generando PDF...' : 'Descargar PDF'}
              </>
            )}
          </PDFDownloadLink>
        ) : (
          <button
            type='button'
            onClick={() => setPdfSolicitado(true)}
            className={s.revision.pdfBtn}
          >
            <Download className='h-3.5 w-3.5' />
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  )
}
