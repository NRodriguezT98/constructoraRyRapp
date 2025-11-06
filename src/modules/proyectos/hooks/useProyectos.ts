import { useEffect, useMemo, useState } from 'react'
import { useProyectosStore } from '../store/proyectos.store'
import { FiltroProyecto } from '../types'

// Hook principal para manejar proyectos
export function useProyectos() {
  const {
    proyectos,
    cargando,
    error,
    obtenerProyectos,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    limpiarError,
  } = useProyectosStore()

  const [datosInicializados, setDatosInicializados] = useState(false)

  // Cargar proyectos al montar el componente (solo una vez)
  useEffect(() => {
    if (!datosInicializados) {
      console.log('🏗️ [PROYECTOS HOOK] Cargando datos iniciales...')
      obtenerProyectos().then(() => {
        setDatosInicializados(true)
      }).catch((error) => {
        console.error('❌ [PROYECTOS HOOK] Error cargando datos:', error)
      })
    }

    // ✅ Cleanup: Limpiar flag si el componente se desmonta antes de terminar
    return () => {
      // No hacemos nada aquí porque queremos mantener datosInicializados
      // para evitar recargas innecesarias al navegar
    }
  }, [datosInicializados]) // ← Solo depende del flag booleano

  return {
    proyectos,
    cargando,
    error,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    refrescar: obtenerProyectos,
    limpiarError,
  }
}

// Hook para manejar un proyecto específico
export function useProyecto(id?: string) {
  const {
    proyectoActual,
    obtenerProyecto,
    setProyectoActual,
    cargando,
    error,
  } = useProyectosStore()

  useEffect(() => {
    let mounted = true

    if (id) {
      obtenerProyecto(id).then(proyecto => {
        if (proyecto && mounted) {
          setProyectoActual(proyecto)
        }
      }).catch((error) => {
        console.error('❌ [PROYECTO HOOK] Error cargando proyecto:', error)
      })
    } else {
      if (mounted) {
        setProyectoActual(undefined)
      }
    }

    return () => {
      mounted = false
    }
  }, [id]) // ← Solo depende del ID (string primitivo)

  return {
    proyecto: proyectoActual,
    cargando,
    error,
  }
}

// Hook para filtrado y búsqueda
export function useProyectosFiltrados() {
  const { proyectos, filtros, setFiltros, cargando } = useProyectosStore()

  const proyectosFiltrados = useMemo(() => {
    let resultado = [...proyectos]

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const termino = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(
        proyecto =>
          proyecto.nombre.toLowerCase().includes(termino) ||
          proyecto.ubicacion.toLowerCase().includes(termino) ||
          proyecto.descripcion.toLowerCase().includes(termino) ||
          proyecto.responsable.toLowerCase().includes(termino)
      )
    }

    // Filtro por estado (con compatibilidad para estados antiguos)
    if (filtros.estado) {
      if (filtros.estado === 'en_proceso') {
        // "En Proceso" incluye: en_proceso, en_planificacion, en_construccion, pausado
        resultado = resultado.filter(
          proyecto =>
            proyecto.estado === 'en_proceso' ||
            proyecto.estado === 'en_planificacion' ||
            proyecto.estado === 'en_construccion' ||
            proyecto.estado === 'pausado'
        )
      } else if (filtros.estado === 'completado') {
        // "Completado" solo incluye completado
        resultado = resultado.filter(
          proyecto => proyecto.estado === 'completado'
        )
      } else {
        // Filtro directo para otros estados (compatibilidad)
        resultado = resultado.filter(
          proyecto => proyecto.estado === filtros.estado
        )
      }
    }

    // Filtro por fechas
    if (filtros.fechaDesde) {
      resultado = resultado.filter(
        proyecto =>
          new Date(proyecto.fechaInicio) >= new Date(filtros.fechaDesde!)
      )
    }

    if (filtros.fechaHasta) {
      resultado = resultado.filter(
        proyecto =>
          new Date(proyecto.fechaInicio) <= new Date(filtros.fechaHasta!)
      )
    }

    return resultado
  }, [proyectos, filtros])

  const actualizarFiltros = (nuevosFiltros: Partial<FiltroProyecto>) => {
    setFiltros(nuevosFiltros)
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
    })
  }

  return {
    proyectos: proyectosFiltrados,
    filtros,
    cargando,
    actualizarFiltros,
    limpiarFiltros,
    totalProyectos: proyectos.length,
    proyectosFiltrados: proyectosFiltrados.length,
  }
}

// Hook para manejar la vista (grid/lista)
export function useVistaProyectos() {
  const { vista, setVista } = useProyectosStore()

  const cambiarVista = () => {
    setVista(vista === 'grid' ? 'lista' : 'grid')
  }

  return {
    vista,
    esGrid: vista === 'grid',
    esLista: vista === 'lista',
    setVista,
    cambiarVista,
  }
}

// Hook para estadísticas básicas (simplificadas)
export function useEstadisticasProyectos() {
  const { proyectos } = useProyectosStore()

  const estadisticas = useMemo(() => {
    const total = proyectos.length

    // Estados simplificados: en_proceso y completado
    const enProceso = proyectos.filter(
      p =>
        p.estado === 'en_proceso' ||
        p.estado === 'en_planificacion' ||
        p.estado === 'en_construccion' ||
        p.estado === 'pausado'
    ).length

    const completados = proyectos.filter(p => p.estado === 'completado').length

    const presupuestoTotal = proyectos.reduce(
      (sum, p) => sum + p.presupuesto,
      0
    )
    const progresoPromedio =
      proyectos.length > 0
        ? proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) /
          proyectos.length
        : 0

    return {
      total,
      enProceso,
      completados,
      presupuestoTotal,
      progresoPromedio: Math.round(progresoPromedio),
    }
  }, [proyectos])

  return estadisticas
}
