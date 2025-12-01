/**
 * Componente: Header de la página de asignar vivienda - REDISEÑADO
 * UI presentacional pura con diseño minimalista
 */

'use client'

import { pageStyles } from '../styles'

interface HeaderNegociacionProps {
  clienteId: string
  clienteNombre?: string
}

export function HeaderNegociacion({
  clienteId,
  clienteNombre,
}: HeaderNegociacionProps) {
  return (
    <div className={pageStyles.header.container}>
      <h1 className={pageStyles.header.title}>
        Asignar Vivienda
      </h1>

      <p className={pageStyles.header.subtitle}>
        Configura el cierre financiero para {clienteNombre || 'el cliente'}
      </p>
    </div>
  )
}
