/**
 * ============================================
 * HOOK: useFuentesPagoTab
 * ============================================
 *
 * ✅ SEPARACIÓN ESTRICTA DE RESPONSABILIDADES
 * - Hook: TODA la lógica de negocio
 * - Componente: SOLO UI presentacional
 *
 * Gestiona la lógica completa de la pestaña Fuentes de Pago:
 * - Obtención de fuentes de pago del cliente
 * - Validación y edición de montos
 * - Estados de documentación requerida
 * - Progreso y métricas
 * - Gestión de modales y acciones
 *
 * @version 1.0.0 - 2025-12-17 - Implementación inicial con React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import type { Cliente } from '@/modules/clientes/types'
import type {
    ActualizarFuentePagoDTO,
    FuentePago,
    TipoFuentePago
} from '@/modules/clientes/types/fuentes-pago'
import type { TipoFuentePago as TipoFuentePagoConfig } from '@/modules/configuracion/types/tipos-fuentes-pago.types'
import { esCreditoHipotecario, esSubsidioMiCasaYa } from '@/shared/constants/fuentes-pago.constants'
import { calcularCierreFinanciero } from '@/shared/hooks/useCierreFinanciero'
import { formatCurrency } from '@/shared/utils/format'

// Importar iconos para mapeo dinámico
import {
    BadgeDollarSign,
    Banknote,
    Building,
    Building2,
    CreditCard,
    DollarSign,
    Gift,
    HandCoins,
    Home,
    Landmark,
    Shield,
    Wallet
} from 'lucide-react'

// ============================================
// INTERFACES
// ============================================

interface UseFuentesPagoTabProps {
  cliente: Cliente
}

interface FuenteEditada {
  id: string
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
}

export interface MetricasFuentesPago {
  valorTotalVivienda: number
  totalFuentesConfiguradas: number
  saldoPendiente: number
  porcentajeCompletado: number
  fuentesConDocumentacion: number
  fuentesSinDocumentacion: number
}

export interface EstadoValidacion {
  tieneFuentes: boolean
  sumaCuadra: boolean
  todasConDocumentacion: boolean
  puedeRegistrarAbonos: boolean
  mensajesValidacion: string[]
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useFuentesPagoTab({ cliente }: UseFuentesPagoTabProps) {
  const queryClient = useQueryClient()

  // ============================================
  // ESTADO LOCAL
  // ============================================

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [fuenteParaEditar, setFuenteParaEditar] = useState<FuentePago | null>(null)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false)
  const [modalValidacionAbierto, setModalValidacionAbierto] = useState(false)

  // ============================================
  // QUERIES CON REACT QUERY
  // ============================================

  // Obtener negociación activa del cliente con datos de vivienda
  const {
    data: negociacion,
    isLoading: isLoadingNegociacion,
    error: errorNegociacion
  } = useQuery({
    queryKey: ['negociacion-activa-completa', cliente.id],
    queryFn: async () => {
      // Obtener negociación activa con datos de vivienda usando relación específica
      const { data, error } = await supabase
        .from('negociaciones')
        .select(`
          id, valor_negociado, valor_total, estado,
          vivienda_id,
          viviendas!negociaciones_vivienda_id_fkey(valor_base, numero, estado)
        `)
        .eq('cliente_id', cliente.id)
        .eq('estado', 'Activa')
        .maybeSingle() // ✅ Cambiado de .single() a .maybeSingle() para evitar error cuando no hay datos

      if (error) {
        console.warn('Error obteniendo negociación:', error)
        return null
      }

      // Si no hay negociación, retornar null (sin error)
      if (!data) {
        return null
      }

      // Fallback: Si el join falló, obtener vivienda por separado
      if (data.vivienda_id && !data.viviendas) {
        const { data: viviendaData } = await supabase
          .from('viviendas')
          .select('valor_base, numero, estado')
          .eq('id', data.vivienda_id)
          .maybeSingle()

        return {
          ...data,
          viviendas: viviendaData
        }
      }

      return data
    },
    enabled: !!cliente.id,
  })

  // Obtener fuentes de pago de la negociación
  const {
    data: fuentesPago = [],
    isLoading: isLoadingFuentes,
    error: errorFuentes,
    refetch: refetchFuentes
  } = useQuery({
    queryKey: ['fuentes-pago', negociacion?.id],
    queryFn: () => fuentesPagoService.obtenerFuentesPagoNegociacion(negociacion!.id),
    enabled: !!negociacion?.id,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // Obtener configuración de tipos de fuentes de pago
  const {
    data: tiposFuentesConfig = [],
    isLoading: isLoadingTipos
  } = useQuery({
    queryKey: ['tipos-fuentes-pago-config'],
    queryFn: async (): Promise<TipoFuentePagoConfig[]> => {
      const { data, error } = await supabase
        .from('tipos_fuentes_pago')
        .select('*')
        .eq('activo', true)
        .order('orden')

      if (error) {
        console.error('Error obteniendo tipos de fuentes:', error)
        return []
      }

      return (data as unknown as TipoFuentePagoConfig[]) || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (config no cambia frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })

  // ✅ Obtener requisitos REALES desde BD (obligatorios + opcionales)
  const {
    data: requisitosConfig = [],
    isLoading: isLoadingRequisitos
  } = useQuery({
    queryKey: ['requisitos-fuentes-pago-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requisitos_fuentes_pago_config')
        .select('id,tipo_fuente,paso_identificador,titulo,descripcion,instrucciones,nivel_validacion,tipo_documento_sugerido,categoria_documento,alcance,orden,activo,version,fecha_creacion,fecha_actualizacion')
        .eq('activo', true)
        // ✅ INCLUIR TODOS: obligatorios + opcionales (no filtrar por nivel_validacion)
        .order('tipo_fuente')
        .order('orden')

      if (error) {
        console.error('Error obteniendo requisitos:', error)
        return []
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos (config no cambia frecuentemente)
    gcTime: 30 * 60 * 1000, // 30 minutos
  })

  // ============================================
  // MUTATIONS
  // ============================================

  // Actualizar fuente de pago
  const actualizarFuenteMutation = useMutation({
    mutationFn: ({ id, datos }: { id: string, datos: ActualizarFuentePagoDTO }) =>
      fuentesPagoService.actualizarFuentePago(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuentes-pago'] })
      queryClient.invalidateQueries({ queryKey: ['negociacion-activa'] })
      toast.success('Fuente de pago actualizada correctamente')
    },
    onError: (error) => {
      console.error('Error actualizando fuente de pago:', error)
      toast.error('Error al actualizar la fuente de pago')
    }
  })

  // Crear nueva fuente de pago
  const crearFuenteMutation = useMutation({
    mutationFn: (tipo: TipoFuentePago) =>
      fuentesPagoService.crearFuentePago({
        negociacion_id: negociacion!.id,
        tipo,
        monto_aprobado: 0
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuentes-pago'] })
      toast.success('Fuente de pago agregada correctamente')
    },
    onError: (error) => {
      console.error('Error creando fuente de pago:', error)
      toast.error('Error al agregar la fuente de pago')
    }
  })

  // Eliminar fuente de pago
  const eliminarFuenteMutation = useMutation({
    mutationFn: (id: string) => fuentesPagoService.eliminarFuentePago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuentes-pago'] })
      toast.success('Fuente de pago eliminada correctamente')
    },
    onError: (error) => {
      console.error('Error eliminando fuente de pago:', error)
      toast.error('Error al eliminar la fuente de pago')
    }
  })

  // Obtener documentos del cliente para validación
  const {
    data: documentosCliente = []
  } = useQuery({
    queryKey: ['documentos-cliente', cliente.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_cliente')
        .select('*')
        .eq('cliente_id', cliente.id)
        .eq('estado', 'activo')
        .order('fecha_creacion', { ascending: false })

      if (error) {
        console.error('Error obteniendo documentos del cliente:', error)
        return []
      }

      return data || []
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // ============================================
  // BUSINESS LOGIC - FUNCIONES DE UTILIDAD
  // ============================================

  // Mapeo dinámico de iconos disponibles
  const iconMap = useMemo(() => ({
    'Wallet': Wallet,
    'Building2': Building2,
    'Home': Home,
    'Shield': Shield,
    'CreditCard': CreditCard,
    'Landmark': Landmark,
    'BadgeDollarSign': BadgeDollarSign,
    'DollarSign': DollarSign,
    'Banknote': Banknote,
    'HandCoins': HandCoins,
    'Building': Building, // Fallback
    'Gift': Gift, // Fallback
  }), [])

  // Mapeo dinámico de colores
  const getColorClasses = useCallback((color: string) => {
    const colorMap = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50',
      green: 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/50',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/50',
      red: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50',
      cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/50',
      pink: 'bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-500/50',
      indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/50',
      yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/50',
      emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/50',
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue // Fallback a azul
  }, [])

  // Obtener configuración dinámica de un tipo
  const getTipoConfig = useCallback((tipo: TipoFuentePago) => {
    const config = tiposFuentesConfig.find(tc => tc.nombre === tipo)

    if (!config) {
      // Fallback si no se encuentra configuración
      return {
        icon: DollarSign,
        styles: getColorClasses('blue'),
        iconStyles: 'text-white'
      }
    }

    const IconComponent = iconMap[config.icono] || DollarSign

    return {
      icon: IconComponent,
      styles: getColorClasses(config.color),
      iconStyles: 'text-white'
    }
  }, [tiposFuentesConfig, iconMap, getColorClasses])

  // ✅ Función auxiliar para obtener documentos requeridos DESDE BD (con nivel de validación)
  const getDocumentosRequeridos = useCallback((tipoFuente: string | undefined) => {
    if (!tipoFuente) return []

    // ✅ INCLUIR TODOS: obligatorios + opcionales (NO filtrar)
    const requisitosDelTipo = requisitosConfig.filter(
      req => req.tipo_fuente === tipoFuente
    )

    // Retornar objetos completos con título y nivel de validación
    return requisitosDelTipo.map(req => ({
      titulo: req.titulo,
      nivel: req.nivel_validacion,
      obligatorio: req.nivel_validacion === 'DOCUMENTO_OBLIGATORIO'
    }))
  }, [requisitosConfig])

  // Estado de documentación ESPECÍFICA por tipo de fuente
  const getDocumentacionEstado = useCallback((fuente: FuentePago) => {
    const documentosRequeridos = getDocumentosRequeridos(fuente.tipo)

    // Si no hay documentos requeridos para este tipo de fuente
    if (documentosRequeridos.length === 0) {
      return {
        estado: 'no_requerido' as const,
        mensaje: 'Se gestiona por abonos',
        detalle: 'Esta fuente no requiere documentos específicos',
        documentos: {
          total: 0,
          subidos: 0,
          pendientes: 0,
          obligatoriosPendientes: 0
        }
      }
    }

    // Buscar documentos subidos
    const documentosSubidos = documentosCliente?.filter(doc =>
      documentosRequeridos.some(reqDoc =>
        doc.titulo?.toLowerCase().includes(reqDoc.titulo.toLowerCase()) ||
        doc.tipo_documento?.toLowerCase().includes(reqDoc.titulo.toLowerCase())
      )
    ) || []

    const documentosPendientes = documentosRequeridos.filter(
      doc => !documentosSubidos.some(subido =>
        (subido.titulo?.toLowerCase() || '').includes(doc.titulo.toLowerCase()) ||
        (subido.tipo_documento?.toLowerCase() || '').includes(doc.titulo.toLowerCase())
      )
    )

    // Determinar el estado general
    let estado: 'completo' | 'pendiente' | 'parcial'
    let mensaje: string

    if (documentosPendientes.length === 0) {
      estado = 'completo'
      mensaje = `✅ Documentos completos (${documentosSubidos.length}/${documentosRequeridos.length})`
    } else if (documentosSubidos.length > 0) {
      estado = 'parcial'
      mensaje = `⚠️ Faltan ${documentosPendientes.length} documento(s)`
    } else {
      estado = 'pendiente'
      mensaje = `❌ Faltan ${documentosPendientes.length} documento(s) requerido(s)`
    }

    return {
      estado,
      mensaje,
      detalle: `${documentosSubidos.length}/${documentosRequeridos.length} documentos subidos`,
      documentos: {
        total: documentosRequeridos.length,
        subidos: documentosSubidos.length,
        pendientes: documentosPendientes.length,
        obligatoriosPendientes: documentosPendientes.filter(d => d.obligatorio).length,
        lista: documentosRequeridos.map(doc => ({
          nombre: doc.titulo,
          obligatorio: doc.obligatorio,
          nivel: doc.nivel,
          subido: documentosSubidos.some(subido =>
            (subido.titulo?.toLowerCase() || '').includes(doc.titulo.toLowerCase()) ||
            (subido.tipo_documento?.toLowerCase() || '').includes(doc.titulo.toLowerCase())
          )
        }))
      }
    }
  }, [getDocumentosRequeridos, documentosCliente])

  // Verificar si todas las fuentes posibles están creadas
  const todasFuentesCreadas = useMemo(() => {
    if (!tiposFuentesConfig.length || !fuentesPago.length) return false

    // Verificar que exista una fuente para cada tipo configurado
    const tiposCreados = new Set(fuentesPago.map(f => f.tipo).filter(Boolean))
    const tiposDisponibles = tiposFuentesConfig.map(t => t.nombre)

    return tiposDisponibles.every(tipoId => tiposCreados.has(tipoId as TipoFuentePago))
  }, [tiposFuentesConfig, fuentesPago])

  // Mensaje para el botón deshabilitado
  const mensajeBotonDeshabilitado = useMemo(() => {
    if (todasFuentesCreadas) {
      const totalTipos = tiposFuentesConfig.length
      const tiposCreados = fuentesPago.length
      return `Ya se han creado todas las fuentes de pago disponibles (${tiposCreados}/${totalTipos}). No es posible agregar más fuentes.`
    }
    return ''
  }, [todasFuentesCreadas, tiposFuentesConfig.length, fuentesPago.length])

  // Filtrar tipos disponibles (que no han sido creados aún)
  const tiposDisponibles = useMemo(() => {
    if (!tiposFuentesConfig.length) return []

    const tiposCreados = new Set(fuentesPago.map(f => f.tipo).filter(Boolean))
    return tiposFuentesConfig.filter(tipo => !tiposCreados.has(tipo.nombre as TipoFuentePago))
  }, [tiposFuentesConfig, fuentesPago])

  // Calcular progreso CORREGIDO
  const calcularProgreso = useCallback((fuente: FuentePago) => {
    if (fuente.monto_aprobado === 0) return 0
    const montoRecibido = fuente.monto_recibido || 0
    const progreso = Math.round((montoRecibido / fuente.monto_aprobado) * 100)

    // Para fuentes completadas (monto recibido = monto aprobado), mostrar 100%
    if (progreso === 0 && fuente.monto_recibido && fuente.monto_recibido >= fuente.monto_aprobado) return 100

    return progreso
  }, [])

  // Mapeo de estados (compactos)
  const getEstadoStyles = useCallback((estado: string) => {
    switch (estado) {
      case 'Activa':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'Inactiva':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
      case 'Completado':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
    }
  }, [])

  // Estilos de progreso según porcentaje (compactos)
  const getProgressStyles = useCallback((porcentaje: number) => {
    if (porcentaje >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (porcentaje >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-red-500 to-pink-500'
  }, [])

  // ============================================
  // HANDLERS
  // ============================================

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const valorTotalVivienda = useMemo(() => {
    if (!negociacion) {
      // Sin negociación activa, retornar 0 (estado inicial normal)
      return 0
    }

    // Prioridad: valor_total de negociación > valor_negociado > valor_base de vivienda
    let valor = 0
    let fuente = ''

    if (negociacion.valor_total) {
      valor = Number(negociacion.valor_total)
      fuente = 'valor_total de negociación'
    } else if (negociacion.valor_negociado) {
      valor = Number(negociacion.valor_negociado)
      fuente = 'valor_negociado de negociación'
    } else if (negociacion.viviendas?.valor_base) {
      valor = Number(negociacion.viviendas.valor_base)
      fuente = 'valor_base de vivienda'
    }

    if (valor > 0) {
    } else {
      console.warn('❌ No se pudo obtener valor de vivienda:', {
        negociacion,
        valor_total: negociacion.valor_total,
        valor_negociado: negociacion.valor_negociado,
        vivienda_valor_base: negociacion.viviendas?.valor_base
      })
    }

    return valor
  }, [negociacion])

  const metricas = useMemo((): MetricasFuentesPago => {
    const cierre = calcularCierreFinanciero(fuentesPago, valorTotalVivienda)
    const totalFuentesConfiguradas = cierre.totalParaCierre

    const saldoPendiente = cierre.diferencia

    const porcentajeCompletado = cierre.porcentajeCubierto

    // Solo contar fuentes que requieren documentación (Crédito e Hipotecario y Subsidio Mi Casa Ya)
    const fuentesQueRequierenDoc = fuentesPago.filter(
      f => esCreditoHipotecario(f.tipo) || esSubsidioMiCasaYa(f.tipo)
    )

    const fuentesConDocumentacion = 0 // Sistema nuevo: ver vista_documentos_pendientes_fuentes
    const fuentesSinDocumentacion = 0 // Sistema nuevo: ver vista_documentos_pendientes_fuentes

    return {
      valorTotalVivienda,
      totalFuentesConfiguradas,
      saldoPendiente,
      porcentajeCompletado,
      fuentesConDocumentacion,
      fuentesSinDocumentacion,
    }
  }, [fuentesPago, valorTotalVivienda])

  const estadoValidacion = useMemo((): EstadoValidacion => {
    const mensajes: string[] = []
    const tieneFuentes = fuentesPago.length > 0
    const sumaCuadra = Math.abs(metricas.saldoPendiente) < 100 // Tolerancia de $100

    // Solo verificar documentación en fuentes que la requieren
    const fuentesQueRequierenDoc = fuentesPago.filter(
      f => esCreditoHipotecario(f.tipo) || esSubsidioMiCasaYa(f.tipo)
    )

    const todasConDocumentacion = true // Sistema nuevo: usa vista_documentos_pendientes_fuentes

    if (!tieneFuentes) {
      mensajes.push('⚠️ No hay fuentes de pago configuradas')
    }

    if (tieneFuentes && metricas.saldoPendiente > 100) {
      mensajes.push(`💰 Faltan ${formatCurrency(metricas.saldoPendiente)} por cubrir`)
    }

    if (tieneFuentes && metricas.saldoPendiente < -100) {
      mensajes.push(`📈 Excede por ${formatCurrency(Math.abs(metricas.saldoPendiente))}`)
    }

    if (tieneFuentes && !todasConDocumentacion) {
      mensajes.push(`📄 ${metricas.fuentesSinDocumentacion} fuentes sin documentación`)
    }

    const puedeRegistrarAbonos = tieneFuentes && sumaCuadra && todasConDocumentacion

    return {
      tieneFuentes,
      sumaCuadra,
      todasConDocumentacion,
      puedeRegistrarAbonos,
      mensajesValidacion: mensajes,
    }
  }, [fuentesPago, metricas])

  // ============================================
  // HANDLERS
  // ============================================

  const handleEditarFuente = useCallback((fuente: FuentePago) => {
    setFuenteParaEditar(fuente)
    setModalEditarAbierto(true)
  }, [])

  const handleGuardarFuente = useCallback(async (fuenteEditada: FuenteEditada) => {
    if (!fuenteEditada.id) return

    try {
      await actualizarFuenteMutation.mutateAsync({
        id: fuenteEditada.id,
        datos: {
          monto_aprobado: fuenteEditada.monto_aprobado,
          entidad: fuenteEditada.entidad,
          numero_referencia: fuenteEditada.numero_referencia,
        }
      })

      setModalEditarAbierto(false)
      setFuenteParaEditar(null)
    } catch (error) {
      // Error ya manejado por la mutation
    }
  }, [actualizarFuenteMutation])

  const handleAgregarFuente = useCallback(async (tipo: TipoFuentePago) => {
    if (!negociacion?.id) return

    try {
      await crearFuenteMutation.mutateAsync(tipo)
    } catch (error) {
      // Error ya manejado por la mutation
    }
  }, [crearFuenteMutation, negociacion])

  const handleEliminarFuente = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta fuente de pago? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await eliminarFuenteMutation.mutateAsync(id)
    } catch (error) {
      // Error ya manejado por la mutation
    }
  }, [eliminarFuenteMutation])

  const handleVerHistorial = useCallback(() => {
    setModalHistorialAbierto(true)
  }, [])

  const handleVerValidacion = useCallback(() => {
    setModalValidacionAbierto(true)
  }, [])

  const handleNavegar = useCallback((destino: 'documentos' | 'abonos') => {
    if (destino === 'documentos') {
      // Por ahora solo mostrar console.log, se puede implementar navegación después
    } else if (destino === 'abonos') {
      // Navegar al módulo de abonos
    }
  }, [])

  const handleGestionarDocumentos = useCallback((fuenteId: string) => {
    toast.info('Navegando al módulo de Documentos para gestionar documentación...')
    // TODO: Implementar navegación real al módulo de documentos
    // router.push(`/documentos?fuente=${fuenteId}&action=upload`)
  }, [])

  const handleVerDocumentos = useCallback((fuenteId: string) => {
    toast.info('Navegando a documentos existentes...')
    // TODO: Implementar navegación real
    // router.push(`/documentos?fuente=${fuenteId}&action=view`)
  }, [])

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  const isLoading = isLoadingNegociacion || isLoadingFuentes || isLoadingTipos || isLoadingRequisitos
  const isUpdating = actualizarFuenteMutation.isPending ||
                     crearFuenteMutation.isPending ||
                     eliminarFuenteMutation.isPending

  const error = errorNegociacion || errorFuentes

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    negociacion,
    fuentesPago,
    tiposFuentesConfig,
    metricas,
    estadoValidacion,
    isLoading,
    isUpdating,
    error,

    // Modales
    modalEditarAbierto,
    fuenteParaEditar,
    modalHistorialAbierto,
    modalValidacionAbierto,
    setModalEditarAbierto,
    setFuenteParaEditar,
    setModalHistorialAbierto,
    setModalValidacionAbierto,

    // Business Logic Functions (LÓGICA PROCESADA)
    getTipoConfig,
    getDocumentacionEstado,
    calcularProgreso,
    getEstadoStyles,
    getProgressStyles,
    tiposDisponibles,

    // Lógica de fuentes disponibles
    todasFuentesCreadas,
    mensajeBotonDeshabilitado,

    // Handlers
    handleEditarFuente,
    handleGuardarFuente,
    handleAgregarFuente,
    handleEliminarFuente,
    handleVerHistorial,
    handleVerValidacion,
    handleNavegar,
    handleGestionarDocumentos,
    handleVerDocumentos,
    refetchFuentes,
  }
}
