# 🔄 Sistema de Sincronización de Schema de Base de Datos

## 🎯 Objetivo

Mantener sincronizados automáticamente los tipos TypeScript con el schema real de Supabase, eliminando errores de referencia a tablas, columnas o tipos.

---

## ❌ Problema Identificado

### **Estado actual (INCORRECTO):**
```bash
npm run db:types  # ❌ Usa lista hardcodeada en scripts/generar-types-flexible.js
```

**Problemas:**
- ✗ Lista manual `KNOWN_TABLES` que se desactualiza
- ✗ Nombres de tablas pueden estar mal escritos (`documentos` vs `documentos_proyecto`)
- ✗ No detecta nuevas columnas automáticamente
- ✗ No detecta nuevas tablas/vistas/funciones
- ✗ Requiere actualización manual del script cada vez

---

## ✅ Solución Oficial (CORRECTO)

### **Usar el CLI oficial de Supabase:**

```bash
npm run db:types:supabase
```

O directamente:

```bash
npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad --schema public > src/lib/supabase/database.types.ts
```

**Ventajas:**
- ✅ Consulta directamente el schema de PostgreSQL
- ✅ Genera tipos exactos con autocomplete completo
- ✅ Detecta automáticamente todas las tablas, columnas, vistas, funciones
- ✅ Mantiene tipos en sync con la BD real
- ✅ No requiere mantenimiento manual

---

## 🛠️ Scripts Recomendados

### **1. Actualizar tipos TypeScript (RECOMENDADO):**

```bash
npm run types:generate
```

Este comando:
1. Conecta a Supabase
2. Lee el schema completo
3. Genera tipos TypeScript actualizados
4. Guarda en `src/lib/supabase/database.types.ts`

### **2. Actualizar documentación de schema:**

```bash
npm run docs:db
```

Este comando:
1. Extrae información de todas las tablas
2. Genera documentación markdown actualizada
3. Guarda en `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

### **3. Sincronización completa (TODO EN UNO):**

```bash
npm run db:sync
```

Este comando ejecuta:
1. `types:generate` → Actualiza tipos TypeScript
2. `docs:db` → Actualiza documentación
3. `type-check` → Valida que no haya errores

---

## 📋 Workflow Recomendado

### **Cuándo ejecutar sincronización:**

1. **Después de crear una tabla nueva:**
   ```bash
   npm run db:exec supabase/migrations/nueva-tabla.sql
   npm run db:sync  # ← Sincronizar tipos
   ```

2. **Después de agregar/modificar columnas:**
   ```bash
   npm run db:exec supabase/migrations/alter-table.sql
   npm run db:sync  # ← Sincronizar tipos
   ```

3. **Antes de hacer commit (pre-commit hook):**
   ```bash
   npm run types:generate
   git add src/lib/supabase/database.types.ts
   ```

4. **Al hacer pull de cambios del equipo:**
   ```bash
   git pull
   npm run db:sync  # ← Actualizar con cambios remotos
   ```

---

## 🔧 Configuración de Scripts (package.json)

```json
{
  "scripts": {
    "types:generate": "npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad --schema public > src/lib/supabase/database.types.ts",
    "docs:db": "node scripts/generar-docs-db.js",
    "db:sync": "npm run types:generate && npm run docs:db && npm run type-check",
    "db:verify": "node scripts/verificar-schema.js"
  }
}
```

---

## 🚨 Reglas Críticas

### **NUNCA HACER:**
❌ Editar manualmente `database.types.ts`
❌ Usar `any` en lugar de regenerar tipos
❌ Hardcodear nombres de tablas/columnas sin verificar schema
❌ Asumir nombres de campos sin consultar `DATABASE-SCHEMA-REFERENCE.md`

### **SIEMPRE HACER:**
✅ Ejecutar `npm run types:generate` después de cambios en BD
✅ Consultar `DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` antes de código
✅ Usar autocomplete de TypeScript para nombres de campos
✅ Ejecutar `npm run type-check` antes de commit

---

## 📊 Script de Verificación Automática

**Archivo:** `scripts/verificar-schema.js`

```javascript
// Verifica que los tipos estén sincronizados con la BD
// Ejecutar: npm run db:verify

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verificando sincronización de tipos con BD...\n');

// 1. Generar tipos temporales
execSync('npx supabase gen types typescript --project-id swyjhwgvkfcfdtemkyad --schema public > /tmp/db-types-temp.ts');

// 2. Comparar con tipos actuales
const currentTypes = fs.readFileSync('src/lib/supabase/database.types.ts', 'utf8');
const newTypes = fs.readFileSync('/tmp/db-types-temp.ts', 'utf8');

if (currentTypes === newTypes) {
  console.log('✅ Tipos están sincronizados con la BD\n');
  process.exit(0);
} else {
  console.log('❌ TIPOS DESACTUALIZADOS\n');
  console.log('Ejecuta: npm run types:generate\n');
  process.exit(1);
}
```

---

## 🎯 Ejemplo de Uso Correcto

### **Antes de codear:**

```typescript
// ❌ MAL: Asumir nombre de campo
const { data } = await supabase
  .from('documentos_proyecto')
  .update({ fecha_emision: '2025-01-01' })  // ← Campo no existe!

// ✅ BIEN: Usar autocomplete de TypeScript
const { data } = await supabase
  .from('documentos_proyecto')
  .update({ fecha_documento: '2025-01-01' })  // ← TypeScript sugiere campos reales
```

### **Después de migración:**

```bash
# 1. Ejecutar migración
npm run db:exec supabase/migrations/021_tabla_reemplazos.sql

# 2. Sincronizar tipos (CRÍTICO)
npm run types:generate

# 3. Verificar en código
# TypeScript ahora conoce la tabla documento_reemplazos_admin
```

---

## 📚 Documentación Relacionada

- `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` → Schema completo de BD
- `docs/DESARROLLO-CHECKLIST.md` → Checklist antes de codear
- `supabase/migrations/` → Historial de cambios en BD

---

## 🎓 Buenas Prácticas

1. **Nunca hardcodear nombres:** Siempre usar tipos TypeScript
2. **Regenerar tipos frecuentemente:** Especialmente después de migraciones
3. **Automatizar verificación:** Agregar `db:verify` a pre-commit hooks
4. **Documentar cambios:** Actualizar `DATABASE-SCHEMA-REFERENCE.md`
5. **Revisar errores TypeScript:** Indican desincronización con BD

---

**Última actualización:** 2025-11-10
**Responsable:** Sistema de sincronización automática
