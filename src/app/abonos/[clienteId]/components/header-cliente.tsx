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

export function HeaderCliente({ negociacion, onVolver, onRegistrarAbono, canCreate }: HeaderClienteProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const nombreCompleto = formatNombreCompleto(`${cliente.nombres} ${cliente.apellidos}`)
  const iniciales = `${cliente.nombres[0] || ''}${cliente.apellidos[0] || ''}`.toUpperCase()
  const avatarGradient = getAvatarGradient(nombreCompleto)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl shadow-2xl shadow-emerald-900/40"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)' }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.04] [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8),transparent)]" />
      {/* Orb superior derecho */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
      {/* Orb inferior izquierdo */}
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
      {/* Franja de acento superior */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />

      <div className="relative z-10 p-5">
        {/* Breadcrumb */}
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-emerald-300/80 hover:text-emerald-100 text-xs font-medium transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Abonos</span>
        </button>

        <div className="flex items-end justify-between gap-4">
          {/* Avatar + info */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-xl`}>
                <span className="text-white font-extrabold text-lg tracking-tight">{iniciales}</span>
              </div>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight tracking-tight">{nombreCompleto}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-emerald-200/70">
                  CC {cliente.numero_documento}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                {proyecto && (
                  <span className="flex items-center gap-1 text-xs text-emerald-200/70">
                    <Building2 className="w-3 h-3" />
                    {proyecto.nombre}
                  </span>
                )}
                {vivienda && (
                  <span className="flex items-center gap-1 text-xs text-emerald-200/70">
                    <Home className="w-3 h-3" />
                    {vivienda.manzana?.nombre ? `Mz.${vivienda.manzana.nombre} ` : ''}Casa No. {vivienda.numero}
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
