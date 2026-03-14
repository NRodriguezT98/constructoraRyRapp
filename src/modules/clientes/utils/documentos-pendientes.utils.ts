/**
 * ============================================
 * UTILS: Documentos Pendientes — Lógica pura
 * ============================================
 *
 * Funciones puras para filtrar documentos pendientes por fuente de pago.
 * Esta es la ÚNICA fuente de verdad para la regla:
 *   "¿un requisito COMPARTIDO_CLIENTE bloquea esta fuente específica?"
 *
 * Regla de negocio:
 *   - Si fuentes_aplicables es null o vacío → aplica a TODAS las fuentes
 *   - Si fuentes_aplicables tiene valores → solo aplica a las fuentes listadas
 *   - Los requisitos ESPECIFICO_FUENTE ya vienen filtrados por fuente_pago_id
 */

export interface DocPendienteRaw {
  fuente_pago_id: string | null
  alcance: string | null
  tipo_documento: string | null
  tipo_documento_sistema?: string | null
  fuentes_aplicables: string[] | null
}

/**
 * Filtra una lista de documentos pendientes obligatorios para una fuente concreta.
 * Acepta tanto los específicos (por fuente_pago_id) como los compartidos
 * que realmente aplican al tipo de esa fuente.
 *
 * @param docs      - Todos los pendientes OBLIGATORIOS del cliente
 * @param fuenteId  - ID de la fuente a validar
 * @param tipoFuente - Tipo de la fuente (ej: 'Cuota Inicial')
 */
export function filtrarPendientesPorFuente<T extends DocPendienteRaw>(
  docs: T[],
  fuenteId: string,
  tipoFuente: string
): T[] {
  return docs.filter(doc => {
    if (doc.alcance === 'COMPARTIDO_CLIENTE') {
      // Aplica a esta fuente si fuentes_aplicables está vacío (= todas)
      // o si contiene explícitamente el tipo de esta fuente
      const aplicables = doc.fuentes_aplicables
      if (!aplicables || aplicables.length === 0) return true
      return aplicables.includes(tipoFuente)
    }

    // ESPECIFICO_FUENTE: solo aplica si pertenece a esta fuente
    return doc.fuente_pago_id === fuenteId
  })
}
