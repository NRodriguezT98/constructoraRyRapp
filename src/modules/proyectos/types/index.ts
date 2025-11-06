// Tipos para el módulo de proyectos
export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
  ubicacion: string
  fechaInicio: string
  fechaFinEstimada: string
  presupuesto: number
  estado: EstadoProyecto
  manzanas: Manzana[]
  responsable: string
  telefono: string
  email: string
  documentos?: Documento[]
  progreso?: number
  fechaCreacion: string
  fechaActualizacion: string
}

export interface Manzana {
  id: string
  nombre: string
  totalViviendas: number
  viviendasVendidas: number
  precioBase: number
  superficieTotal: number
  proyectoId: string
  ubicacion?: string
  estado: EstadoManzana
  fechaCreacion: string
}

export interface Documento {
  id: string
  nombre: string
  tipo: TipoDocumento
  url: string
  tamaño: number
  fechaSubida: string
  proyectoId: string
}

export type EstadoProyecto =
  // Nuevos estados simplificados
  | 'en_proceso'
  | 'completado'
  // Estados antiguos (compatibilidad para migración)
  | 'en_planificacion'
  | 'en_construccion'
  | 'pausado'

export type EstadoManzana = 'planificada' | 'en_construccion' | 'completada'

export type TipoDocumento =
  | 'plano'
  | 'permiso'
  | 'contrato'
  | 'factura'
  | 'otro'

export type VistaProyecto = 'grid' | 'lista'

export type FiltroProyecto = {
  busqueda: string
  estado?: EstadoProyecto
  fechaDesde?: string
  fechaHasta?: string
}

// Formulario de proyecto
export interface ProyectoFormData {
  nombre: string
  descripcion: string
  ubicacion: string
  fechaInicio: string
  fechaFinEstimada: string
  presupuesto: number
  estado: EstadoProyecto
  responsable: string
  telefono: string
  email: string
  manzanas: ManzanaFormData[]
}

export interface ManzanaFormData {
  id?: string // ID de la manzana en DB (si ya existe)
  nombre: string
  totalViviendas: number
  precioBase: number
  superficieTotal: number
  ubicacion?: string
  // ✅ Campos opcionales para validación (pre-cargados por useProyectoConValidacion)
  cantidadViviendasCreadas?: number
  esEditable?: boolean
  motivoBloqueado?: string
}

// Estados de UI
export interface ProyectosState {
  proyectos: Proyecto[]
  proyectoActual?: Proyecto
  cargando: boolean
  error?: string
  filtros: FiltroProyecto
  vista: VistaProyecto
}

// Eventos y acciones
export interface ProyectosActions {
  // CRUD
  crearProyecto: (data: ProyectoFormData) => Promise<Proyecto>
  actualizarProyecto: (
    id: string,
    data: Partial<ProyectoFormData>
  ) => Promise<Proyecto>
  eliminarProyecto: (id: string) => Promise<void>
  obtenerProyecto: (id: string) => Promise<Proyecto | null>
  obtenerProyectos: () => Promise<Proyecto[]>

  // UI
  setFiltros: (filtros: Partial<FiltroProyecto>) => void
  setVista: (vista: VistaProyecto) => void
  setProyectoActual: (proyecto?: Proyecto) => void
  limpiarError: () => void
}
