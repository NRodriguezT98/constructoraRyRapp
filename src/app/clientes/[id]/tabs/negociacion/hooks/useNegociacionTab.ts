'use client'

/**
 * HOOK: useNegociacionTab
 *
 * Toda la lógica del tab unificado "Negociación":
 * - Plan financiero (fuentes de pago)
 * - Balance equation en tiempo real
 * - Edición batch (Admin only) con audit log
 * - Abonos recientes
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { useNegociacionesQuery } from '@/modules/clientes/hooks/useNegociacionesQuery'
import type { FuentePago } from '@/modules/clientes/services/fuentes-pago.service'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import type { Cliente } from '@/modules/clientes/types'
import { usePermissions } from '@/modules/usuarios/hooks/usePermissions'
import { auditService } from '@/services/audit.service'

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

export const COLORES_FUENTE: Record<string, { barra: string; badge: string; texto: string }> = {
  'Cuota Inicial': {
    barra: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    texto: 'text-blue-600 dark:text-blue-400',
  },
  'Crédito Hipotecario': {
    barra: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    texto: 'text-emerald-600 dark:text-emerald-400',
  },
  'Subsidio Mi Casa Ya': {
    barra: 'bg-purple-500',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    texto: 'text-purple-600 dark:text-purple-400',
  },
  'Subsidio Caja Compensación': {
    barra: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    texto: 'text-amber-600 dark:text-amber-400',
  },
}

export const getFuenteColor = (tipo: string) =>
  COLORES_FUENTE[tipo] ?? {
    barra: 'bg-cyan-500',
    badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    texto: 'text-cyan-600 dark:text-cyan-400',
  }

// ============================================
// TYPES
// ============================================

export interface AjusteLocal {
  id: string
  tipo: string
  montoOriginal: number
  montoEditable: number
  entidad: string         // valor original (solo lectura)
  entidadEditable: string // valor editable
  paraEliminar: boolean
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
  const queryClient = useQueryClient()
  const { permisosLoading, rol } = usePermissions()
  const isAdmin = !permisosLoading && rol === 'Administrador'

  // ============================================
  // QUERY: Negociación activa
  // ============================================

  const { negociaciones, isLoading: isLoadingNeg } = useNegociacionesQuery({
    clienteId: cliente.id,
  })

  const negociacion = useMemo(
    () => negociaciones.find((n) => n.estado === 'Activa') ?? negociaciones[0] ?? null,
    [negociaciones]
  )

  const valorVivienda = negociacion?.valorFinal ?? 0

  // ============================================
  // QUERY: Fuentes de pago
  // ============================================

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

  // ============================================
  // QUERY: Tipos disponibles (para agregar fuentes)
  // ============================================

  const { data: tiposFuentes = [] } = useQuery({
    queryKey: ['tipos-fuentes-pago'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tipos_fuentes_pago')
        .select('nombre, icono, color, descripcion')
        .eq('activo', true)
        .order('orden')
      return (data ?? []) as { nombre: string; icono: string; color: string; descripcion: string }[]
    },
    staleTime: 5 * 60_000,
  })

  const tiposDisponibles = useMemo(() => {
    const usados = new Set(fuentesPago.map((f) => f.tipo))
    return tiposFuentes.filter((t) => !usados.has(t.nombre as any))
  }, [tiposFuentes, fuentesPago])

  // ============================================
  // QUERY: Documentos pendientes (desde vista en tiempo real)
  // ============================================

  const { data: documentosPendientesRaw = [] } = useQuery({
    queryKey: ['docs-pendientes-neg-tab', cliente.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vista_documentos_pendientes_fuentes')
        .select('fuente_pago_id,tipo_documento,nivel_validacion,tipo_fuente,entidad')
        .eq('cliente_id', cliente.id)

      if (error) throw error
      return data ?? []
    },
    enabled: !!negociacion?.id,
    staleTime: 30_000,
  })

  /**
   * Tipos para docs pendientes
   * - pendientesPorFuente: solo docs ESPECÍFICOS de cada fuente (fuente_pago_id != null)
   * - pendientesCompartidos: docs COMPARTIDOS del cliente (fuente_pago_id = null, ej: Boleta de Registro)
   */

  /** Mapa: fuente_pago_id → docs específicos de esa fuente (sin compartidos) */
  const pendientesPorFuente = useMemo<
    Record<string, { total: number; obligatorios: number; docs: { nombre: string; obligatorio: boolean }[] }>
  >(() => {
    if (!documentosPendientesRaw.length) return {}

    const mapa: Record<string, { total: number; obligatorios: number; docs: { nombre: string; obligatorio: boolean }[] }> = {}

    // Solo docs ESPECÍFICOS por fuente (fuente_pago_id != null)
    for (const doc of documentosPendientesRaw) {
      if (!doc.fuente_pago_id) continue
      const key = doc.fuente_pago_id
      if (!mapa[key]) mapa[key] = { total: 0, obligatorios: 0, docs: [] }
      const esObligatorio = doc.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
      mapa[key].total++
      if (esObligatorio) mapa[key].obligatorios++
      mapa[key].docs.push({ nombre: doc.tipo_documento, obligatorio: esObligatorio })
    }

    return mapa
  }, [documentosPendientesRaw])

  /** Docs compartidos del cliente: aplican al proceso general, NO a una fuente específica */
  const pendientesCompartidos = useMemo<{ nombre: string; obligatorio: boolean }[]>(() => {
    return documentosPendientesRaw
      .filter((d) => !d.fuente_pago_id)
      .map((d) => ({
        nombre: d.tipo_documento,
        obligatorio: d.nivel_validacion === 'DOCUMENTO_OBLIGATORIO',
      }))
  }, [documentosPendientesRaw])

  /** Total real: específicos + compartidos (la vista ya los deduplica) */
  const totalDocsPendientes = useMemo(
    () => documentosPendientesRaw.length,
    [documentosPendientesRaw]
  )

  const totalDocsObligatoriosPendientes = useMemo(
    () =>
      documentosPendientesRaw.filter((d) => d.nivel_validacion === 'DOCUMENTO_OBLIGATORIO').length,
    [documentosPendientesRaw]
  )

  // ============================================
  // QUERY: Abonos recientes
  // ============================================

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

  // ============================================
  // COMPUTED: Balance
  // ============================================

  const totalFuentes = useMemo(
    () => fuentesPago.reduce((s, f) => s + (f.monto_aprobado ?? 0), 0),
    [fuentesPago]
  )

  const diferencia = valorVivienda - totalFuentes
  const estaBalanceado = Math.abs(diferencia) < 1

  // ============================================
  // MODAL STATE
  // ============================================

  const [modalRebalancearOpen, setModalRebalancearOpen] = useState(false)
  const openRebalancear = useCallback(() => setModalRebalancearOpen(true), [])
  const closeRebalancear = useCallback(() => setModalRebalancearOpen(false), [])

  // ============================================
  // MUTATION: Rebalancear plan financiero
  // ============================================

  const rebalancearMutation = useMutation({
    mutationFn: async ({ ajustes, nuevas, motivo, notas }: DatosRebalanceo) => {
      const datosPrevios = fuentesPago.map((f) => ({
        id: f.id,
        tipo: f.tipo,
        monto_aprobado: f.monto_aprobado,
      }))

      // 1. Actualizar montos de fuentes existentes
      for (const ajuste of ajustes) {
        if (ajuste.paraEliminar) {
          await supabase
            .from('fuentes_pago')
            .update({ estado_fuente: 'inactiva', estado: 'Inactiva' })
            .eq('id', ajuste.id)
        } else if (
          ajuste.montoEditable !== ajuste.montoOriginal ||
          ajuste.entidadEditable !== ajuste.entidad
        ) {
          await fuentesPagoService.actualizarFuentePago(ajuste.id, {
            monto_aprobado: ajuste.montoEditable,
            entidad: ajuste.entidadEditable || undefined,
          })
        }
      }

      // 2. Agregar fuentes nuevas
      for (const nueva of nuevas) {
        await fuentesPagoService.crearFuentePago({
          negociacion_id: negociacion!.id,
          tipo: nueva.tipo as any,
          monto_aprobado: nueva.monto,
          entidad: nueva.entidad || undefined,
        })
      }

      // 3. Audit log
      await auditService.registrarAccion({
        tabla: 'negociaciones',
        accion: 'UPDATE',
        registroId: negociacion!.id,
        datosAnteriores: { fuentes: datosPrevios },
        datosNuevos: {
          ajustados: ajustes.filter(
            (a) =>
              a.montoEditable !== a.montoOriginal ||
              a.entidadEditable !== a.entidad ||
              a.paraEliminar
          ),
          nuevas,
        },
        metadata: {
          motivo,
          notas: notas || null,
          valor_vivienda: valorVivienda,
          accion_tipo: 'rebalanceo_plan_financiero',
          cliente_id: cliente.id,
        },
        modulo: 'negociaciones',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuentes-pago-neg-tab', negociacion?.id] })
      toast.success('Plan financiero actualizado correctamente')
      closeRebalancear()
    },
    onError: () => {
      toast.error('Error al actualizar el plan financiero. Intenta nuevamente.')
    },
  })

  return {
    // Data
    negociacion,
    valorVivienda,
    fuentesPago: fuentesPago as FuentePago[],
    abonos,
    totalAbonado,
    totalFuentes,
    diferencia,
    estaBalanceado,
    tiposDisponibles,

    // Estado
    isLoading: isLoadingNeg || isLoadingFuentes,
    isLoadingAbonos,
    isRebalanceando: rebalancearMutation.isPending,
    isAdmin,

    // Modal
    modalRebalancearOpen,
    openRebalancear,
    closeRebalancear,

    // Documentos pendientes (vista en tiempo real)
    pendientesPorFuente,
    pendientesCompartidos,
    totalDocsPendientes,
    totalDocsObligatoriosPendientes,

    // Actions
    handleGuardarRebalanceo: rebalancearMutation.mutate,
    refetchFuentes,
  }
}
