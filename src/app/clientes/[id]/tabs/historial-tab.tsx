/**
 * Tab de Historial de Cliente (CON MEJORAS UX)
 * Timeline visual de todos los eventos con métricas y filtros avanzados
 *
 * ARQUITECTURA:
 * - Componente orquestador (< 120 líneas)
 * - Separación de responsabilidades completa
 * - Componentes extraídos en historial/components/
 * - Métricas + Filtros avanzados + Diseño compacto
 */

'use client'

import { useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Clock, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

import { useHistorialCliente } from '@/modules/clientes/hooks/useHistorialCliente'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import { usePermisosNotasHistorial } from '@/modules/clientes/hooks/usePermisosNotasHistorial'
import { notasHistorialService } from '@/modules/clientes/services/notas-historial.service'
import { EmptyState } from '@/shared/components/layout/EmptyState'
import { LoadingState } from '@/shared/components/layout/LoadingState'
import { useModal } from '@/shared/components/modals'

import { FiltrosYBusqueda, GrupoEventosFecha, MetricasHistorial } from './historial/components'
import { NotaModal } from './historial/components/NotaModal'
import { historialStyles } from './historial/historial-tab.styles'

interface HistorialTabProps {
  clienteId: string
  clienteNombre: string
}

export function HistorialTab({ clienteId, clienteNombre }: HistorialTabProps) {
  const queryClient = useQueryClient()
  const [mostrarModalNota, setMostrarModalNota] = useState(false)
  const [notaIdSeleccionado, setNotaIdSeleccionado] = useState<string | null>(null)
  const { confirm } = useModal()
  const { eliminarNota, isEliminando } = useNotasHistorial(clienteId)

  const {
    eventosAgrupados,
    estadisticas,
    usuariosDisponibles,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    tipoEvento,
    setTipoEvento,
    modulo,
    setModulo,
    usuarioFiltro,
    setUsuarioFiltro,
    limpiarFiltros,
    tieneAplicados,
  } = useHistorialCliente({ clienteId })

  // ✅ Calcular todos los eventos (aplanado)
  const todosLosEventos = useMemo(() => {
    return eventosAgrupados.flatMap(grupo => grupo.eventos)
  }, [eventosAgrupados])

  // ✅ Verificar permisos de forma SINCRÓNICA (instantáneo, sin delays)
  const { notasEditables } = usePermisosNotasHistorial(todosLosEventos)

  // ========== HANDLERS DE NOTAS ==========
  /**
   * ✅ REACT QUERY PRO: Pre-fetch antes de abrir modal
   * - Carga datos en cache ANTES de abrir
   * - Modal usa datos del cache (instantáneo)
   * - Sin flashes de loading
   */
  const handleEditarNota = async (notaId: string) => {
    try {
      // 1. Pre-fetch: Cargar datos en cache ANTES de abrir modal
      await queryClient.prefetchQuery({
        queryKey: ['nota-historial', notaId],
        queryFn: () => notasHistorialService.obtenerNotaPorId(notaId),
      })

      // 2. Datos YA están en cache, abrir modal instantáneamente
      setNotaIdSeleccionado(notaId)
      setMostrarModalNota(true)
    } catch (error) {
      console.error('Error cargando nota:', error)
      toast.error('Error al cargar la nota')
    }
  }

  const handleEliminarNota = async (notaId: string) => {
    const confirmado = await confirm({
      title: '¿Eliminar nota?',
      message: 'Esta acción no se puede deshacer. La nota se eliminará permanentemente del historial.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (confirmado) {
      try {
        await eliminarNota(notaId)
      } catch (error) {
        console.error('Error eliminando nota:', error)
      }
    }
  }

  const handleCerrarModal = () => {
    setMostrarModalNota(false)
    setNotaIdSeleccionado(null)
  }

  // ========== ESTADOS DE CARGA Y ERROR ==========
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Cargando historial del cliente..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={historialStyles.empty.container}>
        <EmptyState
          icon={<X className="w-12 h-12 text-red-500" />}
          title="Error al cargar historial"
          description="Ocurrió un error al cargar el historial del cliente"
        />
      </div>
    )
  }

  if (estadisticas.total === 0) {
    return (
      <div className={historialStyles.empty.container}>
        <EmptyState
          icon={<Clock className="w-12 h-12 text-gray-400" />}
          title="Sin historial"
          description="Este cliente aún no tiene eventos registrados"
        />
      </div>
    )
  }

  // ========== CONTENIDO PRINCIPAL ==========
  return (
    <div className={historialStyles.container.root}>
      {/* Panel de Métricas */}
      <MetricasHistorial
        total={estadisticas.total}
        estaSemana={estadisticas.estaSemana}
        esteMes={estadisticas.esteMes}
        criticos={estadisticas.criticos}
      />

      {/* Header con búsqueda y filtros avanzados */}
      <FiltrosYBusqueda
        clienteNombre={clienteNombre}
        estadisticasFiltrados={estadisticas.filtrados}
        estadisticasTotal={estadisticas.total}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        tieneAplicados={tieneAplicados}
        onLimpiarFiltros={limpiarFiltros}
        // Nuevos filtros
        tipoEvento={tipoEvento}
        onTipoEventoChange={setTipoEvento}
        modulo={modulo}
        onModuloChange={setModulo}
        usuario={usuarioFiltro}
        onUsuarioChange={setUsuarioFiltro}
        usuariosDisponibles={usuariosDisponibles}
        // Botón agregar nota
        onAgregarNota={() => setMostrarModalNota(true)}
      />

      {/* Timeline de eventos */}
      {estadisticas.filtrados === 0 ? (
        <div className={historialStyles.empty.sinResultados}>
          <EmptyState
            icon={<Filter className="w-12 h-12 text-gray-400" />}
            title="Sin resultados"
            description="No se encontraron eventos con los filtros aplicados"
          />
        </div>
      ) : (
        <div className={historialStyles.timeline.container}>
          <AnimatePresence>
            {eventosAgrupados.map((grupo) => (
              <GrupoEventosFecha
                key={grupo.fecha}
                fecha={grupo.fecha}
                fechaFormateada={grupo.fechaFormateada}
                total={grupo.total}
                eventos={grupo.eventos}
                onEditarNota={handleEditarNota}
                onEliminarNota={handleEliminarNota}
                notasEditables={notasEditables}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal para agregar/editar notas */}
      {/* ✅ React Query: notaId resuelve datos desde cache (instantáneo) */}
      <NotaModal
        isOpen={mostrarModalNota}
        onClose={handleCerrarModal}
        clienteId={clienteId}
        clienteNombre={clienteNombre}
        notaId={notaIdSeleccionado}
      />
    </div>
  )
}
