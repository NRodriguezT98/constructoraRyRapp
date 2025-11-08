import { useState, useEffect } from 'react'

/**
 * Hook para detectar el estado de scroll de la página
 * @param threshold - Píxeles de scroll para considerar "scrolled" (default: 50)
 * @returns boolean - true si se ha scrolleado más del threshold
 */
export function useScrolled(threshold = 50): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}

/**
 * Hook para obtener la posición actual del scroll
 * @returns { x: number, y: number } - Posición del scroll
 */
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setPosition({ x: window.scrollX, y: window.scrollY })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}
