/**
 * 🗑️ HOOK: usePapeleraCount
 *
 * Obtiene el total de documentos eliminados de todos los módulos
 * para mostrar badge numérico en sidebar.
 *
 * - Query ligera: solo .count() sin datos
 * - Multi-módulo: proyectos + viviendas
 * - Cache: 60 segundos (datos no críticos)
 * - Invalidación: en mutations de delete/restore
 */

import { useQuery } from '@tanstack/react-query'

import { DocumentosEliminacionService as ViviendaEliminacionService } from '@/modules/viviendas/services/documentos/documentos-eliminacion.service'
import { DocumentosService } from '../services/documentos.service'

export function usePapeleraCount() {
  // ✅ QUERY: Contar documentos eliminados de PROYECTOS
  const { data: countProyectos = 0 } = useQuery({
    queryKey: ['papelera-count-proyectos'],
    queryFn: async () => {
      try {
        const docs = await DocumentosService.obtenerDocumentosEliminados()
        return docs.length
      } catch (error) {
        console.error('Error contando papelera proyectos:', error)
        return 0
      }
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // ✅ QUERY: Contar documentos eliminados de VIVIENDAS
  const { data: countViviendas = 0 } = useQuery({
    queryKey: ['papelera-count-viviendas'],
    queryFn: async () => {
      try {
        const docs = await ViviendaEliminacionService.obtenerDocumentosEliminados()
        return docs.length
      } catch (error) {
        console.error('Error contando papelera viviendas:', error)
        return 0
      }
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // ✅ Total unificado
  const totalEliminados = countProyectos + countViviendas

  return {
    total: totalEliminados,
    porModulo: {
      proyectos: countProyectos,
      viviendas: countViviendas,
    },
  }
}
