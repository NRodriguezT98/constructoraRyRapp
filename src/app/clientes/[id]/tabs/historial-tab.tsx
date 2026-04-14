/**
 * Tab de Historial del Cliente
 * Línea de tiempo cronológica con todos los movimientos del cliente:
 * creación, ediciones, negociaciones, abonos, renuncias, intereses, documentos y notas manuales.
 *
 * ARQUITECTURA:
 * - Componente orquestador (< 150 líneas)
 * - Lógica en useHistorialCliente hook
 * - UI separada en historial/components/
 */

'use client'

import { useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Clock, Filter, X } from 'lucide-react'
import { toast } from 'sonner'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import { useHistorialCliente } from '@/modules/clientes/hooks/useHistorialCliente'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import { usePermisosNotasHistorial } from '@/modules/clientes/hooks/usePermisosNotasHistorial'
import { notasHistorialService } from '@/modules/clientes/services/notas-historial.service'
import { EmptyState } from '@/shared/components/layout/EmptyState'
import { useModal } from '@/shared/components/modals'

import {
  HistorialFiltros,
  HistorialResumen,
  NotaModal,
  TimelineGrupoFecha,
} from './historial/components'

interface HistorialTabProps {
  clienteId: string
  clienteNombre: string
}

export function HistorialTab({ clienteId, clienteNombre }: HistorialTabProps) {
  const queryClient = useQueryClient()
  const [mostrarModalNota, setMostrarModalNota] = useState(false)
  const [notaIdSeleccionado, setNotaIdSeleccionado] = useState<string | null>(
    null
  )
  const { confirm } = useModal()
  const { eliminarNota } = useNotasHistorial(clienteId)

  const {
    eventosAgrupados,
    estadisticas,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    limpiarFiltros,
    tieneAplicados,
  } = useHistorialCliente({ clienteId })

  // Aplanar eventos para calcular permisos
  const todosLosEventos = useMemo(() => {
    return eventosAgrupados.flatMap(g => g.eventos)
  }, [eventosAgrupados])

  const { notasEditables } = usePermisosNotasHistorial(todosLosEventos)

  // Formatear fecha del primer evento para el resumen
  const primerEventoFormateado = estadisticas.primerEvento
    ? formatDateCompact(estadisticas.primerEvento)
    : null

  // ========== HANDLERS DE NOTAS ==========
  const handleEditarNota = async (notaId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['nota-historial', notaId],
        queryFn: () => notasHistorialService.obtenerNotaPorId(notaId),
      })
      setNotaIdSeleccionado(notaId)
      setMostrarModalNota(true)
    } catch (err) {
      logger.error('Error cargando nota:', err)
      toast.error('Error al cargar la nota')
    }
  }

  const handleEliminarNota = async (notaId: string) => {
    const confirmado = await confirm({
      title: '¿Eliminar nota?',
      message:
        'Esta acción no se puede deshacer. La nota se eliminará permanentemente del historial.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })
    if (confirmado) {
      try {
        await eliminarNota(notaId)
      } catch (err) {
        logger.error('Error eliminando nota:', err)
      }
    }
  }

  const handleCerrarModal = () => {
    setMostrarModalNota(false)
    setNotaIdSeleccionado(null)
  }

  // ========== ESTADOS ==========
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        {/* Anillos concéntricos + icono */}
        <div className='relative inline-flex items-center justify-center'>
          <div className='absolute h-20 w-20 animate-ping rounded-full bg-cyan-500/15 dark:bg-cyan-400/10' />
          <div className='absolute h-16 w-16 rounded-full border-2 border-cyan-200/40 dark:border-cyan-800/40' />
          <div className='relative h-14 w-14 animate-spin rounded-full border-4 border-transparent border-r-cyan-400 border-t-cyan-500 dark:border-r-cyan-400 dark:border-t-cyan-300' />
          <Clock className='absolute h-5 w-5 text-cyan-500 dark:text-cyan-400' />
        </div>
        <p className='mt-5 text-sm font-medium text-slate-500 dark:text-slate-400'>
          Cargando historial…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={<X className='h-12 w-12 text-red-500' />}
          title='Error al cargar historial'
          description='Ocurrió un error al cargar el historial del cliente'
        />
      </div>
    )
  }

  if (estadisticas.total === 0) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={<Clock className='h-12 w-12 text-gray-400' />}
          title='Sin historial'
          description='Este cliente aún no tiene eventos registrados'
        />
      </div>
    )
  }

  // ========== RENDER ==========
  return (
    <div className='space-y-4 py-4'>
      {/* Resumen del ciclo de vida */}
      <HistorialResumen
        total={estadisticas.total}
        estaSemana={estadisticas.estaSemana}
        esteMes={estadisticas.esteMes}
        criticos={estadisticas.criticos}
        primerEvento={primerEventoFormateado}
      />

      {/* Filtros */}
      <HistorialFiltros
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        categoriaActiva={categoria}
        onCategoriaChange={setCategoria}
        totalFiltrados={estadisticas.filtrados}
        totalGeneral={estadisticas.total}
        tieneAplicados={tieneAplicados}
        onLimpiarFiltros={limpiarFiltros}
        onAgregarNota={() => setMostrarModalNota(true)}
      />

      {/* Timeline */}
      {estadisticas.filtrados === 0 ? (
        <div className='py-8'>
          <EmptyState
            icon={<Filter className='h-12 w-12 text-gray-400' />}
            title='Sin resultados'
            description='No se encontraron eventos con los filtros aplicados'
          />
        </div>
      ) : (
        <div className='relative pl-8'>
          {/* Línea vertical del timeline */}
          <div className='absolute bottom-4 left-[15px] top-0 w-[2px] bg-gradient-to-b from-cyan-300 via-cyan-200 to-transparent dark:from-cyan-700 dark:via-cyan-800' />

          <AnimatePresence>
            {eventosAgrupados.map(grupo => (
              <TimelineGrupoFecha
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

      {/* Modal de nota */}
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
