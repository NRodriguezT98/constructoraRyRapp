/**
 * Componente: Header de la página de Crear Negociación
 * UI presentacional pura con diseño minimalista
 */

'use client'

interface HeaderNegociacionProps {
  clienteId: string
  clienteNombre?: string
}

const headerStyles = {
  container: 'space-y-1',
  title: 'text-2xl font-bold text-gray-900 dark:text-white',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400',
}

export function HeaderNegociacion({ clienteNombre }: HeaderNegociacionProps) {
  return (
    <div className={headerStyles.container}>
      <h1 className={headerStyles.title}>Nueva Negociación</h1>

      <p className={headerStyles.subtitle}>
        Configura el cierre financiero para {clienteNombre || 'el cliente'}
      </p>
    </div>
  )
}
