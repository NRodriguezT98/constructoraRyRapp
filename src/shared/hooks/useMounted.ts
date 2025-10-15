import { useState, useEffect } from 'react'

/**
 * Hook para prevenir hydration mismatch en SSR
 * @returns boolean - true cuando el componente está montado en el cliente
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
