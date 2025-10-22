# 🚀 Ejecutar Migración: Sistema de Abonos

## 📋 Qué incluye esta migración

Esta migración crea la infraestructura completa para el sistema de historial de abonos:

### ✅ **Tabla `abonos_historial`**
- Registra cada abono individual
- Vinculada a `negociaciones` y `fuentes_pago`
- Incluye método de pago, referencia, comprobante
- Campos de auditoría completos

### ✅ **Triggers Automáticos**
1. **Actualizar `monto_recibido`**: Suma automática de abonos en `fuentes_pago`
2. **Validar saldo**: Impide abonos que excedan el monto aprobado
3. **Fecha de actualización**: Actualiza automáticamente `fecha_actualizacion`

### ✅ **Cascadas**
- Si se elimina una negociación → se eliminan sus abonos
- Si se elimina una fuente de pago → se eliminan sus abonos
- Los cálculos se actualizan automáticamente

---

## 🎯 Cómo ejecutar

### **Opción 1: Desde Supabase Dashboard** (RECOMENDADO)

1. Abre **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: **constructoraRyR**
3. Ve a **SQL Editor** en el menú izquierdo
4. Click en **New Query**
5. Copia y pega TODO el contenido de: `supabase/migrations/crear-tabla-abonos-historial.sql`
6. Click en **RUN** (o Ctrl+Enter)

### **Opción 2: Desde terminal con Supabase CLI**

```powershell
cd d:\constructoraRyRapp
supabase db push
```

---

## ✅ Verificación post-migración

Ejecuta estas queries para confirmar que todo está correcto:

### 1. **Verificar que la tabla existe**
```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'abonos_historial'
AND table_schema = 'public';
```

**Resultado esperado:** 1 fila (la tabla existe)

### 2. **Verificar columnas**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'abonos_historial'
ORDER BY ordinal_position;
```

**Resultado esperado:** 12 columnas (id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, comprobante_url, notas, fecha_creacion, fecha_actualizacion, usuario_registro)

### 3. **Verificar triggers**
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'abonos_historial';
```

**Resultado esperado:** 3 triggers
- `trigger_update_abonos_historial_fecha_actualizacion` (UPDATE)
- `trigger_actualizar_monto_recibido` (INSERT, UPDATE, DELETE)
- `trigger_validar_abono_no_excede_saldo` (INSERT, UPDATE)

### 4. **Verificar índices**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'abonos_historial';
```

**Resultado esperado:** 5 índices (PRIMARY KEY + 4 índices creados)

---

## 🧪 Prueba rápida

Después de ejecutar la migración, prueba con datos de ejemplo:

```sql
-- 1. Obtener IDs reales de tu sistema
SELECT
  n.id as negociacion_id,
  fp.id as fuente_pago_id,
  fp.tipo,
  fp.monto_aprobado,
  fp.monto_recibido,
  fp.saldo_pendiente
FROM negociaciones n
JOIN fuentes_pago fp ON fp.negociacion_id = n.id
WHERE n.estado IN ('Cierre Financiero', 'Activa')
LIMIT 1;

-- 2. Registrar un abono de prueba (usa los IDs del paso 1)
INSERT INTO abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago,
  numero_referencia,
  notas
) VALUES (
  '[pega-negociacion-id-aqui]',
  '[pega-fuente-pago-id-aqui]',
  1000000, -- $1.000.000 de prueba
  NOW(),
  'Transferencia',
  'TEST-001',
  'Abono de prueba'
);

-- 3. Verificar que se actualizó automáticamente
SELECT
  id,
  tipo,
  monto_aprobado,
  monto_recibido, -- ⬅️ Debe haberse actualizado automáticamente
  saldo_pendiente, -- ⬅️ Debe haberse recalculado
  porcentaje_completado -- ⬅️ Debe haberse recalculado
FROM fuentes_pago
WHERE id = '[pega-fuente-pago-id-aqui]';

-- 4. Ver el abono registrado
SELECT * FROM abonos_historial
WHERE notas = 'Abono de prueba';

-- 5. Limpiar datos de prueba (opcional)
DELETE FROM abonos_historial WHERE notas = 'Abono de prueba';
-- El monto_recibido se actualiza automáticamente al eliminar
```

---

## ⚠️ Validaciones automáticas

El sistema incluye validación de negocio:

### ❌ **Esto fallará** (correcto):
```sql
-- Intentar abonar más del saldo pendiente
INSERT INTO abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago
) VALUES (
  '[id]',
  '[id]',
  999999999, -- Monto excesivo
  NOW(),
  'Efectivo'
);
```

**Error esperado:**
```
El abono de $ 999999999 excede el saldo pendiente.
Monto aprobado: $ X, Ya abonado: $ Y, Saldo disponible: $ Z
```

### ✅ **Esto funcionará**:
```sql
-- Abonar dentro del saldo pendiente
INSERT INTO abonos_historial (
  negociacion_id,
  fuente_pago_id,
  monto,
  fecha_abono,
  metodo_pago
) VALUES (
  '[id]',
  '[id]',
  5000000, -- Dentro del saldo
  NOW(),
  'Transferencia'
);
```

---

## 📊 Queries útiles

### Ver todos los abonos de una negociación
```sql
SELECT
  ah.fecha_abono,
  ah.monto,
  ah.metodo_pago,
  ah.numero_referencia,
  fp.tipo as fuente_tipo,
  ah.notas
FROM abonos_historial ah
JOIN fuentes_pago fp ON ah.fuente_pago_id = fp.id
WHERE ah.negociacion_id = '[negociacion-id]'
ORDER BY ah.fecha_abono DESC;
```

### Resumen de abonos por cliente
```sql
SELECT
  c.nombre_completo,
  COUNT(ah.id) as cantidad_abonos,
  SUM(ah.monto) as total_abonado,
  n.valor_total,
  n.saldo_pendiente
FROM negociaciones n
JOIN clientes c ON n.cliente_id = c.id
LEFT JOIN fuentes_pago fp ON fp.negociacion_id = n.id
LEFT JOIN abonos_historial ah ON ah.fuente_pago_id = fp.id
WHERE n.estado IN ('Cierre Financiero', 'Activa')
GROUP BY c.nombre_completo, n.valor_total, n.saldo_pendiente
ORDER BY total_abonado DESC;
```

---

## 🔐 Seguridad (Row Level Security)

**IMPORTANTE**: Después de ejecutar la migración, configura RLS:

```sql
-- Habilitar RLS
ALTER TABLE public.abonos_historial ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden ver abonos
CREATE POLICY "Usuarios autenticados pueden ver abonos"
ON public.abonos_historial
FOR SELECT
TO authenticated
USING (true);

-- Política: Solo usuarios autenticados pueden crear abonos
CREATE POLICY "Usuarios autenticados pueden crear abonos"
ON public.abonos_historial
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Solo el usuario que creó puede actualizar
CREATE POLICY "Usuario puede actualizar sus abonos"
ON public.abonos_historial
FOR UPDATE
TO authenticated
USING (usuario_registro = auth.uid())
WITH CHECK (usuario_registro = auth.uid());
```

---

## 🎯 Siguiente paso

Una vez ejecutada la migración y verificado que funciona:

✅ **Siguiente**: Crear tipos TypeScript en `src/modules/abonos/types/index.ts`

¿Todo listo? Ejecuta la migración y confirma que funcionó. 🚀
