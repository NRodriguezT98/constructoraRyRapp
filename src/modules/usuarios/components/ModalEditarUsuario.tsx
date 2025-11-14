/**
 * ============================================
 * MODAL: Editar Usuario
 * ============================================
 *
 * Formulario para editar usuario existente con:
 * - Prellenado de datos actuales
 * - Validación en tiempo real
 * - Campos no editables (email)
 */

'use client'

import { useEffect, useState } from 'react'

import { AlertCircle } from 'lucide-react'

import { ESTADOS_USUARIO, ROLES, type ActualizarUsuarioData, type EstadoUsuario, type Rol, type UsuarioCompleto } from '../types'

import { Modal } from './Modal'
import { usuariosStyles as styles } from './usuarios.styles'

interface ModalEditarUsuarioProps {
  isOpen: boolean
  onClose: () => void
  usuario: UsuarioCompleto | null
  onActualizar: (id: string, datos: ActualizarUsuarioData) => Promise<void>
}

interface FormularioEdicion {
  nombres: string
  apellidos: string
  telefono: string
  rol: Rol
  estado: EstadoUsuario
}

export function ModalEditarUsuario({ isOpen, onClose, usuario, onActualizar }: ModalEditarUsuarioProps) {
  const [formulario, setFormulario] = useState<FormularioEdicion>({
    nombres: '',
    apellidos: '',
    telefono: '',
    rol: 'Contador',
    estado: 'Activo',
  })

  const [errores, setErrores] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(false)

  // Prellenar formulario cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setFormulario({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono || '',
        rol: usuario.rol,
        estado: usuario.estado,
      })
    }
  }, [usuario])

  /**
   * Validar formulario
   */
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    // Nombres
    if (!formulario.nombres?.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios'
    }

    // Apellidos
    if (!formulario.apellidos?.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Manejar submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuario || !validarFormulario()) return

    try {
      setCargando(true)
      await onActualizar(usuario.id, formulario)
      handleCerrar()
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      setErrores({
        general: error instanceof Error ? error.message : 'Error al actualizar usuario',
      })
    } finally {
      setCargando(false)
    }
  }

  /**
   * Cerrar modal y resetear estado
   */
  const handleCerrar = () => {
    setFormulario({
      nombres: '',
      apellidos: '',
      telefono: '',
      rol: 'Contador',
      estado: 'Activo',
    })
    setErrores({})
    onClose()
  }

  if (!usuario) return null

  return (
    <Modal isOpen={isOpen} onClose={handleCerrar} title="Editar Usuario" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Error general */}
        {errores.general && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errores.general}</span>
          </div>
        )}

        {/* Email (no editable) */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>Email</label>
          <input
            type="email"
            className={`${styles.form.input} opacity-60 cursor-not-allowed`}
            value={usuario.email}
            disabled
          />
          <p className={styles.form.hint}>El email no se puede modificar</p>
        </div>

        {/* Nombres */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>
            Nombres <span className={styles.form.labelRequired}>*</span>
          </label>
          <input
            type="text"
            className={styles.form.input}
            value={formulario.nombres}
            onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
            placeholder="Juan Carlos"
          />
          {errores.nombres && <p className={styles.form.error}>{errores.nombres}</p>}
        </div>

        {/* Apellidos */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>
            Apellidos <span className={styles.form.labelRequired}>*</span>
          </label>
          <input
            type="text"
            className={styles.form.input}
            value={formulario.apellidos}
            onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
            placeholder="García Pérez"
          />
          {errores.apellidos && <p className={styles.form.error}>{errores.apellidos}</p>}
        </div>

        {/* Teléfono */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>Teléfono</label>
          <input
            type="tel"
            className={styles.form.input}
            value={formulario.telefono}
            onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
            placeholder="+57 300 123 4567"
          />
        </div>

        {/* Rol */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>
            Rol <span className={styles.form.labelRequired}>*</span>
          </label>
          <select
            className={styles.form.select}
            value={formulario.rol}
            onChange={(e) => setFormulario({ ...formulario, rol: e.target.value as any })}
          >
            {ROLES.map((rol) => (
              <option key={rol.value} value={rol.value}>
                {rol.label} - {rol.descripcion}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className={styles.form.group}>
          <label className={styles.form.label}>
            Estado <span className={styles.form.labelRequired}>*</span>
          </label>
          <select
            className={styles.form.select}
            value={formulario.estado}
            onChange={(e) => setFormulario({ ...formulario, estado: e.target.value as any })}
          >
            {ESTADOS_USUARIO.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className={styles.modal.footer}>
          <button
            type="button"
            onClick={handleCerrar}
            className={styles.button.secondary}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.button.primary} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
