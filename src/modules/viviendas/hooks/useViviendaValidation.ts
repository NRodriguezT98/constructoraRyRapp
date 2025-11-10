/**
 * HOOK DE VALIDACIÓN CON DEBOUNCING - VIVIENDA
 *
 * CAPA 3: Integración con React Hook Form y TanStack Query
 * Gestiona validaciones asíncronas con cache y debouncing
 */

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  validarManzanaExiste,
  validarMatriculaDuplicada,
  validarNumeroCasaDuplicado,
  validarProyectoExiste,
} from '../services/vivienda-validation.service'

// ============================================================================
// CONFIGURACIÓN DE DEBOUNCING
// ============================================================================

const DEBOUNCE_DELAY = 500 // milisegundos

/**
 * Hook para validar matrícula con debouncing y cache
 */
export function useValidarMatricula(
  numeroMatricula: string | undefined,
  viviendaIdActual?: string
) {
  const [debouncedValue, setDebouncedValue] = useState(numeroMatricula)

  // Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(numeroMatricula)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timer)
  }, [numeroMatricula])

  // Query con cache
  return useQuery({
    queryKey: ['validar-matricula', debouncedValue, viviendaIdActual],
    queryFn: () => validarMatriculaDuplicada(debouncedValue!, viviendaIdActual),
    enabled: Boolean(debouncedValue && debouncedValue.length >= 5), // Solo validar si tiene mínimo 5 caracteres
    staleTime: 30000, // Cache 30 segundos
    retry: 1,
  })
}

/**
 * Hook para validar número de casa con debouncing
 */
export function useValidarNumeroCasa(
  numeroCasa: string | undefined,
  proyectoId: string | undefined,
  manzanaId: string | undefined,
  viviendaIdActual?: string
) {
  const [debouncedValue, setDebouncedValue] = useState(numeroCasa)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(numeroCasa)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timer)
  }, [numeroCasa])

  return useQuery({
    queryKey: [
      'validar-numero-casa',
      debouncedValue,
      proyectoId,
      manzanaId,
      viviendaIdActual,
    ],
    queryFn: () =>
      validarNumeroCasaDuplicado(
        debouncedValue!,
        proyectoId!,
        manzanaId!,
        viviendaIdActual
      ),
    enabled: Boolean(debouncedValue && proyectoId && manzanaId),
    staleTime: 30000,
    retry: 1,
  })
}

/**
 * Hook para validar proyecto
 */
export function useValidarProyecto(proyectoId: string | undefined) {
  return useQuery({
    queryKey: ['validar-proyecto', proyectoId],
    queryFn: () => validarProyectoExiste(proyectoId!),
    enabled: Boolean(proyectoId),
    staleTime: 60000, // Proyectos cambian poco, cache 1 minuto
    retry: 1,
  })
}

/**
 * Hook para validar manzana
 */
export function useValidarManzana(
  manzanaId: string | undefined,
  proyectoId: string | undefined
) {
  return useQuery({
    queryKey: ['validar-manzana', manzanaId, proyectoId],
    queryFn: () => validarManzanaExiste(manzanaId!, proyectoId!),
    enabled: Boolean(manzanaId && proyectoId),
    staleTime: 60000,
    retry: 1,
  })
}

// ============================================================================
// HOOK AGREGADOR (todos los estados juntos)
// ============================================================================

/**
 * Hook que agrega todos los estados de validación
 * Útil para mostrar indicadores de validación en el formulario
 */
export function useViviendaValidationStatus(formData: {
  numero_matricula?: string
  numero_casa?: string
  proyecto_id?: string
  manzana_id?: string
  vivienda_id?: string
}) {
  const matriculaValidation = useValidarMatricula(
    formData.numero_matricula,
    formData.vivienda_id
  )
  const casaValidation = useValidarNumeroCasa(
    formData.numero_casa,
    formData.proyecto_id,
    formData.manzana_id,
    formData.vivienda_id
  )
  const proyectoValidation = useValidarProyecto(formData.proyecto_id)
  const manzanaValidation = useValidarManzana(
    formData.manzana_id,
    formData.proyecto_id
  )

  return {
    matricula: {
      isValidating: matriculaValidation.isFetching,
      isValid: matriculaValidation.data?.exists === false,
      error: matriculaValidation.data?.mensaje,
    },
    casa: {
      isValidating: casaValidation.isFetching,
      isValid: casaValidation.data?.exists === false,
      error: casaValidation.data?.mensaje,
    },
    proyecto: {
      isValidating: proyectoValidation.isFetching,
      isValid: proyectoValidation.data?.exists === true,
      error: proyectoValidation.data?.mensaje,
      nombre: proyectoValidation.data?.nombre,
    },
    manzana: {
      isValidating: manzanaValidation.isFetching,
      isValid: manzanaValidation.data?.exists === true,
      error: manzanaValidation.data?.mensaje,
      nombre: manzanaValidation.data?.nombre,
    },
    // Estado general
    isAnyValidating:
      matriculaValidation.isFetching ||
      casaValidation.isFetching ||
      proyectoValidation.isFetching ||
      manzanaValidation.isFetching,
    hasAnyError:
      matriculaValidation.data?.exists ||
      casaValidation.data?.exists ||
      !proyectoValidation.data?.exists ||
      !manzanaValidation.data?.exists,
  }
}
