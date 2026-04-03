/**
 * Hook: useEntidadFinancieraFormModal
 *
 * Hook personalizado para la lógica de negocio del formulario de entidades financieras.
 * Separa toda la lógica del componente presentacional.
 *
 * Responsabilidades:
 * - Configuración de React Hook Form
 * - Validación con Zod
 * - Estado de fuentes seleccionadas
 * - Carga de datos al editar
 * - Submit (crear/actualizar)
 * - Mutaciones con React Query
 */

'use client'

import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { type Resolver, useForm } from 'react-hook-form'
import { z } from 'zod'

import { logger } from '@/lib/utils/logger'

import type {
  EntidadColor,
  EntidadFinanciera,
  TipoEntidadFinanciera,
} from '../types/entidades-financieras.types'
import { ENTIDAD_FINANCIERA_LIMITS } from '../types/entidades-financieras.types'

import {
  useActualizarEntidadFinanciera,
  useCrearEntidadFinanciera,
} from './useEntidadesFinancieras'
import { useTiposFuentesPago } from './useTiposFuentesPago'

// =====================================================
// VALIDATION SCHEMA
// =====================================================

const entidadFinancieraSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(
      ENTIDAD_FINANCIERA_LIMITS.nombre.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.nombre.max} caracteres`
    ),
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(
      ENTIDAD_FINANCIERA_LIMITS.codigo.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.codigo.max} caracteres`
    )
    .regex(
      /^[a-z0-9_-]+$/,
      'Solo minúsculas, números, guiones y guiones bajos'
    ),
  tipo: z.enum([
    'Banco',
    'Caja de Compensación',
    'Cooperativa',
    'Otro',
  ] as const),
  tipos_fuentes_aplicables: z.array(z.string()).default([]),
  nit: z
    .string()
    .max(
      ENTIDAD_FINANCIERA_LIMITS.nit.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.nit.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  razon_social: z
    .string()
    .max(
      ENTIDAD_FINANCIERA_LIMITS.razon_social.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.razon_social.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .max(
      ENTIDAD_FINANCIERA_LIMITS.telefono.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.telefono.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  email_contacto: z
    .string()
    .email('Email inválido')
    .max(
      ENTIDAD_FINANCIERA_LIMITS.email_contacto.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.email_contacto.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  sitio_web: z
    .string()
    .url('URL inválida')
    .max(
      ENTIDAD_FINANCIERA_LIMITS.sitio_web.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.sitio_web.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  codigo_superintendencia: z
    .string()
    .max(
      ENTIDAD_FINANCIERA_LIMITS.codigo_superintendencia.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.codigo_superintendencia.max} caracteres`
    )
    .optional()
    .or(z.literal('')),
  notas: z.string().optional().or(z.literal('')),
  color: z.enum([
    'blue',
    'green',
    'orange',
    'purple',
    'red',
    'yellow',
    'cyan',
    'pink',
    'indigo',
    'gray',
    'emerald',
    'teal',
    'amber',
    'sky',
    'violet',
    'slate',
    'lime',
    'rose',
  ] as const),
  orden: z
    .number()
    .min(
      ENTIDAD_FINANCIERA_LIMITS.orden.min,
      `Mínimo ${ENTIDAD_FINANCIERA_LIMITS.orden.min}`
    )
    .max(
      ENTIDAD_FINANCIERA_LIMITS.orden.max,
      `Máximo ${ENTIDAD_FINANCIERA_LIMITS.orden.max}`
    ),
  activo: z.boolean(),
})

type FormData = z.infer<typeof entidadFinancieraSchema> & {
  tipos_fuentes_aplicables: string[]
}

// =====================================================
// HOOK
// =====================================================

interface UseEntidadFinancieraFormModalParams {
  entidad?: EntidadFinanciera | null
  onClose: () => void
}

export function useEntidadFinancieraFormModal({
  entidad,
  onClose,
}: UseEntidadFinancieraFormModalParams) {
  const isEdit = !!entidad

  // Mutaciones React Query
  const crearMutation = useCrearEntidadFinanciera()
  const actualizarMutation = useActualizarEntidadFinanciera()

  // Cargar tipos de fuentes que requieren entidad
  const { data: fuentesDisponibles = [], isLoading: loadingFuentes } =
    useTiposFuentesPago(
      { requiere_entidad: true, activo: true },
      'orden',
      'asc'
    )

  // Estado para fuentes seleccionadas
  const [fuentesSeleccionadas, setFuentesSeleccionadas] = useState<string[]>([])

  // React Hook Form
  const form = useForm<FormData>({
    resolver: zodResolver(
      entidadFinancieraSchema
    ) as unknown as Resolver<FormData>,
    defaultValues: {
      nombre: '',
      codigo: '',
      tipo: 'Banco',
      tipos_fuentes_aplicables: [],
      nit: '',
      razon_social: '',
      telefono: '',
      email_contacto: '',
      sitio_web: '',
      direccion: '',
      codigo_superintendencia: '',
      notas: '',
      color: 'blue',
      orden: 1,
      activo: true,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form

  // Watch color para preview
  const selectedColor = watch('color')

  // Cargar datos al editar
  useEffect(() => {
    if (isEdit && entidad) {
      setFuentesSeleccionadas(entidad.tipos_fuentes_aplicables || [])
      reset({
        nombre: entidad.nombre,
        codigo: entidad.codigo,
        tipo: entidad.tipo as TipoEntidadFinanciera,
        tipos_fuentes_aplicables: entidad.tipos_fuentes_aplicables || [],
        nit: entidad.nit || '',
        razon_social: entidad.razon_social || '',
        telefono: entidad.telefono || '',
        email_contacto: entidad.email_contacto || '',
        sitio_web: entidad.sitio_web || '',
        direccion: entidad.direccion || '',
        codigo_superintendencia: entidad.codigo_superintendencia || '',
        notas: entidad.notas || '',
        color: entidad.color as EntidadColor,
        orden: entidad.orden,
        activo: entidad.activo,
      })
    } else {
      setFuentesSeleccionadas([])
      reset({
        nombre: '',
        codigo: '',
        tipo: 'Banco',
        tipos_fuentes_aplicables: [],
        nit: '',
        razon_social: '',
        telefono: '',
        email_contacto: '',
        sitio_web: '',
        direccion: '',
        codigo_superintendencia: '',
        notas: '',
        color: 'blue',
        orden: 1,
        activo: true,
      })
    }
  }, [isEdit, entidad, reset])

  // Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        tipos_fuentes_aplicables: fuentesSeleccionadas,
      }

      if (isEdit && entidad) {
        await actualizarMutation.mutateAsync({ id: entidad.id, dto: payload })
      } else {
        await crearMutation.mutateAsync(payload)
      }

      reset()
      setFuentesSeleccionadas([])
      onClose()
    } catch (error) {
      // Error handled by mutation
      logger.error('Error en submit:', error)
    }
  }

  // Close handler
  const handleClose = () => {
    reset()
    setFuentesSeleccionadas([])
    onClose()
  }

  // Toggle fuente seleccionada
  const toggleFuente = (fuenteId: string) => {
    setFuentesSeleccionadas(prev =>
      prev.includes(fuenteId)
        ? prev.filter(id => id !== fuenteId)
        : [...prev, fuenteId]
    )
  }

  // Loading state
  const isSubmitting = crearMutation.isPending || actualizarMutation.isPending

  return {
    // Form state
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    selectedColor,
    setValue,

    // Custom state
    fuentesSeleccionadas,
    fuentesDisponibles,
    loadingFuentes,

    // Handlers
    toggleFuente,
    handleClose,

    // Flags
    isEdit,
    isSubmitting,
  }
}
