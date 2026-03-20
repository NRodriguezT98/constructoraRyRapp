/** Tipos internos para warnings de documentos en el modal de rebalanceo */

export interface CambioEnriquecido {
  tipo: string
  motivoCambio: 'entidad' | 'monto' | 'ambos'
  entidadAnterior?: string
  entidadNueva?: string
  montoAnterior?: number
  montoNuevo?: number
  documentos: string[]
}

export interface NuevaEnriquecida {
  tipo: string
  documentos: string[]
}
