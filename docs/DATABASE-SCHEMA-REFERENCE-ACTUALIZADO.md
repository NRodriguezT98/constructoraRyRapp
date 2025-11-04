# 📚 DATABASE SCHEMA REFERENCE - RyR Constructora

**Última actualización**: 2025-11-04 09:26:50
**Proyecto**: swyjhwgvkfcfdtemkyad
**Total de tablas**: 18

---

## 📋 Índice

1. [abonos_historial](#abonos_historial)
2. [audit_log](#audit_log)
3. [audit_log_seguridad](#audit_log_seguridad)
4. [categorias_documento](#categorias_documento)
5. [cliente_intereses](#cliente_intereses)
6. [clientes](#clientes)
7. [configuracion_recargos](#configuracion_recargos)
8. [documentos_cliente](#documentos_cliente)
9. [documentos_proyecto](#documentos_proyecto)
10. [fuentes_pago](#fuentes_pago)
11. [manzanas](#manzanas)
12. [negociaciones](#negociaciones)
13. [plantillas_proceso](#plantillas_proceso)
14. [procesos_negociacion](#procesos_negociacion)
15. [proyectos](#proyectos)
16. [renuncias](#renuncias)
17. [usuarios](#usuarios)
18. [viviendas](#viviendas)

---

## 1. Tabla: `abonos_historial`

**Descripción**: Tabla para gestión de abonos_historial

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

## 2. Tabla: `audit_log`

**Descripción**: Tabla para gestión de audit_log

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `tabla` | character varying(100) | NO | - |  |
| `accion` | character varying(20) | NO | - |  |
| `registro_id` | uuid | NO | - |  |
| `usuario_id` | uuid | YES | - |  |
| `usuario_email` | character varying(255) | NO | - |  |
| `usuario_rol` | character varying(50) | YES | - |  |
| `fecha_evento` | timestamp with time zone | NO | now() |  |
| `ip_address` | inet | YES | - |  |
| `user_agent` | text | YES | - |  |
| `datos_anteriores` | jsonb | YES | - |  |
| `datos_nuevos` | jsonb | YES | - |  |
| `cambios_especificos` | jsonb | YES | - |  |
| `metadata` | jsonb | YES | '{}'::jsonb |  |
| `modulo` | character varying(50) | YES | - |  |

---

## 3. Tabla: `audit_log_seguridad`

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

**Descripción**: Tabla para gestión de clientes

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `nombres` | character varying(100) | NO | - |  |
| `apellidos` | character varying(100) | NO | - |  |
| `nombre_completo` | character varying(200) | YES | - |  |
| `tipo_documento` | character varying(10) | NO | 'CC'::character varying |  |
| `numero_documento` | character varying(20) | NO | - |  |
| `fecha_nacimiento` | date | YES | - |  |
| `telefono` | character varying(20) | YES | - |  |
| `telefono_alternativo` | character varying(20) | YES | - |  |
| `email` | character varying(100) | YES | - |  |
| `direccion` | text | YES | - |  |
| `ciudad` | character varying(100) | YES | 'Cali'::character varying |  |
| `departamento` | character varying(100) | YES | 'Valle del Cauca'::character varying |  |
| `estado` | character varying(20) | NO | 'Interesado'::character varying |  |
| `origen` | character varying(50) | YES | - |  |
| `referido_por` | character varying(200) | YES | - |  |
| `documento_identidad_url` | text | YES | - |  |
| `notas` | text | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_creacion` | uuid | YES | - |  |
| `documento_identidad_titulo` | character varying(200) | YES | - |  |

---

## 7. Tabla: `configuracion_recargos`

**Descripción**: Tabla para gestión de configuracion_recargos

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `tipo` | character varying(50) | NO | - |  |
| `nombre` | character varying(100) | NO | - |  |
| `valor` | numeric | NO | - |  |
| `descripcion` | text | YES | - |  |
| `activo` | boolean | YES | true |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `fecha_actualizacion` | timestamp with time zone | YES | now() |  |

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

**Descripción**: Tabla para gestión de fuentes_pago

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `negociacion_id` | uuid | NO | - |  |
| `tipo` | character varying(50) | NO | - |  |
| `monto_aprobado` | numeric | NO | - |  |
| `monto_recibido` | numeric | YES | 0 |  |
| `saldo_pendiente` | numeric | YES | - |  |
| `porcentaje_completado` | numeric | YES | - |  |
| `entidad` | character varying(100) | YES | - |  |
| `numero_referencia` | character varying(50) | YES | - |  |
| `permite_multiples_abonos` | boolean | NO | false |  |
| `carta_aprobacion_url` | text | YES | - |  |
| `carta_asignacion_url` | text | YES | - |  |
| `estado` | character varying(20) | NO | 'Pendiente'::character varying |  |
| `fecha_completado` | timestamp with time zone | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |

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

**Descripción**: Tabla para gestión de negociaciones

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() |  |
| `cliente_id` | uuid | NO | - |  |
| `vivienda_id` | uuid | NO | - |  |
| `estado` | character varying(30) | NO | 'En Proceso'::character varying |  |
| `valor_negociado` | numeric | NO | - |  |
| `descuento_aplicado` | numeric | YES | 0 |  |
| `valor_total` | numeric | YES | - |  |
| `total_fuentes_pago` | numeric | YES | 0 |  |
| `total_abonado` | numeric | YES | 0 |  |
| `saldo_pendiente` | numeric | YES | 0 |  |
| `porcentaje_pagado` | numeric | YES | 0 |  |
| `fecha_negociacion` | timestamp with time zone | NO | now() |  |
| `fecha_completada` | timestamp with time zone | YES | - |  |
| `promesa_compraventa_url` | text | YES | - |  |
| `promesa_firmada_url` | text | YES | - |  |
| `evidencia_envio_correo_url` | text | YES | - |  |
| `escritura_url` | text | YES | - |  |
| `otros_documentos` | jsonb | YES | - |  |
| `notas` | text | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `usuario_creacion` | uuid | YES | - |  |
| `fecha_renuncia_efectiva` | timestamp with time zone | YES | - |  |

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

**Descripción**: Tabla para gestión de renuncias

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `vivienda_id` | uuid | NO | - |  |
| `cliente_id` | uuid | NO | - |  |
| `motivo` | text | NO | - |  |
| `fecha_renuncia` | timestamp with time zone | NO | - |  |
| `monto_a_devolver` | numeric | NO | 0 |  |
| `estado` | character varying(50) | NO | 'pendiente'::character varying |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `fecha_actualizacion` | timestamp with time zone | YES | now() |  |
| `negociacion_id` | uuid | YES | - |  |
| `vivienda_valor_snapshot` | numeric | YES | - |  |
| `abonos_snapshot` | jsonb | YES | - |  |
| `requiere_devolucion` | boolean | NO | false |  |
| `fecha_devolucion` | timestamp with time zone | YES | - |  |
| `comprobante_devolucion_url` | text | YES | - |  |
| `metodo_devolucion` | character varying(50) | YES | - |  |
| `numero_comprobante` | character varying(100) | YES | - |  |
| `fecha_cancelacion` | timestamp with time zone | YES | - |  |
| `motivo_cancelacion` | text | YES | - |  |
| `usuario_cancelacion` | uuid | YES | - |  |
| `fecha_cierre` | timestamp with time zone | YES | - |  |
| `usuario_registro` | uuid | YES | - |  |
| `usuario_cierre` | uuid | YES | - |  |

---

## 17. Tabla: `usuarios`

**Descripción**: Tabla para gestión de usuarios

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | - |  |
| `email` | character varying(255) | NO | - |  |
| `nombres` | character varying(100) | NO | - |  |
| `apellidos` | character varying(100) | NO | - |  |
| `telefono` | character varying(20) | YES | - |  |
| `rol` | USER-DEFINED | NO | 'Vendedor'::rol_usuario |  |
| `estado` | USER-DEFINED | NO | 'Activo'::estado_usuario |  |
| `avatar_url` | text | YES | - |  |
| `preferencias` | jsonb | YES | '{}'::jsonb |  |
| `creado_por` | uuid | YES | - |  |
| `ultimo_acceso` | timestamp with time zone | YES | - |  |
| `fecha_creacion` | timestamp with time zone | NO | now() |  |
| `fecha_actualizacion` | timestamp with time zone | NO | now() |  |
| `debe_cambiar_password` | boolean | NO | false |  |
| `intentos_fallidos` | integer | NO | 0 |  |
| `bloqueado_hasta` | timestamp with time zone | YES | - |  |

---

## 18. Tabla: `viviendas`

**Descripción**: Tabla para gestión de viviendas

### Columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() |  |
| `manzana_id` | uuid | NO | - |  |
| `numero` | character varying(10) | NO | - |  |
| `estado` | character varying(50) | NO | 'disponible'::character varying |  |
| `area` | numeric | NO | - |  |
| `cliente_id` | uuid | YES | - |  |
| `fecha_creacion` | timestamp with time zone | YES | now() |  |
| `fecha_actualizacion` | timestamp with time zone | YES | now() |  |
| `lindero_norte` | text | YES | - |  |
| `lindero_sur` | text | YES | - |  |
| `lindero_oriente` | text | YES | - |  |
| `lindero_occidente` | text | YES | - |  |
| `matricula_inmobiliaria` | character varying(100) | YES | - |  |
| `nomenclatura` | character varying(100) | YES | - |  |
| `area_lote` | numeric | YES | - |  |
| `area_construida` | numeric | YES | - |  |
| `tipo_vivienda` | character varying(20) | YES | - |  |
| `certificado_tradicion_url` | text | YES | - |  |
| `valor_base` | numeric | NO | 0 |  |
| `es_esquinera` | boolean | YES | false |  |
| `recargo_esquinera` | numeric | YES | 0 |  |
| `gastos_notariales` | numeric | YES | 5000000 |  |
| `valor_total` | numeric | YES | - |  |
| `fecha_asignacion` | timestamp with time zone | YES | - |  |
| `negociacion_id` | uuid | YES | - |  |
| `fecha_entrega` | timestamp with time zone | YES | - |  |

---

