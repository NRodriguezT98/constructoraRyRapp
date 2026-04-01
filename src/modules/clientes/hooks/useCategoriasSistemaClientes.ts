/**
 * @file useCategoriasSistemaClientes.ts
 * @description Hook para garantizar que las categorías del sistema de clientes existan
 *
 * ✅ AUTO-SEED: Crea/recrea categorías automáticamente con UUIDs fijos
 * ⚠️ CRÍTICO: Los UUIDs son fijos y usados en triggers, no modificar
 *
 * @usage
 * ```tsx
 * const { verificarYCrear, cargando } = useCategoriasSistemaClientes()
 *
 * useEffect(() => {
 *   verificarYCrear()
 * }, [])
 * ```
 */

import { useCallback, useState } from 'react'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import { CATEGORIAS_SISTEMA_CLIENTES } from '../constants/categorias-sistema-clientes.constants'

interface UseCategoriasSistemaClientesReturn {
  /** Verifica y crea categorías faltantes */
  verificarYCrear: () => Promise<void>

  /** Indica si está en proceso de verificación/creación */
  cargando: boolean

  /** Error si algo falló */
  error: string | null
}

/**
 * Hook para auto-seeding de categorías del sistema de clientes
 *
 * Garantiza que las 6 categorías predefinidas existan con sus UUIDs fijos.
 * Si alguna categoría no existe, la crea automáticamente.
 */
export function useCategoriasSistemaClientes(): UseCategoriasSistemaClientesReturn {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Verifica y crea categorías del sistema que no existan
   */
  const verificarYCrear = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      // Obtener user_id actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        logger.warn('⚠️ Usuario no autenticado, omitiendo verificación de categorías')
        return
      }

      // Obtener categorías existentes
      const { data: categoriasExistentes, error: queryError } = await supabase
        .from('categorias_documento')
        .select('id')
        .in('id', CATEGORIAS_SISTEMA_CLIENTES.map(c => c.id))

      if (queryError) {
        throw new Error(`Error al verificar categorías: ${queryError.message}`)
      }

      const idsExistentes = new Set(categoriasExistentes?.map(c => c.id) || [])
      const categoriasFaltantes = CATEGORIAS_SISTEMA_CLIENTES.filter(
        c => !idsExistentes.has(c.id)
      )

      if (categoriasFaltantes.length === 0) {
        return
      }


      // Crear categorías faltantes con UUIDs fijos
      const { error: insertError } = await supabase
        .from('categorias_documento')
        .insert(
          categoriasFaltantes.map(cat => ({
            id: cat.id,  // ⚠️ UUID FIJO (no auto-generado)
            user_id: user.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion,
            color: cat.color,
            icono: cat.icono,
            orden: cat.orden,
            es_sistema: cat.es_sistema,
            modulos_permitidos: [...cat.modulos_permitidos] as string[] // Fix readonly -> mutable
          }))
        )

      if (insertError) {
        // Si el error es por UUID duplicado, ignorar (ya existe)
        if (insertError.code === '23505') {
          return
        }
        throw new Error(`Error al crear categorías: ${insertError.message}`)
      }

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido'
      logger.error('❌ Error en verificación de categorías:', mensaje)
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }, [])

  return {
    verificarYCrear,
    cargando,
    error
  }
}
