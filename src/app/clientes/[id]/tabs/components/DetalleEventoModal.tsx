/**
 * DetalleEventoModal - Modal compacto para mostrar detalles de eventos del historial
 *
 * ✅ COMPONENTE PRESENTACIONAL PURO
 * ✅ DISEÑO COMPACTO Y ORGANIZADO POR SECCIONES
 * ✅ ICONOS ESPECÍFICOS POR TIPO DE DATO
 * ✅ GRID RESPONSIVE DE 2 COLUMNAS
 * ✅ USA PORTAL para renderizar fuera de la jerarquía del componente padre
 */

'use client'

import {
    Building2,
    Calendar,
    FileText,
    Hash,
    Heart,
    Home,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    User,
    Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Modal } from '@/shared/components/ui/Modal'

import type { DetalleEvento } from '@/modules/clientes/types/historial.types'

interface DetalleEventoModalProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  subtitulo?: string
  detalles: DetalleEvento[]
}

export function DetalleEventoModal({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  detalles,
}: DetalleEventoModalProps) {
  const [mounted, setMounted] = useState(false)

  // Asegurar que solo se renderice en el cliente
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // No renderizar en servidor o antes de montar
  if (!mounted) return null

  // Agrupar campos por sección
  const secciones = agruparPorSeccion(detalles)

  // Renderizar modal usando portal para evitar que se renderice dentro de la card
  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      description={subtitulo}
      size="lg"
      compact
      icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
      gradientColor="cyan"
    >
      <div className="space-y-3 sm:space-y-4">
        {secciones.map((seccion, secIdx) => (
          <div key={secIdx}>
            {/* Header de sección */}
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5 pb-1.5 sm:pb-2 border-b-2 border-cyan-200 dark:border-cyan-800">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                <seccion.icono className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide truncate">
                {seccion.titulo}
              </h4>
              <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-cyan-200 to-transparent dark:from-cyan-800" />
            </div>

            {/* Grid de campos de la sección - 1 col móvil, 2 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {seccion.campos.map((detalle, idx) => {
                const IconoCampo = obtenerIconoCampo(detalle.campo)
                const esVacio = esValorVacio(detalle.valorNuevo)

                return (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-lg border transition-all ${
                      esVacio
                        ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-800/50 border-cyan-200 dark:border-cyan-800 hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700'
                    }`}
                  >
                    <div className="flex items-start gap-2 p-2 sm:p-2.5">
                      {/* Icono del campo */}
                      <div
                        className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center ${
                          esVacio
                            ? 'bg-gray-200 dark:bg-gray-700'
                            : 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40'
                        }`}
                      >
                        <IconoCampo
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                            esVacio
                              ? 'text-gray-400 dark:text-gray-500'
                              : 'text-cyan-600 dark:text-cyan-400'
                          }`}
                        />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider mb-0.5 leading-tight ${
                            esVacio
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {detalle.etiqueta}
                        </p>
                        <p
                          className={`text-[11px] sm:text-xs font-semibold break-words leading-snug ${
                            esVacio
                              ? 'text-gray-400 dark:text-gray-600 italic'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {formatearValor(detalle.valorNuevo, detalle.tipo)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Nota informativa al final */}
      <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
        <p className="text-[9px] sm:text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
          <span className="font-bold">ℹ️ Información de auditoría:</span> Registro completo con los datos iniciales del cliente. Los campos en gris no fueron completados durante la creación.
        </p>
      </div>
    </Modal>,
    document.body
  )
}

// ========== TIPOS DE SECCIONES ==========
interface SeccionDetalles {
  titulo: string
  icono: any
  campos: DetalleEvento[]
}

// ========== MAPEO DE ICONOS POR CAMPO ==========
function obtenerIconoCampo(campo: string) {
  const iconos: Record<string, any> = {
    // Información personal
    nombres: User,
    apellidos: User,
    tipo_documento: FileText,
    numero_documento: Hash,
    fecha_nacimiento: Calendar,
    estado_civil: Users,

    // Contacto
    telefono: Phone,
    telefono_alternativo: Phone,
    email: Mail,
    direccion: MapPin,
    ciudad: Building2,
    departamento: Home,

    // Interés
    proyecto_interes_inicial: Building2,
    vivienda_interes_inicial: Home,
    notas_interes: Heart,
    interes_inicial: Heart,

    // Adicional
    notas: MessageSquare,
    estado: FileText,
  }

  return iconos[campo] || FileText
}

// ========== AGRUPAR CAMPOS POR SECCIÓN ==========
function agruparPorSeccion(detalles: DetalleEvento[]): SeccionDetalles[] {
  const secciones: SeccionDetalles[] = []

  // Sección 1: Información Personal
  const camposPersonales = detalles.filter(d =>
    ['nombres', 'apellidos', 'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'estado_civil'].includes(d.campo)
  )
  if (camposPersonales.length > 0) {
    secciones.push({
      titulo: 'Información Personal',
      icono: User,
      campos: camposPersonales,
    })
  }

  // Sección 2: Datos de Contacto
  const camposContacto = detalles.filter(d =>
    ['telefono', 'telefono_alternativo', 'email', 'direccion', 'ciudad', 'departamento'].includes(d.campo)
  )
  if (camposContacto.length > 0) {
    secciones.push({
      titulo: 'Datos de Contacto',
      icono: Phone,
      campos: camposContacto,
    })
  }

  // Sección 3: Interés en Proyecto/Vivienda
  const camposInteres = detalles.filter(d =>
    ['proyecto_interes_inicial', 'vivienda_interes_inicial', 'notas_interes', 'interes_inicial'].includes(d.campo)
  )
  if (camposInteres.length > 0) {
    secciones.push({
      titulo: 'Interés Inicial',
      icono: Heart,
      campos: camposInteres,
    })
  }

  // Sección 4: Información Adicional
  const camposAdicionales = detalles.filter(d =>
    ['notas', 'estado'].includes(d.campo)
  )
  if (camposAdicionales.length > 0) {
    secciones.push({
      titulo: 'Información Adicional',
      icono: MessageSquare,
      campos: camposAdicionales,
    })
  }

  return secciones
}

// ========== VERIFICAR SI UN VALOR ESTÁ VACÍO ==========
function esValorVacio(valor: any): boolean {
  if (valor === null || valor === undefined) return true

  const valorStr = String(valor).toLowerCase()
  return (
    valorStr === 'no diligenciado' ||
    valorStr === 'no especificado' ||
    valorStr === 'sin observaciones' ||
    valorStr === 'sin interés específico registrado' ||
    valorStr === 'sin proyecto específico' ||
    valorStr === 'sin vivienda específica' ||
    valorStr === '' ||
    valorStr === '—'
  )
}

// ========== FORMATEAR VALOR SEGÚN TIPO ==========
function formatearValor(valor: any, tipo?: string): string {
  if (valor === null || valor === undefined) return '—'

  switch (tipo) {
    case 'numero':
      return typeof valor === 'number'
        ? `$${valor.toLocaleString('es-CO')}`
        : String(valor)
    case 'fecha':
      return new Date(String(valor)).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'booleano':
      return valor ? 'Sí' : 'No'
    default:
      return String(valor)
  }
}
