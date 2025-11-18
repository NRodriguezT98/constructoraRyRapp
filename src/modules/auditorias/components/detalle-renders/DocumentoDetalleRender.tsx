/**
 * DocumentoDetalleRender - Renderizado de detalles de auditoría para módulo Documentos
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ Detecta tipo de operación y delega a componente específico
 * ✅ Soporta: versiones, estados, reemplazos, etc.
 */

'use client'

import type { AuditLogRecord } from '../../types'
import { DocumentosAuditoriaDetalle } from '../detalles/DocumentosAuditoriaDetalle'
import { GenericoDetalleRender } from './GenericoDetalleRender'

interface DocumentoDetalleRenderProps {
  registro: AuditLogRecord
}

export function DocumentoDetalleRender({ registro }: DocumentoDetalleRenderProps) {
  const metadata = registro.metadata

  // Operaciones de versiones de documentos
  const operacionesVersiones = [
    'MARCAR_VERSION_ERRONEA',
    'MARCAR_VERSION_OBSOLETA',
    'RESTAURAR_ESTADO_VERSION',
    'REEMPLAZO_ARCHIVO'
  ]

  if (metadata?.tipo_operacion && operacionesVersiones.includes(metadata.tipo_operacion)) {
    return (
      <DocumentosAuditoriaDetalle
        metadata={metadata}
        datosAnteriores={registro.datosAnteriores}
        datosNuevos={registro.datosNuevos}
        usuarioEmail={registro.usuarioEmail}
        usuarioNombres={registro.usuarioNombres}
        fechaEvento={registro.fechaEvento}
      />
    )
  }

  // Fallback genérico para otras operaciones
  return <GenericoDetalleRender registro={registro} />
}
