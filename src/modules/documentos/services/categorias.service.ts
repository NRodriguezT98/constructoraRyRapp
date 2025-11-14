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
   * Sistema flexible: solo categorías globales (compartidas entre todos los usuarios)
   * @param modulo - 'proyectos' | 'clientes' | 'viviendas'
   */
  static async obtenerCategoriasPorModulo(
    userId: string, // Mantenido por compatibilidad, no se usa para filtrar
    modulo: 'proyectos' | 'clientes' | 'viviendas'
  ): Promise<CategoriaDocumento[]> {
    // ✅ SOLO categorías globales (visibles para TODOS los usuarios: admin, contadora, ayudante)
    const { data, error } = await supabase
      .from('categorias_documento')
      .select('*')
      .eq('es_global', true) // Solo categorías globales del sistema
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
        // ✅ FIX: es_global NO vacía modulos_permitidos
        // es_global = true → visible para todos los usuarios (admin, contadora, ayudante)
        // modulos_permitidos → define en qué módulos aparece (proyectos, clientes, viviendas)
        modulos_permitidos: categoria.modulos_permitidos ?? ['proyectos'],
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear categoría:', error)
      throw error
    }

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
    }

    // Manejar modulos_permitidos independientemente de es_global
    if (updates.modulosPermitidos !== undefined || updates.modulos_permitidos !== undefined) {
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
   * Eliminar una categoría con validaciones
   * REQUIERE: Usuario con rol 'Administrador'
   */
  static async eliminarCategoria(categoriaId: string): Promise<void> {
    // ✅ VALIDACIÓN 0: Verificar que el usuario es Administrador
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (errorUsuario || !usuario) {
      throw new Error('No se pudo verificar el rol del usuario')
    }

    if (usuario.rol !== 'Administrador') {
      throw new Error('Solo los administradores pueden eliminar categorías')
    }

    // ✅ VALIDACIÓN 1: Verificar si tiene documentos asociados en PROYECTOS
    const { count: countProyectos } = await supabase
      .from('documentos_proyecto')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', categoriaId)

    // ✅ VALIDACIÓN 2: Verificar si tiene documentos asociados en CLIENTES
    const { count: countClientes } = await supabase
      .from('documentos_cliente')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', categoriaId)

    // ✅ VALIDACIÓN 3: Verificar si tiene documentos asociados en VIVIENDAS
    const { count: countViviendas } = await supabase
      .from('documentos_vivienda')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', categoriaId)

    const totalDocumentos = (countProyectos || 0) + (countClientes || 0) + (countViviendas || 0)

    if (totalDocumentos > 0) {
      const detalles = []
      if (countProyectos) detalles.push(`${countProyectos} en Proyectos`)
      if (countClientes) detalles.push(`${countClientes} en Clientes`)
      if (countViviendas) detalles.push(`${countViviendas} en Viviendas`)

      throw new Error(
        `No se puede eliminar esta categoría porque tiene ${totalDocumentos} documento(s) asociado(s): ${detalles.join(', ')}`
      )
    }

    // ✅ Si pasa todas las validaciones, eliminar
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

  /**
   * ✅ Crear categorías por defecto para módulo proyectos
   * Llama a la función SQL que crea las 5 categorías esenciales
   */
  static async crearCategoriasProyectosDefault(userId: string): Promise<void> {
    const { error } = await supabase.rpc('crear_categorias_proyectos_default', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error al crear categorías por defecto:', error)
      throw error
    }
  }
}
