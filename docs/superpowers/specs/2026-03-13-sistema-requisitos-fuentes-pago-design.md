# Diseño: Sistema Unificado de Requisitos de Fuentes de Pago

**Fecha:** 2026-03-13
**Estado:** Aprobado
**Autor:** Colaboración Admin + GitHub Copilot

---

## Contexto y Problema

La aplicación tiene **dos sistemas paralelos** que hacen lo mismo y están en conflicto activo, causando errores 500 en producción:

### Sistema ANTIGUO (a eliminar)
- Tabla `pasos_fuente_pago` — rastrea pasos de validación por fuente
- Tabla `documentos_pendientes` — lista de documentos pendientes por cliente
- Trigger `trigger_crear_documento_pendiente` — crea pendientes automáticamente vía `carta_aprobacion_url`
- Trigger `trigger_limpiar_pendientes_fuente` — limpia pendientes al eliminar fuente
- Función `validarPreDesembolso()` — valida requisitos leyendo `pasos_fuente_pago`
- Hook `usePasosFuentePago` — React Query sobre `pasos_fuente_pago`
- Service `pasos-fuente-pago.service.ts`

### Sistema NUEVO (a conservar y completar)
- Tabla `requisitos_fuentes_pago_config` — configuración admin desde UI
- Vista `vista_documentos_pendientes_fuentes` — calcula pendientes en tiempo real
- Componente `ValidadorDocumentosObligatorios` — usa la vista para validar desembolso
- Banner en pestaña Documentos — usa la vista para mostrar pendientes

### Causa del error 500 actual
Los triggers `trigger_compactar_despues_update/insert/delete` fueron creados para el sistema nuevo pero llaman a `compactar_orden_requisitos()` que hace UPDATE en la misma tabla, disparando el trigger de nuevo → **bucle infinito de recursión** → 500 Internal Server Error.

---

## Decisiones de Diseño

| Decisión | Elección | Razón |
|---|---|---|
| ¿Qué sistema prevalece? | Sistema nuevo (vista en tiempo real) | Sin deuda técnica, configurable sin código |
| ¿Validación de documentos? | Automática al subir (estado Activo = cumplido) | Admin es el único que sube, no tiene sentido autoaprobarse |
| ¿Cómo se vincula el documento al requisito? | Vínculo explícito: `fuente_pago_relacionada` + `tipo_documento` pre-llenados desde el banner | Evita ambigüedad en el cruce de datos |
| ¿El tipo_documento es libre al subir desde banner? | No, es read-only pre-llenado desde `rfc.tipo_documento_sugerido` | Un espacio de más rompe el match en la vista |
| ¿Cuota Inicial requiere documentos? | No, no tiene requisitos configurados en la tabla | Correcto por diseño |

---

## Arquitectura del Sistema Nuevo

```
requisitos_fuentes_pago_config
  (Admin configura desde UI: qué docs necesita cada fuente)
         ↓
vista_documentos_pendientes_fuentes
  (Calcula en tiempo real: qué docs faltan por cliente/fuente)
         ↓
    [dos consumidores]
    ├── SeccionDocumentosPendientes / Banner
    │     "Falta este doc → botón upload"
    │     Al hacer upload → modal pre-llenado con tipo + fuente_pago_relacionada
    │     Al guardar → vista recalcula → pendiente desaparece
    │     Si se elimina el doc → vista lo vuelve a mostrar
    │
    └── ValidadorDocumentosObligatorios / useValidacionBotonDesembolso
          Consulta vista filtrando DOCUMENTO_OBLIGATORIO
          Sin pendientes → botón habilitado
          Con pendientes → botón bloqueado + tooltip lista los docs faltantes
```

---

## Flujo Completo

### Configuración (una vez, por el Admin)
1. Admin entra a módulo **Requisitos Fuentes**
2. Selecciona tipo de fuente (ej: "Crédito Hipotecario") — pestaña **Específicos**
3. Agrega requisito: título, nivel (Obligatorio/Opcional), tipo_documento_sugerido, orden
4. Para documentos compartidos entre fuentes → pestaña **Compartidos**
   - Ej: "Boleta de Registro" aplica a `['Crédito Hipotecario', 'Subsidio Mi Casa Ya']`
   - `alcance = COMPARTIDO_CLIENTE`, `fuentes_aplicables = [...]`
   - La vista lo muestra como UN solo pendiente por cliente (no uno por fuente)

### Operación diaria (por cliente)
1. Cliente tiene negociación con fuente "Crédito Hipotecario" activa
2. Banner en pestaña **Documentos** muestra: "Falta: Carta de Aprobación (Alta)"
3. Admin hace clic en el botón upload del pendiente
4. Modal se abre pre-llenado:
   - `tipo_documento` = `rfc.tipo_documento_sugerido` (read-only)
   - `fuente_pago_relacionada` = `fp.id` (para docs ESPECÍFICOS)
5. Admin sube el archivo → se guarda con esos campos exactos
6. Vista recalcula → pendiente desaparece del banner
7. `ValidadorDocumentosObligatorios` detecta 0 pendientes obligatorios → botón de abono habilitado
8. Si el documento se elimina → vista vuelve a mostrar el pendiente → botón se bloquea

---

## Alcance de los Documentos

| Tipo | `alcance` | `fuente_pago_relacionada` | Aparece como |
|---|---|---|---|
| Carta de Aprobación Bancolombia | `ESPECIFICO_FUENTE` | id de la fuente específica | Un pendiente POR FUENTE |
| Boleta de Registro | `COMPARTIDO_CLIENTE` | null | Un pendiente POR CLIENTE |

---

## Validación para Desembolso

```typescript
// Reemplaza completamente validarPreDesembolso()
async function puedeDesembolsar(fuentePagoId: string, clienteId: string) {
  const { data } = await supabase
    .from('vista_documentos_pendientes_fuentes')
    .select('tipo_documento, nivel_validacion, alcance')
    .or(`fuente_pago_id.eq.${fuentePagoId},fuente_pago_id.is.null`)
    .eq('cliente_id', clienteId)
    .eq('nivel_validacion', 'DOCUMENTO_OBLIGATORIO')

  return {
    habilitado: data.length === 0,
    pendientesObligatorios: data.map(d => d.tipo_documento)
  }
}
```

El botón de abono/desembolso en la UI muestra en su tooltip exactamente qué documentos faltan.

---

## Plan de Eliminación (orden crítico)

El orden importa para evitar errores de dependencia en Supabase.

> **Sobre datos históricos**: Las tablas `pasos_fuente_pago` y `documentos_pendientes` contienen estados computados (no datos ingresados por usuarios como nombres o montos). No tienen valor histórico que preservar — son snapshots de lógica que el nuevo sistema recalcula en tiempo real. Se pueden dropar sin backup.

### Paso 0 — Audit de referencias en TypeScript (antes de tocar BD)
Buscar toda referencia a tablas antiguas:
```bash
grep -r "pasos_fuente_pago\|documentos_pendientes\|carta_aprobacion_url\|validarPreDesembolso\|crearPasosFuentePago" src/
```
Mapear cada archivo encontrado y planificar su reemplazo antes de ejecutar drops en BD.

### Paso 1 — Fix inmediato del error 500 (BD)
Agregar guardia anti-recursión `IF pg_trigger_depth() > 1 THEN RETURN` a los tres triggers.
Esta guardia es **permanente y correcta** — prevenir recursión en triggers que hacen UPDATE en su propia tabla es buena práctica, no deuda técnica:
- `trigger_compactar_despues_update`
- `trigger_compactar_despues_insert`
- `trigger_compactar_despues_delete`

### Paso 2 — Drop del sistema antiguo (BD)
```sql
-- 1. Triggers primero (antes de las tablas que referencian)
DROP TRIGGER IF EXISTS trigger_crear_documento_pendiente ON fuentes_pago;
DROP TRIGGER IF EXISTS trigger_limpiar_pendientes_fuente ON fuentes_pago;
DROP FUNCTION IF EXISTS crear_documento_pendiente_automatico() CASCADE;
DROP FUNCTION IF EXISTS limpiar_pendientes_fuente() CASCADE;

-- 2. Función RPC antigua de validación
DROP FUNCTION IF EXISTS validar_requisitos_desembolso(UUID) CASCADE;

-- 3. Tablas (CASCADE elimina sus constraints y referencias automáticamente)
DROP TABLE IF EXISTS pasos_fuente_pago CASCADE;
DROP TABLE IF EXISTS documentos_pendientes CASCADE;

-- 4. Columna obsoleta en fuentes_pago
ALTER TABLE fuentes_pago DROP COLUMN IF EXISTS carta_aprobacion_url;
```

> **Rollback**: Si algún DROP falla, el `CASCADE` asegura que no quede en estado inconsistente. Las tablas se pueden recrear desde las migraciones originales en `supabase/migrations/` si fuera necesario.

### Paso 3 — Limpieza TypeScript
Eliminar archivos completos:
- `src/modules/fuentes-pago/services/pasos-fuente-pago.service.ts`
- `src/modules/fuentes-pago/hooks/usePasosFuentePago.ts`
- `src/app/clientes/[id]/tabs/actividad-tab.tsx` (solo si no tiene contenido útil)

Limpiar archivos (eliminar solo los métodos que usaban la tabla antigua):
- `src/modules/clientes/services/documentos-pendientes.service.ts` → eliminar métodos que hacen `.from('documentos_pendientes')`; conservar los que usan la vista

Reemplazar implementación interna:
- `useValidacionBotonDesembolso` → nueva implementación usando `vista_documentos_pendientes_fuentes`
- `abonos.service.ts` → reemplazar importación y llamada de `validarPreDesembolso`
- `negociaciones.service.ts` → eliminar importación de `crearPasosFuentePago`

### Paso 4 — Vínculo explícito en upload desde banner

El modal de upload recibe del pendiente (que viene de la vista) los siguientes datos:
- `tipo_documento` = `rfc.tipo_documento_sugerido` → **campo disabled en UI** (el admin no puede modificarlo)
- `fuente_pago_id` para docs **ESPECÍFICOS** (`alcance = ESPECIFICO_FUENTE`) → id de la fuente
- `fuente_pago_id = null` para docs **COMPARTIDOS** (`alcance = COMPARTIDO_CLIENTE`) → null explícito

El modal sabe el alcance porque el metadata del pendiente de la vista incluye `alcance`. No hay lógica de inferencia — viene directo del requisito configurado.

> **No hay constraint en BD** para el tipo_documento (solo el admin sube, y el campo viene deshabilitado). Esto es aceptable dado el modelo de acceso actual.

### Paso 5 — Regenerar tipos TypeScript
```bash
npm run types:generate
npm run type-check
```

---

## Edge Cases Cubiertos

### Cambio de configuración de requisitos en vuelo
La vista **siempre recalcula en tiempo real**. Esto cubre automáticamente:
- Si un requisito pasa de OBLIGATORIO → OPCIONAL: el botón se desbloquea de inmediato
- Si se agrega un requisito OBLIGATORIO nuevo: todos los clientes con esa fuente activa verán el nuevo pendiente en su banner
- Si se elimina un requisito: el pendiente desaparece de todos los banners
- Si cambia `tipo_documento_sugerido`: los documentos ya subidos con el tipo antiguo dejarán de satisfacer el requisito (el admin debe saberlo antes de cambiar)

### Documentos compartidos con múltiples fuentes activas
La vista usa `DISTINCT ON (cliente_id, requisito_config_id)` — por eso aparece como **máximo 1 pendiente por cliente** por requisito compartido, sin importar cuántas fuentes activas tenga el cliente. Al subirse el documento, desaparece para todas las fuentes.

### Fuente que se inactiva
El filtro `fp.estado = 'Activa'` en la vista excluye automáticamente las fuentes inactivas. Si la única fuente que requería un requisito compartido se inactiva, el pendiente desaparece.

### Cuota Inicial
No tiene ningún requisito configurado en `requisitos_fuentes_pago_config`. La vista no retorna ningún pendiente para esa fuente → botón siempre habilitado (correcto por regla de negocio).

### Concurrencia
Las lecturas de la vista son ACID-safe (PostgreSQL). No hay escrituras concurrentes en la lógica de validación — la vista solo lee, el upload es una transacción independiente.

---

## Qué NO cambia

- Módulo `requisitos-fuentes` (UI de configuración) → se conserva completo
- Vista `vista_documentos_pendientes_fuentes` → se conserva (fue recreada hoy con soporte `fuentes_aplicables`)
- Componente `ValidadorDocumentosObligatorios` → se conserva, solo cambia la función interna
- Banner `SeccionDocumentosPendientes` → se conserva, se mejora el paso de datos al modal

---

## Criterios de Éxito

- [ ] Error 500 en PATCH `requisitos_fuentes_pago_config` desaparece
- [ ] El banner muestra correctamente los documentos pendientes por cliente
- [ ] Al subir un documento desde el banner, el pendiente desaparece automáticamente
- [ ] Al eliminar un documento, el pendiente vuelve a aparecer automáticamente
- [ ] El botón de abono/desembolso se bloquea cuando hay docs obligatorios pendientes
- [ ] El botón muestra en tooltip exactamente qué documentos faltan
- [ ] Los documentos compartidos aparecen como UN solo pendiente por cliente
- [ ] No existe ninguna referencia a `pasos_fuente_pago` ni `documentos_pendientes` en el código TypeScript
- [ ] `npm run type-check` pasa sin errores
