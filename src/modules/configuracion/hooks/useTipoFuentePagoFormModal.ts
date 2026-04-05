/**
 * Hook: useTipoFuentePagoFormModal
 *
 * TODA LA LÓGICA del modal de formulario de Tipos de Fuentes de Pago.
 * Maneja: validación, estado, mutaciones.
 *
 * Responsabilidad: LÓGICA DE NEGOCIO (NO UI)
 */

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { TipoFuentePago } from '../types'
import { TIPO_FUENTE_PAGO_LIMITS } from '../types'

import {
  useActualizarTipoFuentePago,
  useCrearTipoFuentePago,
} from './useTiposFuentesPago'

// =====================================================
// VALIDATION SCHEMA
// =====================================================

const tipoFuentePagoSchema = z.object({
  nombre: z
    .string()
    .min(
      TIPO_FUENTE_PAGO_LIMITS.NOMBRE_MIN,
      `Mínimo ${TIPO_FUENTE_PAGO_LIMITS.NOMBRE_MIN} caracteres`
    )
    .max(
      TIPO_FUENTE_PAGO_LIMITS.NOMBRE_MAX,
      `Máximo ${TIPO_FUENTE_PAGO_LIMITS.NOMBRE_MAX} caracteres`
    )
    .trim(),
  codigo: z
    .string()
    .min(
      TIPO_FUENTE_PAGO_LIMITS.CODIGO_MIN,
      `Mínimo ${TIPO_FUENTE_PAGO_LIMITS.CODIGO_MIN} caracteres`
    )
    .max(
      TIPO_FUENTE_PAGO_LIMITS.CODIGO_MAX,
      `Máximo ${TIPO_FUENTE_PAGO_LIMITS.CODIGO_MAX} caracteres`
    )
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guiones bajos')
    .trim(),
  descripcion: z
    .string()
    .max(
      TIPO_FUENTE_PAGO_LIMITS.DESCRIPCION_MAX,
      `Máximo ${TIPO_FUENTE_PAGO_LIMITS.DESCRIPCION_MAX} caracteres`
    )
    .transform(val => val || ''), // ✅ Transforma vacío a ''
  requiere_entidad: z.boolean(),
  permite_multiples_abonos: z.boolean(),
  es_subsidio: z.boolean(),
  color: z.enum([
    'blue',
    'green',
    'purple',
    'orange',
    'red',
    'cyan',
    'pink',
    'indigo',
    'yellow',
    'emerald',
  ]),
  icono: z.enum([
    'Wallet',
    'Building2',
    'Home',
    'Shield',
    'CreditCard',
    'Landmark',
    'BadgeDollarSign',
    'DollarSign',
    'Banknote',
    'HandCoins',
  ]),
  orden: z
    .number()
    .int('Debe ser un número entero')
    .min(
      TIPO_FUENTE_PAGO_LIMITS.ORDEN_MIN,
      `Mínimo ${TIPO_FUENTE_PAGO_LIMITS.ORDEN_MIN}`
    )
    .max(
      TIPO_FUENTE_PAGO_LIMITS.ORDEN_MAX,
      `Máximo ${TIPO_FUENTE_PAGO_LIMITS.ORDEN_MAX}`
    ),
  activo: z.boolean(),
})

// ✅ Tipo inferido del schema (tipo OUTPUT después de transformaciones)
type TipoFuentePagoFormDataSchema = z.output<typeof tipoFuentePagoSchema>

// =====================================================
// HOOK INTERFACE
// =====================================================

interface UseTipoFuentePagoFormModalProps {
  isOpen: boolean
  onClose: () => void
  tipoFuente?: TipoFuentePago | null
  onSuccess?: () => void
}

// =====================================================
// HOOK
// =====================================================

export function useTipoFuentePagoFormModal({
  isOpen,
  onClose,
  tipoFuente,
  onSuccess,
}: UseTipoFuentePagoFormModalProps) {
  const isEditing = !!tipoFuente

  // React Hook Form
  const form = useForm<TipoFuentePagoFormDataSchema>({
    resolver: zodResolver(tipoFuentePagoSchema),
    defaultValues: tipoFuente
      ? {
          nombre: tipoFuente.nombre,
          codigo: tipoFuente.codigo,
          descripcion: tipoFuente.descripcion || '',
          requiere_entidad: tipoFuente.requiere_entidad,
          permite_multiples_abonos: tipoFuente.permite_multiples_abonos,
          es_subsidio: tipoFuente.es_subsidio,
          color: tipoFuente.color,
          icono: tipoFuente.icono,
          orden: tipoFuente.orden,
          activo: tipoFuente.activo,
        }
      : {
          nombre: '',
          codigo: '',
          descripcion: '',
          requiere_entidad: false,
          permite_multiples_abonos: false,
          es_subsidio: false,
          color: 'blue',
          icono: 'Wallet',
          orden: 1,
          activo: true,
        },
  })

  // React Query Mutations
  const { mutate: crear, isPending: isCreating } = useCrearTipoFuentePago({
    onSuccess: () => {
      onSuccess?.()
      onClose()
      form.reset()
    },
  })

  const { mutate: actualizar, isPending: isUpdating } =
    useActualizarTipoFuentePago({
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
    })

  const isPending = isCreating || isUpdating

  // Reset form al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      form.reset(
        tipoFuente
          ? {
              nombre: tipoFuente.nombre,
              codigo: tipoFuente.codigo,
              descripcion: tipoFuente.descripcion || '',
              requiere_entidad: tipoFuente.requiere_entidad,
              permite_multiples_abonos: tipoFuente.permite_multiples_abonos,
              es_subsidio: tipoFuente.es_subsidio,
              color: tipoFuente.color,
              icono: tipoFuente.icono,
              orden: tipoFuente.orden,
              activo: tipoFuente.activo,
            }
          : undefined
      )
    }
  }, [isOpen, tipoFuente, form])

  // Submit handler
  const onSubmit = (data: TipoFuentePagoFormDataSchema) => {
    if (isEditing) {
      actualizar(
        {
          id: tipoFuente.id,
          dto: {
            nombre: data.nombre,
            codigo: data.codigo,
            descripcion: data.descripcion || null,
            requiere_entidad: data.requiere_entidad,
            permite_multiples_abonos: data.permite_multiples_abonos,
            es_subsidio: data.es_subsidio,
            color: data.color,
            icono: data.icono,
            orden: data.orden,
            activo: data.activo,
          },
        },
        {
          onSuccess: () => {
            onSuccess?.()
            onClose()
          },
        }
      )
    } else {
      crear(
        {
          nombre: data.nombre,
          codigo: data.codigo,
          descripcion: data.descripcion || undefined,
          requiere_entidad: data.requiere_entidad,
          permite_multiples_abonos: data.permite_multiples_abonos,
          es_subsidio: data.es_subsidio,
          color: data.color,
          icono: data.icono,
          orden: data.orden,
          activo: data.activo,
        },
        {
          onSuccess: () => {
            onSuccess?.()
            onClose()
            form.reset()
          },
        }
      )
    }
  }

  return {
    // Estado
    isEditing,
    isPending,

    // Form
    form,
    register: form.register,
    handleSubmit: form.handleSubmit,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    watch: form.watch,

    // Handlers
    onSubmit,
  }
}
