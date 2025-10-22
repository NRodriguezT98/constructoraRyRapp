'use client'

import { motion } from 'framer-motion'
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronRight,
    DollarSign,
    Home,
    MessageSquare,
    User,
} from 'lucide-react'
import type { ProyectoBasico, ViviendaDetalle } from '../types'

interface Paso1InfoBasicaProps {
  clienteNombre?: string
  proyectos: ProyectoBasico[]
  viviendas: ViviendaDetalle[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  descuentoAplicado: number
  valorTotal: number
  notas: string
  viviendaIdProp?: string
  validacionCampos?: {
    proyecto: { valido: boolean; mensaje: string }
    vivienda: { valido: boolean; mensaje: string }
    valorVivienda: { valido: boolean; mensaje: string }
    descuento: { valido: boolean; mensaje: string }
  }
  onProyectoChange: (proyectoId: string) => void
  onViviendaChange: (viviendaId: string) => void
  onValorNegociadoChange: (valor: number) => void
  onDescuentoChange: (descuento: number) => void
  onNotasChange: (notas: string) => void
}

export function Paso1InfoBasica({
  clienteNombre,
  proyectos,
  viviendas,
  cargandoProyectos,
  cargandoViviendas,
  proyectoSeleccionado,
  viviendaId,
  valorNegociado,
  descuentoAplicado,
  valorTotal,
  notas,
  viviendaIdProp,
  validacionCampos,
  onProyectoChange,
  onViviendaChange,
  onDescuentoChange,
  onNotasChange,
}: Paso1InfoBasicaProps) {

  const getFieldClasses = (valido: boolean | undefined, touched: boolean) => {
    const base = 'w-full px-4 py-3 bg-white dark:bg-gray-950 border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none transition-all'

    if (!touched || valido === undefined) {
      return `${base} border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`
    }

    if (valido) {
      return `${base} border-green-500 dark:border-green-600 ring-2 ring-green-500/10`
    }

    return `${base} border-red-500 dark:border-red-600 ring-2 ring-red-500/10`
  }

  const ValidationIcon = ({ valido, touched }: { valido?: boolean; touched: boolean }) => {
    if (!touched || valido === undefined) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute right-4 top-1/2 -translate-y-1/2"
      >
        {valido ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </motion.div>
    )
  }

  const ValidationMessage = ({
    valido,
    mensaje,
    touched
  }: {
    valido?: boolean
    mensaje?: string
    touched: boolean
  }) => {
    if (!touched || !mensaje) return null

    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xs mt-1.5 flex items-center gap-1.5 ${
          valido
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {valido ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5" />
        )}
        {mensaje}
      </motion.p>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-[10px] text-blue-600 dark:text-blue-400">Cliente</p>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {clienteNombre || 'Cliente seleccionado'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            Proyecto
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={proyectoSeleccionado}
              onChange={(e) => onProyectoChange(e.target.value)}
              disabled={cargandoProyectos || !!viviendaIdProp}
              className={getFieldClasses(
                validacionCampos?.proyecto.valido,
                !!proyectoSeleccionado || proyectos.length > 0
              )}
            >
              <option value="">Selecciona un proyecto</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
            <ValidationIcon
              valido={validacionCampos?.proyecto.valido}
              touched={!!proyectoSeleccionado || proyectos.length > 0}
            />
          </div>
          <ValidationMessage
            valido={validacionCampos?.proyecto.valido}
            mensaje={validacionCampos?.proyecto.mensaje}
            touched={proyectos.length > 0}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            Vivienda
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={viviendaId}
              onChange={(e) => onViviendaChange(e.target.value)}
              disabled={!proyectoSeleccionado || cargandoViviendas || !!viviendaIdProp}
              className={getFieldClasses(
                validacionCampos?.vivienda.valido,
                !!viviendaId || (!!proyectoSeleccionado && viviendas.length > 0)
              )}
            >
              <option value="">
                {cargandoViviendas
                  ? 'Cargando viviendas...'
                  : !proyectoSeleccionado
                    ? 'Primero selecciona un proyecto'
                    : viviendas.length === 0
                      ? 'No hay viviendas disponibles'
                      : 'Selecciona una vivienda'}
              </option>
              {viviendas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.manzana_nombre ? `Manzana ${v.manzana_nombre} - ` : ''}Casa {v.numero}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-gray-400" />
            <ValidationIcon
              valido={validacionCampos?.vivienda.valido}
              touched={!!viviendaId || (!!proyectoSeleccionado && viviendas.length > 0)}
            />
          </div>
          <ValidationMessage
            valido={validacionCampos?.vivienda.valido}
            mensaje={validacionCampos?.vivienda.mensaje}
            touched={!!proyectoSeleccionado}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            Valor de la Vivienda
            <span className="text-[10px] text-gray-500 ml-auto">(auto-llenado)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              readOnly
              value={valorNegociado ? valorNegociado.toLocaleString('es-CO') : '0'}
              placeholder="Selecciona una vivienda"
              className="w-full px-3 py-2 pl-7 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          {valorNegociado > 0 && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Valor cargado desde vivienda
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            Descuento Aplicado
            <span className="text-[10px] text-gray-500 ml-auto">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              value={descuentoAplicado ? descuentoAplicado.toLocaleString('es-CO') : ''}
              onChange={(e) => {
                const valor = e.target.value.replace(/\./g, '').replace(/,/g, '')
                const numero = Number(valor)
                if (!isNaN(numero)) {
                  onDescuentoChange(numero)
                }
              }}
              placeholder="0"
              className={`${getFieldClasses(
                validacionCampos?.descuento.valido,
                descuentoAplicado > 0
              )} pl-8`}
            />
            <ValidationIcon
              valido={validacionCampos?.descuento.valido}
              touched={descuentoAplicado > 0}
            />
          </div>
          <ValidationMessage
            valido={validacionCampos?.descuento.valido}
            mensaje={validacionCampos?.descuento.mensaje}
            touched={descuentoAplicado > 0}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
          Notas
          <span className="text-[10px] text-gray-500 ml-1.5">(opcional)</span>
        </label>
        <textarea
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          rows={3}
          placeholder="Información adicional sobre la negociación..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
        />
        {notas && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            {notas.length} caracteres
          </p>
        )}
      </div>
    </motion.div>
  )
}
