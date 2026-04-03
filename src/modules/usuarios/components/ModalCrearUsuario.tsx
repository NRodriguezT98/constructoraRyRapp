/**
 * ============================================
 * MODAL: Crear Usuario
 * ============================================
 *
 * Formulario para crear nuevo usuario con:
 * - Validación en tiempo real
 * - Generación automática de password
 * - Notificación de contraseña temporal
 */

'use client'

import { useState } from 'react'

import { AlertCircle, Check, Copy, Eye, EyeOff } from 'lucide-react'

import { logger } from '@/lib/utils/logger'

import {
  ROLES,
  type CrearUsuarioData,
  type CrearUsuarioRespuesta,
  type Rol,
} from '../types'

import { Modal } from './Modal'
import { usuariosStyles as styles } from './usuarios.styles'

interface ModalCrearUsuarioProps {
  isOpen: boolean
  onClose: () => void
  onCrear: (datos: CrearUsuarioData) => Promise<CrearUsuarioRespuesta>
}

export function ModalCrearUsuario({
  isOpen,
  onClose,
  onCrear,
}: ModalCrearUsuarioProps) {
  const [formulario, setFormulario] = useState<CrearUsuarioData>({
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    rol: 'Contador',
    password: '',
    enviar_invitacion: false,
  })

  const [errores, setErrores] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(false)
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [passwordCopiado, setPasswordCopiado] = useState(false)

  /**
   * Validar formulario
   */
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    // Email
    if (!formulario.email) {
      nuevosErrores.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    // Nombres
    if (!formulario.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios'
    }

    // Apellidos
    if (!formulario.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios'
    }

    // Password opcional (si se deja vacío se genera automáticamente)
    if (formulario.password && formulario.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Manejar submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) return

    try {
      setCargando(true)

      const resultado = await onCrear(formulario)

      // Si se generó password temporal, mostrarlo
      if (resultado.password_temporal) {
        setPasswordTemporal(resultado.password_temporal)
      } else {
        // Si no hay password temporal, cerrar modal
        handleCerrar()
      }
    } catch (error) {
      logger.error('Error creando usuario:', error)
      setErrores({
        general:
          error instanceof Error ? error.message : 'Error al crear usuario',
      })
    } finally {
      setCargando(false)
    }
  }

  /**
   * Copiar password al portapapeles
   */
  const copiarPassword = async () => {
    if (!passwordTemporal) return

    try {
      await navigator.clipboard.writeText(passwordTemporal)
      setPasswordCopiado(true)
      setTimeout(() => setPasswordCopiado(false), 2000)
    } catch (error) {
      logger.error('Error copiando password:', error)
    }
  }

  /**
   * Cerrar modal y resetear estado
   */
  const handleCerrar = () => {
    setFormulario({
      email: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      rol: 'Contador',
      password: '',
      enviar_invitacion: false,
    })
    setErrores({})
    setPasswordTemporal(null)
    setMostrarPassword(false)
    setPasswordCopiado(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCerrar}
      title='Crear Nuevo Usuario'
      maxWidth='lg'
    >
      {/* Mostrar password temporal si fue generado */}
      {passwordTemporal ? (
        <div className='space-y-3'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20'>
            <div className='flex items-start gap-2'>
              <Check className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400' />
              <div className='flex-1'>
                <h3 className='text-sm font-medium text-green-800 dark:text-green-300'>
                  Usuario creado exitosamente
                </h3>
                <p className='mt-1 text-xs text-green-700 dark:text-green-400'>
                  El usuario <strong>{formulario.email}</strong> ha sido creado.
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20'>
            <div className='flex items-start gap-2'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400' />
              <div className='flex-1'>
                <h3 className='text-sm font-medium text-orange-800 dark:text-orange-300'>
                  Contraseña Temporal
                </h3>
                <p className='mt-1 text-xs text-orange-700 dark:text-orange-400'>
                  Guarda esta contraseña. No se volverá a mostrar.
                </p>
                <div className='mt-2 flex items-center gap-2'>
                  <code className='flex-1 rounded border border-orange-300 bg-white px-2 py-1.5 font-mono text-xs text-slate-800 dark:border-orange-700 dark:bg-slate-900 dark:text-slate-200'>
                    {passwordTemporal}
                  </code>
                  <button
                    onClick={copiarPassword}
                    className={`${styles.button.secondary} flex items-center gap-1.5 text-xs`}
                  >
                    {passwordCopiado ? (
                      <>
                        <Check className='h-3 w-3' />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className='h-3 w-3' />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className='mt-2 text-xs text-orange-600 dark:text-orange-400'>
                  El usuario deberá cambiar la contraseña en su primer inicio de
                  sesión.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.modal.footer}>
            <button onClick={handleCerrar} className={styles.button.primary}>
              Entendido
            </button>
          </div>
        </div>
      ) : (
        // Formulario de creación
        <form onSubmit={handleSubmit} className='space-y-3'>
          {/* Error general */}
          {errores.general && (
            <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
              <span>{errores.general}</span>
            </div>
          )}

          {/* Email */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Email <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='email'
              className={styles.form.input}
              value={formulario.email}
              onChange={e =>
                setFormulario({ ...formulario, email: e.target.value })
              }
              placeholder='usuario@ejemplo.com'
            />
            {errores.email && (
              <p className={styles.form.error}>{errores.email}</p>
            )}
          </div>

          {/* Nombres */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Nombres <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='text'
              className={styles.form.input}
              value={formulario.nombres}
              onChange={e =>
                setFormulario({ ...formulario, nombres: e.target.value })
              }
              placeholder='Juan Carlos'
            />
            {errores.nombres && (
              <p className={styles.form.error}>{errores.nombres}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Apellidos <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='text'
              className={styles.form.input}
              value={formulario.apellidos}
              onChange={e =>
                setFormulario({ ...formulario, apellidos: e.target.value })
              }
              placeholder='García Pérez'
            />
            {errores.apellidos && (
              <p className={styles.form.error}>{errores.apellidos}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>Teléfono</label>
            <input
              type='tel'
              className={styles.form.input}
              value={formulario.telefono}
              onChange={e =>
                setFormulario({ ...formulario, telefono: e.target.value })
              }
              placeholder='+57 300 123 4567'
            />
            <p className={styles.form.hint}>Opcional</p>
          </div>

          {/* Rol */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Rol <span className={styles.form.labelRequired}>*</span>
            </label>
            <select
              className={styles.form.select}
              value={formulario.rol}
              onChange={e =>
                setFormulario({ ...formulario, rol: e.target.value as Rol })
              }
            >
              {ROLES.map(rol => (
                <option key={rol.value} value={rol.value}>
                  {rol.label} - {rol.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Password opcional */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>Contraseña (Opcional)</label>
            <div className='relative'>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                className={styles.form.input}
                value={formulario.password}
                onChange={e =>
                  setFormulario({ ...formulario, password: e.target.value })
                }
                placeholder='Dejar vacío para generar automáticamente'
              />
              <button
                type='button'
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              >
                {mostrarPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            {errores.password && (
              <p className={styles.form.error}>{errores.password}</p>
            )}
            <p className={styles.form.hint}>
              Si se deja vacío, se generará una contraseña segura
              automáticamente
            </p>
          </div>

          {/* Footer */}
          <div className={styles.modal.footer}>
            <button
              type='button'
              onClick={handleCerrar}
              className={styles.button.secondary}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className={styles.button.primary}
              disabled={cargando}
            >
              {cargando ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
