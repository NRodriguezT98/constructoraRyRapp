'use client'

import { useCallback, useEffect, useState } from 'react'
import { auditoriasService } from '../services/auditorias.service'
import type {
  AuditoriaRegistro,
  EliminacionMasiva,
  EstadisticasAuditoria,
  FiltrosAuditoria,
  ResumenModulo,
  VistaAuditoria,
} from '../types'

export function useAuditorias() {
  // Estado
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([])
  const [resumenModulos, setResumenModulos] = useState<ResumenModulo[]>([])
  const [eliminacionesMasivas, setEliminacionesMasivas] = useState<
    EliminacionMasiva[]
  >([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasAuditoria | null>(
    null
  )
  const [registroSeleccionado, setRegistroSeleccionado] =
    useState<AuditoriaRegistro | null>(null)
  const [cargando, setCargando] = useState(true) // ← CAMBIO: Iniciar en true
  const [error, setError] = useState<string | null>(null)

  // Filtros y vista
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({
    busqueda: '',
  })
  const [vista, setVista] = useState<VistaAuditoria>('tabla')

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)
  const registrosPorPagina = 50

  /**
   * Cargar auditorías con filtros
   */
  const cargarAuditorias = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      const offset = (paginaActual - 1) * registrosPorPagina

      const resultado = await auditoriasService.obtenerAuditorias({
        tabla: filtros.tabla,
        modulo: filtros.modulo,
        accion: filtros.accion,
        usuarioId: filtros.usuarioId,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        limite: registrosPorPagina,
        offset,
      })

      setRegistros(resultado.datos)
      setTotalRegistros(resultado.total)
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al cargar auditorías'
      setError(mensaje)
      console.error('[Auditorías] Error al cargar:', err)
    } finally {
      setCargando(false)
    }
  }, [
    filtros.tabla,
    filtros.modulo,
    filtros.accion,
    filtros.usuarioId,
    filtros.fechaDesde,
    filtros.fechaHasta,
    paginaActual,
  ])

  /**
   * Buscar auditorías por texto
   */
  const buscar = useCallback(async (texto: string) => {
    if (!texto.trim()) {
      return
    }

    setCargando(true)
    setError(null)

    try {
      const resultados = await auditoriasService.buscarAuditorias(texto, 50)
      setRegistros(resultados)
      setTotalRegistros(resultados.length)
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al buscar auditorías'
      setError(mensaje)
      console.error('Error al buscar:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * Cargar resumen por módulos
   */
  const cargarResumenModulos = useCallback(async () => {
    try {
      const resumen = await auditoriasService.obtenerResumenModulos()
      setResumenModulos(resumen)
    } catch (err) {
      console.error('Error al cargar resumen de módulos:', err)
    }
  }, [])

  /**
   * Cargar eliminaciones masivas
   */
  const cargarEliminacionesMasivas = useCallback(async () => {
    try {
      const eliminaciones =
        await auditoriasService.detectarEliminacionesMasivas(7, 5)
      setEliminacionesMasivas(eliminaciones)
    } catch (err) {
      console.error('Error al cargar eliminaciones masivas:', err)
    }
  }, [])

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await auditoriasService.obtenerEstadisticas()
      setEstadisticas(stats)
    } catch (err) {
      console.error('[Auditorías] Error al cargar estadísticas:', err)
    }
  }, [])

  /**
   * Obtener historial de un registro específico
   */
  const obtenerHistorial = useCallback(
    async (tabla: string, registroId: string) => {
      setCargando(true)
      setError(null)

      try {
        const historial = await auditoriasService.obtenerHistorialRegistro(
          tabla,
          registroId,
          100
        )
        setRegistros(historial)
        setTotalRegistros(historial.length)
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : 'Error al cargar historial'
        setError(mensaje)
        console.error('Error al cargar historial:', err)
      } finally {
        setCargando(false)
      }
    },
    []
  )

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = useCallback((nuevosFiltros: Partial<FiltrosAuditoria>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
    setPaginaActual(1) // Resetear a página 1
  }, [])

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '' })
    setPaginaActual(1)
  }, [])

  /**
   * Cambiar página
   */
  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina)
  }, [])

  /**
   * Cambiar vista
   */
  const cambiarVista = useCallback((nuevaVista: VistaAuditoria) => {
    setVista(nuevaVista)
  }, [])

  /**
   * Seleccionar registro para ver detalles
   */
  const seleccionarRegistro = useCallback((registro: AuditoriaRegistro | null) => {
    setRegistroSeleccionado(registro)
  }, [])

  /**
   * Refrescar datos
   */
  const refrescar = useCallback(async () => {
    await Promise.all([
      cargarAuditorias(),
      cargarResumenModulos(),
      cargarEliminacionesMasivas(),
      cargarEstadisticas(),
    ])
  }, [
    cargarAuditorias,
    cargarResumenModulos,
    cargarEliminacionesMasivas,
    cargarEstadisticas,
  ])

  // Cargar datos iniciales UNA VEZ al montar el componente
  useEffect(() => {
    let cancelado = false

    const inicializar = async () => {
      try {
        const resultado = await auditoriasService.obtenerAuditorias({
          limite: registrosPorPagina,
          offset: 0,
        })

        if (cancelado) return

        setRegistros(resultado.datos)
        setTotalRegistros(resultado.total)
      } catch (err) {
        if (cancelado) return

        const mensaje = err instanceof Error ? err.message : 'Error al cargar auditorías'
        setError(mensaje)
        console.error('[Auditorías] Error en carga inicial:', err)
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    inicializar()

    return () => {
      cancelado = true
    }
  }, []) // Dependencias vacías - solo ejecutar al montar

  return {
    // Estado
    registros,
    resumenModulos,
    eliminacionesMasivas,
    estadisticas,
    registroSeleccionado,
    cargando,
    error,
    filtros,
    vista,
    paginaActual,
    totalRegistros,
    registrosPorPagina,
    totalPaginas: Math.ceil(totalRegistros / registrosPorPagina),

    // Acciones
    cargarAuditorias,
    buscar,
    cargarResumenModulos,
    cargarEliminacionesMasivas,
    cargarEstadisticas,
    obtenerHistorial,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarVista,
    seleccionarRegistro,
    refrescar,
  }
}
