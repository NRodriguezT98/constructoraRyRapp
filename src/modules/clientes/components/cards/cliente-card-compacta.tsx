/**
 * ClienteCardCompacta - Orquestador inteligente de cards por estado
 *
 * ✅ RENDERIZADO CONDICIONAL:
 *    - Estado "Interesado" → ClienteCardInteresado (Cyan)
 *    - Estado "Activo" → ClienteCardActivo (Verde con panel financiero)
 *    - Estado "Inactivo" → ClienteCardInactivo (Gris)
 *
 * ✅ Mantiene consistencia visual entre todas las variantes
 * ✅ Un solo punto de entrada para todas las cards de clientes
 */

'use client'

import type { ClienteResumen } from '../../types'
import { ClienteCardActivo } from './cliente-card-activo-v2'
import { ClienteCardInactivo } from './cliente-card-inactivo'
import { ClienteCardInteresado } from './cliente-card-interesado-v2'

interface ClienteCardCompactaProps {
  cliente: ClienteResumen
  vista: 'grid' | 'lista'
  tieneCedula?: boolean
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
  onIniciarAsignacion?: (cliente: ClienteResumen) => void
}

export function ClienteCardCompacta({
  cliente,
  vista,
  tieneCedula = false,
  onVer,
  onEditar,
  onEliminar,
  onIniciarAsignacion,
}: ClienteCardCompactaProps) {
  // Renderizado condicional según estado del cliente
  switch (cliente.estado) {
    case 'Activo':
      return (
        <ClienteCardActivo
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onRegistrarAbono={onIniciarAsignacion}
        />
      )

    case 'Inactivo':
      return (
        <ClienteCardInactivo
          cliente={cliente}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )

    case 'Interesado':
    default:
      return (
        <ClienteCardInteresado
          cliente={cliente}
          tieneCedula={tieneCedula}
          onVer={onVer}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )
  }
}
