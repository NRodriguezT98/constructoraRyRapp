/**
 * Hook: usePermisosCorreccion
 *
 * Valida permisos para corregir documentos y fechas de pasos
 */

import { useEffect, useState } from 'react'

import { puedeCorregirDocumentos, puedeCorregirFecha, type PermisosCorreccion } from '../services/correcciones.service'

interface UsePermisosCorreccionResult {
  // Permisos
  puedeCorregirDocs: PermisosCorreccion
  puedeCorregirFch: PermisosCorreccion

  // Estados
  cargando: boolean
  error: string | null

  // Acciones
  refrescar: () => Promise<void>
}

/**
 * Hook para validar permisos de corrección
 */
export function usePermisosCorreccion(
  pasoId: string | null,
  esAdmin = false
): UsePermisosCorreccionResult {

  const [puedeCorregirDocs, setPuedeCorregirDocs] = useState<PermisosCorreccion>({
    permitido: false
  })

  const [puedeCorregirFch, setPuedeCorregirFch] = useState<PermisosCorreccion>({
    permitido: false
  })

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarPermisos = async () => {
    if (!pasoId) {
      setPuedeCorregirDocs({ permitido: false })
      setPuedeCorregirFch({ permitido: false })
      return
    }

    try {
      setCargando(true)
      setError(null)

      const [permisosDocs, permisosFecha] = await Promise.all([
        puedeCorregirDocumentos(pasoId, esAdmin),
        puedeCorregirFecha(pasoId, esAdmin)
      ])

      setPuedeCorregirDocs(permisosDocs)
      setPuedeCorregirFch(permisosFecha)

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al verificar permisos'
      setError(mensaje)
      console.error('Error al cargar permisos:', err)

    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPermisos()
  }, [pasoId, esAdmin])

  return {
    puedeCorregirDocs,
    puedeCorregirFch,
    cargando,
    error,
    refrescar: cargarPermisos
  }
}
