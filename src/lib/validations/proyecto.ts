import { z } from 'zod'

export const manzanaSchema = z.object({
    letra: z.string()
        .min(1, 'La letra de la manzana es requerida')
        .max(2, 'La letra no puede tener más de 2 caracteres')
        .regex(/^[A-Z]+$/, 'Solo se permiten letras mayúsculas'),
    numeroViviendas: z.number()
        .min(1, 'Debe haber al menos 1 vivienda')
        .max(100, 'No puede haber más de 100 viviendas por manzana')
})

export const proyectoSchema = z.object({
    nombre: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string()
        .min(10, 'La descripción debe tener al menos 10 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
    ubicacion: z.string()
        .min(5, 'La ubicación debe tener al menos 5 caracteres')
        .max(200, 'La ubicación no puede exceder 200 caracteres'),
    manzanas: z.array(manzanaSchema)
        .min(1, 'Debe haber al menos 1 manzana')
        .max(26, 'No puede haber más de 26 manzanas')
        .refine((manzanas) => {
            const letras = manzanas.map(m => m.letra)
            return new Set(letras).size === letras.length
        }, {
            message: 'No puede haber manzanas con la misma letra'
        })
})

export type ProyectoFormData = z.infer<typeof proyectoSchema>