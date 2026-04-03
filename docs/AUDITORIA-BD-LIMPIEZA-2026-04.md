# 🔍 AUDITORÍA COMPLETA DE BASE DE DATOS - RyR Constructora

> **Fecha:** 2 de abril de 2026
> **Método:** Inventario BD real + Cruce automático con 920 archivos de código fuente
> **Herramientas:** `scripts/auditoria-bd.js` + `scripts/auditoria-cruce-codigo-v2.js`

---

## 📊 RESUMEN EJECUTIVO

| Categoría         | Total | En Uso             | Sin Usar / Sospechoso   | % Limpieza |
| ----------------- | ----- | ------------------ | ----------------------- | ---------- |
| **Tablas**        | 36    | 30                 | **6 eliminables**       | 17%        |
| **Vistas**        | 20    | 11                 | **9 eliminables**       | 45%        |
| **Columnas**      | 583   | ~560               | **~23 sospechosas**     | 4%         |
| **Funciones**     | 95    | 95                 | 0 (todas referenciadas) | 0%         |
| **Triggers**      | 70    | ~67                | **~3 duplicados**       | 4%         |
| **Políticas RLS** | 135   | pendiente revisión | -                       | -          |

**Impacto estimado de limpieza:** Eliminar ~6 tablas, ~9 vistas, ~23 columnas y ~3 triggers duplicados.

---

## 🔴 SECCIÓN 1: TABLAS NO USADAS (ELIMINAR)

Estas tablas **no tienen ninguna referencia** en el código fuente (0 `.from()` calls) y tienen **0 filas**:

| #   | Tabla                            | Filas | FKs | Diagnóstico                                                                                |
| --- | -------------------------------- | ----- | --- | ------------------------------------------------------------------------------------------ |
| 1   | `plantillas_proceso`             | 0     | No  | Concepto abandonado. Nunca implementado en la app.                                         |
| 2   | `tipo_documento_mapping`         | 0     | No  | Mapping de tipos de documento nunca usado. Probablemente reemplazado por lógica en código. |
| 3   | `tipos_fuente_plantillas`        | 0     | No  | Plantillas de tipos de fuente. Nunca implementado.                                         |
| 4   | `viviendas_historial_estados`    | 0     | No  | Historial de estados de viviendas. Concepto diseñado pero nunca conectado al código.       |
| 5   | `viviendas_historial_matriculas` | 0     | No  | Historial de matrículas. Igual, nunca conectado.                                           |

### Tabla borderline: `procesos_negociacion`

| Tabla                  | Filas | Referencia en código                                                                                                          |
| ---------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| `procesos_negociacion` | 0     | Solo aparece en `audit.service.ts` como nombre de tabla en un mapping, **pero nunca se hace `.from('procesos_negociacion')`** |

**Recomendación:** Eliminar. Solo existe como string en un mapping de auditorías que nunca genera queries reales a esta tabla.

---

## 🟡 SECCIÓN 2: VISTAS NO USADAS (ELIMINAR)

Estas vistas **no se referencian** desde ningún archivo `.ts`/`.tsx`:

| #   | Vista                               | Diagnóstico                                                                                                         |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `negociaciones_con_version_actual`  | Probablemente reemplazada por queries directas con joins en el service de negociaciones.                            |
| 2   | `v_negociaciones_completas`         | Vista completa de negociaciones. El código usa queries directas con `.select()` personalizado en vez de esta vista. |
| 3   | `v_reemplazos_admin`                | Vista para reemplazos admin. El código usa `documento_reemplazos_admin` directamente.                               |
| 4   | `v_renuncias_pendientes`            | El código usa `v_renuncias_completas` con filtro `.eq('estado', 'Pendiente')` en vez de esta vista filtrada.        |
| 5   | `vista_cuotas_calendario`           | Vista de cuotas de crédito como calendario. Feature no conectada a UI.                                              |
| 6   | `vista_descuentos_aplicados`        | Vista de descuentos. El código opera directamente sobre `descuentos_negociacion`.                                   |
| 7   | `vista_documentos_vivienda`         | Vista de documentos de vivienda. El código usa `documentos_vivienda` directamente con select personalizado.         |
| 8   | `vista_entidades_con_fuentes`       | Vista de entidades financieras con fuentes. El código usa `fuentes_pago_con_entidad` en su lugar.                   |
| 9   | `vista_requisitos_con_orden_visual` | Vista de requisitos ordenados visualmente. El código usa queries directas.                                          |

### Vistas EN USO (no tocar):

| Vista                                 | Archivos | Servicio principal               |
| ------------------------------------- | -------- | -------------------------------- |
| `fuentes_pago_con_entidad`            | 1        | fuentes-pago.service.ts          |
| `intereses_completos`                 | 2        | intereses.service.ts             |
| `v_auditoria_por_modulo`              | 2        | audit.service.ts                 |
| `v_renuncias_completas`               | 1        | renuncias.service.ts             |
| `vista_abonos_completos`              | 1        | useAbonosQuery.ts                |
| `vista_clientes_resumen`              | 1        | queries de clientes              |
| `vista_documentos_pendientes_fuentes` | 3        | documentos-pendientes.service.ts |
| `vista_estado_periodos_credito`       | 1        | cuotas-credito.service.ts        |
| `vista_manzanas_disponibilidad`       | 1        | viviendas.service.ts             |
| `vista_usuarios_completos`            | 1        | usuarios.service.ts              |
| `vista_viviendas_completas`           | 1        | viviendas.service.ts             |

---

## 🟠 SECCIÓN 3: COLUMNAS SOSPECHOSAS (NO USADAS EN CÓDIGO)

Columnas que existen en tablas activas pero **no aparecen referenciadas en ningún archivo de código fuente**:

### 3.1 `viviendas` — 6 columnas sospechosas

| Columna                    | Tipo        | Nullable | Diagnóstico                                                   |
| -------------------------- | ----------- | -------- | ------------------------------------------------------------- |
| `motivo_inactivacion`      | text        | YES      | Sistema de inactivación de viviendas nunca implementado en UI |
| `inactivada_por`           | uuid        | YES      | Idem                                                          |
| `fecha_reactivacion`       | timestamptz | YES      | Idem                                                          |
| `motivo_reactivacion`      | text        | YES      | Idem                                                          |
| `reactivada_por`           | uuid        | YES      | Idem                                                          |
| `contador_desactivaciones` | integer     | YES      | Idem                                                          |

**Diagnóstico:** Todo el subsistema de "inactivación/reactivación de viviendas" fue diseñado pero **nunca se conectó a la UI**. Los 6 campos son parte de un concepto abandonado.

### 3.2 `documentos_cliente` — 3 columnas

| Columna               | Tipo        | Nullable | Diagnóstico                                                                          |
| --------------------- | ----------- | -------- | ------------------------------------------------------------------------------------ |
| `estado_documento`    | varchar     | YES      | Duplica la funcionalidad de `estado`. Probablemente vestigio de un sistema anterior. |
| `fecha_obsolescencia` | timestamptz | YES      | Sistema de obsolescencia no implementado en UI                                       |
| `eliminado_en`        | timestamptz | YES      | Soft-delete no implementado                                                          |

### 3.3 `documentos_proyecto` — 1 columna

| Columna        | Tipo        | Diagnóstico                                                              |
| -------------- | ----------- | ------------------------------------------------------------------------ |
| `eliminado_en` | timestamptz | Soft-delete no implementado. Los documentos se eliminan con DELETE real. |

### 3.4 `documentos_vivienda` — 1 columna

| Columna        | Tipo        | Diagnóstico              |
| -------------- | ----------- | ------------------------ |
| `eliminado_en` | timestamptz | Idem documentos_proyecto |

### 3.5 `documento_reemplazos_admin` — 3 columnas

| Columna           | Tipo        | Diagnóstico                                                                                |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `hash_anterior`   | text        | Hash de archivo antes de reemplazo. Feature de verificación de integridad no implementada. |
| `hash_nuevo`      | text        | Idem                                                                                       |
| `fecha_reemplazo` | timestamptz | El código usa `fecha_creacion` en su lugar                                                 |

### 3.6 `negociaciones` — 1 columna

| Columna                     | Tipo        | Diagnóstico                                                          |
| --------------------------- | ----------- | -------------------------------------------------------------------- |
| `fecha_ultima_modificacion` | timestamptz | Duplica `fecha_actualizacion`. Nunca se escribe ni lee desde código. |

### 3.7 `descuentos_negociacion` — 2 columnas

| Columna        | Tipo        | Diagnóstico                                              |
| -------------- | ----------- | -------------------------------------------------------- |
| `aplicado_por` | uuid        | Quién aplicó el descuento. No se usa en el flujo actual. |
| `aplicado_en`  | timestamptz | Cuándo se aplicó. Idem.                                  |

### 3.8 `negociaciones_versiones` — 1 columna

| Columna     | Tipo        | Diagnóstico                                         |
| ----------- | ----------- | --------------------------------------------------- |
| `creado_en` | timestamptz | Usa `fecha_creacion` en su lugar. Campo redundante. |

### 3.9 `permisos_rol` — 2 columnas

| Columna          | Tipo        | Diagnóstico                             |
| ---------------- | ----------- | --------------------------------------- |
| `creado_en`      | timestamptz | Duplica naming. Código usa otro nombre. |
| `actualizado_en` | timestamptz | Idem                                    |

### 3.10 `audit_log_seguridad` — 1 columna

| Columna | Tipo    | Diagnóstico                                |
| ------- | ------- | ------------------------------------------ |
| `pais`  | varchar | Feature de geolocalización no implementada |

### 3.11 `procesos_negociacion` — 1 columna

| Columna               | Tipo  | Diagnóstico                              |
| --------------------- | ----- | ---------------------------------------- |
| `documentos_metadata` | jsonb | Toda la tabla es candidata a eliminación |

### 3.12 `requisitos_fuentes_pago_config` — 1 columna

| Columna          | Tipo  | Diagnóstico                                           |
| ---------------- | ----- | ----------------------------------------------------- |
| `prerrequisitos` | ARRAY | Feature de prerrequisitos encadenados no implementada |

---

## 🔵 SECCIÓN 4: TRIGGERS DUPLICADOS / SOSPECHOSOS

### 4.1 Trigger duplicado en `categorias_documento`

```
trigger_proteger_categoria_sistema (DELETE) → prevenir_eliminacion_categoria_sistema()
trigger_proteger_categorias_sistema (DELETE) → proteger_categorias_sistema()
```

**Problema:** Dos triggers hacen lo mismo (proteger categorías de sistema contra DELETE). Son funciones diferentes con el mismo propósito. **Eliminar uno.**

### 4.2 Trigger potencialmente conflictivo en `negociaciones`

```
trigger_calcular_porcentaje_descuento (INSERT/UPDATE) → calcular_porcentaje_descuento()
trigger_calcular_porcentaje (INSERT/UPDATE) → calcular_porcentaje_descuento() [en descuentos_negociacion]
```

**Nota:** La misma función es usada por triggers en DOS tablas diferentes. Verificar que no haya conflicto lógico.

### 4.3 Función con doble firma: `crear_nueva_version_negociacion`

Existe como:

1. **Trigger function** (sin args, retorna trigger) — usada por `trigger_init_version_negociacion`
2. **RPC function** (con args, retorna uuid) — llamada desde código

**No es necesariamente un problema** (PostgreSQL permite overloading), pero es confuso.

---

## 🟢 SECCIÓN 5: LO QUE ESTÁ BIEN ✅

- **95/95 funciones** están en uso (por triggers, RPCs, o referenciadas internamente)
- **3/3 enums** están en uso (`estado_civil_enum`, `estado_usuario`, `rol_usuario`)
- **70 triggers** correctamente vinculados a tablas activas
- **Las tablas core** (`clientes`, `viviendas`, `proyectos`, `negociaciones`, `fuentes_pago`, `abonos_historial`) están bien conectadas con alta actividad

---

## ⚡ SECCIÓN 6: PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Eliminaciones seguras (sin riesgo)

**Tablas vacias + sin código:**

1. DROP TABLE `plantillas_proceso`
2. DROP TABLE `tipo_documento_mapping`
3. DROP TABLE `tipos_fuente_plantillas`
4. DROP TABLE `viviendas_historial_estados`
5. DROP TABLE `viviendas_historial_matriculas`
6. DROP TABLE `procesos_negociacion` (limpiar también el mapping en audit.service.ts)

**Vistas no usadas:** 7. DROP VIEW las 9 vistas listadas en Sección 2

**Trigger duplicado:** 8. DROP TRIGGER `trigger_proteger_categorias_sistema` en `categorias_documento` 9. DROP FUNCTION `proteger_categorias_sistema()` (si solo la usa ese trigger)

### Fase 2: Columnas a eliminar (bajo riesgo)

Requiere verificar que ningún trigger las referencia internamente: 10. ALTER TABLE `viviendas` DROP COLUMN (6 columnas de inactivación) 11. ALTER TABLE `documentos_cliente` DROP COLUMN `estado_documento`, `eliminado_en` 12. ALTER TABLE `documentos_proyecto` DROP COLUMN `eliminado_en` 13. ALTER TABLE `documentos_vivienda` DROP COLUMN `eliminado_en` 14. ALTER TABLE `negociaciones` DROP COLUMN `fecha_ultima_modificacion` 15. ALTER TABLE `documento_reemplazos_admin` DROP COLUMN `hash_anterior`, `hash_nuevo`, `fecha_reemplazo`

### Fase 3: Columnas conservadoras (evaluar después)

Estas podrían ser útiles en el futuro:

- `audit_log_seguridad.pais` — Si se implementa geolocalización
- `requisitos_fuentes_pago_config.prerrequisitos` — Si se implementan cadenas de requisitos
- `descuentos_negociacion.aplicado_por`, `aplicado_en` — Podrían usarse para auditoría
- `documentos_cliente.fecha_obsolescencia` — Si se retoma el sistema de obsolescencia

---

## 🛠️ SCRIPT DE LIMPIEZA

El script SQL de limpieza está en: `supabase/migrations/LIMPIEZA-AUDITORIA-2026-04.sql`

**⚠️ IMPORTANTE:** Ejecutar con `npm run db:exec` y hacer backup previo.
