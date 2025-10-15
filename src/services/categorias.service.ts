// ============================================
// SERVICE: Gestión de Categorías de Documentos
// ============================================

import { supabase } from '../lib/supabase/client'
import type { CategoriaDocumento } from '../types/documento.types'

export class CategoriasService {

    /**
     * Obtener todas las categorías del usuario
     */
    static async obtenerCategorias(userId: string): Promise<CategoriaDocumento[]> {
        const { data, error } = await supabase
            .from('categorias_documento')
            .select('*')
            .eq('user_id', userId)
            .order('orden', { ascending: true })
            .order('nombre', { ascending: true })

        if (error) throw error
        return data || []
    }

    /**
     * Crear una nueva categoría
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
            })
            .select()
            .single()

        if (error) throw error
        return data
    }

    /**
     * Actualizar una categoría existente
     */
    static async actualizarCategoria(
        categoriaId: string,
        updates: Partial<Pick<CategoriaDocumento, 'nombre' | 'descripcion' | 'color' | 'icono' | 'orden'>>
    ): Promise<CategoriaDocumento> {
        const { data, error } = await supabase
            .from('categorias_documento')
            .update(updates)
            .eq('id', categoriaId)
            .select()
            .single()

        if (error) throw error
        return data
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
            supabase
                .from('categorias_documento')
                .update({ orden })
                .eq('id', id)
        )

        await Promise.all(updates)
    }

    /**
     * Crear categorías por defecto para nuevo usuario
     */
    static async crearCategoriasDefault(userId: string): Promise<CategoriaDocumento[]> {
        const categoriasDefault = [
            {
                user_id: userId,
                nombre: 'Licencias y Permisos',
                descripcion: 'Documentos legales y autorizaciones',
                color: 'blue',
                icono: 'FileCheck',
                orden: 1,
            },
            {
                user_id: userId,
                nombre: 'Planos',
                descripcion: 'Planos técnicos y arquitectónicos',
                color: 'purple',
                icono: 'Drafting',
                orden: 2,
            },
            {
                user_id: userId,
                nombre: 'Contratos',
                descripcion: 'Contratos y acuerdos',
                color: 'green',
                icono: 'FileSignature',
                orden: 3,
            },
            {
                user_id: userId,
                nombre: 'Facturas',
                descripcion: 'Comprobantes y facturas',
                color: 'yellow',
                icono: 'Receipt',
                orden: 4,
            },
            {
                user_id: userId,
                nombre: 'Fotografías',
                descripcion: 'Registro fotográfico del proyecto',
                color: 'pink',
                icono: 'Camera',
                orden: 5,
            },
            {
                user_id: userId,
                nombre: 'Informes',
                descripcion: 'Informes técnicos y reportes',
                color: 'indigo',
                icono: 'FileText',
                orden: 6,
            },
        ]

        const { data, error } = await supabase
            .from('categorias_documento')
            .insert(categoriasDefault)
            .select()

        if (error) throw error
        return data || []
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
