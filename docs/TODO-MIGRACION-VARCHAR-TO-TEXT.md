# 📋 TODO: Estandarización de Tipos TEXT en fuentes_pago

**Prioridad:** 🟡 Baja (OPCIONAL)
**Complejidad:** 🔴 Media-Alta
**Estimación:** ⏱️ 2-3 horas
**Riesgo:** ⚠️ Medio

---

## 🎯 OBJETIVO

Migrar todas las columnas `VARCHAR` de la tabla `fuentes_pago` a `TEXT` para estandarizar según best practices de PostgreSQL.

---

## ✅ BENEFICIOS

1. **Estandarización**: Alineación con recomendaciones oficiales de PostgreSQL
2. **Eliminación de CAST**: Funciones SQL más limpias (sin `::TEXT`)
3. **Flexibilidad**: Sin límites artificiales en longitud de texto
4. **Consistencia**: Mismo tipo en toda la base de datos

---

## ⚠️ PRE-REQUISITOS

Antes de comenzar:

- [ ] **Backup completo** de la base de datos
- [ ] **Horario de mantenimiento** programado (sistema no crítico)
- [ ] **Plan de rollback** preparado
- [ ] **Testing environment** disponible para pruebas
- [ ] **3-4 horas** de tiempo dedicado sin interrupciones

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Preparación y Backup

- [ ] Crear backup completo de Supabase
  ```bash
  # Comando aquí cuando esté disponible
  ```

- [ ] Documentar definiciones actuales de triggers
  ```bash
  npm run db:exec supabase/verification/consultar-triggers-fuentes-pago.sql
  ```

- [ ] Documentar definiciones actuales de vistas
  ```bash
  npm run db:exec supabase/verification/consultar-vistas-fuentes-pago.sql
  ```

- [ ] Crear rama Git específica
  ```bash
  git checkout -b refactor/varchar-to-text-fuentes-pago
  ```

---

### FASE 2: Eliminar Dependencias

#### 2.1 Eliminar Triggers (15 triggers)

- [ ] `fuentes_pago_sync_entidad`
- [ ] `trg_invalidar_pasos_fuente_modificada`
- [ ] `trigger_actualizar_estado_documentacion`
- [ ] `trigger_autoconfigurar_requisitos`
- [ ] `trigger_crear_documento_pendiente`
- [ ] `trigger_fuente_inactivada`
- [ ] `trigger_limpiar_pendientes_fuente`
- [ ] `trigger_limpiar_pendientes_fuente_inactiva`
- [ ] `trigger_prevent_delete_fuente_con_dinero`
- [ ] `trigger_update_negociaciones_totales_delete`
- [ ] `trigger_update_negociaciones_totales_insert`
- [ ] `trigger_update_negociaciones_totales_update`
- [ ] (verificar si hay más con el script de consulta)

```sql
-- Archivo: supabase/migrations/TODO_step1_drop_triggers.sql
DROP TRIGGER IF EXISTS fuentes_pago_sync_entidad ON public.fuentes_pago;
DROP TRIGGER IF EXISTS trg_invalidar_pasos_fuente_modificada ON public.fuentes_pago;
-- ... resto de triggers
```

#### 2.2 Eliminar Vistas (4 vistas)

- [ ] `vista_estado_validacion_fuentes`
- [ ] `vista_abonos_completos`
- [ ] `negociaciones_con_version_actual`
- [ ] `fuentes_pago_con_entidad`

```sql
-- Archivo: supabase/migrations/TODO_step2_drop_views.sql
DROP VIEW IF EXISTS vista_estado_validacion_fuentes CASCADE;
DROP VIEW IF EXISTS vista_abonos_completos CASCADE;
DROP VIEW IF EXISTS negociaciones_con_version_actual CASCADE;
DROP VIEW IF EXISTS fuentes_pago_con_entidad CASCADE;
```

---

### FASE 3: Cambiar Tipos de Columnas

- [ ] Migrar columnas VARCHAR → TEXT

```sql
-- Archivo: supabase/migrations/TODO_step3_alter_columns.sql
ALTER TABLE public.fuentes_pago
  ALTER COLUMN tipo TYPE TEXT USING tipo::TEXT,
  ALTER COLUMN entidad TYPE TEXT USING entidad::TEXT,
  ALTER COLUMN numero_referencia TYPE TEXT USING numero_referencia::TEXT,
  ALTER COLUMN estado TYPE TEXT USING estado::TEXT,
  ALTER COLUMN estado_documentacion TYPE TEXT USING estado_documentacion::TEXT,
  ALTER COLUMN estado_fuente TYPE TEXT USING estado_fuente::TEXT;
```

- [ ] Verificar tipos fueron cambiados correctamente
  ```bash
  npm run db:exec supabase/verification/consultar-estructura-fuentes-pago.sql
  # Verificar que todas las columnas muestran "text" en data_type
  ```

---

### FASE 4: Recrear Triggers

#### 4.1 Buscar definiciones originales

- [ ] Buscar en migraciones existentes:
  ```bash
  grep -r "CREATE TRIGGER.*fuentes_pago" supabase/migrations/
  grep -r "CREATE.*FUNCTION.*sync_entidad" supabase/migrations/
  ```

#### 4.2 Recrear cada trigger

**Ubicar archivos originales:**
- [ ] `supabase/migrations/20251211_normalizar_entidad_fuentes_pago.sql`
- [ ] `supabase/migrations/20251211_sistema_validacion_fuentes_pago_v2.sql`
- [ ] `supabase/migrations/20251212_sistema_validacion_requisitos_fuentes.sql`
- [ ] (otros archivos que definan triggers)

**Copiar definiciones y recrear:**
```sql
-- Archivo: supabase/migrations/TODO_step4_recreate_triggers.sql

-- Trigger 1: sync_entidad_from_fk
CREATE TRIGGER fuentes_pago_sync_entidad
  BEFORE INSERT OR UPDATE ON public.fuentes_pago
  FOR EACH ROW
  EXECUTE FUNCTION sync_entidad_from_fk();

-- Trigger 2: invalidar_pasos_fuente_modificada
CREATE TRIGGER trg_invalidar_pasos_fuente_modificada
  AFTER UPDATE ON public.fuentes_pago
  FOR EACH ROW
  WHEN (OLD.monto_aprobado IS DISTINCT FROM NEW.monto_aprobado
        OR OLD.entidad IS DISTINCT FROM NEW.entidad)
  EXECUTE FUNCTION invalidar_pasos_fuente_modificada();

-- ... resto de triggers (copiar definiciones originales)
```

- [ ] Verificar todos los triggers fueron recreados
  ```bash
  npm run db:exec supabase/verification/consultar-triggers-fuentes-pago.sql
  # Verificar que aparecen los 15 triggers
  ```

---

### FASE 5: Recrear Vistas

#### 5.1 Buscar definiciones originales

- [ ] Buscar en migraciones existentes:
  ```bash
  grep -r "CREATE.*VIEW.*fuentes_pago_con_entidad" supabase/migrations/
  grep -r "CREATE.*VIEW.*vista_estado_validacion" supabase/migrations/
  ```

#### 5.2 Recrear cada vista

**Ubicar archivos originales:**
- [ ] `supabase/migrations/20251211_normalizar_entidad_fuentes_pago.sql`
- [ ] (otros archivos que definan vistas)

**Copiar definiciones y recrear:**
```sql
-- Archivo: supabase/migrations/TODO_step5_recreate_views.sql

-- Vista 1: fuentes_pago_con_entidad
CREATE OR REPLACE VIEW fuentes_pago_con_entidad AS
SELECT
  fp.*,
  ef.nombre AS entidad_nombre,
  ef.tipo AS entidad_tipo,
  ef.codigo AS entidad_codigo,
  COALESCE(ef.nombre, fp.entidad) AS entidad_display
FROM fuentes_pago fp
LEFT JOIN entidades_financieras ef ON fp.entidad_financiera_id = ef.id;

-- Vista 2: negociaciones_con_version_actual
CREATE OR REPLACE VIEW negociaciones_con_version_actual AS
-- ... copiar definición original

-- Vista 3: vista_abonos_completos
CREATE OR REPLACE VIEW vista_abonos_completos AS
-- ... copiar definición original

-- Vista 4: vista_estado_validacion_fuentes
CREATE OR REPLACE VIEW vista_estado_validacion_fuentes AS
-- ... copiar definición original
```

- [ ] Verificar todas las vistas fueron recreadas
  ```bash
  npm run db:exec supabase/verification/consultar-vistas-fuentes-pago.sql
  # Verificar que aparecen las 4 vistas
  ```

---

### FASE 6: Actualizar Funciones

- [ ] Actualizar `obtener_estado_documentacion_fuente` (eliminar CAST)

```sql
-- Archivo: supabase/migrations/TODO_step6_update_functions.sql

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
    fp.tipo AS tipo_fuente,              -- ✅ Sin CAST (ya es TEXT)
    COALESCE(fp.entidad, '') AS entidad, -- ✅ Sin CAST (ya es TEXT)
    CASE
      WHEN v_validacion.cumple_requisitos THEN 'completo'
      WHEN v_validacion.puede_continuar THEN 'advertencia'
      ELSE 'bloqueado'
    END AS estado_general,
    CASE
      WHEN v_validacion.total_requisitos > 0 THEN
        ROUND((v_validacion.requisitos_completados::NUMERIC / v_validacion.total_requisitos::NUMERIC) * 100)::INT
      ELSE 100
    END AS progreso_porcentaje,
    jsonb_build_object(
      'cumple_requisitos', v_validacion.cumple_requisitos,
      'puede_continuar', v_validacion.puede_continuar,
      'total_requisitos', v_validacion.total_requisitos,
      'requisitos_completados', v_validacion.requisitos_completados,
      'obligatorios_faltantes', v_validacion.obligatorios_faltantes,
      'opcionales_faltantes', v_validacion.opcionales_faltantes,
      'documentos_faltantes', v_validacion.documentos_faltantes,
      'documentos_completados', v_validacion.documentos_completados
    ) AS validacion
  FROM fuentes_pago fp
  WHERE fp.id = p_fuente_pago_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

- [ ] Buscar otras funciones que puedan usar CAST en estas columnas
  ```bash
  grep -r "tipo::TEXT\|entidad::TEXT" supabase/migrations/
  ```

---

### FASE 7: Testing Exhaustivo

#### 7.1 Testing de Base de Datos

- [ ] Verificar constraints se mantienen
  ```sql
  SELECT * FROM information_schema.check_constraints
  WHERE constraint_name LIKE '%fuentes_pago%';
  ```

- [ ] Verificar índices se mantienen
  ```sql
  SELECT * FROM pg_indexes
  WHERE tablename = 'fuentes_pago';
  ```

- [ ] Ejecutar query de prueba
  ```sql
  SELECT * FROM obtener_estado_documentacion_fuente('uuid-de-prueba');
  ```

#### 7.2 Testing Frontend

- [ ] Navegar a módulo "Vivienda Asignada"
- [ ] Verificar cards de estado cargan correctamente
- [ ] Verificar no hay errores en console
- [ ] Verificar datos se muestran correctamente
- [ ] Probar crear nueva fuente de pago
- [ ] Probar editar fuente existente
- [ ] Probar eliminar fuente (si aplica)

#### 7.3 Testing de Triggers

- [ ] Insertar nueva fuente → verificar triggers se ejecutan
- [ ] Actualizar fuente existente → verificar triggers se ejecutan
- [ ] Verificar audit_log se crea correctamente
- [ ] Verificar documentos_pendientes se crean si aplica
- [ ] Verificar totales de negociación se actualizan

#### 7.4 Testing de Vistas

- [ ] Consultar cada vista directamente
  ```sql
  SELECT * FROM fuentes_pago_con_entidad LIMIT 5;
  SELECT * FROM vista_estado_validacion_fuentes LIMIT 5;
  SELECT * FROM negociaciones_con_version_actual LIMIT 5;
  SELECT * FROM vista_abonos_completos LIMIT 5;
  ```

---

### FASE 8: Regenerar Tipos TypeScript

- [ ] Regenerar tipos desde Supabase
  ```bash
  npm run types:generate
  ```

- [ ] Verificar tipos TypeScript
  ```bash
  npm run type-check
  ```

- [ ] Verificar no hay errores de compilación
  ```bash
  npm run build
  ```

---

### FASE 9: Documentación

- [ ] Actualizar `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- [ ] Actualizar `docs/fixes/FIX-INCOMPATIBILIDAD-TIPOS-VARCHAR-TEXT.md`
  - Marcar como "✅ Migración completa realizada"
  - Agregar fecha de migración
- [ ] Crear documento de migración
  ```
  docs/migrations/MIGRACION-VARCHAR-TO-TEXT-FUENTES-PAGO.md
  ```
- [ ] Commit con mensaje descriptivo
  ```bash
  git add .
  git commit -m "refactor(db): Migrar columnas VARCHAR a TEXT en fuentes_pago

  - Eliminar y recrear 15 triggers
  - Eliminar y recrear 4 vistas
  - Actualizar función obtener_estado_documentacion_fuente (sin CAST)
  - Testing exhaustivo completado
  - Tipos TypeScript regenerados

  Refs: FIX-INCOMPATIBILIDAD-TIPOS-VARCHAR-TEXT.md"
  ```

---

### FASE 10: Deploy y Monitoreo

- [ ] Merge a rama principal
  ```bash
  git checkout main
  git merge refactor/varchar-to-text-fuentes-pago
  git push origin main
  ```

- [ ] Deploy a producción (si aplica)
- [ ] Monitorear logs por 24-48 horas
- [ ] Verificar no hay errores nuevos
- [ ] Notificar al equipo de cambio completado

---

## 🚨 PLAN DE ROLLBACK

Si algo sale mal:

### Opción A: Rollback con Backup

```bash
# Restaurar backup completo de Supabase
# (comandos específicos de Supabase aquí)
```

### Opción B: Rollback Manual

```sql
-- 1. Revertir columnas a VARCHAR
ALTER TABLE public.fuentes_pago
  ALTER COLUMN tipo TYPE VARCHAR(50) USING tipo::VARCHAR(50),
  ALTER COLUMN entidad TYPE VARCHAR(100) USING entidad::VARCHAR(100),
  ALTER COLUMN numero_referencia TYPE VARCHAR(50) USING numero_referencia::VARCHAR(50),
  ALTER COLUMN estado TYPE VARCHAR(20) USING estado::VARCHAR(20),
  ALTER COLUMN estado_documentacion TYPE VARCHAR(50) USING estado_documentacion::VARCHAR(50),
  ALTER COLUMN estado_fuente TYPE VARCHAR(20) USING estado_fuente::VARCHAR(20);

-- 2. Restaurar función con CAST
-- (copiar de supabase/migrations/20251212_fix_tipo_entidad_funcion.sql)
```

---

## 📊 CRITERIOS DE ÉXITO

La migración es exitosa cuando:

- ✅ Todas las columnas son tipo `TEXT` (verificado con script)
- ✅ Los 15 triggers funcionan correctamente
- ✅ Las 4 vistas funcionan correctamente
- ✅ La función `obtener_estado_documentacion_fuente` funciona sin CAST
- ✅ UI carga sin errores
- ✅ No hay errores en logs de Supabase
- ✅ Tests manuales pasan 100%
- ✅ Tipos TypeScript generados correctamente
- ✅ Build de producción exitoso

---

## ⏰ CUÁNDO HACERLO

**Recomendación:** Agendar para:

- 🟢 **Ventana de mantenimiento** con poco tráfico
- 🟢 **Viernes tarde** → monitoreo durante fin de semana
- 🟢 **Después de release estable** → no acumular cambios
- 🟢 **Con tiempo dedicado** → evitar interrupciones

**NO hacerlo cuando:**

- 🔴 Sistema en uso crítico
- 🔴 Sin backup reciente
- 🔴 Sin tiempo para rollback
- 🔴 Cerca de deadline importante
- 🔴 Sin testing environment

---

## 📝 NOTAS ADICIONALES

### Alternativa: Hacerlo por Fases

Si 2-3 horas de downtime es mucho, considerar:

1. **Fase 1 (Día 1):** Eliminar triggers, cambiar tipos, recrear triggers
2. **Fase 2 (Día 2):** Recrear vistas después de monitoreo
3. **Fase 3 (Día 3):** Actualizar funciones y regenerar tipos

### Lecciones del Intento Anterior

- ⚠️ No se puede deshabilitar triggers del sistema (FK)
- ⚠️ `ALTER TABLE DISABLE TRIGGER ALL` falla con error de permisos
- ✅ Solución: DROP TRIGGER explícito uno por uno
- ✅ Usar `USING` en ALTER COLUMN para conversión explícita

---

**Última actualización:** 2025-12-12
**Estado:** 📋 Pendiente de implementación
**Prioridad:** 🟡 Baja (OPCIONAL)
