/**
 * Hook: useEditarCampoModal
 *
 * Lógica de negocio para crear/editar campos dinámicos.
 * Maneja estado, validación y transformación de datos.
 *
 * @version 1.0 - Separación de responsabilidades
 */

import { useCallback, useMemo, useState } from 'react'

import type {
  CampoConfig,
  RolCampo,
  TipoCampoDinamico,
} from '@/modules/configuracion/types/campos-dinamicos.types'

import { ROLES_DISPONIBLES } from '../constants/campos-disponibles'

// ============================================
// TIPOS
// ============================================

interface UseEditarCampoModalParams {
  modo: 'crear' | 'editar'
  campoInicial: CampoConfig | null
  camposExistentes: CampoConfig[]
  onConfirmar: (campo: CampoConfig) => void
}

interface Errores {
  nombre?: string
  label?: string
  tipo?: string
  rol?: string
}

// ============================================
// HOOK
// ============================================

export function useEditarCampoModal({
  modo,
  campoInicial,
  camposExistentes,
  onConfirmar,
}: UseEditarCampoModalParams) {
  // ============================================
  // ESTADO
  // ============================================

  const [nombre, setNombre] = useState(campoInicial?.nombre || '')
  const [tipo, setTipo] = useState<TipoCampoDinamico>(
    campoInicial?.tipo || 'text'
  )
  const [rol, setRol] = useState<RolCampo>(campoInicial?.rol || 'informativo')
  const [label, setLabel] = useState(campoInicial?.label || '')
  const [placeholder, setPlaceholder] = useState(
    campoInicial?.placeholder || ''
  )
  const [ayuda, setAyuda] = useState(campoInicial?.ayuda || '')
  const [requerido, setRequerido] = useState(campoInicial?.requerido || false)
  const [errores, setErrores] = useState<Errores>({})

  // ============================================
  // ROLES DISPONIBLES (FILTRADOS)
  // ============================================

  const rolesDisponibles = useMemo(() => {
    // Verificar si ya existe un campo con rol='monto'
    const yaExisteMonto = camposExistentes.some(
      c => c.rol === 'monto' && c.nombre !== campoInicial?.nombre
    )

    // Si ya existe, filtrar el rol 'monto' de las opciones
    if (yaExisteMonto) {
      return ROLES_DISPONIBLES.filter(r => r.value !== 'monto')
    }

    return ROLES_DISPONIBLES
  }, [camposExistentes, campoInicial])

  // ============================================
  // VALIDACIÓN
  // ============================================

  const validar = useCallback((): boolean => {
    const nuevosErrores: Errores = {}

    // Nombre
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    } else if (!/^[a-z_][a-z0-9_]*$/.test(nombre)) {
      nuevosErrores.nombre =
        'Solo minúsculas, números y guiones bajos (snake_case)'
    } else if (
      modo === 'crear' &&
      camposExistentes.some(c => c.nombre === nombre)
    ) {
      nuevosErrores.nombre = 'Ya existe un campo con este nombre'
    }

    // Label
    if (!label.trim()) {
      nuevosErrores.label = 'La etiqueta es obligatoria'
    }

    // Tipo
    if (!tipo) {
      nuevosErrores.tipo = 'El tipo es obligatorio'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [nombre, label, tipo, modo, camposExistentes])

  // ============================================
  // HANDLERS
  // ============================================

  const handleConfirmar = useCallback(() => {
    if (!validar()) return

    // Calcular orden (último + 1 si es nuevo)
    const orden =
      modo === 'crear'
        ? Math.max(0, ...camposExistentes.map(c => c.orden)) + 1
        : campoInicial?.orden || 1

    const campo: CampoConfig = {
      nombre,
      tipo,
      rol,
      label,
      placeholder: placeholder.trim() || undefined,
      ayuda: ayuda.trim() || undefined,
      requerido,
      orden,
    }

    onConfirmar(campo)
  }, [
    nombre,
    tipo,
    rol,
    label,
    placeholder,
    ayuda,
    requerido,
    modo,
    campoInicial,
    camposExistentes,
    validar,
    onConfirmar,
  ])

  // Obtener descripción del rol seleccionado
  const rolDescripcion =
    ROLES_DISPONIBLES.find(r => r.value === rol)?.description || ''

  // ============================================
  // RETURN
  // ============================================

  return {
    // Estado
    nombre,
    tipo,
    rol,
    label,
    placeholder,
    ayuda,
    requerido,
    errores,
    rolDescripcion,
    rolesDisponibles,

    // Setters
    setNombre,
    setTipo,
    setRol,
    setLabel,
    setPlaceholder,
    setAyuda,
    setRequerido,

    // Handlers
    handleConfirmar,
  }
}
