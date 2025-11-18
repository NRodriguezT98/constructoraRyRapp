/**
 * Factory de Renderers - Sistema inteligente de selección
 * Mapea módulo + acción → Renderer específico
 */

import { ActualizacionProyectoRenderer, CreacionProyectoRenderer } from './proyectos'
import { RendererGenerico } from './shared/RendererGenerico'

// Tipo para los renderers
type RendererComponent = React.ComponentType<any>

// Mapa de renderers por módulo y acción
const RENDERERS_MAP: Record<string, Record<string, RendererComponent>> = {
  proyectos: {
    CREATE: CreacionProyectoRenderer,
    UPDATE: ActualizacionProyectoRenderer,
    // DELETE: EliminacionRenderer,             // ← Agregar después
  },
  // viviendas: {
  //   CREATE: CreacionViviendaRenderer,        // ← Agregar después
  //   UPDATE: ActualizacionViviendaRenderer,
  // },
  // clientes: {
  //   CREATE: CreacionClienteRenderer,         // ← Agregar después
  // },
}

/**
 * Obtiene el renderer apropiado para un módulo y acción
 * Si no existe, retorna el renderer genérico
 */
export function getAuditoriaRenderer(modulo: string, accion: string): RendererComponent {
  const moduloRenderers = RENDERERS_MAP[modulo]

  if (!moduloRenderers) {
    console.warn(`No hay renderers definidos para el módulo: ${modulo}. Usando renderer genérico.`)
    return RendererGenerico
  }

  const renderer = moduloRenderers[accion]

  if (!renderer) {
    console.warn(`No hay renderer definido para ${modulo}/${accion}. Usando renderer genérico.`)
    return RendererGenerico
  }

  return renderer
}

/**
 * Verifica si existe un renderer específico para módulo/acción
 */
export function hasCustomRenderer(modulo: string, accion: string): boolean {
  return !!RENDERERS_MAP[modulo]?.[accion]
}
