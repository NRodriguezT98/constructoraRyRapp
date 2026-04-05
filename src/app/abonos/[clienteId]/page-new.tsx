'use client'

import { useMemo, useState } from 'react'

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
  Wallet,
} from 'lucide-react'

import { useParams, useRouter } from 'next/navigation'

import { formatNombreCompleto } from '@/lib/utils/string.utils'
import {
  useHistorialAbonosQuery,
  useInvalidateNegociacionDetalle,
  useNegociacionesAbonos,
} from '@/modules/abonos/hooks'
import type { FuentePagoConAbonos } from '@/modules/abonos/types'
import { Button } from '@/shared/components/ui/button'

/**
 * 🎨 PÁGINA DE GESTIÓN DE ABONOS - DISEÑO PREMIUM
 */
export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.clienteId as string

  const { negociaciones, isLoading } = useNegociacionesAbonos()
  const invalidateDetalle = useInvalidateNegociacionDetalle()
  const [_modalAbonoOpen, setModalAbonoOpen] = useState(false)
  const [_fuenteSeleccionada, setFuenteSeleccionada] =
    useState<FuentePagoConAbonos | null>(null)

  const negociacion = useMemo(
    () => negociaciones.find(n => n.cliente.id === clienteId),
    [negociaciones, clienteId]
  )

  // Historial con React Query (reemplaza useEffect manual)
  const { data: _abonos = [], isLoading: _loadingAbonos } =
    useHistorialAbonosQuery(negociacion?.id ?? null)

  const _recargarDatos = () => {
    invalidateDetalle(negociacion?.id)
  }

  const _handleRegistrarAbono = (fuente: FuentePagoConAbonos) => {
    setFuenteSeleccionada(fuente)
    setModalAbonoOpen(true)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950'>
        <div className='mx-auto max-w-7xl space-y-6'>
          <div className='animate-pulse'>
            <div className='h-48 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700'></div>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='h-32 animate-pulse rounded-xl bg-white/50 dark:bg-gray-800/50'
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!negociacion) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'
        >
          <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500'>
            <User className='h-10 w-10 text-white' />
          </div>
          <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
            Cliente no encontrado
          </h3>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            No se encontró información para este cliente
          </p>
          <Button
            onClick={() => router.push('/abonos')}
            className='bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver a la lista
          </Button>
        </motion.div>
      </div>
    )
  }

  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = formatNombreCompleto(
    `${cliente.nombres} ${cliente.apellidos}`
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950'>
      <div className='mx-auto max-w-7xl space-y-6 p-6'>
        {/* 🎨 HEADER PREMIUM CON GRADIENTE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-8 shadow-2xl'
        >
          {/* Patrón de fondo animado */}
          <div className='absolute inset-0 opacity-10'>
            <div
              className='absolute inset-0'
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>

          {/* Efectos de luz */}
          <div className='absolute right-0 top-0 h-96 w-96 rounded-full bg-white/20 blur-3xl'></div>
          <div className='absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl'></div>

          <div className='relative z-10'>
            {/* Breadcrumb */}
            <div className='mb-6 flex items-center gap-2 text-sm text-white/80'>
              <button
                onClick={() => router.push('/abonos')}
                className='flex items-center gap-1 transition-colors hover:text-white'
              >
                <Wallet className='h-4 w-4' />
                <span>Abonos</span>
              </button>
              <ChevronRight className='h-4 w-4' />
              <span className='font-medium text-white'>{nombreCompleto}</span>
            </div>

            <div className='flex items-start justify-between'>
              {/* Info del cliente */}
              <div className='flex items-center gap-6'>
                {/* Avatar grande */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className='flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white/30 bg-gradient-to-br from-white/30 to-white/10 shadow-xl backdrop-blur-xl'
                >
                  <User className='h-12 w-12 text-white' />
                </motion.div>

                <div className='space-y-2'>
                  <h1 className='flex items-center gap-3 text-4xl font-bold text-white'>
                    {nombreCompleto}
                    <Sparkles className='h-6 w-6 animate-pulse text-yellow-300' />
                  </h1>
                  <div className='flex items-center gap-4 text-white/90'>
                    <div className='flex items-center gap-2'>
                      <Hash className='h-4 w-4' />
                      <span className='text-sm'>
                        CC {cliente.numero_documento}
                      </span>
                    </div>
                    {cliente.telefono && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4' />
                        <span className='text-sm'>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.email && (
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        <span className='text-sm'>{cliente.email}</span>
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-white/80'>
                    <Building className='h-4 w-4' />
                    <span>{proyecto.nombre}</span>
                    <span className='text-white/60'>•</span>
                    <span>Vivienda #{vivienda.numero}</span>
                  </div>
                </div>
              </div>

              {/* Botón de volver */}
              <Button
                onClick={() => router.push('/abonos')}
                variant='outline'
                className='border-white/30 bg-white/20 text-white backdrop-blur-xl hover:bg-white/30'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Volver
              </Button>
            </div>
          </div>
        </motion.div>

        <p className='text-center text-2xl font-bold text-gray-900 dark:text-white'>
          ✨ Diseño Premium en Construcción ✨
        </p>
        <p className='text-center text-gray-600 dark:text-gray-400'>
          Continuará con cards de fuentes de pago, timeline de abonos y más...
        </p>
      </div>
    </div>
  )
}
