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

import { useEffect, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, Heart, Home, Loader2, MessageSquare, Search, X } from 'lucide-react'

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
    viviendasFiltradas,
    busquedaVivienda,
    setBusquedaVivienda,
    seleccionarVivienda,
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

  // Estado local del combobox de vivienda
  const comboboxRef = useRef<HTMLDivElement>(null)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [comboboxInputValue, setComboboxInputValue] = useState('')

  // Resetear combobox al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setComboboxInputValue('')
      setComboboxOpen(false)
    }
  }, [isOpen])

  // Resetear input cuando se limpia la vivienda seleccionada (ej: cambio de proyecto)
  useEffect(() => {
    if (!viviendaIdSeleccionada) {
      setComboboxInputValue('')
    }
  }, [viviendaIdSeleccionada])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setComboboxOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleComboboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setComboboxInputValue(val)
    setBusquedaVivienda(val)
    setComboboxOpen(true)
    if (!val) seleccionarVivienda('')
  }

  const handleComboboxSelect = (vivienda: typeof viviendas[number]) => {
    seleccionarVivienda(vivienda.id)
    const manzLabel = vivienda.manzanas?.nombre ? `Manzana ${vivienda.manzanas.nombre} · ` : ''
    setComboboxInputValue(`${manzLabel}Casa ${vivienda.numero}`)
    setBusquedaVivienda('')
    setComboboxOpen(false)
  }

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
                    <Heart className="h-7 w-7 text-white" />
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

          {/* Combobox buscable de Vivienda */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Home className="w-4 h-4 text-gray-400" />
              Vivienda <span className="text-red-500 ml-0.5">*</span>
            </label>

            {/* Campo oculto para que React Hook Form valide el valor */}
            <input
              type="hidden"
              {...register('viviendaId', { required: 'Debes seleccionar una vivienda' })}
            />

            <div ref={comboboxRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={comboboxInputValue}
                  onChange={handleComboboxChange}
                  onFocus={() => {
                    if (!guardando && proyectoIdSeleccionado && !cargandoViviendas && viviendas.length > 0) {
                      setComboboxOpen(true)
                    }
                  }}
                  placeholder={
                    !proyectoIdSeleccionado
                      ? 'Primero selecciona un proyecto'
                      : cargandoViviendas
                      ? 'Cargando viviendas...'
                      : viviendas.length === 0
                      ? 'No hay viviendas disponibles'
                      : 'Buscar por manzana o número (ej: A1, B2)...'
                  }
                  disabled={!proyectoIdSeleccionado || cargandoViviendas || guardando || viviendas.length === 0}
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border-2 transition-all text-sm placeholder:text-gray-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
                    errors.viviendaId
                      ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : viviendaIdSeleccionada
                      ? 'border-blue-400 dark:border-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
                {viviendaIdSeleccionada && !guardando && (
                  <button
                    type="button"
                    onClick={() => {
                      seleccionarVivienda('')
                      setComboboxInputValue('')
                      setBusquedaVivienda('')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown de resultados */}
              {comboboxOpen && proyectoIdSeleccionado && !cargandoViviendas && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl max-h-52 overflow-y-auto">
                  {viviendasFiltradas.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Sin resultados para &quot;{busquedaVivienda}&quot;
                    </div>
                  ) : (
                    viviendasFiltradas.map((vivienda) => (
                      <button
                        key={vivienda.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault() // Evitar que el input pierda foco antes del click
                          handleComboboxSelect(vivienda)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors text-sm border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                          viviendaIdSeleccionada === vivienda.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <span className="font-medium">
                          {vivienda.manzanas?.nombre ? `Manzana ${vivienda.manzanas.nombre} · ` : ''}
                          Casa {vivienda.numero}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0">
                          ${vivienda.valor_total.toLocaleString('es-CO')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {errors.viviendaId && (
              <p className="mt-1 text-xs text-red-500">{String(errors.viviendaId.message)}</p>
            )}
          </div>

          {/* Alerta: Sin viviendas disponibles en el proyecto */}
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
