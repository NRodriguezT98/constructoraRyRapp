import { supabase } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'

/**
 * 🎯 TIPOS - Basados en DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

interface AbonoHistorialRow {
  id: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro: string | null
}

interface AbonoConInfo extends AbonoHistorialRow {
  cliente: {
    id: string
    nombres: string
    apellidos: string
    numero_documento: string
  }
  negociacion: {
    id: string
    estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
  }
  vivienda: {
    id: string
    numero: string
    manzana: {
      identificador: string
    }
  }
  proyecto: {
    id: string
    nombre: string
  }
  fuente_pago: {
    id: string
    tipo: string
  }
}

interface Filtros {
  busqueda: string
  estado: 'todos' | 'activos' | 'anulados'
  vivienda?: string
  proyecto?: string
}

interface Estadisticas {
  totalAbonos: number
  montoTotal: number
  montoEsteMes: number
  abonosEsteMes: number
}

/**
 * 🎣 HOOK: useAbonosList
 *
 * Obtiene TODOS los abonos del sistema con información completa
 * de cliente, negociación, vivienda, proyecto y fuente de pago
 *
 * @returns {Object} - Abonos, estadísticas, filtros y estado de carga
 */
export function useAbonosList() {
  const [abonos, setAbonos] = useState<AbonoConInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    estado: 'activos',
    vivienda: undefined
  })

  /**
   * 📊 Obtener todos los abonos con joins
   */
  useEffect(() => {
    async function fetchAbonos() {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser()
        console.log('👤 Usuario autenticado:', user?.email || 'No autenticado')

        // Query simple - obtener abonos con IDs
        // @ts-ignore - abonos_historial existe pero tipos no actualizados
        const { data: abonos, error: queryError } = await supabase
          .from('abonos_historial')
          .select('*')
          .order('fecha_abono', { ascending: false })

        if (queryError) {
          console.error('❌ Error fetching abonos:', {
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code
          })
          throw queryError
        }

        console.log('📊 Abonos obtenidos:', abonos?.length || 0)

        if (!abonos || abonos.length === 0) {
          console.log('⚠️ No hay abonos en la base de datos')
          setAbonos([])
          return
        }

        // Obtener IDs únicos
        const negociacionIds = [...new Set(abonos.map((a: any) => a.negociacion_id).filter(Boolean))]
        const fuentePagoIds = [...new Set(abonos.map((a: any) => a.fuente_pago_id).filter(Boolean))]

        console.log('🔍 Negociacion IDs:', negociacionIds)
        console.log('🔍 Fuente Pago IDs:', fuentePagoIds)

        // Obtener negociaciones (solo si hay IDs)
        let negociaciones: any[] = []
        if (negociacionIds.length > 0) {
          const { data, error: negError, status, statusText } = await supabase
            .from('negociaciones')
            .select('id, estado, cliente_id, vivienda_id')
            .in('id', negociacionIds)

          console.log('📡 Query negociaciones:', {
            ids: negociacionIds,
            status,
            statusText,
            hasData: !!data,
            dataLength: data?.length,
            hasError: !!negError
          })

          if (negError) {
            console.error('❌ Error obteniendo negociaciones:', {
              message: negError.message,
              details: negError.details,
              hint: negError.hint,
              code: negError.code
            })
          } else {
            console.log('📊 Negociaciones data:', data)
          }
          negociaciones = data || []
        }

        console.log('✅ Negociaciones obtenidas:', negociaciones.length)

        // Obtener IDs de clientes y viviendas
        const clienteIds = [...new Set(negociaciones.map(n => n.cliente_id).filter(Boolean))]
        const viviendaIds = [...new Set(negociaciones.map(n => n.vivienda_id).filter(Boolean))]

        console.log('🔍 Cliente IDs:', clienteIds)
        console.log('🔍 Vivienda IDs:', viviendaIds)

        // Obtener clientes (solo si hay IDs)
        let clientes: any[] = []
        if (clienteIds.length > 0) {
          const { data } = await supabase
            .from('clientes')
            .select('id, nombres, apellidos, numero_documento')
            .in('id', clienteIds)
          clientes = data || []
        }

        // Obtener viviendas (solo si hay IDs)
        let viviendas: any[] = []
        if (viviendaIds.length > 0) {
          const { data, error: vivError } = await supabase
            .from('viviendas')
            .select('id, numero, manzana_id')
            .in('id', viviendaIds)

          if (vivError) {
            console.error('❌ Error obteniendo viviendas:', {
              message: vivError.message,
              details: vivError.details,
              hint: vivError.hint,
              code: vivError.code
            })
          }

          viviendas = data || []
        }

        // Obtener fuentes de pago (solo si hay IDs)
        let fuentesPago: any[] = []
        if (fuentePagoIds.length > 0) {
          const { data } = await supabase
            .from('fuentes_pago')
            .select('id, tipo')
            .in('id', fuentePagoIds)
          fuentesPago = data || []
        }

        console.log('✅ Clientes obtenidos:', clientes.length)
        console.log('✅ Viviendas obtenidas:', viviendas.length)
        console.log('✅ Fuentes de pago obtenidas:', fuentesPago.length)

        // Obtener IDs de manzanas (viviendas NO tienen proyecto_id directo)
        const manzanaIds = [...new Set(viviendas.map(v => v.manzana_id).filter(Boolean))]
        console.log('🔍 Manzana IDs:', manzanaIds)

        // Obtener manzanas con proyecto_id (solo si hay IDs)
        let manzanas: any[] = []
        if (manzanaIds.length > 0) {
          const { data } = await supabase
            .from('manzanas')
            .select('id, nombre, proyecto_id')
            .in('id', manzanaIds)
          manzanas = data || []
        }

        // Extraer proyecto_ids desde manzanas
        const proyectoIds = [...new Set(manzanas.map(m => m.proyecto_id).filter(Boolean))]
        console.log('🔍 Proyecto IDs (desde manzanas):', proyectoIds)

        // Obtener proyectos (solo si hay IDs)
        let proyectos: any[] = []
        if (proyectoIds.length > 0) {
          const { data } = await supabase
            .from('proyectos')
            .select('id, nombre')
            .in('id', proyectoIds)
          proyectos = data || []
        }

        console.log('✅ Manzanas obtenidas:', manzanas.length)
        console.log('✅ Proyectos obtenidos:', proyectos.length)

        // Crear mapas para búsqueda rápida
        const negociacionesMap = new Map(negociaciones.map(n => [n.id, n]))
        const clientesMap = new Map(clientes.map(c => [c.id, c]))
        const viviendasMap = new Map(viviendas.map(v => [v.id, v]))
        const manzanasMap = new Map(manzanas.map(m => [m.id, m]))
        const proyectosMap = new Map(proyectos.map(p => [p.id, p]))
        const fuentesPagoMap = new Map(fuentesPago.map(f => [f.id, f]))

        // Transformar datos para estructura plana
        const abonosTransformados = abonos.map((abono: any) => {
          const negociacion = negociacionesMap.get(abono.negociacion_id)
          const cliente = negociacion ? clientesMap.get(negociacion.cliente_id) : null
          const vivienda = negociacion ? viviendasMap.get(negociacion.vivienda_id) : null
          const manzana = vivienda ? manzanasMap.get(vivienda.manzana_id) : null
          // Proyecto viene desde manzana, no desde vivienda
          const proyecto = manzana ? proyectosMap.get(manzana.proyecto_id) : null
          const fuentePago = fuentesPagoMap.get(abono.fuente_pago_id)

          return {
            ...abono,
            cliente: cliente || { id: '', nombres: 'N/A', apellidos: '', numero_documento: '' },
            negociacion: {
              id: negociacion?.id || '',
              estado: negociacion?.estado || 'Activa'
            },
            vivienda: {
              id: vivienda?.id || '',
              numero: vivienda?.numero || 'N/A',
              manzana: {
                identificador: manzana?.nombre || 'N/A'
              }
            },
            proyecto: {
              id: proyecto?.id || '',
              nombre: proyecto?.nombre || 'N/A'
            },
            fuente_pago: {
              id: fuentePago?.id || '',
              tipo: fuentePago?.tipo || 'N/A'
            }
          }
        })

        console.log('✅ Abonos transformados:', abonosTransformados.length)
        setAbonos(abonosTransformados)
      } catch (err) {
        console.error('❌ Error en useAbonosList:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAbonos()
  }, [])

  /**
   * 🔍 Filtrar abonos según criterios
   */
  const abonosFiltrados = useMemo(() => {
    let resultado = [...abonos]

    // Filtro por búsqueda (cliente, documento, proyecto)
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter((abono) => {
        const nombreCompleto = `${abono.cliente.nombres} ${abono.cliente.apellidos}`.toLowerCase()
        const documento = abono.cliente.numero_documento.toLowerCase()
        const proyecto = abono.proyecto.nombre.toLowerCase()
        const referencia = (abono.numero_referencia || '').toLowerCase()
        const vivienda = `manzana ${abono.vivienda.manzana.identificador} casa ${abono.vivienda.numero}`.toLowerCase()

        return (
          nombreCompleto.includes(termino) ||
          documento.includes(termino) ||
          proyecto.includes(termino) ||
          referencia.includes(termino) ||
          vivienda.includes(termino)
        )
      })
    }

    // Filtro por estado de negociación
    if (filtros.estado === 'activos') {
      resultado = resultado.filter((abono) => abono.negociacion.estado === 'Activa')
    } else if (filtros.estado === 'anulados') {
      // TODO: Cuando implementemos anulación de abonos
      // resultado = resultado.filter((abono) => abono.anulado === true)
      resultado = [] // Por ahora vacío
    }

    // Filtro por vivienda específica
    if (filtros.vivienda) {
      resultado = resultado.filter((abono) => abono.vivienda.id === filtros.vivienda)
    }

    // Filtro por proyecto
    if (filtros.proyecto && filtros.proyecto !== 'todos') {
      resultado = resultado.filter((abono) => abono.proyecto.id === filtros.proyecto)
    }

    return resultado
  }, [abonos, filtros])

  /**
   * 📊 Calcular estadísticas
   */
  const estadisticas = useMemo<Estadisticas>(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    const abonosEsteMes = abonosFiltrados.filter((abono) => {
      const fechaAbono = new Date(abono.fecha_abono)
      return fechaAbono >= inicioMes
    })

    return {
      totalAbonos: abonosFiltrados.length,
      montoTotal: abonosFiltrados.reduce((sum, abono) => sum + Number(abono.monto), 0),
      montoEsteMes: abonosEsteMes.reduce((sum, abono) => sum + Number(abono.monto), 0),
      abonosEsteMes: abonosEsteMes.length
    }
  }, [abonosFiltrados])

  /**
   * 🎛️ Funciones de control de filtros
   */
  const actualizarFiltros = (nuevosFiltros: Partial<Filtros>) => {
    setFiltros((prev) => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: 'activos',
      vivienda: undefined,
      proyecto: undefined
    })
  }

  /**
   * 🏗️ Obtener lista única de proyectos
   */
  const proyectosUnicos = useMemo(() => {
    const proyectosMap = new Map()
    abonos.forEach((abono) => {
      if (!proyectosMap.has(abono.proyecto.id)) {
        proyectosMap.set(abono.proyecto.id, abono.proyecto.nombre)
      }
    })
    return Array.from(proyectosMap.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [abonos])

  return {
    // Datos
    abonos: abonosFiltrados,
    abonosCompletos: abonos, // Sin filtrar
    estadisticas,
    proyectosUnicos, // Lista de proyectos disponibles

    // Filtros
    filtros,
    actualizarFiltros,
    limpiarFiltros,

    // Estado
    isLoading,
    error
  }
}
