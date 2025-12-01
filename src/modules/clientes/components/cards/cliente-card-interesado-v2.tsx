/**
 * ClienteCardInteresado V2 - Diseño Premium Rediseñado
 *
 * Estructura IDÉNTICA a ClienteCardActivo pero con contenido adaptado
 */

'use client'

import { motion } from 'framer-motion'
import {
    Building2,
    Calendar,
    Edit,
    Eye,
    Heart,
    Home,
    Mail,
    MapPin,
    Phone,
    Trash2,
    User,
    Users,
} from 'lucide-react'

import { formatDateShort } from '@/lib/utils/date.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { useClienteIntereses } from '../../hooks/useClienteIntereses'
import type { ClienteResumen } from '../../types'
import { clienteCardThemes } from './cliente-card-base.styles'

interface ClienteCardInteresadoProps {
  cliente: ClienteResumen
  tieneCedula?: boolean
  tieneNegociacion?: boolean
  onVer?: (cliente: ClienteResumen) => void
  onEditar?: (cliente: ClienteResumen) => void
  onEliminar?: (cliente: ClienteResumen) => void
}

export function ClienteCardInteresado({
  cliente,
  onVer,
  onEditar,
  onEliminar,
}: ClienteCardInteresadoProps) {
  const theme = clienteCardThemes.Interesado
  const { intereses, isLoading } = useClienteIntereses(cliente.id)
  const interesActual = intereses[0]

  // Calcular edad desde fecha_nacimiento
  const calcularEdad = (fechaNacimiento?: string): number | null => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const edad = calcularEdad(cliente.fecha_nacimiento)

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 p-4 flex flex-col min-h-[500px]">

        {/* Contenido con flex-1 para que ocupe espacio disponible */}
        <div className="flex-1 space-y-3">
          {/* === HEADER SECTION === */}
          <div className="space-y-2">
          {/* Fila 1: Cliente + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {formatNombreCompleto(cliente.nombre_completo)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">{cliente.tipo_documento}</span> {cliente.numero_documento}
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              {onVer && (
                <button
                  onClick={() => onVer(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                  title="Ver detalle"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {onEditar && (
                <button
                  onClick={() => onEditar(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onEliminar && (
                <button
                  onClick={() => onEliminar(cliente)}
                  className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Fila 2: Badge */}
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md shadow-cyan-500/50">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              INTERESADO
            </span>
          </div>
        </div>

        {/* === INTERÉS SECTION (PRIMERO) === */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="px-3 py-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : interesActual ? (
            <>
              {/* Proyecto destacado */}
              <div className="px-3 py-2.5 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-900/50 shadow-sm">
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                    Interesado en:
                  </p>
                </div>
                {/* Grid 2x2: Fila 1 (Proyecto|Ubicación) + Fila 2 (Manzana|Casa) */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Proyecto */}
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{interesActual.proyecto_nombre || 'No especifica'}</p>
                    </div>
                  </div>
                  {/* Ubicación */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ubicación</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{interesActual.proyecto_ubicacion || 'No especifica'}</p>
                    </div>
                  </div>
                  {/* Manzana */}
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Manzana</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{interesActual.manzana_nombre || 'No especifica'}</p>
                    </div>
                  </div>
                  {/* Casa */}
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Casa</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{interesActual.vivienda_numero ? `#${interesActual.vivienda_numero}` : 'No especifica'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-3 py-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Sin interés registrado</span>
              </div>
            </div>
          )}
        </div>

        {/* === CONTACTO SECTION (SEGUNDO) === */}
        <div className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-900/50 shadow-sm">
              <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 uppercase tracking-wide">
              Información Personal
            </p>
          </div>
          {/* Grid 2x2: Fila 1 (Teléfono|Email) + Fila 2 (Estado Civil|Edad) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Teléfono</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {cliente.telefono || 'No especifica'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {cliente.email || 'No especifica'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estado Civil</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {cliente.estado_civil || 'No especifica'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Edad</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {edad !== null ? `${edad} años` : 'No especifica'}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* === ACTION BUTTON === */}
        {interesActual && (
          <motion.button
            onClick={() => console.log('Ver interés:', cliente.id)}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Ver Interés</span>
            </div>
          </motion.button>
        )}

        {/* === FOOTER === */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Registrado {formatDateShort(cliente.fecha_creacion)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
