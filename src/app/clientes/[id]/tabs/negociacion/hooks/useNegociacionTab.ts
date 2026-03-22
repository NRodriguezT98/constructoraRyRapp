'use client'

/**
 * HOOK: useNegociacionTab
 *
 * Orquestador del tab "Negociación". Compone sub-hooks especializados:
 * - useDocumentosPendientesNeg → docs pendientes por fuente
 * - useRebalanceoMutation → mutación atómica (RPC)
 *
 * Queries propias: negociación activa, fuentes, tipos, requisitos, abonos.
 */

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { supabase } from '@/lib/supabase/client'
import { useNegociacionesQuery } from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { useCierreFinanciero } from '@/shared/hooks/useCierreFinanciero'

import { useDocumentosPendientesNeg } from './useDocumentosPendientesNeg'
import { useRebalanceoMutation } from './useRebalanceoMutation'

/**
 * @deprecated Use `getFuenteColorClasses` from `@/shared/constants/fuentes-pago.constants`
 */
export { getFuenteColorClasses as getFuenteColor } from '@/shared/constants/fuentes-pago.constants'

// ============================================
// CONSTANTS
// ============================================

export const MOTIVOS_AJUSTE = [
  'Reducción de crédito bancario',
  'Mejora de crédito bancario',
  'Ingreso de subsidio',
  'Retiro de subsidio',
  'Ajuste de cuota inicial',
  'Cambio de entidad financiera',
  'Corrección de datos',
  'Otro',
] as const

export type MotivoAjuste = (typeof MOTIVOS_AJUSTE)[number]

// ============================================
// TYPES
// ============================================

export interface AjusteLocal {
  id: string
  tipo: string
  montoOriginal: number
  montoEditable: number
  entidad: string
  entidadEditable: string
  paraEliminar: boolean
  /** Monto ya recibido (para restricciones de edición) */
  monto_recibido: number
  /** Capital para cierre (créditos) */
  capital_para_cierre: number | null
  /** Si el crédito constructora ya tiene plan de cuotas */
  tienePlanCuotas: boolean
}

export interface FuAlteNueva {
  tipo: string
  monto: number
  entidad: string
}

export interface DatosRebalanceo {
  ajustes: AjusteLocal[]
  nuevas: FuAlteNueva[]
  motivo: string
  notas: string
}

// ============================================
// HOOK
// ============================================

interface UseNegociacionTabProps {
  cliente: Cliente
}

export function useNegociacionTab({ cliente }: UseNegociacionTabProps) {
  const { isLoading: permisosLoading, rol } = usePermisosQuery()
  const isAdmin = !permisosLoading && rol === 'Administrador'

  // ─── Negociación activa ──────────────────────────────────────────────────
  const { negociaciones, isLoading: isLoadingNeg } = useNegociacionesQuery({
    clienteId: cliente.id,
  })

  const negociacion = useMemo(
    () => negociaciones.find((n) => n.estado === 'Activa') ?? negociaciones[0] ?? null,
    [negociaciones],
  )

  // Valor total a pagar — calculado por trigger en BD
  // Incluye: (valor_negociado - descuento) + gastos_notariales + recargo_esquinera
  const valorVivienda = useMemo(() => {
    if (!negociacion) return 0
    return (negociacion as any).valor_total_pagar ?? negociacion.valorFinal ?? 0
  }, [negociacion])

  // ─── Fuentes de pago ────────────────────────────────────────────────────
  const {
    data: fuentesPago = [],
    isLoading: isLoadingFuentes,
    refetch: refetchFuentes,
  } = useQuery({
    queryKey: ['fuentes-pago-neg-tab', negociacion?.id],
    queryFn: () => fuentesPagoService.obtenerFuentesPagoNegociacion(negociacion!.id),
    enabled: !!negociacion?.id,
    staleTime: 30_000,
  })

  // ─── Tipos disponibles (para agregar fuentes) ──────────────────────────
  const { data: tiposFuentes = [] } = useQuery({
    queryKey: ['tipos-fuentes-pago'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tipos_fuentes_pago')
        .select('nombre, icono, color, descripcion, requiere_entidad')
        .eq('activo', true)
        .order('orden')
      return (data ?? []) as {
        nombre: string; icono: string; color: string
        descripcion: string; requiere_entidad: boolean
      }[]
    },
    staleTime: 5 * 60_000,
  })

  const tiposDisponibles = useMemo(() => {
    const usados = new Set(fuentesPago.map((f) => f.tipo))
    return tiposFuentes.filter((t) => !usados.has(t.nombre as any))
  }, [tiposFuentes, fuentesPago])

  // ─── Requisitos obligatorios por tipo (para warnings del modal) ─────────
  const { data: requisitosConfig = [] } = useQuery({
    queryKey: ['requisitos-fuentes-pago-config-obligatorios'],
    queryFn: async () => {
      const { data } = await supabase
        .from('requisitos_fuentes_pago_config')
        .select('tipo_fuente, titulo')
        .eq('activo', true)
        .eq('nivel_validacion', 'DOCUMENTO_OBLIGATORIO')
      return (data ?? []) as { tipo_fuente: string; titulo: string }[]
    },
    staleTime: 10 * 60_000,
  })

  const requisitosMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const req of requisitosConfig) {
      const list = map.get(req.tipo_fuente) ?? []
      list.push(req.titulo)
      map.set(req.tipo_fuente, list)
    }
    return map
  }, [requisitosConfig])

  // ─── Documentos pendientes (sub-hook) ──────────────────────────────────
  const docsPendientes = useDocumentosPendientesNeg({
    clienteId: cliente.id,
    negociacionId: negociacion?.id,
  })

  // ─── Abonos recientes ──────────────────────────────────────────────────
  const { data: abonos = [], isLoading: isLoadingAbonos } = useQuery({
    queryKey: ['abonos-recientes-neg', negociacion?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('abonos_historial')
        .select('id, monto, fecha_abono, metodo_pago, numero_referencia, fuente_pago_id')
        .eq('negociacion_id', negociacion!.id)
        .order('fecha_abono', { ascending: false })
        .limit(5)
      return data ?? []
    },
    enabled: !!negociacion?.id,
    staleTime: 30_000,
  })

  const totalAbonado = useMemo(() => abonos.reduce((s, a) => s + (a.monto ?? 0), 0), [abonos])

  // ─── Balance (shared hook — single source of truth) ─────────────────────
  const { totalParaCierre: totalFuentes, diferencia, estaBalanceado } =
    useCierreFinanciero(fuentesPago, valorVivienda)

  // ─── Ordenar fuentes según el orden definido en el admin ───────────────
  const fuentesOrdenadas = useMemo(() => {
    if (!tiposFuentes.length || !fuentesPago.length) return fuentesPago as FuentePago[]
    const orderMap = new Map(tiposFuentes.map((t, i) => [t.nombre, i]))
    return [...fuentesPago].sort((a, b) => {
      const oa = orderMap.get(a.tipo) ?? 999
      const ob = orderMap.get(b.tipo) ?? 999
      return oa - ob
    }) as FuentePago[]
  }, [fuentesPago, tiposFuentes])

  // ─── Rebalanceo mutation (sub-hook, RPC atómica) ───────────────────────
  const rebalanceo = useRebalanceoMutation({
    negociacionId: negociacion?.id,
    clienteId: cliente.id,
    valorVivienda,
  })

  return {
    // Data
    negociacion,
    valorVivienda,
    fuentesPago: fuentesOrdenadas,
    abonos,
    totalAbonado,
    totalFuentes,
    diferencia,
    estaBalanceado,
    tiposDisponibles,
    tiposFuentes,
    requisitosMap,

    // Estado
    isLoading: isLoadingNeg || isLoadingFuentes,
    isLoadingAbonos,
    isAdmin,

    // Documentos pendientes (delegado a sub-hook)
    ...docsPendientes,

    // Rebalanceo (delegado a sub-hook)
    ...rebalanceo,

    // Actions
    refetchFuentes,
  }
}
