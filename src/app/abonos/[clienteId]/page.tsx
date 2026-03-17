'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Loader2, Wallet } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { ModalRegistroPago } from '@/modules/abonos/components/modal-registro-pago'

import {
  FuentePagoCard,
  HeaderCliente,
  MetricasCards,
  TimelineAbonos,
} from './components'
import { useAbonosDetalle } from './hooks/useAbonosDetalle'

interface PageProps {
  params: Promise<{ clienteId: string }>
}

export default function AbonosDetallePage({ params }: PageProps) {
  const resolvedParams = React.use(params)
  const clienteIdOrSlug = resolvedParams.clienteId
  const router = useRouter()

  // Resolver slug a UUID
  const [clienteId, setClienteId] = React.useState<string | null>(null)
  const [isResolving, setIsResolving] = React.useState(true)

  React.useEffect(() => {
    resolverSlugCliente(clienteIdOrSlug).then(uuid => {
      setClienteId(uuid)
      setIsResolving(false)
    })
  }, [clienteIdOrSlug])

  const {
    negociacion,
    metricas,
    abonos,
    fuenteSeleccionada,
    isLoading,
    loadingAbonos,
    modalAbonoOpen,
    validarFuentePago,
    handleRegistrarAbono,
    handleCerrarModal,
    handleAbonoRegistrado,
  } = useAbonosDetalle(clienteId ?? '')

  const handleVolver = () => router.push('/abonos')

  if (isResolving || !clienteId || isLoading || !negociacion) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950'>
        <Loader2 className='h-10 w-10 animate-spin text-emerald-500' />
      </div>
    )
  }

  return (
    <motion.div
      className='relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gradiente atmosférico solo en dark mode */}
      <div
        className='pointer-events-none absolute inset-0 hidden dark:block'
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(20,184,166,0.08), transparent)',
        }}
      />
      {/* Orbs de ambiente - solo en dark */}
      <div className='pointer-events-none absolute inset-0 hidden overflow-hidden dark:block'>
        <div className='absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl' />
        <div className='bg-teal-600/8 absolute -left-32 top-1/2 h-80 w-80 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl' />
      </div>

      <div className='relative z-10 mx-auto max-w-5xl space-y-5 px-4 py-6'>
        {/* Header */}
        <HeaderCliente
          negociacion={negociacion}
          onVolver={handleVolver}
          onRegistrarAbono={() =>
            negociacion.fuentes_pago?.[0] &&
            handleRegistrarAbono(negociacion.fuentes_pago[0])
          }
          canCreate={true}
        />

        {/* Métricas */}
        {metricas && <MetricasCards metricas={metricas} />}

        {/* Fuentes de pago */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className='mb-3 flex items-center gap-2 px-1'>
            <Wallet className='h-4 w-4 text-emerald-500 dark:text-emerald-400' />
            <h2 className='text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-white/90'>
              Fuentes de Pago
            </h2>
            {negociacion.fuentes_pago &&
              negociacion.fuentes_pago.length > 0 && (
                <span className='ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400/70'>
                  {negociacion.fuentes_pago.length} fuente
                  {negociacion.fuentes_pago.length !== 1 ? 's' : ''} activa
                  {negociacion.fuentes_pago.length !== 1 ? 's' : ''}
                </span>
              )}
          </div>

          {negociacion.fuentes_pago && negociacion.fuentes_pago.length > 0 ? (
            <div className='grid gap-3'>
              {negociacion.fuentes_pago.map((fuente, index) => (
                <FuentePagoCard
                  key={fuente.id}
                  fuente={fuente}
                  negociacionId={negociacion.id}
                  clienteSlug={clienteIdOrSlug}
                  onRegistrarAbono={handleRegistrarAbono}
                  index={index}
                  canCreate={true}
                  validacion={validarFuentePago[fuente.id]}
                />
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none'>
              <Wallet className='mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-white/20' />
              <p className='text-sm text-gray-400 dark:text-white/40'>
                No hay fuentes de pago configuradas
              </p>
            </div>
          )}
        </motion.div>

        {/* Historial */}
        <TimelineAbonos abonos={abonos} loading={loadingAbonos} />

        {/* Modal */}
        {modalAbonoOpen && fuenteSeleccionada && (
          <ModalRegistroPago
            open={modalAbonoOpen}
            onClose={handleCerrarModal}
            negociacionId={negociacion.id}
            clienteId={clienteId}
            fechaMinima={
              negociacion.fecha_negociacion
                ? formatDateForInput(negociacion.fecha_negociacion)
                : undefined
            }
            fuentesPago={[fuenteSeleccionada]}
            fuenteInicial={fuenteSeleccionada}
            onSuccess={handleAbonoRegistrado}
            negociacionContext={
              negociacion
                ? {
                    cliente: negociacion.cliente,
                    vivienda: {
                      numero: negociacion.vivienda.numero,
                      manzana: negociacion.vivienda.manzana
                        ? { identificador: negociacion.vivienda.manzana.nombre }
                        : undefined,
                    },
                    proyecto: negociacion.proyecto,
                    valorVivienda: metricas?.valorTotal,
                    totalAbonadoAntes: metricas?.totalAbonado,
                  }
                : undefined
            }
          />
        )}
      </div>
    </motion.div>
  )
}
