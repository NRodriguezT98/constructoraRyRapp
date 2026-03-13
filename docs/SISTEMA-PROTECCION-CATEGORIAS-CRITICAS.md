# 🛡️ SISTEMA DE PROTECCIÓN DE CATEGORÍAS CRÍTICAS

## 🎯 Problema Resuelto

Las categorías de documentos son **críticas** para el sistema de requisitos de fuentes de pago. Si se eliminan accidentalmente, los documentos subidos no se pueden vincular correctamente a los requisitos.

## ✅ Soluciones Implementadas

### 1. **Categorías con UUIDs Fijos**
**Archivo**: `supabase/seeds/categorias-sistema-clientes-uuids-fijos.sql`

```sql
-- Las categorías críticas tienen UUIDs hardcoded
'4898e798-c188-4f02-bfcf-b2b15be48e34' → Cartas de aprobación y Documentos del Proceso
'b795b842-f035-42ce-9ab9-7fef2e1c5f24' → Documentos de Identidad
'a82ca714-b191-4976-a089-66c031ff1496' → Escrituras Públicas
'bd49740e-d46d-43c8-973f-196f1418765c' → Certificados de Tradición
'f84ec757-2f11-4245-a487-5091176feec5' → Gastos Notariales, Avalúos
'f50f53d6-c1d8-4c42-9993-fddc2f8f5ade' → Otros Documentos
```

**Características**:
- ✅ Usa `INSERT ... ON CONFLICT` (idempotente)
- ✅ Si ya existe, actualiza nombre/descripción
- ✅ Si no existe, la crea con el UUID correcto
- ✅ Marcadas como `es_sistema = true`

### 2. **Trigger de Validación Automática**
**Archivo**: `supabase/migrations/20251215_trigger_validar_categoria_pasos.sql`

**Función**: `validar_categoria_documento_paso()`

**Comportamiento**:
- Se ejecuta ANTES de INSERT/UPDATE en `pasos_fuente_pago`
- Si `categoria_documento_requerida` es un string (ej: "escrituras") → Lo convierte al UUID correcto
- Si es un UUID inválido → Registra WARNING y mapea a UUID conocido
- Si es un UUID válido → Verifica que existe en `categorias_documento`

**Mapeos automáticos**:
```sql
'escrituras'              → '4898e798-c188-4f02-bfcf-b2b15be48e34'
'documentos_identidad'    → 'b795b842-f035-42ce-9ab9-7fef2e1c5f24'
'certificados_tradicion'  → 'bd49740e-d46d-43c8-973f-196f1418765c'
'gastos_notariales'       → 'f84ec757-2f11-4245-a487-5091176feec5'
```

### 3. **Schema Flexible**
**Archivo**: `supabase/migrations/20251215_hacer_user_id_opcional_categorias.sql`

- `user_id` ahora es **nullable**
- Las categorías de sistema (`es_sistema = true`) no requieren `user_id`
- Las categorías de usuarios normales siguen funcionando igual

---

## 🚀 Uso

### Recuperar Categorías Eliminadas

Si accidentalmente se eliminan categorías críticas:

```bash
npm run db:exec supabase/seeds/categorias-sistema-clientes-uuids-fijos.sql
```

Este comando:
1. Recreará las categorías con los mismos UUIDs
2. No afectará categorías existentes
3. Actualizará nombres/descripciones si cambiaron

### Verificar Integridad

```sql
-- Ver categorías de sistema
SELECT id, nombre, es_sistema, modulos_permitidos
FROM categorias_documento
WHERE es_sistema = true
ORDER BY nombre;

-- Verificar que pasos usan UUIDs correctos
SELECT
  paso,
  categoria_documento_requerida,
  (SELECT nombre FROM categorias_documento
   WHERE id::text = categoria_documento_requerida) as categoria_nombre
FROM pasos_fuente_pago
WHERE categoria_documento_requerida IS NOT NULL
LIMIT 10;
```

---

## 🔧 Mantenimiento

### Agregar Nueva Categoría Crítica

1. **Editar**: `supabase/seeds/categorias-sistema-clientes-uuids-fijos.sql`
2. **Agregar** nuevo registro con UUID específico:
   ```sql
   (
     'nuevo-uuid-aqui'::uuid,
     'Nombre de Categoría',
     'Descripción detallada',
     'color',
     'icono',
     ARRAY['clientes'],
     true
   )
   ```

3. **Editar**: `supabase/migrations/20251215_trigger_validar_categoria_pasos.sql`
4. **Agregar** mapeo en el trigger:
   ```sql
   WHEN 'slug_categoria' THEN
     NEW.categoria_documento_requerida := 'nuevo-uuid-aqui';
   ```

5. **Editar**: `src/modules/documentos/types/tipos-documento.ts`
6. **Actualizar** `categoria_sugerida` en el tipo correspondiente

7. **Ejecutar** ambos archivos:
   ```bash
   npm run db:exec supabase/seeds/categorias-sistema-clientes-uuids-fijos.sql
   npm run db:exec supabase/migrations/20251215_trigger_validar_categoria_pasos.sql
   ```

---

## 🎨 Categorías Actuales en TypeScript

**Archivo**: `src/modules/documentos/types/tipos-documento.ts`

```typescript
boleta_registro: {
  categoria_sugerida: '4898e798-c188-4f02-bfcf-b2b15be48e34',
  // Cartas de aprobación, Promesas de Compraventa...
}

certificado_tradicion: {
  categoria_sugerida: 'bd49740e-d46d-43c8-973f-196f1418765c',
  // Certificados de Tradición
}
```

---

## 🚨 Importante

1. **NUNCA** cambiar los UUIDs de las categorías de sistema
2. **SIEMPRE** usar el seed file para recrear categorías
3. **VERIFICAR** que TypeScript y SQL usen los mismos UUIDs
4. El trigger se ejecuta **automáticamente** - no requiere intervención manual

---

## ✅ Checklist de Validación

Después de cualquier cambio en categorías:

- [ ] Ejecutar seed: `npm run db:exec supabase/seeds/categorias-sistema-clientes-uuids-fijos.sql`
- [ ] Verificar que existen en BD: `SELECT * FROM categorias_documento WHERE es_sistema = true`
- [ ] Probar subida de documento en modal de requisito
- [ ] Verificar que categoría viene pre-seleccionada y bloqueada
- [ ] Revisar logs de consola del navegador para errores

---

## 📊 Impacto

**Antes**:
- ❌ Categorías con UUIDs aleatorios
- ❌ Si se eliminan, no se pueden recrear idénticas
- ❌ Strings en lugar de UUIDs en `pasos_fuente_pago`
- ❌ Sincronización manual requerida

**Después**:
- ✅ UUIDs fijos y predecibles
- ✅ Recuperación automática con seed
- ✅ Trigger convierte strings → UUIDs automáticamente
- ✅ Auto-selección de categorías en UI
- ✅ Campo bloqueado cuando viene de requisito
