# 🔍 Análisis del Schema Actual para Auditoría

**Fecha**: 4 de noviembre de 2025
**Objetivo**: Evaluar si necesitamos crear `audit_log` o extender `audit_log_seguridad`

---

## 📊 Estado Actual de la BD

### Tablas Existentes (17 totales)

#### ✅ **Tablas Core del Negocio**
1. **proyectos** → Proyectos de construcción
2. **manzanas** → Agrupación de viviendas
3. **viviendas** → Casas/unidades a vender
4. **clientes** → Base de clientes
5. **cliente_intereses** → Intereses de clientes
6. **negociaciones** → Ventas/negociaciones activas
7. **fuentes_pago** → Formas de pago (crédito, cuota inicial)
8. **abonos_historial** → Registro de pagos
9. **renuncias** → Renuncias de clientes

#### 🔄 **Tablas de Proceso**
10. **plantillas_proceso** → Templates de pasos
11. **procesos_negociacion** → Pasos de cada negociación

#### 📄 **Tablas de Documentos**
12. **categorias_documento** → Categorías de documentos
13. **documentos_proyecto** → Docs de proyectos
14. **documentos_cliente** → Docs de clientes

#### ⚙️ **Tablas de Configuración**
15. **configuracion_recargos** → Recargos del sistema
16. **usuarios** → Usuarios del sistema

#### 🔐 **Tabla de Auditoría EXISTENTE**
17. **audit_log_seguridad** ⭐

---

## 🔍 Análisis de `audit_log_seguridad` Existente

### Estructura Actual

```sql
CREATE TABLE audit_log_seguridad (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tipo de evento
  tipo varchar(50) NOT NULL,

  -- Usuario
  usuario_email varchar(255) NOT NULL,
  usuario_id uuid,

  -- Contexto técnico
  ip_address inet,
  user_agent text,
  pais varchar(100),
  ciudad varchar(100),

  -- Datos flexibles
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamp
  fecha_evento timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

### 📦 Campo `metadata` (jsonb) - Flexible

Actualmente puede almacenar CUALQUIER dato en formato JSON:

```json
{
  "timestamp_cliente": "2025-11-04T10:00:00Z",
  "url": "/dashboard",
  "intentos_fallidos": 3,
  "cualquier_otro_dato": "valor"
}
```

### ✅ **Ventajas de usar `audit_log_seguridad`**

1. **Ya existe** → No crear tabla duplicada
2. **Campo `metadata` flexible** → Puede almacenar datos de CUALQUIER módulo
3. **Campo `tipo` genérico** → Podemos usar:
   - `login_exitoso` (actual)
   - `vivienda_created` (nuevo)
   - `cliente_updated` (nuevo)
   - `negociacion_deleted` (nuevo)
4. **Infraestructura completa** → Ya tiene servicio TypeScript (`audit-log.service.ts`)

### ❌ **Desventajas de usar `audit_log_seguridad`**

1. **Nombre poco claro** → "seguridad" implica solo eventos de auth
2. **Sin columnas específicas** → No tiene `tabla`, `registro_id`, `accion` explícitas
3. **Sin campos `datos_anteriores` / `datos_nuevos`** → Habría que meter todo en `metadata`
4. **Dificulta queries específicas** → Buscar "todos los cambios en vivienda X" requiere filtrar JSON

---

## 🎯 Decisión: ¿Qué hacer?

### Opción A: **Renombrar y Extender `audit_log_seguridad`** ❌

**NO RECOMENDADO** porque:
- Cambiar nombre de tabla en producción es riesgoso
- Alterar estructura existente puede romper funcionalidad actual
- Migraciones complejas

---

### Opción B: **Crear nueva tabla `audit_log` separada** ✅ **RECOMENDADO**

**Ventajas**:
1. ✅ No tocamos tabla existente (sin riesgo)
2. ✅ Separación clara de responsabilidades:
   - `audit_log_seguridad` → Solo eventos de autenticación/seguridad
   - `audit_log` → Eventos de negocio (CRUD de módulos)
3. ✅ Estructura optimizada para auditoría de datos
4. ✅ Queries más eficientes (índices específicos)
5. ✅ Escalable a futuro

**Desventajas**:
- Una tabla adicional en la BD (mínimo)

---

## 📐 Propuesta: Estructura de `audit_log`

### Tabla Principal

```sql
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ¿QUÉ SE MODIFICÓ?
  tabla varchar(100) NOT NULL,              -- 'viviendas', 'clientes', 'negociaciones'
  accion varchar(20) NOT NULL,              -- 'CREATE', 'UPDATE', 'DELETE'
  registro_id uuid NOT NULL,                -- ID del registro afectado

  -- ¿QUIÉN LO HIZO?
  usuario_id uuid REFERENCES usuarios(id),
  usuario_email varchar(255) NOT NULL,
  usuario_rol varchar(50),                  -- Rol al momento de la acción

  -- ¿CUÁNDO?
  fecha_evento timestamp with time zone DEFAULT now(),

  -- ¿DÓNDE?
  ip_address inet,
  user_agent text,

  -- ¿QUÉ CAMBIÓ? (Lo más importante)
  datos_anteriores jsonb,                   -- Snapshot completo ANTES
  datos_nuevos jsonb,                       -- Snapshot completo DESPUÉS
  cambios_especificos jsonb,                -- Solo campos que cambiaron

  -- CONTEXTO ADICIONAL
  metadata jsonb DEFAULT '{}',
  modulo varchar(50),                       -- 'viviendas', 'clientes', etc.

  -- VALIDACIÓN
  CONSTRAINT valid_accion CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- Índices para búsqueda rápida
CREATE INDEX idx_audit_tabla ON audit_log(tabla);
CREATE INDEX idx_audit_registro_id ON audit_log(registro_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_fecha ON audit_log(fecha_evento DESC);
CREATE INDEX idx_audit_tabla_registro ON audit_log(tabla, registro_id);
CREATE INDEX idx_audit_modulo ON audit_log(modulo);
```

### Comparación con `audit_log_seguridad`

| Campo | `audit_log_seguridad` | `audit_log` (propuesta) |
|-------|----------------------|------------------------|
| **Propósito** | Eventos de autenticación | Eventos de negocio (CRUD) |
| **Tipo de evento** | `tipo` genérico | `tabla` + `accion` específicos |
| **Identificador** | En `metadata` | `registro_id` explícito |
| **Datos ANTES** | No tiene | `datos_anteriores` (jsonb) |
| **Datos DESPUÉS** | No tiene | `datos_nuevos` (jsonb) |
| **Cambios específicos** | No tiene | `cambios_especificos` (jsonb) |
| **Módulo** | No tiene | `modulo` explícito |
| **Usuario** | `usuario_email` + `usuario_id` | Mismo + `usuario_rol` |
| **Geolocalización** | `pais`, `ciudad` | Solo `ip_address` (simplificado) |

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Auditar creación de vivienda

```sql
INSERT INTO audit_log (
  tabla, accion, registro_id,
  usuario_id, usuario_email, usuario_rol,
  datos_anteriores, datos_nuevos,
  metadata, modulo
) VALUES (
  'viviendas',
  'CREATE',
  '123e4567-e89b-12d3-a456-426614174000',
  'user-uuid',
  'admin@ryrconstruc.com',
  'Administrador',
  NULL,  -- No hay datos anteriores en CREATE
  '{
    "numero": "101",
    "manzana_id": "...",
    "valor_base": 150000,
    "estado": "Disponible",
    "linderos": {
      "norte": "Calle principal",
      "sur": "Vivienda 102"
    }
  }'::jsonb,
  '{
    "proyecto_nombre": "Los Pinos",
    "manzana_nombre": "A"
  }'::jsonb,
  'viviendas'
);
```

### Ejemplo 2: Auditar actualización de cliente

```sql
INSERT INTO audit_log (
  tabla, accion, registro_id,
  usuario_id, usuario_email,
  datos_anteriores, datos_nuevos, cambios_especificos,
  modulo
) VALUES (
  'clientes',
  'UPDATE',
  'cliente-uuid',
  'user-uuid',
  'vendedor@ryrconstruc.com',
  '{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "0999999999",
    "email": "juan@example.com"
  }'::jsonb,
  '{
    "nombres": "Juan Carlos",
    "apellidos": "Pérez",
    "telefono": "0988888888",
    "email": "juan@example.com"
  }'::jsonb,
  '{
    "nombres": {"antes": "Juan", "despues": "Juan Carlos"},
    "telefono": {"antes": "0999999999", "despues": "0988888888"}
  }'::jsonb,
  'clientes'
);
```

### Ejemplo 3: Auditar eliminación de abono

```sql
INSERT INTO audit_log (
  tabla, accion, registro_id,
  usuario_id, usuario_email,
  datos_anteriores, datos_nuevos,
  metadata, modulo
) VALUES (
  'abonos_historial',
  'DELETE',
  'abono-uuid',
  'user-uuid',
  'admin@ryrconstruc.com',
  '{
    "monto": 5000,
    "fecha_abono": "2025-11-01",
    "metodo_pago": "Transferencia",
    "numero_referencia": "TRANS-12345"
  }'::jsonb,
  NULL,  -- No hay datos nuevos en DELETE
  '{
    "motivo": "Error en registro",
    "autorizacion": "Gerencia"
  }'::jsonb,
  'abonos'
);
```

---

## 🔎 Queries Útiles

### 1. Ver historial completo de una vivienda

```sql
SELECT
  fecha_evento,
  accion,
  usuario_email,
  cambios_especificos
FROM audit_log
WHERE tabla = 'viviendas'
  AND registro_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY fecha_evento DESC;
```

### 2. Ver actividad de un usuario específico

```sql
SELECT
  fecha_evento,
  tabla,
  accion,
  registro_id
FROM audit_log
WHERE usuario_id = 'user-uuid'
ORDER BY fecha_evento DESC
LIMIT 50;
```

### 3. Ver todos los cambios de precio en viviendas

```sql
SELECT
  fecha_evento,
  registro_id,
  usuario_email,
  cambios_especificos->'valor_base' AS cambio_precio
FROM audit_log
WHERE tabla = 'viviendas'
  AND accion = 'UPDATE'
  AND cambios_especificos ? 'valor_base'  -- Solo si cambió valor_base
ORDER BY fecha_evento DESC;
```

### 4. Ver eliminaciones masivas (posible fraude)

```sql
SELECT
  DATE(fecha_evento) AS fecha,
  usuario_email,
  tabla,
  COUNT(*) AS eliminaciones
FROM audit_log
WHERE accion = 'DELETE'
  AND fecha_evento >= NOW() - INTERVAL '7 days'
GROUP BY DATE(fecha_evento), usuario_email, tabla
HAVING COUNT(*) > 5  -- Más de 5 eliminaciones en un día
ORDER BY eliminaciones DESC;
```

---

## 📝 Tablas que DEBEN auditarse (Prioridad)

### 🔴 **CRÍTICAS** (implementar YA)

1. **viviendas**
   - `CREATE`, `UPDATE`, `DELETE`
   - Especial atención: cambios en `valor_base`, `estado`, `linderos`

2. **clientes**
   - `CREATE`, `UPDATE`, `DELETE`
   - Especial atención: cambios en datos personales, documentos

3. **negociaciones**
   - `CREATE`, `UPDATE`, `DELETE`
   - Especial atención: cambios de `estado`, `valor_total`, completar pasos

4. **abonos_historial**
   - `CREATE`, `UPDATE`, `DELETE`
   - **MUY CRÍTICO**: Involucra dinero

5. **fuentes_pago**
   - `CREATE`, `UPDATE`, `DELETE`
   - **MUY CRÍTICO**: Define condiciones de pago

### 🟡 **IMPORTANTES** (implementar pronto)

6. **renuncias**
   - `CREATE`, `UPDATE` (cambios de estado)
   - Importante para trazabilidad de devoluciones

7. **procesos_negociacion**
   - `UPDATE` (completar pasos, correcciones de fecha)
   - Ya parcialmente implementado en `correcciones.service.ts`

8. **usuarios**
   - `CREATE`, `UPDATE` (cambios de rol/permisos)
   - Crítico para seguridad

### 🟢 **OPCIONALES** (futuro)

9. **proyectos** → Solo cambios de estado
10. **manzanas** → Solo creación/eliminación
11. **documentos_*** → Solo creación/eliminación
12. **categorias_documento** → Cambios mínimos

---

## ✅ Recomendación Final

### Plan de acción:

1. **Crear tabla `audit_log`** con la estructura propuesta ✅
2. **Mantener `audit_log_seguridad`** para eventos de autenticación ✅
3. **Crear servicio TypeScript** `audit.service.ts` para uso fácil ✅
4. **Implementar auditoría** en módulos críticos (viviendas, clientes, negociaciones, abonos) ✅
5. **Crear UI** para consultar historial (fase 2) ⏭️

### Ventajas de este enfoque:

✅ **Sin riesgo** → No tocamos tabla existente
✅ **Separación clara** → Seguridad vs Negocio
✅ **Escalable** → Fácil agregar más tablas
✅ **Eficiente** → Índices optimizados para queries comunes
✅ **Flexible** → Campo `metadata` para datos adicionales

---

## 🚀 Siguiente paso

¿Procedemos a crear:

**A)** Script SQL para crear tabla `audit_log` + índices
**B)** Servicio TypeScript `audit.service.ts` con métodos helper
**C)** Ambos (A + B) y empezar a implementar en módulos críticos

¿Qué prefieres? 🎯
