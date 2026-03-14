/**
 * useAsignarViviendaV2
 *
 * Orquestador central del nuevo formulario acordeón.
 * Delega a sub-hooks existentes — no duplica lógica.
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useAsignarViviendaForm } from '@/modules/clientes/components/asignar-vivienda/hooks/useAsignarViviendaForm'
import { useFuentesPago } from '@/modules/clientes/components/asignar-vivienda/hooks/useFuentesPago'
import { useProyectosViviendas } from '@/modules/clientes/components/asignar-vivienda/hooks/useProyectosViviendas'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { useCrearNegociacion } from '@/modules/clientes/hooks/useCrearNegociacion'
import type { CrearFuentePagoDTO } from '@/modules/clientes/types'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'

interface UseAsignarViviendaV2Props {
  clienteId: string
  clienteSlug?: string // para redirect tras guardar
}

export function useAsignarViviendaV2({
  clienteId,
  clienteSlug,
}: UseAsignarViviendaV2Props) {
  const router = useRouter()

  // ─── Navegación ───────────────────────────────────────
  const [pasoActivo, setPasoActivo] = useState<1 | 2 | 3>(1)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])

  // ─── Sub-hooks existentes ──────────────────────────────
  const { register, errors, touchedFields, setValue, watch, trigger } =
    useAsignarViviendaForm({ currentStep: pasoActivo })

  const {
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId,
  } = useProyectosViviendas()

  const { data: tiposConCampos = [] } = useTiposFuentesConCampos()

  const { crearNegociacion, creando } = useCrearNegociacion()

  // ─── Valores observados ────────────────────────────────
  const aplicarDescuento = watch('aplicar_descuento')
  const descuentoAplicado = watch('descuento_aplicado') ?? 0
  const tipoDescuento = watch('tipo_descuento')
  const motivoDescuento = watch('motivo_descuento')
  const valorEscrituraPublica = watch('valor_escritura_publica')
  const notas = watch('notas')

  // ─── Vivienda seleccionada ─────────────────────────────
  const viviendaSeleccionada = useMemo(
    () => viviendas.find(v => v.id === viviendaId) ?? null,
    [viviendas, viviendaId]
  )

  const valorBase = viviendaSeleccionada?.valor_base ?? 0
  const gastosNotariales = viviendaSeleccionada?.gastos_notariales ?? 0
  const recargoEsquinera = viviendaSeleccionada?.recargo_esquinera ?? 0
  const valorTotal = useMemo(
    () =>
      Math.max(
        0,
        valorBase + gastosNotariales + recargoEsquinera - descuentoAplicado
      ),
    [valorBase, gastosNotariales, recargoEsquinera, descuentoAplicado]
  )

  // Sincronizar valor_negociado en RHF
  const prevValorTotal = useMemo(() => valorTotal, [valorTotal])
  useMemo(() => {
    setValue('valor_negociado', prevValorTotal)
  }, [prevValorTotal, setValue])

  // ─── Fuentes de pago ──────────────────────────────────
  const {
    cargandoTipos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    handleFuenteEnabledChange: _handleFuenteEnabledChange,
    handleFuenteConfigChange: _handleFuenteConfigChange,
  } = useFuentesPago({ valorTotal })

  // Adaptadores de nombres al spec
  const handleFuenteEnabledChange = _handleFuenteEnabledChange
  const handleFuenteConfigChange = _handleFuenteConfigChange

  // ─── Validación manual de fuentes ────────────────────
  const [erroresFuentes, setErroresFuentes] = useState<Record<string, string>>(
    {}
  )
  const [mostrarErroresFuentes, setMostrarErroresFuentes] = useState(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const validarFuentesManual = useCallback((): boolean => {
    const errores: Record<string, string> = {}
    fuentes
      .filter(f => f.enabled && f.tipo !== 'Cuota Inicial')
      .forEach(f => {
        if (!f.config?.entidad || f.config.entidad.trim() === '') {
          errores[f.tipo] = 'Entidad requerida'
        } else if (
          !f.config?.numero_referencia ||
          f.config.numero_referencia.trim() === ''
        ) {
          errores[f.tipo] = 'Número de referencia requerido'
        }
      })
    setErroresFuentes(errores)
    return Object.keys(errores).length === 0
  }, [fuentes])

  // ─── Validación por paso ──────────────────────────────
  const paso1Valido = useMemo(() => {
    const baseValido = !!viviendaId
    if (!aplicarDescuento) return baseValido
    return (
      baseValido &&
      descuentoAplicado > 0 &&
      !!tipoDescuento &&
      (motivoDescuento?.length ?? 0) >= 10
    )
  }, [
    viviendaId,
    aplicarDescuento,
    descuentoAplicado,
    tipoDescuento,
    motivoDescuento,
  ])

  const paso2Valido = sumaCierra && fuentes.some(f => f.enabled)

  // ─── Navegación ──────────────────────────────────────
  const irAPaso = useCallback(
    (paso: 1 | 2 | 3) => {
      // Solo permitir ir a pasos desbloqueados
      if (paso === 2 && !pasosCompletados.includes(1)) return
      if (paso === 3 && !pasosCompletados.includes(2)) return
      setPasoActivo(paso)
    },
    [pasosCompletados]
  )

  const handleContinuar = useCallback(async () => {
    if (pasoActivo === 1) {
      const valido = await trigger([
        'proyecto_id',
        'vivienda_id',
        'valor_negociado',
        'aplicar_descuento',
        'descuento_aplicado',
        'tipo_descuento',
        'motivo_descuento',
      ])
      if (!valido || !paso1Valido) return
      setPasosCompletados(prev => [...new Set([...prev, 1])])
      setPasoActivo(2)
      return
    }

    if (pasoActivo === 2) {
      if (!sumaCierra) {
        setMostrarErroresFuentes(true)
        return
      }
      const fuentesOk = validarFuentesManual()
      if (!fuentesOk) {
        setMostrarErroresFuentes(true)
        return
      }
      setPasosCompletados(prev => [...new Set([...prev, 2])])
      setPasoActivo(3)
      return
    }

    // Paso 3: guardar
    if (pasoActivo === 3) {
      setErrorApi(null)

      const fuentesDTO: CrearFuentePagoDTO[] = fuentes
        .filter(
          (f): f is FuentePagoConfiguracion & { config: FuentePagoConfig } =>
            f.enabled && f.config !== null
        )
        .map(f => {
          const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const monto = obtenerMonto(f.config, camposConfig)
          return {
            tipo: f.tipo,
            monto_aprobado: monto,
            entidad: f.config.entidad || undefined,
            numero_referencia: f.config.numero_referencia || undefined,
            permite_multiples_abonos:
              f.config.permite_multiples_abonos ?? false,
          }
        })

      const result = await crearNegociacion({
        cliente_id: clienteId,
        vivienda_id: viviendaId,
        valor_negociado: valorTotal,
        descuento_aplicado: descuentoAplicado,
        tipo_descuento: tipoDescuento || undefined,
        motivo_descuento: motivoDescuento || undefined,
        valor_escritura_publica: valorEscrituraPublica ?? undefined,
        notas: notas ?? '',
        fuentes_pago: fuentesDTO,
      })

      if (!result) {
        setErrorApi(
          'Error al guardar la negociación. Verifica que la vivienda no esté ya asignada e intenta de nuevo.'
        )
        return
      }

      router.push(`/clientes/${clienteSlug ?? clienteId}`)
    }
  }, [
    pasoActivo,
    paso1Valido,
    sumaCierra,
    validarFuentesManual,
    fuentes,
    tiposConCampos,
    crearNegociacion,
    clienteId,
    clienteSlug,
    viviendaId,
    valorTotal,
    descuentoAplicado,
    tipoDescuento,
    motivoDescuento,
    valorEscrituraPublica,
    notas,
    trigger,
    router,
  ])

  const handleCancelar = useCallback(() => {
    router.push(`/clientes/${clienteSlug ?? clienteId}`)
  }, [router, clienteSlug, clienteId])

  // Limpiar errorApi al modificar campos
  const clearErrorApi = useCallback(() => setErrorApi(null), [])

  return {
    // Navegación
    pasoActivo,
    pasosCompletados,
    irAPaso,

    // RHF
    register,
    errors,
    touchedFields,
    setValue,
    watch,

    // Proyecto / Vivienda
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    proyectoSeleccionado,
    viviendaId,
    viviendaSeleccionada,
    setProyectoSeleccionado,
    setViviendaId,

    // Valores calculados
    valorBase,
    gastosNotariales,
    recargoEsquinera,
    descuentoAplicado,
    valorTotal,

    // Fuentes
    cargandoTipos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    erroresFuentes,
    mostrarErroresFuentes,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Validación
    paso1Valido,
    paso2Valido,

    // Guardado
    handleContinuar,
    handleCancelar,
    creando,
    errorApi,
    clearErrorApi,
  }
}
