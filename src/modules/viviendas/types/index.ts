/**
 * Tipos TypeScript para modulo Viviendas
 */

export interface Viviendas {
  id: string
  nombre: string
  descripcion?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface ViviendasFormData {
  nombre: string
  descripcion?: string
}

export interface FiltroViviendas {
  busqueda?: string
}

export type VistaViviendas = "grid" | "lista"
