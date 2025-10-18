/**
 * Tipos TypeScript para el módulo de Intereses de Clientes
 */

export type EstadoInteres =
  | 'Pendiente'        // Acaba de expresar interés
  | 'Contactado'       // Ya se contactó al cliente
  | 'En Seguimiento'   // En proceso de seguimiento
  | 'Negociación'      // Se convirtió en negociación formal
  | 'Descartado'       // Cliente ya no está interesado
  | 'Perdido'          // No se logró contactar o perdió interés

export type OrigenInteres =
  | 'Visita Presencial'
  | 'Llamada Telefónica'
  | 'WhatsApp'
  | 'Email'
  | 'Redes Sociales'
  | 'Referido'
  | 'Sitio Web'
  | 'Otro'

export type PrioridadInteres = 'Alta' | 'Media' | 'Baja'

export interface Interes {
  id: string
  cliente_id: string
  vivienda_id: string
  proyecto_id: string
  estado: EstadoInteres
  valor_estimado?: number
  notas?: string
  origen?: OrigenInteres
  prioridad: PrioridadInteres
  fecha_ultimo_contacto?: string
  proximo_seguimiento?: string
  negociacion_id?: string
  fecha_conversion?: string
  fecha_creacion: string
  fecha_actualizacion: string
  creado_por?: string
  actualizado_por?: string
}

export interface InteresCompleto extends Interes {
  // Datos del cliente
  cliente_nombre: string
  cliente_apellido: string
  cliente_email?: string
  cliente_telefono?: string

  // Datos de la vivienda
  vivienda_numero: string
  vivienda_valor: number
  vivienda_estado: string

  // Datos de la manzana
  manzana_nombre: string

  // Datos del proyecto
  proyecto_nombre: string

  // Calculados
  dias_desde_interes: number
  seguimiento_urgente: boolean
}

export interface CrearInteresDTO {
  clienteId: string
  viviendaId: string
  proyectoId: string
  valorEstimado?: number
  notas?: string
  origen?: OrigenInteres
  prioridad?: PrioridadInteres
  proximoSeguimiento?: Date | string
}

export interface ActualizarInteresDTO {
  estado?: EstadoInteres
  valorEstimado?: number
  notas?: string
  origen?: OrigenInteres
  prioridad?: PrioridadInteres
  fechaUltimoContacto?: Date | string
  proximoSeguimiento?: Date | string
}

export interface ConvertirANegociacionDTO {
  interesId: string
  valorNegociado: number
  descuentoAplicado?: number
  notasAdicionales?: string
}

export interface FiltrosIntereses {
  estado?: EstadoInteres | EstadoInteres[]
  proyectoId?: string
  prioridad?: PrioridadInteres
  origen?: OrigenInteres
  seguimientoUrgente?: boolean
  fechaDesde?: string
  fechaHasta?: string
}
