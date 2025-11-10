/**
 * SERVICIO DE VALIDACIONES ASÍNCRONAS - VIVIENDA
 *
 * CAPA 2: Validaciones contra la base de datos
 * Verifica duplicados, relaciones y reglas de negocio
 */

import { supabase } from '@/lib/supabase/client';

// ============================================================================
// VALIDACIONES DE DUPLICADOS
// ============================================================================

/**
 * Verifica si existe una vivienda con el mismo número de matrícula
 * @returns {Promise<{exists: boolean, vivienda_id?: string}>}
 */
export async function validarMatriculaDuplicada(
  numeroMatricula: string,
  viviendaIdActual?: string
): Promise<{ exists: boolean; vivienda_id?: string; mensaje?: string }> {
  try {
    const query = supabase
      .from('viviendas')
      .select('id, numero_casa, proyecto:proyectos(nombre)')
      .eq('numero_matricula', numeroMatricula)
      .single()

    const { data, error } = await query

    // Si no encuentra nada, está libre
    if (error?.code === 'PGRST116') {
      return { exists: false }
    }

    if (error) {
      console.error('Error validando matrícula:', error)
      throw new Error('Error al validar matrícula')
    }

    // Si es la misma vivienda que estamos editando, está OK
    if (data && viviendaIdActual && data.id === viviendaIdActual) {
      return { exists: false }
    }

    // Duplicado encontrado
    if (data) {
      return {
        exists: true,
        vivienda_id: data.id,
        mensaje: `Matrícula ya existe en ${data.proyecto?.nombre || 'proyecto'} - Casa ${data.numero_casa}`,
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Error en validación de matrícula:', error)
    throw error
  }
}

/**
 * Verifica si existe una vivienda con el mismo número de casa en el mismo proyecto/manzana
 */
export async function validarNumeroCasaDuplicado(
  numeroCasa: string,
  proyectoId: string,
  manzanaId: string,
  viviendaIdActual?: string
): Promise<{ exists: boolean; mensaje?: string }> {
  try {
    const query = supabase
      .from('viviendas')
      .select('id, numero_matricula')
      .eq('numero_casa', numeroCasa)
      .eq('proyecto_id', proyectoId)
      .eq('manzana_id', manzanaId)

    if (viviendaIdActual) {
      query.neq('id', viviendaIdActual)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error validando número de casa:', error)
      throw new Error('Error al validar número de casa')
    }

    if (data && data.length > 0) {
      return {
        exists: true,
        mensaje: `Ya existe una casa con el número ${numeroCasa} en esta manzana`,
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('Error en validación de número de casa:', error)
    throw error
  }
}

// ============================================================================
// VALIDACIONES DE RELACIONES
// ============================================================================

/**
 * Verifica que el proyecto exista y esté activo
 */
export async function validarProyectoExiste(
  proyectoId: string
): Promise<{ exists: boolean; nombre?: string; mensaje?: string }> {
  try {
    const { data, error } = await supabase
      .from('proyectos')
      .select('nombre, estado')
      .eq('id', proyectoId)
      .single()

    if (error?.code === 'PGRST116') {
      return {
        exists: false,
        mensaje: 'Proyecto no encontrado',
      }
    }

    if (error) {
      console.error('Error validando proyecto:', error)
      throw new Error('Error al validar proyecto')
    }

    if (data.estado !== 'Activo') {
      return {
        exists: false,
        mensaje: `El proyecto "${data.nombre}" no está activo`,
      }
    }

    return {
      exists: true,
      nombre: data.nombre,
    }
  } catch (error) {
    console.error('Error en validación de proyecto:', error)
    throw error
  }
}

/**
 * Verifica que la manzana exista y pertenezca al proyecto
 */
export async function validarManzanaExiste(
  manzanaId: string,
  proyectoId: string
): Promise<{ exists: boolean; nombre?: string; mensaje?: string }> {
  try {
    const { data, error } = await supabase
      .from('manzanas')
      .select('nombre, proyecto_id')
      .eq('id', manzanaId)
      .single()

    if (error?.code === 'PGRST116') {
      return {
        exists: false,
        mensaje: 'Manzana no encontrada',
      }
    }

    if (error) {
      console.error('Error validando manzana:', error)
      throw new Error('Error al validar manzana')
    }

    if (data.proyecto_id !== proyectoId) {
      return {
        exists: false,
        mensaje: `La manzana "${data.nombre}" no pertenece a este proyecto`,
      }
    }

    return {
      exists: true,
      nombre: data.nombre,
    }
  } catch (error) {
    console.error('Error en validación de manzana:', error)
    throw error
  }
}

// ============================================================================
// VALIDACIONES DE NEGOCIO
// ============================================================================

/**
 * Valida coherencia financiera
 */
export function validarCoherenciaFinanciera(data: {
  valor_base: number
  valor_separacion: number
  valor_inicial: number
  valor_saldo: number
  cuotas_cantidad: number
  cuotas_valor: number
}): { valid: boolean; errores: string[] } {
  const errores: string[] = []

  // Separación + Inicial no puede exceder valor base
  const totalPagado = data.valor_separacion + data.valor_inicial
  if (totalPagado > data.valor_base) {
    errores.push(
      `El total pagado (${totalPagado.toLocaleString()}) no puede exceder el valor base (${data.valor_base.toLocaleString()})`
    )
  }

  // Saldo debe coincidir con valor_base - (separación + inicial)
  const saldoCalculado = data.valor_base - totalPagado
  if (Math.abs(data.valor_saldo - saldoCalculado) > 0.01) {
    errores.push(
      `El saldo (${data.valor_saldo.toLocaleString()}) no coincide con el calculado (${saldoCalculado.toLocaleString()})`
    )
  }

  // Total de cuotas debe cubrir el saldo
  const totalCuotas = data.cuotas_cantidad * data.cuotas_valor
  if (Math.abs(totalCuotas - data.valor_saldo) > data.valor_saldo * 0.01) {
    // Tolerancia 1%
    errores.push(
      `El total de cuotas (${totalCuotas.toLocaleString()}) no coincide con el saldo (${data.valor_saldo.toLocaleString()})`
    )
  }

  return {
    valid: errores.length === 0,
    errores,
  }
}

// ============================================================================
// VALIDACIÓN COMPLETA (orquestador)
// ============================================================================

/**
 * Valida todos los aspectos de una vivienda antes de guardar
 */
export async function validarViviendaCompleta(
  data: {
    numero_matricula: string
    numero_casa: string
    proyecto_id: string
    manzana_id: string
    valor_base: number
    valor_separacion: number
    valor_inicial: number
    valor_saldo: number
    cuotas_cantidad: number
    cuotas_valor: number
  },
  viviendaIdActual?: string
): Promise<{ valid: boolean; errores: Record<string, string> }> {
  const errores: Record<string, string> = {}

  try {
    // 1. Validar proyecto
    const proyectoValidacion = await validarProyectoExiste(data.proyecto_id)
    if (!proyectoValidacion.exists) {
      errores.proyecto_id = proyectoValidacion.mensaje || 'Proyecto inválido'
    }

    // 2. Validar manzana
    const manzanaValidacion = await validarManzanaExiste(data.manzana_id, data.proyecto_id)
    if (!manzanaValidacion.exists) {
      errores.manzana_id = manzanaValidacion.mensaje || 'Manzana inválida'
    }

    // 3. Validar matrícula duplicada
    const matriculaValidacion = await validarMatriculaDuplicada(
      data.numero_matricula,
      viviendaIdActual
    )
    if (matriculaValidacion.exists) {
      errores.numero_matricula =
        matriculaValidacion.mensaje || 'Matrícula duplicada'
    }

    // 4. Validar número de casa duplicado
    const casaValidacion = await validarNumeroCasaDuplicado(
      data.numero_casa,
      data.proyecto_id,
      data.manzana_id,
      viviendaIdActual
    )
    if (casaValidacion.exists) {
      errores.numero_casa = casaValidacion.mensaje || 'Número de casa duplicado'
    }

    // 5. Validar coherencia financiera
    const financieraValidacion = validarCoherenciaFinanciera(data)
    if (!financieraValidacion.valid) {
      errores.valor_saldo = financieraValidacion.errores[0] // Primer error
    }

    return {
      valid: Object.keys(errores).length === 0,
      errores,
    }
  } catch (error) {
    console.error('Error en validación completa:', error)
    throw error
  }
}
