/**
 * Tipos TypeScript para el Módulo de Clientes y Negociaciones
 * Sistema desacoplado: Cliente → Negociación → Vivienda
 */

// =====================================================
// ENUMS
// =====================================================

export type TipoDocumento = 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP'

export type EstadoCliente = 'Interesado' | 'Activo' | 'Inactivo'

export type OrigenCliente =
  | 'Referido'
  | 'Página Web'
  | 'Redes Sociales'
  | 'Llamada Directa'
  | 'Visita Oficina'
  | 'Feria/Evento'
  | 'Publicidad'
  | 'Otro'

export type EstadoInteres = 'Activo' | 'Descartado' | 'Convertido'

export type EstadoNegociacion =
  | 'En Proceso'
  | 'Cierre Financiero'
  | 'Activa'
  | 'Completada'
  | 'Cancelada'
  | 'Renuncia'

export type TipoFuentePago =
  | 'Cuota Inicial'
  | 'Crédito Hipotecario'
  | 'Subsidio Mi Casa Ya'
  | 'Subsidio Caja Compensación'

export type EstadoFuentePago = 'Pendiente' | 'En Proceso' | 'Completada'

export type EstadoProceso = 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'

// =====================================================
// INTERFACES PRINCIPALES
// =====================================================

export interface Cliente {
  id: string

  // Información Personal
  nombres: string
  apellidos: string
  nombre_completo: string
  tipo_documento: TipoDocumento
  numero_documento: string
  fecha_nacimiento?: string // ISO date string

  // Contacto
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  ciudad?: string
  departamento?: string

  // Estado
  estado: EstadoCliente
  origen?: OrigenCliente
  referido_por?: string

  // Documentos
  documento_identidad_url?: string

  // Notas
  notas?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Relaciones opcionales (cuando se cargan)
  negociaciones?: Negociacion[]
  estadisticas?: ClienteEstadisticas
  intereses?: ClienteInteres[] // Intereses activos del cliente
}

export interface Negociacion {
  id: string

  // Relaciones
  cliente_id: string
  vivienda_id: string

  // Estado
  estado: EstadoNegociacion

  // Valores Financieros
  valor_negociado: number
  descuento_aplicado: number
  valor_total: number // calculado: valor_negociado - descuento_aplicado

  // Totales (calculados por triggers)
  total_fuentes_pago: number
  total_abonado: number
  saldo_pendiente: number
  porcentaje_pagado: number

  // Fechas
  fecha_negociacion: string
  fecha_cierre_financiero?: string
  fecha_activacion?: string
  fecha_completada?: string
  fecha_cancelacion?: string

  // Motivos
  motivo_cancelacion?: string

  // Documentos
  promesa_compraventa_url?: string
  promesa_firmada_url?: string
  evidencia_envio_correo_url?: string
  escritura_url?: string
  otros_documentos?: Record<string, string> // JSON flexible

  // Notas
  notas?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Relaciones opcionales (cuando se cargan)
  clientes?: Cliente
  viviendas?: {
    id: string
    numero: string
    tipo_vivienda?: string
    valor_total: number
    manzanas?: {
      nombre: string
      proyectos?: {
        nombre: string
      }
    }
  }
  fuentes_pago?: FuentePago[]
  procesos?: ProcesoNegociacion[]
}

export interface FuentePago {
  id: string

  // Relación
  negociacion_id: string

  // Tipo
  tipo: TipoFuentePago

  // Montos
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number // calculado
  porcentaje_completado: number // calculado

  // Detalles específicos
  entidad?: string // Banco o Caja de Compensación
  numero_referencia?: string // Radicado/Referencia

  // Comportamiento
  permite_multiples_abonos: boolean

  // Documentos
  carta_aprobacion_url?: string
  carta_asignacion_url?: string

  // Estado
  estado: EstadoFuentePago
  fecha_completado?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface ProcesoNegociacion {
  id: string

  // Relación
  negociacion_id: string

  // Información
  nombre: string
  descripcion?: string
  orden: number

  // Configuración
  es_obligatorio: boolean
  permite_omitir: boolean

  // Estado
  estado: EstadoProceso

  // Dependencias
  depende_de?: string[] // Array de IDs de procesos previos

  // Documentos
  documentos_requeridos?: string[] // ['promesa_pendiente', 'evidencia_correo']
  documentos_urls?: Record<string, string> // { "promesa_pendiente": "url..." }

  // Fechas
  fecha_inicio?: string
  fecha_completado?: string
  fecha_limite?: string

  // Notas
  notas?: string
  motivo_omision?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_completo?: string
}

export interface PlantillaProceso {
  id: string

  nombre: string
  descripcion?: string

  // Pasos del proceso (JSON)
  pasos: PasoPlantilla[]

  // Estado
  activo: boolean
  es_predeterminado: boolean

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string
}

export interface PasoPlantilla {
  orden: number
  nombre: string
  descripcion?: string
  obligatorio: boolean
  documentos?: string[]
  dependeDe?: number[] // Órdenes de pasos previos requeridos
}

// =====================================================
// CLIENTE INTERESES
// =====================================================

export interface ClienteInteres {
  id: string
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  notas?: string
  estado: EstadoInteres
  motivo_descarte?: string
  fecha_interes: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Relaciones opcionales (cuando se cargan desde vista)
  proyecto_nombre?: string
  proyecto_ubicacion?: string
  vivienda_numero?: string
  vivienda_precio?: number
  vivienda_estado?: string
  manzana_nombre?: string
}

// =====================================================
// ESTADÍSTICAS Y RESÚMENES
// =====================================================

export interface ClienteEstadisticas {
  total_negociaciones: number
  negociaciones_activas: number
  negociaciones_completadas: number
  ultima_negociacion?: string
}

export interface ClienteResumen extends Cliente {
  estadisticas: ClienteEstadisticas
}

export interface NegociacionCompleta extends Negociacion {
  cliente_nombre: string
  cliente_documento: string
  cliente_telefono?: string
  cliente_email?: string
  vivienda_numero: string
  manzana_nombre: string
  proyecto_nombre: string
}

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CrearClienteDTO {
  // Información Personal
  nombres: string
  apellidos: string
  tipo_documento: TipoDocumento
  numero_documento: string
  fecha_nacimiento?: string

  // Contacto
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  ciudad?: string
  departamento?: string

  // Estado
  origen?: OrigenCliente
  referido_por?: string

  // Documentos
  documento_identidad_url?: string

  // Notas
  notas?: string

  // Interés inicial (opcional, para clientes Interesados)
  interes_inicial?: {
    proyecto_id: string
    vivienda_id?: string
    notas_interes?: string
  }
}

export interface ActualizarClienteDTO extends Partial<CrearClienteDTO> {
  estado?: EstadoCliente
}

export interface CrearInteresDTO {
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  notas?: string
}

export interface ActualizarInteresDTO {
  estado?: EstadoInteres
  motivo_descarte?: string
  notas?: string
}

export interface CrearNegociacionDTO {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado?: number
  notas?: string

  // Fuentes de pago (se crean junto con la negociación)
  fuentes_pago: CrearFuentePagoDTO[]

  // Documentos iniciales
  promesa_compraventa_url?: string
  evidencia_envio_correo_url?: string
}

export interface CrearFuentePagoDTO {
  tipo: TipoFuentePago
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  permite_multiples_abonos: boolean
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

export interface ActualizarNegociacionDTO {
  estado?: EstadoNegociacion
  valor_negociado?: number
  descuento_aplicado?: number
  motivo_cancelacion?: string
  promesa_compraventa_url?: string
  promesa_firmada_url?: string
  evidencia_envio_correo_url?: string
  escritura_url?: string
  notas?: string
}

export interface CompletarProcesoDTO {
  documentos_urls?: Record<string, string>
  notas?: string
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================

export interface FiltrosClientes {
  estado?: EstadoCliente[]
  origen?: OrigenCliente[]
  busqueda?: string // Búsqueda por nombre, documento, teléfono, email
  fecha_desde?: string
  fecha_hasta?: string
}

export interface FiltrosNegociaciones {
  estado?: EstadoNegociacion[]
  cliente_id?: string
  vivienda_id?: string
  proyecto_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  porcentaje_pagado_min?: number
  porcentaje_pagado_max?: number
}

// =====================================================
// CONSTANTES
// =====================================================

export const TIPOS_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  TI: 'Tarjeta de Identidad',
  NIT: 'NIT',
  PP: 'Pasaporte',
  PEP: 'Permiso Especial de Permanencia',
}

export const ESTADOS_CLIENTE: Record<EstadoCliente, string> = {
  Interesado: 'Interesado',
  Activo: 'Activo',
  Inactivo: 'Inactivo',
}

export const ESTADOS_INTERES: Record<EstadoInteres, string> = {
  Activo: 'Interés Vigente',
  Descartado: 'Ya no interesa',
  Convertido: 'Venta Concretada',
}

export const ORIGENES_CLIENTE: Record<OrigenCliente, string> = {
  Referido: 'Referido',
  'Página Web': 'Página Web',
  'Redes Sociales': 'Redes Sociales',
  'Llamada Directa': 'Llamada Directa',
  'Visita Oficina': 'Visita Oficina',
  'Feria/Evento': 'Feria/Evento',
  Publicidad: 'Publicidad',
  Otro: 'Otro',
}

export const ESTADOS_NEGOCIACION: Record<EstadoNegociacion, string> = {
  'En Proceso': 'En Proceso',
  'Cierre Financiero': 'Cierre Financiero',
  Activa: 'Activa',
  Completada: 'Completada',
  Cancelada: 'Cancelada',
  Renuncia: 'Renuncia',
}

export const TIPOS_FUENTE_PAGO: Record<TipoFuentePago, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

// Bancos disponibles para Crédito Hipotecario
export const BANCOS_CREDITO_HIPOTECARIO = [
  'Bancolombia',
  'Banco de Bogotá',
  'Banco Agrario',
  'Fondo Nacional del Ahorro',
  'Banco BBVA',
  'Banco Caja Social',
  'Banco Popular',
  'Davivienda',
  'Banco de Occidente',
] as const

// Cajas de Compensación disponibles
export const CAJAS_COMPENSACION = ['Comfenalco', 'Comfandi'] as const

export type BancoCredito = (typeof BANCOS_CREDITO_HIPOTECARIO)[number]
export type CajaCompensacion = (typeof CAJAS_COMPENSACION)[number]
