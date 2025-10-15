'use client'

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Trash2,
  Upload,
  MapPin,
  Building,
  FileText,
  Sparkles,
  Home,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  proyectoSchema,
  type ProyectoFormData,
} from '../../lib/validations/proyecto'

interface FormularioProyectoProps {
  onSubmit: (data: ProyectoFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function FormularioProyecto({
  onSubmit,
  onCancel,
  isLoading = false,
}: FormularioProyectoProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProyectoFormData>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      ubicacion: '',
      manzanas: [{ letra: 'A', numeroViviendas: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'manzanas',
  })

  const [documentos, setDocumentos] = useState<File[]>([])

  const manzanas = watch('manzanas')

  const agregarManzana = () => {
    // Calcular siguiente letra
    const letrasUsadas = manzanas.map(m => m.letra)
    let siguienteLetra = 'A'

    for (let i = 0; i < 26; i++) {
      const letra = String.fromCharCode(65 + i) // A=65, B=66, etc.
      if (!letrasUsadas.includes(letra)) {
        siguienteLetra = letra
        break
      }
    }

    append({ letra: siguienteLetra, numeroViviendas: 1 })
  }

  const manejarDocumentos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || [])
    setDocumentos(prev => [...prev, ...archivos])
  }

  const eliminarDocumento = (index: number) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmitForm = async (data: ProyectoFormData) => {
    try {
      await onSubmit(data)
      toast.success('Proyecto creado exitosamente', {
        description: `${data.nombre} se ha creado con ${data.manzanas.length} manzanas`,
      })
    } catch (error) {
      toast.error('Error al crear el proyecto')
      console.error(error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='space-y-8'
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-8'>
        {/* Información básica del proyecto */}
        <motion.div variants={itemVariants}>
          <Card className='border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center text-2xl font-bold text-gray-900 dark:text-white'>
                <div className='mr-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2'>
                  <Building className='h-6 w-6 text-white' />
                </div>
                Información del Proyecto
                <Sparkles className='ml-2 h-5 w-5 text-blue-500' />
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <Label
                    htmlFor='nombre'
                    className='mb-2 flex items-center font-medium text-gray-700 dark:text-gray-300'
                  >
                    <Building className='mr-2 h-4 w-4 text-blue-500' />
                    Nombre del Proyecto *
                  </Label>
                  <Input
                    id='nombre'
                    {...register('nombre')}
                    placeholder='Ej: Las Américas 2'
                    className='h-12 border-blue-200 bg-white text-lg focus:border-blue-500 dark:border-blue-700 dark:bg-gray-900 dark:focus:border-blue-400'
                  />
                  {errors.nombre && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-1 flex items-center text-sm text-red-500'
                    >
                      {errors.nombre.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor='ubicacion'
                    className='mb-2 flex items-center font-medium text-gray-700 dark:text-gray-300'
                  >
                    <MapPin className='mr-2 h-4 w-4 text-green-500' />
                    Ubicación del Proyecto *
                  </Label>
                  <Input
                    id='ubicacion'
                    {...register('ubicacion')}
                    placeholder='Dirección completa del proyecto'
                    className='h-12 border-blue-200 bg-white text-lg focus:border-blue-500 dark:border-blue-700 dark:bg-gray-900 dark:focus:border-blue-400'
                  />
                  {errors.ubicacion && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mt-1 text-sm text-red-500'
                    >
                      {errors.ubicacion.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor='descripcion'
                  className='mb-2 flex items-center font-medium text-gray-700 dark:text-gray-300'
                >
                  <FileText className='mr-2 h-4 w-4 text-purple-500' />
                  Descripción del Proyecto *
                </Label>
                <Textarea
                  id='descripcion'
                  {...register('descripcion')}
                  placeholder='Describe el proyecto, características principales, objetivo, etc.'
                  className='min-h-[120px] border-blue-200 bg-white text-lg focus:border-blue-500 dark:border-blue-700 dark:bg-gray-900 dark:focus:border-blue-400'
                  rows={4}
                />
                {errors.descripcion && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-1 text-sm text-red-500'
                  >
                    {errors.descripcion.message}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Configuración de manzanas */}
        <motion.div variants={itemVariants}>
          <Card className='border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:border-emerald-800 dark:from-emerald-950/20 dark:to-teal-950/20'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center text-2xl font-bold text-gray-900 dark:text-white'>
                  <div className='mr-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-2'>
                    <Home className='h-6 w-6 text-white' />
                  </div>
                  Configuración de Manzanas
                  <span className='ml-3 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                    {fields.length} manzana{fields.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
                <Button
                  type='button'
                  onClick={agregarManzana}
                  className='bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Agregar Manzana
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className='group relative rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-lg transition-all duration-300 hover:border-emerald-300 hover:shadow-xl dark:border-emerald-700 dark:bg-gray-900 dark:hover:border-emerald-600'
                  >
                    <div className='absolute right-3 top-3'>
                      <div className='rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                        Manzana {index + 1}
                      </div>
                    </div>

                    <div className='mt-4 flex items-end gap-6'>
                      <div className='flex-1'>
                        <Label className='mb-2 flex items-center font-medium text-gray-700 dark:text-gray-300'>
                          <span className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white'>
                            {String.fromCharCode(65 + index)}
                          </span>
                          Letra de la Manzana
                        </Label>
                        <Input
                          {...register(`manzanas.${index}.letra`)}
                          placeholder='A'
                          className='h-12 border-emerald-200 text-center text-lg font-bold uppercase focus:border-emerald-500 dark:border-emerald-700 dark:focus:border-emerald-400'
                          maxLength={2}
                        />
                        {errors.manzanas?.[index]?.letra && (
                          <p className='mt-1 text-sm text-red-500'>
                            {errors.manzanas[index]?.letra?.message}
                          </p>
                        )}
                      </div>

                      <div className='flex-2'>
                        <Label className='mb-2 flex items-center font-medium text-gray-700 dark:text-gray-300'>
                          <Home className='mr-2 h-4 w-4 text-blue-500' />
                          Número de Viviendas
                        </Label>
                        <Input
                          type='number'
                          {...register(`manzanas.${index}.numeroViviendas`, {
                            valueAsNumber: true,
                          })}
                          placeholder='18'
                          className='h-12 border-emerald-200 text-lg focus:border-emerald-500 dark:border-emerald-700 dark:focus:border-emerald-400'
                          min={1}
                          max={100}
                        />
                        {errors.manzanas?.[index]?.numeroViviendas && (
                          <p className='mt-1 text-sm text-red-500'>
                            {errors.manzanas[index]?.numeroViviendas?.message}
                          </p>
                        )}
                      </div>

                      {fields.length > 1 && (
                        <Button
                          type='button'
                          variant='destructive'
                          size='lg'
                          onClick={() => remove(index)}
                          className='h-12 w-12 shrink-0 bg-red-500 transition-colors hover:bg-red-600'
                        >
                          <Trash2 className='h-5 w-5' />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {errors.manzanas?.root && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-500 dark:border-red-800 dark:bg-red-950'
                  >
                    {errors.manzanas.root.message}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subida de documentos */}
        <motion.div variants={itemVariants}>
          <Card className='border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center text-2xl font-bold text-gray-900 dark:text-white'>
                <div className='mr-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 p-2'>
                  <Upload className='h-6 w-6 text-white' />
                </div>
                Documentación del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <Label className='mb-3 block font-medium text-gray-700 dark:text-gray-300'>
                  Subir Documentos (Licencias, Permisos, Planos, etc.)
                </Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='relative'
                >
                  <label className='group flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 transition-all duration-300 hover:bg-purple-100/50 dark:border-purple-600 dark:bg-purple-950/20 dark:hover:bg-purple-900/30'>
                    <div className='flex flex-col items-center justify-center pb-6 pt-5'>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className='mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-3 transition-shadow group-hover:shadow-lg'
                      >
                        <Upload className='h-8 w-8 text-white' />
                      </motion.div>
                      <p className='mb-2 text-lg text-gray-700 dark:text-gray-300'>
                        <span className='font-semibold'>Click para subir</span>{' '}
                        o arrastra archivos aquí
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        PDF, DOC, JPG, PNG (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type='file'
                      className='hidden'
                      multiple
                      accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                      onChange={manejarDocumentos}
                    />
                  </label>
                </motion.div>

                {documentos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='mt-6 space-y-3'
                  >
                    <Label className='font-medium text-gray-700 dark:text-gray-300'>
                      Archivos seleccionados ({documentos.length}):
                    </Label>
                    {documentos.map((doc, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className='flex items-center justify-between rounded-xl border border-purple-200 bg-white p-4 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-900 dark:hover:bg-purple-950/20'
                      >
                        <div className='flex items-center'>
                          <FileText className='mr-3 h-5 w-5 text-purple-500' />
                          <span className='truncate text-gray-700 dark:text-gray-300'>
                            {doc.name}
                          </span>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => eliminarDocumento(index)}
                          className='text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          variants={itemVariants}
          className='flex justify-end space-x-4 pt-6'
        >
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
            size='lg'
            className='px-8 py-3 text-lg'
          >
            Cancelar
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            size='lg'
            className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className='mr-2'
              >
                <Sparkles className='h-5 w-5' />
              </motion.div>
            ) : (
              <Building className='mr-2 h-5 w-5' />
            )}
            {isLoading ? 'Creando Proyecto...' : 'Crear Proyecto'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
