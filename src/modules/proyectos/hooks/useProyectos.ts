import { useEffect, useMemo } from 'react'
import { useProyectosStore } from '../store/proyectos.store'
import { Proyecto, FiltroProyecto } from '../types'

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
        limpiarError
    } = useProyectosStore()

    // Cargar proyectos al montar el componente
    useEffect(() => {
        obtenerProyectos()
    }, [obtenerProyectos])

    return {
        proyectos,
        cargando,
        error,
        crearProyecto,
        actualizarProyecto,
        eliminarProyecto,
        refrescar: obtenerProyectos,
        limpiarError
    }
}

// Hook para manejar un proyecto específico
export function useProyecto(id?: string) {
    const {
        proyectoActual,
        obtenerProyecto,
        setProyectoActual,
        cargando,
        error
    } = useProyectosStore()

    useEffect(() => {
        if (id) {
            obtenerProyecto(id).then(proyecto => {
                if (proyecto) {
                    setProyectoActual(proyecto)
                }
            })
        } else {
            setProyectoActual(undefined)
        }
    }, [id, obtenerProyecto, setProyectoActual])

    return {
        proyecto: proyectoActual,
        cargando,
        error
    }
}

// Hook para filtrado y búsqueda
export function useProyectosFiltrados() {
    const {
        proyectos,
        filtros,
        setFiltros,
        cargando
    } = useProyectosStore()

    const proyectosFiltrados = useMemo(() => {
        let resultado = [...proyectos]

        // Filtro por búsqueda
        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase()
            resultado = resultado.filter(proyecto =>
                proyecto.nombre.toLowerCase().includes(termino) ||
                proyecto.ubicacion.toLowerCase().includes(termino) ||
                proyecto.descripcion.toLowerCase().includes(termino) ||
                proyecto.responsable.toLowerCase().includes(termino)
            )
        }

        // Filtro por estado
        if (filtros.estado) {
            resultado = resultado.filter(proyecto => proyecto.estado === filtros.estado)
        }

        // Filtro por fechas
        if (filtros.fechaDesde) {
            resultado = resultado.filter(proyecto =>
                new Date(proyecto.fechaInicio) >= new Date(filtros.fechaDesde!)
            )
        }

        if (filtros.fechaHasta) {
            resultado = resultado.filter(proyecto =>
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
            fechaHasta: undefined
        })
    }

    return {
        proyectos: proyectosFiltrados,
        filtros,
        cargando,
        actualizarFiltros,
        limpiarFiltros,
        totalProyectos: proyectos.length,
        proyectosFiltrados: proyectosFiltrados.length
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
        cambiarVista
    }
}

// Hook para estadísticas básicas
export function useEstadisticasProyectos() {
    const { proyectos } = useProyectosStore()

    const estadisticas = useMemo(() => {
        const total = proyectos.length
        const enPlanificacion = proyectos.filter(p => p.estado === 'en_planificacion').length
        const enConstruccion = proyectos.filter(p => p.estado === 'en_construccion').length
        const completados = proyectos.filter(p => p.estado === 'completado').length
        const pausados = proyectos.filter(p => p.estado === 'pausado').length

        const presupuestoTotal = proyectos.reduce((sum, p) => sum + p.presupuesto, 0)
        const progresoPromedio = proyectos.length > 0
            ? proyectos.reduce((sum, p) => sum + (p.progreso || 0), 0) / proyectos.length
            : 0

        return {
            total,
            enPlanificacion,
            enConstruccion,
            completados,
            pausados,
            presupuestoTotal,
            progresoPromedio: Math.round(progresoPromedio)
        }
    }, [proyectos])

    return estadisticas
}