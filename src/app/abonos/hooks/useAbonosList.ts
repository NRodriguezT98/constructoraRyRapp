import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

/**
 * 🎯 TIPOS - Basados en vista_abonos_completos
 */

// Tipo que viene directamente de la vista SQL
interface AbonoCompletoRow {
  // Datos del abono
  id: string
  numero_recibo: number
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

  // Datos relacionados (ya unidos por la vista)
  cliente_id: string
  cliente_nombres: string
  cliente_apellidos: string
  cliente_numero_documento: string
  negociacion_estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
  vivienda_id: string
  vivienda_numero: string
  manzana_id: string
  manzana_nombre: string
  proyecto_id: string
  proyecto_nombre: string
  fuente_pago_tipo: string
}

// Tipo transformado para el componente (estructura anidada)
interface AbonoConInfo {
  id: string
  numero_recibo: number
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
  fuente: string   // nombre de fuente o 'todas'
  mes: string      // 'YYYY-MM' o 'todos'
}

interface Estadisticas {
  totalAbonos: number
  montoTotal: number
  montoEsteMes: number
  abonosEsteMes: number
}

/**
 * 🎣 HOOK: useAbonosList (OPTIMIZADO CON VISTA SQL)
 *
 * Obtiene TODOS los abonos del sistema con información completa
 * Usa vista_abonos_completos para máximo rendimiento
 *
 * ANTES: 7 queries en cascada = 1421ms
 * AHORA: 1 query optimizada = ~250ms
 *
 * @returns {Object} - Abonos, estadísticas, filtros y estado de carga
 */
export function useAbonosList() {
  const [abonos, setAbonos] = useState<AbonoConInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<Filtros>({
    busqueda: '',
    fuente: 'todas',
    mes: 'todos',
  })

  /**
   * 📊 Obtener todos los abonos usando la vista optimizada
   * Una sola query en lugar de 7 queries en cascada
   */
  useEffect(() => {
    async function fetchAbonos() {
      try {
        setIsLoading(true)
        setError(null)

        // ✅ UNA SOLA QUERY - vista_abonos_completos hace todos los JOINs
        // @ts-ignore - vista existe pero tipos no están actualizados
        const { data: abonosData, error: queryError } = await supabase
          .from('vista_abonos_completos')
          .select('*')

        if (queryError) {
          console.error('❌ Error fetching abonos:', {
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code
          })
          throw queryError
        }

        if (!abonosData || abonosData.length === 0) {
          setAbonos([])
          return
        }

        // Transformar datos planos de la vista a estructura anidada
        const abonosTransformados: AbonoConInfo[] = abonosData.map((row: any) => ({
          // Campos del abono
          id: row.id,
          numero_recibo: row.numero_recibo,
          negociacion_id: row.negociacion_id,
          fuente_pago_id: row.fuente_pago_id,
          monto: row.monto,
          fecha_abono: row.fecha_abono,
          metodo_pago: row.metodo_pago,
          numero_referencia: row.numero_referencia,
          comprobante_url: row.comprobante_url,
          notas: row.notas,
          fecha_creacion: row.fecha_creacion,
          fecha_actualizacion: row.fecha_actualizacion,
          usuario_registro: row.usuario_registro,

          // Datos relacionados (estructura anidada)
          cliente: {
            id: row.cliente_id || '',
            nombres: row.cliente_nombres || 'N/A',
            apellidos: row.cliente_apellidos || '',
            numero_documento: row.cliente_numero_documento || ''
          },
          negociacion: {
            id: row.negociacion_id || '',
            estado: row.negociacion_estado || 'Activa'
          },
          vivienda: {
            id: row.vivienda_id || '',
            numero: row.vivienda_numero || 'N/A',
            manzana: {
              identificador: row.manzana_nombre || 'N/A'
            }
          },
          proyecto: {
            id: row.proyecto_id || '',
            nombre: row.proyecto_nombre || 'N/A'
          },
          fuente_pago: {
            id: row.fuente_pago_id || '',
            tipo: row.fuente_pago_tipo || 'N/A'
          }
        }))

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

    // Filtro por búsqueda (cliente, CC o RYR-XXXX)
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter((abono) => {
        const nombreCompleto = `${abono.cliente.nombres} ${abono.cliente.apellidos}`.toLowerCase()
        const documento = abono.cliente.numero_documento.toLowerCase()
        const recibo = `ryr-${String(abono.numero_recibo).padStart(4, '0')}`.toLowerCase()
        return (
          nombreCompleto.includes(termino) ||
          documento.includes(termino) ||
          recibo.includes(termino)
        )
      })
    }

    // Filtro por fuente de pago
    if (filtros.fuente && filtros.fuente !== 'todas') {
      resultado = resultado.filter((abono) => abono.fuente_pago.tipo === filtros.fuente)
    }

    // Filtro por mes (YYYY-MM)
    if (filtros.mes && filtros.mes !== 'todos') {
      resultado = resultado.filter((abono) => {
        const fechaMes = abono.fecha_abono.substring(0, 7) // 'YYYY-MM'
        return fechaMes === filtros.mes
      })
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
    setFiltros({ busqueda: '', fuente: 'todas', mes: 'todos' })
  }

  const fuentesUnicas = useMemo(() => {
    const set = new Set<string>()
    abonos.forEach((a) => { if (a.fuente_pago.tipo) set.add(a.fuente_pago.tipo) })
    return Array.from(set).sort()
  }, [abonos])

  const mesesDisponibles = useMemo(() => {
    const meses: { value: string; label: string }[] = []
    const ahora = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
      meses.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return meses
  }, [])

  return {
    abonos: abonosFiltrados,
    abonosCompletos: abonos,
    estadisticas,
    fuentesUnicas,
    mesesDisponibles,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    isLoading,
    error,
  }
}
