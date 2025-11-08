import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { proyectosService } from '../services/proyectos.service'
import {
  ProyectosState,
  ProyectosActions,
  Proyecto,
  ProyectoFormData,
  FiltroProyecto,
  VistaProyecto,
} from '../types'

interface ProyectosStore extends ProyectosState, ProyectosActions {}

export const useProyectosStore = create<ProyectosStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        proyectos: [],
        proyectoActual: undefined,
        cargando: true, // Inicia en true para evitar flash de "sin datos"
        error: undefined,
        filtros: {
          busqueda: '',
          estado: undefined,
          fechaDesde: undefined,
          fechaHasta: undefined,
        },
        vista: 'grid',

        // Acciones CRUD
        crearProyecto: async (data: ProyectoFormData) => {
          set({ cargando: true, error: undefined })
          try {
            const nuevoProyecto = await proyectosService.crearProyecto(data)
            set(state => ({
              proyectos: [...state.proyectos, nuevoProyecto],
              cargando: false,
            }))
            return nuevoProyecto
          } catch (error) {
            const mensaje =
              error instanceof Error ? error.message : 'Error al crear proyecto'
            set({ error: mensaje, cargando: false })
            throw error
          }
        },

        actualizarProyecto: async (
          id: string,
          data: Partial<ProyectoFormData>
        ) => {
          set({ cargando: true, error: undefined })
          try {
            const proyectoActualizado =
              await proyectosService.actualizarProyecto(id, data)
            set(state => ({
              proyectos: state.proyectos.map(p =>
                p.id === id ? proyectoActualizado : p
              ),
              proyectoActual:
                state.proyectoActual?.id === id
                  ? proyectoActualizado
                  : state.proyectoActual,
              cargando: false,
            }))
            return proyectoActualizado
          } catch (error) {
            const mensaje =
              error instanceof Error
                ? error.message
                : 'Error al actualizar proyecto'
            set({ error: mensaje, cargando: false })
            throw error
          }
        },

        eliminarProyecto: async (id: string) => {
          set({ cargando: true, error: undefined })
          try {
            await proyectosService.eliminarProyecto(id)
            set(state => ({
              proyectos: state.proyectos.filter(p => p.id !== id),
              proyectoActual:
                state.proyectoActual?.id === id
                  ? undefined
                  : state.proyectoActual,
              cargando: false,
            }))
          } catch (error) {
            const mensaje =
              error instanceof Error
                ? error.message
                : 'Error al eliminar proyecto'
            set({ error: mensaje, cargando: false })
            throw error
          }
        },

        obtenerProyecto: async (id: string) => {
          set({ cargando: true, error: undefined })
          try {
            const proyecto = await proyectosService.obtenerProyecto(id)
            set({ cargando: false })
            return proyecto
          } catch (error) {
            const mensaje =
              error instanceof Error
                ? error.message
                : 'Error al obtener proyecto'
            set({ error: mensaje, cargando: false })
            throw error
          }
        },

        obtenerProyectos: async () => {
          set({ cargando: true, error: undefined })
          try {
            const proyectos = await proyectosService.obtenerProyectos()
            set({ proyectos, cargando: false })
            return proyectos
          } catch (error) {
            const mensaje =
              error instanceof Error
                ? error.message
                : 'Error al obtener proyectos'
            set({ error: mensaje, cargando: false })
            throw error
          }
        },

        // Acciones de UI
        setFiltros: (filtros: Partial<FiltroProyecto>) => {
          set(state => ({
            filtros: { ...state.filtros, ...filtros },
          }))
        },

        setVista: (vista: VistaProyecto) => {
          set({ vista })
        },

        setProyectoActual: (proyecto?: Proyecto) => {
          set({ proyectoActual: proyecto })
        },

        limpiarError: () => {
          set({ error: undefined })
        },
      }),
      {
        name: 'proyectos-storage',
        partialize: state => ({
          proyectos: state.proyectos,
          vista: state.vista,
          filtros: state.filtros,
        }),
      }
    ),
    {
      name: 'proyectos-store',
    }
  )
)
