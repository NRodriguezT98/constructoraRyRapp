'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Loader2, Wallet } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { formatDateForInput } from '@/lib/utils/date.utils'
import { construirURLCliente } from '@/lib/utils/slug.utils'
import { ModalRegistroPago } from '@/modules/abonos/components/modal-registro-pago'

import {
  FuentePagoCard,
  HeaderCliente,
  MetricasCards,
  TimelineAbonos,
} from './components'
import { useAbonosDetalle } from './hooks/useAbonosDetalle'

interface AbonosDetalleClientProps {
  clienteId: string
}

export default function AbonosDetalleClient({
  clienteId,
}: AbonosDetalleClientProps) {
  const router = useRouter()

  const {
    negociacion,
    metricas,
    abonos,
    fuenteSeleccionada,
    isLoading,
    loadingAbonos,
    modalAbonoOpen,
    validarFuentePago,
    estaBalanceado,
    handleRegistrarAbono,
    handleCerrarModal,
    handleAbonoRegistrado,
  } = useAbonosDetalle(clienteId)

  // Construir slug canónico desde los datos resueltos (no desde el parámetro URL)
  const clienteSlug = negociacion
    ? (construirURLCliente({
        id: negociacion.cliente.id,
        nombres: negociacion.cliente.nombres,
        apellidos: negociacion.cliente.apellidos,
      })
        .split('/')
        .pop() ?? clienteId)
    : clienteId

  const handleVolver = () => router.push('/abonos')

  if (isLoading || !negociacion) {
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
        {/* Header (sticky al hacer scroll) */}
        <div className='sticky top-0 z-20'>
          <HeaderCliente
            negociacion={negociacion}
            onVolver={handleVolver}
            onRegistrarAbono={() =>
              negociacion.fuentes_pago?.[0] &&
              handleRegistrarAbono(negociacion.fuentes_pago[0])
            }
            canCreate={estaBalanceado}
          />
        </div>

        {/* Métricas */}
        {metricas && <MetricasCards metricas={metricas} />}

        {/* Banner de descuadre financiero */}
        {!estaBalanceado &&
        negociacion.fuentes_pago &&
        negociacion.fuentes_pago.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className='relative overflow-hidden rounded-xl border border-red-300 bg-gradient-to-r from-red-50 via-red-50 to-orange-50 dark:border-red-800/60 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20'
          >
            <div className='absolute left-0 top-0 h-full w-1 bg-red-500' />
            <div className='flex items-center gap-3 px-5 py-3'>
              <div className='relative flex-shrink-0'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40'>
                  <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-red-50 bg-red-500 dark:border-red-950'>
                  <span className='absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75' />
                </span>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-bold text-red-800 dark:text-red-300'>
                  Descuadre en Cierre Financiero — Registro Bloqueado
                </p>
                <p className='mt-0.5 text-xs text-red-700 dark:text-red-400'>
                  Las fuentes de pago no coinciden con el valor total de la
                  negociación. No es posible registrar abonos hasta corregir
                  este descuadre desde el módulo de Negociación.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

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
                  clienteSlug={clienteSlug}
                  onRegistrarAbono={handleRegistrarAbono}
                  onAbonoRegistrado={handleAbonoRegistrado}
                  index={index}
                  canCreate={estaBalanceado}
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
                    valorVivienda: metricas?.valorVivienda,
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
