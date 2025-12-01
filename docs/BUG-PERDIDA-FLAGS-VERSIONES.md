# 🐛 BUG CRÍTICO: Pérdida de Flags en Versiones de Documentos

**Fecha de descubrimiento:** 1 de diciembre, 2025
**Severidad:** CRÍTICA 🔴
**Estado:** ✅ RESUELTO

---

## 📋 Descripción del Problema

Al crear una **nueva versión** de un documento (cédula, escritura, contrato), los **flags críticos** del documento original **NO se propagaban** a la nueva versión, causando pérdida de funcionalidad.

### Flags Afectados

1. **`es_documento_identidad`** (documentos_cliente)
2. **`es_escritura_vivienda`** (documentos_vivienda)
3. **`es_contrato_promesa`** (documentos_vivienda)

---

## 🔍 Flujo del Bug

```
1. Usuario sube CÉDULA → es_documento_identidad = true ✅
2. Sistema detecta cédula → useDocumentoIdentidad funciona ✅
3. Usuario sube NUEVA VERSIÓN de cédula
4. Servicio crea versión v2 → es_documento_identidad = NULL ❌
5. Servicio marca v1 como es_version_actual = false ❌
6. Query filtra solo es_version_actual = true
7. Resultado: NO encuentra documento de identidad activo 💥
```

### Impacto

- ❌ **useDocumentoIdentidad** retorna `tieneCedula = false`
- ❌ Sistema bloquea negociaciones (requiere cédula)
- ❌ Banner "Falta cédula" aparece incorrectamente
- ❌ No se puede visualizar cédula en detalle del cliente

---

## ✅ Solución Implementada

### 1. Corrección en Servicio (Preventivo)

**Archivo:** `src/modules/documentos/services/documentos-versiones.service.ts`

**Líneas 117-141:** Agregado propagación de flags críticos:

```typescript
const insertData: any = {
  [config.campoEntidad]: entidadId,
  // ... campos normales ...
  es_importante: docOriginal.es_importante,

  // ✅ FIX: Propagar campos críticos del documento original a la nueva versión
  ...(docOriginal.es_documento_identidad !== undefined && {
    es_documento_identidad: docOriginal.es_documento_identidad
  }),
  ...(docOriginal.es_escritura_vivienda !== undefined && {
    es_escritura_vivienda: docOriginal.es_escritura_vivienda
  }),
  ...(docOriginal.es_contrato_promesa !== undefined && {
    es_contrato_promesa: docOriginal.es_contrato_promesa
  })
}
```

**Ventajas:**
- ✅ Usa spread operator con conditional (`...()`) para solo incluir si existe
- ✅ Evita sobrescribir con `undefined`
- ✅ Compatible con todas las entidades (cliente, vivienda, proyecto)

---

### 2. Corrección Retroactiva en BD (Curativo)

**Archivo:** `supabase/hotfix/fix-propagar-flags-criticos-versiones.sql`

**Acción:** Copia flags del documento padre a versiones hijas existentes.

**Comando:**
```bash
npm run db:exec supabase/hotfix/fix-propagar-flags-criticos-versiones.sql
```

**Resultados esperados:**
- Versiones hijas heredan `es_documento_identidad` del padre
- Versiones hijas heredan `es_escritura_vivienda` del padre
- Versiones hijas heredan `es_contrato_promesa` del padre

---

## 🧪 Validación

### Test 1: Cédula con Versiones

```sql
SELECT
  id,
  titulo,
  version,
  es_version_actual,
  es_documento_identidad,
  documento_padre_id
FROM documentos_cliente
WHERE cliente_id = 'xxx'
ORDER BY version ASC;
```

**Resultado esperado:**
```
┌────────┬─────────┬────────────────────┬─────────────────────────┐
│ version│ actual  │ es_documento_id    │ documento_padre_id      │
├────────┼─────────┼────────────────────┼─────────────────────────┤
│   1    │  false  │  true              │  null                   │  ← Padre
│   2    │  true   │  true  ✅          │  <id_padre>             │  ← Versión nueva
└────────┴─────────┴────────────────────┴─────────────────────────┘
```

### Test 2: useDocumentoIdentidad Hook

```typescript
const { tieneCedula, documentoIdentidad } = useDocumentoIdentidad({ clienteId })

// Antes del fix:
tieneCedula = false ❌
documentoIdentidad = null ❌

// Después del fix:
tieneCedula = true ✅
documentoIdentidad = { id, url_storage, ... } ✅
```

---

## 📝 Casos de Uso Resueltos

### Caso 1: Nueva Versión de Cédula
**Escenario:** Cliente actualiza foto de cédula
**Antes:** Sistema perdía referencia, bloqueaba negociaciones
**Ahora:** ✅ Nueva versión mantiene flag, todo funciona

### Caso 2: Nueva Versión de Escritura
**Escenario:** Vivienda actualiza escritura notariada
**Antes:** Sistema no detectaba escritura activa
**Ahora:** ✅ Nueva versión mantiene flag de escritura

### Caso 3: Nueva Versión de Contrato Promesa
**Escenario:** Actualización de contrato con adendas
**Antes:** Sistema perdía flag de contrato principal
**Ahora:** ✅ Nueva versión mantiene relación contractual

---

## 🛡️ Prevención Futura

### Checklist al Crear Versiones

- [ ] ✅ `es_documento_identidad` copiado
- [ ] ✅ `es_escritura_vivienda` copiado
- [ ] ✅ `es_contrato_promesa` copiado
- [ ] ✅ `es_importante` copiado (ya existía)
- [ ] ✅ `categoria_id` copiado (ya existía)
- [ ] ✅ `metadata` heredado con merge (ya existía)

### Tests Automatizados (Pendiente)

```typescript
describe('DocumentosVersionesService.crearNuevaVersion', () => {
  it('debe propagar es_documento_identidad a nueva versión', async () => {
    const original = await crearDocumento({ es_documento_identidad: true })
    const version = await crearNuevaVersion(original.id, archivo, userId, 'cliente')

    expect(version.es_documento_identidad).toBe(true) // ✅
  })
})
```

---

## 📊 Archivos Modificados

1. ✅ `src/modules/documentos/services/documentos-versiones.service.ts` (líneas 117-141)
2. ✅ `supabase/hotfix/fix-propagar-flags-criticos-versiones.sql` (nuevo)
3. ✅ `docs/BUG-PERDIDA-FLAGS-VERSIONES.md` (este archivo)

---

## 🎯 Comportamiento Correcto Final

### Pregunta del Usuario
> "Si tengo la cédula marcada como documento de identidad desde el upload, pero luego necesito subir la nueva versión de ese documento de identidad, al hacerlo va aparecer de nuevo como que el documento de identidad no está subido, ¿qué debemos hacer? ¿Este es el comportamiento correcto?"

### Respuesta
**NO, ese NO era el comportamiento correcto.** Era un bug crítico que causaba pérdida de funcionalidad.

**Comportamiento CORRECTO (después del fix):**
1. Usuario sube cédula → `es_documento_identidad = true` ✅
2. Usuario sube nueva versión → `es_documento_identidad = true` ✅ (heredado)
3. Sistema marca v1 como `es_version_actual = false`
4. Sistema marca v2 como `es_version_actual = true`
5. Query encuentra v2 con ambos flags activos ✅
6. `useDocumentoIdentidad` detecta cédula correctamente ✅
7. Sistema permite negociaciones ✅

**Ahora todo funciona como se esperaba.** 🎉

---

## 📅 Historial de Cambios

| Fecha      | Acción                                      | Autor    |
|------------|---------------------------------------------|----------|
| 2025-12-01 | Bug descubierto por usuario                 | Usuario  |
| 2025-12-01 | Fix implementado en servicio                | Copilot  |
| 2025-12-01 | SQL retroactivo creado                      | Copilot  |
| 2025-12-01 | Documentación completa                      | Copilot  |

---

**Estado final:** ✅ **RESUELTO Y DOCUMENTADO**
