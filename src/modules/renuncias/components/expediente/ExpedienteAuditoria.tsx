'use client'

import { Calendar, CheckCircle, CreditCard, FileText, Home, Shield, User, UserX, XCircle } from 'lucide-react'

import { formatDateTimeWithSeconds } from '@/lib/utils/date.utils'
import type { ExpedienteData } from '../../types'
import { expedienteStyles as styles } from './ExpedienteRenunciaPage.styles'

interface ExpedienteAuditoriaProps {
  datos: ExpedienteData
}

/** Parsea strings en formato "Nombres Apellidos (Rol)" o UUID puro */
function parseUsuarioLabel(raw: string | null): { nombre: string; rol: string | null } {
  if (!raw) return { nombre: 'Sistema', rol: null }
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(raw)) return { nombre: 'Usuario del sistema', rol: null }
  const match = raw.match(/^(.+?)\s*\((.+?)\)$/)
  if (match) return { nombre: match[1].trim(), rol: match[2].trim() }
  return { nombre: raw, rol: null }
}

export function ExpedienteAuditoria({ datos }: ExpedienteAuditoriaProps) {
  const { renuncia } = datos

  const cascadeActions = [
    { icon: XCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600', text: 'Negociación cerrada por renuncia' },
    { icon: Home, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', text: 'Vivienda liberada (estado → Disponible)' },
    { icon: UserX, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', text: 'Cliente marcado como "Renunció"' },
    { icon: CreditCard, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', text: 'Fuentes de pago inactivadas' },
  ]

  return (
    <div className={styles.auditoria.section}>
      {/* Registro */}
      <div>
        <p className={styles.auditoria.sectionTitle}>
          <FileText className="w-4 h-4 text-gray-500" />
          Registro de renuncia
        </p>
        <div className={styles.auditoria.card}>
          <div className={styles.auditoria.row}>
            <div className={`${styles.auditoria.rowIcon} bg-red-100 dark:bg-red-900/30`}>
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div className={styles.auditoria.rowContent}>
              <p className={styles.auditoria.rowLabel}>Registrado por</p>
              <p className={styles.auditoria.rowValue}>{parseUsuarioLabel(renuncia.usuario_registro).nombre}</p>
              {parseUsuarioLabel(renuncia.usuario_registro).rol ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{parseUsuarioLabel(renuncia.usuario_registro).rol}</p>
              ) : null}
            </div>
          </div>
          <div className={styles.auditoria.row}>
            <div className={`${styles.auditoria.rowIcon} bg-rose-100 dark:bg-rose-900/30`}>
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <div className={styles.auditoria.rowContent}>
              <p className={styles.auditoria.rowLabel}>Fecha de renuncia</p>
              <p className={styles.auditoria.rowValue}>{formatDateTimeWithSeconds(renuncia.fecha_renuncia)}</p>
            </div>
          </div>
          {renuncia.fecha_creacion ? (
            <div className={styles.auditoria.row}>
              <div className={`${styles.auditoria.rowIcon} bg-gray-100 dark:bg-gray-800`}>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div className={styles.auditoria.rowContent}>
                <p className={styles.auditoria.rowLabel}>Creado en sistema</p>
                <p className={styles.auditoria.rowValueMuted}>{formatDateTimeWithSeconds(renuncia.fecha_creacion)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Cierre (si aplica) */}
      {renuncia.estado === 'Cerrada' ? (
        <div>
          <p className={styles.auditoria.sectionTitle}>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Cierre de renuncia
          </p>
          <div className={styles.auditoria.card}>
            {renuncia.usuario_cierre ? (
              <div className={styles.auditoria.row}>
                <div className={`${styles.auditoria.rowIcon} bg-emerald-100 dark:bg-emerald-900/30`}>
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
            <div className={styles.auditoria.rowContent}>
                <p className={styles.auditoria.rowLabel}>Cerrado por</p>
                <p className={styles.auditoria.rowValue}>{parseUsuarioLabel(renuncia.usuario_cierre).nombre}</p>
                {parseUsuarioLabel(renuncia.usuario_cierre).rol ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{parseUsuarioLabel(renuncia.usuario_cierre).rol}</p>
                ) : null}
              </div>
              </div>
            ) : null}
            {renuncia.fecha_cierre ? (
              <div className={styles.auditoria.row}>
                <div className={`${styles.auditoria.rowIcon} bg-emerald-100 dark:bg-emerald-900/30`}>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className={styles.auditoria.rowContent}>
                  <p className={styles.auditoria.rowLabel}>Fecha de cierre</p>
                  <p className={styles.auditoria.rowValue}>{formatDateTimeWithSeconds(renuncia.fecha_cierre)}</p>
                </div>
              </div>
            ) : null}
            {renuncia.metodo_devolucion ? (
              <div className={styles.auditoria.row}>
                <div className={`${styles.auditoria.rowIcon} bg-blue-100 dark:bg-blue-900/30`}>
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div className={styles.auditoria.rowContent}>
                  <p className={styles.auditoria.rowLabel}>Método de devolución</p>
                  <p className={styles.auditoria.rowValue}>{renuncia.metodo_devolucion}</p>
                  {renuncia.numero_comprobante ? (
                    <p className={styles.auditoria.rowValueMuted}>Comprobante: {renuncia.numero_comprobante}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            {renuncia.notas_cierre ? (
              <div className={styles.auditoria.row}>
                <div className={`${styles.auditoria.rowIcon} bg-gray-100 dark:bg-gray-800`}>
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div className={styles.auditoria.rowContent}>
                  <p className={styles.auditoria.rowLabel}>Notas de cierre</p>
                  <p className={styles.auditoria.rowValueMuted}>{renuncia.notas_cierre}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Acciones en cascada */}
      <div>
        <p className={styles.auditoria.sectionTitle}>
          <Shield className="w-4 h-4 text-gray-500" />
          Acciones ejecutadas en cascada
        </p>
        <div className={styles.auditoria.cascadeList}>
          {cascadeActions.map((action, idx) => (
            <div key={idx} className={styles.auditoria.cascadeItem}>
              <div className={`${styles.auditoria.cascadeIcon} ${action.color}`}>
                <action.icon className="w-3.5 h-3.5" />
              </div>
              <p className={styles.auditoria.cascadeText}>{action.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
