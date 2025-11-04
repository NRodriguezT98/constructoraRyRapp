# GUÍA: COPY TABLE SCHEMA (MÉTODO MÁS RÁPIDO)

## 🎯 MÉTODO RECOMENDADO

Este es el método **MÁS FÁCIL** para documentar todas las tablas.

---

## 📋 PASOS PARA CADA TABLA

### 1. En Supabase Table Editor:
   - Click en **Table Editor** (menú izquierdo)
   - Selecciona la tabla (ej: `clientes`)

### 2. Copy Table Schema:
   - Click en el ícono **⋮** (tres puntos) arriba a la derecha
   - Selecciona **"Copy table schema"**
   - Se copiará al portapapeles

### 3. Pegar en archivo temporal:
   - Abre `docs/DATABASE-SCHEMA-REFERENCE.md`
   - Busca la sección de la tabla
   - Pega el schema completo

---

## 📊 EJEMPLO DE RESULTADO

```sql
create table public.clientes (
  id uuid not null default extensions.uuid_generate_v4 (),
  nombres character varying(100) not null,
  apellidos character varying(100) not null,
  numero_documento character varying(20) not null,
  telefono character varying(20) null,
  email character varying(100) null,
  ciudad character varying(100) null,
  created_at timestamp with time zone null default now(),
  constraint clientes_pkey primary key (id),
  constraint clientes_numero_documento_key unique (numero_documento)
) TABLESPACE pg_default;
```

---

## ✅ QUÉ INFORMACIÓN OBTIENES

De ese SQL puedes extraer:

### 1. **Nombre exacto de columnas:**
   ```
   nombres          ✅ (NO "nombre")
   apellidos        ✅ (NO "apellido")
   numero_documento ✅ (NO "cedula")
   ```

### 2. **Tipo de dato:**
   ```
   uuid                           → IDs
   character varying(100)         → Texto con límite
   numeric(15, 2)                 → Dinero (15 dígitos, 2 decimales)
   timestamp with time zone       → Fechas
   ```

### 3. **Si es obligatorio:**
   ```
   not null  → Obligatorio ✅
   null      → Opcional ✅
   ```

### 4. **Valores por defecto:**
   ```
   default extensions.uuid_generate_v4()  → Auto-generado
   default now()                          → Fecha actual
   ```

### 5. **Constraints:**
   ```
   constraint clientes_pkey primary key (id)
   constraint clientes_numero_documento_key unique (numero_documento)
   constraint abonos_monto_check check ((monto > (0)::numeric))
   ```

### 6. **Foreign Keys:**
   ```
   constraint abonos_vivienda_id_fkey
     foreign KEY (vivienda_id)
     references viviendas (id)
     on delete CASCADE
   ```

### 7. **Índices:**
   ```
   create index idx_abonos_vivienda_id
     on public.abonos
     using btree (vivienda_id)
   ```

---

## 🎯 TABLAS PRIORITARIAS (en orden)

Copia el schema de estas tablas en este orden:

1. ✅ **abonos** (ya tienes el ejemplo)
2. ⏳ **clientes**
3. ⏳ **negociaciones**
4. ⏳ **viviendas**
5. ⏳ **fuentes_pago**
6. ⏳ **abonos_historial**
7. ⏳ **proyectos**
8. ⏳ **manzanas**
9. ⏳ **renuncias**
10. ⏳ **documentos**
11. ⏳ **categorias_documentos**

---

## 📝 PLANTILLA PARA DOCUMENTAR

Copia este formato para cada tabla:

```markdown
## TABLA: [nombre_tabla]

### Schema SQL:
\`\`\`sql
[PEGAR AQUÍ EL "COPY TABLE SCHEMA"]
\`\`\`

### Campos principales:

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| id | uuid | ✅ | uuid_generate_v4() | ID único |
| [campo] | [tipo] | ✅/❌ | [valor] | [descripción] |

### Relaciones:
- **vivienda_id** → `viviendas.id` (CASCADE)
- **cliente_id** → `clientes.id`

### Constraints:
- ✅ Primary Key: `id`
- ✅ Unique: `numero_documento`
- ✅ Check: `monto > 0`

### Índices:
- `idx_abonos_vivienda_id` → vivienda_id
- `idx_abonos_cliente_id` → cliente_id
- `idx_abonos_fecha` → fecha_abono

---
```

---

## 🚀 SIGUIENTE PASO

1. Abre `docs/DATABASE-SCHEMA-REFERENCE.md`
2. Copia el schema de cada tabla usando "Copy table schema"
3. Pega en la sección correspondiente
4. Extrae la información de campos para la tabla de resumen

**Tiempo estimado:** 10-15 minutos para las 11 tablas ⚡

---

## ✅ BENEFICIOS DE ESTE MÉTODO

- ✅ **100% confiable** (directo de la DB)
- ✅ **Incluye TODOS los detalles** (constraints, índices, foreign keys)
- ✅ **Rápido** (1 click por tabla)
- ✅ **No requiere ejecutar queries**
- ✅ **Funciona aunque SQL Editor falle**
- ✅ **Formato estándar SQL** (fácil de leer)

---

## 🎓 EJEMPLO COMPLETO: TABLA ABONOS

### Schema SQL:
\`\`\`sql
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
\`\`\`

### Campos extraídos:

| Campo | Tipo | Obligatorio | Default | Descripción |
|-------|------|-------------|---------|-------------|
| id | uuid | ✅ | uuid_generate_v4() | ID único del abono |
| vivienda_id | uuid | ✅ | - | Referencia a vivienda |
| cliente_id | uuid | ✅ | - | Referencia a cliente |
| monto | numeric(15,2) | ✅ | - | Monto del abono (debe ser > 0) |
| fecha_abono | timestamptz | ✅ | - | Fecha del abono |
| metodo_pago | varchar(100) | ✅ | - | Método de pago usado |
| comprobante | text | ❌ | null | URL del comprobante |
| observaciones | text | ❌ | null | Observaciones del abono |
| fecha_creacion | timestamptz | ❌ | now() | Fecha de registro |

### Relaciones:
- **vivienda_id** → `viviendas(id)` ON DELETE CASCADE
- **cliente_id** → `clientes(id)` (implícita)

### Constraints importantes:
- ✅ `monto > 0` → El monto debe ser positivo
- ✅ Primary Key en `id`
- ✅ Foreign Key en `vivienda_id` con CASCADE

---

## 💡 TIPS

1. **Copia exacta**: El "Copy table schema" te da los nombres EXACTOS
2. **Verificación**: Si un campo no aparece aquí, NO EXISTE
3. **Tipos**: Presta atención a `varchar(100)` vs `text`
4. **Plurales**: Confirma si es `nombre` o `nombres`
5. **Snake_case**: Todos los campos usan guion bajo

---

**¿Listo para documentar todas las tablas?** 🚀
