/**
 * ============================================
 * HOOK: useClienteDetalle
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja TODA la lógica de la vista de detalle del cliente.
 * Consolida los 5 useEffect del componente original.
 *
 * Responsabilidades:
 * - Resolver slug a UUID del cliente
 * - Cargar datos del cliente con React Query
 * - Gestionar tabs activos
 * - Cargar categorías de documentos
 * - Escuchar eventos de actualización y cambio de tab
 * - Validar documento de identidad
 * - Cargar documentos del cliente
 */

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'
import { useClienteQuery } from '@/modules/clientes/hooks'
import { useDocumentosQuery } from '@/modules/documentos/hooks/useDocumentosQuery'
import { CategoriasService } from '@/modules/documentos/services'
import { useDocumentosStore } from '@/modules/documentos/store/documentos.store'

interface UseClienteDetalleProps {
  clienteIdSlug: string // Puede ser slug o UUID
}

export type TabType = 'general' | 'intereses' | 'negociacion' | 'negociaciones' | 'documentos' | 'historial' | 'vivienda-asignada' | 'fuentes-pago'

export function useClienteDetalle({ clienteIdSlug }: UseClienteDetalleProps) {
  const router = useRouter()
  const { user } = useAuth()

  // =====================================================
  // ESTADO
  // =====================================================

  const [clienteUUID, setClienteUUID] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [modalInteresAbierto, setModalInteresAbierto] = useState(false)

  // Activar tab desde intent guardado en sessionStorage (p.ej. desde módulo Abonos)
  useEffect(() => {
    const intent = sessionStorage.getItem('cliente-tab-intent')
    if (intent && ['general', 'intereses', 'negociacion', 'documentos', 'historial'].includes(intent)) {
      setActiveTab(intent as TabType)
      sessionStorage.removeItem('cliente-tab-intent')
    }
  }, [])

  // =====================================================
  // STORES Y QUERIES
  // =====================================================

  // Store de documentos (GENÉRICO)
  const {
    modalSubirAbierto,
    cerrarModalSubir,
  } = useDocumentosStore()

  // Función para cargar categorías (reemplaza método del store legacy)
  const cargarCategorias = useCallback(async () => {
    if (!user?.id) return
    try {
      await CategoriasService.obtenerCategoriasPorModulo(user.id, 'clientes')
    } catch (error) {
      logger.error('Error cargando categorías:', error)
    }
  }, [user?.id])

  // ✅ REACT QUERY: Cargar cliente automáticamente
  const {
    data: cliente,
    isLoading: loading,
    error,
    refetch: recargarCliente,
  } = useClienteQuery(clienteUUID)

  // ✅ Hook de validación de documento de identidad
  const { tieneCedula, cargando: cargandoValidacion } = useDocumentoIdentidad({
    clienteId: clienteUUID || '',
  })

  // ✅ Query de documentos para contador
  const { documentos: documentosCliente } = useDocumentosQuery(clienteUUID || '', 'cliente')

  // =====================================================
  // EFECTOS
  // =====================================================

  // 1. Resolver slug a UUID
  useEffect(() => {
    const resolverSlug = async () => {
      const uuid = await resolverSlugCliente(clienteIdSlug)
      if (uuid) {
        setClienteUUID(uuid)
      } else {
        logger.error('❌ [useClienteDetalle] No se pudo resolver el cliente')
        router.push('/clientes')
      }
    }

    resolverSlug()
  }, [clienteIdSlug, router])

  // 2. Cargar categorías al montar (si hay usuario)
  useEffect(() => {
    if (user?.id) {
      cargarCategorias()
    }
  }, [user?.id, cargarCategorias])

  // 3. Listener para cambio de tab (desde otros componentes)
  useEffect(() => {
    const handleCambiarTab = (event: any) => {
      const nuevoTab = event.detail as TabType
      setActiveTab(nuevoTab)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('cambiar-tab', handleCambiarTab)
      return () => window.removeEventListener('cambiar-tab', handleCambiarTab)
    }
  }, [])

  // 4. Listener para actualización de cliente (cuando se sube cédula)
  useEffect(() => {
    if (!clienteUUID) return

    const handleClienteActualizado = () => {
      recargarCliente()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('cliente-actualizado', handleClienteActualizado)
      return () => window.removeEventListener('cliente-actualizado', handleClienteActualizado)
    }
  }, [clienteUUID, recargarCliente])

  // =====================================================
  // ACCIONES
  // =====================================================

  /**
   * Cambiar tab activo programáticamente
   */
  const cambiarTab = useCallback((tab: TabType) => {
    setActiveTab(tab)
  }, [])

  /**
   * Abrir modal de registrar interés
   */
  const abrirModalInteres = useCallback(() => {
    setModalInteresAbierto(true)
  }, [])

  /**
   * Cerrar modal de registrar interés
   */
  const cerrarModalInteres = useCallback(() => {
    setModalInteresAbierto(false)
  }, [])

  /**
   * Cambiar a tab de documentos (usado desde otros tabs)
   */
  const irATabDocumentos = useCallback(() => {
    setActiveTab('documentos')
  }, [])

  // =====================================================
  // COMPUTED
  // =====================================================

  const totalDocumentos = documentosCliente?.length || 0

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    clienteUUID,
    cliente,
    loading,
    error,
    activeTab,
    modalInteresAbierto,

    // Validaciones
    tieneCedula,
    cargandoValidacion,

    // Documentos
    totalDocumentos,
    modalSubirAbierto,

    // Acciones
    cambiarTab,
    abrirModalInteres,
    cerrarModalInteres,
    cerrarModalSubir,
    recargarCliente,
    irATabDocumentos,
  }
}
