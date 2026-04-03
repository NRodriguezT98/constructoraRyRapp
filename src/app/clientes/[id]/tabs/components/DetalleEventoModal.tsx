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

import { useEffect, useState } from 'react'

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
import { createPortal } from 'react-dom'

import type { DetalleEvento } from '@/modules/clientes/types/historial.types'
import { Modal } from '@/shared/components/ui/Modal'

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
      size='lg'
      compact
      icon={<FileText className='h-4 w-4 text-white sm:h-5 sm:w-5' />}
      gradientColor='cyan'
    >
      <div className='space-y-3 sm:space-y-4'>
        {secciones.map((seccion, secIdx) => (
          <div key={secIdx}>
            {/* Header de sección */}
            <div className='mb-2 flex items-center gap-2 border-b-2 border-cyan-200 pb-1.5 dark:border-cyan-800 sm:mb-2.5 sm:pb-2'>
              <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md sm:h-7 sm:w-7'>
                <seccion.icono className='h-3 w-3 text-white sm:h-4 sm:w-4' />
              </div>
              <h4 className='truncate text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-white sm:text-sm'>
                {seccion.titulo}
              </h4>
              <div className='hidden h-px flex-1 bg-gradient-to-r from-cyan-200 to-transparent dark:from-cyan-800 sm:block' />
            </div>

            {/* Grid de campos de la sección - 1 col móvil, 2 col desktop */}
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5'>
              {seccion.campos.map((detalle, idx) => {
                const IconoCampo = obtenerIconoCampo(detalle.campo)
                const esVacio = esValorVacio(detalle.valorNuevo)

                return (
                  <div
                    key={idx}
                    className={`group relative overflow-hidden rounded-lg border transition-all ${
                      esVacio
                        ? 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/30'
                        : 'border-cyan-200 bg-white hover:border-cyan-300 hover:shadow-md dark:border-cyan-800 dark:bg-gray-800/50 dark:hover:border-cyan-700'
                    }`}
                  >
                    <div className='flex items-start gap-2 p-2 sm:p-2.5'>
                      {/* Icono del campo */}
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md sm:h-7 sm:w-7 ${
                          esVacio
                            ? 'bg-gray-200 dark:bg-gray-700'
                            : 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40'
                        }`}
                      >
                        <IconoCampo
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                            esVacio
                              ? 'text-gray-400 dark:text-gray-500'
                              : 'text-cyan-600 dark:text-cyan-400'
                          }`}
                        />
                      </div>

                      {/* Contenido */}
                      <div className='min-w-0 flex-1'>
                        <p
                          className={`mb-0.5 text-[8px] font-bold uppercase leading-tight tracking-wider sm:text-[9px] ${
                            esVacio
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {detalle.etiqueta}
                        </p>
                        <p
                          className={`break-words text-[11px] font-semibold leading-snug sm:text-xs ${
                            esVacio
                              ? 'italic text-gray-400 dark:text-gray-600'
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
      <div className='mt-3 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-2 dark:border-blue-800 dark:from-blue-950/30 dark:to-cyan-950/30 sm:mt-4 sm:p-2.5'>
        <p className='text-[9px] leading-relaxed text-blue-700 dark:text-blue-300 sm:text-[10px]'>
          <span className='font-bold'>ℹ️ Información de auditoría:</span>{' '}
          Registro completo con los datos iniciales del cliente. Los campos en
          gris no fueron completados durante la creación.
        </p>
      </div>
    </Modal>,
    document.body
  )
}

// ========== TIPOS DE SECCIONES ==========
interface SeccionDetalles {
  titulo: string
  icono: React.ComponentType<{ className?: string }>
  campos: DetalleEvento[]
}

// ========== MAPEO DE ICONOS POR CAMPO ==========
function obtenerIconoCampo(campo: string) {
  const iconos: Record<string, React.ComponentType<{ className?: string }>> = {
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
    [
      'nombres',
      'apellidos',
      'tipo_documento',
      'numero_documento',
      'fecha_nacimiento',
      'estado_civil',
    ].includes(d.campo)
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
    [
      'telefono',
      'telefono_alternativo',
      'email',
      'direccion',
      'ciudad',
      'departamento',
    ].includes(d.campo)
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
    [
      'proyecto_interes_inicial',
      'vivienda_interes_inicial',
      'notas_interes',
      'interes_inicial',
    ].includes(d.campo)
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
function esValorVacio(valor: unknown): boolean {
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
function formatearValor(valor: unknown, tipo?: string): string {
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
