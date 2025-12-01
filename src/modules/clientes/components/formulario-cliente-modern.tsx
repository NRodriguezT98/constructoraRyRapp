/**
 * 📋 FORMULARIO CLIENTE - Modal Moderno
 *
 * Formulario multi-step para crear/editar clientes.
 * Diseño moderno con animaciones y glassmorphism.
 *
 * ⭐ REFACTORIZADO: Usa componentes shared de formulario
 */

'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Heart,
    Home,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Sparkles,
    User,
    Users,
    X,
} from 'lucide-react'

import { ModernInput, ModernSelect, ModernTextarea } from '@/shared/components/forms'


import type { CrearClienteDTO, EstadoCivil, TipoDocumento } from '../types'
import { ESTADOS_CIVILES, TIPOS_DOCUMENTO } from '../types'

interface FormularioClienteProps {
  isOpen: boolean
  onClose: () => void
  formData: CrearClienteDTO
  errors: Record<string, string>
  isSubmitting: boolean
  esEdicion: boolean
  onSubmit: (e: React.FormEvent) => void
  onChange: (campo: keyof CrearClienteDTO, valor: any) => void
  // Props adicionales para el interés
  proyectos?: Array<{ id: string; nombre: string; ubicacion: string }>
  viviendas?: Array<{ id: string; numero: string; manzana_nombre: string; precio: number }>
  cargandoProyectos?: boolean
  cargandoViviendas?: boolean
  onProyectoChange?: (proyectoId: string) => void
  onViviendaChange?: (viviendaId: string) => void
  // Validaciones por step (Step 0 es async para verificar duplicados)
  validarStep0?: () => Promise<boolean>
  validarStep1?: () => boolean
  validarStep2?: () => boolean
  validarStep3?: () => boolean
}

export function FormularioCliente({
  isOpen,
  onClose,
  formData,
  errors,
  isSubmitting,
  esEdicion,
  onSubmit,
  onChange,
  proyectos = [],
  viviendas = [],
  cargandoProyectos = false,
  cargandoViviendas = false,
  onProyectoChange,
  onViviendaChange,
  validarStep0,
  validarStep1,
  validarStep2,
  validarStep3,
}: FormularioClienteProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { id: 0, label: 'Personal', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 1, label: 'Contacto', icon: Phone, color: 'from-purple-500 to-pink-500' },
    { id: 2, label: 'Interés', icon: Heart, color: 'from-rose-500 to-orange-500' },
    { id: 3, label: 'Adicional', icon: MessageSquare, color: 'from-orange-500 to-red-500' },
  ]

  // Resetear step cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const nextStep = async () => {
    // Validar el step actual antes de avanzar
    let esValido = true

    if (currentStep === 0 && validarStep0) {
      // ⚠️ Step 0 es ASYNC (verifica duplicados en DB)
      esValido = await validarStep0()
    } else if (currentStep === 1 && validarStep1) {
      esValido = validarStep1()
    } else if (currentStep === 2 && validarStep2) {
      esValido = validarStep2()
    } else if (currentStep === 3 && validarStep3) {
      esValido = validarStep3()
    }

    // Solo avanzar si es válido
    if (esValido && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  /**
   * Cambiar a un step específico desde el stepper
   * Valida todos los pasos intermedios antes de permitir el salto
   */
  const goToStep = async (targetStep: number) => {
    // Si el paso target es anterior o igual al actual, permitir sin validación
    if (targetStep <= currentStep) {
      setCurrentStep(targetStep)
      return
    }

    // Si intenta avanzar, validar cada paso intermedio
    for (let i = currentStep; i < targetStep; i++) {
      let esValido = true

      if (i === 0 && validarStep0) {
        // ⚠️ Step 0 es ASYNC (verifica duplicados en DB)
        esValido = await validarStep0()
      } else if (i === 1 && validarStep1) {
        esValido = validarStep1()
      } else if (i === 2 && validarStep2) {
        esValido = validarStep2()
      } else if (i === 3 && validarStep3) {
        esValido = validarStep3()
      }

      // Si algún paso intermedio no es válido, detener
      if (!esValido) {
        // Mover al paso que falló para que el usuario vea los errores
        setCurrentStep(i)
        return
      }
    }

    // Si todos los pasos intermedios son válidos, avanzar al target
    setCurrentStep(targetStep)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className='relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
          >
            {/* Header con gradiente animado */}
            <div className='relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-6 py-5'>
              {/* Patrón de fondo animado */}
              <div className='absolute inset-0 opacity-20'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]' />
              </div>

              <div className='relative flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30'
                  >
                    <Sparkles className='h-6 w-6 text-white' />
                  </motion.div>
                  <div>
                    <h2 className='text-xl font-bold text-white'>
                      {esEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <p className='text-xs text-purple-100'>
                      {esEdicion
                        ? 'Actualiza la información del cliente'
                        : 'Paso ' + (currentStep + 1) + ' de ' + steps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='group rounded-lg p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:rotate-90'
                  type='button'
                >
                  <X className='h-5 w-5 transition-transform' />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className='relative mt-5 flex items-center justify-between'>
                {steps.map((step, idx) => {
                  const StepIcon = step.icon
                  const isActive = currentStep === step.id
                  const isCompleted = currentStep > step.id

                  return (
                    <div key={step.id} className='flex flex-1 items-center'>
                      <button
                        type='button'
                        onClick={() => goToStep(step.id)}
                        className='group relative flex items-center gap-3'
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isActive ? 1.15 : 1,
                          }}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-lg transition-all ${
                            isCompleted
                              ? 'bg-white text-purple-600'
                              : isActive
                                ? 'bg-white text-purple-600'
                                : 'bg-white/20 text-white backdrop-blur-sm'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className='h-4 w-4' />
                          ) : (
                            <StepIcon className='h-4 w-4' />
                          )}
                        </motion.div>
                        <span
                          className={`hidden text-xs font-semibold sm:block ${
                            isActive
                              ? 'text-white'
                              : 'text-white/70'
                          }`}
                        >
                          {step.label}
                        </span>
                      </button>
                      {idx < steps.length - 1 && (
                        <div className='mx-2.5 h-1 flex-1 overflow-hidden rounded-full bg-white/20'>
                          <motion.div
                            initial={false}
                            animate={{
                              width: isCompleted ? '100%' : '0%',
                            }}
                            transition={{ duration: 0.3 }}
                            className='h-full bg-white shadow-lg'
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Form Content con scroll */}
            <div className='max-h-[calc(90vh-210px)] overflow-y-auto'>
              <form onSubmit={onSubmit} className='p-6'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 0: Información Personal */}
                    {currentStep === 0 && (
                      <div className='space-y-4'>
                        <div className='mb-5'>
                          <h3 className='text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5'>
                            <User className='h-4 w-4 text-purple-500' />
                            Información Personal
                          </h3>
                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Datos básicos de identificación del cliente
                          </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <ModernInput
                            icon={User}
                            label='Nombres'
                            required
                            type='text'
                            value={formData.nombres}
                            onChange={(e: any) => onChange('nombres', e.target.value)}
                            placeholder='Ej: Juan Carlos'
                            disabled={isSubmitting}
                            error={errors.nombres}
                          />

                          <ModernInput
                            icon={User}
                            label='Apellidos'
                            required
                            type='text'
                            value={formData.apellidos}
                            onChange={(e: any) => onChange('apellidos', e.target.value)}
                            placeholder='Ej: Pérez García'
                            disabled={isSubmitting}
                            error={errors.apellidos}
                          />

                          <ModernSelect
                            icon={FileText}
                            label='Tipo de Documento'
                            required
                            value={formData.tipo_documento}
                            onChange={(e: any) =>
                              onChange('tipo_documento', e.target.value as TipoDocumento)
                            }
                            disabled={isSubmitting}
                            error={errors.tipo_documento}
                          >
                            {Object.entries(TIPOS_DOCUMENTO).map(([key, value]) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            ))}
                          </ModernSelect>

                          <ModernInput
                            icon={FileText}
                            label='Número de Documento'
                            required
                            type='text'
                            value={formData.numero_documento}
                            onChange={(e: any) => onChange('numero_documento', e.target.value)}
                            placeholder='Ej: 1234567890'
                            disabled={isSubmitting}
                            error={errors.numero_documento}
                          />

                          <ModernInput
                            icon={Calendar}
                            label='Fecha de Nacimiento'
                            type='date'
                            value={formData.fecha_nacimiento}
                            onChange={(e: any) => onChange('fecha_nacimiento', e.target.value)}
                            disabled={isSubmitting}
                          />

                          <ModernSelect
                            icon={Users}
                            label='Estado Civil'
                            value={formData.estado_civil || ''}
                            onChange={(e: any) =>
                              onChange('estado_civil', e.target.value as EstadoCivil || undefined)
                            }
                            disabled={isSubmitting}
                          >
                            <option value=''>Seleccione...</option>
                            {Object.entries(ESTADOS_CIVILES).map(([key, value]) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            ))}
                          </ModernSelect>
                        </div>
                      </div>
                    )}

                    {/* Step 1: Información de Contacto */}
                    {currentStep === 1 && (
                      <div className='space-y-4'>
                        <div className='mb-5'>
                          <h3 className='text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5'>
                            <Phone className='h-4 w-4 text-purple-500' />
                            Información de Contacto
                          </h3>
                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Datos para comunicarnos con el cliente
                          </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <ModernInput
                            icon={Phone}
                            label='Teléfono Principal'
                            type='tel'
                            value={formData.telefono}
                            onChange={(e: any) => onChange('telefono', e.target.value)}
                            placeholder='Ej: 3001234567'
                            disabled={isSubmitting}
                            error={errors.telefono}
                          />

                          <ModernInput
                            icon={Phone}
                            label='Teléfono Alternativo'
                            type='tel'
                            value={formData.telefono_alternativo}
                            onChange={(e: any) => onChange('telefono_alternativo', e.target.value)}
                            placeholder='Ej: 3007654321'
                            disabled={isSubmitting}
                          />

                          <ModernInput
                            icon={Mail}
                            label='Correo Electrónico'
                            type='email'
                            value={formData.email}
                            onChange={(e: any) => onChange('email', e.target.value)}
                            placeholder='cliente@example.com'
                            disabled={isSubmitting}
                            error={errors.email}
                          />

                          <ModernInput
                            icon={MapPin}
                            label='Dirección'
                            type='text'
                            value={formData.direccion}
                            onChange={(e: any) => onChange('direccion', e.target.value)}
                            placeholder='Calle 123 #45-67'
                            disabled={isSubmitting}
                          />

                          <ModernInput
                            icon={Building2}
                            label='Ciudad'
                            type='text'
                            value={formData.ciudad}
                            onChange={(e: any) => onChange('ciudad', e.target.value)}
                            placeholder='Ej: Cali'
                            disabled={isSubmitting}
                          />

                          <ModernInput
                            icon={Home}
                            label='Departamento'
                            type='text'
                            value={formData.departamento}
                            onChange={(e: any) => onChange('departamento', e.target.value)}
                            placeholder='Ej: Valle del Cauca'
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Interés en Proyectos/Viviendas */}
                    {currentStep === 2 && !esEdicion && (
                      <div className='space-y-4'>
                        <div className='mb-5'>
                          <h3 className='text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5'>
                            <Heart className='h-4 w-4 text-rose-500' />
                            ¿En qué está interesado?
                          </h3>
                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Opcional: Registra el proyecto o vivienda de interés del cliente
                          </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4'>
                          <ModernSelect
                            icon={Building2}
                            label='Proyecto de Interés'
                            value={formData.interes_inicial?.proyecto_id || ''}
                            onChange={(e: any) => {
                              const proyectoId = e.target.value
                              onProyectoChange?.(proyectoId)
                              onChange('interes_inicial', {
                                ...formData.interes_inicial,
                                proyecto_id: proyectoId,
                                vivienda_id: undefined, // Reset vivienda
                              })
                            }}
                            disabled={isSubmitting || cargandoProyectos}
                          >
                            <option value=''>Ninguno (sin interés específico)</option>
                            {cargandoProyectos && <option disabled>Cargando proyectos...</option>}
                            {proyectos.map((proyecto) => (
                              <option key={proyecto.id} value={proyecto.id}>
                                {proyecto.nombre} - {proyecto.ubicacion}
                              </option>
                            ))}
                          </ModernSelect>

                          {formData.interes_inicial?.proyecto_id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className='space-y-4'
                            >
                              <ModernSelect
                                icon={Home}
                                label='Vivienda Específica (Opcional)'
                                value={formData.interes_inicial?.vivienda_id || ''}
                                onChange={(e: any) => {
                                  const viviendaId = e.target.value
                                  onViviendaChange?.(viviendaId)
                                  onChange('interes_inicial', {
                                    ...formData.interes_inicial,
                                    vivienda_id: viviendaId || undefined,
                                  })
                                }}
                                disabled={isSubmitting || cargandoViviendas}
                              >
                                <option value=''>
                                  {cargandoViviendas
                                    ? 'Cargando viviendas...'
                                    : 'Interesado en el proyecto en general'}
                                </option>
                                {viviendas.map((vivienda) => (
                                  <option key={vivienda.id} value={vivienda.id}>
                                    Manzana {vivienda.manzana_nombre} - Casa {vivienda.numero} (
                                    {new Intl.NumberFormat('es-CO', {
                                      style: 'currency',
                                      currency: 'COP',
                                      minimumFractionDigits: 0,
                                    }).format(vivienda.valor_total)}
                                    )
                                  </option>
                                ))}
                              </ModernSelect>

                              <ModernTextarea
                                icon={MessageSquare}
                                label='Notas del Interés'
                                value={formData.interes_inicial?.notas_interes || ''}
                                onChange={(e: any) =>
                                  onChange('interes_inicial', {
                                    ...formData.interes_inicial,
                                    notas_interes: e.target.value,
                                  })
                                }
                                placeholder='Ej: Interesado en casa de 2 pisos, presupuesto hasta $200M, necesita crédito...'
                                rows={3}
                                disabled={isSubmitting}
                              />
                            </motion.div>
                          )}

                          {!formData.interes_inicial?.proyecto_id && (
                            <div className='rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/50'>
                              <Heart className='mx-auto h-10 w-10 text-gray-300 dark:text-gray-600' />
                              <p className='mt-2.5 text-xs text-gray-500 dark:text-gray-400'>
                                Si el cliente no tiene un proyecto específico en mente,
                                <br />
                                puedes dejar esta sección vacía y continuar.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Información Adicional */}
                    {currentStep === 3 && (
                      <div className='space-y-4'>
                        <div className='mb-5'>
                          <h3 className='text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5'>
                            <MessageSquare className='h-4 w-4 text-purple-500' />
                            Información Adicional
                          </h3>
                          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Datos complementarios y observaciones
                          </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4'>
                          <ModernTextarea
                            icon={MessageSquare}
                            label='Notas y Observaciones'
                            value={formData.notas}
                            onChange={(e: any) => onChange('notas', e.target.value)}
                            placeholder='Observaciones adicionales sobre el cliente...'
                            rows={4}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>
            </div>

            {/* Footer con botones */}
            <div className='border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50'>
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className='flex items-center gap-1.5 rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Anterior
                </button>

                <div className='flex gap-2.5'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='rounded-lg border-2 border-gray-300 px-5 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type='button'
                      onClick={nextStep}
                      className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5'
                    >
                      Siguiente
                      <ChevronRight className='h-4 w-4' />
                    </button>
                  ) : (
                    <button
                      type='submit'
                      onClick={onSubmit}
                      disabled={isSubmitting}
                      className='group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className='h-4 w-4 rounded-full border-2 border-white border-t-transparent'
                          />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className='h-4 w-4' />
                          {esEdicion ? 'Actualizar Cliente' : 'Crear Cliente'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
