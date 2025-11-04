/**
 * 🚨 COMPONENTE: ALERTA DE VALIDACIÓN DE DESEMBOLSO
 *
 * Muestra mensaje cuando un desembolso no puede ser registrado
 * porque falta completar un paso del proceso.
 */

'use client'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { clientesService } from '@/modules/clientes/services/clientes.service'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { ResultadoValidacion } from '../../services/validacion-desembolsos.service'

interface AlertaValidacionDesembolsoProps {
  resultado: ResultadoValidacion
  negociacionId: string
  clienteId: string
  onDismiss?: () => void
}

export function AlertaValidacionDesembolso({
  resultado,
  negociacionId,
  clienteId,
  onDismiss,
}: AlertaValidacionDesembolsoProps) {
  const router = useRouter()
  const [clienteUrl, setClienteUrl] = useState<string>(`/clientes/${clienteId}`)

  // Construir URL con slug al montar
  useEffect(() => {
    const construirUrl = async () => {
      try {
        const cliente = await clientesService.obtenerCliente(clienteId)
        if (!cliente) {
          setClienteUrl(`/clientes/${clienteId}?tab=proceso`)
          return
        }
        const url = construirURLCliente({
          id: cliente.id,
          nombre_completo: cliente.nombre_completo,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos
        })
        setClienteUrl(`${url}?tab=proceso`)
      } catch (error) {
        console.error('Error al construir URL de cliente:', error)
        // Fallback a UUID directo
        setClienteUrl(`/clientes/${clienteId}?tab=proceso`)
      }
    }
    construirUrl()
  }, [clienteId])

  if (resultado.permitido) return null

  const handleIrAProceso = () => {
    // Redirigir al proceso del cliente con URL amigable
    router.push(clienteUrl)
    onDismiss?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="rounded-lg border-2 border-orange-200 bg-orange-50/80 backdrop-blur-sm p-4 space-y-3"
    >
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-orange-900 mb-1">
            Paso del Proceso Requerido
          </h4>
          <p className="text-sm text-orange-700 leading-relaxed">
            {resultado.razon}
          </p>
        </div>
      </div>

      {/* Información del paso */}
      {resultado.pasoRequerido && (
        <div className="ml-13 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-orange-200">
              <span className="font-medium text-gray-700">Paso:</span>
              <span className="text-gray-900">{resultado.pasoRequerido.nombre}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-orange-200">
              {resultado.pasoRequerido.estado === 'Completado' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-orange-600" />
              )}
              <span className="text-gray-700">{resultado.pasoRequerido.estado}</span>
            </div>
          </div>

          {/* Botón para ir al proceso */}
          <button
            onClick={handleIrAProceso}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gradient-to-r from-orange-500 to-orange-600
                     hover:from-orange-600 hover:to-orange-700
                     text-white text-sm font-medium
                     transition-all duration-200 shadow-sm hover:shadow-md
                     group"
          >
            <span>Ir al Proceso de Compra</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
