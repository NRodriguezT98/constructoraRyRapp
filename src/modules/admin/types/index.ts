export interface ResultadoOperacion {
  tipo: 'success' | 'error' | 'info'
  mensaje: string
  detalle?: string
}

export interface TipoFuente {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  es_subsidio: boolean
  orden: number
  activo: boolean
}

export interface ResultadoFuentesPago extends ResultadoOperacion {
  fuentes?: TipoFuente[]
}
