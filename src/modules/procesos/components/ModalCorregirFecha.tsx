/**
 * Modal: Corregir Fecha de Completado
 *
 * Permite modificar la fecha de completado de un paso con validaciones estrictas
 */

'use client'

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
import { format } from 'date-fns'
import { AlertCircle, Calendar, Info } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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

  // Inicializar con fecha actual del paso
  useEffect(() => {
    if (open && paso.fecha_completado) {
      const fecha = new Date(paso.fecha_completado)
      setNuevaFecha(format(fecha, "yyyy-MM-dd'T'HH:mm"))
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

  // Calcular min/max para input
  const { minDate, maxDate } = useMemo(() => {
    if (!validacion) {
      return {
        minDate: undefined,
        maxDate: format(new Date(), "yyyy-MM-dd'T'HH:mm")
      }
    }

    return {
      minDate: validacion.fechaMinima
        ? format(validacion.fechaMinima, "yyyy-MM-dd'T'HH:mm")
        : undefined,
      maxDate: validacion.fechaMaxima
        ? format(validacion.fechaMaxima, "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm")
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Corregir Fecha de Completado
          </DialogTitle>
          <DialogDescription>
            {paso.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fecha actual */}
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Fecha actual:</p>
            <p className="font-semibold text-gray-900">
              {format(new Date(paso.fecha_completado), "dd/MM/yyyy 'a las' HH:mm")}
            </p>
          </div>

          {/* Restricciones */}
          {validacion && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Restricciones:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {validacion.fechaMinima && (
                      <li>✓ Debe ser después de: {format(validacion.fechaMinima, "dd/MM/yyyy HH:mm")}</li>
                    )}
                    {validacion.fechaMaxima && (
                      <li>✓ Debe ser antes de: {format(validacion.fechaMaxima, "dd/MM/yyyy HH:mm")}</li>
                    )}
                    <li>✓ No puede ser fecha futura</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia Admin sobre pasos posteriores */}
          {validacion?.requiereConfirmacionAdmin && validacion.advertenciaAdmin && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Confirmación de Administrador Requerida
                  </p>
                  <p className="text-sm text-amber-800">
                    {validacion.advertenciaAdmin}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input de fecha */}
          <div className="space-y-2">
            <Label htmlFor="nueva-fecha">Nueva fecha de completado *</Label>
            <Input
              id="nueva-fecha"
              type="datetime-local"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              min={minDate}
              max={maxDate}
              disabled={guardando}
            />

            {/* Errores de validación */}
            {validacion && validacion.errores.length > 0 && (
              <div className="space-y-1">
                {validacion.errores.map((error, i) => (
                  <p key={i} className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                ))}
              </div>
            )}

            {validando && (
              <p className="text-sm text-gray-500">Validando fecha...</p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo de la corrección *
              <span className="text-xs text-gray-500 ml-2">
                ({motivo.length}/10 caracteres mínimo)
              </span>
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Se registró fecha incorrecta por error de captura..."
              rows={3}
              className="resize-none"
              disabled={guardando}
            />
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
            <p className="text-sm text-orange-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Esta corrección quedará registrada en el historial de auditoría con tu usuario y hora exacta.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!puedeGuardar}
          >
            {guardando ? 'Guardando...' : 'Confirmar Corrección'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
