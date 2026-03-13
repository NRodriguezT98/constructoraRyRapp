# 🔧 FIX: Incompatibilidad de Tipos VARCHAR/TEXT en PostgreSQL

**Fecha:** 2025-12-12
**Estado:** ✅ Resuelto (Type-safe CAST implementado)
**Prioridad:** Alta
**Módulo afectado:** Fuentes de Pago - Validación de Requisitos

---

## 📋 PROBLEMA IDENTIFICADO

### Error Original

```
POST /rest/v1/rpc/obtener_estado_documentacion_fuente 400 (Bad Request)
Error: "Returned type character varying(50) does not match expected type text in column 2"
```

### Causa Raíz

**Incompatibilidad de tipos entre tabla y función SQL:**

- **Tabla `fuentes_pago`**: Columnas definidas como `VARCHAR(50)` y `VARCHAR(100)`
  ```sql
  tipo VARCHAR(50)
  entidad VARCHAR(100)
  ```

- **Función `obtener_estado_documentacion_fuente`**: Retorna `TEXT`
  ```sql
  RETURNS TABLE(
    tipo_fuente TEXT,
    entidad TEXT,
    ...
  )
  ```

- **PostgreSQL**: Valida estrictamente que los tipos devueltos coincidan EXACTAMENTE con la definición del `RETURNS TABLE`

### Impacto

❌ **Error visible al usuario:**
- Al entrar al módulo "Vivienda Asignada"
- Cards de estado de documentación no cargan
- React Query falla en `useEstadoDocumentacionFuente`
- UI muestra estado de error

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Enfoque Elegido: Type-Safe CAST

**Archivo modificado:**
```
supabase/migrations/20251212_fix_tipo_entidad_funcion.sql
```

**Cambios aplicados:**

```sql
CREATE OR REPLACE FUNCTION obtener_estado_documentacion_fuente(p_fuente_pago_id UUID)
RETURNS TABLE(
  fuente_pago_id UUID,
  tipo_fuente TEXT,
  entidad TEXT,
  estado_general TEXT,
  progreso_porcentaje INT,
  validacion JSONB
) AS $$
DECLARE
  v_validacion RECORD;
BEGIN
  SELECT * INTO v_validacion
  FROM validar_requisitos_desembolso(p_fuente_pago_id);

  RETURN QUERY
  SELECT
    fp.id AS fuente_pago_id,
    fp.tipo::TEXT AS tipo_fuente,              -- ✅ CAST VARCHAR(50) → TEXT
    COALESCE(fp.entidad, '')::TEXT AS entidad, -- ✅ CAST VARCHAR(100) → TEXT
    CASE
      WHEN v_validacion.cumple_requisitos THEN 'completo'
      WHEN v_validacion.puede_continuar THEN 'advertencia'
      ELSE 'bloqueado'
    END AS estado_general,
    -- ... resto del query
  FROM fuentes_pago fp
  WHERE fp.id = p_fuente_pago_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Por Qué Esta Solución es Profesional

✅ **Type Safety garantizado**
- CAST explícito asegura match exacto de tipos
- PostgreSQL valida en tiempo de creación de función

✅ **Sin costo de performance**
- Conversión VARCHAR→TEXT es operación sin overhead
- Query planner de PostgreSQL lo optimiza

✅ **Función marcada como STABLE**
- Indica que no modifica datos
- Permite optimización en queries complejos
- Puede ser cacheada por el query planner

✅ **Mínima disrupción**
- No requiere modificar schema de tabla
- No afecta 15 triggers existentes
- No afecta 4 vistas dependientes

✅ **Bien documentado**
- Comentarios explican el contexto
- Documentación de la decisión técnica
- Fácil de mantener para próximo desarrollador

---

## 🚫 ENFOQUE DESCARTADO

### Migrar columnas a TEXT en la tabla

**Por qué NO se hizo:**

```sql
-- Esto requeriría:
ALTER TABLE fuentes_pago
  ALTER COLUMN tipo TYPE TEXT,
  ALTER COLUMN entidad TYPE TEXT;
```

**Obstáculos técnicos:**

1. **15 Triggers que dependen de estas columnas:**
   - `fuentes_pago_sync_entidad`
   - `trg_invalidar_pasos_fuente_modificada`
   - `trigger_actualizar_estado_documentacion`
   - `trigger_autoconfigurar_requisitos`
   - `trigger_crear_documento_pendiente`
   - `trigger_fuente_inactivada`
   - `trigger_limpiar_pendientes_fuente`
   - `trigger_limpiar_pendientes_fuente_inactiva`
   - `trigger_prevent_delete_fuente_con_dinero`
   - `trigger_update_negociaciones_totales_*` (3 triggers)
   - + 3 triggers más

2. **4 Vistas que usan estas columnas:**
   - `fuentes_pago_con_entidad`
   - `negociaciones_con_version_actual`
   - `vista_abonos_completos`
   - `vista_estado_validacion_fuentes`

3. **PostgreSQL no permite ALTER TYPE en columnas:**
   - Usadas por triggers
   - Usadas por vistas
   - Con foreign keys activos

**Complejidad vs Beneficio:**
- ⚠️ Requeriría eliminar y recrear 15+ triggers
- ⚠️ Requeriría recrear 4 vistas
- ⚠️ Alto riesgo de romper funcionalidad existente
- ⚠️ Tiempo de implementación: 2-3 horas
- ✅ Beneficio real: Marginal (CAST no tiene costo)

**Decisión:** CAST explícito es la solución correcta en este contexto.

---

## 📊 VALIDACIÓN

### Test Realizado

```bash
# 1. Ejecutar migración
npm run db:exec supabase/migrations/20251212_fix_tipo_entidad_funcion.sql

# Resultado: ✅ Exitoso
```

### Verificar en UI

1. ✅ Navegar a módulo "Clientes"
2. ✅ Seleccionar cliente con negociación activa
3. ✅ Abrir pestaña "Vivienda Asignada"
4. ✅ Cards de estado de documentación cargan correctamente
5. ✅ No hay errores 400 en console
6. ✅ React Query funciona sin errores

---

## 📝 PENDIENTE POR IMPLEMENTAR

### ⚠️ DEUDA TÉCNICA CONOCIDA

Aunque la solución actual es correcta y profesional, existe una **mejora opcional** para estandarización futura:

#### 1. Migración completa a TEXT (OPCIONAL - Baja prioridad)

**Objetivo:** Estandarizar toda la tabla `fuentes_pago` usando `TEXT` en lugar de `VARCHAR`

**Razón:** PostgreSQL recomienda `TEXT` como best practice:
- Mismo performance que VARCHAR
- Sin límites artificiales
- Más flexible
- Evita problemas de conversión de tipos

**Archivo:** `supabase/migrations/PENDIENTE_migracion_varchar_to_text.sql`

**Pasos requeridos:**

```sql
-- 1. Eliminar triggers
DROP TRIGGER fuentes_pago_sync_entidad ON fuentes_pago;
DROP TRIGGER trg_invalidar_pasos_fuente_modificada ON fuentes_pago;
DROP TRIGGER trigger_actualizar_estado_documentacion ON fuentes_pago;
DROP TRIGGER trigger_autoconfigurar_requisitos ON fuentes_pago;
DROP TRIGGER trigger_crear_documento_pendiente ON fuentes_pago;
DROP TRIGGER trigger_fuente_inactivada ON fuentes_pago;
DROP TRIGGER trigger_limpiar_pendientes_fuente ON fuentes_pago;
DROP TRIGGER trigger_limpiar_pendientes_fuente_inactiva ON fuentes_pago;
DROP TRIGGER trigger_prevent_delete_fuente_con_dinero ON fuentes_pago;
DROP TRIGGER trigger_update_negociaciones_totales_delete ON fuentes_pago;
DROP TRIGGER trigger_update_negociaciones_totales_insert ON fuentes_pago;
DROP TRIGGER trigger_update_negociaciones_totales_update ON fuentes_pago;

-- 2. Eliminar vistas
DROP VIEW vista_estado_validacion_fuentes CASCADE;
DROP VIEW vista_abonos_completos CASCADE;
DROP VIEW negociaciones_con_version_actual CASCADE;
DROP VIEW fuentes_pago_con_entidad CASCADE;

-- 3. Cambiar tipos
ALTER TABLE fuentes_pago
  ALTER COLUMN tipo TYPE TEXT USING tipo::TEXT,
  ALTER COLUMN entidad TYPE TEXT USING entidad::TEXT,
  ALTER COLUMN numero_referencia TYPE TEXT USING numero_referencia::TEXT,
  ALTER COLUMN estado TYPE TEXT USING estado::TEXT,
  ALTER COLUMN estado_documentacion TYPE TEXT USING estado_documentacion::TEXT,
  ALTER COLUMN estado_fuente TYPE TEXT USING estado_fuente::TEXT;

-- 4. Recrear TODOS los triggers (15+)
-- ... código de cada trigger ...

-- 5. Recrear TODAS las vistas (4)
-- ... código de cada vista ...

-- 6. Actualizar función (eliminar CAST)
CREATE OR REPLACE FUNCTION obtener_estado_documentacion_fuente(...)
  -- fp.tipo AS tipo_fuente (sin ::TEXT)
  -- fp.entidad AS entidad (sin ::TEXT)
```

**Estimación de esfuerzo:**
- ⏱️ Tiempo: 2-3 horas
- 🎯 Complejidad: Media-Alta
- 🚨 Riesgo: Medio (muchos componentes afectados)
- 💰 Beneficio: Bajo (CAST actual funciona perfecto)

**Recomendación:** ⚠️ **NO URGENTE** - Agendar para refactor futuro cuando haya:
- Tiempo dedicado de mantenimiento
- Testing exhaustivo disponible
- Posibilidad de rollback rápido

---

## 🎯 ARCHIVOS MODIFICADOS

### Migración Aplicada
```
✅ supabase/migrations/20251212_fix_tipo_entidad_funcion.sql
```

### Archivos de Verificación Creados
```
✅ supabase/verification/consultar-estructura-fuentes-pago.sql
✅ supabase/verification/consultar-triggers-fuentes-pago.sql
✅ supabase/verification/consultar-vistas-fuentes-pago.sql
```

### Documentación Creada
```
✅ docs/fixes/FIX-INCOMPATIBILIDAD-TIPOS-VARCHAR-TEXT.md (este archivo)
```

---

## 📚 LECCIONES APRENDIDAS

### ✅ Best Practices Aplicadas

1. **Investigación exhaustiva antes de implementar**
   - Identificar TODOS los componentes dependientes
   - Evaluar múltiples enfoques
   - Elegir el de menor impacto

2. **Documentación técnica clara**
   - Explicar el WHY, no solo el WHAT
   - Documentar decisiones descartadas
   - Facilitar mantenimiento futuro

3. **Type safety en SQL**
   - CAST explícito > conversión implícita
   - PostgreSQL valida tipos estrictamente
   - Funciones STABLE para optimización

4. **Pragmatismo profesional**
   - "Perfecto" no siempre es mejor que "funcional y seguro"
   - Evaluar costo-beneficio de refactors grandes
   - Priorizar estabilidad sobre purismo académico

### 🎓 Para Próximos Desarrolladores

**Si encuentras este error en el futuro:**

1. ✅ **Primero verifica:** ¿La función usa CAST?
2. ✅ **Si no:** Aplica CAST explícito (rápido, seguro)
3. ✅ **Si sí:** Verifica tipos en tabla vs función
4. ⚠️ **Evita:** Cambiar schema sin evaluar impacto completo

**Si decides migrar a TEXT:**

1. 📋 Usa este documento como checklist
2. 🧪 Crea backup completo antes
3. 🎯 Planea 3-4 horas de trabajo
4. ✅ Testing exhaustivo post-migración

---

## 🔗 REFERENCIAS

### Código Relacionado

**Frontend:**
```
src/modules/fuentes-pago/components/EstadoDocumentacionFuenteCard.tsx
src/modules/fuentes-pago/hooks/useEstadoDocumentacionFuente.ts
src/modules/fuentes-pago/services/requisitos.service.ts
```

**Backend:**
```
supabase/migrations/20251212_sistema_validacion_requisitos_fuentes.sql (función original)
supabase/migrations/20251212_fix_tipo_entidad_funcion.sql (fix aplicado)
```

### PostgreSQL Documentation

- [PostgreSQL Data Types - TEXT vs VARCHAR](https://www.postgresql.org/docs/current/datatype-character.html)
- [CREATE FUNCTION - RETURNS TABLE](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Function Volatility Categories](https://www.postgresql.org/docs/current/xfunc-volatility.html)

---

## ✅ CONCLUSIÓN

**Solución aplicada:** ✅ Type-safe CAST en función SQL
**Estado actual:** ✅ Funcionando correctamente
**Deuda técnica:** ⚠️ Migración a TEXT (opcional, baja prioridad)
**Recomendación:** 🎯 Mantener solución actual, agendar refactor para futuro

---

**Última actualización:** 2025-12-12
**Autor:** Sistema de Gestión RyR
**Revisión requerida:** No
