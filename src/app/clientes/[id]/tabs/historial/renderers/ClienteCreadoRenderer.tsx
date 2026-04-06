/**
 * ClienteCreadoRenderer
 * Vista estructurada del momento en que el cliente fue registrado
 */

'use client'

import {
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Smile,
  User,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearValor } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

interface CampoProps {
  icono: React.ReactNode
  label: string
  valor: unknown
  negrita?: boolean
}

function Campo({ icono, label, valor, negrita = false }: CampoProps) {
  const texto = formatearValor(valor)
  if (texto === '—') return null
  return (
    <div className='flex items-start gap-2.5 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800'>
      <div className='mt-0.5 shrink-0 text-gray-400 dark:text-gray-500'>
        {icono}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500'>
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm text-gray-900 dark:text-white ${negrita ? 'font-bold' : 'font-medium'}`}
        >
          {texto}
        </p>
      </div>
    </div>
  )
}

export function ClienteCreadoRenderer({ evento }: Props) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo

  return (
    <div className='space-y-0 divide-y-0'>
      {/* Sección: Identidad */}
      <section className='mb-3'>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400'>
          Identidad
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<User className='h-4 w-4' />}
            label='Nombres'
            valor={get('nombres')}
            negrita
          />
          <Campo
            icono={<User className='h-4 w-4' />}
            label='Apellidos'
            valor={get('apellidos')}
            negrita
          />
          <Campo
            icono={<CreditCard className='h-4 w-4' />}
            label='Tipo de documento'
            valor={get('tipo_documento')}
          />
          <Campo
            icono={<CreditCard className='h-4 w-4' />}
            label='Número de documento'
            valor={get('numero_documento')}
          />
          <Campo
            icono={<Calendar className='h-4 w-4' />}
            label='Fecha de nacimiento'
            valor={get('fecha_nacimiento')}
          />
          <Campo
            icono={<Heart className='h-4 w-4' />}
            label='Estado civil'
            valor={get('estado_civil')}
          />
        </div>
      </section>

      {/* Sección: Contacto */}
      <section className='mb-3'>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400'>
          Contacto
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<Phone className='h-4 w-4' />}
            label='Teléfono'
            valor={get('telefono')}
          />
          <Campo
            icono={<Phone className='h-4 w-4' />}
            label='Teléfono alternativo'
            valor={get('telefono_alternativo')}
          />
          <Campo
            icono={<Mail className='h-4 w-4' />}
            label='Correo electrónico'
            valor={get('email')}
          />
        </div>
      </section>

      {/* Sección: Ubicación */}
      <section className='mb-3'>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400'>
          Ubicación
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<Home className='h-4 w-4' />}
            label='Dirección'
            valor={get('direccion')}
          />
          <Campo
            icono={<MapPin className='h-4 w-4' />}
            label='Ciudad'
            valor={get('ciudad')}
          />
          <Campo
            icono={<MapPin className='h-4 w-4' />}
            label='Departamento'
            valor={get('departamento')}
          />
        </div>
      </section>

      {/* Sección: Económico */}
      {(get('ocupacion') ?? get('empresa') ?? get('ingresos_mensuales')) ? (
        <section className='mb-3'>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400'>
            Información económica
          </p>
          <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
            <Campo
              icono={<Briefcase className='h-4 w-4' />}
              label='Ocupación'
              valor={get('ocupacion')}
            />
            <Campo
              icono={<Building className='h-4 w-4' />}
              label='Empresa'
              valor={get('empresa')}
            />
            <Campo
              icono={<Briefcase className='h-4 w-4' />}
              label='Ingresos mensuales'
              valor={get('ingresos_mensuales')}
            />
          </div>
        </section>
      ) : null}

      {/* Estado inicial */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400'>
          Estado inicial
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          <Campo
            icono={<Smile className='h-4 w-4' />}
            label='Estado del cliente'
            valor={get('estado')}
          />
        </div>
      </section>
    </div>
  )
}
