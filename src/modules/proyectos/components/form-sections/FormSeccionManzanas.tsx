'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  Home,
  Lock,
  LockOpen,
  Plus,
  Trash2,
} from 'lucide-react'
import type {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import type { ProyectoFormSchema } from '../../hooks/useProyectosForm'
import { proyectosFormPremiumStyles as styles } from '../../styles/proyectos-form-premium.styles'

interface ManzanaEditableState {
  id: string
  nombre: string
  esEditable: boolean
  cantidadViviendas: number
  cargando: boolean
}

interface FormSeccionManzanasProps {
  register: UseFormRegister<ProyectoFormSchema>
  errors: FieldErrors<ProyectoFormSchema>
  fields: FieldArrayWithId<ProyectoFormSchema, 'manzanas', 'id'>[]
  manzanasWatch: ProyectoFormSchema['manzanas'] | undefined
  manzanasState: Map<string, ManzanaEditableState>
  isEditing: boolean
  canRemoveManzana: () => boolean
  esManzanaEditable: (index: number) => boolean
  esManzanaEliminable: (index: number) => boolean
  obtenerMotivoBloqueado: (manzanaId: string) => string
  handleAgregarManzana: () => void
  handleEliminarManzana: (index: number) => void
}

export function FormSeccionManzanas({
  register,
  errors,
  fields,
  manzanasWatch,
  manzanasState,
  isEditing,
  canRemoveManzana,
  esManzanaEditable,
  esManzanaEliminable,
  obtenerMotivoBloqueado,
  handleAgregarManzana,
  handleEliminarManzana,
}: FormSeccionManzanasProps) {
  return (
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
      {isEditing && fields.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-950/30'
        >
          <div className='flex items-start gap-3'>
            <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div className='flex-1 space-y-1.5'>
              <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                ℹ️ Edición inteligente de manzanas
              </p>
              <p className='text-xs leading-relaxed text-blue-700 dark:text-blue-300'>
                Puedes <strong>agregar nuevas manzanas</strong> o{' '}
                <strong>modificar/eliminar las existentes</strong> que NO tienen
                viviendas creadas. Las manzanas con viviendas están protegidas
                para mantener la integridad de datos.
              </p>
              <div className='mt-1.5 flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300'>
                <div className='flex items-center gap-1.5'>
                  <LockOpen className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span>Sin viviendas = Editable</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Lock className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <span>Con viviendas = Bloqueada</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Lista de manzanas */}
      <div className={styles.manzanasSection.list}>
        {fields.length === 0 ? (
          <div className={styles.manzanasSection.emptyState}>
            <Building2 className={styles.manzanasSection.emptyIcon} />
            <p className={styles.manzanasSection.emptyTitle}>
              No hay manzanas agregadas
            </p>
            <p className={styles.manzanasSection.emptySubtitle}>
              Haz clic en &quot;Agregar&quot; para comenzar
            </p>
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {fields.map((field, index) => {
              const esEditable = esManzanaEditable(index)
              const esEliminable = esManzanaEliminable(index)
              const manzanaReal = manzanasWatch?.[index]
              const motivoBloqueado = manzanaReal?.id
                ? obtenerMotivoBloqueado(manzanaReal.id)
                : ''

              const cantidadViviendasCreadas =
                manzanaReal?.cantidadViviendasCreadas ??
                (manzanaReal?.id
                  ? manzanasState.get(manzanaReal.id)?.cantidadViviendas
                  : undefined)

              const tieneValidacion =
                isEditing &&
                (manzanaReal?.esEditable !== undefined ||
                  (manzanaReal?.id && manzanasState.has(manzanaReal.id)))

              return (
                <motion.div
                  key={field.id}
                  {...styles.animations.manzanaCard}
                  className={cn(
                    styles.manzanaCard.container,
                    !esEditable &&
                      'opacity-75 ring-2 ring-red-200 dark:ring-red-800'
                  )}
                >
                  {/* Header de la manzana */}
                  <div className={styles.manzanaCard.header}>
                    <div className={styles.manzanaCard.headerLeft}>
                      <Building2 className={styles.manzanaCard.headerIcon} />
                      <span className={styles.manzanaCard.headerTitle}>
                        Manzana #{index + 1}
                      </span>
                      {tieneValidacion ? (
                        <div className='flex items-center gap-1.5'>
                          {esEditable ? (
                            <div className='flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-2 py-0.5 dark:border-green-700 dark:bg-green-900/30'>
                              <LockOpen className='h-3 w-3 text-green-600 dark:text-green-400' />
                              <span className='text-[10px] font-medium text-green-700 dark:text-green-300'>
                                Editable
                              </span>
                            </div>
                          ) : cantidadViviendasCreadas !== undefined &&
                            cantidadViviendasCreadas > 0 ? (
                            <div
                              className='flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 dark:border-red-700 dark:bg-red-900/30'
                              title={motivoBloqueado}
                            >
                              <Lock className='h-3 w-3 text-red-600 dark:text-red-400' />
                              <span className='text-[10px] font-medium text-red-700 dark:text-red-300'>
                                {cantidadViviendasCreadas} vivienda
                                {cantidadViviendasCreadas !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    {(!isEditing || esEliminable) && canRemoveManzana() ? (
                      <button
                        type='button'
                        onClick={() => handleEliminarManzana(index)}
                        className={styles.manzanaCard.deleteButton}
                        title={
                          !esEliminable ? motivoBloqueado : 'Eliminar manzana'
                        }
                      >
                        <Trash2 className={styles.manzanaCard.deleteIcon} />
                      </button>
                    ) : null}
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
                          !esEditable &&
                            'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800'
                        )}
                      />
                      {errors.manzanas?.[index]?.nombre ? (
                        <motion.p
                          {...styles.animations.errorMessage}
                          className={styles.manzanaCard.field.error}
                        >
                          <AlertCircle
                            className={styles.manzanaCard.field.errorIcon}
                          />
                          {errors.manzanas[index]?.nombre?.message}
                        </motion.p>
                      ) : null}
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
                            !esEditable &&
                              'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800'
                          )}
                        />
                      </div>
                      {errors.manzanas?.[index]?.totalViviendas ? (
                        <motion.p
                          {...styles.animations.errorMessage}
                          className={styles.manzanaCard.field.error}
                        >
                          <AlertCircle
                            className={styles.manzanaCard.field.errorIcon}
                          />
                          {errors.manzanas[index]?.totalViviendas?.message}
                        </motion.p>
                      ) : null}
                    </div>

                    {/* Mensaje de por qué está bloqueada */}
                    {!esEditable && motivoBloqueado ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className='col-span-2 mt-2 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/30'
                      >
                        <p className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300'>
                          <Lock className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
                          <span>{motivoBloqueado}</span>
                        </p>
                      </motion.div>
                    ) : null}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
