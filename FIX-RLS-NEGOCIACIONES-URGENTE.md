# 🔧 FIX URGENTE: Error RLS en Negociaciones

**Error**: `new row violates row-level security policy for table "negociaciones"`

---

## 🎯 Solución Rápida

### Paso 1: Aplicar Políticas RLS

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:

```sql
-- 1. Habilitar RLS
ALTER TABLE negociaciones ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas viejas (por si acaso)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar negociaciones" ON negociaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar negociaciones" ON negociaciones;

-- 3. Crear políticas PERMISIVAS
CREATE POLICY "Usuarios autenticados pueden ver negociaciones"
  ON negociaciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear negociaciones"
  ON negociaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar negociaciones"
  ON negociaciones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar negociaciones"
  ON negociaciones
  FOR DELETE
  TO authenticated
  USING (true);
```

### Paso 2: Verificar que funcionó

```sql
-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'negociaciones'
ORDER BY policyname;

-- Deberías ver 4 políticas:
-- ✅ Usuarios autenticados pueden ver negociaciones
-- ✅ Usuarios autenticados pueden crear negociaciones
-- ✅ Usuarios autenticados pueden actualizar negociaciones
-- ✅ Usuarios autenticados pueden eliminar negociaciones
```

---

## 🔍 ¿Por qué pasa esto?

Row Level Security (RLS) está habilitado pero las políticas no están aplicadas correctamente.

### RLS = Firewall de Base de Datos
- ✅ Cuando está habilitado, **BLOQUEA TODO** por defecto
- ✅ Solo permite lo que las políticas **EXPLÍCITAMENTE** permiten
- ❌ Sin políticas = Sin acceso (incluso para authenticated)

---

## 📋 Checklist Post-Fix

Después de aplicar el SQL, verifica:

1. [ ] SQL se ejecutó sin errores
2. [ ] `SELECT FROM pg_policies` muestra 4 políticas
3. [ ] Recargar la página del formulario
4. [ ] Intentar registrar interés nuevamente
5. [ ] Verificar que NO aparece error 401
6. [ ] Verificar que se crea la negociación

---

## 🧪 Test Rápido

En el SQL Editor, ejecuta:

```sql
-- Intentar insertar una negociación de prueba
INSERT INTO negociaciones (cliente_id, vivienda_id, valor_negociado, estado)
VALUES (
  (SELECT id FROM clientes LIMIT 1),
  (SELECT id FROM viviendas LIMIT 1),
  100000000,
  'En Proceso'
)
RETURNING *;
```

Si funciona = RLS está bien configurado ✅
Si falla = Revisar políticas nuevamente ❌

---

## 💡 Archivo SQL Listo

También está disponible en:
```
supabase/fix-rls-negociaciones.sql
```

---

## ⚠️ IMPORTANTE

Asegúrate de estar **autenticado** en Supabase antes de ejecutar el SQL. Las políticas aplican para el rol `authenticated`, no `anon`.

---

## 🚀 Después del Fix

Una vez aplicado:
1. ✅ Podrás registrar intereses
2. ✅ Se guardarán en la BD
3. ✅ El modal se cerrará correctamente
4. ✅ La lista se actualizará

**¡Ya puedes usar el formulario!** 🎉
