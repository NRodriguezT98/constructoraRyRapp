/**
 * Tipos TypeScript para el Módulo de Clientes y Negociaciones
 * Sistema desacoplado: Cliente → Negociación → Vivienda
 */

// =====================================================
// ENUMS
// =====================================================

export type TipoDocumento = 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP'

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: clientes_estado_check (5 estados)
 */
export type EstadoCliente =
  | 'Interesado'
  | 'Activo'
  | 'En Proceso de Renuncia' // ⭐ NUEVO (2025-10-22)
  | 'Inactivo'
  | 'Propietario' // ⭐ NUEVO (2025-10-22)

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

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: negociaciones_estado_check (4 estados)
 *
 * CAMBIOS (2025-10-22):
 * ❌ ELIMINADOS: 'En Proceso', 'Cierre Financiero', 'Cancelada', 'Renuncia'
 * ✅ NUEVOS: 'Suspendida', 'Cerrada por Renuncia'
 */
export type EstadoNegociacion =
  | 'Activa'
  | 'Suspendida' // ⭐ NUEVO
  | 'Cerrada por Renuncia' // ⭐ NUEVO (reemplaza 'Renuncia')
  | 'Completada'

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
  documento_identidad_titulo?: string | null // Título personalizado para mostrar

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
  fecha_completada?: string // ⭐ NUEVO: Requerida cuando estado='Completada'

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

  // Campos nuevos (agregados 2025-10-18)
  origen?: string // 'WhatsApp', 'Email', 'Visita Presencial', etc.
  prioridad?: string // 'Alta', 'Media', 'Baja'
  valor_estimado?: number
  fecha_ultimo_contacto?: string
  proximo_seguimiento?: string
  negociacion_id?: string
  fecha_conversion?: string

  // Relaciones opcionales (cuando se cargan desde vista)
  proyecto_nombre?: string
  proyecto_estado?: string // Corregido: la vista tiene proyecto_estado, no proyecto_ubicacion
  vivienda_numero?: string
  vivienda_valor?: number // Corregido: la vista tiene vivienda_valor, no vivienda_precio
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
// RENUNCIAS (Migración 004 - 2025-10-22)
// =====================================================

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: renuncias_estado_check (3 estados)
 */
export type EstadoRenuncia =
  | 'Pendiente Devolución'
  | 'Cerrada'
  | 'Cancelada'

export interface Renuncia {
  id: string

  // Relaciones (IDs duplicados para histórico)
  vivienda_id: string
  cliente_id: string
  negociacion_id: string

  // Información básica
  motivo: string
  fecha_renuncia: string
  estado: EstadoRenuncia

  // Información financiera (calculada automáticamente)
  monto_a_devolver: number // NOT NULL, calculado por trigger
  requiere_devolucion: boolean

  // Snapshot de datos al momento de la renuncia (JSON)
  vivienda_datos_snapshot?: Record<string, any> // { numero, manzana, proyecto, valor }
  cliente_datos_snapshot?: Record<string, any> // { nombre, documento, contacto }
  negociacion_datos_snapshot?: Record<string, any> // { valor_total, pagos_realizados }
  abonos_snapshot?: Record<string, any> // Lista de abonos realizados

  // Seguimiento de resolución
  fecha_devolucion?: string // Cuando se hizo la devolución efectiva
  metodo_devolucion?: string // 'Transferencia', 'Cheque', 'Efectivo'
  referencia_devolucion?: string // Número de transacción/cheque
  comprobante_devolucion_url?: string // Documento de respaldo

  // Cancelación de renuncia
  fecha_cancelacion?: string
  motivo_cancelacion?: string // Requerido cuando estado='Cancelada'
  usuario_cancelacion?: string

  // Cierre administrativo
  fecha_cierre?: string
  usuario_cierre?: string
  notas_cierre?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro?: string

  // Relaciones opcionales (cuando se cargan)
  clientes?: Cliente
  viviendas?: {
    id: string
    numero: string
    manzanas?: {
      nombre: string
      proyectos?: {
        nombre: string
      }
    }
  }
  negociaciones?: Negociacion
}

export const ESTADOS_RENUNCIA: Record<EstadoRenuncia, string> = {
  'Pendiente Devolución': 'Pendiente Devolución',
  Cerrada: 'Cerrada',
  Cancelada: 'Cancelada',
}

export const METODOS_DEVOLUCION = [
  'Transferencia Bancaria',
  'Cheque',
  'Efectivo',
  'Consignación',
] as const

export type MetodoDevolucion = (typeof METODOS_DEVOLUCION)[number]

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
  documento_identidad_titulo?: string | null // Título personalizado

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
  documento_identidad_titulo?: string | null // Permitir actualizar título
}

export interface CrearInteresDTO {
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  valor_estimado?: number
  notas?: string
  origen?: string
  prioridad?: string
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

// DTOs para Renuncias
export interface CrearRenunciaDTO {
  negociacion_id: string
  motivo: string
  notas_cierre?: string
}

export interface ProcesarDevolucionDTO {
  fecha_devolucion: string
  metodo_devolucion: MetodoDevolucion
  referencia_devolucion?: string
  comprobante_devolucion_url?: string
}

export interface CancelarRenunciaDTO {
  motivo_cancelacion: string
}

export interface CerrarRenunciaDTO {
  notas_cierre?: string
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
  'En Proceso de Renuncia': 'En Proceso de Renuncia', // ⭐ NUEVO
  Inactivo: 'Inactivo',
  Propietario: 'Propietario', // ⭐ NUEVO
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
  Activa: 'Activa',
  Suspendida: 'Suspendida', // ⭐ NUEVO
  'Cerrada por Renuncia': 'Cerrada por Renuncia', // ⭐ NUEVO
  Completada: 'Completada',
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
