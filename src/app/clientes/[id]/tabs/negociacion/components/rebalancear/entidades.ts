/**
 * Resolver entidades financieras por tipo de fuente.
 *
 * Las entidades se cargan dinámicamente desde `entidades_financieras` (BD)
 * y se resuelven usando `tipo_entidad_requerido` de `tipos_fuentes_pago`.
 */

/**
 * Dado un tipo de fuente de pago, retorna las entidades financieras correspondientes.
 *
 * @param tipoEntidadRequerido - El tipo de entidad que requiere la fuente (ej: 'Banco', 'Caja de Compensación')
 * @param entidadesPorTipoEntidad - Mapa tipo_entidad → nombres[], cargado desde BD
 */
export function getEntidadesParaTipo(
  tipoEntidadRequerido: string | null | undefined,
  entidadesPorTipoEntidad: Map<string, string[]>
): string[] {
  if (!tipoEntidadRequerido) return []
  return entidadesPorTipoEntidad.get(tipoEntidadRequerido) ?? []
}
