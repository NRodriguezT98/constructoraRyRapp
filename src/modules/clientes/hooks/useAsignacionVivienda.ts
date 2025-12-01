/**
 * ============================================
 * HOOK: useAsignacionVivienda
 * ============================================
 *
 * Hook para validación y navegación al flujo de asignación de vivienda.
 * Verifica que el cliente tenga documento de identidad antes de permitir asignación.
 *
 * RESPONSABILIDAD: Validación + navegación centralizada
 */

import { useRouter } from 'next/navigation'
import { useDocumentoIdentidad } from '../documentos/hooks/useDocumentoIdentidad'

interface UseAsignacionViviendaProps {
  clienteId: string
  clienteNombre?: string
  clienteSlug?: string
  onBeforeNavigate?: () => void
}

interface UseAsignacionViviendaReturn {
  /** Indica si el cliente tiene documento de identidad */
  tieneCedula: boolean

  /** Indica si se puede iniciar asignación (documento + no está cargando) */
  puedeAsignar: boolean

  /** Estado de carga de validación */
  cargando: boolean

  /** Iniciar proceso de asignación (navega a crear negociación) */
  handleIniciarAsignacion: () => void

  /** Mensaje de validación para mostrar en tooltip */
  mensajeValidacion: string
}

export function useAsignacionVivienda({
  clienteId,
  clienteNombre,
  clienteSlug,
  onBeforeNavigate,
}: UseAsignacionViviendaProps): UseAsignacionViviendaReturn {
  const router = useRouter()

  // ✅ Validar documento de identidad
  const { tieneCedula, cargando } = useDocumentoIdentidad({ clienteId })

  // ✅ Verificar si puede asignar
  const puedeAsignar = tieneCedula && !cargando

  // ✅ Mensaje de validación
  const mensajeValidacion = tieneCedula
    ? 'Iniciar proceso de asignación de vivienda'
    : 'Para asignar viviendas, primero sube la cédula o documento de identidad del cliente en la pestaña "Documentos"'

  // ✅ Handler para iniciar asignación
  const handleIniciarAsignacion = () => {
    // Validación: debe tener documento
    if (!tieneCedula) {
      console.warn('❌ No se puede asignar vivienda: documento de identidad faltante')
      return
    }

    // Callback antes de navegar (analytics, logs, etc.)
    onBeforeNavigate?.()

    // Construir URL para asignar vivienda
    const slug = clienteSlug || clienteId
    const nombreParam = clienteNombre ? `?nombre=${encodeURIComponent(clienteNombre)}` : ''

    // Navegar a asignar vivienda
    router.push(`/clientes/${slug}/asignar-vivienda${nombreParam}`)
  }

  return {
    tieneCedula,
    puedeAsignar,
    cargando,
    handleIniciarAsignacion,
    mensajeValidacion,
  }
}
