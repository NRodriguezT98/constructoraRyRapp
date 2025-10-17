/**
 * Modal para registrar interés de cliente en vivienda
 */

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, DollarSign, Home, Loader2 } from 'lucide-react'
import { useRegistrarInteres } from '../../hooks/useRegistrarInteres'

interface ModalRegistrarInteresProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  onSuccess: () => void
}

export function ModalRegistrarInteres({
  isOpen,
  onClose,
  clienteId,
  onSuccess,
}: ModalRegistrarInteresProps) {
  const {
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    guardando,
    errorNegociacionExistente,
    proyectoIdSeleccionado,
    viviendaIdSeleccionada,
    valorNegociado,
    register,
    handleSubmit,
    errors,
    handleRegistrar,
    handleCancelar,
  } = useRegistrarInteres({ clienteId, onSuccess, onClose })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-500" />
            Registrar Nuevo Interés
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleRegistrar)} className="space-y-6 mt-4">
          {/* Error negociación existente */}
          <AnimatePresence>
            {errorNegociacionExistente && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Ya existe un interés registrado para esta vivienda
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Este cliente ya tiene una negociación activa con la vivienda seleccionada.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector de Proyecto */}
          <div className="space-y-2">
            <Label htmlFor="proyectoId" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Proyecto
            </Label>
            <select
              id="proyectoId"
              {...register('proyectoId', { required: 'Debes seleccionar un proyecto' })}
              disabled={cargandoProyectos || guardando}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {cargandoProyectos ? 'Cargando proyectos...' : 'Selecciona un proyecto'}
              </option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
            {errors.proyectoId && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.proyectoId.message}
              </p>
            )}
          </div>

          {/* Selector de Vivienda */}
          <div className="space-y-2">
            <Label htmlFor="viviendaId" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Vivienda
            </Label>
            <select
              id="viviendaId"
              {...register('viviendaId', { required: 'Debes seleccionar una vivienda' })}
              disabled={!proyectoIdSeleccionado || cargandoViviendas || guardando}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!proyectoIdSeleccionado
                  ? 'Primero selecciona un proyecto'
                  : cargandoViviendas
                  ? 'Cargando viviendas...'
                  : viviendas.length === 0
                  ? 'No hay viviendas disponibles'
                  : 'Selecciona una vivienda'}
              </option>
              {viviendas.map((vivienda) => (
                <option key={vivienda.id} value={vivienda.id}>
                  Vivienda {vivienda.numero} - Manzana {vivienda.manzanas?.nombre} - $
                  {vivienda.valor_total.toLocaleString('es-CO')}
                </option>
              ))}
            </select>
            {errors.viviendaId && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.viviendaId.message}
              </p>
            )}
            {proyectoIdSeleccionado && viviendas.length === 0 && !cargandoViviendas && (
              <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                No hay viviendas disponibles en este proyecto
              </p>
            )}
          </div>

          {/* Valor Negociado */}
          <div className="space-y-2">
            <Label htmlFor="valorNegociado" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valor Negociado
            </Label>
            <Input
              id="valorNegociado"
              type="number"
              step="0.01"
              {...register('valorNegociado', {
                required: 'El valor negociado es requerido',
                min: { value: 1, message: 'El valor debe ser mayor a 0' },
              })}
              disabled={!viviendaIdSeleccionada || guardando}
              className="text-lg font-semibold"
            />
            {errors.valorNegociado && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.valorNegociado.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Se actualiza automáticamente con el valor de la vivienda. Puedes modificarlo si es
              necesario.
            </p>
          </div>

          {/* Descuento Aplicado */}
          <div className="space-y-2">
            <Label htmlFor="descuentoAplicado">Descuento Aplicado (Opcional)</Label>
            <Input
              id="descuentoAplicado"
              type="number"
              step="0.01"
              placeholder="$0"
              {...register('descuentoAplicado', {
                min: { value: 0, message: 'El descuento no puede ser negativo' },
                validate: (value) =>
                  !value ||
                  value < valorNegociado ||
                  'El descuento debe ser menor al valor negociado',
              })}
              disabled={!viviendaIdSeleccionada || guardando}
            />
            {errors.descuentoAplicado && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                {errors.descuentoAplicado.message}
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (Opcional)</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Observaciones sobre el interés del cliente..."
              rows={3}
              disabled={guardando}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelar}
              disabled={guardando}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={guardando || !viviendaIdSeleccionada}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Interés'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
