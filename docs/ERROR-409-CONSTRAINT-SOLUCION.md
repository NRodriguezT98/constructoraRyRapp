# 🔧 Error 409 Conflict - Solución Constraint UNIQUE

## ❌ Error Encontrado

```
POST .../configuracion_recargos 409 (Conflict)
duplicate key value violates unique constraint "configuracion_recargos_tipo_key"
```

### Causa del problema:

La tabla `configuracion_recargos` tiene un **constraint UNIQUE** en el campo `tipo`, lo que impide crear dos recargos con el mismo tipo.

```sql
-- ❌ PROBLEMA: Campo 'tipo' es UNIQUE
CREATE TABLE configuracion_recargos (
    id UUID PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE,  -- ← ESTO CAUSA EL ERROR
    nombre VARCHAR(100) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL,
    ...
);
```

**Resultado**: Solo puedes tener 1 recargo de cada tipo activo.

---

## ✅ Solución: Eliminar constraint UNIQUE

Ejecuta la migración SQL para permitir múltiples recargos del mismo tipo:

### 📁 Archivo: `supabase/migrations/2025-11-05_permitir_multiples_recargos.sql`

```sql
-- Eliminar constraint UNIQUE del campo 'tipo'
ALTER TABLE configuracion_recargos
DROP CONSTRAINT IF EXISTS configuracion_recargos_tipo_key;
```

---

## 🚀 Cómo aplicar la solución

### Opción A - Supabase Dashboard (Recomendado)

1. Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql
2. Copia el contenido de: `supabase/migrations/2025-11-05_permitir_multiples_recargos.sql`
3. Pega en el SQL Editor
4. Clic en **Run** (o Ctrl+Enter)
5. Verifica que aparezca "Success"

### Opción B - Solo el ALTER TABLE (Rápido)

Si quieres solo remover el constraint sin actualizar datos:

```sql
ALTER TABLE configuracion_recargos
DROP CONSTRAINT IF EXISTS configuracion_recargos_tipo_key;
```

---

## ✅ Verificación

Después de ejecutar, confirma que el constraint se eliminó:

```sql
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'configuracion_recargos'::regclass
  AND contype = 'u'
ORDER BY conname;
```

**Resultado esperado**: Vacío o solo otros constraints (no `configuracion_recargos_tipo_key`)

---

## 🎯 Resultado: Ahora puedes crear múltiples recargos

### Antes (❌ Con UNIQUE):

```
❌ No puedes crear:
- recargo_esquinera_5m  → Recargo Simple    (5M)
- recargo_esquinera_5m  → Recargo Alternativo (5.5M) ← ERROR 409
```

### Después (✅ Sin UNIQUE):

```
✅ Puedes crear todos los que necesites:
- recargo_esquinera_5m  → Recargo Simple       (5M)
- recargo_esquinera_5m  → Recargo Alternativo  (5.5M) ✓
- recargo_esquinera_10m → Recargo Doble        (10M)
- recargo_esquinera_10m → Recargo Doble Plus   (11M) ✓
- recargo_esquinera_12m → Recargo Triple       (12M)
```

Cada recargo se identifica por su **ID único** (PK), no por el tipo.

---

## 📋 Próximos pasos

1. ✅ Ejecutar migración SQL
2. ✅ Refrescar página del módulo de Recargos
3. ✅ Crear múltiples recargos de esquinera
4. ✅ Probar en el wizard de nueva vivienda

---

## 💡 ¿Por qué el campo 'tipo' ya no es UNIQUE?

**Antes**:
- `tipo` era una clave única → Solo 1 recargo por tipo
- Diseño rígido, no permitía variaciones

**Ahora**:
- `tipo` es solo una **categoría** → Múltiples recargos por tipo
- Cada recargo tiene ID único
- Más flexibilidad para configurar diferentes valores

**Ejemplo de uso**:

```sql
-- Todos válidos y activos:
INSERT INTO configuracion_recargos (tipo, nombre, valor, activo) VALUES
  ('recargo_esquinera_5m', 'Recargo Esquinera Estándar', 5000000, true),
  ('recargo_esquinera_5m', 'Recargo Esquinera Promoción', 4500000, true),
  ('recargo_esquinera_10m', 'Recargo Esquinera Premium', 10000000, true),
  ('recargo_esquinera_10m', 'Recargo Esquinera VIP', 12000000, true);
```

El usuario selecciona en el wizard cuál aplicar según la vivienda.

---

## ❓ FAQ

**P: ¿Esto afecta los datos existentes?**
R: No, solo permite crear nuevos registros duplicados en 'tipo'.

**P: ¿Necesito recrear los recargos existentes?**
R: No, los existentes siguen funcionando.

**P: ¿Puedo revertir este cambio?**
R: Sí, pero primero deberías eliminar duplicados:
```sql
ALTER TABLE configuracion_recargos
ADD CONSTRAINT configuracion_recargos_tipo_key UNIQUE (tipo);
```

**P: ¿Hay riesgo de perder datos?**
R: No, solo modificamos el constraint, no la tabla ni los datos.
