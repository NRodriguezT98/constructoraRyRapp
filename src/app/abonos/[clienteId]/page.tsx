'use client'

import { resolverSlugCliente } from '@/lib/utils/slug.utils'
import { ModalRegistrarAbono } from '@/modules/abonos/components/modal-registrar-abono'
import { motion } from 'framer-motion'
import { Loader2, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { FuentePagoCard, HeaderCliente, MetricasCards, TimelineAbonos } from './components'
import { useAbonosDetalle } from './hooks/useAbonosDetalle'
import { animations, containerStyles, fuentesStyles } from './styles/abonos-detalle.styles'

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
  } = useAbonosDetalle(clienteId)

  // Volver a la lista de clientes
  const handleVolver = () => {
    router.push('/abonos')
  }

  // Loading states
  if (isResolving || !clienteId || isLoading || !negociacion) {
    return (
      <div className={containerStyles.page}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={containerStyles.page}
      initial="hidden"
      animate="visible"
      variants={animations.container}
    >
      <div className={containerStyles.wrapper}>
        {/* Header con info del cliente */}
        <HeaderCliente negociacion={negociacion} onVolver={handleVolver} />

        {/* Métricas de la negociación */}
        <MetricasCards metricas={metricas} />

        {/* Fuentes de pago */}
        <section className={fuentesStyles.section}>
          <div className={fuentesStyles.header}>
            <h2 className={fuentesStyles.title}>
              <Wallet className={fuentesStyles.titleIcon} />
              Fuentes de Pago
            </h2>
          </div>

          {negociacion.fuentes_pago && negociacion.fuentes_pago.length > 0 ? (
            <div className={fuentesStyles.grid}>
              {negociacion.fuentes_pago.map((fuente, index) => (
                <FuentePagoCard
                  key={fuente.id}
                  fuente={fuente}
                  negociacionId={negociacion.id}
                  onRegistrarAbono={handleRegistrarAbono}
                  index={index}
                  validacion={validarFuentePago[fuente.id]}
                />
              ))}
            </div>
          ) : (
            <div className={fuentesStyles.emptyState}>
              <Wallet className={fuentesStyles.emptyIcon} />
              <p className={fuentesStyles.emptyText}>
                No hay fuentes de pago configuradas
              </p>
            </div>
          )}
        </section>

        {/* Timeline de abonos */}
        <TimelineAbonos abonos={abonos} loading={loadingAbonos} />

        {/* Modal de registro de abono */}
        {modalAbonoOpen && fuenteSeleccionada && negociacion.fuentes_pago && (
          <ModalRegistrarAbono
            open={modalAbonoOpen}
            onClose={handleCerrarModal}
            negociacionId={negociacion.id}
            clienteId={clienteId}
            fuentesPago={negociacion.fuentes_pago}
            fuenteInicial={fuenteSeleccionada}
            onSuccess={handleAbonoRegistrado}
          />
        )}
      </div>
    </motion.div>
  )
}
