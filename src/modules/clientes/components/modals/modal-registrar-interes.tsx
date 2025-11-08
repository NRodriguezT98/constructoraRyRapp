/**
 * 💼 MODAL - REGISTRAR INTERÉS
 *
 * Modal para registrar interés de cliente en vivienda.
 * Diseño moderno con glassmorphism y animaciones.
 *
 * ⭐ REFACTORIZADO:
 * - Usa componentes shared de formulario
 * - Usa estilos centralizados del design system
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, Home, Loader2, MessageSquare, Sparkles, X } from 'lucide-react'

import { ModernSelect, ModernTextarea } from '@/shared/components/forms'

import { useRegistrarInteres } from '../../hooks/useRegistrarInteres'
import { sharedAlertStyles, sharedButtonStyles, sharedModalStyles } from '../../styles'

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
          className={sharedModalStyles.overlay}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={sharedModalStyles.container.medium}
          >
            {/* Header con gradiente animado */}
            <div className={sharedModalStyles.header.wrapper}>
              {/* Patrón de fondo animado */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
              </div>

              <div className={sharedModalStyles.header.content}>
                <div className={sharedModalStyles.header.titleSection}>
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className={sharedModalStyles.header.iconSmall}
                  >
                    <Sparkles className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className={sharedModalStyles.header.title}>
                      Registrar Nuevo Interés
                    </h2>
                    <p className={sharedModalStyles.header.subtitle}>
                      Registra el interés del cliente en una vivienda
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className={sharedModalStyles.header.closeButton}
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
                className={sharedAlertStyles.base + ' ' + sharedAlertStyles.error}
              >
                <AlertCircle className={sharedAlertStyles.icon + ' w-5 h-5 text-red-500 dark:text-red-400'} />
                <div className={sharedAlertStyles.content}>
                  <p className={sharedAlertStyles.title + ' text-red-800 dark:text-red-300'}>
                    Ya existe un interés registrado para esta vivienda
                  </p>
                  <p className={sharedAlertStyles.message + ' text-red-600 dark:text-red-400'}>
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
        <div className={sharedModalStyles.footer.wrapper}>
          <div className={sharedModalStyles.footer.content}>
            <motion.button
              type="button"
              onClick={handleCancelar}
              disabled={guardando}
              className={sharedButtonStyles.secondary}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={guardando || !viviendaIdSeleccionada}
              className={sharedButtonStyles.primary}
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
