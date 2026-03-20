/**
 * Hook: useConfigurarFuentesPago
 *
 * Gestiona toda la lógica de configuración de fuentes de pago para una negociación.
 *
 * Responsabilidades:
 * - Cargar fuentes de pago existentes desde la BD
 * - Calcular totales y validar cierre financiero
 * - Agregar, actualizar y eliminar fuentes
 * - Subir documentos (cartas de aprobación)
 * - Guardar cambios en la BD
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import {
    cargarTiposFuentesPagoActivas,
    type TipoFuentePagoCatalogo,
} from '@/modules/clientes/services/tipos-fuentes-pago.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { crearCredito } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { crearCuotasCredito } from '@/modules/fuentes-pago/services/cuotas-credito.service'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'
import { calcularCierreFinanciero } from '@/shared/hooks/useCierreFinanciero'

export interface FuentePago {
  id?: string
  tipo: TipoFuentePago
  monto_aprobado: number
  /** Solo para créditos: capital sin intereses (para cierre financiero correcto) */
  capital_para_cierre?: number
  entidad?: string
  numero_referencia?: string
  carta_asignacion_url?: string
  /** Solo para créditos: parámetros del crédito (capital, tasa, cuotas, fecha) */
  parametrosCredito?: ParametrosCredito | null
}

interface Totales {
  total: number
  porcentaje: number
  diferencia: number
}

interface UseConfigurarFuentesPagoProps {
  negociacionId: string
  valorTotal: number
  onFuentesActualizadas?: () => void
}

export function useConfigurarFuentesPago({
  negociacionId,
  valorTotal,
  onFuentesActualizadas,
}: UseConfigurarFuentesPagoProps) {
  // =====================================================
  // ESTADO
  // =====================================================
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoTipos, setCargandoTipos] = useState(true)
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoFuentePagoCatalogo[]>([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totales, setTotales] = useState<Totales>({
    total: 0,
    porcentaje: 0,
    diferencia: 0,
  })

  // =====================================================
  // EFECTOS
  // =====================================================

  /**
   * Cargar tipos de fuentes activos desde catálogo (una sola vez)
   */
  useEffect(() => {
    const cargarTipos = async () => {
      const { data } = await cargarTiposFuentesPagoActivas()
      if (data) setTiposDisponibles(data)
      setCargandoTipos(false)
    }
    cargarTipos()
  }, [])

  /**
   * Cargar fuentes de pago existentes al montar o cambiar negociacionId
   */
  useEffect(() => {
    cargarFuentesPago()
  }, [negociacionId])

  /**
   * Calcular totales cuando cambian las fuentes o el valorTotal
   */
  useEffect(() => {
    calcularTotales()
  }, [fuentesPago, valorTotal])

  // =====================================================
  // FUNCIONES DE LÓGICA
  // =====================================================

  /**
   * Cargar fuentes de pago desde la BD
   */
  const cargarFuentesPago = async () => {
    try {
      setCargando(true)
      setError(null)
      const data = await fuentesPagoService.obtenerFuentesPagoNegociacion(negociacionId)
      setFuentesPago(
        data.map((f: any) => ({
          id: f.id,
          tipo: f.tipo,
          monto_aprobado: f.monto_aprobado || 0,
          capital_para_cierre: f.capital_para_cierre ?? undefined,
          entidad: f.entidad,
          numero_referencia: f.numero_referencia,
          carta_asignacion_url: f.carta_asignacion_url,
        }))
      )
    } catch (err: any) {
      console.error('Error cargando fuentes:', err)
      setError(`Error cargando fuentes de pago: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  /**
   * Calcular totales: monto total, porcentaje cubierto, diferencia
   *
   * Uses shared calcularCierreFinanciero — capital_para_cierre is preferred
   * over monto_aprobado to avoid interest inflating the total.
   */
  const calcularTotales = () => {
    const cierre = calcularCierreFinanciero(fuentesPago, valorTotal)

    setTotales({
      total: cierre.totalParaCierre,
      porcentaje: cierre.porcentajeCubierto,
      diferencia: cierre.diferencia,
    })
  }

  /**
   * Agregar una nueva fuente de pago
   */
  const agregarFuente = (tipo: FuentePago['tipo'], permiteMultiples: boolean) => {
    // Verificar si ya existe este tipo (excepto Cuota Inicial que puede repetirse)
    if (!permiteMultiples) {
      const existe = fuentesPago.some((f) => f.tipo === tipo)
      if (existe) {
        setError(`Ya existe una fuente de tipo "${tipo}"`)
        return
      }
    }

    setFuentesPago([
      ...fuentesPago,
      {
        tipo,
        monto_aprobado: 0,
        entidad: '',
        numero_referencia: '',
      },
    ])
    setError(null)
  }

  /**
   * Actualizar un campo de una fuente existente
   */
  const actualizarFuente = (index: number, campo: keyof FuentePago, valor: any) => {
    const nuevasFuentes = [...fuentesPago]
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor }
    setFuentesPago(nuevasFuentes)
  }

  /**
   * Eliminar una fuente de pago
   * Marca como inactiva en lugar de eliminar permanentemente
   */
  const eliminarFuente = async (index: number) => {
    const fuente = fuentesPago[index]

    // Si tiene ID, inactivar en la BD
    if (fuente.id) {
      try {
        // Usar inactivarFuentePago en lugar de eliminar
        await fuentesPagoService.inactivarFuentePago(
          fuente.id,
          'Fuente eliminada por el usuario'
        )
      } catch (err: any) {
        // Mostrar error amigable
        if (err.message.includes('ya ha recibido')) {
          setError(
            `⚠️ No se puede eliminar esta fuente porque ya ha recibido dinero. ` +
            `Para mantener la integridad del historial de abonos, esta fuente debe permanecer activa.`
          )
        } else {
          setError(`Error eliminando fuente: ${err.message}`)
        }
        return
      }
    }

    // Eliminar del estado local
    setFuentesPago(fuentesPago.filter((_, i) => i !== index))
    setError(null)
  }

  /**
   * Validar y guardar todas las fuentes de pago
   */
  const guardarFuentes = async () => {
    try {
      setGuardando(true)
      setError(null)

      // Validar que todas las fuentes tengan monto > 0
      const invalidas = fuentesPago.filter((f) => !f.monto_aprobado || f.monto_aprobado <= 0)
      if (invalidas.length > 0) {
        setError('Todas las fuentes deben tener un monto aprobado mayor a 0')
        return
      }

      // Cargar configuración de tipos desde BD para validar sin hardcodear nombres
      const { data: tiposConfig } = await supabase
        .from('tipos_fuentes_pago')
        .select('nombre, requiere_entidad')
      const tiposMap = new Map((tiposConfig ?? []).map((t) => [t.nombre, t]))

      // Validar entidades requeridas usando la flag de BD
      for (const fuente of fuentesPago) {
        const config = tiposMap.get(fuente.tipo)
        if (config?.requiere_entidad && !fuente.entidad?.trim()) {
          setError(`La fuente "${fuente.tipo}" requiere especificar la entidad`)
          return
        }
      }

      // Guardar cada fuente
      for (const fuente of fuentesPago) {
        if (fuente.id) {
          // Actualizar existente
          await fuentesPagoService.actualizarFuentePago(fuente.id, {
            monto_aprobado: fuente.monto_aprobado,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })
        } else {
          // Crear nueva
          const nuevaFuente = await fuentesPagoService.crearFuentePago({
            negociacion_id: negociacionId,
            tipo: fuente.tipo,
            monto_aprobado: fuente.monto_aprobado,
            capital_para_cierre: fuente.capital_para_cierre,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })

          // Si el tipo genera cuotas y hay parámetros de crédito, crear tabla de amortización
          const tipoConfig = tiposDisponibles.find(t => t.nombre === fuente.tipo)
          if (tipoConfig?.logica_negocio?.genera_cuotas && fuente.parametrosCredito) {
            const calculo = calcularTablaAmortizacion(fuente.parametrosCredito)

            // Crear registro en creditos_constructora
            const { error: eCred } = await crearCredito({
              fuente_pago_id: nuevaFuente.id,
              capital: fuente.parametrosCredito.capital,
              tasa_mensual: fuente.parametrosCredito.tasaMensual,
              num_cuotas: fuente.parametrosCredito.numCuotas,
              fecha_inicio: fuente.parametrosCredito.fechaInicio.toISOString().split('T')[0],
              valor_cuota: calculo.valorCuotaMensual,
              interes_total: calculo.interesTotal,
              monto_total: calculo.montoTotal,
              tasa_mora_diaria: fuente.parametrosCredito.tasaMoraDiaria ?? 0.001,
            })
            if (eCred) throw eCred

            // Crear cuotas de amortización
            const { error: eCuotas } = await crearCuotasCredito(nuevaFuente.id, calculo.cuotas)
            if (eCuotas) throw eCuotas
          }
        }
      }

      // Recargar fuentes
      await cargarFuentesPago()

      // Notificar actualización
      onFuentesActualizadas?.()

      alert('✅ Fuentes de pago guardadas correctamente')
    } catch (err: any) {
      console.error('Error guardando fuentes:', err)
      setError(`Error guardando fuentes: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  const cierreCompleto = Math.abs(totales.diferencia) < 1 // Margen de error de 1 peso
  const porcentajeCubierto = totales.porcentaje

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    fuentesPago,
    cargando,
    cargandoTipos,
    tiposDisponibles,
    guardando,
    error,
    totales,

    // Valores computados
    cierreCompleto,
    porcentajeCubierto,

    // Funciones
    agregarFuente,
    actualizarFuente,
    eliminarFuente,
    guardarFuentes,
    cargarFuentesPago,
  }
}
