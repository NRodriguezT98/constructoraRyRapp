# 🧹 Limpieza de Base de Datos - Elementos Obsoletos

> **Fecha**: 2025-10-22
> **Objetivo**: Eliminar tablas y columnas obsoletas de la arquitectura antigua

---

## 📊 Resumen del Análisis

### ✅ Estado Actual
- **Total de tablas**: 17
- **Tablas obsoletas**: 1 (abonos)
- **Columnas obsoletas**: 6 columnas en 2 tablas
- **Impacto**: Bajo riesgo (columnas marcadas como NULL)

---

## 🗑️ Elementos a Eliminar

### 1️⃣ **TABLA COMPLETA: `abonos`** (ALTA PRIORIDAD)

**Estado**: ❌ **OBSOLETA - Reemplazada por `abonos_historial`**

**Razón**:
- La tabla antigua `abonos` tiene FKs a `vivienda_id` y `cliente_id`
- La nueva tabla `abonos_historial` usa `negociacion_id` y `fuente_pago_id`
- La nueva arquitectura es más robusta y flexible

**Estructura antigua**:
```sql
CREATE TABLE abonos (
  id UUID PRIMARY KEY,
  vivienda_id UUID NOT NULL,  -- ❌ FK antigua
  cliente_id UUID NOT NULL,   -- ❌ FK antigua
  monto NUMERIC NOT NULL,
  fecha_abono TIMESTAMP NOT NULL,
  metodo_pago VARCHAR(100),
  comprobante TEXT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

**Estructura nueva (abonos_historial)**:
```sql
CREATE TABLE abonos_historial (
  id UUID PRIMARY KEY,
  negociacion_id UUID NOT NULL,      -- ✅ FK nueva
  fuente_pago_id UUID NOT NULL,      -- ✅ FK nueva
  monto NUMERIC NOT NULL,
  fecha_abono TIMESTAMP NOT NULL,
  metodo_pago VARCHAR(50),
  numero_referencia VARCHAR(100),
  comprobante_url TEXT,
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  usuario_registro UUID
);
```

**Verificación antes de eliminar**:
```sql
-- ✅ Verificar que NO haya datos en la tabla antigua
SELECT COUNT(*) FROM abonos;
-- Resultado esperado: 0

-- ✅ Verificar que la nueva tabla esté funcionando
SELECT COUNT(*) FROM abonos_historial;
```

---

### 2️⃣ **COLUMNAS OBSOLETAS en `negociaciones`**

| Columna | Estado | Razón | Acción |
|---------|--------|-------|--------|
| `fecha_cierre_financiero` | ⚠️ OBSOLETA | Ya no se usa este concepto | **ELIMINAR** |
| `fecha_activacion` | ⚠️ OBSOLETA | Se usa `fecha_negociacion` | **ELIMINAR** |
| `fecha_cancelacion` | ⚠️ OBSOLETA | Reemplazada por `fecha_renuncia_efectiva` | **ELIMINAR** |
| `motivo_cancelacion` | ⚠️ OBSOLETA | Se usa el campo `notas` | **ELIMINAR** |

**Verificación antes de eliminar**:
```sql
-- ✅ Verificar que todas estén en NULL
SELECT
  COUNT(*) as total_registros,
  COUNT(fecha_cierre_financiero) as con_cierre_financiero,
  COUNT(fecha_activacion) as con_activacion,
  COUNT(fecha_cancelacion) as con_cancelacion,
  COUNT(motivo_cancelacion) as con_motivo
FROM negociaciones;

-- Resultado esperado: todos los COUNT() deben ser 0 excepto total_registros
```

---

### 3️⃣ **COLUMNAS OBSOLETAS en `viviendas`**

| Columna | Estado | Razón | Acción |
|---------|--------|-------|--------|
| `precio` | ⚠️ OBSOLETA | Reemplazada por `valor_base` | **ELIMINAR** |
| `fecha_pago_completo` | ⚠️ OBSOLETA | Ya no se usa este concepto | **ELIMINAR** |

**Verificación antes de eliminar**:
```sql
-- ✅ Verificar que NO se esté usando 'precio'
SELECT
  COUNT(*) as total_viviendas,
  COUNT(CASE WHEN precio != valor_base THEN 1 END) as con_precio_diferente,
  COUNT(fecha_pago_completo) as con_fecha_pago
FROM viviendas;

-- Resultado esperado: con_precio_diferente = 0, con_fecha_pago = 0
```

---

## 🔧 Scripts de Limpieza

### ⚠️ **IMPORTANTE: Ejecutar en este orden**

### **Paso 1: Backup (OBLIGATORIO)**

```sql
-- 🔴 CRÍTICO: Hacer backup ANTES de cualquier cambio
-- En Supabase Dashboard: Settings → Backups → Create Backup
```

### **Paso 2: Verificación Pre-Eliminación**

```sql
-- Script completo de verificación
DO $$
DECLARE
  v_abonos_count INT;
  v_negociaciones_obsoletos INT;
  v_viviendas_obsoletos INT;
BEGIN
  -- Verificar tabla abonos
  SELECT COUNT(*) INTO v_abonos_count FROM abonos;
  RAISE NOTICE '✅ Tabla abonos: % registros', v_abonos_count;

  -- Verificar columnas obsoletas en negociaciones
  SELECT COUNT(*) INTO v_negociaciones_obsoletos
  FROM negociaciones
  WHERE fecha_cierre_financiero IS NOT NULL
     OR fecha_activacion IS NOT NULL
     OR fecha_cancelacion IS NOT NULL
     OR motivo_cancelacion IS NOT NULL;
  RAISE NOTICE '✅ Negociaciones con datos obsoletos: %', v_negociaciones_obsoletos;

  -- Verificar columnas obsoletas en viviendas
  SELECT COUNT(*) INTO v_viviendas_obsoletos
  FROM viviendas
  WHERE fecha_pago_completo IS NOT NULL;
  RAISE NOTICE '✅ Viviendas con fecha_pago_completo: %', v_viviendas_obsoletos;

  -- Verificar que precio = valor_base
  SELECT COUNT(*) INTO v_viviendas_obsoletos
  FROM viviendas
  WHERE precio IS NOT NULL AND precio != valor_base;
  RAISE NOTICE '✅ Viviendas con precio diferente a valor_base: %', v_viviendas_obsoletos;

  -- Resultado final
  IF v_abonos_count = 0 AND v_negociaciones_obsoletos = 0 AND v_viviendas_obsoletos = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅✅✅ SEGURO PARA ELIMINAR ✅✅✅';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '❌❌❌ NO ELIMINAR - HAY DATOS EN USO ❌❌❌';
  END IF;
END $$;
```

### **Paso 3: Eliminación de Tabla `abonos`**

```sql
-- 🗑️ ELIMINAR TABLA abonos (si verificación = OK)
DROP TABLE IF EXISTS abonos CASCADE;

-- ✅ Verificar que se eliminó
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'abonos';
-- Resultado esperado: 0 rows
```

### **Paso 4: Eliminación de Columnas en `negociaciones`**

```sql
-- 🗑️ ELIMINAR COLUMNAS OBSOLETAS de negociaciones
ALTER TABLE negociaciones
  DROP COLUMN IF EXISTS fecha_cierre_financiero CASCADE,
  DROP COLUMN IF EXISTS fecha_activacion CASCADE,
  DROP COLUMN IF EXISTS fecha_cancelacion CASCADE,
  DROP COLUMN IF EXISTS motivo_cancelacion CASCADE;

-- ✅ Verificar que se eliminaron
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'negociaciones'
  AND column_name IN (
    'fecha_cierre_financiero',
    'fecha_activacion',
    'fecha_cancelacion',
    'motivo_cancelacion'
  );
-- Resultado esperado: 0 rows
```

### **Paso 5: Eliminación de Columnas en `viviendas`**

```sql
-- 🗑️ ELIMINAR COLUMNAS OBSOLETAS de viviendas
ALTER TABLE viviendas
  DROP COLUMN IF EXISTS precio CASCADE,
  DROP COLUMN IF EXISTS fecha_pago_completo CASCADE;

-- ✅ Verificar que se eliminaron
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'viviendas'
  AND column_name IN ('precio', 'fecha_pago_completo');
-- Resultado esperado: 0 rows
```

### **Paso 6: Verificación Post-Eliminación**

```sql
-- ✅ Verificar estructura final
SELECT
  'negociaciones' as tabla,
  COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'negociaciones'

UNION ALL

SELECT
  'viviendas' as tabla,
  COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'viviendas'

UNION ALL

SELECT
  'abonos' as tabla,
  COUNT(*) as total_columnas
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'abonos';

-- Resultado esperado:
-- negociaciones: ~20 columnas (4 menos)
-- viviendas: ~13 columnas (2 menos)
-- abonos: 0 (tabla eliminada)
```

---

## 📝 Impacto en el Código

### ✅ **Cambios Requeridos en el Código**

Después de ejecutar la limpieza, verificar estos archivos:

#### 1. Referencias a tabla `abonos` (deben usar `abonos_historial`)
```bash
# Buscar referencias a la tabla antigua
grep -r "from('abonos')" src/
grep -r "\.abonos" src/
```

**Archivos ya actualizados**:
- ✅ `cliente-card-activo.tsx` - Usa `abonos_historial`
- ✅ `negociaciones.service.ts` - Usa `abonos_historial`

#### 2. Referencias a columnas obsoletas
```bash
# Buscar referencias a campos obsoletos
grep -r "fecha_cierre_financiero\|fecha_activacion\|fecha_cancelacion\|motivo_cancelacion" src/
grep -r "\.precio\|fecha_pago_completo" src/
```

---

## 📊 Beneficios de la Limpieza

### ✅ Ventajas

1. **Base de datos más limpia**
   - Reducción de ~15% en columnas totales
   - Estructura más clara y mantenible

2. **Mejor performance**
   - Menos índices innecesarios
   - Queries más eficientes

3. **Menos confusión**
   - Solo hay UNA forma de hacer cada cosa
   - Documentación más simple

4. **Menor riesgo de bugs**
   - No hay columnas "fantasma" con datos antiguos
   - TypeScript más preciso

### ⚠️ Consideraciones

- **Irreversible**: Una vez eliminadas, solo se recuperan con backup
- **Downtime**: Mínimo (~5 segundos por ALTER TABLE)
- **Testing**: Probar TODAS las funcionalidades después

---

## 🚀 Plan de Ejecución Recomendado

### Opción A: **Ejecución Inmediata** (Recomendado)
Si la aplicación está en desarrollo y no hay datos de producción:

```bash
1. ✅ Hacer backup en Supabase Dashboard
2. ✅ Ejecutar Script de Verificación (Paso 2)
3. ✅ Si OK → Ejecutar Scripts de Limpieza (Pasos 3-5)
4. ✅ Ejecutar Verificación Post-Eliminación (Paso 6)
5. ✅ Actualizar documentación (DATABASE-SCHEMA-REFERENCE)
6. ✅ Probar E2E todo el flujo de negociaciones
```

### Opción B: **Ejecución Planificada**
Si hay usuarios activos:

```bash
1. ✅ Hacer backup completo
2. ✅ Ejecutar en horario de menor tráfico
3. ✅ Tener plan de rollback preparado
4. ✅ Monitorear errores post-deployment
```

---

## 📄 Actualizar Documentación

Después de ejecutar la limpieza, actualizar:

1. **`DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`**
   - Eliminar sección de tabla `abonos`
   - Eliminar columnas obsoletas de tablas
   - Eliminar notas de "⚠️ OBSOLETO"
   - Actualizar conteo total de tablas: 17 → 16

2. **Este documento**
   - Marcar como ✅ EJECUTADO
   - Añadir fecha de ejecución
   - Documentar cualquier problema encontrado

---

## ✅ Checklist de Ejecución

- [ ] Backup creado en Supabase Dashboard
- [ ] Script de verificación ejecutado (Paso 2)
- [ ] Verificación OK (sin datos en columnas obsoletas)
- [ ] Tabla `abonos` eliminada (Paso 3)
- [ ] Columnas de `negociaciones` eliminadas (Paso 4)
- [ ] Columnas de `viviendas` eliminadas (Paso 5)
- [ ] Verificación post-eliminación OK (Paso 6)
- [ ] Código verificado (sin referencias a elementos eliminados)
- [ ] Documentación actualizada
- [ ] Testing E2E completo
- [ ] Aplicación funcionando correctamente

---

## 🆘 Rollback (Si algo sale mal)

```sql
-- Restaurar desde backup en Supabase Dashboard
-- Settings → Backups → Restore from backup

-- O revertir manualmente:

-- Recrear tabla abonos
CREATE TABLE abonos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vivienda_id UUID NOT NULL REFERENCES viviendas(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  monto NUMERIC NOT NULL,
  fecha_abono TIMESTAMP NOT NULL,
  metodo_pago VARCHAR(100) NOT NULL,
  comprobante TEXT,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Recrear columnas en negociaciones
ALTER TABLE negociaciones
  ADD COLUMN fecha_cierre_financiero TIMESTAMP,
  ADD COLUMN fecha_activacion TIMESTAMP,
  ADD COLUMN fecha_cancelacion TIMESTAMP,
  ADD COLUMN motivo_cancelacion TEXT;

-- Recrear columnas en viviendas
ALTER TABLE viviendas
  ADD COLUMN precio NUMERIC,
  ADD COLUMN fecha_pago_completo TIMESTAMP;
```

---

**Última actualización**: 2025-10-22
**Estado**: ✅ **EJECUTADO EXITOSAMENTE**
**Fecha de ejecución**: 2025-10-22
**Responsable**: Equipo de desarrollo

## 📊 Resultado de la Ejecución

- ✅ Tabla `abonos` eliminada correctamente
- ✅ 4 columnas eliminadas de `negociaciones`
- ✅ 2 columnas eliminadas de `viviendas`
- ✅ Documentación actualizada
- ✅ Total: 7 elementos obsoletos eliminados

**Sin errores reportados** ✨
