/**
 * ============================================
 * HOOK: useUsuarios
 * ============================================
 *
 * Hook para gestionar el estado de la lista de usuarios,
 * búsqueda, filtros, y operaciones CRUD.
 */

import { useCallback, useEffect, useState } from 'react'
import { usuariosService } from '../services/usuarios.service'
import type {
    ActualizarUsuarioData,
    CrearUsuarioData,
    EstadisticasUsuarios,
    EstadoUsuario,
    FiltrosUsuarios,
    Rol,
    UsuarioCompleto,
} from '../types'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasUsuarios | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({})

  /**
   * Cargar usuarios con filtros aplicados
   */
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const data = await usuariosService.obtenerUsuarios(filtros)
      setUsuarios(data)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }, [filtros])

  /**
   * Cargar estadísticas de usuarios
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await usuariosService.obtenerEstadisticas()
      setEstadisticas(stats)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }, [])

  /**
   * Crear nuevo usuario
   */
  const crearUsuario = useCallback(
    async (datos: CrearUsuarioData) => {
      try {
        setCargando(true)
        setError(null)

        const resultado = await usuariosService.crearUsuario(datos)

        // Recargar lista
        await cargarUsuarios()
        await cargarEstadisticas()

        return resultado
      } catch (err) {
        console.error('Error creando usuario:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios, cargarEstadisticas]
  )

  /**
   * Actualizar usuario existente
   */
  const actualizarUsuario = useCallback(
    async (id: string, datos: ActualizarUsuarioData) => {
      try {
        setCargando(true)
        setError(null)

        await usuariosService.actualizarUsuario(id, datos)

        // Recargar lista
        await cargarUsuarios()
        await cargarEstadisticas()
      } catch (err) {
        console.error('Error actualizando usuario:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios, cargarEstadisticas]
  )

  /**
   * Cambiar rol de usuario
   */
  const cambiarRol = useCallback(
    async (id: string, nuevoRol: Rol) => {
      try {
        setCargando(true)
        setError(null)

        await usuariosService.cambiarRol(id, nuevoRol)

        // Recargar lista
        await cargarUsuarios()
        await cargarEstadisticas()
      } catch (err) {
        console.error('Error cambiando rol:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios, cargarEstadisticas]
  )

  /**
   * Cambiar estado de usuario
   */
  const cambiarEstado = useCallback(
    async (id: string, nuevoEstado: EstadoUsuario) => {
      try {
        setCargando(true)
        setError(null)

        await usuariosService.cambiarEstado(id, nuevoEstado)

        // Recargar lista
        await cargarUsuarios()
        await cargarEstadisticas()
      } catch (err) {
        console.error('Error cambiando estado:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios, cargarEstadisticas]
  )

  /**
   * Resetear intentos fallidos de login
   */
  const resetearIntentos = useCallback(
    async (id: string) => {
      try {
        setCargando(true)
        setError(null)

        await usuariosService.resetearIntentosFallidos(id)

        // Recargar lista
        await cargarUsuarios()
      } catch (err) {
        console.error('Error reseteando intentos:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios]
  )

  /**
   * Eliminar usuario (soft delete)
   */
  const eliminarUsuario = useCallback(
    async (id: string) => {
      try {
        setCargando(true)
        setError(null)

        await usuariosService.eliminarUsuario(id)

        // Recargar lista
        await cargarUsuarios()
        await cargarEstadisticas()
      } catch (err) {
        console.error('Error eliminando usuario:', err)
        const mensaje = err instanceof Error ? err.message : 'Error desconocido'
        setError(mensaje)
        throw err
      } finally {
        setCargando(false)
      }
    },
    [cargarUsuarios, cargarEstadisticas]
  )

  /**
   * Aplicar filtros de búsqueda
   */
  const aplicarFiltros = useCallback((nuevosFiltros: FiltrosUsuarios) => {
    setFiltros(nuevosFiltros)
  }, [])

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({})
  }, [])

  /**
   * Refrescar datos completos
   */
  const refrescar = useCallback(async () => {
    await Promise.all([cargarUsuarios(), cargarEstadisticas()])
  }, [cargarUsuarios, cargarEstadisticas])

  // Cargar datos iniciales
  useEffect(() => {
    let cancelado = false

    const inicializar = async () => {
      try {
        await Promise.all([cargarUsuarios(), cargarEstadisticas()])
      } catch (error) {
        if (!cancelado) {
          console.error('[USUARIOS] Error en carga inicial:', error)
        }
      }
    }

    inicializar()

    return () => {
      cancelado = true
    }
  }, [cargarUsuarios, cargarEstadisticas])

  return {
    // Estado
    usuarios,
    estadisticas,
    cargando,
    error,
    filtros,

    // Operaciones CRUD
    crearUsuario,
    actualizarUsuario,
    cambiarRol,
    cambiarEstado,
    resetearIntentos,
    eliminarUsuario,

    // Filtros y búsqueda
    aplicarFiltros,
    limpiarFiltros,

    // Utilidades
    refrescar,
  }
}
