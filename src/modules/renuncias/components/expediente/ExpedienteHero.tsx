'use client'

import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { ArrowLeft, Building2, Clock, ExternalLink, FileText, FileX, Home, Loader2, Mail, MapPin, Phone, Receipt, Upload, User } from 'lucide-react'
import { toast } from 'sonner'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

import { generarUrlFirmadaComprobante, subirFormularioRenuncia } from '../../services/renuncias.service'
import type { ExpedienteData } from '../../types'
import { getTipoDocumentoLabel } from '../../utils/renuncias.utils'

import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteHeroProps {
  datos: ExpedienteData
}

export function ExpedienteHero({ datos }: ExpedienteHeroProps) {
  const { renuncia, duracionDias } = datos
  const esPendiente = renuncia.estado === 'Pendiente Devolución'
  const badgeClass = esPendiente ? styles.hero.estadoBadge.pendiente : styles.hero.estadoBadge.cerrada

  const clienteSnap = renuncia.cliente_datos_snapshot as Record<string, unknown> | null
  const email = typeof clienteSnap?.email === 'string' ? clienteSnap.email : null

  const fechaInicio = datos.negociacion.fecha_negociacion
  const fechaFin = renuncia.fecha_renuncia

  // Signed URL para formulario de renuncia
  const [formularioUrl, setFormularioUrl] = useState<string | null>(null)
  const [subiendoFormulario, setSubiendoFormulario] = useState(false)
  const [formularioPath, setFormularioPath] = useState<string | null>(renuncia.formulario_renuncia_url)
  const formularioInputRef = useRef<HTMLInputElement>(null)

  // Signed URL para comprobante de devolución
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null)

  useEffect(() => {
    if (formularioPath) {
      generarUrlFirmadaComprobante(formularioPath)
        .then(setFormularioUrl)
        .catch(() => setFormularioUrl(null))
    }
  }, [formularioPath])

  useEffect(() => {
    if (renuncia.comprobante_devolucion_url) {
      generarUrlFirmadaComprobante(renuncia.comprobante_devolucion_url)
        .then(setComprobanteUrl)
        .catch(() => setComprobanteUrl(null))
    }
  }, [renuncia.comprobante_devolucion_url])

  const handleSubirFormulario = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoFormulario(true)
    try {
      const path = await subirFormularioRenuncia(file, renuncia.id)
      setFormularioPath(path)
      toast.success('Formulario de renuncia adjuntado exitosamente')
    } catch (err) {
      logger.error('Error subiendo formulario:', err)
      toast.error('Error al subir el formulario de renuncia')
    } finally {
      setSubiendoFormulario(false)
      if (formularioInputRef.current) formularioInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Back link */}
      <Link href="/renuncias" className={styles.page.backLink}>
        <ArrowLeft className="w-4 h-4" />
        Volver a Renuncias
      </Link>

      {/* ── HERO: Identidad del expediente ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.hero.container}
      >
        <div className={styles.hero.pattern} />
        <div className={styles.hero.content}>
          {/* Top: consecutivo + estado */}
          <div className={styles.hero.topRow}>
            <span className={styles.hero.consecutivoBadge}>
              <FileX className="w-4 h-4" />
              {renuncia.consecutivo}
            </span>
            <span className={badgeClass}>
              {esPendiente ? '⏳' : '✅'} {renuncia.estado}
            </span>
          </div>

          {/* Cliente */}
          <div>
            <h1 className={styles.hero.clienteNombre}>{renuncia.cliente.nombre}</h1>
            <div className={styles.hero.clienteInfo}>
              <span className={styles.hero.clienteInfoItem}>
                <User className="w-3.5 h-3.5" />
                {getTipoDocumentoLabel(renuncia.cliente.tipo_documento)} {renuncia.cliente.documento}
              </span>
              {renuncia.cliente.telefono ? (
                <span className={styles.hero.clienteInfoItem}>
                  <Phone className="w-3.5 h-3.5" />
                  {renuncia.cliente.telefono}
                </span>
              ) : null}
              {email ? (
                <span className={styles.hero.clienteInfoItem}>
                  <Mail className="w-3.5 h-3.5" />
                  {email}
                </span>
              ) : null}
            </div>
          </div>

          {/* Vivienda */}
          <div className={styles.hero.viviendaRow}>
            <MapPin className="w-3.5 h-3.5" />
            <span>Manzana {renuncia.vivienda.manzana}</span>
            <span>·</span>
            <Home className="w-3.5 h-3.5" />
            <span>Casa No. {renuncia.vivienda.numero}</span>
            <span>·</span>
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-semibold">{renuncia.proyecto.nombre}</span>
          </div>
        </div>
      </motion.div>

      {/* ── FILA: Motivo + Formulario + Duración ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-3"
      >
        {/* Motivo de renuncia (wider) */}
        <div className={`lg:col-span-5 ${styles.detailCards.motivoCard}`}>
          <p className={styles.detailCards.cardLabel}>Motivo de renuncia</p>
          <p className={styles.detailCards.motivoText}>{renuncia.motivo}</p>
        </div>

        {/* Documentos de la renuncia */}
        <div className={`lg:col-span-4 ${styles.detailCards.formularioCard}`}>
          <p className={styles.detailCards.cardLabel}>Documentos de la renuncia</p>
          <div className="space-y-3 mt-1">

            {/* — Formulario firmado — */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Formulario firmado</p>
              {formularioPath ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Adjunto</p>
                    {formularioUrl ? (
                      <a
                        href={formularioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        Ver documento <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Generando enlace...</span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={formularioInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleSubirFormulario}
                  />
                  <button
                    type="button"
                    disabled={subiendoFormulario}
                    onClick={() => formularioInputRef.current?.click()}
                    className={styles.detailCards.uploadButton}
                  >
                    {subiendoFormulario ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {subiendoFormulario ? 'Subiendo...' : 'Adjuntar formulario'}
                  </button>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">PDF, JPG, PNG o WEBP</p>
                </div>
              )}
            </div>

            {/* — Comprobante de devolución (solo si existe) — */}
            {renuncia.comprobante_devolucion_url ? (
              <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Comprobante de devolución</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Adjunto</p>
                    {comprobanteUrl ? (
                      <a
                        href={comprobanteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        Ver documento <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Generando enlace...</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

          </div>
        </div>

        {/* Duración */}
        <div className={`lg:col-span-3 ${styles.detailCards.duracionCard}`}>
          <p className={styles.detailCards.cardLabel}>Duración de la negociación</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">{duracionDias} días</span>
          </div>
          {fechaInicio && fechaFin ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDateCompact(fechaInicio)} → {formatDateCompact(fechaFin)}
            </p>
          ) : null}
        </div>
      </motion.div>
    </>
  )
}
