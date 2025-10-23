'use client'

import { Button } from '@/components/ui/button'
import { useAbonos } from '@/modules/abonos/hooks'
import { obtenerHistorialAbonos } from '@/modules/abonos/services/abonos.service'
import type { AbonoHistorial, FuentePagoConAbonos } from '@/modules/abonos/types'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Building,
    ChevronRight,
    Hash,
    Mail,
    Phone,
    Sparkles,
    User,
    Wallet
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

/**
 * 🎨 PÁGINA DE GESTIÓN DE ABONOS - DISEÑO PREMIUM
 */
export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.clienteId as string

  const { negociaciones, isLoading, refrescar } = useAbonos()
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false)
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState<FuentePagoConAbonos | null>(null)
  const [abonos, setAbonos] = useState<AbonoHistorial[]>([])
  const [loadingAbonos, setLoadingAbonos] = useState(false)

  const negociacion = useMemo(
    () => negociaciones.find((n) => n.cliente.id === clienteId),
    [negociaciones, clienteId]
  )

  useEffect(() => {
    async function cargarAbonos() {
      if (!negociacion?.id) return

      setLoadingAbonos(true)
      try {
        const historial = await obtenerHistorialAbonos({ negociacion_id: negociacion.id })
        setAbonos(historial)
      } catch (error) {
        console.error('Error cargando abonos:', error)
      } finally {
        setLoadingAbonos(false)
      }
    }

    cargarAbonos()
  }, [negociacion?.id])

  const recargarDatos = async () => {
    await refrescar()
    if (negociacion?.id) {
      setLoadingAbonos(true)
      try {
        const historial = await obtenerHistorialAbonos({ negociacion_id: negociacion.id })
        setAbonos(historial)
      } catch (error) {
        console.error('Error recargando abonos:', error)
      } finally {
        setLoadingAbonos(false)
      }
    }
  }

  const handleRegistrarAbono = (fuente: FuentePagoConAbonos) => {
    setFuenteSeleccionada(fuente)
    setModalAbonoOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!negociacion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cliente no encontrado</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">No se encontró información para este cliente</p>
          <Button onClick={() => router.push('/abonos')} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </motion.div>
      </div>
    )
  }

  const { cliente, vivienda, proyecto, fuentes_pago } = negociacion
  const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.trim()
  const totalAbonado = negociacion.total_abonado || 0
  const saldoPendiente = negociacion.saldo_pendiente || 0
  const valorTotal = negociacion.valor_total || 0
  const porcentajePagado = negociacion.porcentaje_pagado || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* 🎨 HEADER PREMIUM CON GRADIENTE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-8 shadow-2xl"
        >
          {/* Patrón de fondo animado */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Efectos de luz */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-6">
              <button
                onClick={() => router.push('/abonos')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Abonos</span>
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{nombreCompleto}</span>
            </div>

            <div className="flex items-start justify-between">
              {/* Info del cliente */}
              <div className="flex items-center gap-6">
                {/* Avatar grande */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border-2 border-white/30 flex items-center justify-center shadow-xl"
                >
                  <User className="w-12 h-12 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                    {nombreCompleto}
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">CC {cliente.numero_documento}</span>
                    </div>
                    {cliente.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{cliente.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Building className="w-4 h-4" />
                    <span>{proyecto.nombre}</span>
                    <span className="text-white/60">•</span>
                    <span>Vivienda #{vivienda.numero_vivienda}</span>
                  </div>
                </div>
              </div>

              {/* Botón de volver */}
              <Button
                onClick={() => router.push('/abonos')}
                variant="outline"
                className="bg-white/20 backdrop-blur-xl border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          ✨ Diseño Premium en Construcción ✨
        </p>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Continuará con cards de fuentes de pago, timeline de abonos y más...
        </p>
      </div>
    </div>
  )
}
