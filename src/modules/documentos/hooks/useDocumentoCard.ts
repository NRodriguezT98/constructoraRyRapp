import { useCallback, useState } from 'react'
import { useClickOutside } from '../../../shared/hooks'

export function useDocumentoCard() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Usar hook compartido para cerrar al hacer click fuera
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setMenuAbierto(false)
  })

  const toggleMenu = useCallback(() => {
    setMenuAbierto(prev => !prev)
  }, [])

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false)
  }, [])

  return {
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,
  }
}
