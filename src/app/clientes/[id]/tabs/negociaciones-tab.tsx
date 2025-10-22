'use client'

import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { Cliente } from '@/modules/clientes/types'
import { Tooltip } from '@/shared/components/ui'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    ArrowRight,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Home,
    Lock,
    Plus,
    XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NegociacionesTabProps {
  cliente: Cliente
}

// Colores por estado
// ✅ ACTUALIZADO (2025-10-22): Estados según migración 003
// Consultar: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
const ESTADOS_CONFIG = {
  'Activa': {
    color: 'green',
    icon: CheckCircle2,
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  'Suspendida': {
    color: 'yellow',
    icon: Clock,
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  'Cerrada por Renuncia': {
    color: 'gray',
    icon: XCircle,
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800'
  },
  'Completada': {
    color: 'blue',
    icon: Building2,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
}

export function NegociacionesTab({ cliente }: NegociacionesTabProps) {
  const router = useRouter()
  const [negociaciones, setNegociaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const tieneCedula = !!cliente.documento_identidad_url

  // Función para cargar negociaciones
  const cargarNegociaciones = async () => {
    setLoading(true)
    try {
      const data = await negociacionesService.obtenerNegociacionesCliente(cliente.id)
      console.log('📊 Negociaciones cargadas:', data)
      setNegociaciones(data)
    } catch (err) {
      console.error('Error cargando negociaciones:', err)
      setNegociaciones([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar al montar
  useEffect(() => {
    if (cliente.id) cargarNegociaciones()
  }, [cliente.id])

  // 🔥 ESCUCHAR EVENTO DE RECARGA (cuando se crea nueva negociación)
  useEffect(() => {
    const handleRecargar = () => {
      console.log('🔄 Evento recibido: recargar negociaciones')
      cargarNegociaciones()
    }

    window.addEventListener('negociacion-creada', handleRecargar)
    return () => window.removeEventListener('negociacion-creada', handleRecargar)
  }, [cliente.id])

  const cambiarATabDocumentos = () => {
    // Disparar evento para cambiar de tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cambiar-tab', { detail: 'documentos' }));
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Cargando negociaciones...</p>

  return (
    <div className="space-y-4">
      {/* Banner de advertencia si NO tiene cédula */}
      {!tieneCedula && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1.5">
                Cédula de ciudadanía requerida
              </h3>
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2.5">
                Para crear negociaciones, primero debes subir la cédula del cliente en la pestaña <strong>"Documentos"</strong>.
              </p>
              <button
                onClick={cambiarATabDocumentos}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Ir a Documentos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header con botón de crear */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Negociaciones ({negociaciones.length})
        </h3>

        <Tooltip
          content={
            !tieneCedula ? (
              <div className="flex flex-col gap-1">
                <span className="font-semibold">⚠️ Cédula requerida</span>
                <span className="text-xs opacity-90">
                  Primero debes subir la cédula del cliente
                </span>
              </div>
            ) : (
              'Crear nueva negociación para este cliente'
            )
          }
          side="left"
        >
          <button
            disabled={!tieneCedula}
            onClick={() => {
              if (tieneCedula) {
                router.push(`/clientes/${cliente.id}/negociaciones/crear?nombre=${encodeURIComponent(cliente.nombre_completo || cliente.nombres || '')}` as any)
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all ${
              tieneCedula
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {tieneCedula ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                Crear Negociación
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Crear Negociación
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {negociaciones.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <h3 className="mb-1.5 text-base font-semibold text-gray-900 dark:text-white">
            Sin negociaciones activas
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Este cliente no tiene negociaciones registradas todavía.
          </p>
        </div>
      )}

      {/* Lista de Negociaciones con diseño mejorado */}
      <div className="space-y-3">
        {negociaciones.map((negociacion) => {
          const estadoConfig = ESTADOS_CONFIG[negociacion.estado as keyof typeof ESTADOS_CONFIG] || ESTADOS_CONFIG['Activa']
          const IconoEstado = estadoConfig.icon

          // Calcular valor con descuento
          const valorBase = negociacion.valor_negociado || 0
          const descuento = negociacion.descuento_aplicado || 0
          const valorFinal = valorBase - descuento

          return (
            <div
              key={negociacion.id}
              className={`group relative overflow-hidden rounded-xl border-2 ${estadoConfig.border} bg-white p-4 shadow-sm transition-all hover:shadow-xl dark:bg-gray-800`}
            >
              {/* Barra de color lateral */}
              <div
                className={`absolute left-0 top-0 h-full w-1.5 ${estadoConfig.bg.replace('bg-', 'bg-')}`}
              />

              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${estadoConfig.bg}`}>
                    <Building2 className={`h-5 w-5 ${estadoConfig.text}`} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {negociacion.proyecto?.nombre || 'Proyecto sin nombre'}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Home className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {negociacion.vivienda?.manzanas?.nombre ? `${negociacion.vivienda.manzanas.nombre} - ` : ''}
                        Casa {negociacion.vivienda?.numero || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge de Estado */}
                <span className={`inline-flex items-center gap-1 rounded-full ${estadoConfig.bg} ${estadoConfig.text} px-2.5 py-1 text-[10px] font-semibold`}>
                  <IconoEstado className="h-3 w-3" />
                  {negociacion.estado}
                </span>
              </div>

              {/* Información del Valor */}
              <div className="mb-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                {/* Valor Base */}
                <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-700/50">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-400 mb-0.5">
                    <DollarSign className="h-3 w-3" />
                    <span>Valor Base</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    ${valorBase.toLocaleString('es-CO')}
                  </p>
                </div>

                {/* Descuento */}
                {descuento > 0 && (
                  <div className="rounded-lg bg-orange-50 p-2.5 dark:bg-orange-900/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-orange-600 dark:text-orange-400 mb-0.5">
                      <DollarSign className="h-3 w-3" />
                      <span>Descuento</span>
                    </div>
                    <p className="text-base font-bold text-orange-700 dark:text-orange-300">
                      -${descuento.toLocaleString('es-CO')}
                    </p>
                  </div>
                )}

                {/* Valor Final */}
                <div className="rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 mb-0.5">
                    <DollarSign className="h-3 w-3" />
                    <span>Valor Final</span>
                  </div>
                  <p className="text-base font-bold text-green-700 dark:text-green-300">
                    ${valorFinal.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Footer: Fecha y Acciones */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Creada{' '}
                    {negociacion.fecha_creacion
                      ? formatDistanceToNow(new Date(negociacion.fecha_creacion), {
                          addSuffix: true,
                          locale: es,
                        })
                      : 'recientemente'}
                  </span>
                </div>

                <button
                  onClick={() => router.push(`/clientes/${cliente.id}/negociaciones/${negociacion.id}` as any)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
                >
                  <span>Ver Detalle</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAB: Botón flotante cuando hay muchas negociaciones */}
      <AnimatePresence>
        {negociaciones.length > 5 && tieneCedula && (
          <Tooltip content="Crear nueva negociación" side="left">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                router.push(`/clientes/${cliente.id}/negociaciones/crear?nombre=${encodeURIComponent(cliente.nombre_completo || cliente.nombres || '')}` as any)
              }}
              className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-shadow"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </Tooltip>
        )}
      </AnimatePresence>
    </div>
  )
}
