// Tipos para el sistema de proyectos
export interface Proyecto {
    id: string
    nombre: string
    descripcion: string
    ubicacion: string
    fechaCreacion: Date
    fechaActualizacion: Date
    estado: EstadoProyecto
    manzanas: Manzana[]
    documentos: DocumentoProyecto[]
}

export interface Manzana {
    id: string
    proyectoId: string
    letra: string // A, B, C, D, E, F, etc.
    numeroViviendas: number
    viviendasCreadas: number[] // números de viviendas ya creadas
}

export interface DocumentoProyecto {
    id: string
    proyectoId: string
    nombre: string
    tipo: TipoDocumento
    url: string
    fechaSubida: Date
    tamaño: number
}

export type EstadoProyecto =
    | 'planificacion'
    | 'en_construccion'
    | 'pausado'
    | 'finalizado'
    | 'cancelado'

export type TipoDocumento =
    | 'licencia_construccion'
    | 'licencia_urbanizacion'
    | 'permiso_ventas'
    | 'planos'
    | 'contratos'
    | 'otros'

// Formulario de creación de proyecto
export interface FormularioProyecto {
    nombre: string
    descripcion: string
    ubicacion: string
    manzanas: FormularioManzana[]
}

export interface FormularioManzana {
    letra: string
    numeroViviendas: number
}