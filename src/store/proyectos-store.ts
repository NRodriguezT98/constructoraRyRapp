import { create } from 'zustand'
import { proyectosService } from '../modules/proyectos/services/proyectos.service'
import type { Proyecto, ProyectoFormData } from '../modules/proyectos/types'

interface ProyectosStore {
  proyectos: Proyecto[]
  isLoading: boolean
  error: string | null

  // Acciones
  cargarProyectos: () => Promise<void>
  agregarProyecto: (proyecto: ProyectoFormData) => Promise<void>
  actualizarProyecto: (
    id: string,
    proyecto: Partial<ProyectoFormData>
  ) => Promise<void>
  eliminarProyecto: (id: string) => Promise<void>
  obtenerProyecto: (id: string) => Proyecto | undefined
}

export const useProyectosStore = create<ProyectosStore>((set, get) => ({
  proyectos: [],
  isLoading: false,
  error: null,

  cargarProyectos: async () => {
    set({ isLoading: true, error: null })
    try {
      const proyectos = await proyectosService.obtenerProyectos()
      set({ proyectos, isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Error al cargar proyectos',
        isLoading: false,
      })
    }
  },

  agregarProyecto: async (proyectoData: ProyectoFormData) => {
    set({ isLoading: true, error: null })
    try {
      const nuevoProyecto = await proyectosService.crearProyecto(proyectoData)
      set(state => ({
        proyectos: [...state.proyectos, nuevoProyecto],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Error al crear proyecto',
        isLoading: false,
      })
      throw error
    }
  },

  actualizarProyecto: async (
    id: string,
    proyectoActualizado: Partial<ProyectoFormData>
  ) => {
    set({ isLoading: true, error: null })
    try {
      const proyecto = await proyectosService.actualizarProyecto(
        id,
        proyectoActualizado
      )
      set(state => ({
        proyectos: state.proyectos.map(p => (p.id === id ? proyecto : p)),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Error al actualizar proyecto',
        isLoading: false,
      })
      throw error
    }
  },

  eliminarProyecto: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await proyectosService.eliminarProyecto(id)
      set(state => ({
        proyectos: state.proyectos.filter(p => p.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Error al eliminar proyecto',
        isLoading: false,
      })
      throw error
    }
  },

  obtenerProyecto: (id: string) => {
    return get().proyectos.find(proyecto => proyecto.id === id)
  },
}))
