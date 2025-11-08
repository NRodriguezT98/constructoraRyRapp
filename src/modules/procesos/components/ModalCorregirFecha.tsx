/**
 * Modal: Corregir Fecha de Completado
 *
 * Permite modificar la fecha de completado de un paso con validaciones estrictas.
 * ✅ Solo fecha (sin hora)
 * ✅ Diseño moderno con iconos
 * ✅ Compatible con modo oscuro/claro
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'
import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Clock, FileEdit, Info, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDateForDisplay } from '@/lib/utils/date.utils'



import { corregirFecha, validarCorreccionFecha, type ValidacionFechaResult } from '../services/correcciones.service'

interface ModalCorregirFechaProps {
  paso: {
    id: string
    nombre: string
    fecha_completado: string
  }
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalCorregirFecha({
  paso,
  open,
  onClose,
  onSuccess
}: ModalCorregirFechaProps) {

  const [nuevaFecha, setNuevaFecha] = useState<string>('')
  const [motivo, setMotivo] = useState('')
  const [validacion, setValidacion] = useState<ValidacionFechaResult | null>(null)
  const [validando, setValidando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Inicializar con fecha actual del paso (solo fecha, sin hora)
  useEffect(() => {
    if (open && paso.fecha_completado) {
      const fecha = new Date(paso.fecha_completado)
      setNuevaFecha(format(fecha, 'yyyy-MM-dd'))
    }
  }, [open, paso.fecha_completado])

  // Validar fecha en tiempo real
  useEffect(() => {
    if (!nuevaFecha) {
      setValidacion(null)
      return
    }

    const validarAsync = async () => {
      setValidando(true)
      try {
        const fecha = new Date(nuevaFecha)
        const resultado = await validarCorreccionFecha(paso.id, fecha)
        setValidacion(resultado)
      } catch (error) {
        console.error('Error al validar fecha:', error)
      } finally {
        setValidando(false)
      }
    }

    const debounce = setTimeout(validarAsync, 500)
    return () => clearTimeout(debounce)

  }, [nuevaFecha, paso.id])

  // Calcular min/max para input (solo fecha, sin hora)
  const { minDate, maxDate } = useMemo(() => {
    if (!validacion) {
      return {
        minDate: undefined,
        maxDate: format(new Date(), 'yyyy-MM-dd')
      }
    }

    return {
      minDate: validacion.fechaMinima
        ? format(validacion.fechaMinima, 'yyyy-MM-dd')
        : undefined,
      maxDate: validacion.fechaMaxima
        ? format(validacion.fechaMaxima, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
    }
  }, [validacion])

  const handleConfirmar = useCallback(async () => {
    if (!nuevaFecha || !motivo.trim()) {
      toast.error('Completa todos los campos')
      return
    }

    if (validacion && !validacion.valida) {
      toast.error('La fecha seleccionada no es válida')
      return
    }

    try {
      setGuardando(true)

      await corregirFecha({
        pasoId: paso.id,
        nuevaFecha: new Date(nuevaFecha),
        motivo: motivo.trim()
      })

      toast.success('Fecha corregida exitosamente')
      onSuccess()
      handleClose()

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al corregir fecha'
      toast.error(mensaje)
      console.error('Error al corregir fecha:', error)

    } finally {
      setGuardando(false)
    }
  }, [nuevaFecha, motivo, validacion, paso.id, onSuccess])

  const handleClose = () => {
    setNuevaFecha('')
    setMotivo('')
    setValidacion(null)
    onClose()
  }

  const puedeGuardar = useMemo(() => {
    return (
      nuevaFecha &&
      motivo.trim().length >= 10 &&
      validacion?.valida &&
      !guardando &&
      !validando
    )
  }, [nuevaFecha, motivo, validacion, guardando, validando])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Corregir Fecha de Completado
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                {paso.nombre}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Fecha Actual */}
          <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-950 shadow-sm">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fecha actual registrada:
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatDateForDisplay(paso.fecha_completado)}
                </p>
              </div>
            </div>
          </div>

          {/* Restricciones */}
          {validacion && validacion.fechaMinima && validacion.fechaMaxima && (
            <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 shadow-sm">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    📋 Restricciones de fecha
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Desde: <strong>{format(validacion.fechaMinima, 'dd/MM/yyyy')}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Hasta: <strong>{format(validacion.fechaMaxima, 'dd/MM/yyyy')}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>No puede ser fecha futura</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia Admin sobre pasos posteriores */}
          {validacion?.requiereConfirmacionAdmin && validacion.advertenciaAdmin && (
            <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900 shadow-sm animate-pulse">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    ⚠️ Confirmación de Administrador Requerida
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {validacion.advertenciaAdmin}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input de fecha */}
          <div className="space-y-3">
            <Label
              htmlFor="nueva-fecha"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <FileEdit className="h-4 w-4" />
              Nueva fecha de completado *
            </Label>
            <div className="relative">
              <Input
                id="nueva-fecha"
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                min={minDate}
                max={maxDate}
                disabled={guardando}
                className="h-12 text-base font-medium pl-4 pr-4
                         border-2 border-gray-300 dark:border-gray-600
                         focus:border-blue-500 dark:focus:border-blue-400
                         bg-white dark:bg-gray-950
                         text-gray-900 dark:text-gray-100"
              />
              {validando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>

            {/* Errores de validación */}
            {validacion && validacion.errores.length > 0 && (
              <div className="space-y-2 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3">
                {validacion.errores.map((error, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                    <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            {validando && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando fecha...
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-3">
            <Label
              htmlFor="motivo"
              className="flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <span className="flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Motivo de la corrección *
              </span>
              <span className={`text-xs font-normal ${
                motivo.length >= 10
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {motivo.length}/10 caracteres mínimo
              </span>
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo de la corrección. Ej: Se registró fecha incorrecta por error de captura durante el ingreso de datos..."
              rows={4}
              disabled={guardando}
              className="resize-none text-base
                       border-2 border-gray-300 dark:border-gray-600
                       focus:border-blue-500 dark:focus:border-blue-400
                       bg-white dark:bg-gray-950
                       text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Warning de Auditoría */}
          <div className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900 shadow-sm">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  📝 Registro de Auditoría
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Esta corrección quedará registrada en el historial de auditoría con tu usuario y hora exacta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={guardando}
            className="h-11 px-6 font-semibold
                     border-2 border-gray-300 dark:border-gray-600
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!puedeGuardar}
            className="h-11 px-6 font-semibold
                     bg-gradient-to-r from-blue-600 to-cyan-600
                     hover:from-blue-700 hover:to-cyan-700
                     disabled:from-gray-400 disabled:to-gray-500
                     text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20
                     disabled:shadow-none"
          >
            {guardando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Corrección
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
