/**
 * Traduce mensajes de error de Supabase del inglés al español
 * Centraliza todas las traducciones para mantener consistencia
 */
export function traducirErrorSupabase(errorMessage: string): string {
  if (!errorMessage) return 'Error desconocido'

  // Mapeo de errores comunes de Supabase
  const traducciones: Record<string, string> = {
    // Errores de autenticación
    'Invalid login credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
    'Email not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
    'User not found': 'Usuario no encontrado.',
    'Invalid email': 'Email inválido.',
    'Password is too short': 'La contraseña es demasiado corta.',
    'Password should contain': 'La contraseña debe contener',
    'Email already registered': 'Este email ya está registrado.',
    'User already registered': 'Usuario ya registrado.',
    'Invalid password': 'Contraseña incorrecta.',

    // Errores de reset de contraseña
    'Unable to validate email': 'No se pudo validar el email.',
    'Token expired': 'El enlace ha expirado. Solicita uno nuevo.',
    'Invalid token': 'Enlace inválido.',

    // Errores de conexión
    'Network error': 'Error de conexión. Verifica tu internet.',
    'Failed to fetch': 'Error de conexión con el servidor.',
    'Timeout': 'Tiempo de espera agotado. Intenta nuevamente.',

    // Errores de sesión
    'Session expired': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    'Invalid session': 'Sesión inválida.',
    'Session not found': 'Sesión no encontrada.',

    // Errores de base de datos
    'Database error': 'Error en la base de datos.',
    'Permission denied': 'Permisos insuficientes.',
    'Row not found': 'Registro no encontrado.',
  }

  // Buscar traducción exacta
  for (const [ingles, espanol] of Object.entries(traducciones)) {
    if (errorMessage.includes(ingles)) {
      return espanol
    }
  }

  // Si no hay traducción específica, limpiar y capitalizar
  return errorMessage
    .replace(/Error:/gi, '')
    .replace(/Failed to/gi, 'Falló al')
    .replace(/Unable to/gi, 'No se pudo')
    .replace(/Invalid/gi, 'Inválido')
    .replace(/Required/gi, 'Requerido')
    .trim()
}

/**
 * Traduce mensajes de éxito de Supabase
 */
export function traducirExitoSupabase(successMessage: string): string {
  const traducciones: Record<string, string> = {
    'Password updated': 'Contraseña actualizada exitosamente.',
    'Email sent': 'Email enviado. Revisa tu bandeja de entrada.',
    'User created': 'Usuario creado exitosamente.',
    'Confirmation email sent': 'Email de confirmación enviado.',
    'Password reset email sent': 'Email de recuperación enviado.',
  }

  for (const [ingles, espanol] of Object.entries(traducciones)) {
    if (successMessage.includes(ingles)) {
      return espanol
    }
  }

  return successMessage
}
