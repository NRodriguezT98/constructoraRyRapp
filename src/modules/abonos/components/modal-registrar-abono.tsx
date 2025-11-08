'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Calendar, CheckCircle2, DollarSign, FileText, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { getTodayDateString } from '@/lib/utils/date.utils'

import type { FuentePagoConAbonos } from '../types'

import { AlertaValidacionDesembolso } from './modal-registrar-abono/AlertaValidacionDesembolso'
import { CampoMonto } from './modal-registrar-abono/CampoMonto'
import { MetodosPagoSelector } from './modal-registrar-abono/MetodosPagoSelector'
import { ModalHeader } from './modal-registrar-abono/ModalHeader'
import { colorSchemes, modalStyles } from './modal-registrar-abono/styles'
import { useModalRegistrarAbono } from './modal-registrar-abono/useModalRegistrarAbono'

interface ModalRegistrarAbonoProps {
  open: boolean
  onClose: () => void
  negociacionId: string
  clienteId: string  // ✅ NUEVO: Necesario para redirección al proceso
  fuentesPago: FuentePagoConAbonos[]
  fuenteInicial?: FuentePagoConAbonos
  onSuccess: () => void
}

export function ModalRegistrarAbono({
  open,
  onClose,
  negociacionId,
  clienteId,
  fuentesPago,
  fuenteInicial,
  onSuccess,
}: ModalRegistrarAbonoProps) {
  const fuentePreseleccionada = fuenteInicial || fuentesPago[0]

  const {
    formData,
    errors,
    loading,
    metodoSeleccionado,
    esDesembolsoCompleto,
    montoAutomatico,
    saldoPendiente,
    montoIngresado,
    validacionDesembolso,
    handleSubmit,
    updateField,
    selectMetodo,
    limpiarValidacion,
    formatCurrency,
  } = useModalRegistrarAbono({
    negociacionId,
    fuentePreseleccionada,
    onSuccess,
    onClose,
  })

  if (!fuentePreseleccionada) return null

  const colorScheme = colorSchemes[fuentePreseleccionada.tipo as keyof typeof colorSchemes] || colorSchemes['Cuota Inicial']

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 border-0 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header Premium */}
        <ModalHeader
          fuente={fuentePreseleccionada}
          esDesembolso={esDesembolsoCompleto}
          montoAprobado={fuentePreseleccionada.monto_aprobado}
          saldoPendiente={saldoPendiente}
          formatCurrency={formatCurrency}
        />

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
            <div className={modalStyles.form.container}>
              {/* Campo Monto */}
              <CampoMonto
                esDesembolso={esDesembolsoCompleto}
                fuente={fuentePreseleccionada}
                monto={formData.monto}
                montoAutomatico={montoAutomatico}
                saldoPendiente={saldoPendiente}
                montoIngresado={montoIngresado}
                error={errors.monto}
                onChange={(value) => updateField('monto', value)}
                formatCurrency={formatCurrency}
              />

              {/* Fecha */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="fecha_abono" className={modalStyles.form.label}>
                  <Calendar className={modalStyles.form.labelIcon} />
                  Fecha del {esDesembolsoCompleto ? 'Desembolso' : 'Abono'}{' '}
                  <span className={modalStyles.form.required}>*</span>
                </Label>
                <input
                  type="date"
                  id="fecha_abono"
                  value={formData.fecha_abono}
                  max={getTodayDateString()}
                  onChange={(e) => updateField('fecha_abono', e.target.value)}
                  className={modalStyles.form.input}
                />
              </motion.div>

              {/* Métodos de Pago */}
              <MetodosPagoSelector metodoSeleccionado={metodoSeleccionado} onSelect={selectMetodo} />

              {/* Observaciones */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="observaciones" className={modalStyles.form.label}>
                  <FileText className={modalStyles.form.labelIcon} />
                  Observaciones (Opcional)
                </Label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => updateField('observaciones', e.target.value)}
                  rows={3}
                  className={modalStyles.form.textarea}
                  placeholder="Notas adicionales sobre este pago..."
                />
              </motion.div>

              {/* Error general o alerta de validación */}
              <AnimatePresence>
                {validacionDesembolso && !validacionDesembolso.permitido ? (
                  <AlertaValidacionDesembolso
                    resultado={validacionDesembolso}
                    negociacionId={negociacionId}
                    clienteId={clienteId}
                    onDismiss={limpiarValidacion}
                  />
                ) : errors.submit ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={modalStyles.form.errorAlert}
                  >
                    <AlertCircle className={modalStyles.form.errorAlertIcon} />
                    <p className={modalStyles.form.errorAlertText}>{errors.submit}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer con Botones - Fijo abajo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={modalStyles.footer.container}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`${modalStyles.footer.button} ${modalStyles.footer.cancelButton}`}
            >
              <X className={modalStyles.footer.cancelIcon} />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`${modalStyles.footer.button} ${modalStyles.footer.submitButton} bg-gradient-to-r ${colorScheme.gradient}`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <DollarSign className={modalStyles.footer.submitIcon} />
                  </motion.div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 className={modalStyles.footer.submitIcon} />
                  Confirmar {esDesembolsoCompleto ? 'Desembolso' : 'Abono'}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
