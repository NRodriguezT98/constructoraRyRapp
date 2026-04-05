'use client'

import { useQuery } from '@tanstack/react-query'

import { auditoriasService } from '../services/auditorias.service'
import type { FiltrosAuditoria } from '../types'

const REGISTROS_POR_PAGINA = 50

export const auditoriasKeys = {
  all: ['auditorias'] as const,
  lists: () => [...auditoriasKeys.all, 'list'] as const,
  list: (filtros: FiltrosAuditoria, pagina: number) =>
    [...auditoriasKeys.lists(), { filtros, pagina }] as const,
  resumen: () => [...auditoriasKeys.all, 'resumen'] as const,
  eliminaciones: () => [...auditoriasKeys.all, 'eliminaciones'] as const,
  estadisticas: () => [...auditoriasKeys.all, 'estadisticas'] as const,
  historial: (tabla: string, registroId: string) =>
    [...auditoriasKeys.all, 'historial', tabla, registroId] as const,
}

export function useAuditoriasListQuery(
  filtros: FiltrosAuditoria,
  pagina: number
) {
  const hasBusqueda = Boolean(filtros.busqueda?.trim())
  const offset = (pagina - 1) * REGISTROS_POR_PAGINA

  return useQuery({
    queryKey: auditoriasKeys.list(filtros, pagina),
    queryFn: async () => {
      if (hasBusqueda) {
        const resultados = await auditoriasService.buscarAuditorias(
          filtros.busqueda,
          REGISTROS_POR_PAGINA
        )
        return {
          datos: resultados,
          total: resultados.length,
          pagina: 1,
          totalPaginas: 1,
        }
      }

      return auditoriasService.obtenerAuditorias({
        tabla: filtros.tabla,
        modulo: filtros.modulo,
        accion: filtros.accion,
        usuarioId: filtros.usuarioId,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        limite: REGISTROS_POR_PAGINA,
        offset,
      })
    },
    staleTime: 30_000,
  })
}

export function useAuditoriasResumenQuery() {
  return useQuery({
    queryKey: auditoriasKeys.resumen(),
    queryFn: () => auditoriasService.obtenerResumenModulos(),
    staleTime: 60_000,
  })
}

export function useAuditoriasEliminacionesQuery() {
  return useQuery({
    queryKey: auditoriasKeys.eliminaciones(),
    queryFn: () => auditoriasService.detectarEliminacionesMasivas(7, 5),
    staleTime: 60_000,
  })
}

export function useAuditoriasEstadisticasQuery() {
  return useQuery({
    queryKey: auditoriasKeys.estadisticas(),
    queryFn: () => auditoriasService.obtenerEstadisticas(),
    staleTime: 60_000,
  })
}
