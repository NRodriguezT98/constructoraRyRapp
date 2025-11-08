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

import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'

export interface FuentePago {
  id?: string
  tipo: 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
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
  const [guardando, setGuardando] = useState(false)
  const [subiendoArchivo, setSubiendoArchivo] = useState<string | null>(null)
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
          entidad: f.entidad,
          numero_referencia: f.numero_referencia,
          carta_aprobacion_url: f.carta_aprobacion_url,
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
   */
  const calcularTotales = () => {
    const total = fuentesPago.reduce((sum, f) => sum + (f.monto_aprobado || 0), 0)
    const porcentaje = valorTotal > 0 ? (total / valorTotal) * 100 : 0
    const diferencia = valorTotal - total

    setTotales({ total, porcentaje, diferencia })
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
   */
  const eliminarFuente = async (index: number) => {
    const fuente = fuentesPago[index]

    // Si tiene ID, eliminar de la BD
    if (fuente.id) {
      try {
        await fuentesPagoService.eliminarFuentePago(fuente.id)
      } catch (err: any) {
        setError(`Error eliminando fuente: ${err.message}`)
        return
      }
    }

    // Eliminar del estado
    setFuentesPago(fuentesPago.filter((_, i) => i !== index))
    setError(null)
  }

  /**
   * Subir carta de aprobación o asignación
   */
  const subirCartaAprobacion = async (
    fuenteId: string,
    archivo: File,
    tipoDocumento: 'aprobacion' | 'asignacion'
  ) => {
    try {
      setSubiendoArchivo(fuenteId)
      setError(null)

      const url = await fuentesPagoService.subirCartaAprobacion({
        fuentePagoId: fuenteId,
        archivo,
        tipoDocumento,
      })

      // Actualizar la fuente en el estado local
      setFuentesPago((prev) =>
        prev.map((f) =>
          f.id === fuenteId
            ? {
                ...f,
                [tipoDocumento === 'aprobacion'
                  ? 'carta_aprobacion_url'
                  : 'carta_asignacion_url']: url,
              }
            : f
        )
      )

      alert('✅ Documento subido correctamente')
    } catch (err: any) {
      console.error('Error subiendo documento:', err)
      setError(`Error subiendo documento: ${err.message}`)
    } finally {
      setSubiendoArchivo(null)
    }
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

      // Validar entidades requeridas (inyectar desde componente)
      for (const fuente of fuentesPago) {
        // La validación específica se puede pasar como parámetro si es necesario
        if (
          (fuente.tipo === 'Crédito Hipotecario' || fuente.tipo === 'Subsidio Caja Compensación') &&
          !fuente.entidad?.trim()
        ) {
          setError(`La fuente "${fuente.tipo}" requiere especificar la entidad`)
          return
        }
      }

      // ⚠️ Validar documentos requeridos
      for (const fuente of fuentesPago) {
        if (fuente.tipo === 'Crédito Hipotecario' && !fuente.carta_aprobacion_url) {
          setError('Crédito Hipotecario requiere carta de aprobación del banco')
          return
        }
        if (fuente.tipo === 'Subsidio Caja Compensación' && !fuente.carta_aprobacion_url) {
          setError('Subsidio Caja Compensación requiere carta de aprobación')
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
          await fuentesPagoService.crearFuentePago({
            negociacion_id: negociacionId,
            tipo: fuente.tipo,
            monto_aprobado: fuente.monto_aprobado,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })
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
    guardando,
    subiendoArchivo,
    error,
    totales,

    // Valores computados
    cierreCompleto,
    porcentajeCubierto,

    // Funciones
    agregarFuente,
    actualizarFuente,
    eliminarFuente,
    subirCartaAprobacion,
    guardarFuentes,
    cargarFuentesPago, // Exportar por si se necesita refrescar manualmente
  }
}
