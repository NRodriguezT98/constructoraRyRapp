# 📊 Referencia de Esquema de Base de Datos

> **⚠️ DOCUMENTO CRÍTICO - CONSULTAR SIEMPRE ANTES DE CREAR/MODIFICAR CÓDIGO**
>
> Este documento es la **fuente única de verdad** para nombres de tablas, columnas y tipos.
> **NUNCA** asumas nombres de campos - **SIEMPRE** verifica aquí primero.

---

## 🎯 REGLA DE ORO

### 🚨 REGLA CRÍTICA #1: VERIFICACIÓN OBLIGATORIA DE CAMPOS

**ANTES de escribir CUALQUIER código que acceda a la base de datos:**

1. **EJECUTAR** este SQL en Supabase para CADA tabla:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'NOMBRE_TABLA' AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

2. **DOCUMENTAR** los resultados en este archivo inmediatamente

3. **USAR** solo los nombres EXACTOS que devolvió el SQL

### ❌ PROHIBIDO (SE ACABÓ):
- ❌ Asumir nombres de columnas sin verificar con SQL
- ❌ Copiar nombres de otros archivos sin validar
- ❌ Usar nombres en inglés cuando la DB usa español
- ❌ Inventar nombres "lógicos" sin confirmar
- ❌ **Suponer que un campo existe porque "tiene sentido"**
- ❌ **Usar nombres de la documentación vieja sin verificar**

### ✅ OBLIGATORIO (SIEMPRE):
- ✅ Ejecutar SQL de verificación PRIMERO
- ✅ Consultar este documento DESPUÉS del SQL
- ✅ Actualizar este documento con resultados del SQL
- ✅ Usar los nombres EXACTOS como están en la DB
- ✅ **Si hay duda: SQL primero, código después**

---

## 📋 TABLAS PRINCIPALES

### 1️⃣ `clientes` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.clientes (
  id uuid not null default gen_random_uuid (),
  nombres character varying(100) not null,
  apellidos character varying(100) not null,
  nombre_completo character varying GENERATED ALWAYS as (
    (((nombres)::text || ' '::text) || (apellidos)::text)
  ) STORED (200) null,
  tipo_documento character varying(10) not null default 'CC'::character varying,
  numero_documento character varying(20) not null,
  fecha_nacimiento date null,
  telefono character varying(20) null,
  telefono_alternativo character varying(20) null,
  email character varying(100) null,
  direccion text null,
  ciudad character varying(100) null default 'Cali'::character varying,
  departamento character varying(100) null default 'Valle del Cauca'::character varying,
  estado character varying(20) not null default 'Interesado'::character varying,
  origen character varying(50) null,
  referido_por character varying(200) null,
  documento_identidad_url text null,
  notas text null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  usuario_creacion uuid null,
  constraint clientes_pkey primary key (id),
  constraint clientes_documento_unico unique (tipo_documento, numero_documento),
  constraint clientes_usuario_creacion_fkey foreign KEY (usuario_creacion) references auth.users (id),
  constraint clientes_estado_check check (
    ((estado)::text = any ((array['Interesado'::character varying, 'Activo'::character varying, 'Inactivo'::character varying])::text[]))
  ),
  constraint clientes_origen_check check (
    ((origen)::text = any ((array['Referido'::character varying, 'Página Web'::character varying, 'Redes Sociales'::character varying, 'Llamada Directa'::character varying, 'Visita Oficina'::character varying, 'Feria/Evento'::character varying, 'Publicidad'::character varying, 'Otro'::character varying])::text[]))
  ),
  constraint clientes_tipo_documento_check check (
    ((tipo_documento)::text = any ((array['CC'::character varying, 'CE'::character varying, 'TI'::character varying, 'NIT'::character varying, 'PP'::character varying, 'PEP'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_clientes_estado on public.clientes using btree (estado) TABLESPACE pg_default;
create index IF not exists idx_clientes_numero_documento on public.clientes using btree (numero_documento) TABLESPACE pg_default;
create index IF not exists idx_clientes_nombre_completo on public.clientes using btree (nombre_completo) TABLESPACE pg_default;
create index IF not exists idx_clientes_fecha_creacion on public.clientes using btree (fecha_creacion desc) TABLESPACE pg_default;
create index IF not exists idx_clientes_email on public.clientes using btree (email) TABLESPACE pg_default;
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  nombres: string                    // ⚠️ varchar(100) - PLURAL, NO "nombre"
  apellidos: string                  // ⚠️ varchar(100) - PLURAL, NO "apellido"
  nombre_completo: string            // ⚠️ GENERATED COLUMN (nombres + apellidos) - READ ONLY
  tipo_documento: string             // ⚠️ varchar(10) - Ver tipos válidos
  numero_documento: string           // ⚠️ varchar(20) - NO "cedula" o "documento"
  fecha_nacimiento?: Date            // ⚠️ date | null
  telefono?: string                  // ⚠️ varchar(20) | null
  telefono_alternativo?: string      // ⚠️ varchar(20) | null
  email?: string                     // ⚠️ varchar(100) | null
  direccion?: string                 // ⚠️ text | null
  ciudad?: string                    // ⚠️ varchar(100) | null, default 'Cali'
  departamento?: string              // ⚠️ varchar(100) | null, default 'Valle del Cauca'
  estado: string                     // ⚠️ varchar(20) - Ver estados válidos
  origen?: string                    // ⚠️ varchar(50) | null - Ver orígenes válidos
  referido_por?: string              // ⚠️ varchar(200) | null
  documento_identidad_url?: string   // ⚠️ text | null
  notas?: string                     // ⚠️ text | null
  fecha_creacion: Date               // ⚠️ timestamptz, default now()
  fecha_actualizacion: Date          // ⚠️ timestamptz, default now()
  usuario_creacion?: string          // ⚠️ uuid | null → auth.users(id)
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `gen_random_uuid()` | Identificador único |
| **nombres** | `varchar(100)` | ✅ | - | Nombres del cliente (PLURAL) |
| **apellidos** | `varchar(100)` | ✅ | - | Apellidos del cliente (PLURAL) |
| **nombre_completo** | `varchar(200)` | ❌ | GENERATED | Concatenación automática (nombres + apellidos) |
| **tipo_documento** | `varchar(10)` | ✅ | `'CC'` | Tipo de documento (ver tipos válidos) |
| **numero_documento** | `varchar(20)` | ✅ | - | Número de documento (UNIQUE con tipo) |
| **fecha_nacimiento** | `date` | ❌ | `null` | Fecha de nacimiento |
| **telefono** | `varchar(20)` | ❌ | `null` | Teléfono principal |
| **telefono_alternativo** | `varchar(20)` | ❌ | `null` | Teléfono secundario |
| **email** | `varchar(100)` | ❌ | `null` | Correo electrónico |
| **direccion** | `text` | ❌ | `null` | Dirección de residencia |
| **ciudad** | `varchar(100)` | ❌ | `'Cali'` | Ciudad |
| **departamento** | `varchar(100)` | ❌ | `'Valle del Cauca'` | Departamento |
| **estado** | `varchar(20)` | ✅ | `'Interesado'` | Estado del cliente |
| **origen** | `varchar(50)` | ❌ | `null` | Cómo conoció la empresa |
| **referido_por** | `varchar(200)` | ❌ | `null` | Nombre del referidor |
| **documento_identidad_url** | `text` | ❌ | `null` | URL del documento escaneado |
| **notas** | `text` | ❌ | `null` | Observaciones adicionales |
| **fecha_creacion** | `timestamptz` | ✅ | `now()` | Fecha de creación |
| **fecha_actualizacion** | `timestamptz` | ✅ | `now()` | Fecha de última actualización |
| **usuario_creacion** | `uuid` | ❌ | `null` | Usuario que creó (auth.users) |

**Tipos de Documento Válidos (CHECK constraint):**
- ✅ `'CC'` → Cédula de Ciudadanía (default)
- ✅ `'CE'` → Cédula de Extranjería
- ✅ `'TI'` → Tarjeta de Identidad
- ✅ `'NIT'` → Número de Identificación Tributaria
- ✅ `'PP'` → Pasaporte
- ✅ `'PEP'` → Permiso Especial de Permanencia

**Estados Válidos (CHECK constraint):**
- ✅ `'Interesado'` (default)
- ✅ `'Activo'`
- ✅ `'Inactivo'`

**Orígenes Válidos (CHECK constraint):**
- ✅ `'Referido'`
- ✅ `'Página Web'`
- ✅ `'Redes Sociales'`
- ✅ `'Llamada Directa'`
- ✅ `'Visita Oficina'`
- ✅ `'Feria/Evento'`
- ✅ `'Publicidad'`
- ✅ `'Otro'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Unique: `(tipo_documento, numero_documento)` → No duplicados
- ✅ Foreign Key: `usuario_creacion` → `auth.users(id)`
- ✅ Generated Column: `nombre_completo` (READ ONLY, no se puede insertar/actualizar)
- ✅ Check: `tipo_documento` debe estar en lista
- ✅ Check: `estado` debe estar en lista
- ✅ Check: `origen` debe estar en lista (si no es null)

**Índices:**
- `idx_clientes_estado` → Búsquedas por estado (btree)
- `idx_clientes_numero_documento` → Búsquedas por documento (btree)
- `idx_clientes_nombre_completo` → Búsquedas por nombre (btree)
- `idx_clientes_fecha_creacion` → Ordenamiento por fecha DESC (btree)
- `idx_clientes_email` → Búsquedas por email (btree)

**⚠️ CAMPOS QUE NO EXISTEN (confirmados):**
- ❌ `profesion` → NO existe en la tabla clientes
- ❌ `estado_civil` → NO existe en la tabla clientes
- ❌ `empresa` → NO existe en la tabla clientes
- ❌ `cargo` → NO existe en la tabla clientes
- ❌ `ingresos_mensuales` → NO existe en la tabla clientes

**Errores comunes:**
- ❌ `cliente.nombre` → ✅ `cliente.nombres` (PLURAL)
- ❌ `cliente.apellido` → ✅ `cliente.apellidos` (PLURAL)
- ❌ `cliente.documento` → ✅ `cliente.numero_documento`
- ❌ `cliente.cedula` → ✅ `cliente.numero_documento`
- ❌ Insertar `nombre_completo` → ✅ Es GENERATED, se calcula automáticamente

**Ejemplo de uso correcto:**

```typescript
// ✅ CORRECTO
const { data, error } = await supabase
  .from('clientes')
  .insert({
    nombres: 'Juan Carlos',           // PLURAL
    apellidos: 'Pérez García',        // PLURAL
    tipo_documento: 'CC',
    numero_documento: '1234567890',   // NO "cedula"
    telefono: '3001234567',
    email: 'juan@example.com',
    ciudad: 'Cali',
    estado: 'Interesado',
    origen: 'Referido'
    // nombre_completo NO se incluye (es GENERATED)
  });

// ❌ INCORRECTO
const { data, error } = await supabase
  .from('clientes')
  .insert({
    nombre: 'Juan',                   // ❌ Es "nombres" (plural)
    apellido: 'Pérez',                // ❌ Es "apellidos" (plural)
    cedula: '1234567890',             // ❌ Es "numero_documento"
    documento: '1234567890',          // ❌ Es "numero_documento"
    nombre_completo: 'Juan Pérez',    // ❌ Es GENERATED, no se puede insertar
    profesion: 'Ingeniero',           // ❌ NO existe este campo
    estado_civil: 'Casado'            // ❌ NO existe este campo
  });
```

---

### 2️⃣ `proyectos` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.proyectos (
  id uuid not null default extensions.uuid_generate_v4 (),
  nombre character varying(255) not null,
  descripcion text not null,
  ubicacion character varying(500) not null,
  fecha_inicio timestamp with time zone not null,
  fecha_fin_estimada timestamp with time zone not null,
  presupuesto numeric(15, 2) not null default 0,
  estado character varying(50) not null default 'en_planificacion'::character varying,
  progreso integer not null default 0,
  responsable character varying(255) not null,
  telefono character varying(50) not null,
  email character varying(255) not null,
  fecha_creacion timestamp with time zone null default now(),
  fecha_actualizacion timestamp with time zone null default now(),
  user_id uuid null,
  constraint proyectos_pkey primary key (id),
  constraint proyectos_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint proyectos_estado_check check (
    ((estado)::text = any ((array['en_planificacion'::character varying, 'en_construccion'::character varying, 'completado'::character varying, 'pausado'::character varying])::text[]))
  ),
  constraint proyectos_progreso_check check ((progreso >= 0) and (progreso <= 100))
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_proyectos_user_id on public.proyectos using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_proyectos_estado on public.proyectos using btree (estado) TABLESPACE pg_default;
create index IF not exists idx_proyectos_fecha_inicio on public.proyectos using btree (fecha_inicio) TABLESPACE pg_default;

-- Trigger
create trigger update_proyectos_fecha_actualizacion BEFORE
update on proyectos for EACH row
execute FUNCTION update_updated_at_column ();
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  nombre: string                 // ⚠️ varchar(255) - Nombre del proyecto
  descripcion: string            // ⚠️ text
  ubicacion: string              // ⚠️ varchar(500)
  fecha_inicio: Date             // ⚠️ timestamptz
  fecha_fin_estimada: Date       // ⚠️ timestamptz
  presupuesto: number            // ⚠️ numeric(15,2), default 0
  estado: string                 // ⚠️ varchar(50) - Ver estados válidos (snake_case)
  progreso: number               // ⚠️ integer, default 0 (0-100)
  responsable: string            // ⚠️ varchar(255)
  telefono: string               // ⚠️ varchar(50)
  email: string                  // ⚠️ varchar(255)
  fecha_creacion?: Date          // ⚠️ timestamptz, default now()
  fecha_actualizacion?: Date     // ⚠️ timestamptz, default now()
  user_id?: string               // ⚠️ uuid | null → auth.users(id) ON DELETE CASCADE
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **nombre** | `varchar(255)` | ✅ | - | Nombre del proyecto |
| **descripcion** | `text` | ✅ | - | Descripción detallada |
| **ubicacion** | `varchar(500)` | ✅ | - | Dirección/ubicación |
| **fecha_inicio** | `timestamptz` | ✅ | - | Fecha de inicio |
| **fecha_fin_estimada** | `timestamptz` | ✅ | - | Fecha estimada de finalización |
| **presupuesto** | `numeric(15,2)` | ✅ | `0` | Presupuesto total |
| **estado** | `varchar(50)` | ✅ | `'en_planificacion'` | Estado del proyecto |
| **progreso** | `integer` | ✅ | `0` | Porcentaje de avance (0-100) |
| **responsable** | `varchar(255)` | ✅ | - | Nombre del responsable |
| **telefono** | `varchar(50)` | ✅ | - | Teléfono de contacto |
| **email** | `varchar(255)` | ✅ | - | Email de contacto |
| **fecha_creacion** | `timestamptz` | ❌ | `now()` | Fecha de creación |
| **fecha_actualizacion** | `timestamptz` | ❌ | `now()` | Fecha de última actualización |
| **user_id** | `uuid` | ❌ | `null` | Usuario creador (auth.users) |

**Estados válidos (CHECK constraint - snake_case lowercase):**
- ✅ `'en_planificacion'` (default)
- ✅ `'en_construccion'`
- ✅ `'completado'`
- ✅ `'pausado'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `user_id` → `auth.users(id)` con `ON DELETE CASCADE`
- ✅ Check: `estado` debe estar en lista (snake_case)
- ✅ Check: `progreso` entre 0 y 100

**Índices:**
- `idx_proyectos_user_id` → Búsquedas por usuario (btree)
- `idx_proyectos_estado` → Filtrado por estado (btree)
- `idx_proyectos_fecha_inicio` → Ordenamiento por fecha (btree)

**Trigger:**
- `update_proyectos_fecha_actualizacion` → Actualiza `fecha_actualizacion` automáticamente

**Errores comunes:**
- ❌ `proyecto.presupuesto_total` → ✅ `proyecto.presupuesto`
- ❌ `estado: 'En Planificacion'` → ✅ `'en_planificacion'` (snake_case lowercase)
- ❌ `estado: 'finalizado'` → ✅ `'completado'`

---

### 3️⃣ `viviendas`

```typescript
{
  id: string (UUID)
  manzana_id: string (UUID)
  numero: string               // ⚠️ String, no number
  tipo: string                 // 'Casa' | 'Apartamento' | 'Local'
  area_construida: number
  area_terreno: number
  numero_habitaciones: number
  numero_banos: number
  numero_pisos: number
  tiene_garaje: boolean
  valor_total: number          // ⚠️ NO "precio" o "valor"
  estado: string               // ⚠️ Snake_case: 'disponible' | 'reservada' | 'vendida' | 'en_construccion'
  descripcion: string
  imagen_url: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Estados válidos (snake_case lowercase):**
- `'disponible'`
- `'reservada'`
- `'vendida'`
- `'en_construccion'`

**Errores comunes:**
- ❌ `vivienda.precio` → ✅ `vivienda.valor_total`
- ❌ `vivienda.estado = 'Disponible'` → ✅ `'disponible'`

---

### 4️⃣ `manzanas`

```typescript
{
  id: string (UUID)
  proyecto_id: string (UUID)
  nombre: string               // Ej: "Manzana A"
  numero_viviendas: number
  descripcion: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

---

### 3️⃣ `manzanas` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.manzanas (
  id uuid not null default extensions.uuid_generate_v4 (),
  proyecto_id uuid not null,
  nombre character varying(10) not null,
  numero_viviendas integer not null,
  fecha_creacion timestamp with time zone null default now(),
  constraint manzanas_pkey primary key (id),
  constraint manzanas_proyecto_id_fkey foreign KEY (proyecto_id) references proyectos (id) on delete CASCADE,
  constraint manzanas_numero_viviendas_check check ((numero_viviendas > 0))
) TABLESPACE pg_default;

create index IF not exists idx_manzanas_proyecto_id on public.manzanas using btree (proyecto_id) TABLESPACE pg_default;
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  proyecto_id: string       // ⚠️ uuid → proyectos(id) ON DELETE CASCADE
  nombre: string            // ⚠️ varchar(10) - Ej: "Manzana A"
  numero_viviendas: number  // ⚠️ integer - Debe ser > 0
  fecha_creacion?: Date     // ⚠️ timestamptz, default now()
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **proyecto_id** | `uuid` | ✅ | - | Referencia al proyecto (CASCADE) |
| **nombre** | `varchar(10)` | ✅ | - | Nombre/código de la manzana |
| **numero_viviendas** | `integer` | ✅ | - | Cantidad de viviendas (> 0) |
| **fecha_creacion** | `timestamptz` | ❌ | `now()` | Fecha de creación |

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `proyecto_id` → `proyectos(id)` con `ON DELETE CASCADE`
- ✅ Check: `numero_viviendas > 0`

**Índices:**
- `idx_manzanas_proyecto_id` → Búsquedas por proyecto (btree)

---

### 4️⃣ `viviendas` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.viviendas (
  id uuid not null default extensions.uuid_generate_v4 (),
  manzana_id uuid not null,
  numero character varying(10) not null,
  estado character varying(50) not null default 'disponible'::character varying,
  precio numeric(15, 2) not null,
  area numeric(10, 2) not null,
  cliente_id uuid null,
  fecha_creacion timestamp with time zone null default now(),
  fecha_actualizacion timestamp with time zone null default now(),
  lindero_norte text null,
  lindero_sur text null,
  lindero_oriente text null,
  lindero_occidente text null,
  matricula_inmobiliaria character varying(100) null,
  nomenclatura character varying(100) null,
  area_lote numeric(10, 2) null,
  area_construida numeric(10, 2) null,
  tipo_vivienda character varying(20) null,
  certificado_tradicion_url text null,
  valor_base numeric(15, 2) not null default 0,
  es_esquinera boolean null default false,
  recargo_esquinera numeric(15, 2) null default 0,
  gastos_notariales numeric(15, 2) null default 5000000,
  valor_total numeric GENERATED ALWAYS as (((valor_base + gastos_notariales) + recargo_esquinera)) STORED (15, 2) null,
  fecha_asignacion timestamp with time zone null,
  fecha_pago_completo timestamp with time zone null,
  constraint viviendas_pkey primary key (id),
  constraint viviendas_manzana_id_fkey foreign KEY (manzana_id) references manzanas (id) on delete CASCADE,
  constraint viviendas_estado_check check (
    ((estado)::text = any ((array['disponible'::character varying, 'reservada'::character varying, 'vendida'::character varying])::text[]))
  ),
  constraint viviendas_tipo_vivienda_check check (
    ((tipo_vivienda)::text = any ((array['Regular'::character varying, 'Irregular'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices
create unique INDEX IF not exists idx_matricula_inmobiliaria_unica on public.viviendas using btree (matricula_inmobiliaria) TABLESPACE pg_default where (matricula_inmobiliaria is not null);
create index IF not exists idx_viviendas_manzana_id on public.viviendas using btree (manzana_id) TABLESPACE pg_default;
create index IF not exists idx_viviendas_cliente_id on public.viviendas using btree (cliente_id) TABLESPACE pg_default;
create index IF not exists idx_viviendas_estado on public.viviendas using btree (estado) TABLESPACE pg_default;

-- Triggers
create trigger trigger_actualizar_estado_vivienda BEFORE update on viviendas for EACH row execute FUNCTION actualizar_estado_vivienda ();
create trigger update_viviendas_fecha_actualizacion BEFORE update on viviendas for EACH row execute FUNCTION update_updated_at_column ();
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  manzana_id: string                // ⚠️ uuid → manzanas(id) ON DELETE CASCADE
  numero: string                    // ⚠️ varchar(10)
  estado: string                    // ⚠️ varchar(50) - Ver estados válidos (snake_case)
  precio: number                    // ⚠️ numeric(15,2) - DEPRECATED, usar valor_base
  area: number                      // ⚠️ numeric(10,2)
  cliente_id?: string               // ⚠️ uuid | null
  fecha_creacion?: Date             // ⚠️ timestamptz, default now()
  fecha_actualizacion?: Date        // ⚠️ timestamptz, default now()
  lindero_norte?: string            // ⚠️ text | null
  lindero_sur?: string              // ⚠️ text | null
  lindero_oriente?: string          // ⚠️ text | null
  lindero_occidente?: string        // ⚠️ text | null
  matricula_inmobiliaria?: string   // ⚠️ varchar(100) | null - UNIQUE
  nomenclatura?: string             // ⚠️ varchar(100) | null
  area_lote?: number                // ⚠️ numeric(10,2) | null
  area_construida?: number          // ⚠️ numeric(10,2) | null
  tipo_vivienda?: string            // ⚠️ varchar(20) | null - 'Regular' | 'Irregular'
  certificado_tradicion_url?: string// ⚠️ text | null
  valor_base: number                // ⚠️ numeric(15,2), default 0
  es_esquinera?: boolean            // ⚠️ boolean, default false
  recargo_esquinera?: number        // ⚠️ numeric(15,2), default 0
  gastos_notariales?: number        // ⚠️ numeric(15,2), default 5000000
  valor_total: number               // ⚠️ GENERATED COLUMN - READ ONLY
  fecha_asignacion?: Date           // ⚠️ timestamptz | null
  fecha_pago_completo?: Date        // ⚠️ timestamptz | null
}
```

**Campos detallados (principales):**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **manzana_id** | `uuid` | ✅ | - | Referencia a manzana (CASCADE) |
| **numero** | `varchar(10)` | ✅ | - | Número de la vivienda |
| **estado** | `varchar(50)` | ✅ | `'disponible'` | Estado (ver valores válidos) |
| **precio** | `numeric(15,2)` | ✅ | - | **DEPRECATED** - Usar `valor_base` |
| **area** | `numeric(10,2)` | ✅ | - | Área total |
| **valor_base** | `numeric(15,2)` | ✅ | `0` | Valor base de la vivienda |
| **es_esquinera** | `boolean` | ❌ | `false` | Si es lote esquinero |
| **recargo_esquinera** | `numeric(15,2)` | ❌ | `0` | Recargo por esquina |
| **gastos_notariales** | `numeric(15,2)` | ❌ | `5000000` | Gastos de escrituración |
| **valor_total** | `numeric(15,2)` | ❌ | GENERATED | `valor_base + gastos_notariales + recargo_esquinera` |
| **matricula_inmobiliaria** | `varchar(100)` | ❌ | `null` | Matrícula única |
| **tipo_vivienda** | `varchar(20)` | ❌ | `null` | Regular o Irregular |

**Estados válidos (CHECK constraint - snake_case lowercase):**
- ✅ `'disponible'` (default)
- ✅ `'reservada'`
- ✅ `'vendida'`

**Tipos de Vivienda válidos (CHECK constraint - PascalCase):**
- ✅ `'Regular'`
- ✅ `'Irregular'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `manzana_id` → `manzanas(id)` con `ON DELETE CASCADE`
- ✅ Unique: `matricula_inmobiliaria` (si no es null)
- ✅ Check: `estado` debe estar en lista
- ✅ Check: `tipo_vivienda` debe estar en lista (si no es null)
- ✅ Generated Column: `valor_total` (READ ONLY, calculado automáticamente)

**Índices:**
- `idx_matricula_inmobiliaria_unica` → UNIQUE si no es null (btree)
- `idx_viviendas_manzana_id` → Búsquedas por manzana (btree)
- `idx_viviendas_cliente_id` → Búsquedas por cliente (btree)
- `idx_viviendas_estado` → Filtrado por estado (btree)

**Triggers:**
- `trigger_actualizar_estado_vivienda` → Lógica de estado automática
- `update_viviendas_fecha_actualizacion` → Actualiza `fecha_actualizacion`

**⚠️ CAMPO CRÍTICO:**
- ❌ `vivienda_precio` → NO EXISTE
- ❌ `vivienda_valor` → NO EXISTE
- ✅ `valor_base` → Valor base correcto
- ✅ `valor_total` → GENERATED (suma automática)

**Errores comunes:**
- ❌ `vivienda.vivienda_valor` → ✅ `vivienda.valor_total` (GENERATED)
- ❌ `vivienda.vivienda_precio` → ✅ `vivienda.precio` o `vivienda.valor_base`
- ❌ Insertar `valor_total` → ✅ Es GENERATED, se calcula automáticamente
- ❌ `estado: 'Disponible'` → ✅ `'disponible'` (snake_case lowercase)

---

### 5️⃣ `cliente_intereses` ⭐ COMPLETADO

**Nota**: Esta tabla ya está documentada arriba con todos los campos actualizados (17 campos totales, 5 foreign keys, 3 CHECK constraints, 10 índices, 1 trigger).

---

### 6️⃣ `negociaciones` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.negociaciones (
  id uuid not null default gen_random_uuid (),
  cliente_id uuid not null,
  vivienda_id uuid not null,
  estado character varying(30) not null default 'En Proceso'::character varying,
  valor_negociado numeric(15, 2) not null,
  descuento_aplicado numeric(15, 2) null default 0,
  valor_total numeric GENERATED ALWAYS as ((valor_negociado - descuento_aplicado)) STORED (15, 2) null,
  total_fuentes_pago numeric(15, 2) null default 0,
  total_abonado numeric(15, 2) null default 0,
  saldo_pendiente numeric(15, 2) null default 0,
  porcentaje_pagado numeric(5, 2) null default 0,
  fecha_negociacion timestamp with time zone not null default now(),
  fecha_cierre_financiero timestamp with time zone null,
  fecha_activacion timestamp with time zone null,
  fecha_completada timestamp with time zone null,
  fecha_cancelacion timestamp with time zone null,
  motivo_cancelacion text null,
  promesa_compraventa_url text null,
  promesa_firmada_url text null,
  evidencia_envio_correo_url text null,
  escritura_url text null,
  otros_documentos jsonb null,
  notas text null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  usuario_creacion uuid null,
  constraint negociaciones_pkey primary key (id),
  constraint negociaciones_cliente_id_fkey foreign KEY (cliente_id) references clientes (id) on delete CASCADE,
  constraint negociaciones_usuario_creacion_fkey foreign KEY (usuario_creacion) references auth.users (id),
  constraint negociaciones_vivienda_id_fkey foreign KEY (vivienda_id) references viviendas (id) on delete RESTRICT,
  constraint negociaciones_descuento_valido check ((descuento_aplicado >= (0)::numeric) and (descuento_aplicado < valor_negociado)),
  constraint negociaciones_estado_check check (
    ((estado)::text = any ((array['En Proceso'::character varying, 'Cierre Financiero'::character varying, 'Activa'::character varying, 'Completada'::character varying, 'Cancelada'::character varying, 'Renuncia'::character varying])::text[]))
  ),
  constraint negociaciones_valor_positivo check ((valor_negociado > (0)::numeric))
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_negociaciones_cliente on public.negociaciones using btree (cliente_id) TABLESPACE pg_default;
create index IF not exists idx_negociaciones_vivienda on public.negociaciones using btree (vivienda_id) TABLESPACE pg_default;
create index IF not exists idx_negociaciones_estado on public.negociaciones using btree (estado) TABLESPACE pg_default;
create index IF not exists idx_negociaciones_fecha_creacion on public.negociaciones using btree (fecha_creacion desc) TABLESPACE pg_default;
create unique INDEX IF not exists idx_negociaciones_activas_cliente_vivienda_unica on public.negociaciones using btree (cliente_id, vivienda_id) TABLESPACE pg_default
where ((estado)::text = any ((array['En Proceso'::character varying, 'Cierre Financiero'::character varying, 'Activa'::character varying])::text[]));

-- Triggers
create trigger trigger_update_cliente_estado_on_negociacion after INSERT or update on negociaciones for EACH row execute FUNCTION update_cliente_estado_on_negociacion ();
create trigger trigger_update_negociaciones_fecha_actualizacion BEFORE update on negociaciones for EACH row execute FUNCTION update_negociaciones_fecha_actualizacion ();
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  cliente_id: string                    // ⚠️ uuid → clientes(id) ON DELETE CASCADE
  vivienda_id: string                   // ⚠️ uuid → viviendas(id) ON DELETE RESTRICT
  estado: string                        // ⚠️ varchar(30) - Ver estados válidos (PascalCase)
  valor_negociado: number               // ⚠️ numeric(15,2) - Debe ser > 0
  descuento_aplicado?: number           // ⚠️ numeric(15,2), default 0
  valor_total: number                   // ⚠️ GENERATED COLUMN - READ ONLY
  total_fuentes_pago?: number           // ⚠️ numeric(15,2), default 0
  total_abonado?: number                // ⚠️ numeric(15,2), default 0
  saldo_pendiente?: number              // ⚠️ numeric(15,2), default 0
  porcentaje_pagado?: number            // ⚠️ numeric(5,2), default 0
  fecha_negociacion: Date               // ⚠️ timestamptz, default now()
  fecha_cierre_financiero?: Date        // ⚠️ timestamptz | null
  fecha_activacion?: Date               // ⚠️ timestamptz | null
  fecha_completada?: Date               // ⚠️ timestamptz | null
  fecha_cancelacion?: Date              // ⚠️ timestamptz | null
  motivo_cancelacion?: string           // ⚠️ text | null
  promesa_compraventa_url?: string      // ⚠️ text | null
  promesa_firmada_url?: string          // ⚠️ text | null
  evidencia_envio_correo_url?: string   // ⚠️ text | null
  escritura_url?: string                // ⚠️ text | null
  otros_documentos?: Record<string, any>// ⚠️ jsonb | null
  notas?: string                        // ⚠️ text | null
  fecha_creacion: Date                  // ⚠️ timestamptz, default now()
  fecha_actualizacion: Date             // ⚠️ timestamptz, default now()
  usuario_creacion?: string             // ⚠️ uuid | null → auth.users(id)
}
```

**Estados válidos (CHECK constraint - PascalCase con espacios):**
- ✅ `'En Proceso'` (default)
- ✅ `'Cierre Financiero'`
- ✅ `'Activa'`
- ✅ `'Completada'`
- ✅ `'Cancelada'`
- ✅ `'Renuncia'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `cliente_id` → `clientes(id)` con `ON DELETE CASCADE`
- ✅ Foreign Key: `vivienda_id` → `viviendas(id)` con `ON DELETE RESTRICT`
- ✅ Foreign Key: `usuario_creacion` → `auth.users(id)`
- ✅ Check: `valor_negociado > 0`
- ✅ Check: `descuento_aplicado >= 0` y `< valor_negociado`
- ✅ Check: `estado` debe estar en lista
- ✅ Generated Column: `valor_total = valor_negociado - descuento_aplicado`
- ✅ Unique Index: Solo 1 negociación activa por cliente/vivienda

**Índices:**
- `idx_negociaciones_cliente` → Búsquedas por cliente (btree)
- `idx_negociaciones_vivienda` → Búsquedas por vivienda (btree)
- `idx_negociaciones_estado` → Filtrado por estado (btree)
- `idx_negociaciones_fecha_creacion` → Ordenamiento DESC (btree)
- `idx_negociaciones_activas_cliente_vivienda_unica` → UNIQUE para activas (btree partial)

**Triggers:**
- `trigger_update_cliente_estado_on_negociacion` → Actualiza estado del cliente
- `trigger_update_negociaciones_fecha_actualizacion` → Actualiza `fecha_actualizacion`

**Errores comunes:**
- ❌ `negociacion.precio_negociado` → ✅ `negociacion.valor_negociado`
- ❌ Insertar `valor_total` → ✅ Es GENERATED, se calcula automáticamente
- ❌ `estado: 'en_proceso'` → ✅ `'En Proceso'` (PascalCase con espacios)

---

### 7️⃣ `fuentes_pago` ⭐ COMPLETADO

```typescript
{
  // Campos base
  id: string (UUID)
  cliente_id: string (UUID)
  proyecto_id: string (UUID)
  vivienda_id: string (UUID)   // Opcional
  notas: string
  estado: string               // ⚠️ PascalCase: 'Activo' | 'Pendiente' | 'Contactado' | 'En Seguimiento' | 'Negociación' | 'Descartado' | 'Perdido'
  motivo_descarte: string
  fecha_interes: Date
  fecha_actualizacion: Date
  usuario_creacion: string

  // Campos nuevos (agregados 2025-10-18)
  valor_estimado: number       // ⚠️ NUEVO - Valor estimado del interés
  origen: string               // ⚠️ NUEVO - 'Visita Presencial' | 'Llamada Telefónica' | 'WhatsApp' | 'Email' | 'Redes Sociales' | 'Referido' | 'Sitio Web' | 'Otro'
  prioridad: string            // ⚠️ NUEVO - 'Alta' | 'Media' | 'Baja'
  fecha_ultimo_contacto: Date  // ⚠️ NUEVO
  proximo_seguimiento: Date    // ⚠️ NUEVO
  negociacion_id: string (UUID)// ⚠️ NUEVO - Se llena al convertir a negociación
  fecha_conversion: Date       // ⚠️ NUEVO - Fecha cuando se convirtió
}
```

**Estados válidos (PascalCase con espacios):**
- `'Activo'`
- `'Pendiente'`
- `'Contactado'`
- `'En Seguimiento'`
- `'Negociación'`
- `'Descartado'`
- `'Perdido'`

**Orígenes válidos:**
- `'Visita Presencial'`
- `'Llamada Telefónica'`
- `'WhatsApp'`
- `'Email'`
- `'Redes Sociales'`
- `'Referido'`
- `'Sitio Web'`
- `'Otro'`

**Prioridades válidas:**
- `'Alta'`
- `'Media'`
- `'Baja'`

---

### 6️⃣ `negociaciones`

```typescript
{
  id: string (UUID)
  cliente_id: string (UUID)
  vivienda_id: string (UUID)
  valor_negociado: number      // ⚠️ NO "precio_negociado"
  descuento_aplicado: number
  estado: string               // 'En Proceso' | 'Aprobada' | 'Rechazada' | 'Cancelada'
  notas: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_creacion: string
}
```

**Errores comunes:**
- ❌ `negociacion.precio` → ✅ `negociacion.valor_negociado`

---

### 7️⃣ `fuentes_pago` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.fuentes_pago (
  id uuid not null default gen_random_uuid (),
  negociacion_id uuid not null,
  tipo character varying(50) not null,
  monto_aprobado numeric(15, 2) not null,
  monto_recibido numeric(15, 2) null default 0,
  saldo_pendiente numeric GENERATED ALWAYS as ((monto_aprobado - monto_recibido)) STORED (15, 2) null,
  porcentaje_completado numeric GENERATED ALWAYS as (
    case when (monto_aprobado > (0)::numeric) then ((monto_recibido / monto_aprobado) * (100)::numeric) else (0)::numeric end
  ) STORED (5, 2) null,
  entidad character varying(100) null,
  numero_referencia character varying(50) null,
  permite_multiples_abonos boolean not null default false,
  carta_aprobacion_url text null,
  carta_asignacion_url text null,
  estado character varying(20) not null default 'Pendiente'::character varying,
  fecha_completado timestamp with time zone null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  constraint fuentes_pago_pkey primary key (id),
  constraint fuentes_pago_negociacion_id_fkey foreign KEY (negociacion_id) references negociaciones (id) on delete CASCADE,
  constraint fuentes_pago_estado_check check (
    ((estado)::text = any ((array['Pendiente'::character varying, 'En Proceso'::character varying, 'Completada'::character varying])::text[]))
  ),
  constraint fuentes_pago_monto_positivo check ((monto_aprobado > (0)::numeric)),
  constraint fuentes_pago_recibido_valido check ((monto_recibido >= (0)::numeric) and (monto_recibido <= monto_aprobado)),
  constraint fuentes_pago_tipo_check check (
    ((tipo)::text = any ((array['Cuota Inicial'::character varying, 'Crédito Hipotecario'::character varying, 'Subsidio Mi Casa Ya'::character varying, 'Subsidio Caja Compensación'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_fuentes_pago_negociacion on public.fuentes_pago using btree (negociacion_id) TABLESPACE pg_default;
create index IF not exists idx_fuentes_pago_tipo on public.fuentes_pago using btree (tipo) TABLESPACE pg_default;
create index IF not exists idx_fuentes_pago_estado on public.fuentes_pago using btree (estado) TABLESPACE pg_default;

-- Triggers
create trigger trigger_update_negociaciones_totales_delete after DELETE on fuentes_pago for EACH row execute FUNCTION update_negociaciones_totales ();
create trigger trigger_update_negociaciones_totales_insert after INSERT on fuentes_pago for EACH row execute FUNCTION update_negociaciones_totales ();
create trigger trigger_update_negociaciones_totales_update after update on fuentes_pago for EACH row execute FUNCTION update_negociaciones_totales ();
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  negociacion_id: string               // ⚠️ uuid → negociaciones(id) ON DELETE CASCADE
  tipo: string                         // ⚠️ varchar(50) - Ver tipos válidos (PascalCase)
  monto_aprobado: number               // ⚠️ numeric(15,2) - Debe ser > 0
  monto_recibido?: number              // ⚠️ numeric(15,2), default 0
  saldo_pendiente: number              // ⚠️ GENERATED COLUMN - READ ONLY
  porcentaje_completado: number        // ⚠️ GENERATED COLUMN - READ ONLY
  entidad?: string                     // ⚠️ varchar(100) | null - Banco/Caja
  numero_referencia?: string           // ⚠️ varchar(50) | null - Radicado
  permite_multiples_abonos: boolean    // ⚠️ boolean, default false
  carta_aprobacion_url?: string        // ⚠️ text | null
  carta_asignacion_url?: string        // ⚠️ text | null
  estado: string                       // ⚠️ varchar(20) - Ver estados válidos (PascalCase)
  fecha_completado?: Date              // ⚠️ timestamptz | null
  fecha_creacion: Date                 // ⚠️ timestamptz, default now()
  fecha_actualizacion: Date            // ⚠️ timestamptz, default now()
}
```

**Tipos de Fuente Válidos (CHECK constraint - PascalCase con espacios):**
- ✅ `'Cuota Inicial'` → permite_multiples_abonos = true
- ✅ `'Crédito Hipotecario'` → permite_multiples_abonos = false
- ✅ `'Subsidio Mi Casa Ya'` → permite_multiples_abonos = false
- ✅ `'Subsidio Caja Compensación'` → permite_multiples_abonos = false

**Estados Válidos (CHECK constraint - PascalCase):**
- ✅ `'Pendiente'` (default)
- ✅ `'En Proceso'`
- ✅ `'Completada'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `negociacion_id` → `negociaciones(id)` con `ON DELETE CASCADE`
- ✅ Check: `monto_aprobado > 0`
- ✅ Check: `monto_recibido >= 0` y `<= monto_aprobado`
- ✅ Check: `tipo` debe estar en lista
- ✅ Check: `estado` debe estar en lista
- ✅ Generated Column: `saldo_pendiente = monto_aprobado - monto_recibido`
- ✅ Generated Column: `porcentaje_completado = (monto_recibido / monto_aprobado) * 100`

**Índices:**
- `idx_fuentes_pago_negociacion` → Búsquedas por negociación (btree)
- `idx_fuentes_pago_tipo` → Filtrado por tipo (btree)
- `idx_fuentes_pago_estado` → Filtrado por estado (btree)

**Triggers (actualizan negociaciones.total_fuentes_pago):**
- `trigger_update_negociaciones_totales_delete` → Al eliminar
- `trigger_update_negociaciones_totales_insert` → Al insertar
- `trigger_update_negociaciones_totales_update` → Al actualizar

**Errores comunes:**
- ❌ Insertar `saldo_pendiente` → ✅ Es GENERATED, se calcula automáticamente
- ❌ Insertar `porcentaje_completado` → ✅ Es GENERATED, se calcula automáticamente
- ❌ `tipo: 'cuota_inicial'` → ✅ `'Cuota Inicial'` (PascalCase con espacios)

---

### 8️⃣ `procesos_negociacion` ⭐ COMPLETADO

```typescript
{
  id: string (UUID)
  negociacion_id: string (UUID)
  tipo: string                 // ⚠️ 'Cuota Inicial' | 'Crédito Hipotecario' | 'Subsidio Mi Casa Ya' | 'Subsidio Caja Compensación'
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number      // ⚠️ CALCULADO (monto_aprobado - monto_recibido)
  porcentaje_completado: number// ⚠️ CALCULADO (monto_recibido / monto_aprobado * 100)

  // Detalles
  entidad: string              // Banco o Caja de Compensación
  numero_referencia: string    // Radicado/Número de crédito

  // Comportamiento
  permite_multiples_abonos: boolean // ⚠️ true solo para 'Cuota Inicial'

  // Documentos
  carta_aprobacion_url: string
  carta_asignacion_url: string

  // Estado
  estado: string               // 'Pendiente' | 'En Proceso' | 'Completada'
  fecha_completado: Date
  fecha_creacion: Date
  fecha_actualizacion: Date
}
```

**Tipos válidos**:
- `'Cuota Inicial'` → permite_multiples_abonos = **true**
- `'Crédito Hipotecario'` → permite_multiples_abonos = **false**
- `'Subsidio Mi Casa Ya'` → permite_multiples_abonos = **false**
- `'Subsidio Caja Compensación'` → permite_multiples_abonos = **false**

**Estados válidos**:
- `'Pendiente'`
- `'En Proceso'`
- `'Completada'`

---

### 8️⃣ `procesos_negociacion`

```typescript
{
  id: string (UUID)
  negociacion_id: string (UUID)
  nombre: string
  descripcion: string
  orden: number
  es_obligatorio: boolean
  permite_omitir: boolean
  estado: string               // 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
  depende_de: string[]         // Array de IDs de procesos previos
  documentos_requeridos: object
  documentos_urls: object
  fecha_inicio: Date
  fecha_completado: Date
  fecha_limite: Date
  notas: string
  motivo_omision: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  usuario_completo: string (UUID)
}
```

---

## 🔍 VISTAS (Views)

### Vista: `intereses_completos`

**Columnas disponibles:**

```typescript
{
  // Todas las columnas de cliente_intereses (i.*)
  ...cliente_intereses_fields,

  // Datos del cliente
  cliente_nombre: string,        // ⚠️ c.nombres
  cliente_apellido: string,      // ⚠️ c.apellidos
  nombre_completo: string,       // ⚠️ c.nombre_completo
  cliente_email: string,
  cliente_telefono: string,
  cliente_documento: string,     // ⚠️ c.numero_documento

  // Datos del proyecto
  proyecto_nombre: string,       // ⚠️ NO "proyecto_ubicacion"
  proyecto_estado: string,       // ⚠️ p.estado (snake_case)

  // Datos de la vivienda
  vivienda_numero: string,
  vivienda_valor: number,        // ⚠️ NO "vivienda_precio"
  vivienda_estado: string,       // ⚠️ v.estado (snake_case)

  // Datos de manzana
  manzana_nombre: string,

  // Campos calculados
  dias_desde_interes: number,    // ⚠️ Calculado, no editable
  seguimiento_urgente: boolean   // ⚠️ Calculado, no editable
}
```

**⚠️ ERRORES COMUNES QUE HEMOS TENIDO:**

1. ❌ `estado_interes` → ✅ `estado` (la columna se llama solo "estado")
2. ❌ `vivienda_precio` → ✅ `vivienda_valor`
3. ❌ `proyecto_ubicacion` → ✅ `proyecto_estado`

---

---

### 9️⃣ `abonos` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.abonos (
  id uuid not null default extensions.uuid_generate_v4 (),
  vivienda_id uuid not null,
  cliente_id uuid not null,
  monto numeric(15, 2) not null,
  fecha_abono timestamp with time zone not null,
  metodo_pago character varying(100) not null,
  comprobante text null,
  observaciones text null,
  fecha_creacion timestamp with time zone null default now(),
  constraint abonos_pkey primary key (id),
  constraint abonos_vivienda_id_fkey foreign KEY (vivienda_id) references viviendas (id) on delete CASCADE,
  constraint abonos_monto_check check ((monto > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_abonos_vivienda_id on public.abonos using btree (vivienda_id) TABLESPACE pg_default;
create index IF not exists idx_abonos_cliente_id on public.abonos using btree (cliente_id) TABLESPACE pg_default;
create index IF not exists idx_abonos_fecha on public.abonos using btree (fecha_abono) TABLESPACE pg_default;
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  vivienda_id: string (UUID)   // ⚠️ Foreign Key → viviendas(id) ON DELETE CASCADE
  cliente_id: string (UUID)    // ⚠️ Foreign Key → clientes(id)
  monto: number                // ⚠️ numeric(15,2) - debe ser > 0
  fecha_abono: Date            // ⚠️ timestamp with time zone
  metodo_pago: string          // ⚠️ varchar(100)
  comprobante?: string         // ⚠️ text | null
  observaciones?: string       // ⚠️ text | null
  fecha_creacion?: Date        // ⚠️ timestamp with time zone, default now()
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **vivienda_id** | `uuid` | ✅ | - | Referencia a vivienda (CASCADE) |
| **cliente_id** | `uuid` | ✅ | - | Referencia al cliente que paga |
| **monto** | `numeric(15,2)` | ✅ | - | Monto del abono (debe ser > 0) |
| **fecha_abono** | `timestamptz` | ✅ | - | Fecha del abono |
| **metodo_pago** | `varchar(100)` | ✅ | - | Método: efectivo, transferencia, etc. |
| **comprobante** | `text` | ❌ | `null` | URL del comprobante |
| **observaciones** | `text` | ❌ | `null` | Notas adicionales |
| **fecha_creacion** | `timestamptz` | ❌ | `now()` | Fecha de registro |

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `vivienda_id` → `viviendas(id)` con `ON DELETE CASCADE`
- ✅ Check: `monto > 0` → El monto debe ser positivo
- ✅ Not Null: `vivienda_id`, `cliente_id`, `monto`, `fecha_abono`, `metodo_pago`

**Índices:**
- `idx_abonos_vivienda_id` → Búsquedas por vivienda (btree)
- `idx_abonos_cliente_id` → Búsquedas por cliente (btree)
- `idx_abonos_fecha` → Búsquedas por fecha (btree)

**Errores comunes:**
- ❌ `abono.valor` → ✅ `abono.monto`
- ❌ `abono.fecha` → ✅ `abono.fecha_abono`
- ❌ `abono.tipo_pago` → ✅ `abono.metodo_pago`

---

### 🔟 `abonos_historial` ⭐ COMPLETADO (Sistema de Auditoría)

**Schema SQL completo:**

```sql
create table public.abonos_historial (
  id uuid not null default gen_random_uuid (),
  negociacion_id uuid not null,
  fuente_pago_id uuid not null,
  monto numeric(15, 2) not null,
  fecha_abono timestamp with time zone not null,
  metodo_pago character varying(50) not null,
  numero_referencia character varying(100) null,
  comprobante_url text null,
  notas text null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  usuario_registro uuid null,
  constraint abonos_historial_pkey primary key (id),
  constraint abonos_historial_fuente_pago_id_fkey foreign KEY (fuente_pago_id) references fuentes_pago (id) on delete CASCADE,
  constraint abonos_historial_negociacion_id_fkey foreign KEY (negociacion_id) references negociaciones (id) on delete CASCADE,
  constraint abonos_historial_usuario_registro_fkey foreign KEY (usuario_registro) references auth.users (id),
  constraint abonos_historial_metodo_pago_check check (
    (
      (metodo_pago)::text = any (
        (
          array[
            'Transferencia'::character varying,
            'Efectivo'::character varying,
            'Cheque'::character varying,
            'Consignación'::character varying,
            'PSE'::character varying,
            'Tarjeta de Crédito'::character varying,
            'Tarjeta de Débito'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint abonos_historial_monto_check check ((monto > (0)::numeric))
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_abonos_historial_negociacion on public.abonos_historial using btree (negociacion_id) TABLESPACE pg_default;
create index IF not exists idx_abonos_historial_fuente on public.abonos_historial using btree (fuente_pago_id) TABLESPACE pg_default;
create index IF not exists idx_abonos_historial_fecha on public.abonos_historial using btree (fecha_abono desc) TABLESPACE pg_default;
create index IF not exists idx_abonos_historial_metodo on public.abonos_historial using btree (metodo_pago) TABLESPACE pg_default;

-- Triggers
create trigger trigger_actualizar_monto_recibido
after INSERT or DELETE or update on abonos_historial for EACH row
execute FUNCTION actualizar_monto_recibido_fuente ();

create trigger trigger_update_abonos_historial_fecha_actualizacion BEFORE
update on abonos_historial for EACH row
execute FUNCTION update_abonos_historial_fecha_actualizacion ();

create trigger trigger_validar_abono_no_excede_saldo BEFORE INSERT or update on abonos_historial for EACH row
execute FUNCTION validar_abono_no_excede_saldo ();
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  negociacion_id: string (UUID)  // ⚠️ Foreign Key → negociaciones(id) ON DELETE CASCADE
  fuente_pago_id: string (UUID)  // ⚠️ Foreign Key → fuentes_pago(id) ON DELETE CASCADE
  monto: number                  // ⚠️ numeric(15,2) - debe ser > 0
  fecha_abono: Date              // ⚠️ timestamp with time zone
  metodo_pago: string            // ⚠️ varchar(50) - Ver métodos válidos abajo
  numero_referencia?: string     // ⚠️ varchar(100) | null
  comprobante_url?: string       // ⚠️ text | null
  notas?: string                 // ⚠️ text | null
  fecha_creacion: Date           // ⚠️ timestamp with time zone, default now()
  fecha_actualizacion: Date      // ⚠️ timestamp with time zone, default now()
  usuario_registro?: string      // ⚠️ uuid | null → auth.users(id)
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `gen_random_uuid()` | Identificador único |
| **negociacion_id** | `uuid` | ✅ | - | Referencia a negociación (CASCADE) |
| **fuente_pago_id** | `uuid` | ✅ | - | Referencia a fuente de pago (CASCADE) |
| **monto** | `numeric(15,2)` | ✅ | - | Monto del abono (debe ser > 0) |
| **fecha_abono** | `timestamptz` | ✅ | - | Fecha del abono |
| **metodo_pago** | `varchar(50)` | ✅ | - | Método de pago (ver valores válidos) |
| **numero_referencia** | `varchar(100)` | ❌ | `null` | Número de referencia/transacción |
| **comprobante_url** | `text` | ❌ | `null` | URL del comprobante |
| **notas** | `text` | ❌ | `null` | Observaciones adicionales |
| **fecha_creacion** | `timestamptz` | ✅ | `now()` | Fecha de creación del registro |
| **fecha_actualizacion** | `timestamptz` | ✅ | `now()` | Fecha de última actualización |
| **usuario_registro** | `uuid` | ❌ | `null` | Usuario que registró (auth.users) |

**Métodos de Pago Válidos (CHECK constraint):**
- ✅ `'Transferencia'`
- ✅ `'Efectivo'`
- ✅ `'Cheque'`
- ✅ `'Consignación'`
- ✅ `'PSE'`
- ✅ `'Tarjeta de Crédito'`
- ✅ `'Tarjeta de Débito'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `negociacion_id` → `negociaciones(id)` con `ON DELETE CASCADE`
- ✅ Foreign Key: `fuente_pago_id` → `fuentes_pago(id)` con `ON DELETE CASCADE`
- ✅ Foreign Key: `usuario_registro` → `auth.users(id)`
- ✅ Check: `monto > 0` → El monto debe ser positivo
- ✅ Check: `metodo_pago` debe estar en la lista de métodos válidos

**Índices:**
- `idx_abonos_historial_negociacion` → Búsquedas por negociación (btree)
- `idx_abonos_historial_fuente` → Búsquedas por fuente de pago (btree)
- `idx_abonos_historial_fecha` → Búsquedas por fecha DESC (btree)
- `idx_abonos_historial_metodo` → Búsquedas por método de pago (btree)

**Triggers activos:**

1. **`trigger_actualizar_monto_recibido`** (AFTER INSERT/DELETE/UPDATE)
   - Actualiza automáticamente `monto_recibido` en `fuentes_pago`
   - Función: `actualizar_monto_recibido_fuente()`

2. **`trigger_update_abonos_historial_fecha_actualizacion`** (BEFORE UPDATE)
   - Actualiza automáticamente `fecha_actualizacion` al modificar
   - Función: `update_abonos_historial_fecha_actualizacion()`

3. **`trigger_validar_abono_no_excede_saldo`** (BEFORE INSERT/UPDATE)
   - Valida que el abono no exceda el saldo pendiente de la fuente
   - Función: `validar_abono_no_excede_saldo()`

**Errores comunes:**
- ❌ `abono_historial.valor` → ✅ `abono_historial.monto`
- ❌ `abono_historial.fecha` → ✅ `abono_historial.fecha_abono`
- ❌ `metodo_pago: 'transferencia'` → ✅ `'Transferencia'` (PascalCase)
- ❌ `metodo_pago: 'tarjeta'` → ✅ `'Tarjeta de Crédito'` o `'Tarjeta de Débito'`

**Ejemplo de uso correcto:**

```typescript
// ✅ CORRECTO
const { data, error } = await supabase
  .from('abonos_historial')
  .insert({
    negociacion_id: negociacionId,
    fuente_pago_id: fuentePagoId,
    monto: 1000000,
    fecha_abono: new Date().toISOString(),
    metodo_pago: 'Transferencia', // PascalCase
    numero_referencia: 'REF-123456',
    comprobante_url: 'https://...',
    notas: 'Primer abono'
  });

// ❌ INCORRECTO
const { data, error } = await supabase
  .from('abonos_historial')
  .insert({
    negociacion: negociacionId,    // ❌ Es "negociacion_id"
    fuente: fuentePagoId,          // ❌ Es "fuente_pago_id"
    valor: 1000000,                // ❌ Es "monto"
    metodo: 'transferencia',       // ❌ Es "metodo_pago" con PascalCase
  });
```

---

### 1️⃣1️⃣ `cliente_intereses` ⭐ COMPLETADO (actualizado en doc)

**Nota**: Esta tabla ya está documentada arriba como tabla 5️⃣. Ver sección completa con todos los campos actualizados.

---

### 1️⃣2️⃣ `audit_log_seguridad` ⭐ COMPLETADO (Sistema de Auditoría)

**Schema SQL completo:**

```sql
create table public.audit_log_seguridad (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo character varying(50) not null,
  usuario_email character varying(255) not null,
  usuario_id uuid null,
  ip_address inet null,
  user_agent text null,
  metadata jsonb null default '{}'::jsonb,
  pais character varying(100) null,
  ciudad character varying(100) null,
  fecha_evento timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint audit_log_seguridad_pkey primary key (id),
  constraint audit_log_seguridad_usuario_id_fkey foreign KEY (usuario_id) references auth.users (id) on delete set null,
  constraint audit_log_seguridad_tipo_check check (
    ((tipo)::text = any ((array['login_exitoso'::character varying, 'login_fallido'::character varying, 'logout'::character varying, 'password_reset_solicitado'::character varying, 'password_reset_completado'::character varying, 'session_expirada'::character varying, 'cuenta_bloqueada'::character varying, 'cuenta_desbloqueada'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_audit_log_usuario_email on public.audit_log_seguridad using btree (usuario_email) TABLESPACE pg_default;
create index IF not exists idx_audit_log_usuario_id on public.audit_log_seguridad using btree (usuario_id) TABLESPACE pg_default;
create index IF not exists idx_audit_log_tipo on public.audit_log_seguridad using btree (tipo) TABLESPACE pg_default;
create index IF not exists idx_audit_log_fecha on public.audit_log_seguridad using btree (fecha_evento desc) TABLESPACE pg_default;
create index IF not exists idx_audit_log_ip on public.audit_log_seguridad using btree (ip_address) TABLESPACE pg_default;
create index IF not exists idx_audit_log_metadata on public.audit_log_seguridad using gin (metadata) TABLESPACE pg_default;
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  tipo: string                    // ⚠️ varchar(50) - Ver tipos válidos
  usuario_email: string           // ⚠️ varchar(255)
  usuario_id?: string             // ⚠️ uuid | null → auth.users(id) ON DELETE SET NULL
  ip_address?: string             // ⚠️ inet | null (tipo PostgreSQL para IPs)
  user_agent?: string             // ⚠️ text | null (navegador/dispositivo)
  metadata?: Record<string, any>  // ⚠️ jsonb | null, default {}
  pais?: string                   // ⚠️ varchar(100) | null
  ciudad?: string                 // ⚠️ varchar(100) | null
  fecha_evento?: Date             // ⚠️ timestamptz | null, default CURRENT_TIMESTAMP
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **tipo** | `varchar(50)` | ✅ | - | Tipo de evento (ver valores válidos) |
| **usuario_email** | `varchar(255)` | ✅ | - | Email del usuario |
| **usuario_id** | `uuid` | ❌ | `null` | ID del usuario (SET NULL al borrar) |
| **ip_address** | `inet` | ❌ | `null` | Dirección IP |
| **user_agent** | `text` | ❌ | `null` | Información del navegador/dispositivo |
| **metadata** | `jsonb` | ❌ | `{}` | Datos adicionales en formato JSON |
| **pais** | `varchar(100)` | ❌ | `null` | País del evento |
| **ciudad** | `varchar(100)` | ❌ | `null` | Ciudad del evento |
| **fecha_evento** | `timestamptz` | ❌ | `CURRENT_TIMESTAMP` | Fecha y hora del evento |

**Tipos de Evento Válidos (CHECK constraint):**
- ✅ `'login_exitoso'`
- ✅ `'login_fallido'`
- ✅ `'logout'`
- ✅ `'password_reset_solicitado'`
- ✅ `'password_reset_completado'`
- ✅ `'session_expirada'`
- ✅ `'cuenta_bloqueada'`
- ✅ `'cuenta_desbloqueada'`

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Foreign Key: `usuario_id` → `auth.users(id)` con `ON DELETE SET NULL`
- ✅ Check: `tipo` debe estar en lista de eventos válidos
- ✅ Not Null: `tipo`, `usuario_email`

**Índices:**
- `idx_audit_log_usuario_email` → Búsquedas por email (btree)
- `idx_audit_log_usuario_id` → Búsquedas por usuario (btree)
- `idx_audit_log_tipo` → Filtrado por tipo de evento (btree)
- `idx_audit_log_fecha` → Ordenamiento temporal DESC (btree)
- `idx_audit_log_ip` → Búsquedas por IP (btree)
- `idx_audit_log_metadata` → Búsquedas en JSON (GIN index)

**Ejemplo de uso:**

```typescript
// ✅ CORRECTO - Registrar login exitoso
const { data, error } = await supabase
  .from('audit_log_seguridad')
  .insert({
    tipo: 'login_exitoso',
    usuario_email: 'user@example.com',
    usuario_id: userId,
    ip_address: '192.168.1.1',
    user_agent: navigator.userAgent,
    metadata: {
      browser: 'Chrome',
      os: 'Windows',
      version: '120.0.0'
    },
    pais: 'Colombia',
    ciudad: 'Cali'
  });
```

---

### 1️⃣3️⃣ `categorias_documento` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.categorias_documento (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  nombre character varying(100) not null,
  descripcion text null,
  color character varying(20) null default 'blue'::character varying,
  icono character varying(50) null default 'Folder'::character varying,
  orden integer null default 0,
  fecha_creacion timestamp with time zone null default now(),
  modulos_permitidos text[] not null default '{proyectos}'::text[],
  es_global boolean not null default false,
  constraint categorias_documento_pkey primary key (id),
  constraint categorias_documento_user_id_nombre_key unique (user_id, nombre),
  constraint categorias_documento_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint check_modulos_permitidos_no_vacio check (
    ((array_length(modulos_permitidos, 1) > 0) or (es_global = true))
  )
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_categorias_user_id on public.categorias_documento using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_categorias_modulos_permitidos on public.categorias_documento using gin (modulos_permitidos) TABLESPACE pg_default;
create index IF not exists idx_categorias_es_global on public.categorias_documento using btree (es_global) TABLESPACE pg_default;
```

**TypeScript Interface:**

```typescript
{
  id: string (UUID)
  user_id: string                 // ⚠️ uuid → auth.users(id) ON DELETE CASCADE
  nombre: string                  // ⚠️ varchar(100)
  descripcion?: string            // ⚠️ text | null
  color?: string                  // ⚠️ varchar(20) | null, default 'blue'
  icono?: string                  // ⚠️ varchar(50) | null, default 'Folder'
  orden?: number                  // ⚠️ integer | null, default 0
  fecha_creacion?: Date           // ⚠️ timestamptz | null, default now()
  modulos_permitidos: string[]    // ⚠️ text[] (array), default ['proyectos']
  es_global: boolean              // ⚠️ boolean, default false
}
```

**Campos detallados:**

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| **id** | `uuid` | ✅ | `uuid_generate_v4()` | Identificador único |
| **user_id** | `uuid` | ✅ | - | Usuario propietario (CASCADE) |
| **nombre** | `varchar(100)` | ✅ | - | Nombre de la categoría |
| **descripcion** | `text` | ❌ | `null` | Descripción de la categoría |
| **color** | `varchar(20)` | ❌ | `'blue'` | Color para UI (ej: 'blue', 'red') |
| **icono** | `varchar(50)` | ❌ | `'Folder'` | Nombre del icono |
| **orden** | `integer` | ❌ | `0` | Orden de visualización |
| **fecha_creacion** | `timestamptz` | ❌ | `now()` | Fecha de creación |
| **modulos_permitidos** | `text[]` | ✅ | `['proyectos']` | Array de módulos donde aplica |
| **es_global** | `boolean` | ✅ | `false` | Si es visible para todos |

**Constraints importantes:**
- ✅ Primary Key: `id`
- ✅ Unique: `(user_id, nombre)` → No duplicados por usuario
- ✅ Foreign Key: `user_id` → `auth.users(id)` con `ON DELETE CASCADE`
- ✅ Check: `modulos_permitidos` debe tener al menos 1 elemento O `es_global = true`
- ✅ Not Null: `user_id`, `nombre`, `modulos_permitidos`, `es_global`

**Índices:**
- `idx_categorias_user_id` → Búsquedas por usuario (btree)
- `idx_categorias_modulos_permitidos` → Búsquedas en array (GIN index)
- `idx_categorias_es_global` → Filtrado por globales (btree)

**Módulos permitidos comunes:**
- `'proyectos'`
- `'clientes'`
- `'negociaciones'`
- `'viviendas'`
- `'general'`

**Ejemplo de uso:**

```typescript
// ✅ CORRECTO - Crear categoría personalizada
const { data, error } = await supabase
  .from('categorias_documento')
  .insert({
    user_id: userId,
    nombre: 'Contratos',
    descripcion: 'Documentos legales y contratos',
    color: 'green',
    icono: 'FileText',
    orden: 1,
    modulos_permitidos: ['proyectos', 'negociaciones'],
    es_global: false
  });
```

---

### 1️⃣4️⃣ `renuncias` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.renuncias (
  id uuid not null default extensions.uuid_generate_v4 (),
  vivienda_id uuid not null,
  cliente_id uuid not null,
  motivo text not null,
  fecha_renuncia timestamp with time zone not null,
  monto_devolucion numeric(15, 2) not null default 0,
  estado character varying(50) not null default 'pendiente'::character varying,
  fecha_creacion timestamp with time zone null default now(),
  fecha_actualizacion timestamp with time zone null default now(),
  constraint renuncias_pkey primary key (id),
  constraint renuncias_vivienda_id_fkey foreign KEY (vivienda_id) references viviendas (id) on delete CASCADE,
  constraint renuncias_estado_check check (
    ((estado)::text = any ((array['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_renuncias_vivienda_id on public.renuncias using btree (vivienda_id) TABLESPACE pg_default;
create index IF not exists idx_renuncias_cliente_id on public.renuncias using btree (cliente_id) TABLESPACE pg_default;
create index IF not exists idx_renuncias_estado on public.renuncias using btree (estado) TABLESPACE pg_default;

-- Trigger
create trigger update_renuncias_fecha_actualizacion BEFORE update on renuncias for EACH row execute FUNCTION update_updated_at_column ();
```

**Estados válidos (CHECK constraint - snake_case lowercase):**
- ✅ `'pendiente'` (default)
- ✅ `'aprobada'`
- ✅ `'rechazada'`

---

### 1️⃣5️⃣ `procesos_negociacion` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.procesos_negociacion (
  id uuid not null default gen_random_uuid (),
  negociacion_id uuid not null,
  nombre character varying(200) not null,
  descripcion text null,
  orden integer not null default 1,
  es_obligatorio boolean not null default true,
  permite_omitir boolean not null default false,
  estado character varying(20) not null default 'Pendiente'::character varying,
  depende_de uuid[] null,
  documentos_requeridos jsonb null,
  documentos_urls jsonb null,
  fecha_inicio timestamp with time zone null,
  fecha_completado timestamp with time zone null,
  fecha_limite timestamp with time zone null,
  notas text null,
  motivo_omision text null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  usuario_completo uuid null,
  constraint procesos_negociacion_pkey primary key (id),
  constraint procesos_negociacion_negociacion_id_fkey foreign KEY (negociacion_id) references negociaciones (id) on delete CASCADE,
  constraint procesos_negociacion_usuario_completo_fkey foreign KEY (usuario_completo) references auth.users (id),
  constraint procesos_negociacion_estado_check check (
    ((estado)::text = any ((array['Pendiente'::character varying, 'En Proceso'::character varying, 'Completado'::character varying, 'Omitido'::character varying])::text[]))
  ),
  constraint procesos_negociacion_orden_positivo check ((orden > 0))
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_procesos_negociacion_negociacion on public.procesos_negociacion using btree (negociacion_id) TABLESPACE pg_default;
create index IF not exists idx_procesos_negociacion_estado on public.procesos_negociacion using btree (estado) TABLESPACE pg_default;
create index IF not exists idx_procesos_negociacion_orden on public.procesos_negociacion using btree (negociacion_id, orden) TABLESPACE pg_default;
```

**Estados válidos (CHECK constraint - PascalCase):**
- ✅ `'Pendiente'` (default)
- ✅ `'En Proceso'`
- ✅ `'Completado'`
- ✅ `'Omitido'`

---

### 1️⃣6️⃣ `documentos_proyecto` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.documentos_proyecto (
  id uuid not null default extensions.uuid_generate_v4 (),
  proyecto_id uuid not null,
  categoria_id uuid null,
  titulo character varying(500) not null,
  descripcion text null,
  nombre_archivo character varying(500) not null,
  nombre_original character varying(500) not null,
  tamano_bytes bigint not null,
  tipo_mime character varying(100) not null,
  url_storage text not null,
  etiquetas text[] null,
  version integer not null default 1,
  es_version_actual boolean not null default true,
  documento_padre_id uuid null,
  estado character varying(50) not null default 'activo'::character varying,
  metadata jsonb null,
  subido_por character varying(255) not null,
  fecha_documento timestamp with time zone null,
  fecha_vencimiento timestamp with time zone null,
  es_importante boolean null default false,
  fecha_creacion timestamp with time zone null default now(),
  fecha_actualizacion timestamp with time zone null default now(),
  constraint documentos_proyecto_pkey primary key (id),
  constraint documentos_proyecto_categoria_id_fkey foreign KEY (categoria_id) references categorias_documento (id) on delete set null,
  constraint documentos_proyecto_documento_padre_id_fkey foreign KEY (documento_padre_id) references documentos_proyecto (id) on delete set null,
  constraint documentos_proyecto_proyecto_id_fkey foreign KEY (proyecto_id) references proyectos (id) on delete CASCADE,
  constraint documentos_proyecto_estado_check check (
    ((estado)::text = any ((array['activo'::character varying, 'archivado'::character varying, 'eliminado'::character varying])::text[]))
  )
) TABLESPACE pg_default;

-- Índices (7 índices incluyendo GIN para arrays)
create index IF not exists idx_documentos_proyecto_id on public.documentos_proyecto using btree (proyecto_id) TABLESPACE pg_default;
create index IF not exists idx_documentos_categoria_id on public.documentos_proyecto using btree (categoria_id) TABLESPACE pg_default;
create index IF not exists idx_documentos_estado on public.documentos_proyecto using btree (estado) TABLESPACE pg_default;
create index IF not exists idx_documentos_fecha_vencimiento on public.documentos_proyecto using btree (fecha_vencimiento) TABLESPACE pg_default;
create index IF not exists idx_documentos_padre_id on public.documentos_proyecto using btree (documento_padre_id) TABLESPACE pg_default;
create index IF not exists idx_documentos_etiquetas on public.documentos_proyecto using gin (etiquetas) TABLESPACE pg_default;
create index IF not exists idx_documentos_importante on public.documentos_proyecto using btree (es_importante) TABLESPACE pg_default;

-- Trigger
create trigger update_documentos_fecha_actualizacion BEFORE update on documentos_proyecto for EACH row execute FUNCTION update_updated_at_column ();
```

**Características**:
- Sistema de versionado (version, es_version_actual, documento_padre_id)
- Etiquetas con GIN index para búsquedas rápidas
- Metadata flexible en JSONB
- Estados: activo, archivado, eliminado

---

### 1️⃣7️⃣ `documentos_cliente` ⭐ COMPLETADO

**Schema similar a documentos_proyecto pero vinculado a clientes**

```sql
create table public.documentos_cliente (
  id uuid not null default extensions.uuid_generate_v4 (),
  cliente_id uuid not null,
  categoria_id uuid null,
  -- [Campos idénticos a documentos_proyecto]
  constraint documentos_cliente_pkey primary key (id),
  constraint documentos_cliente_categoria_id_fkey foreign KEY (categoria_id) references categorias_documento (id) on delete set null,
  constraint documentos_cliente_cliente_id_fkey foreign KEY (cliente_id) references clientes (id) on delete CASCADE,
  constraint documentos_cliente_documento_padre_id_fkey foreign KEY (documento_padre_id) references documentos_cliente (id) on delete set null
) TABLESPACE pg_default;
```

**Diferencia con documentos_proyecto**: Referencia a `cliente_id` en lugar de `proyecto_id`

---

### 1️⃣8️⃣ `plantillas_proceso` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.plantillas_proceso (
  id uuid not null default gen_random_uuid (),
  nombre character varying(200) not null,
  descripcion text null,
  pasos jsonb not null,
  activo boolean not null default true,
  es_predeterminado boolean not null default false,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_actualizacion timestamp with time zone not null default now(),
  usuario_creacion uuid null,
  constraint plantillas_proceso_pkey primary key (id),
  constraint plantillas_proceso_usuario_creacion_fkey foreign KEY (usuario_creacion) references auth.users (id)
) TABLESPACE pg_default;
```

**Características**:
- Almacena plantillas de procesos reutilizables
- Campo `pasos` en JSONB para flexibilidad
- Sistema de activación/desactivación

---

### 1️⃣9️⃣ `configuracion_recargos` ⭐ COMPLETADO

**Schema SQL completo:**

```sql
create table public.configuracion_recargos (
  id uuid not null default extensions.uuid_generate_v4 (),
  tipo character varying(50) not null,
  nombre character varying(100) not null,
  valor numeric(15, 2) not null,
  descripcion text null,
  activo boolean null default true,
  fecha_creacion timestamp with time zone null default now(),
  fecha_actualizacion timestamp with time zone null default now(),
  constraint configuracion_recargos_pkey primary key (id),
  constraint configuracion_recargos_tipo_key unique (tipo)
) TABLESPACE pg_default;

-- Índices
create index IF not exists idx_configuracion_recargos_tipo on public.configuracion_recargos using btree (tipo) TABLESPACE pg_default;
create index IF not exists idx_configuracion_recargos_activo on public.configuracion_recargos using btree (activo) TABLESPACE pg_default;

-- Trigger
create trigger update_configuracion_recargos_fecha_actualizacion BEFORE update on configuracion_recargos for EACH row execute FUNCTION update_updated_at_column ();
```

**Características**:
- Configuración global de recargos
- UNIQUE en `tipo` (solo un registro por tipo)
- Sistema de activación/desactivación

---

## 📝 FUNCIONES PostgreSQL

### `convertir_interes_a_negociacion()`

```sql
convertir_interes_a_negociacion(
  p_interes_id UUID,
  p_valor_negociado DECIMAL,
  p_descuento DECIMAL DEFAULT 0
) RETURNS UUID
```

**Uso desde servicio:**

```typescript
const { data, error } = await supabase.rpc('convertir_interes_a_negociacion', {
  p_interes_id: interesId,
  p_valor_negociado: valorNegociado,
  p_descuento: descuento
})
```

---

## 🛡️ CONVENCIONES DE NOMBRES

### Base de Datos (PostgreSQL)
- **Tablas**: `snake_case` plural o singular según contexto
  - `clientes`, `proyectos`, `viviendas`, `cliente_intereses`
- **Columnas**: `snake_case`
  - `numero_documento`, `fecha_creacion`, `valor_total`
- **Estados de proyectos/viviendas**: `snake_case` lowercase
  - `'en_planificacion'`, `'disponible'`, `'en_construccion'`
- **Estados de intereses**: `PascalCase` con espacios
  - `'Activo'`, `'En Seguimiento'`, `'Negociación'`

### TypeScript (Frontend)
- **Interfaces**: `PascalCase`
  - `Cliente`, `Proyecto`, `ClienteInteres`
- **Propiedades**: `snake_case` (coincide con DB)
  - `cliente.numero_documento`, `vivienda.valor_total`
- **Servicios**: `camelCase`
  - `interesesService`, `proyectosService`

### React (Componentes)
- **Componentes**: `PascalCase` o `kebab-case` en archivos
  - `ClienteDetalle`, `modal-registrar-interes.tsx`
- **Hooks**: `camelCase` con prefijo `use`
  - `useRegistrarInteres`, `useClienteDetalle`

---

## ✅ CHECKLIST ANTES DE CREAR CÓDIGO

Cuando vayas a trabajar con datos de DB:

- [ ] ¿Consulté `DATABASE-SCHEMA-REFERENCE.md`?
- [ ] ¿Verifiqué los nombres EXACTOS de las columnas?
- [ ] ¿Confirmé el formato de los estados (snake_case vs PascalCase)?
- [ ] ¿Revisé si la columna es de una tabla o una vista?
- [ ] ¿Actualicé este documento si agregué campos nuevos?

---

## 🔄 MANTENIMIENTO

**Última actualización**: 2025-10-22

**Cambios recientes**:
- ✅ **DOCUMENTACIÓN COMPLETA** - 19 tablas documentadas al 100%
- ✅ Agregados schemas SQL completos usando "Copy table schema" de Supabase
- ✅ Documentadas todas las tablas CORE del sistema:
  - `clientes`, `proyectos`, `manzanas`, `viviendas`
  - `negociaciones`, `fuentes_pago`, `abonos`, `abonos_historial`
  - `cliente_intereses`, `procesos_negociacion`, `renuncias`
  - `documentos_proyecto`, `documentos_cliente`, `categorias_documento`
  - `audit_log_seguridad`, `plantillas_proceso`, `configuracion_recargos`
- ✅ Confirmados campos GENERATED (nombre_completo, valor_total, saldo_pendiente, etc.)
- ✅ Confirmados nombres exactos: `nombres` (plural), `apellidos` (plural), `numero_documento`
- ✅ Documentados todos los CHECK constraints con valores válidos
- ✅ Documentados todos los índices (btree, GIN para arrays/jsonb)
- ✅ Documentados todos los triggers automáticos
- ✅ Aclarados errores comunes en cada tabla

**Campos NO existentes confirmados**:
- ❌ `clientes.profesion`
- ❌ `clientes.estado_civil`
- ❌ `clientes.empresa`
- ❌ `viviendas.vivienda_precio`
- ❌ `viviendas.vivienda_valor`

**Responsable de actualizar**: Cualquier desarrollador que modifique el schema de DB

---

## 📞 EN CASO DE DUDA

1. **Consulta este documento primero**
2. Si no está aquí: **Verifica en Supabase Table Editor**
3. **Actualiza este documento** con lo que encontraste
4. **Nunca asumas** - siempre verifica

---

> **🎯 Objetivo**: Reducir a CERO los errores de nombres de campos/columnas
