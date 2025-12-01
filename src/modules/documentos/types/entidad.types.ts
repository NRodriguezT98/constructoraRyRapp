/**
 * ============================================
 * TIPOS: Entidades para Sistema Genérico
 * ============================================
 *
 * Define los tipos de entidades que pueden tener documentos
 * y las configuraciones para cada una
 */

export type TipoEntidad = 'proyecto' | 'vivienda' | 'cliente'

import type { ModuleName } from '@/shared/config/module-themes'

/**
 * Configuración de tabla y bucket por tipo de entidad
 */
export interface ConfiguracionEntidad {
  tabla: string
  campoEntidad: string // nombre del campo FK (ej: 'proyecto_id', 'vivienda_id')
  bucket: string
  moduleName: ModuleName
  nombreSingular: string // Para mensajes de UI (ej: 'proyecto', 'vivienda', 'cliente')
}

/**
 * Mapeo de tipo de entidad a su configuración
 */
export const CONFIGURACION_ENTIDADES: Record<TipoEntidad, ConfiguracionEntidad> = {
  proyecto: {
    tabla: 'documentos_proyecto',
    campoEntidad: 'proyecto_id',
    bucket: 'documentos-proyectos',
    moduleName: 'proyectos',
    nombreSingular: 'proyecto',
  },
  vivienda: {
    tabla: 'documentos_vivienda',
    campoEntidad: 'vivienda_id',
    bucket: 'documentos-viviendas',
    moduleName: 'viviendas',
    nombreSingular: 'vivienda',
  },
  cliente: {
    tabla: 'documentos_cliente',
    campoEntidad: 'cliente_id',
    bucket: 'documentos-clientes',
    moduleName: 'clientes',
    nombreSingular: 'cliente',
  },
}

/**
 * Helper para obtener configuración de entidad
 */
export function obtenerConfiguracionEntidad(tipoEntidad: TipoEntidad): ConfiguracionEntidad {
  return CONFIGURACION_ENTIDADES[tipoEntidad]
}
