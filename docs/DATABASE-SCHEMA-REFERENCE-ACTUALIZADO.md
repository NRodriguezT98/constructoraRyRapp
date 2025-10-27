# DATABASE SCHEMA REFERENCE - RyR Constructora

**Ultima actualizacion:** 2025-10-27 10:17:58
**Generado automaticamente desde la base de datos**

---

## TABLAS Y CAMPOS

### TABLA: `abonos_historial`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `negociacion_id` | uuid | **NO (Requerido)** | - | - |
| `fuente_pago_id` | uuid | **NO (Requerido)** | - | - |
| `monto` | numeric(15) | **NO (Requerido)** | - | Monto del abono individual. La suma de todos los abonos actualiza monto_recibido en fuentes_pago |
| `fecha_abono` | timestamp with time zone | **NO (Requerido)** | - | - |
| `metodo_pago` | character varying(50) | **NO (Requerido)** | - | Método utilizado para realizar el pago |
| `numero_referencia` | character varying(100) | Si | - | Número de transacción |
| `comprobante_url` | text | Si | - | URL del comprobante de pago almacenado en Supabase Storage |
| `notas` | text | Si | - | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_registro` | uuid | Si | - | - |


### TABLA: `audit_log_seguridad`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `tipo` | character varying(50) | **NO (Requerido)** | - | Tipo de evento de seguridad |
| `usuario_email` | character varying(255) | **NO (Requerido)** | - | Email del usuario (puede no existir en BD si es intento fallido) |
| `usuario_id` | uuid | Si | - | FK a auth.users si el usuario existe |
| `ip_address` | inet | Si | - | Dirección IP desde donde se originó el evento |
| `user_agent` | text | Si | - | User-Agent del navegador |
| `metadata` | jsonb | Si | `'{}'::jsonb` | Información adicional en JSON (intentos |
| `pais` | character varying(100) | Si | - | - |
| `ciudad` | character varying(100) | Si | - | - |
| `fecha_evento` | timestamp with time zone | Si | `CURRENT_TIMESTAMP` | - |


### TABLA: `categorias_documento`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `user_id` | uuid | **NO (Requerido)** | - | - |
| `nombre` | character varying(100) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `color` | character varying(20) | Si | `'blue'::character varying` | - |
| `icono` | character varying(50) | Si | `'Folder'::character varying` | - |
| `orden` | integer(32) | Si | `0` | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `modulos_permitidos` | ARRAY | **NO (Requerido)** | `'{proyectos}'::text[]` | Array de modulos donde esta disponible la categoria: ["proyectos"] |
| `es_global` | boolean | **NO (Requerido)** | `false` | Si es TRUE |


### TABLA: `cliente_intereses`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `cliente_id` | uuid | **NO (Requerido)** | - | - |
| `proyecto_id` | uuid | **NO (Requerido)** | - | - |
| `vivienda_id` | uuid | Si | - | - |
| `notas` | text | Si | - | - |
| `estado` | character varying(20) | **NO (Requerido)** | `'Activo'::character varying` | Activo: interés vigente | Descartado: cliente ya no interesado | Convertido: se concretó la venta |
| `motivo_descarte` | text | Si | - | - |
| `fecha_interes` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_creacion` | uuid | Si | - | - |
| `valor_estimado` | numeric(15) | Si | - | - |
| `origen` | character varying(50) | Si | - | - |
| `prioridad` | character varying(20) | Si | `'Media'::character varying` | - |
| `fecha_ultimo_contacto` | timestamp with time zone | Si | - | - |
| `proximo_seguimiento` | timestamp with time zone | Si | - | - |
| `negociacion_id` | uuid | Si | - | - |
| `fecha_conversion` | timestamp with time zone | Si | - | - |


### TABLA: `clientes`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `nombres` | character varying(100) | **NO (Requerido)** | - | - |
| `apellidos` | character varying(100) | **NO (Requerido)** | - | - |
| `nombre_completo` | character varying(200) | Si | - | - |
| `tipo_documento` | character varying(10) | **NO (Requerido)** | `'CC'::character varying` | - |
| `numero_documento` | character varying(20) | **NO (Requerido)** | - | - |
| `fecha_nacimiento` | date | Si | - | - |
| `telefono` | character varying(20) | Si | - | - |
| `telefono_alternativo` | character varying(20) | Si | - | - |
| `email` | character varying(100) | Si | - | - |
| `direccion` | text | Si | - | - |
| `ciudad` | character varying(100) | Si | `'Cali'::character varying` | - |
| `departamento` | character varying(100) | Si | `'Valle del Cauca'::character varying` | - |
| `estado` | character varying(20) | **NO (Requerido)** | `'Interesado'::character varying` | Estado del cliente. REGLA: Cliente Activo debe tener al menos 1 negociación con estado Activa. Cliente Propietario debe tener al menos 1 negociación Completada. |
| `origen` | character varying(50) | Si | - | - |
| `referido_por` | character varying(200) | Si | - | - |
| `documento_identidad_url` | text | Si | - | - |
| `notas` | text | Si | - | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_creacion` | uuid | Si | - | - |
| `documento_identidad_titulo` | character varying(200) | Si | - | Título personalizado para mostrar el documento de identidad. Si es NULL |


### TABLA: `configuracion_recargos`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `tipo` | character varying(50) | **NO (Requerido)** | - | - |
| `nombre` | character varying(100) | **NO (Requerido)** | - | - |
| `valor` | numeric(15) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `activo` | boolean | Si | `true` | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `now()` | - |


### TABLA: `documentos_cliente`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `cliente_id` | uuid | **NO (Requerido)** | - | FK al cliente dueño del documento |
| `categoria_id` | uuid | Si | - | FK a categoria_documento (compartida con proyectos) |
| `titulo` | character varying(500) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `nombre_archivo` | character varying(500) | **NO (Requerido)** | - | - |
| `nombre_original` | character varying(500) | **NO (Requerido)** | - | - |
| `tamano_bytes` | bigint(64) | **NO (Requerido)** | - | - |
| `tipo_mime` | character varying(100) | **NO (Requerido)** | - | - |
| `url_storage` | text | **NO (Requerido)** | - | Path en Supabase Storage: {user_id}/{cliente_id}/{nombre_archivo} |
| `etiquetas` | ARRAY | Si | - | - |
| `version` | integer(32) | **NO (Requerido)** | `1` | Número de versión del documento |
| `es_version_actual` | boolean | **NO (Requerido)** | `true` | TRUE si es la versión más reciente |
| `documento_padre_id` | uuid | Si | - | FK al documento original si es una versión |
| `estado` | character varying(50) | **NO (Requerido)** | `'activo'::character varying` | activo |
| `metadata` | jsonb | Si | `'{}'::jsonb` | - |
| `subido_por` | text | **NO (Requerido)** | - | UUID del usuario que subió el documento |
| `fecha_documento` | timestamp with time zone | Si | - | - |
| `fecha_vencimiento` | timestamp with time zone | Si | - | - |
| `es_importante` | boolean | Si | `false` | - |
| `fecha_creacion` | timestamp with time zone | Si | `CURRENT_TIMESTAMP` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `CURRENT_TIMESTAMP` | - |


### TABLA: `documentos_proyecto`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `proyecto_id` | uuid | **NO (Requerido)** | - | - |
| `categoria_id` | uuid | Si | - | - |
| `titulo` | character varying(500) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `nombre_archivo` | character varying(500) | **NO (Requerido)** | - | - |
| `nombre_original` | character varying(500) | **NO (Requerido)** | - | - |
| `tamano_bytes` | bigint(64) | **NO (Requerido)** | - | - |
| `tipo_mime` | character varying(100) | **NO (Requerido)** | - | - |
| `url_storage` | text | **NO (Requerido)** | - | - |
| `etiquetas` | ARRAY | Si | - | - |
| `version` | integer(32) | **NO (Requerido)** | `1` | - |
| `es_version_actual` | boolean | **NO (Requerido)** | `true` | - |
| `documento_padre_id` | uuid | Si | - | - |
| `estado` | character varying(50) | **NO (Requerido)** | `'activo'::character varying` | - |
| `metadata` | jsonb | Si | - | - |
| `subido_por` | character varying(255) | **NO (Requerido)** | - | - |
| `fecha_documento` | timestamp with time zone | Si | - | - |
| `fecha_vencimiento` | timestamp with time zone | Si | - | - |
| `es_importante` | boolean | Si | `false` | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `now()` | - |


### TABLA: `fuentes_pago`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `negociacion_id` | uuid | **NO (Requerido)** | - | - |
| `tipo` | character varying(50) | **NO (Requerido)** | - | - |
| `monto_aprobado` | numeric(15) | **NO (Requerido)** | - | - |
| `monto_recibido` | numeric(15) | Si | `0` | - |
| `saldo_pendiente` | numeric(15) | Si | - | - |
| `porcentaje_completado` | numeric(5) | Si | - | - |
| `entidad` | character varying(100) | Si | - | - |
| `numero_referencia` | character varying(50) | Si | - | - |
| `permite_multiples_abonos` | boolean | **NO (Requerido)** | `false` | true para Cuota Inicial |
| `carta_aprobacion_url` | text | Si | - | - |
| `carta_asignacion_url` | text | Si | - | - |
| `estado` | character varying(20) | **NO (Requerido)** | `'Pendiente'::character varying` | - |
| `fecha_completado` | timestamp with time zone | Si | - | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |


### TABLA: `intereses_completos`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `cliente_id` | uuid | Si | - | - |
| `proyecto_id` | uuid | Si | - | - |
| `vivienda_id` | uuid | Si | - | - |
| `notas` | text | Si | - | - |
| `estado` | character varying(20) | Si | - | - |
| `motivo_descarte` | text | Si | - | - |
| `fecha_interes` | timestamp with time zone | Si | - | - |
| `fecha_actualizacion` | timestamp with time zone | Si | - | - |
| `usuario_creacion` | uuid | Si | - | - |
| `valor_estimado` | numeric(15) | Si | - | - |
| `origen` | character varying(50) | Si | - | - |
| `prioridad` | character varying(20) | Si | - | - |
| `fecha_ultimo_contacto` | timestamp with time zone | Si | - | - |
| `proximo_seguimiento` | timestamp with time zone | Si | - | - |
| `negociacion_id` | uuid | Si | - | - |
| `fecha_conversion` | timestamp with time zone | Si | - | - |
| `cliente_nombre` | character varying(100) | Si | - | - |
| `cliente_apellido` | character varying(100) | Si | - | - |
| `nombre_completo` | character varying(200) | Si | - | - |
| `cliente_email` | character varying(100) | Si | - | - |
| `cliente_telefono` | character varying(20) | Si | - | - |
| `cliente_documento` | character varying(20) | Si | - | - |
| `proyecto_nombre` | character varying(255) | Si | - | - |
| `proyecto_estado` | character varying(50) | Si | - | - |
| `vivienda_numero` | character varying(10) | Si | - | - |
| `vivienda_valor` | numeric(15) | Si | - | - |
| `vivienda_estado` | character varying(50) | Si | - | - |
| `manzana_nombre` | character varying(10) | Si | - | - |
| `dias_desde_interes` | numeric | Si | - | - |
| `seguimiento_urgente` | boolean | Si | - | - |


### TABLA: `manzanas`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `proyecto_id` | uuid | **NO (Requerido)** | - | - |
| `nombre` | character varying(10) | **NO (Requerido)** | - | - |
| `numero_viviendas` | integer(32) | **NO (Requerido)** | - | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |


### TABLA: `negociaciones`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `cliente_id` | uuid | **NO (Requerido)** | - | - |
| `vivienda_id` | uuid | **NO (Requerido)** | - | - |
| `estado` | character varying(30) | **NO (Requerido)** | `'En Proceso'::character varying` | En Proceso â†’ Cierre Financiero â†’ Activa â†’ Completada/Cancelada/Renuncia |
| `valor_negociado` | numeric(15) | **NO (Requerido)** | - | - |
| `descuento_aplicado` | numeric(15) | Si | `0` | - |
| `valor_total` | numeric(15) | Si | - | - |
| `total_fuentes_pago` | numeric(15) | Si | `0` | - |
| `total_abonado` | numeric(15) | Si | `0` | - |
| `saldo_pendiente` | numeric(15) | Si | `0` | - |
| `porcentaje_pagado` | numeric(5) | Si | `0` | - |
| `fecha_negociacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_completada` | timestamp with time zone | Si | - | Fecha en que la negociación/venta se completó al 100% (requerida si estado = Completada) |
| `promesa_compraventa_url` | text | Si | - | - |
| `promesa_firmada_url` | text | Si | - | - |
| `evidencia_envio_correo_url` | text | Si | - | - |
| `escritura_url` | text | Si | - | - |
| `otros_documentos` | jsonb | Si | - | - |
| `notas` | text | Si | - | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_creacion` | uuid | Si | - | - |
| `fecha_renuncia_efectiva` | timestamp with time zone | Si | - | Fecha en que la renuncia se hizo efectiva (requerida si estado = Cerrada por Renuncia) |


### TABLA: `plantillas_proceso`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `nombre` | character varying(200) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `pasos` | jsonb | **NO (Requerido)** | - | - |
| `activo` | boolean | **NO (Requerido)** | `true` | - |
| `es_predeterminado` | boolean | **NO (Requerido)** | `false` | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_creacion` | uuid | Si | - | - |


### TABLA: `procesos_negociacion`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `gen_random_uuid()` | - |
| `negociacion_id` | uuid | **NO (Requerido)** | - | - |
| `nombre` | character varying(200) | **NO (Requerido)** | - | - |
| `descripcion` | text | Si | - | - |
| `orden` | integer(32) | **NO (Requerido)** | `1` | - |
| `es_obligatorio` | boolean | **NO (Requerido)** | `true` | - |
| `permite_omitir` | boolean | **NO (Requerido)** | `false` | - |
| `estado` | character varying(20) | **NO (Requerido)** | `'Pendiente'::character varying` | - |
| `depende_de` | ARRAY | Si | - | - |
| `documentos_requeridos` | jsonb | Si | - | - |
| `documentos_urls` | jsonb | Si | - | - |
| `fecha_inicio` | timestamp with time zone | Si | - | - |
| `fecha_completado` | timestamp with time zone | Si | - | - |
| `fecha_limite` | timestamp with time zone | Si | - | - |
| `notas` | text | Si | - | - |
| `motivo_omision` | text | Si | - | - |
| `fecha_creacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | **NO (Requerido)** | `now()` | - |
| `usuario_completo` | uuid | Si | - | - |


### TABLA: `proyectos`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `nombre` | character varying(255) | **NO (Requerido)** | - | - |
| `descripcion` | text | **NO (Requerido)** | - | - |
| `ubicacion` | character varying(500) | **NO (Requerido)** | - | - |
| `fecha_inicio` | timestamp with time zone | **NO (Requerido)** | - | - |
| `fecha_fin_estimada` | timestamp with time zone | **NO (Requerido)** | - | - |
| `presupuesto` | numeric(15) | **NO (Requerido)** | `0` | - |
| `estado` | character varying(50) | **NO (Requerido)** | `'en_planificacion'::character varying` | - |
| `progreso` | integer(32) | **NO (Requerido)** | `0` | - |
| `responsable` | character varying(255) | **NO (Requerido)** | - | - |
| `telefono` | character varying(50) | **NO (Requerido)** | - | - |
| `email` | character varying(255) | **NO (Requerido)** | - | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `now()` | - |
| `user_id` | uuid | Si | - | - |


### TABLA: `renuncias`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `vivienda_id` | uuid | **NO (Requerido)** | - | - |
| `cliente_id` | uuid | **NO (Requerido)** | - | - |
| `motivo` | text | **NO (Requerido)** | - | - |
| `fecha_renuncia` | timestamp with time zone | **NO (Requerido)** | - | - |
| `monto_a_devolver` | numeric(15) | **NO (Requerido)** | `0` | - |
| `estado` | character varying(50) | **NO (Requerido)** | `'pendiente'::character varying` | - |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `now()` | - |
| `negociacion_id` | uuid | Si | - | ID de la negociación/venta a la que pertenece esta renuncia |
| `vivienda_valor_snapshot` | numeric(15) | Si | - | Precio de la vivienda al momento de registrar la renuncia (para validar reversión) |
| `abonos_snapshot` | jsonb | Si | - | JSON con backup de fuentes_pago al momento de la renuncia (auditoría) |
| `requiere_devolucion` | boolean | **NO (Requerido)** | `false` | TRUE si el cliente tiene abonos que deben devolverse |
| `fecha_devolucion` | timestamp with time zone | Si | - | Fecha MANUAL ingresada por usuario cuando se devolvió el dinero al cliente |
| `comprobante_devolucion_url` | text | Si | - | URL del documento (PDF) en Supabase Storage que evidencia la devolución |
| `metodo_devolucion` | character varying(50) | Si | - | Método usado para devolver el dinero: Transferencia |
| `numero_comprobante` | character varying(100) | Si | - | - |
| `fecha_cancelacion` | timestamp with time zone | Si | - | - |
| `motivo_cancelacion` | text | Si | - | Motivo por el cual el cliente canceló su renuncia y volvió al proceso de compra |
| `usuario_cancelacion` | uuid | Si | - | - |
| `fecha_cierre` | timestamp with time zone | Si | - | - |
| `usuario_registro` | uuid | Si | - | - |
| `usuario_cierre` | uuid | Si | - | - |


### TABLA: `v_negociaciones_completas`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `estado_negociacion` | character varying(30) | Si | - | - |
| `fecha_creacion` | timestamp with time zone | Si | - | - |
| `valor_total` | numeric(15) | Si | - | - |
| `saldo_pendiente` | numeric(15) | Si | - | - |
| `fecha_completada` | timestamp with time zone | Si | - | - |
| `fecha_renuncia_efectiva` | timestamp with time zone | Si | - | - |
| `cliente_id` | uuid | Si | - | - |
| `cliente_nombre` | character varying(200) | Si | - | - |
| `cliente_documento` | character varying(20) | Si | - | - |
| `estado_cliente` | character varying(20) | Si | - | - |
| `vivienda_id` | uuid | Si | - | - |
| `vivienda_numero` | character varying(10) | Si | - | - |
| `estado_vivienda` | character varying(50) | Si | - | - |
| `vivienda_valor` | numeric(15) | Si | - | - |
| `fecha_entrega` | timestamp with time zone | Si | - | - |
| `proyecto_id` | uuid | Si | - | - |
| `proyecto_nombre` | character varying(255) | Si | - | - |
| `renuncia_id` | uuid | Si | - | - |
| `estado_renuncia` | character varying(50) | Si | - | - |
| `fecha_renuncia` | timestamp with time zone | Si | - | - |
| `requiere_devolucion` | boolean | Si | - | - |
| `monto_a_devolver` | numeric(15) | Si | - | - |


### TABLA: `v_renuncias_pendientes`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `fecha_renuncia` | timestamp with time zone | Si | - | - |
| `motivo` | text | Si | - | - |
| `monto_a_devolver` | numeric(15) | Si | - | - |
| `cliente_id` | uuid | Si | - | - |
| `cliente_nombre` | character varying(200) | Si | - | - |
| `cliente_documento` | character varying(20) | Si | - | - |
| `cliente_telefono` | character varying(20) | Si | - | - |
| `vivienda_numero` | character varying(10) | Si | - | - |
| `proyecto_nombre` | character varying(255) | Si | - | - |
| `negociacion_valor_total` | numeric(15) | Si | - | - |
| `dias_pendiente` | integer(32) | Si | - | - |


### TABLA: `vista_abonos_completos`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `negociacion_id` | uuid | Si | - | - |
| `fuente_pago_id` | uuid | Si | - | - |
| `monto` | numeric(15) | Si | - | - |
| `fecha_abono` | timestamp with time zone | Si | - | - |
| `metodo_pago` | character varying(50) | Si | - | - |
| `numero_referencia` | character varying(100) | Si | - | - |
| `comprobante_url` | text | Si | - | - |
| `notas` | text | Si | - | - |
| `fecha_creacion` | timestamp with time zone | Si | - | - |
| `fecha_actualizacion` | timestamp with time zone | Si | - | - |
| `usuario_registro` | uuid | Si | - | - |
| `cliente_id` | uuid | Si | - | - |
| `cliente_nombres` | character varying(100) | Si | - | - |
| `cliente_apellidos` | character varying(100) | Si | - | - |
| `cliente_numero_documento` | character varying(20) | Si | - | - |
| `negociacion_estado` | character varying(30) | Si | - | - |
| `vivienda_id` | uuid | Si | - | - |
| `vivienda_numero` | character varying(10) | Si | - | - |
| `manzana_id` | uuid | Si | - | - |
| `manzana_nombre` | character varying(10) | Si | - | - |
| `proyecto_id` | uuid | Si | - | - |
| `proyecto_nombre` | character varying(255) | Si | - | - |
| `fuente_pago_tipo` | character varying(50) | Si | - | - |


### TABLA: `vista_clientes_resumen`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `nombre_completo` | character varying(200) | Si | - | - |
| `tipo_documento` | character varying(10) | Si | - | - |
| `numero_documento` | character varying(20) | Si | - | - |
| `telefono` | character varying(20) | Si | - | - |
| `email` | character varying(100) | Si | - | - |
| `estado` | character varying(20) | Si | - | - |
| `origen` | character varying(50) | Si | - | - |
| `fecha_creacion` | timestamp with time zone | Si | - | - |
| `total_negociaciones` | bigint(64) | Si | - | - |
| `negociaciones_activas` | bigint(64) | Si | - | - |
| `negociaciones_completadas` | bigint(64) | Si | - | - |
| `ultima_negociacion` | timestamp with time zone | Si | - | - |


### TABLA: `vista_manzanas_disponibilidad`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `proyecto_id` | uuid | Si | - | - |
| `nombre` | character varying(10) | Si | - | - |
| `total_viviendas` | integer(32) | Si | - | - |
| `viviendas_creadas` | bigint(64) | Si | - | - |
| `viviendas_disponibles` | bigint(64) | Si | - | - |
| `tiene_disponibles` | boolean | Si | - | - |


### TABLA: `vista_viviendas_completas`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | Si | - | - |
| `manzana_id` | uuid | Si | - | - |
| `numero` | character varying(10) | Si | - | - |
| `estado` | character varying(50) | Si | - | - |
| `cliente_id` | uuid | Si | - | - |
| `negociacion_id` | uuid | Si | - | - |
| `lindero_norte` | text | Si | - | - |
| `lindero_sur` | text | Si | - | - |
| `lindero_oriente` | text | Si | - | - |
| `lindero_occidente` | text | Si | - | - |
| `matricula_inmobiliaria` | character varying(100) | Si | - | - |
| `nomenclatura` | character varying(100) | Si | - | - |
| `area` | numeric(10) | Si | - | - |
| `area_lote` | numeric(10) | Si | - | - |
| `area_construida` | numeric(10) | Si | - | - |
| `tipo_vivienda` | character varying(20) | Si | - | - |
| `certificado_tradicion_url` | text | Si | - | - |
| `valor_base` | numeric(15) | Si | - | - |
| `es_esquinera` | boolean | Si | - | - |
| `recargo_esquinera` | numeric(15) | Si | - | - |
| `gastos_notariales` | numeric(15) | Si | - | - |
| `valor_total` | numeric(15) | Si | - | - |
| `fecha_creacion` | timestamp with time zone | Si | - | - |
| `fecha_actualizacion` | timestamp with time zone | Si | - | - |
| `manzana_nombre` | character varying(10) | Si | - | - |
| `proyecto_id` | uuid | Si | - | - |
| `proyecto_nombre` | character varying(255) | Si | - | - |
| `proyecto_estado` | character varying(50) | Si | - | - |
| `cliente_id_data` | uuid | Si | - | - |
| `cliente_nombres` | character varying(100) | Si | - | - |
| `cliente_apellidos` | character varying(100) | Si | - | - |
| `cliente_telefono` | character varying(20) | Si | - | - |
| `cliente_email` | character varying(100) | Si | - | - |
| `total_abonado` | numeric | Si | - | - |
| `cantidad_abonos` | bigint(64) | Si | - | - |
| `porcentaje_pagado` | numeric | Si | - | - |
| `saldo_pendiente` | numeric | Si | - | - |


### TABLA: `viviendas`

| Campo | Tipo | Nullable | Default | Descripcion |
| ----- | ---- | -------- | ------- | ----------- |
| `id` | uuid | **NO (Requerido)** | `uuid_generate_v4()` | - |
| `manzana_id` | uuid | **NO (Requerido)** | - | - |
| `numero` | character varying(10) | **NO (Requerido)** | - | - |
| `estado` | character varying(50) | **NO (Requerido)** | `'disponible'::character varying` | Estado de la vivienda. REGLA: Asignada debe tener cliente_id y negociacion_id. Entregada debe tener fecha_entrega y estar vinculada a negociación Completada. |
| `area` | numeric(10) | **NO (Requerido)** | - | - |
| `cliente_id` | uuid | Si | - | Cliente asignado a la vivienda (NULL = disponible) |
| `fecha_creacion` | timestamp with time zone | Si | `now()` | - |
| `fecha_actualizacion` | timestamp with time zone | Si | `now()` | - |
| `lindero_norte` | text | Si | - | Lindero Norte de la vivienda |
| `lindero_sur` | text | Si | - | Lindero Sur de la vivienda |
| `lindero_oriente` | text | Si | - | Lindero Oriente de la vivienda |
| `lindero_occidente` | text | Si | - | Lindero Occidente de la vivienda |
| `matricula_inmobiliaria` | character varying(100) | Si | - | Número de matrícula inmobiliaria |
| `nomenclatura` | character varying(100) | Si | - | Nomenclatura o dirección oficial |
| `area_lote` | numeric(10) | Si | - | Área del lote en metros cuadrados |
| `area_construida` | numeric(10) | Si | - | Área construida en metros cuadrados |
| `tipo_vivienda` | character varying(20) | Si | - | Tipo: Regular o Irregular |
| `certificado_tradicion_url` | text | Si | - | URL del certificado de tradición en Storage |
| `valor_base` | numeric(15) | **NO (Requerido)** | `0` | Valor base de la vivienda |
| `es_esquinera` | boolean | Si | `false` | Indica si la vivienda es esquinera (aplica recargo) |
| `recargo_esquinera` | numeric(15) | Si | `0` | Monto del recargo por casa esquinera |
| `gastos_notariales` | numeric(15) | Si | `5000000` | Gastos notariales (recargo obligatorio) |
| `valor_total` | numeric(15) | Si | - | Valor total calculado automáticamente |
| `fecha_asignacion` | timestamp with time zone | Si | - | Fecha en que se asignó la vivienda al cliente |
| `negociacion_id` | uuid | Si | - | ID de la negociación/venta activa asociada a esta vivienda (NULL si disponible) |
| `fecha_entrega` | timestamp with time zone | Si | - | Fecha en que la vivienda fue entregada físicamente al cliente (requerida si estado = Entregada) |

---

## ENUMS (Tipos Personalizados)


---

## RELACIONES ENTRE TABLAS (Foreign Keys)

| Tabla Origen | Campo | Tabla Destino | Campo Destino |
| ------------ | ----- | ------------- | ------------- |
| `abonos_historial` | `fuente_pago_id` | `fuentes_pago` | `id` |
| `abonos_historial` | `negociacion_id` | `negociaciones` | `id` |
| `cliente_intereses` | `cliente_id` | `clientes` | `id` |
| `cliente_intereses` | `negociacion_id` | `negociaciones` | `id` |
| `cliente_intereses` | `proyecto_id` | `proyectos` | `id` |
| `cliente_intereses` | `vivienda_id` | `viviendas` | `id` |
| `documentos_cliente` | `categoria_id` | `categorias_documento` | `id` |
| `documentos_cliente` | `cliente_id` | `clientes` | `id` |
| `documentos_cliente` | `documento_padre_id` | `documentos_cliente` | `id` |
| `documentos_proyecto` | `categoria_id` | `categorias_documento` | `id` |
| `documentos_proyecto` | `documento_padre_id` | `documentos_proyecto` | `id` |
| `documentos_proyecto` | `proyecto_id` | `proyectos` | `id` |
| `fuentes_pago` | `negociacion_id` | `negociaciones` | `id` |
| `manzanas` | `proyecto_id` | `proyectos` | `id` |
| `negociaciones` | `cliente_id` | `clientes` | `id` |
| `negociaciones` | `vivienda_id` | `viviendas` | `id` |
| `procesos_negociacion` | `negociacion_id` | `negociaciones` | `id` |
| `renuncias` | `negociacion_id` | `negociaciones` | `id` |
| `renuncias` | `vivienda_id` | `viviendas` | `id` |
| `viviendas` | `manzana_id` | `manzanas` | `id` |
| `viviendas` | `negociacion_id` | `negociaciones` | `id` |

---

## Resumen

- **Generado:** 2025-10-27 10:17:58
- **Script:** `scripts/actualizar-docs-db.ps1`
- **Base de datos:** Supabase PostgreSQL

---

**Nota:** Este archivo es generado automaticamente. No editar manualmente.
Para actualizar, ejecuta: `.\scripts\actualizar-docs-db.ps1`
