'use client'

import type { Cliente } from '@/modules/clientes/types'
import { ORIGENES_CLIENTE, TIPOS_DOCUMENTO } from '@/modules/clientes/types'
import {
    Building2,
    Calendar,
    Eye,
    FileText,
    Home,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    User,
    Users
} from 'lucide-react'
import * as styles from '../cliente-detalle.styles'

interface GeneralTabProps {
  cliente: Cliente
}

// Componente para mostrar un campo de información
function InfoField({
  icon: Icon,
  label,
  value,
  showEmpty = false,
}: {
  icon: any
  label: string
  value: string | undefined | null
  showEmpty?: boolean
}) {
  // Si no tiene valor y no queremos mostrar vacíos, no renderizar
  if (!value && !showEmpty) return null

  return (
    <div className={styles.infoCardClasses.fieldContainer}>
      <div className={styles.infoCardClasses.fieldIconContainer}>
        <Icon className={styles.infoCardClasses.fieldIcon} />
      </div>
      <div className={styles.infoCardClasses.fieldContent}>
        <p className={styles.infoCardClasses.fieldLabel}>{label}</p>
        <p
          className={
            value
              ? styles.infoCardClasses.fieldValue
              : styles.infoCardClasses.fieldValueEmpty
          }
        >
          {value || 'No especificado'}
        </p>
      </div>
    </div>
  )
}

export function GeneralTab({ cliente }: GeneralTabProps) {
  return (
    <div className='space-y-6'>
      {/* Información Personal */}
      <div className={styles.infoCardClasses.card}>
        <div className={styles.infoCardClasses.header}>
          <div
            className={styles.infoCardClasses.iconContainer}
            style={{ background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' }}
          >
            <User className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>Información Personal</h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div className={styles.infoCardClasses.grid}>
            <InfoField icon={User} label='Nombres' value={cliente.nombres} showEmpty />
            <InfoField icon={User} label='Apellidos' value={cliente.apellidos} showEmpty />
            <InfoField
              icon={FileText}
              label='Tipo de Documento'
              value={TIPOS_DOCUMENTO[cliente.tipo_documento]}
              showEmpty
            />
            <InfoField
              icon={FileText}
              label='Número de Documento'
              value={cliente.numero_documento}
              showEmpty
            />
            <InfoField
              icon={Calendar}
              label='Fecha de Nacimiento'
              value={
                cliente.fecha_nacimiento
                  ? new Date(cliente.fecha_nacimiento).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : undefined
              }
              showEmpty
            />
          </div>

          {/* Documento de Identidad (si existe URL) */}
          {cliente.documento_identidad_url && (
            <div className='mt-4'>
              <a
                href={cliente.documento_identidad_url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 transition-all hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:border-blue-700 dark:hover:bg-blue-900/40'
              >
                <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                <div className='flex-1'>
                  <p className='font-semibold text-blue-900 dark:text-blue-100'>
                    Documento de Identidad
                  </p>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>
                    Haz clic para ver o descargar
                  </p>
                </div>
                <Eye className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Información de Contacto */}
      <div className={styles.infoCardClasses.card}>
        <div className={styles.infoCardClasses.header}>
          <div
            className={styles.infoCardClasses.iconContainer}
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
          >
            <Phone className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>Información de Contacto</h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div className={styles.infoCardClasses.grid}>
            <InfoField icon={Phone} label='Teléfono Principal' value={cliente.telefono} showEmpty />
            <InfoField
              icon={Phone}
              label='Teléfono Alternativo'
              value={cliente.telefono_alternativo}
              showEmpty
            />
            <InfoField icon={Mail} label='Correo Electrónico' value={cliente.email} showEmpty />
            <InfoField icon={MapPin} label='Dirección' value={cliente.direccion} showEmpty />
            <InfoField icon={Building2} label='Ciudad' value={cliente.ciudad} showEmpty />
            <InfoField icon={Home} label='Departamento' value={cliente.departamento} showEmpty />
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className={styles.infoCardClasses.card}>
        <div className={styles.infoCardClasses.header}>
          <div
            className={styles.infoCardClasses.iconContainer}
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
          >
            <MessageSquare className={styles.infoCardClasses.icon} />
          </div>
          <h3 className={styles.infoCardClasses.title}>Información Adicional</h3>
        </div>
        <div className={styles.infoCardClasses.content}>
          <div className={styles.infoCardClasses.grid}>
            <InfoField
              icon={Users}
              label='¿Cómo nos conoció?'
              value={cliente.origen ? ORIGENES_CLIENTE[cliente.origen] : undefined}
              showEmpty
            />
            <InfoField icon={Users} label='Referido por' value={cliente.referido_por} showEmpty />
          </div>

          {/* Notas */}
          <div className='mt-4'>
            <div className='flex items-start gap-3'>
              <div className={styles.infoCardClasses.fieldIconContainer}>
                <MessageSquare className={styles.infoCardClasses.fieldIcon} />
              </div>
              <div className='flex-1'>
                <p className={styles.infoCardClasses.fieldLabel}>Notas y Observaciones</p>
                <p
                  className={
                    cliente.notas
                      ? 'mt-1 text-sm text-gray-700 dark:text-gray-300'
                      : styles.infoCardClasses.fieldValueEmpty
                  }
                >
                  {cliente.notas || 'Sin notas adicionales'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
