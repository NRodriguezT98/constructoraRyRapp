/**
 * ============================================
 * HOOK: useEditarUsuario
 * ============================================
 *
 * Lógica del formulario de edición de usuario.
 * Precarga datos del usuario por ID y navega
 * a /usuarios tras guardar exitosamente.
 */

'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ActualizarUsuarioData, EstadoUsuario, Rol } from '../types'

import {
  useActualizarUsuarioMutation,
  useUsuarioDetailQuery,
} from './useUsuariosQuery'

// ── Tipos ─────────────────────────────────────────────────────────────────

interface FormEditarUsuario {
  nombres: string
  apellidos: string
  telefono: string
  rol: Rol
  estado: EstadoUsuario
}

type FormErrores = Partial<Record<keyof FormEditarUsuario, string>>

// ── Hook ──────────────────────────────────────────────────────────────────

export function useEditarUsuario(id: string) {
  const router = useRouter()
  const {
    data: usuario,
    isLoading: cargandoUsuario,
    error: errorCarga,
  } = useUsuarioDetailQuery(id)
  const actualizarMutation = useActualizarUsuarioMutation()

  const [form, setForm] = useState<FormEditarUsuario>({
    nombres: '',
    apellidos: '',
    telefono: '',
    rol: 'Contabilidad',
    estado: 'Activo',
  })

  const [errores, setErrores] = useState<FormErrores>({})
  const [precargado, setPrecargado] = useState(false)

  // ── Precargar datos cuando llega el usuario ──────────────────────────────

  useEffect(() => {
    if (usuario && !precargado) {
      setForm({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono ?? '',
        rol: usuario.rol,
        estado: usuario.estado,
      })
      setPrecargado(true)
    }
  }, [usuario, precargado])

  // ── Validación ──────────────────────────────────────────────────────────

  const validar = (): boolean => {
    const nuevos: FormErrores = {}

    if (!form.nombres.trim()) nuevos.nombres = 'Los nombres son obligatorios'
    if (!form.apellidos.trim())
      nuevos.apellidos = 'Los apellidos son obligatorios'

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (field: keyof FormEditarUsuario, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar() || !usuario) return

    const datos: ActualizarUsuarioData = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim() || undefined,
      rol: form.rol,
      estado: form.estado,
    }

    actualizarMutation.mutate(
      { id: usuario.id, datos },
      {
        onSuccess: () => router.push('/usuarios'),
      }
    )
  }

  const handleVolver = () => router.push('/usuarios')

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    usuario,
    form,
    errores,
    cargandoUsuario,
    cargando: actualizarMutation.isPending,
    errorCarga,
    handleChange,
    handleSubmit,
    handleVolver,
  }
}
