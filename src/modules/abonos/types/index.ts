// =====================================================
// TIPOS: Módulo de Abonos
// =====================================================

/**
 * Métodos de pago disponibles
 */
export type MetodoPago =
  | 'Transferencia'
  | 'Efectivo'
  | 'Cheque'
  | 'Consignación'
  | 'PSE'
  | 'Tarjeta de Crédito'
  | 'Tarjeta de Débito';

/**
 * Tipos de fuentes de pago
 */
export type TipoFuentePago =
  | 'Cuota Inicial'
  | 'Crédito Hipotecario'
  | 'Subsidio Mi Casa Ya'
  | 'Subsidio Caja Compensación';

/**
 * Estados de negociación
 */
export type EstadoNegociacion =
  | 'En Proceso'
  | 'Cierre Financiero'
  | 'Activa'
  | 'Completada'
  | 'Cancelada'
  | 'Renuncia';

// =====================================================
// ENTIDADES DE BASE DE DATOS
// =====================================================

/**
 * Registro individual de un abono
 */
export interface AbonoHistorial {
  id: string;
  negociacion_id: string;
  fuente_pago_id: string;
  monto: number;
  fecha_abono: string;
  metodo_pago: MetodoPago;
  numero_referencia?: string;
  comprobante_url?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_registro?: string;
}

/**
 * Fuente de pago con información completa
 */
export interface FuentePago {
  id: string;
  negociacion_id: string;
  tipo: TipoFuentePago;
  monto_aprobado: number;
  monto_recibido: number;
  saldo_pendiente: number;
  porcentaje_completado: number;
  entidad?: string;
  numero_referencia?: string;
  fecha_aprobacion?: string;
  estado: string;
  permite_multiples_abonos: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/**
 * Negociación con información básica (campos REALES de la DB)
 */
export interface Negociacion {
  id: string;
  cliente_id: string;
  vivienda_id: string;
  estado: EstadoNegociacion;
  valor_negociado: number;
  descuento_aplicado?: number;
  valor_total?: number;              // Campo calculado
  total_fuentes_pago?: number;       // Campo calculado
  total_abonado?: number;            // Campo calculado
  saldo_pendiente?: number;          // Campo calculado
  porcentaje_pagado?: number;        // Campo calculado
  fecha_negociacion?: string;
  fecha_completada?: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/**
 * Cliente (info básica - campos REALES de la DB)
 */
export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;  // ✅ Campo REAL (no "cedula")
  telefono?: string;
  email?: string;
  ciudad?: string;
}

/**
 * Vivienda (info básica - campos REALES de la DB)
 */
export interface Vivienda {
  id: string;
  numero: string;
  manzana_id: string;        // ✅ Campo REAL (UUID, no "manzana")
  precio: number;            // ✅ Campo REAL (no "precio_base")
  area: number;              // ✅ Campo REAL
  tipo_vivienda?: string;    // ✅ Campo REAL (no "tipo")
}

/**
 * Proyecto (info básica)
 */
export interface Proyecto {
  id: string;
  nombre: string;
  ubicacion?: string;
}

/**
 * Manzana (info básica)
 */
export interface Manzana {
  id: string;
  nombre: string;
  proyecto_id: string;
}

// =====================================================
// TIPOS COMPUESTOS (para queries complejos)
// =====================================================

/**
 * Fuente de pago con historial de abonos
 */
export interface FuentePagoConAbonos extends FuentePago {
  abonos: AbonoHistorial[];
}

/**
 * Vivienda extendida con información de manzana
 */
export interface ViviendaConManzana extends Vivienda {
  manzana?: Manzana;
}

/**
 * Negociación con toda la información necesaria
 */
export interface NegociacionConAbonos extends Negociacion {
  cliente: Cliente;
  vivienda: ViviendaConManzana;
  proyecto: Proyecto;
  fuentes_pago: FuentePagoConAbonos[];
}

// =====================================================

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

/**
 * DTO para crear un nuevo abono
 */
export interface CrearAbonoDTO {
  negociacion_id: string;
  fuente_pago_id: string;
  monto: number;
  fecha_abono: string; // ISO string
  metodo_pago: MetodoPago;
  numero_referencia?: string;
  comprobante_url?: string;
  notas?: string;
}

/**
 * DTO para filtrar abonos
 */
export interface FiltrosAbonos {
  negociacion_id?: string;
  fuente_pago_id?: string;
  cliente_id?: string;
  proyecto_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  metodo_pago?: MetodoPago;
}

// =====================================================
// ESTADÍSTICAS Y RESÚMENES
// =====================================================

/**
 * Estadísticas de abonos
 */
export interface EstadisticasAbonos {
  total_abonos: number;
  monto_total_abonado: number;
  promedio_por_abono: number;
  abonos_por_metodo: Record<MetodoPago, number>;
  ultima_actualizacion: string;
}

/**
 * Resumen de una fuente de pago
 */
export interface ResumenFuentePago {
  fuente_pago_id: string;
  tipo: TipoFuentePago;
  monto_aprobado: number;
  monto_recibido: number;
  saldo_pendiente: number;
  porcentaje_completado: number;
  cantidad_abonos: number;
  ultimo_abono?: {
    fecha: string;
    monto: number;
    metodo: MetodoPago;
  };
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Opciones para métodos de pago (para selects)
 */
export const METODOS_PAGO_OPTIONS: { value: MetodoPago; label: string }[] = [
  { value: 'Transferencia', label: 'Transferencia Bancaria' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Consignación', label: 'Consignación' },
  { value: 'PSE', label: 'PSE' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
];

/**
 * Labels legibles para tipos de fuente
 */
export const TIPO_FUENTE_LABELS: Record<TipoFuentePago, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
};
