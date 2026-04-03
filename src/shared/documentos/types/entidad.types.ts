/**
 * ============================================
 * TIPOS: Entidades para Sistema Genérico
 * ============================================
 *
 * Define los tipos de entidades que pueden tener documentos
 * y las configuraciones para cada una
 */

export type TipoEntidad = 'proyecto' | 'vivienda' | 'cliente'

/** Tablas de documentos válidas en la BD */
export type TablaDocumento =
  | 'documentos_proyecto'
  | 'documentos_vivienda'
  | 'documentos_cliente'

import type { Database } from '@/lib/supabase/database.types'
import type { ModuleName } from '@/shared/config/module-themes'

/** Union of insert types for all document tables — used for dynamic inserts in generic services */
export type DocumentoInsertData =
  | Database['public']['Tables']['documentos_proyecto']['Insert']
  | Database['public']['Tables']['documentos_vivienda']['Insert']
  | Database['public']['Tables']['documentos_cliente']['Insert']

/**
 * Configuración de tabla y bucket por tipo de entidad
 */
export interface ConfiguracionEntidad {
  tabla: TablaDocumento
  campoEntidad: string // nombre del campo FK (ej: 'proyecto_id', 'vivienda_id')
  bucket: string
  moduleName: ModuleName
  nombreSingular: string // Para mensajes de UI (ej: 'proyecto', 'vivienda', 'cliente')
  fkSubidoPor: string // Nombre de FK constraint con usuarios (para joins sin ambigüedad)
}

/**
 * Mapeo de tipo de entidad a su configuración
 */
export const CONFIGURACION_ENTIDADES: Record<
  TipoEntidad,
  ConfiguracionEntidad
> = {
  proyecto: {
    tabla: 'documentos_proyecto',
    campoEntidad: 'proyecto_id',
    bucket: 'documentos-proyectos',
    moduleName: 'proyectos',
    nombreSingular: 'proyecto',
    fkSubidoPor: 'fk_documentos_proyecto_subido_por',
  },
  vivienda: {
    tabla: 'documentos_vivienda',
    campoEntidad: 'vivienda_id',
    bucket: 'documentos-viviendas',
    moduleName: 'viviendas',
    nombreSingular: 'vivienda',
    fkSubidoPor: 'fk_documentos_vivienda_subido_por',
  },
  cliente: {
    tabla: 'documentos_cliente',
    campoEntidad: 'cliente_id',
    bucket: 'documentos-clientes',
    moduleName: 'clientes',
    nombreSingular: 'cliente',
    fkSubidoPor: 'fk_documentos_cliente_subido_por',
  },
}

/**
 * Helper para obtener configuración de entidad
 */
export function obtenerConfiguracionEntidad(
  tipoEntidad: TipoEntidad
): ConfiguracionEntidad {
  return CONFIGURACION_ENTIDADES[tipoEntidad]
}
