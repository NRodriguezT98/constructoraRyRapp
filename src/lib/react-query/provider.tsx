/**
 * ============================================
 * REACT QUERY PROVIDER (CLIENT COMPONENT)
 * ============================================
 *
 * Wrapper para QueryClientProvider
 * Debe usarse en layout para envolver toda la app
 */

'use client'

import { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { makeQueryClient } from './client'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // IMPORTANTE: useState para evitar recrear el cliente en cada render
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* DevTools - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}
