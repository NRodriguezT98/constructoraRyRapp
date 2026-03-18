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
import { documentosPendientesKeys } from '@/modules/clientes/types/documentos-pendientes.types'
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

/**
 * Maps generic color tokens (from tipos_fuentes_pago.color in BD) → Tailwind classes.
 * New type sources added from BD automatically work as long as they use a token that exists here.
 * This is a UI-only mapping: business logic (requiere_entidad, permite_multiples) lives in the DB.
 */
export const COLOR_TOKEN_CLASSES: Record<string, { barra: string; badge: string; texto: string }> = {
  blue: {
    barra: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    texto: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    barra: 'bg-emerald-500',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    texto: 'text-emerald-600 dark:text-emerald-400',
  },
  green: {
    barra: 'bg-green-500',
    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    texto: 'text-green-600 dark:text-green-400',
  },
  purple: {
    barra: 'bg-purple-500',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    texto: 'text-purple-600 dark:text-purple-400',
  },
  amber: {
    barra: 'bg-amber-500',
    badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    texto: 'text-amber-600 dark:text-amber-400',
  },
  orange: {
    barra: 'bg-orange-500',
    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    texto: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    barra: 'bg-red-500',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    texto: 'text-red-600 dark:text-red-400',
  },
  pink: {
    barra: 'bg-pink-500',
    badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    texto: 'text-pink-600 dark:text-pink-400',
  },
  indigo: {
    barra: 'bg-indigo-500',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    texto: 'text-indigo-600 dark:text-indigo-400',
  },
  cyan: {
    barra: 'bg-cyan-500',
    badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    texto: 'text-cyan-600 dark:text-cyan-400',
  },
  yellow: {
    barra: 'bg-yellow-500',
    badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    texto: 'text-yellow-600 dark:text-yellow-400',
  },
  teal: {
    barra: 'bg-teal-500',
    badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    texto: 'text-teal-600 dark:text-teal-400',
  },
}

const COLOR_FALLBACK = {
  barra: 'bg-cyan-500',
  badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  texto: 'text-cyan-600 dark:text-cyan-400',
}

/** Accepts a color token from tipos_fuentes_pago.color (e.g. 'blue', 'emerald', 'amber', ...) */
export const getFuenteColor = (colorToken?: string) =>
  COLOR_TOKEN_CLASSES[colorToken ?? ''] ?? COLOR_FALLBACK

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
        .select('nombre, icono, color, descripcion, requiere_entidad')
        .eq('activo', true)
        .order('orden')
      return (data ?? []) as { nombre: string; icono: string; color: string; descripcion: string; requiere_entidad: boolean }[]
    },
    staleTime: 5 * 60_000,
  })

  const tiposDisponibles = useMemo(() => {
    const usados = new Set(fuentesPago.map((f) => f.tipo))
    return tiposFuentes.filter((t) => !usados.has(t.nombre as any))
  }, [tiposFuentes, fuentesPago])

  // ============================================
  // QUERY: Requisitos obligatorios por tipo de fuente (para warnings del modal)
  // ============================================

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

  /** Mapa tipo_fuente → lista de títulos de documentos obligatorios */
  const requisitosMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const req of requisitosConfig) {
      const list = map.get(req.tipo_fuente) ?? []
      list.push(req.titulo)
      map.set(req.tipo_fuente, list)
    }
    return map
  }, [requisitosConfig])

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
      mapa[key].docs.push({ nombre: doc.tipo_documento ?? '', obligatorio: esObligatorio })
    }

    return mapa
  }, [documentosPendientesRaw])

  /** Docs compartidos del cliente: aplican al proceso general, NO a una fuente específica */
  const pendientesCompartidos = useMemo<{ nombre: string; obligatorio: boolean }[]>(() => {
    return documentosPendientesRaw
      .filter((d) => !d.fuente_pago_id)
      .map((d) => ({
        nombre: d.tipo_documento ?? '',
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

      // 1. Invalidar documentos existentes para fuentes que cambiaron (Bug 1 fix)
      //    La vista considera un doc como "done" si existe en documentos_cliente con estado='activo'.
      //    Si el monto subió o la entidad cambió en una fuente que requiere docs,
      //    la carta vieja ya no es válida → se archiva para que la vista la vea como pendiente.
      const tiposFuentesMap = new Map(tiposFuentes.map((t) => [t.nombre, t]))
      for (const ajuste of ajustes) {
        if (ajuste.paraEliminar) continue
        const requiereEntidad = tiposFuentesMap.get(ajuste.tipo)?.requiere_entidad ?? false
        if (!requiereEntidad) continue
        const cambioEntidad = ajuste.entidadEditable !== ajuste.entidad
        const aumentoMonto = ajuste.montoEditable > ajuste.montoOriginal
        if (!cambioEntidad && !aumentoMonto) continue

        // Archivar documentos activos vinculados a esta fuente
        const razon = cambioEntidad && aumentoMonto
          ? `Invalidado: entidad cambió (${ajuste.entidad} → ${ajuste.entidadEditable}) y monto aumentó`
          : cambioEntidad
          ? `Invalidado: entidad cambió (${ajuste.entidad} → ${ajuste.entidadEditable})`
          : `Invalidado: monto aumentó de $${ajuste.montoOriginal.toLocaleString('es-CO')} a $${ajuste.montoEditable.toLocaleString('es-CO')}`

        await supabase
          .from('documentos_cliente')
          .update({
            estado: 'archivado',
            razon_obsolescencia: razon,
            fecha_obsolescencia: new Date().toISOString(),
          })
          .eq('fuente_pago_relacionada', ajuste.id)
          .eq('estado', 'activo')

        // Limpiar carta_asignacion_url de la fuente (campo legacy de tracking)
        await supabase
          .from('fuentes_pago')
          .update({ carta_asignacion_url: null })
          .eq('id', ajuste.id)
      }

      // 2. Actualizar montos/entidades de fuentes existentes
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

      // 3. Agregar fuentes nuevas
      for (const nueva of nuevas) {
        await fuentesPagoService.crearFuentePago({
          negociacion_id: negociacion!.id,
          tipo: nueva.tipo as any,
          monto_aprobado: nueva.monto,
          entidad: nueva.entidad || undefined,
        })
      }

      // 4. Audit log
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
      // Invalidar fuentes del tab negociación
      queryClient.invalidateQueries({ queryKey: ['fuentes-pago-neg-tab', negociacion?.id] })
      // Bug 2 fix: invalidar cache de documentos pendientes del banner (tab Documentos)
      queryClient.invalidateQueries({ queryKey: documentosPendientesKeys.byCliente(cliente.id) })
      // Bug 3 fix: invalidar cache de docs pendientes del propio tab de negociación
      queryClient.invalidateQueries({ queryKey: ['docs-pendientes-neg-tab', cliente.id] })
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
    tiposFuentes,
    requisitosMap,

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
