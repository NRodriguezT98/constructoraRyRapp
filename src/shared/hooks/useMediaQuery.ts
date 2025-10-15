import { useState, useEffect } from 'react'

/**
 * Hook para detectar cambios en el tamaño de la pantalla
 * @param query - Media query string (ej: '(min-width: 768px)')
 * @returns boolean - true si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia(query)

    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Usar addListener para compatibilidad con navegadores antiguos
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      media.addListener(listener)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [matches, query])

  // Evitar hydration mismatch
  if (!mounted) {
    return false
  }

  return matches
}

/**
 * Breakpoints predefinidos
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () =>
  useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1440px)')
