/**
 * Modal para registrar interés de cliente en vivienda
 * Diseño moderno con glassmorphism y animaciones
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, ChevronRight, DollarSign, Home, Loader2, MessageSquare, Sparkles, X } from 'lucide-react'
import { useRegistrarInteres } from '../../hooks/useRegistrarInteres'

interface ModalRegistrarInteresProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  onSuccess: () => void
}

// Componente de Input Moderno
function ModernInput({ icon: Icon, label, error, required, className = '', ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 dark:focus:border-purple-500 ${className}`}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Componente de Select Moderno
function ModernSelect({ icon: Icon, label, error, required, children, ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...props}
          className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-10 text-gray-900 transition-all hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600"
        >
          {children}
        </select>
        <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Componente de Textarea Moderno
function ModernTextarea({ icon: Icon, label, error, ...props }: any) {
  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
      </label>
      <div className="relative">
        <textarea
          {...props}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all placeholder:text-gray-400 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-purple-600 resize-none"
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

// Componente de Input de Moneda con Formato
function MoneyInput({ icon: Icon, label, error, required, value, onChange, ...props }: any) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="group">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Icon className="h-4 w-4 text-purple-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-gray-700 pointer-events-none" />
        <div className="relative flex items-center px-4 py-3">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {value ? formatCurrency(value) : '$0'}
          </span>
        </div>
        <input type="hidden" value={value || 0} onChange={onChange} {...props} />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 flex items-center gap-1 text-sm text-red-500"
          >
            <span className="font-medium">⚠</span> {error}
          </motion.p>
        )}
      </div>
    </div>
  )
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
    valorEstimado,
    register,
    handleSubmit,
    errors,
    handleRegistrar,
    handleCancelar,
  } = useRegistrarInteres({ clienteId, onSuccess, onClose })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
          >
            {/* Header con gradiente animado */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
              {/* Patrón de fondo animado */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30"
                  >
                    <Sparkles className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Registrar Nuevo Interés
                    </h2>
                    <p className="text-sm text-blue-100">
                      Registra el interés del cliente en una vivienda
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del formulario */}
            <form onSubmit={handleSubmit(handleRegistrar)} className="flex flex-col max-h-[calc(90vh-140px)]">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Error negociación existente */}
          <AnimatePresence>
            {errorNegociacionExistente && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Ya existe un interés registrado para esta vivienda
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Este cliente ya tiene un interés activo en la vivienda seleccionada.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selector de Proyecto */}
          <ModernSelect
            icon={Building2}
            label="Proyecto"
            required
            {...register('proyectoId', { required: 'Debes seleccionar un proyecto' })}
            disabled={cargandoProyectos || guardando}
            error={errors.proyectoId?.message}
          >
            <option value="">
              {cargandoProyectos ? 'Cargando proyectos...' : 'Selecciona un proyecto'}
            </option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </ModernSelect>

          {/* Mensaje sin proyectos */}
          {proyectos.length === 0 && !cargandoProyectos && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No hay proyectos disponibles en este momento
              </p>
            </motion.div>
          )}

          {/* Selector de Vivienda */}
          <ModernSelect
            icon={Home}
            label="Vivienda"
            required
            {...register('viviendaId', { required: 'Debes seleccionar una vivienda' })}
            disabled={!proyectoIdSeleccionado || cargandoViviendas || guardando}
            error={errors.viviendaId?.message}
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
          </ModernSelect>

          {/* Mensaje sin viviendas */}
          {proyectoIdSeleccionado && viviendas.length === 0 && !cargandoViviendas && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No hay viviendas disponibles en este proyecto
              </p>
            </motion.div>
          )}

          {/* Valor Estimado */}
          <MoneyInput
            icon={DollarSign}
            label="Valor Estimado"
            required
            value={valorEstimado}
            onChange={() => {}} // El valor se actualiza automáticamente desde el hook
            error={errors.valorEstimado?.message}
          />
          <input
            type="hidden"
            {...register('valorEstimado', {
              required: 'El valor estimado es requerido',
              min: { value: 1, message: 'El valor debe ser mayor a 0' },
            })}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
            Se actualiza automáticamente con el valor de la vivienda. Puedes modificarlo si es necesario.
          </p>

          {/* Origen del Interés */}
          <ModernSelect
            icon={Building2}
            label="¿Cómo se enteró?"
            required
            {...register('origen', { required: 'Selecciona el origen del interés' })}
            disabled={guardando}
            error={errors.origen?.message}
          >
            <option value="">Selecciona una opción</option>
            <option value="Visita Presencial">Visita Presencial</option>
            <option value="Llamada Telefónica">Llamada Telefónica</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Redes Sociales">Redes Sociales</option>
            <option value="Referido">Referido</option>
            <option value="Sitio Web">Sitio Web</option>
            <option value="Otro">Otro</option>
          </ModernSelect>

          {/* Prioridad */}
          <ModernSelect
            icon={Sparkles}
            label="Prioridad de Seguimiento"
            required
            {...register('prioridad', { required: 'Selecciona la prioridad' })}
            disabled={guardando}
            error={errors.prioridad?.message}
          >
            <option value="">Selecciona prioridad</option>
            <option value="Alta">🔴 Alta - Seguimiento inmediato</option>
            <option value="Media">🟡 Media - Seguimiento regular</option>
            <option value="Baja">🟢 Baja - Seguimiento cuando sea posible</option>
          </ModernSelect>

          {/* Notas */}
          <ModernTextarea
            icon={MessageSquare}
            label="Notas (Opcional)"
            {...register('notas')}
            placeholder="Observaciones sobre el interés del cliente..."
            rows={3}
            disabled={guardando}
          />
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex justify-end gap-3">
            <motion.button
              type="button"
              onClick={handleCancelar}
              disabled={guardando}
              className="rounded-xl border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={guardando || !viviendaIdSeleccionada}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {guardando ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Interés'
              )}
            </motion.button>
          </div>
        </div>
      </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  )
}
