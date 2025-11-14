/**
 * ProyectosForm - Componente presentacional PREMIUM
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Diseño premium con gradientes naranja/ámbar
 * ✅ Animaciones Framer Motion
 * ✅ Modo oscuro completo
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, Calendar, CheckCircle2, FileCheck, FileText, Home, Loader2, Lock, LockOpen, MapPin, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

import { cn } from '../../../shared/utils/helpers'
import { useProyectosForm } from '../hooks/useProyectosForm'
import { proyectosFormPremiumStyles as styles } from '../styles/proyectos-form-premium.styles'
import type { ProyectoFormData } from '../types'

interface ProyectosFormProps {
  onSubmit: (data: ProyectoFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<ProyectoFormData>
  isEditing?: boolean
  onHasChanges?: (hasChanges: boolean) => void // ✅ Callback para notificar cambios
  onTotalsChange?: (totals: { totalManzanas: number; totalViviendas: number }) => void // ✅ Callback para notificar totales
}

export function ProyectosForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isEditing = false,
  onHasChanges,
  onTotalsChange,
}: ProyectosFormProps) {
  // Hook con toda la lógica
  const {
    register,
    handleSubmit,
    errors,
    touchedFields, // ← Para validación progresiva
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    totalManzanas,
    totalViviendas,
    manzanasWatch, // ✅ Valores reales de las manzanas
    hasChanges, // ← Detección de cambios
    changes,
    changesCount,
    isFieldChanged,
    shouldShowChanges,
    canSave,
    getButtonText,
    canRemoveManzana,
    esManzanaEditable,
    esManzanaEliminable,
    obtenerMotivoBloqueado,
    validandoManzanas,
    validandoNombre,
    manzanasState,
  } = useProyectosForm({ initialData, onSubmit, isEditing, onHasChanges })

  // ✅ Notificar cambios en totales al padre
  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange({ totalManzanas, totalViviendas })
    }
  }, [totalManzanas, totalViviendas, onTotalsChange])

  return (
    <motion.form
      {...styles.animations.container}
      onSubmit={handleSubmit}
      className={styles.form}
    >
      {/* LAYOUT DE 2 COLUMNAS */}
      <div className={styles.grid}>
        {/* COLUMNA IZQUIERDA: Información General */}
        <motion.div
          {...styles.animations.infoSection}
          className={styles.infoSection.container}
        >
          {/* Header */}
          <div className={styles.infoSection.header}>
            <div className={styles.infoSection.headerIcon}>
              <FileCheck className={styles.infoSection.headerIconSvg} />
            </div>
            <h3 className={styles.infoSection.headerTitle}>Información General</h3>
          </div>

          <div className={styles.infoSection.content}>
            {/* Campo: Nombre */}
            <div className={styles.field.container}>
              <label className={styles.field.label}>
                Nombre del Proyecto <span className={styles.field.required}>*</span>
                {/* Indicador de campo modificado */}
                {isEditing && isFieldChanged('nombre') && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ✏️ Modificado
                  </span>
                )}
              </label>
              <div className={styles.field.inputWrapper}>
                <Building2 className={styles.field.inputIcon} />
                <input
                  {...register('nombre')}
                  type='text'
                  placeholder='Ej: Urbanización Los Pinos'
                  maxLength={100}
                  className={cn(
                    styles.field.input,
                    errors.nombre && styles.field.inputError,
                    touchedFields.nombre && !errors.nombre && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20',
                    isEditing && isFieldChanged('nombre') && !errors.nombre && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                  )}
                />
                {/* Indicador de estado (validando/error/success) */}
                {touchedFields.nombre && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validandoNombre ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : errors.nombre ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>
                )}
              </div>
              {errors.nombre && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.nombre.message}
                </motion.div>
              )}
              {!errors.nombre && (
                <p className={styles.field.helper}>
                  Solo letras, números, espacios, guiones, paréntesis y puntos
                </p>
              )}
            </div>

            {/* Campo: Ubicación */}
            <div className={styles.field.container}>
              <label className={styles.field.label}>
                Ubicación <span className={styles.field.required}>*</span>
                {/* Indicador de campo modificado */}
                {isEditing && isFieldChanged('ubicacion') && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ✏️ Modificado
                  </span>
                )}
              </label>
              <div className={styles.field.inputWrapper}>
                <MapPin className={styles.field.inputIcon} />
                <input
                  {...register('ubicacion')}
                  type='text'
                  placeholder='Ej: Guacarí, Valle del Cauca'
                  maxLength={200}
                  className={cn(
                    styles.field.input,
                    errors.ubicacion && styles.field.inputError,
                    touchedFields.ubicacion && !errors.ubicacion && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20',
                    isEditing && isFieldChanged('ubicacion') && !errors.ubicacion && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                  )}
                />
                {/* Indicador de estado */}
                {touchedFields.ubicacion && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors.ubicacion ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>
                )}
              </div>
              {errors.ubicacion && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.ubicacion.message}
                </motion.div>
              )}
              {!errors.ubicacion && (
                <p className={styles.field.helper}>
                  Estado, ciudad o dirección completa
                </p>
              )}
            </div>

            {/* Campo: Descripción */}
            <div>
              <label className={styles.field.label}>
                Descripción <span className={styles.field.required}>*</span>
                {/* Indicador de campo modificado */}
                {isEditing && isFieldChanged('descripcion') && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ✏️ Modificado
                  </span>
                )}
              </label>
              <div className={styles.field.textareaWrapper}>
                <FileText className={styles.field.textareaIcon} />
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  placeholder='Descripción breve del proyecto...'
                  maxLength={1000}
                  className={cn(
                    styles.field.textarea,
                    errors.descripcion && styles.field.textareaError,
                    touchedFields.descripcion && !errors.descripcion && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20',
                    isEditing && isFieldChanged('descripcion') && !errors.descripcion && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                  )}
                />
                {/* Indicador de estado */}
                {touchedFields.descripcion && (
                  <div className="absolute right-3 top-3">
                    {errors.descripcion ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>
                )}
              </div>
              {errors.descripcion && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.descripcion.message}
                </motion.div>
              )}
              {!errors.descripcion && (
                <p className={styles.field.helper}>
                  Mínimo 10 caracteres. Puedes usar letras, números y puntuación básica
                </p>
              )}
            </div>

            {/* Campo: Estado */}
            <div className={styles.field.container}>
              <label className={styles.field.label}>
                Estado del Proyecto <span className={styles.field.required}>*</span>
                {isEditing && isFieldChanged('estado') && (
                  <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ✏️ Modificado
                  </span>
                )}
              </label>
              <div className={styles.field.inputWrapper}>
                <Building2 className={styles.field.inputIcon} />
                <select
                  {...register('estado')}
                  className={cn(
                    styles.field.select,
                    errors.estado && styles.field.selectError,
                    touchedFields.estado && !errors.estado && 'border-green-300 dark:border-green-700',
                    isEditing && isFieldChanged('estado') && !errors.estado && 'border-orange-300 dark:border-orange-700'
                  )}
                >
                  <option value="en_planificacion">En Planificación</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="en_construccion">En Construcción</option>
                  <option value="completado">Completado</option>
                  <option value="pausado">Pausado</option>
                </select>
                {touchedFields.estado && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                    {errors.estado ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                    )}
                  </div>
                )}
              </div>
              {errors.estado && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.estado.message}
                </motion.div>
              )}
              {!errors.estado && (
                <p className={styles.field.helper}>
                  Marca el estado actual del proyecto
                </p>
              )}
            </div>

            {/* Fechas en Grid 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo: Fecha de Inicio */}
              <div className={styles.field.container}>
                <label className={styles.field.label}>
                  Fecha de Inicio
                  {isEditing && isFieldChanged('fechaInicio') && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                      ✏️ Modificado
                    </span>
                  )}
                </label>
                <div className={styles.field.inputWrapper}>
                  <Calendar className={styles.field.inputIcon} />
                  <input
                    {...register('fechaInicio')}
                    type='date'
                    className={cn(
                      styles.field.input,
                      errors.fechaInicio && styles.field.inputError,
                      touchedFields.fechaInicio && !errors.fechaInicio && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20',
                      isEditing && isFieldChanged('fechaInicio') && !errors.fechaInicio && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                    )}
                  />
                  {touchedFields.fechaInicio && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.fechaInicio ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                      )}
                    </div>
                  )}
                </div>
                {errors.fechaInicio && (
                  <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                    <AlertCircle className={styles.field.errorIcon} />
                    {errors.fechaInicio.message}
                  </motion.div>
                )}
              </div>

              {/* Campo: Fecha de Fin Estimada */}
              <div className={styles.field.container}>
                <label className={styles.field.label}>
                  Fecha de Fin Estimada
                  {isEditing && isFieldChanged('fechaFinEstimada') && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                      ✏️ Modificado
                    </span>
                  )}
                </label>
                <div className={styles.field.inputWrapper}>
                  <Calendar className={styles.field.inputIcon} />
                  <input
                    {...register('fechaFinEstimada')}
                    type='date'
                    className={cn(
                      styles.field.input,
                      errors.fechaFinEstimada && styles.field.inputError,
                      touchedFields.fechaFinEstimada && !errors.fechaFinEstimada && 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20',
                      isEditing && isFieldChanged('fechaFinEstimada') && !errors.fechaFinEstimada && 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20'
                    )}
                  />
                  {touchedFields.fechaFinEstimada && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {errors.fechaFinEstimada ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500 animate-in fade-in zoom-in duration-200" />
                      )}
                    </div>
                  )}
                </div>
                {errors.fechaFinEstimada && (
                  <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                    <AlertCircle className={styles.field.errorIcon} />
                    {errors.fechaFinEstimada.message}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* COLUMNA DERECHA: Manzanas */}
        <motion.div
          {...styles.animations.manzanasSection}
          className={styles.manzanasSection.container}
        >
          {/* Header */}
          <div className={styles.manzanasSection.header}>
            <div className={styles.manzanasSection.headerLeft}>
              <div className={styles.manzanasSection.headerIcon}>
                <Building2 className={styles.manzanasSection.headerIconSvg} />
              </div>
              <h3 className={styles.manzanasSection.headerTitle}>
                Manzanas del Proyecto
              </h3>
            </div>
            <button
              type='button'
              onClick={handleAgregarManzana}
              className={styles.manzanasSection.addButton}
            >
              <Plus className={styles.manzanasSection.addButtonIcon} />
              Agregar
            </button>
          </div>

          {/* Error general de manzanas */}
          {errors.manzanas && !Array.isArray(errors.manzanas) && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.manzanasSection.errorMessage}
            >
              <AlertCircle className={styles.manzanasSection.errorIcon} />
              {errors.manzanas.message}
            </motion.div>
          )}

          {/* Mensaje informativo en modo edición */}
          {isEditing && fields.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-2.5 mb-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    ℹ️ Edición inteligente de manzanas
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Puedes <strong>agregar nuevas manzanas</strong> o <strong>modificar/eliminar las existentes</strong> que NO tienen viviendas creadas.
                    Las manzanas con viviendas están protegidas para mantener la integridad de datos.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300 mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <LockOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Sin viviendas = Editable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Con viviendas = Bloqueada</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lista de manzanas con AnimatePresence */}
          <div className={styles.manzanasSection.list}>
            {fields.length === 0 ? (
              <div className={styles.manzanasSection.emptyState}>
                <Building2 className={styles.manzanasSection.emptyIcon} />
                <p className={styles.manzanasSection.emptyTitle}>
                  No hay manzanas agregadas
                </p>
                <p className={styles.manzanasSection.emptySubtitle}>
                  Haz clic en "Agregar" para comenzar
                </p>
              </div>
            ) : (
              <AnimatePresence mode='popLayout'>
                {fields.map((field, index) => {
                  const esEditable = esManzanaEditable(index)
                  const esEliminable = esManzanaEliminable(index)
                  const manzanaReal = manzanasWatch?.[index] // ✅ Valor real del formulario
                  const motivoBloqueado = manzanaReal?.id ? obtenerMotivoBloqueado(manzanaReal.id) : ''

                  // ✅ OPTIMIZACIÓN: Usar datos precargados si existen, sino usar manzanasState (fallback)
                  const cantidadViviendasCreadas = manzanaReal?.cantidadViviendasCreadas ??
                    (manzanaReal?.id ? manzanasState.get(manzanaReal.id)?.cantidadViviendas : undefined)

                  const tieneValidacion = isEditing && (
                    manzanaReal?.esEditable !== undefined ||
                    (manzanaReal?.id && manzanasState.has(manzanaReal.id))
                  )

                  return (
                    <motion.div
                      key={field.id}
                      {...styles.animations.manzanaCard}
                      className={cn(
                        styles.manzanaCard.container,
                        !esEditable && 'opacity-75 ring-2 ring-red-200 dark:ring-red-800'
                      )}
                    >
                      {/* Header de la manzana */}
                      <div className={styles.manzanaCard.header}>
                        <div className={styles.manzanaCard.headerLeft}>
                          <Building2 className={styles.manzanaCard.headerIcon} />
                          <span className={styles.manzanaCard.headerTitle}>
                            Manzana #{index + 1}
                          </span>
                          {/* Badge de estado */}
                          {tieneValidacion && (
                            <div className="flex items-center gap-1.5">
                              {esEditable ? (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                                  <LockOpen className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <span className="text-[10px] font-medium text-green-700 dark:text-green-300">
                                    Editable
                                  </span>
                                </div>
                              ) : cantidadViviendasCreadas !== undefined && cantidadViviendasCreadas > 0 && (
                                <div
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
                                  title={motivoBloqueado}
                                >
                                  <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
                                  <span className="text-[10px] font-medium text-red-700 dark:text-red-300">
                                    {cantidadViviendasCreadas} vivienda{cantidadViviendasCreadas !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {(!isEditing || esEliminable) && canRemoveManzana() && (
                          <button
                            type='button'
                            onClick={() => handleEliminarManzana(index)}
                            className={styles.manzanaCard.deleteButton}
                            title={!esEliminable ? motivoBloqueado : 'Eliminar manzana'}
                          >
                            <Trash2 className={styles.manzanaCard.deleteIcon} />
                          </button>
                        )}
                      </div>

                    {/* Campos */}
                    <div className={styles.manzanaCard.grid}>
                      {/* Nombre */}
                      <div className={styles.manzanaCard.field.container}>
                        <label className={styles.manzanaCard.field.label}>
                          Nombre de la manzana
                        </label>
                        <input
                          {...register(`manzanas.${index}.nombre`)}
                          type='text'
                          placeholder='Nombre'
                          disabled={!esEditable}
                          className={cn(
                            styles.manzanaCard.field.input,
                            errors.manzanas?.[index]?.nombre &&
                              styles.manzanaCard.field.inputError,
                            !esEditable && 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                          )}
                        />
                        {errors.manzanas?.[index]?.nombre && (
                          <motion.p
                            {...styles.animations.errorMessage}
                            className={styles.manzanaCard.field.error}
                          >
                            <AlertCircle className={styles.manzanaCard.field.errorIcon} />
                            {errors.manzanas[index]?.nombre?.message}
                          </motion.p>
                        )}
                      </div>

                      {/* Cantidad Viviendas */}
                      <div className={styles.manzanaCard.field.container}>
                        <label className={styles.manzanaCard.field.label}>
                          Cantidad de viviendas
                        </label>
                        <div className={styles.manzanaCard.field.inputWrapper}>
                          <Home className={styles.manzanaCard.field.inputIcon} />
                          <input
                            {...register(`manzanas.${index}.totalViviendas`, {
                              valueAsNumber: true,
                            })}
                            type='number'
                            min='1'
                            placeholder='N° Viviendas'
                            disabled={!esEditable}
                            className={cn(
                              styles.manzanaCard.field.inputWithIcon,
                              errors.manzanas?.[index]?.totalViviendas &&
                                styles.manzanaCard.field.inputError,
                              !esEditable && 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                            )}
                          />
                        </div>
                        {errors.manzanas?.[index]?.totalViviendas && (
                          <motion.p
                            {...styles.animations.errorMessage}
                            className={styles.manzanaCard.field.error}
                          >
                            <AlertCircle className={styles.manzanaCard.field.errorIcon} />
                            {errors.manzanas[index]?.totalViviendas?.message}
                          </motion.p>
                        )}
                      </div>

                      {/* Mensaje de por qué está bloqueada */}
                      {!esEditable && motivoBloqueado && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="col-span-2 mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                        >
                          <p className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{motivoBloqueado}</span>
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* BOTONES FOOTER */}
      <motion.div
        {...styles.animations.footer}
        className={styles.footer.container}
      >
        <button
          type='button'
          onClick={onCancel}
          disabled={isLoading}
          className={styles.footer.cancelButton}
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isLoading || !canSave} // ← Deshabilitar si no hay cambios (en edición)
          className={cn(
            styles.footer.submitButton,
            !canSave && 'opacity-50 cursor-not-allowed' // ← Estilo deshabilitado
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className={cn(styles.footer.submitButtonIcon, 'animate-spin')} />
              Guardando...
            </>
          ) : (
            <>
              <Building2 className={styles.footer.submitButtonIcon} />
              {getButtonText(isEditing)}
            </>
          )}
        </button>
      </motion.div>
    </motion.form>
  )
}
