/**
 * useVistaPreference - Hook para persistir preferencia de vista (cards/tabla)
 * ✅ Guarda en localStorage
 * ✅ Específico por módulo
 * ✅ Type-safe
 */

import { useEffect, useState } from 'react'

export type TipoVista = 'cards' | 'tabla'

interface UseVistaPreferenceOptions {
  moduleName: string
  defaultVista?: TipoVista
}

export function useVistaPreference({
  moduleName,
  defaultVista = 'cards',
}: UseVistaPreferenceOptions) {
  const storageKey = `${moduleName}_vista_preference`

  const [vista, setVista] = useState<TipoVista>(() => {
    // Cargar de localStorage al inicializar
    if (typeof window === 'undefined') return defaultVista

    const saved = localStorage.getItem(storageKey)
    return (saved as TipoVista) || defaultVista
  })

  useEffect(() => {
    // Guardar en localStorage cuando cambie
    localStorage.setItem(storageKey, vista)
  }, [vista, storageKey])

  return [vista, setVista] as const
}
