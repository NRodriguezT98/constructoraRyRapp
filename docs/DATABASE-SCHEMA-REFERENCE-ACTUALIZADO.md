# 📚 DATABASE SCHEMA REFERENCE - RyR Constructora

> **🎯 FUENTE ÚNICA DE VERDAD - CONSULTAR SIEMPRE ANTES DE CODIFICAR**
>
> Este documento contiene la estructura EXACTA de la base de datos en producción.
> Todos los nombres de campos, tipos, constraints y valores permitidos están actualizados.

**Última actualización**: 2025-10-22 (POST-LIMPIEZA ELEMENTOS OBSOLETOS)
**Proyecto**: swyjhwgvkfcfdtemkyad
**Total de tablas**: 16 (eliminada: abonos)

---

## 📋 Índice Rápido

### 🔍 Consulta Rápida
- [Estados Permitidos (ENUMS)](#-estados-permitidos-enums)
- [Constraints Críticos](#-constraints-críticos)

### 📊 Tablas

### 📊 Tablas

1. [abonos_historial](#abonos_historial)
2. [audit_log_seguridad](#audit_log_seguridad)
3. [categorias_documento](#categorias_documento)
4. [cliente_intereses](#cliente_intereses)
5. [clientes](#clientes)
6. [configuracion_recargos](#configuracion_recargos)
7. [documentos_cliente](#documentos_cliente)
8. [documentos_proyecto](#documentos_proyecto)
9. [fuentes_pago](#fuentes_pago)
10. [manzanas](#manzanas)
11. [negociaciones](#negociaciones)
12. [plantillas_proceso](#plantillas_proceso)
13. [procesos_negociacion](#procesos_negociacion)
14. [proyectos](#proyectos)
15. [renuncias](#renuncias)
16. [viviendas](#viviendas)

---

## 🎨 Estados Permitidos (ENUMS)

> **⚠️ CRÍTICO**: Estos son los ÚNICOS valores válidos para campos de estado.
> Usar valores diferentes causará error en la base de datos.

### 📌 Clientes (`clientes.estado`)

| Estado | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| `'Interesado'` | ⭐ **DEFAULT** | Cliente recién registrado, sin negociación activa |
| `'Activo'` | Cliente con negociación en curso | Automático al crear negociación |
| `'En Proceso de Renuncia'` | Cliente tramitando renuncia | Al iniciar proceso de renuncia |
| `'Inactivo'` | Cliente sin actividad | Después de renuncia cerrada o cancelación |
| `'Propietario'` | Cliente con vivienda entregada | Automático cuando negociación se completa |

**Constraint**: `clientes_estado_check`
```sql
CHECK (estado IN ('Interesado', 'Activo', 'En Proceso de Renuncia', 'Inactivo', 'Propietario'))
```

---

### 📌 Negociaciones (`negociaciones.estado`)

| Estado | Descripción | Campos Requeridos |
|--------|-------------|-------------------|
| `'Activa'` | ⭐ **DEFAULT** | Negociación en proceso de pago | - |
| `'Suspendida'` | Negociación pausada temporalmente | - |
| `'Cerrada por Renuncia'` | Cliente renunció a la vivienda | `fecha_renuncia_efectiva` ⚠️ |
| `'Completada'` | Pago completo, lista para entrega | `fecha_completada` ⚠️ |

**Constraint**: `negociaciones_estado_check`
```sql
CHECK (estado IN ('Activa', 'Suspendida', 'Cerrada por Renuncia', 'Completada'))
```

**⚠️ Constraints Adicionales**:
- `negociaciones_completada_fecha`: Si `estado = 'Completada'` → `fecha_completada` es **OBLIGATORIO**
- `negociaciones_renuncia_fecha`: Si `estado = 'Cerrada por Renuncia'` → `fecha_renuncia_efectiva` es **OBLIGATORIO**

---

### 📌 Viviendas (`viviendas.estado`)

| Estado | Descripción | Campos Requeridos |
|--------|-------------|-------------------|
| `'Disponible'` | ⭐ **DEFAULT** | Vivienda sin asignar | `cliente_id = NULL`, `negociacion_id = NULL` |
| `'Asignada'` | Vivienda en negociación activa | `cliente_id` ⚠️, `negociacion_id` ⚠️, `fecha_asignacion` |
| `'Entregada'` | Vivienda entregada al propietario | `fecha_entrega` ⚠️ |

**Constraint**: `viviendas_estado_check`
```sql
CHECK (estado IN ('Disponible', 'Asignada', 'Entregada'))
```

**⚠️ Constraints Adicionales**:
- `viviendas_asignada_tiene_negociacion`: Si `estado = 'Asignada'` → `negociacion_id` es **OBLIGATORIO**
- Cuando `estado = 'Asignada'` → `cliente_id` debe tener valor

---

### 📌 Renuncias (`renuncias.estado`)

| Estado | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| `'Pendiente Devolución'` | ⭐ **DEFAULT** | Renuncia registrada, pago pendiente |
| `'Cerrada'` | Devolución completada | Después de devolver el monto |
| `'Cancelada'` | Renuncia anulada | Cliente decidió continuar con negociación |

**Constraint**: `renuncias_estado_check`
```sql
CHECK (estado IN ('Pendiente Devolución', 'Cerrada', 'Cancelada'))
```

---

### 📌 Fuentes de Pago (`fuentes_pago.estado`)

| Estado | Descripción |
|--------|-------------|
| `'Pendiente'` | ⭐ **DEFAULT** | Aprobación pendiente |
| `'En Proceso'` | Recibiendo abonos |
| `'Completada'` | Monto completo recibido |

**Constraint**: `fuentes_pago_estado_check`
```sql
CHECK (estado IN ('Pendiente', 'En Proceso', 'Completada'))
```

---

## 🔒 Constraints Críticos

### 🚨 Reglas de Integridad que DEBES conocer

#### 1️⃣ Negociaciones Completadas
```sql
negociaciones_completada_fecha
```
- **Si** `estado = 'Completada'`
- **Entonces** `fecha_completada` **NO PUEDE SER NULL**

#### 2️⃣ Negociaciones con Renuncia
```sql
negociaciones_renuncia_fecha
```
- **Si** `estado = 'Cerrada por Renuncia'`
- **Entonces** `fecha_renuncia_efectiva` **NO PUEDE SER NULL**

#### 3️⃣ Viviendas Asignadas
```sql
viviendas_asignada_tiene_negociacion
```
- **Si** `estado = 'Asignada'`
- **Entonces** `negociacion_id` **NO PUEDE SER NULL**

#### 4️⃣ Fuentes de Pago Completadas
```sql
fuentes_pago_completada_fecha
```
- **Si** `estado = 'Completada'`
- **Entonces** `fecha_completado` **NO PUEDE SER NULL**

---

## 📊 Tablas Detalladas

## 1. Tabla: `abonos_historial`

**Descripción**: Registro histórico de abonos a negociaciones por fuente de pago

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `negociacion_id` | uuid | NO | - |  |
| `fuente_pago_id` | uuid | NO | - |  |
| `monto` | numeric | NO | - |  |
| `fecha_abono` | timestamp with time zone | NO | - |  |
| `metodo_pago` | character varying(50) | NO | - |  |
| `numero_referencia` | character varying(100) | YES | - |  |
| `comprobante_url` | text | YES | - |  |
| `notas` | text | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_registro` | uuid | YES | - |  |

---

## 2. Tabla: `audit_log_seguridad`

**Descripción**: Tabla para gestión de audit_log_seguridad

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `tipo` | character varying(50) | NO | - |  |
| `usuario_email` | character varying(255) | NO | - |  |
| `usuario_id` | uuid | YES | - |  |
| `ip_address` | inet | YES | - |  |
| `user_agent` | text | YES | - |  |
| `metadata` | jsonb | YES | '{}'::jsonb |  |
| `pais` | character varying(100) | YES | - |  |
| `ciudad` | character varying(100) | YES | - |  |
| `fecha_evento` | timestamp with time zone | YES | CURRENT_TIMESTAMP |  |

---

## 4. Tabla: `categorias_documento`

**Descripción**: Tabla para gestión de categorias_documento

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `user_id` | uuid | NO | - |  |
| `nombre` | character varying(100) | NO | - |  |
| `descripcion` | text | YES | - |  |
| `color` | character varying(20) | YES | 'blue'::character varying |  |
| `icono` | character varying(50) | YES | 'Folder'::character varying |  |
| `orden` | integer | YES | 0 |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `modulos_permitidos` | ARRAY | NO | '{proyectos}'::text[] |  |
| `es_global` | boolean | NO | false |  |

---

## 5. Tabla: `cliente_intereses`

**Descripción**: Tabla para gestión de cliente_intereses

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `cliente_id` | uuid | NO | - |  |
| `proyecto_id` | uuid | NO | - |  |
| `vivienda_id` | uuid | YES | - |  |
| `notas` | text | YES | - |  |
| `estado` | character varying(20) | NO | 'Activo'::character varying |  |
| `motivo_descarte` | text | YES | - |  |
| `fecha_interes` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_creacion` | uuid | YES | - |  |
| `valor_estimado` | numeric | YES | - |  |
| `origen` | character varying(50) | YES | - |  |
| `prioridad` | character varying(20) | YES | 'Media'::character varying |  |
| `fecha_ultimo_contacto` | timestamp with time zone | YES | - |  |
| `proximo_seguimiento` | timestamp with time zone | YES | - |  |
| `negociacion_id` | uuid | YES | - |  |
| `fecha_conversion` | timestamp with time zone | YES | - |  |

---

## 6. Tabla: `clientes`

**Descripción**: Gestión de clientes y prospectos

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Identificador único |
| `nombres` | character varying(100) | NO | - | Nombres del cliente |
| `apellidos` | character varying(100) | NO | - | Apellidos del cliente |
| `nombre_completo` | character varying(200) | YES | - | Nombre completo concatenado |
| `tipo_documento` | character varying(10) | NO | 'CC'::character varying | Tipo: CC, TI, CE, PAS |
| `numero_documento` | character varying(20) | NO | - | ⚠️ ÚNICO por tipo_documento |
| `fecha_nacimiento` | date | YES | - | Fecha de nacimiento |
| `telefono` | character varying(20) | YES | - | Teléfono principal |
| `telefono_alternativo` | character varying(20) | YES | - | Teléfono secundario |
| `email` | character varying(100) | YES | - | Correo electrónico |
| `direccion` | text | YES | - | Dirección de residencia |
| `ciudad` | character varying(100) | YES | 'Cali'::character varying | Ciudad |
| `departamento` | character varying(100) | YES | 'Valle del Cauca'::character varying | Departamento |
| `estado` | character varying(20) | NO | 'Interesado'::character varying | **Ver [Estados de Clientes](#-clientes-clientesestado)** |
| `origen` | character varying(50) | YES | - | Canal de captación |
| `referido_por` | character varying(200) | YES | - | Nombre del referente |
| `documento_identidad_url` | text | YES | - | URL documento en storage |
| `notas` | text | YES | - | Observaciones generales |
| `fecha_creacion` | timestamp with time zone | NO | now() | Fecha de registro |
| `fecha_actualizacion` | timestamp with time zone | NO | now() | Última modificación |
| `usuario_creacion` | uuid | YES | - | Usuario que registró |

**Constraint Único**: `unique_documento_por_tipo`
- Combinación única: `(tipo_documento, numero_documento)`
- Evita duplicados de cédula/documento

**Estados Posibles**: Ver [Estados de Clientes](#-clientes-clientesestado)

---

## 7. Tabla: `configuracion_recargos`

**Descripción**: Configuración de recargos y valores variables del sistema

### 📌 Uso
Esta tabla almacena valores configurables que se usan en cálculos del sistema. Al crear una vivienda nueva, el sistema automáticamente obtiene el valor de `gastos_notariales` para calcular el `valor_total`.

### 💡 Datos Base Requeridos
Después de limpiar la base de datos, debe ejecutarse el script:
```sql
-- Ver: supabase/migrations/insertar-datos-configuracion-base.sql
INSERT INTO configuracion_recargos (tipo, nombre, valor, descripcion, activo) VALUES
  ('gastos_notariales', 'Gastos Notariales', 5000000, 'Gastos de escrituración y registro', true);
```

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Identificador único |
| `tipo` | character varying(50) | NO | - | Tipo de recargo (ej: 'gastos_notariales') |
| `nombre` | character varying(100) | NO | - | Nombre descriptivo |
| `valor` | numeric | NO | - | Valor del recargo (en pesos para gastos, porcentaje para otros) |
| `descripcion` | text | YES | - | Descripción detallada del recargo |
| `activo` | boolean | YES | true | Si el recargo está activo para usar en cálculos |
| `fecha_creacion` | timestamp with time zone | YES | now() | Fecha de creación del registro |
| `fecha_actualizacion` | timestamp with time zone | YES | now() | Última actualización |

### 🔍 Consultas Comunes

```sql
-- Obtener gastos notariales activos
SELECT valor FROM configuracion_recargos
WHERE tipo = 'gastos_notariales' AND activo = true;

-- Listar todas las configuraciones activas
SELECT tipo, nombre, valor FROM configuracion_recargos
WHERE activo = true ORDER BY tipo;
```

---

## 8. Tabla: `documentos_cliente`

**Descripción**: Tabla para gestión de documentos_cliente

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `cliente_id` | uuid | NO | - |  |
| `categoria_id` | uuid | YES | - |  |
| `titulo` | character varying(500) | NO | - |  |
| `descripcion` | text | YES | - |  |
| `nombre_archivo` | character varying(500) | NO | - |  |
| `nombre_original` | character varying(500) | NO | - |  |
| `tamano_bytes` | bigint | NO | - |  |
| `tipo_mime` | character varying(100) | NO | - |  |
| `url_storage` | text | NO | - |  |
| `etiquetas` | ARRAY | YES | - |  |
| `version` | integer | NO | 1 |  |
| `es_version_actual` | boolean | NO | true |  |
| `documento_padre_id` | uuid | YES | - |  |
| `estado` | character varying(50) | NO | 'activo'::character varying |  |
| `metadata` | jsonb | YES | '{}'::jsonb |  |
| `subido_por` | text | NO | - |  |
| `fecha_documento` | timestamp with time zone | YES | - |  |
| `fecha_vencimiento` | timestamp with time zone | YES | - |  |
| `es_importante` | boolean | YES | false |  |
| `fecha_creacion` | timestamp with time zone | YES | CURRENT_TIMESTAMP |  |
| `fecha_actualizacion` | timestamp with time zone | YES | CURRENT_TIMESTAMP |  |

---

## 9. Tabla: `documentos_proyecto`

**Descripción**: Tabla para gestión de documentos_proyecto

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `proyecto_id` | uuid | NO | - |  |
| `categoria_id` | uuid | YES | - |  |
| `titulo` | character varying(500) | NO | - |  |
| `descripcion` | text | YES | - |  |
| `nombre_archivo` | character varying(500) | NO | - |  |
| `nombre_original` | character varying(500) | NO | - |  |
| `tamano_bytes` | bigint | NO | - |  |
| `tipo_mime` | character varying(100) | NO | - |  |
| `url_storage` | text | NO | - |  |
| `etiquetas` | ARRAY | YES | - |  |
| `version` | integer | NO | 1 |  |
| `es_version_actual` | boolean | NO | true |  |
| `documento_padre_id` | uuid | YES | - |  |
| `estado` | character varying(50) | NO | 'activo'::character varying |  |
| `metadata` | jsonb | YES | - |  |
| `subido_por` | character varying(255) | NO | - |  |
| `fecha_documento` | timestamp with time zone | YES | - |  |
| `fecha_vencimiento` | timestamp with time zone | YES | - |  |
| `es_importante` | boolean | YES | false |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `fecha_actualizacion` | timestamp with time zone | YES | now() |  |

---

## 10. Tabla: `fuentes_pago`

**Descripción**: Fuentes de financiamiento de la negociación (Subsidios, Créditos, Recursos Propios)

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Identificador único |
| `negociacion_id` | uuid | NO | - | FK a negociaciones |
| `tipo` | character varying(50) | NO | - | Tipo: Subsidio, Crédito, Recursos Propios |
| `monto_aprobado` | numeric | NO | - | Monto total aprobado |
| `monto_recibido` | numeric | YES | 0 | Suma de abonos recibidos |
| `saldo_pendiente` | numeric | YES | - | Calculado: monto_aprobado - monto_recibido |
| `porcentaje_completado` | numeric | YES | - | % de pago recibido |
| `entidad` | character varying(100) | YES | - | Entidad financiera (si aplica) |
| `numero_referencia` | character varying(50) | YES | - | Número de referencia |
| `permite_multiples_abonos` | boolean | NO | false | ¿Permite abonos parciales? |
| `carta_aprobacion_url` | text | YES | - | URL carta de aprobación |
| `carta_asignacion_url` | text | YES | - | URL carta de asignación |
| `estado` | character varying(20) | NO | 'Pendiente'::character varying | **Ver [Estados de Fuentes de Pago](#-fuentes-de-pago-fuentes_pagoestado)** |
| `fecha_completado` | timestamp with time zone | YES | - | Fecha de completación |
| `fecha_creacion` | timestamp with time zone | NO | now() | Fecha de registro |
| `fecha_actualizacion` | timestamp with time zone | NO | now() | Última modificación |

**Estados Posibles**: Ver [Estados de Fuentes de Pago](#-fuentes-de-pago-fuentes_pagoestado)

**Constraint**: `fuentes_pago_completada_fecha`
- Si `estado='Completada'` → `fecha_completado` **NO NULL**

---

## 11. Tabla: `manzanas`

**Descripción**: Tabla para gestión de manzanas

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `proyecto_id` | uuid | NO | - |  |
| `nombre` | character varying(10) | NO | - |  |
| `numero_viviendas` | integer | NO | - |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |

---

## 12. Tabla: `negociaciones`

**Descripción**: Gestión del proceso de compra-venta de viviendas

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Identificador único |
| `cliente_id` | uuid | NO | - | FK a clientes |
| `vivienda_id` | uuid | NO | - | FK a viviendas |
| `estado` | character varying(30) | NO | 'Activa'::character varying | **Ver [Estados de Negociaciones](#-negociaciones-negociacionesestado)** ⚠️ |
| `valor_negociado` | numeric | NO | - | Precio acordado con cliente |
| `descuento_aplicado` | numeric | YES | 0 | Descuento en pesos |
| `valor_total` | numeric | YES | - | Calculado automáticamente por trigger |
| `total_fuentes_pago` | numeric | YES | 0 | Suma de fuentes aprobadas |
| `total_abonado` | numeric | YES | 0 | Suma de abonos recibidos |
| `saldo_pendiente` | numeric | YES | 0 | Calculado: valor_total - total_abonado |
| `porcentaje_pagado` | numeric | YES | 0 | % de pago completado |
| `fecha_negociacion` | timestamp with time zone | NO | now() | Fecha de creación |
| `fecha_completada` | timestamp with time zone | YES | - | **REQUERIDO si estado='Completada'** ⚠️ |
| `promesa_compraventa_url` | text | YES | - | URL documento promesa |
| `promesa_firmada_url` | text | YES | - | URL promesa firmada |
| `evidencia_envio_correo_url` | text | YES | - | URL evidencia envío |
| `escritura_url` | text | YES | - | URL escritura final |
| `otros_documentos` | jsonb | YES | - | Documentos adicionales |
| `notas` | text | YES | - | Observaciones |
| `fecha_creacion` | timestamp with time zone | NO | now() | Timestamp creación |
| `fecha_actualizacion` | timestamp with time zone | NO | now() | Última modificación |
| `usuario_creacion` | uuid | YES | - | Usuario que creó |
| `fecha_renuncia_efectiva` | timestamp with time zone | YES | - | **REQUERIDO si estado='Cerrada por Renuncia'** ⚠️ |

**Constraints Críticos**:
- `negociaciones_completada_fecha`: Si `estado='Completada'` → `fecha_completada` **NO NULL**
- `negociaciones_renuncia_fecha`: Si `estado='Cerrada por Renuncia'` → `fecha_renuncia_efectiva` **NO NULL**

**Estados Posibles**: Ver [Estados de Negociaciones](#-negociaciones-negociacionesestado)

**Triggers Activos**:
- `actualizar_totales_negociacion_trigger`: Recalcula totales al modificar fuentes/abonos
- `actualizar_estado_cliente_trigger`: Actualiza estado del cliente según negociación

---

## 13. Tabla: `plantillas_proceso`

**Descripción**: Tabla para gestión de plantillas_proceso

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `nombre` | character varying(200) | NO | - |  |
| `descripcion` | text | YES | - |  |
| `pasos` | jsonb | NO | - |  |
| `activo` | boolean | NO | true |  |
| `es_predeterminado` | boolean | NO | false |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_creacion` | uuid | YES | - |  |

---

## 14. Tabla: `procesos_negociacion`

**Descripción**: Tabla para gestión de procesos_negociacion

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `negociacion_id` | uuid | NO | - |  |
| `nombre` | character varying(200) | NO | - |  |
| `descripcion` | text | YES | - |  |
| `orden` | integer | NO | 1 |  |
| `es_obligatorio` | boolean | NO | true |  |
| `permite_omitir` | boolean | NO | false |  |
| `estado` | character varying(20) | NO | 'Pendiente'::character varying |  |
| `depende_de` | ARRAY | YES | - |  |
| `documentos_requeridos` | jsonb | YES | - |  |
| `documentos_urls` | jsonb | YES | - |  |
| `fecha_inicio` | timestamp with time zone | YES | - |  |
| `fecha_completado` | timestamp with time zone | YES | - |  |
| `fecha_limite` | timestamp with time zone | YES | - |  |
| `notas` | text | YES | - |  |
| `motivo_omision` | text | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_completo` | uuid | YES | - |  |

---

## 15. Tabla: `proyectos`

**Descripción**: Tabla para gestión de proyectos

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `nombre` | character varying(255) | NO | - |  |
| `descripcion` | text | NO | - |  |
| `ubicacion` | character varying(500) | NO | - |  |
| `fecha_inicio` | timestamp with time zone | NO | - |  |
| `fecha_fin_estimada` | timestamp with time zone | NO | - |  |
| `presupuesto` | numeric | NO | 0 |  |
| `estado` | character varying(50) | NO | 'en_planificacion'::character varying |  |
| `progreso` | integer | NO | 0 |  |
| `responsable` | character varying(255) | NO | - |  |
| `telefono` | character varying(50) | NO | - |  |
| `email` | character varying(255) | NO | - |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `fecha_actualizacion` | timestamp with time zone | YES | now() |  |
| `user_id` | uuid | YES | - |  |

---

## 16. Tabla: `renuncias`

**Descripción**: Registro de renuncias y devoluciones de dinero

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Identificador único |
| `vivienda_id` | uuid | NO | - | FK a viviendas |
| `cliente_id` | uuid | NO | - | FK a clientes |
| `motivo` | text | NO | - | Razón de la renuncia |
| `fecha_renuncia` | timestamp with time zone | NO | - | Fecha de registro |
| `monto_a_devolver` | numeric | NO | 0 | Monto a devolver al cliente |
| `estado` | character varying(50) | NO | 'Pendiente Devolución'::character varying | **Ver [Estados de Renuncias](#-renuncias-renunciasestado)** ⚠️ |
| `fecha_creacion` | timestamp with time zone | YES | now() | Timestamp creación |
| `fecha_actualizacion` | timestamp with time zone | YES | now() | Última modificación |
| `negociacion_id` | uuid | YES | - | FK a negociación relacionada |
| `vivienda_valor_snapshot` | numeric | YES | - | Valor vivienda al momento de renuncia |
| `abonos_snapshot` | jsonb | YES | - | Copia de abonos realizados |
| `requiere_devolucion` | boolean | NO | false | ¿Requiere devolución de dinero? |
| `fecha_devolucion` | timestamp with time zone | YES | - | Fecha efectiva de devolución |
| `comprobante_devolucion_url` | text | YES | - | URL del comprobante |
| `metodo_devolucion` | character varying(50) | YES | - | Método: Transferencia, Cheque, etc. |
| `numero_comprobante` | character varying(100) | YES | - | Número de referencia |
| `fecha_cancelacion` | timestamp with time zone | YES | - | Si se cancela la renuncia |
| `motivo_cancelacion` | text | YES | - | Razón de cancelación |
| `usuario_cancelacion` | uuid | YES | - | Usuario que canceló |
| `fecha_cierre` | timestamp with time zone | YES | - | Fecha de cierre definitivo |
| `usuario_registro` | uuid | YES | - | Usuario que registró |
| `usuario_cierre` | uuid | YES | - | Usuario que cerró |

**Estados Posibles**: Ver [Estados de Renuncias](#-renuncias-renunciasestado)

**Flujo Típico**:
1. `'Pendiente Devolución'` → Renuncia registrada, esperando devolución
2. `'Cerrada'` → Devolución completada
3. `'Cancelada'` → Cliente decidió continuar con negociación

---

## 16. Tabla: `viviendas`

**Descripción**: Inventario de viviendas y su estado de venta

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Identificador único |
| `manzana_id` | uuid | NO | - | FK a manzanas |
| `numero` | character varying(10) | NO | - | Número de vivienda |
| `estado` | character varying(50) | NO | 'Disponible'::character varying | **Ver [Estados de Viviendas](#-viviendas-viviendasestado)** ⚠️ |
| `area` | numeric | NO | - | Área total en m² |
| `cliente_id` | uuid | YES | - | **REQUERIDO si estado='Asignada'** ⚠️ |
| `fecha_creacion` | timestamp with time zone | YES | now() | Fecha de registro |
| `fecha_actualizacion` | timestamp with time zone | YES | now() | Última modificación |
| `lindero_norte` | text | YES | - | Lindero Norte |
| `lindero_sur` | text | YES | - | Lindero Sur |
| `lindero_oriente` | text | YES | - | Lindero Oriente |
| `lindero_occidente` | text | YES | - | Lindero Occidente |
| `matricula_inmobiliaria` | character varying(100) | YES | - | Matrícula inmobiliaria |
| `nomenclatura` | character varying(100) | YES | - | Dirección oficial |
| `area_lote` | numeric | YES | - | Área del lote en m² |
| `area_construida` | numeric | YES | - | Área construida en m² |
| `tipo_vivienda` | character varying(20) | YES | - | Tipo: Casa, Apartamento, etc. |
| `certificado_tradicion_url` | text | YES | - | URL certificado tradición |
| `valor_base` | numeric | NO | 0 | Precio base de vivienda |
| `es_esquinera` | boolean | YES | false | ¿Es esquinera? |
| `recargo_esquinera` | numeric | YES | 0 | Recargo adicional si es esquinera |
| `gastos_notariales` | numeric | YES | 5000000 | Gastos notariales estimados |
| `valor_total` | numeric | YES | - | Calculado: valor_base + recargos + gastos |
| `fecha_asignacion` | timestamp with time zone | YES | - | Fecha de asignación a cliente |
| `negociacion_id` | uuid | YES | - | **REQUERIDO si estado='Asignada'** ⚠️ FK a negociaciones |
| `fecha_entrega` | timestamp with time zone | YES | - | Fecha de entrega al propietario |

**Constraints Críticos**:
- `viviendas_asignada_tiene_negociacion`: Si `estado='Asignada'` → `negociacion_id` **NO NULL**
- Cuando `estado='Asignada'` → `cliente_id` debe tener valor

**Estados Posibles**: Ver [Estados de Viviendas](#-viviendas-viviendasestado)

---

## 📖 Guía de Uso

### 🎯 Cómo usar este documento

1. **ANTES de escribir código que interactúe con la DB**:
   - Consulta la sección [Estados Permitidos](#-estados-permitidos-enums)
   - Verifica los nombres EXACTOS de las columnas
   - Revisa los [Constraints Críticos](#-constraints-críticos)

2. **Al crear queries**:
   - Usa los nombres de campo EXACTOS (case-sensitive en algunos contextos)
   - Respeta los valores de estado documentados
   - Verifica constraints antes de inserts/updates

3. **Al diseñar flujos**:
   - Consulta los flujos típicos documentados en cada tabla
   - Respeta las transiciones de estado permitidas
   - Considera los triggers automáticos

### 🔄 Flujos de Estado Recomendados

#### Crear Negociación
```
1. Cliente: Interesado → Activo
2. Negociación: → Activa (default)
3. Vivienda: Disponible → Asignada
   - Se asignan: cliente_id, negociacion_id, fecha_asignacion
```

#### Completar Negociación
```
1. Negociación: Activa → Completada
   - Requiere: fecha_completada
   - Trigger actualiza: total_abonado = valor_total
2. Cliente: Activo → Propietario
3. Vivienda: Asignada → Entregada
   - Requiere: fecha_entrega
```

#### Procesar Renuncia
```
1. Cliente: Activo → En Proceso de Renuncia
2. Crear registro en tabla `renuncias`
   - Estado: Pendiente Devolución
3. Negociación: Activa → Cerrada por Renuncia
   - Requiere: fecha_renuncia_efectiva
4. Vivienda: Asignada → Disponible
   - Se limpian: cliente_id, negociacion_id
5. Renuncia: Pendiente Devolución → Cerrada
   - Después de devolver el monto
6. Cliente: En Proceso de Renuncia → Inactivo
```

#### Suspender Negociación
```
1. Negociación: Activa → Suspendida
   - Opcional: notas con motivo
2. Cliente: Activo (se mantiene)
3. Vivienda: Asignada (se mantiene)

Reactivar:
1. Negociación: Suspendida → Activa
```

### 🔍 Campos Calculados Automáticamente (Triggers)

**Tabla: `negociaciones`**
- `valor_total` = `valor_negociado` - `descuento_aplicado`
- `total_fuentes_pago` = SUM(fuentes_pago.monto_aprobado)
- `total_abonado` = SUM(abonos_historial.monto)
- `saldo_pendiente` = `valor_total` - `total_abonado`
- `porcentaje_pagado` = (`total_abonado` / `valor_total`) * 100

**Tabla: `fuentes_pago`**
- `monto_recibido` = SUM(abonos_historial.monto WHERE fuente_pago_id = id)
- `saldo_pendiente` = `monto_aprobado` - `monto_recibido`
- `porcentaje_completado` = (`monto_recibido` / `monto_aprobado`) * 100

**Tabla: `viviendas`**
- `valor_total` = `valor_base` + `recargo_esquinera` + `gastos_notariales`

### 📝 Convenciones de Nombrado

- **Tablas**: snake_case, plural (`clientes`, `negociaciones`)
- **Columnas**: snake_case (`nombre_completo`, `fecha_creacion`)
- **Estados**: PascalCase con espacios (`'Activa'`, `'Cerrada por Renuncia'`)
- **Foreign Keys**: sufijo `_id` (`cliente_id`, `negociacion_id`)
- **URLs**: sufijo `_url` (`comprobante_url`, `escritura_url`)
- **Timestamps**: prefijo `fecha_` (`fecha_creacion`, `fecha_completada`)

### 🎨 Formato de Valores

- **Montos**: `numeric` sin decimales especificados (usar 2 decimales en UI)
- **Porcentajes**: `numeric` como decimal (0.85 = 85%)
- **Booleanos**: `true`/`false` en PostgreSQL
- **Fechas**: ISO 8601 con timezone (`2025-10-22T10:30:00.000Z`)
- **UUIDs**: Generados con `gen_random_uuid()` o `uuid_generate_v4()`

---

## 🚨 Errores Comunes a Evitar

❌ **ERROR**: Usar `estado = 'En Proceso'` en negociaciones
✅ **CORRECTO**: Usar `estado = 'Activa'`

❌ **ERROR**: Actualizar vivienda a `estado = 'reservada'`
✅ **CORRECTO**: Usar `estado = 'Asignada'`

❌ **ERROR**: Crear negociación sin asignar `negociacion_id` a vivienda
✅ **CORRECTO**: Actualizar vivienda con `negociacion_id` cuando `estado='Asignada'`

❌ **ERROR**: Completar negociación sin `fecha_completada`
✅ **CORRECTO**: Incluir `fecha_completada` cuando `estado='Completada'`

❌ **ERROR**: Cerrar por renuncia sin `fecha_renuncia_efectiva`
✅ **CORRECTO**: Incluir `fecha_renuncia_efectiva` cuando `estado='Cerrada por Renuncia'`

❌ **ERROR**: Asumir nombres de campos sin verificar
✅ **CORRECTO**: Consultar SIEMPRE este documento

---

## 📚 Documentos Relacionados

- **Checklist de Desarrollo**: `docs/DESARROLLO-CHECKLIST.md`
- **Guía de Estilos**: `docs/GUIA-ESTILOS.md`
- **Arquitectura**: `ARCHITECTURE.md`
- **Template de Módulos**: `MODULE_TEMPLATE.md`

---

**🎯 Última Actualización**: 2025-10-22 (POST-MIGRACIÓN)
**📍 Fuente de Verdad**: Este documento refleja el estado EXACTO de la base de datos en producción.
