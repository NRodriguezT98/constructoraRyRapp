# 📋 SCHEMA REFERENCE - CONSULTA RÁPIDA

> **✅ GENERADO AUTOMÁTICAMENTE DESDE BD**
> **Fecha**: 18/12/2025, 3:28:05 p. m.
> **Propósito**: Referencia rápida para evitar errores en nombres de columnas

---

## ⚠️ REGLA DE USO

**ANTES de escribir SQL:**
1. Busca en este archivo con Ctrl+F
2. Copia el nombre EXACTO de la columna
3. NO asumas nombres, SIEMPRE verifica aquí

---

## `documentos_cliente` (30 columnas)

```sql
id                        uuid                 NOT NULL
cliente_id                uuid                 NOT NULL
categoria_id              uuid                 NULL
titulo                    character varying    NOT NULL
descripcion               text                 NULL
nombre_archivo            character varying    NOT NULL
nombre_original           character varying    NOT NULL
tamano_bytes              bigint               NOT NULL
tipo_mime                 character varying    NOT NULL
url_storage               text                 NOT NULL
etiquetas                 ARRAY                NULL
version                   integer              NOT NULL
es_version_actual         boolean              NOT NULL
documento_padre_id        uuid                 NULL
estado                    character varying    NOT NULL
metadata                  jsonb                NULL
subido_por                uuid                 NOT NULL
fecha_documento           timestamp with time zone NULL
fecha_vencimiento         timestamp with time zone NULL
es_importante             boolean              NULL
fecha_creacion            timestamp with time zone NULL
fecha_actualizacion       timestamp with time zone NULL
es_documento_identidad    boolean              NOT NULL
estado_documento          character varying    NULL
razon_obsolescencia       text                 NULL
fuente_pago_relacionada   uuid                 NULL
fecha_obsolescencia       timestamp with time zone NULL
motivo_categoria          character varying    NULL
motivo_detalle            text                 NULL
tipo_documento            character varying    NULL
```

## `fuentes_pago` (26 columnas)

```sql
id                        uuid                 NOT NULL
negociacion_id            uuid                 NOT NULL
tipo                      character varying    NOT NULL
monto_aprobado            numeric              NOT NULL
monto_recibido            numeric              NULL
saldo_pendiente           numeric              NULL
porcentaje_completado     numeric              NULL
entidad                   character varying    NULL
numero_referencia         character varying    NULL
permite_multiples_abonos  boolean              NOT NULL
carta_aprobacion_url      text                 NULL
carta_asignacion_url      text                 NULL
estado                    character varying    NOT NULL
fecha_completado          timestamp with time zone NULL
fecha_creacion            timestamp with time zone NOT NULL
fecha_actualizacion       timestamp with time zone NOT NULL
fecha_resolucion          date                 NULL
fecha_acta                date                 NULL
estado_documentacion      character varying    NULL
estado_fuente             character varying    NULL
reemplazada_por           uuid                 NULL
razon_inactivacion        text                 NULL
fecha_inactivacion        timestamp with time zone NULL
version_negociacion       integer              NOT NULL
entidad_financiera_id     uuid                 NULL
tipo_fuente_id            uuid                 NOT NULL
```

## `documentos_pendientes` (14 columnas)

```sql
id                        uuid                 NOT NULL
fuente_pago_id            uuid                 NOT NULL
cliente_id                uuid                 NOT NULL
tipo_documento            character varying    NOT NULL
metadata                  jsonb                NULL
estado                    character varying    NULL
prioridad                 character varying    NULL
recordatorios_enviados    integer              NULL
ultima_notificacion       timestamp with time zone NULL
fecha_creacion            timestamp with time zone NULL
fecha_completado          timestamp with time zone NULL
completado_por            uuid                 NULL
es_obligatorio            boolean              NULL
orden                     integer              NULL
```

## `negociaciones` (30 columnas)

```sql
id                        uuid                 NOT NULL
cliente_id                uuid                 NOT NULL
vivienda_id               uuid                 NOT NULL
estado                    character varying    NOT NULL
valor_negociado           numeric              NOT NULL
descuento_aplicado        numeric              NULL
valor_total               numeric              NULL
total_fuentes_pago        numeric              NULL
total_abonado             numeric              NULL
saldo_pendiente           numeric              NULL
porcentaje_pagado         numeric              NULL
fecha_negociacion         timestamp with time zone NOT NULL
fecha_completada          timestamp with time zone NULL
promesa_compraventa_url   text                 NULL
promesa_firmada_url       text                 NULL
evidencia_envio_correo_url text                 NULL
escritura_url             text                 NULL
otros_documentos          jsonb                NULL
notas                     text                 NULL
fecha_creacion            timestamp with time zone NOT NULL
fecha_actualizacion       timestamp with time zone NOT NULL
usuario_creacion          uuid                 NULL
fecha_renuncia_efectiva   timestamp with time zone NULL
version_actual            integer              NOT NULL
version_lock              integer              NOT NULL
fecha_ultima_modificacion timestamp with time zone NULL
tipo_descuento            character varying    NULL
motivo_descuento          text                 NULL
porcentaje_descuento      numeric              NULL
valor_escritura_publica   numeric              NULL
```

## `clientes` (21 columnas)

```sql
id                        uuid                 NOT NULL
nombres                   character varying    NOT NULL
apellidos                 character varying    NOT NULL
nombre_completo           character varying    NULL
tipo_documento            character varying    NOT NULL
numero_documento          character varying    NOT NULL
fecha_nacimiento          date                 NULL
telefono                  character varying    NULL
telefono_alternativo      character varying    NULL
email                     character varying    NULL
direccion                 text                 NULL
ciudad                    character varying    NULL
departamento              character varying    NULL
estado                    character varying    NOT NULL
documento_identidad_url   text                 NULL
notas                     text                 NULL
fecha_creacion            timestamp with time zone NOT NULL
fecha_actualizacion       timestamp with time zone NOT NULL
usuario_creacion          uuid                 NULL
documento_identidad_titulo character varying    NULL
estado_civil              USER-DEFINED         NULL
```

## `viviendas` (33 columnas)

```sql
id                        uuid                 NOT NULL
manzana_id                uuid                 NOT NULL
numero                    character varying    NOT NULL
estado                    character varying    NOT NULL
area                      numeric              NOT NULL
cliente_id                uuid                 NULL
fecha_creacion            timestamp with time zone NULL
fecha_actualizacion       timestamp with time zone NULL
lindero_norte             text                 NULL
lindero_sur               text                 NULL
lindero_oriente           text                 NULL
lindero_occidente         text                 NULL
matricula_inmobiliaria    character varying    NULL
nomenclatura              character varying    NULL
area_lote                 numeric              NULL
area_construida           numeric              NULL
tipo_vivienda             character varying    NULL
certificado_tradicion_url text                 NULL
valor_base                numeric              NOT NULL
es_esquinera              boolean              NULL
recargo_esquinera         numeric              NULL
gastos_notariales         numeric              NULL
valor_total               numeric              NULL
fecha_asignacion          timestamp with time zone NULL
negociacion_id            uuid                 NULL
fecha_entrega             timestamp with time zone NULL
fecha_inactivacion        timestamp with time zone NULL
motivo_inactivacion       text                 NULL
inactivada_por            uuid                 NULL
fecha_reactivacion        timestamp with time zone NULL
motivo_reactivacion       text                 NULL
reactivada_por            uuid                 NULL
contador_desactivaciones  integer              NULL
```

## `proyectos` (15 columnas)

```sql
id                        uuid                 NOT NULL
nombre                    character varying    NOT NULL
descripcion               text                 NOT NULL
ubicacion                 character varying    NOT NULL
fecha_inicio              timestamp with time zone NULL
fecha_fin_estimada        timestamp with time zone NULL
presupuesto               numeric              NOT NULL
estado                    character varying    NOT NULL
progreso                  integer              NOT NULL
fecha_creacion            timestamp with time zone NULL
fecha_actualizacion       timestamp with time zone NULL
user_id                   uuid                 NULL
archivado                 boolean              NOT NULL
fecha_archivado           timestamp with time zone NULL
motivo_archivo            text                 NULL
```

## `abonos_historial` (12 columnas)

```sql
id                        uuid                 NOT NULL
negociacion_id            uuid                 NOT NULL
fuente_pago_id            uuid                 NOT NULL
monto                     numeric              NOT NULL
fecha_abono               timestamp with time zone NOT NULL
metodo_pago               character varying    NOT NULL
numero_referencia         character varying    NULL
comprobante_url           text                 NULL
notas                     text                 NULL
fecha_creacion            timestamp with time zone NOT NULL
fecha_actualizacion       timestamp with time zone NOT NULL
usuario_registro          uuid                 NULL
```

## `audit_log` (16 columnas)

```sql
id                        uuid                 NOT NULL
tabla                     character varying    NOT NULL
accion                    character varying    NOT NULL
registro_id               uuid                 NOT NULL
usuario_id                uuid                 NULL
usuario_email             character varying    NOT NULL
usuario_rol               character varying    NULL
fecha_evento              timestamp with time zone NOT NULL
ip_address                inet                 NULL
user_agent                text                 NULL
datos_anteriores          jsonb                NULL
datos_nuevos              jsonb                NULL
cambios_especificos       jsonb                NULL
metadata                  jsonb                NULL
modulo                    character varying    NULL
usuario_nombres           character varying    NULL
```

---

## 🔍 BÚSQUEDAS COMUNES

### Documentos
- **URL del archivo**: `url_storage` (NO `url` ni `ruta_archivo`)
- **Cliente**: `cliente_id` (NOT NULL)
- **Categoría**: `categoria_id` (NULL permitido)
- **Metadata**: `metadata` (jsonb)

### Fuentes de Pago
- **Carta de aprobación**: `carta_aprobacion_url` (NULL permitido)
- **Estado documentación**: `estado_documentacion` (varchar)
- **Monto**: `monto_aprobado` (NOT NULL)

### Documentos Pendientes
- **Metadata**: `metadata` (jsonb con tipo_fuente, entidad)
- **Estado**: `estado` (Pendiente / Completado)

---

**🔄 Regenerar**: `node generar-schema-simple.js`
