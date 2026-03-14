'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Loader2, Wallet } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { ModalRegistroPago } from '@/modules/abonos/components/modal-registro-pago'

import { FuentePagoCard, HeaderCliente, MetricasCards, TimelineAbonos } from './components'
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
  } = useAbonosDetalle(clienteId!)

  const handleVolver = () => router.push('/abonos')

  if (isResolving || !clienteId || isLoading || !negociacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gradiente atmosférico solo en dark mode */}
      <div
        className="hidden dark:block pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(20,184,166,0.08), transparent)' }}
      />
      {/* Orbs de ambiente - solo en dark */}
      <div className="hidden dark:block pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-teal-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-emerald-400/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <HeaderCliente
          negociacion={negociacion}
          onVolver={handleVolver}
          onRegistrarAbono={() => negociacion.fuentes_pago?.[0] && handleRegistrarAbono(negociacion.fuentes_pago[0])}
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
          <div className="flex items-center gap-2 mb-3 px-1">
            <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-gray-600 dark:text-white/90 uppercase tracking-widest">Fuentes de Pago</h2>
            {negociacion.fuentes_pago && negociacion.fuentes_pago.length > 0 && (
              <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400/70 font-medium">
                {negociacion.fuentes_pago.length} fuente{negociacion.fuentes_pago.length !== 1 ? 's' : ''} activa{negociacion.fuentes_pago.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {negociacion.fuentes_pago && negociacion.fuentes_pago.length > 0 ? (
            <div className="grid gap-3">
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
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-6 py-12 text-center">
              <Wallet className="w-8 h-8 text-gray-300 dark:text-white/20 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-white/40">No hay fuentes de pago configuradas</p>
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
            fechaMinima={negociacion.fecha_negociacion ? formatDateForInput(negociacion.fecha_negociacion) : undefined}
            fuentesPago={[fuenteSeleccionada]}
            fuenteInicial={fuenteSeleccionada}
            onSuccess={handleAbonoRegistrado}
          />
        )}
      </div>
    </motion.div>
  )
}
