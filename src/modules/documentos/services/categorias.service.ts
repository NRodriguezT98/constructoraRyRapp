// ============================================
// SERVICE: Gestión de Categorías de Documentos
// ============================================

import { supabase } from '@/lib/supabase/client'
import type {
    CategoriaDocumento,
    ModuloDocumento,
} from '../types/documento.types'

export class CategoriasService {
  /**
   * Obtener todas las categorías del usuario (DEPRECADO - usar obtenerCategoriasPorModulo)
   * @deprecated Usar obtenerCategoriasPorModulo() para sistema flexible multi-módulo
   */
  static async obtenerCategorias(
    userId: string,
    tipoEntidad?: 'proyecto' | 'cliente' | 'ambos'
  ): Promise<CategoriaDocumento[]> {
    const { data, error } = await supabase
      .from('categorias_documento')
      .select('*')
      .eq('user_id', userId)
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) throw error
    return (data || []) as CategoriaDocumento[]
  }

  /**
   * Obtener categorías disponibles para un módulo específico
   * Sistema flexible: considera es_global y modulos_permitidos
   * Ahora las categorías son compartidas entre usuarios
   * @param modulo - 'proyectos' | 'clientes' | 'viviendas'
   */
  static async obtenerCategoriasPorModulo(
    userId: string, // Mantenemos por compatibilidad pero ya no se usa para filtrar
    modulo: 'proyectos' | 'clientes' | 'viviendas'
  ): Promise<CategoriaDocumento[]> {
    // Traer TODAS las categorías globales (no filtrar por user_id)
    const { data, error } = await supabase
      .from('categorias_documento')
      .select('*')
      .eq('es_global', true) // Solo categorías globales
      .order('orden', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      console.error('❌ Error al obtener categorías:', error)
      throw error
    }

    // Filtrar por módulo en JavaScript
    const filtradas = (data || []).filter((cat: any) => {
      // Si tiene modulos_permitidos y contiene el módulo actual
      if (cat.modulos_permitidos && Array.isArray(cat.modulos_permitidos)) {
        return cat.modulos_permitidos.includes(modulo)
      }

      // Si es global sin módulos específicos, incluir en todos
      return true
    })

    return filtradas as CategoriaDocumento[]
  }

  /**
   * Crear una nueva categoría con sistema flexible de módulos
   */
  static async crearCategoria(
    userId: string,
    categoria: Omit<CategoriaDocumento, 'id' | 'user_id' | 'fecha_creacion'>
  ): Promise<CategoriaDocumento> {
    const { data, error } = await supabase
      .from('categorias_documento')
      .insert({
        user_id: userId,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        color: categoria.color,
        icono: categoria.icono,
        orden: categoria.orden,
        es_global: categoria.es_global ?? false,
        modulos_permitidos: categoria.es_global
          ? []
          : categoria.modulos_permitidos ?? ['proyectos'],
      })
      .select()
      .single()

    if (error) throw error
    return data as CategoriaDocumento
  }

  /**
   * Actualizar una categoría existente (ahora incluye es_global y modulos_permitidos)
   */
  static async actualizarCategoria(
    categoriaId: string,
    updates: any
  ): Promise<CategoriaDocumento> {
    // Convertir camelCase a snake_case y preparar datos
    const updateData: any = {}

    if (updates.nombre !== undefined) updateData.nombre = updates.nombre
    if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.icono !== undefined) updateData.icono = updates.icono
    if (updates.orden !== undefined) updateData.orden = updates.orden

    // Manejar es_global (acepta tanto camelCase como snake_case)
    const esGlobal = updates.esGlobal ?? updates.es_global
    if (esGlobal !== undefined) {
      updateData.es_global = esGlobal
      // Si es global, limpiar módulos
      updateData.modulos_permitidos = esGlobal ? [] : (updates.modulosPermitidos ?? updates.modulos_permitidos ?? ['proyectos'])
    } else if (updates.modulosPermitidos !== undefined || updates.modulos_permitidos !== undefined) {
      // Solo actualizar módulos si no es global
      updateData.modulos_permitidos = updates.modulosPermitidos ?? updates.modulos_permitidos
    }

    const { data, error } = await supabase
      .from('categorias_documento')
      .update(updateData)
      .eq('id', categoriaId)
      .select()
      .single()

    if (error) throw error
    return {
      ...data,
      modulos_permitidos: data.modulos_permitidos as ModuloDocumento[],
    } as CategoriaDocumento
  }

  /**
   * Eliminar una categoría
   */
  static async eliminarCategoria(categoriaId: string): Promise<void> {
    const { error } = await supabase
      .from('categorias_documento')
      .delete()
      .eq('id', categoriaId)

    if (error) throw error
  }

  /**
   * Reordenar categorías
   */
  static async reordenarCategorias(
    categorias: Array<{ id: string; orden: number }>
  ): Promise<void> {
    const updates = categorias.map(({ id, orden }) =>
      supabase.from('categorias_documento').update({ orden }).eq('id', id)
    )

    await Promise.all(updates)
  }

  /**
   * Crear categorías por defecto para nuevo usuario
   * NOTA: Este método ya no es necesario porque la migración SQL
   * crea automáticamente las categorías cuando el usuario crea su primera categoría
   * @deprecated Las categorías se crean automáticamente en la migración SQL
   */
  static async crearCategoriasDefault(
    userId: string
  ): Promise<CategoriaDocumento[]> {
    // Ya no creamos categorías por defecto desde código
    // La migración SQL las crea automáticamente con el sistema flexible
    return []
  }

  /**
   * Verificar si el usuario tiene categorías
   */
  static async tieneCategorias(userId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('categorias_documento')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return (count || 0) > 0
  }
}
