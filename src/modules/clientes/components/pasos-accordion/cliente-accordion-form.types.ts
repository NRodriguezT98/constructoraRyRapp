import type { FieldValues } from 'react-hook-form'

export interface ClienteAccordionFormValues extends FieldValues {
  nombres: string
  apellidos: string
  tipo_documento: string
  numero_documento: string
  fecha_nacimiento?: string
  estado_civil?: string
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  departamento: string
  ciudad: string
  proyecto_interes_id?: string
  vivienda_interes_id?: string
  notas_interes?: string
  notas?: string
}
