'use client'

import { AlertCircle, Calendar, CheckCircle2, FileText, Landmark, Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { getTodayDateString } from '@/lib/utils/date.utils'

import type { FuentePagoConAbonos } from '../../types'
import { CampoMontoPago } from './CampoMontoPago'
import { ComprobantePago } from './ComprobantePago'
import { HeaderPago } from './HeaderPago'
import { MetodosPago } from './MetodosPago'
import { getModalStyles } from './ModalRegistroPago.styles'
import { useModalRegistroPago } from './useModalRegistroPago'

export interface ModalRegistroPagoProps {
  open: boolean
  onClose: () => void
  negociacionId: string
  clienteId: string
  fechaMinima?: string
  fuentesPago: FuentePagoConAbonos[]
  fuenteInicial?: FuentePagoConAbonos
  onSuccess: () => void
}

export function ModalRegistroPago(props: ModalRegistroPagoProps) {
  const {
    fuenteSeleccionada,
    setFuenteSeleccionada,
    modo,
    esDesembolso,
    colorScheme,
    monto,
    setMonto,
    metodoPago,
    setMetodoPago,
    metodosDisponibles,
    referencia,
    setReferencia,
    notas,
    setNotas,
    fechaAbono,
    setFechaAbono,
    comprobante,
    setComprobante,
    errors,
    isSubmitting,
    handleSubmit,
    handleClose,
  } = useModalRegistroPago(props)

  const styles = getModalStyles(colorScheme, modo)

  if (!fuenteSeleccionada) return null

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={styles.dialogContent}>
        <DialogTitle className="sr-only">
          Registrar {esDesembolso ? 'Desembolso' : 'Abono'} — {fuenteSeleccionada.tipo}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Formulario para registrar {esDesembolso ? 'un desembolso bancario único' : 'un abono parcial'} de la fuente {fuenteSeleccionada.tipo}
        </DialogDescription>

        <HeaderPago
          modo={modo}
          fuenteSeleccionada={fuenteSeleccionada}
          fuentesPago={props.fuentesPago}
          colorScheme={colorScheme}
          onFuenteChange={setFuenteSeleccionada}
        />

        <div className={styles.body}>
          <CampoMontoPago
            modo={modo}
            monto={monto}
            onMontoChange={setMonto}
            saldoPendiente={fuenteSeleccionada.saldo_pendiente ?? 0}
            montoAprobado={fuenteSeleccionada.monto_aprobado}
            colorScheme={colorScheme}
            error={errors.monto}
          />

          <MetodosPago
            modo={modo}
            metodosDisponibles={metodosDisponibles}
            metodoPago={metodoPago}
            onMetodoChange={setMetodoPago}
            colorScheme={colorScheme}
          />

          {/* Fecha */}
          <div>
            <label htmlFor="fecha-pago" className={styles.label}>
              <Calendar className="w-4 h-4" />
              Fecha del {esDesembolso ? 'desembolso' : 'abono'} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fecha-pago"
              value={fechaAbono}
              min={props.fechaMinima}
              max={getTodayDateString()}
              onChange={(e) => setFechaAbono(e.target.value)}
              className={errors.fechaAbono ? styles.inputError : styles.input}
            />
            {errors.fechaAbono ? (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.fechaAbono}
              </p>
            ) : null}
          </div>

          {/* Referencia — solo para Transferencia o Cheque */}
          {(metodoPago === 'Transferencia' || metodoPago === 'Cheque') ? (
            <div>
              <label htmlFor="referencia-pago" className={styles.label}>
                <FileText className="w-4 h-4" />
                {metodoPago === 'Transferencia' ? 'Número de transferencia' : 'Número de cheque'}
                <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(Opcional)</span>
              </label>
              <input
                type="text"
                id="referencia-pago"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder={metodoPago === 'Transferencia' ? 'Ej: TRF-2025-001234' : 'Ej: 0001234'}
                className={styles.input}
              />
            </div>
          ) : null}

          {/* Notas */}
          <div>
            <label htmlFor="notas-pago" className={styles.label}>
              <FileText className="w-4 h-4" />
              Observaciones
              <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(Opcional)</span>
            </label>
            <textarea
              id="notas-pago"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas adicionales sobre este pago..."
              className={`${styles.input} resize-none`}
            />
          </div>

          <ComprobantePago
            modo={modo}
            archivo={comprobante}
            onArchivoChange={setComprobante}
            error={errors.comprobante}
          />

          {errors.submit ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className={styles.footer.container}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={styles.footer.cancelButton}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={esDesembolso ? styles.footer.submitDesembolso : styles.footer.submitAbono}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : esDesembolso ? (
              <><Landmark className="w-4 h-4" /> Registrar Desembolso</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Confirmar Abono</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
