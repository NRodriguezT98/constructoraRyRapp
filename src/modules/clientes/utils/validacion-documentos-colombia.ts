/**
 * Validación de Documentos de Identidad Colombianos
 *
 * Implementa algoritmos de validación para:
 * - Cédula de Ciudadanía (CC)
 * - NIT/RUC (Número de Identificación Tributaria)
 *
 * Referencias:
 * - DIAN (Dirección de Impuestos y Aduanas Nacionales)
 * - Registraduría Nacional del Estado Civil
 */

// ============================================
// TIPOS
// ============================================

export type TipoDocumentoColombia = 'CC' | 'CE' | 'NIT' | 'Pasaporte'

export interface ResultadoValidacion {
  valido: boolean
  mensaje?: string
  detalles?: string
}

// ============================================
// VALIDACIÓN DE CÉDULA DE CIUDADANÍA
// ============================================

/**
 * Valida formato básico de cédula colombiana
 * - Solo números
 * - Entre 6 y 10 dígitos
 * - Sin puntos ni comas
 */
export function validarFormatoCedula(cedula: string): ResultadoValidacion {
  // Limpiar espacios
  const cedulaLimpia = cedula.trim()

  // Verificar que solo contenga números
  if (!/^\d+$/.test(cedulaLimpia)) {
    return {
      valido: false,
      mensaje: 'La cédula solo debe contener números',
      detalles: 'No incluyas puntos, comas ni espacios'
    }
  }

  // Verificar longitud (6-10 dígitos)
  if (cedulaLimpia.length < 6 || cedulaLimpia.length > 10) {
    return {
      valido: false,
      mensaje: 'La cédula debe tener entre 6 y 10 dígitos',
      detalles: `Actualmente tiene ${cedulaLimpia.length} dígitos`
    }
  }

  return { valido: true }
}

/**
 * Valida cédula extranjera (CE)
 * Similar a CC pero puede tener prefijos especiales
 */
export function validarFormatoCedulaExtranjera(ce: string): ResultadoValidacion {
  const ceLimpia = ce.trim()

  // Verificar que solo contenga números
  if (!/^\d+$/.test(ceLimpia)) {
    return {
      valido: false,
      mensaje: 'La cédula de extranjería solo debe contener números'
    }
  }

  // Verificar longitud (6-10 dígitos)
  if (ceLimpia.length < 6 || ceLimpia.length > 10) {
    return {
      valido: false,
      mensaje: 'La cédula de extranjería debe tener entre 6 y 10 dígitos'
    }
  }

  return { valido: true }
}

// ============================================
// VALIDACIÓN DE NIT (Algoritmo Módulo 11)
// ============================================

/**
 * Calcula dígito de verificación de NIT colombiano
 * Algoritmo oficial de la DIAN (módulo 11)
 *
 * @param nit - NIT sin dígito verificador (solo números)
 * @returns Dígito verificador (0-9 o 1 si el resultado es 0 o 1)
 */
export function calcularDigitoVerificacionNIT(nit: string): number {
  // Tabla de pesos según DIAN
  const pesos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]

  const nitLimpio = nit.replace(/\D/g, '') // Solo números
  const nitArray = nitLimpio.split('').map(Number).reverse()

  let suma = 0

  // Multiplicar cada dígito por su peso correspondiente
  nitArray.forEach((digito, index) => {
    if (index < pesos.length) {
      suma += digito * pesos[index]
    }
  })

  const residuo = suma % 11

  // Si el residuo es 0 o 1, el dígito verificador es el residuo
  // Si no, el dígito verificador es 11 - residuo
  if (residuo === 0 || residuo === 1) {
    return residuo
  }

  return 11 - residuo
}

/**
 * Valida NIT colombiano completo (con dígito verificador)
 * Formato aceptado: 900123456-7 o 9001234567
 *
 * @param nit - NIT con o sin guion
 * @returns Resultado de validación
 */
export function validarNIT(nit: string): ResultadoValidacion {
  // Limpiar espacios
  const nitLimpio = nit.trim()

  // Verificar formato básico (solo números y opcionalmente un guion antes del último dígito)
  if (!/^[\d-]+$/.test(nitLimpio)) {
    return {
      valido: false,
      mensaje: 'El NIT solo debe contener números y opcionalmente un guion',
      detalles: 'Formato esperado: 900123456-7 o 9001234567'
    }
  }

  // Separar NIT y dígito verificador
  let nitSinDV: string
  let digitoVerificadorIngresado: number

  if (nitLimpio.includes('-')) {
    const partes = nitLimpio.split('-')

    if (partes.length !== 2) {
      return {
        valido: false,
        mensaje: 'Formato de NIT inválido',
        detalles: 'Debe tener el formato: 900123456-7'
      }
    }

    nitSinDV = partes[0]
    digitoVerificadorIngresado = parseInt(partes[1], 10)

    if (isNaN(digitoVerificadorIngresado) || partes[1].length !== 1) {
      return {
        valido: false,
        mensaje: 'El dígito verificador debe ser un único número',
        detalles: 'Ejemplo: 900123456-7'
      }
    }
  } else {
    // Si no tiene guion, asumir que el último dígito es el verificador
    if (nitLimpio.length < 9) {
      return {
        valido: false,
        mensaje: 'El NIT debe tener al menos 9 dígitos',
        detalles: 'Formato: XXXXXXXXX-X (mínimo 8 dígitos + verificador)'
      }
    }

    nitSinDV = nitLimpio.slice(0, -1)
    digitoVerificadorIngresado = parseInt(nitLimpio.slice(-1), 10)
  }

  // Verificar longitud del NIT sin DV (8-15 dígitos según DIAN)
  if (nitSinDV.length < 8 || nitSinDV.length > 15) {
    return {
      valido: false,
      mensaje: 'El NIT debe tener entre 8 y 15 dígitos (sin contar el verificador)',
      detalles: `Actualmente tiene ${nitSinDV.length} dígitos`
    }
  }

  // Verificar que solo contenga números
  if (!/^\d+$/.test(nitSinDV)) {
    return {
      valido: false,
      mensaje: 'El NIT solo debe contener números'
    }
  }

  // Calcular dígito verificador correcto
  const digitoVerificadorCalculado = calcularDigitoVerificacionNIT(nitSinDV)

  // Comparar dígito verificador
  if (digitoVerificadorIngresado !== digitoVerificadorCalculado) {
    return {
      valido: false,
      mensaje: 'El dígito verificador del NIT es incorrecto',
      detalles: `El dígito correcto para ${nitSinDV} es ${digitoVerificadorCalculado}`
    }
  }

  return {
    valido: true,
    mensaje: 'NIT válido'
  }
}

// ============================================
// VALIDACIÓN DE PASAPORTE
// ============================================

/**
 * Valida formato de pasaporte
 * Acepta formatos internacionales (letras y números)
 */
export function validarPasaporte(pasaporte: string): ResultadoValidacion {
  const pasaporteLimpio = pasaporte.trim()

  // Verificar que no esté vacío
  if (!pasaporteLimpio) {
    return {
      valido: false,
      mensaje: 'El número de pasaporte no puede estar vacío'
    }
  }

  // Verificar que contenga letras y/o números (formato internacional)
  if (!/^[A-Z0-9]+$/i.test(pasaporteLimpio)) {
    return {
      valido: false,
      mensaje: 'El pasaporte solo debe contener letras y números',
      detalles: 'Sin espacios ni caracteres especiales'
    }
  }

  // Verificar longitud (6-15 caracteres, rango común internacional)
  if (pasaporteLimpio.length < 6 || pasaporteLimpio.length > 15) {
    return {
      valido: false,
      mensaje: 'El pasaporte debe tener entre 6 y 15 caracteres',
      detalles: `Actualmente tiene ${pasaporteLimpio.length} caracteres`
    }
  }

  return {
    valido: true,
    mensaje: 'Pasaporte válido'
  }
}

// ============================================
// FUNCIÓN PRINCIPAL DE VALIDACIÓN
// ============================================

/**
 * Valida un documento de identidad según su tipo
 *
 * @param tipoDocumento - Tipo de documento ('CC', 'CE', 'NIT', 'Pasaporte')
 * @param numeroDocumento - Número del documento
 * @returns Resultado de validación con mensaje descriptivo
 */
export function validarDocumentoIdentidad(
  tipoDocumento: TipoDocumentoColombia,
  numeroDocumento: string
): ResultadoValidacion {
  // Validar que no esté vacío
  if (!numeroDocumento || numeroDocumento.trim() === '') {
    return {
      valido: false,
      mensaje: 'El número de documento no puede estar vacío'
    }
  }

  // Validar según tipo de documento
  switch (tipoDocumento) {
    case 'CC':
      return validarFormatoCedula(numeroDocumento)

    case 'CE':
      return validarFormatoCedulaExtranjera(numeroDocumento)

    case 'NIT':
      return validarNIT(numeroDocumento)

    case 'Pasaporte':
      return validarPasaporte(numeroDocumento)

    default:
      return {
        valido: false,
        mensaje: 'Tipo de documento no soportado',
        detalles: 'Tipos válidos: CC, CE, NIT, Pasaporte'
      }
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea un NIT para mostrar con guion
 * Ejemplo: "9001234567" → "900123456-7"
 */
export function formatearNIT(nit: string): string {
  const nitLimpio = nit.replace(/\D/g, '')

  if (nitLimpio.length < 9) {
    return nit // Devolver sin cambios si es muy corto
  }

  const nitSinDV = nitLimpio.slice(0, -1)
  const dv = nitLimpio.slice(-1)

  return `${nitSinDV}-${dv}`
}

/**
 * Formatea una cédula para mostrar con puntos
 * Ejemplo: "1234567890" → "1.234.567.890"
 */
export function formatearCedula(cedula: string): string {
  const cedulaLimpia = cedula.replace(/\D/g, '')

  if (cedulaLimpia.length === 0) {
    return ''
  }

  // Agregar puntos cada 3 dígitos desde la derecha
  return cedulaLimpia.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Limpia un documento de puntos, comas y espacios
 * Útil antes de guardar en base de datos
 */
export function limpiarDocumento(documento: string): string {
  return documento.replace(/[.,\s]/g, '')
}
