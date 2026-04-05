'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Home } from 'lucide-react'

import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { getAvatarGradient } from '@/modules/abonos/styles/seleccion-cliente.styles'
import type { NegociacionConAbonos } from '@/modules/abonos/types'

interface HeaderClienteProps {
  negociacion: NegociacionConAbonos
  onVolver: () => void
  onRegistrarAbono?: () => void
  canCreate?: boolean
}

export function HeaderCliente({
  negociacion,
  onVolver,
  onRegistrarAbono: _onRegistrarAbono,
  canCreate: _canCreate,
}: HeaderClienteProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = formatNombreCompleto(
    `${cliente.nombres} ${cliente.apellidos}`
  )
  const iniciales =
    `${cliente.nombres[0] || ''}${cliente.apellidos[0] || ''}`.toUpperCase()
  const avatarGradient = getAvatarGradient(nombreCompleto)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className='relative overflow-hidden rounded-2xl shadow-2xl shadow-emerald-900/40'
      style={{
        background:
          'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)',
      }}
    >
      {/* Grid pattern */}
      <div className='bg-grid-white/[0.04] absolute inset-0 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8),transparent)]' />
      {/* Orb superior derecho */}
      <div className='pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-400/20 blur-2xl' />
      {/* Orb inferior izquierdo */}
      <div className='pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-teal-300/10 blur-2xl' />
      {/* Franja de acento superior */}
      <div className='absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent' />

      <div className='relative z-10 p-5'>
        {/* Breadcrumb */}
        <button
          onClick={onVolver}
          className='group mb-4 flex items-center gap-1.5 text-xs font-medium text-emerald-300/80 transition-colors hover:text-emerald-100'
        >
          <ArrowLeft className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5' />
          <span>Abonos</span>
        </button>

        <div className='flex items-end justify-between gap-4'>
          {/* Avatar + info */}
          <div className='flex items-center gap-4'>
            <div className='relative flex-shrink-0'>
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-xl`}
              >
                <span className='text-lg font-extrabold tracking-tight text-white'>
                  {iniciales}
                </span>
              </div>
              <div className='absolute inset-0 rounded-2xl ring-1 ring-white/20' />
            </div>

            <div>
              <h1 className='text-2xl font-extrabold leading-tight tracking-tight text-white'>
                {nombreCompleto}
              </h1>
              <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
                <span className='flex items-center gap-1 text-xs text-emerald-200/70'>
                  CC {cliente.numero_documento}
                </span>
              </div>
              <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
                {proyecto && (
                  <span className='flex items-center gap-1 text-xs text-emerald-200/70'>
                    <Building2 className='h-3 w-3' />
                    {proyecto.nombre}
                  </span>
                )}
                {vivienda && (
                  <span className='flex items-center gap-1 text-xs text-emerald-200/70'>
                    <Home className='h-3 w-3' />
                    {vivienda.manzana?.nombre
                      ? `Mz.${vivienda.manzana.nombre} `
                      : ''}
                    Casa No. {vivienda.numero}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* CTA principal */}
        </div>
      </div>
    </motion.div>
  )
}
