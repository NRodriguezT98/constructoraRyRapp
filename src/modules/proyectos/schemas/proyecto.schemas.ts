/**
 * Schemas de validación Zod para el módulo de Proyectos
 * Extraído de useProyectosForm.ts para separar responsabilidades
 */

import { z } from 'zod'

import {
  getDepartamentos,
  validarCiudadDepartamento,
} from '@/shared/data/colombia-locations'

export const manzanaSchema = z.object({
  id: z.string().optional(),
  nombre: z
    .string()
    .min(1, 'El nombre de la manzana es obligatorio')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÃ'0-9\s\-_().]+$/,
      'Solo se permiten letras, números, espacios, guiones, paréntesis y puntos'
    ),
  totalViviendas: z
    .number({
      message: 'La cantidad de viviendas es obligatoria',
    })
    .min(1, 'Mínimo 1 vivienda')
    .max(100, 'Máximo 100 viviendas')
    .int('Debe ser un número entero'),
  cantidadViviendasCreadas: z.number().optional(),
  esEditable: z.boolean().optional(),
  motivoBloqueado: z.string().optional(),
})

export const proyectoSchema = z
  .object({
    id: z.string().optional(),
    responsable: z.string().optional(),
    nombre: z
      .string()
      .min(3, 'El nombre del proyecto debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÃ'0-9\s\-_().]+$/,
        'Solo se permiten letras (con acentos), números, espacios, guiones, paréntesis y puntos'
      ),
    descripcion: z
      .string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(1000, 'La descripción no puede exceder 1000 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÃ'0-9\s\-_.,;:()\n¿?¡!'"Â°%$]+$/,
        'Caracteres no permitidos en la descripción. Use solo letras, números y puntuación básica'
      ),
    departamento: z
      .string()
      .min(1, 'Selecciona un departamento')
      .refine(val => !val || getDepartamentos().includes(val), {
        message: 'El departamento seleccionado no es válido',
      }),
    ciudad: z.string().min(1, 'Selecciona una ciudad o municipio'),
    direccion: z
      .string()
      .min(5, 'La dirección debe tener al menos 5 caracteres')
      .max(200, 'La dirección no puede exceder 200 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÃ'0-9\s\-,#.Â°]+$/,
        'Solo se permiten letras, números, espacios, comas, guiones, # y puntos'
      ),
    estado: z.enum(
      [
        'en_planificacion',
        'en_proceso',
        'en_construccion',
        'completado',
        'pausado',
      ],
      { message: 'Selecciona un estado para el proyecto' }
    ),
    fechaInicio: z.string().optional(),
    fechaFinEstimada: z.string().optional(),
    manzanas: z
      .array(manzanaSchema)
      .min(1, 'Debe agregar al menos una manzana')
      .max(20, 'Máximo 20 manzanas por proyecto'),
  })
  .refine(
    data => {
      if (
        data.fechaInicio &&
        data.fechaFinEstimada &&
        data.fechaInicio.trim() !== '' &&
        data.fechaFinEstimada.trim() !== ''
      ) {
        return new Date(data.fechaFinEstimada) > new Date(data.fechaInicio)
      }
      return true
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['fechaFinEstimada'],
    }
  )
  .refine(
    data => {
      const ahora = new Date()
      const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : null
      const fechaFin = data.fechaFinEstimada
        ? new Date(data.fechaFinEstimada)
        : null

      if (data.estado === 'completado' && fechaFin && fechaFin > ahora) {
        return false
      }
      if (
        (data.estado === 'en_proceso' || data.estado === 'en_construccion') &&
        fechaInicio &&
        fechaInicio > ahora
      ) {
        return false
      }
      return true
    },
    {
      message: 'Las fechas no son coherentes con el estado del proyecto',
      path: ['estado'],
    }
  )
  .refine(
    data => {
      if (!data.departamento || !data.ciudad) return true
      return validarCiudadDepartamento(data.ciudad, data.departamento)
    },
    {
      message: 'La ciudad seleccionada no corresponde al departamento elegido',
      path: ['ciudad'],
    }
  )

export type ProyectoFormSchema = z.infer<typeof proyectoSchema>
