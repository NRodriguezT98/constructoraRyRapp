/**
 * Componente: Header de la página de crear negociación
 * UI presentacional pura
 */

'use client'

import { ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { pageStyles } from '../styles'

interface HeaderNegociacionProps {
  clienteId: string
  clienteNombre?: string
}

export function HeaderNegociacion({
  clienteId,
  clienteNombre,
}: HeaderNegociacionProps) {
  const router = useRouter()

  return (
    <div className={pageStyles.header.container}>
      <button
        onClick={() => router.push(`/clientes/${clienteId}` as any)}
        className={pageStyles.button.back}
      >
        <ArrowLeft className="h-6 w-6" />
        Volver a {clienteNombre || 'Cliente'}
      </button>

      <h1 className={pageStyles.header.title + ' mt-6'}>
        <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-500" />
        Crear Negociación con Cierre Financiero
      </h1>

      <p className={pageStyles.header.subtitle}>
        Configura el financiamiento completo para iniciar el proceso de venta de manera profesional y organizada
      </p>
    </div>
  )
}
