/**
 * ProyectosForm - Componente presentacional PREMIUM
 * ✅ Separación de responsabilidades ESTRICTA
 * ✅ Diseño premium con gradientes naranja/ámbar
 * ✅ Animaciones Framer Motion
 * ✅ Modo oscuro completo
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Building2, FileText, Home, Loader2, Lock, LockOpen, MapPin, Plus, Trash2 } from 'lucide-react'
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
}

export function ProyectosForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  isEditing = false,
}: ProyectosFormProps) {
  // Hook con toda la lógica
  const {
    register,
    handleSubmit,
    errors,
    fields,
    handleAgregarManzana,
    handleEliminarManzana,
    totalManzanas,
    totalViviendas,
    manzanasWatch, // ✅ Valores reales de las manzanas
    getButtonText,
    canRemoveManzana,
    esManzanaEditable,
    esManzanaEliminable,
    obtenerMotivoBloqueado,
    validandoManzanas,
    manzanasState,
  } = useProyectosForm({ initialData, onSubmit, isEditing })

  return (
    <motion.form
      {...styles.animations.container}
      onSubmit={handleSubmit}
      className={styles.form}
    >
      {/* BADGE STICKY SUPERIOR - RESUMEN */}
      <div className={styles.badgeSticky.container}>
        <div className={styles.badgeSticky.content}>
          <div className={styles.badgeSticky.badges}>
            <div className={styles.badgeSticky.manzanasBadge}>
              <Building2 className={styles.badgeSticky.manzanasIcon} />
              <span className={styles.badgeSticky.manzanasCount}>{totalManzanas}</span>
              <span className={styles.badgeSticky.manzanasLabel}>
                {totalManzanas === 1 ? 'Manzana' : 'Manzanas'}
              </span>
            </div>
            <div className={styles.badgeSticky.viviendasBadge}>
              <Home className={styles.badgeSticky.viviendasIcon} />
              <span className={styles.badgeSticky.viviendasCount}>{totalViviendas}</span>
              <span className={styles.badgeSticky.viviendasLabel}>
                {totalViviendas === 1 ? 'Vivienda' : 'Viviendas'}
              </span>
            </div>
            {isEditing && (
              <motion.div
                {...styles.animations.editingBadge}
                className={styles.badgeSticky.editingBadge}
              >
                Editando
              </motion.div>
            )}
          </div>
        </div>
      </div>

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
              <Building2 className={styles.infoSection.headerIconSvg} />
            </div>
            <h3 className={styles.infoSection.headerTitle}>Información General</h3>
          </div>

          <div className={styles.infoSection.content}>
            {/* Campo: Nombre */}
            <div className={styles.field.container}>
              <label className={styles.field.label}>
                Nombre del Proyecto <span className={styles.field.required}>*</span>
              </label>
              <div className={styles.field.inputWrapper}>
                <Building2 className={styles.field.inputIcon} />
                <input
                  {...register('nombre')}
                  type='text'
                  placeholder='Ej: Urbanización Los Pinos'
                  className={cn(
                    styles.field.input,
                    errors.nombre && styles.field.inputError
                  )}
                />
              </div>
              {errors.nombre && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.nombre.message}
                </motion.div>
              )}
            </div>

            {/* Campo: Ubicación */}
            <div className={styles.field.container}>
              <label className={styles.field.label}>
                Ubicación <span className={styles.field.required}>*</span>
              </label>
              <div className={styles.field.inputWrapper}>
                <MapPin className={styles.field.inputIcon} />
                <input
                  {...register('ubicacion')}
                  type='text'
                  placeholder='Ej: Guacarí, Valle del Cauca'
                  className={cn(
                    styles.field.input,
                    errors.ubicacion && styles.field.inputError
                  )}
                />
              </div>
              {errors.ubicacion && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.ubicacion.message}
                </motion.div>
              )}
            </div>

            {/* Campo: Descripción */}
            <div>
              <label className={styles.field.label}>
                Descripción <span className={styles.field.required}>*</span>
              </label>
              <div className={styles.field.textareaWrapper}>
                <FileText className={styles.field.textareaIcon} />
                <textarea
                  {...register('descripcion')}
                  rows={4}
                  placeholder='Descripción breve del proyecto...'
                  className={cn(
                    styles.field.textarea,
                    errors.descripcion && styles.field.textareaError
                  )}
                />
              </div>
              {errors.descripcion && (
                <motion.div {...styles.animations.errorMessage} className={styles.field.error}>
                  <AlertCircle className={styles.field.errorIcon} />
                  {errors.descripcion.message}
                </motion.div>
              )}
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
                Manzanas del Proyecto {isEditing && '(Solo lectura)'}
              </h3>
            </div>
            {!isEditing && (
              <button
                type='button'
                onClick={handleAgregarManzana}
                className={styles.manzanasSection.addButton}
              >
                <Plus className={styles.manzanasSection.addButtonIcon} />
                Agregar
              </button>
            )}
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
              className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    ℹ️ Edición inteligente de manzanas
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Solo puedes modificar las manzanas que <strong>NO tienen viviendas creadas</strong>.
                    Las manzanas con viviendas están protegidas para mantener la integridad de datos.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300 mt-2">
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
                  const estadoManzana = manzanaReal?.id ? manzanasState.get(manzanaReal.id) : null

                  // Debug logging
                  if (isEditing && index === 0) {
                    console.log('🎨 [ProyectosForm] Renderizando manzana:', {
                      index,
                      manzanaId: manzanaReal?.id,
                      nombre: manzanaReal?.nombre,
                      esEditable,
                      esEliminable,
                      estadoManzana,
                      totalManzanasEnState: manzanasState.size,
                    })
                  }

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
                          {isEditing && estadoManzana && (
                            <div className="flex items-center gap-1.5">
                              {esEditable ? (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                                  <LockOpen className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <span className="text-[10px] font-medium text-green-700 dark:text-green-300">
                                    Editable
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
                                  title={motivoBloqueado}
                                >
                                  <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
                                  <span className="text-[10px] font-medium text-red-700 dark:text-red-300">
                                    {estadoManzana.cantidadViviendas} vivienda{estadoManzana.cantidadViviendas !== 1 ? 's' : ''}
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
          disabled={isLoading}
          className={styles.footer.submitButton}
        >
          {isLoading ? (
            <>
              <Loader2 className={styles.footer.submitButtonIcon} />
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
