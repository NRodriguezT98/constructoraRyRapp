# 🚀 Guía Paso a Paso: Ejecutar SQL en Supabase

## 📋 Antes de Comenzar

1. **Abre Supabase Dashboard**: https://app.supabase.com
2. **Selecciona tu proyecto**: `constructoraRyRapp` (o el nombre que tenga)
3. **Ve a**: SQL Editor (icono de base de datos en el menú lateral)

---

## ✅ PASO 1: Migrar Tabla Clientes (5 min)

### ¿Qué hace?
- Actualiza la tabla `clientes` existente a la nueva estructura
- Preserva todos los datos actuales
- Añade nuevas columnas (estado, origen, nombres separados, etc.)

### Instrucciones:

1. **En SQL Editor**, haz click en **"New Query"**
2. **Copia y pega** el siguiente SQL completo:

```sql
-- =====================================================
-- MIGRACIÓN: Tabla clientes antigua → nueva estructura
-- =====================================================

-- PASO 1: Renombrar tabla antigua temporalmente
ALTER TABLE IF EXISTS public.clientes RENAME TO clientes_old;

-- PASO 2: Crear nueva tabla clientes con estructura completa
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información Personal
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  nombre_completo VARCHAR(200) GENERATED ALWAYS AS (nombres || ' ' || apellidos) STORED,

  tipo_documento VARCHAR(10) CHECK (tipo_documento IN ('CC', 'CE', 'TI', 'NIT', 'PP', 'PEP')) NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE,

  -- Contacto
  telefono VARCHAR(20),
  telefono_alternativo VARCHAR(20),
  email VARCHAR(100),
  direccion TEXT,
  ciudad VARCHAR(100) DEFAULT 'Cali',
  departamento VARCHAR(100) DEFAULT 'Valle del Cauca',

  -- Estado del Cliente
  estado VARCHAR(20) CHECK (estado IN ('Interesado', 'Activo', 'Inactivo')) DEFAULT 'Interesado' NOT NULL,

  -- Origen/Fuente
  origen VARCHAR(50) CHECK (origen IN (
    'Referido',
    'Página Web',
    'Redes Sociales',
    'Llamada Directa',
    'Visita Oficina',
    'Feria/Evento',
    'Publicidad',
    'Otro'
  )),
  referido_por VARCHAR(200),

  -- Documentos
  documento_identidad_url TEXT,

  -- Notas
  notas TEXT,

  -- Auditoría
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  usuario_creacion UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT clientes_documento_unico UNIQUE(tipo_documento, numero_documento)
);

-- PASO 3: Migrar datos de tabla antigua a nueva
INSERT INTO public.clientes (
  id,
  nombres,
  apellidos,
  tipo_documento,
  numero_documento,
  email,
  telefono,
  direccion,
  estado,
  fecha_creacion,
  fecha_actualizacion
)
SELECT
  id,
  nombre as nombres,
  apellido as apellidos,
  documento_tipo as tipo_documento,
  documento_numero as numero_documento,
  email,
  telefono,
  direccion,
  'Activo' as estado,
  fecha_creacion,
  fecha_actualizacion
FROM clientes_old;

-- PASO 4: Recrear índices
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_numero_documento ON public.clientes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_completo ON public.clientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_clientes_fecha_creacion ON public.clientes(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);

COMMENT ON TABLE public.clientes IS 'Clientes del sistema - pueden existir sin vivienda asignada';
```

3. **Haz click en "Run"** (botón verde en la esquina inferior derecha)
4. **Espera** a que diga "Success" ✅

### ✅ Verificar que funcionó:

Ejecuta este query en una **nueva query**:

```sql
-- Ver cuántos clientes se migraron
SELECT COUNT(*) as clientes_migrados FROM clientes;
SELECT COUNT(*) as clientes_antiguos FROM clientes_old;

-- Ver primeros 5 clientes con nueva estructura
SELECT id, nombre_completo, tipo_documento, numero_documento, estado, origen
FROM clientes
LIMIT 5;
```

**¿Los números coinciden?** ✅ Perfecto, continúa al Paso 2

---

## ✅ PASO 2: Crear Tablas de Negociaciones (5 min)

### ¿Qué hace?
- Crea las tablas: `negociaciones`, `fuentes_pago`, `procesos_negociacion`, `plantillas_proceso`
- Crea triggers automáticos para calcular totales
- Crea vistas útiles para consultas

### Instrucciones:

1. **Nueva Query** → Click en "New Query"
2. **Copia y pega** el SQL del archivo `negociaciones-schema.sql` (es largo, +400 líneas)

**👉 CONSEJO**: En vez de copiar manualmente, usa:

```powershell
# En PowerShell (desde la carpeta del proyecto)
Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard
```

Luego pega en Supabase con `Ctrl+V`

3. **Haz click en "Run"**
4. **Espera** a que termine (puede tardar 10-15 segundos)

### ✅ Verificar que funcionó:

```sql
-- Ver tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso');

-- Debería mostrar 4 tablas
```

**¿Ves 4 tablas?** ✅ Perfecto, continúa al Paso 3

---

## ✅ PASO 3: Aplicar Políticas de Seguridad RLS (2 min)

### ¿Qué hace?
- Habilita Row Level Security (RLS)
- Permite que usuarios autenticados accedan a los datos
- Protege las tablas de acceso no autorizado

### Instrucciones:

1. **Nueva Query** → Click en "New Query"
2. **Copia y pega** el SQL del archivo `clientes-negociaciones-rls.sql`

**👉 CONSEJO**: Usa PowerShell:

```powershell
Get-Content .\supabase\clientes-negociaciones-rls.sql | Set-Clipboard
```

3. **Haz click en "Run"**

### ✅ Verificar que funcionó:

```sql
-- Ver políticas aplicadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago')
LIMIT 10;

-- Deberías ver varias políticas con nombres como "Usuarios autenticados pueden..."
```

**¿Ves las políticas?** ✅ ¡Excelente! Último paso

---

## ✅ PASO 4: Limpiar y Verificar (2 min)

### Eliminar tabla antigua (opcional pero recomendado)

Si todo funcionó bien en el Paso 1, elimina la tabla antigua:

```sql
-- ⚠️ SOLO si verificaste que los datos se migraron correctamente
DROP TABLE IF EXISTS clientes_old CASCADE;
```

### Verificación Final Completa:

```sql
-- 1. Ver estructura de clientes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver vista de clientes con estadísticas
SELECT * FROM vista_clientes_resumen LIMIT 5;

-- 3. Ver tablas del módulo
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%client%' OR table_name LIKE '%negoci%')
ORDER BY table_name;

-- 4. Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('clientes', 'negociaciones', 'fuentes_pago')
ORDER BY event_object_table, trigger_name;
```

---

## 🎉 ¡LISTO! Ahora Regenera los Tipos de TypeScript

### En tu terminal (PowerShell):

```powershell
# Navega a la carpeta del proyecto
cd D:\constructoraRyRapp

# Regenera los tipos (necesitas el Project ID de Supabase)
# Opción 1: Con Supabase CLI instalado
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/supabase/database.types.ts

# Opción 2: Desde Supabase Dashboard
# Ve a Settings → API → Generate Types (copy/paste manual)
```

**Encuentra tu Project ID**:
- Supabase Dashboard → Settings → General → Reference ID

### Reinicia el servidor:

```powershell
# Detener servidor actual (Ctrl+C si está corriendo)

# Iniciar de nuevo
npm run dev
```

---

## ✅ Checklist Final

Marca cada uno cuando lo completes:

- [ ] **Paso 1**: Tabla `clientes` migrada ✅
- [ ] **Paso 2**: Tablas de negociaciones creadas ✅
- [ ] **Paso 3**: Políticas RLS aplicadas ✅
- [ ] **Paso 4**: Tabla antigua eliminada ✅
- [ ] **Tipos**: `database.types.ts` regenerado ✅
- [ ] **Servidor**: Reiniciado sin errores ✅
- [ ] **Verificación**: `/clientes` carga sin errores ✅

---

## 🐛 Solución de Problemas Comunes

### Error: "relation 'clientes_old' already exists" ⚠️ COMÚN
**Causa**: Ya ejecutaste el Paso 1 anteriormente
**Solución**: Tienes 2 opciones:

**Opción A - Solo eliminar clientes_old** (si el Paso 1 ya funcionó):
```sql
-- Eliminar solo la tabla antigua
DROP TABLE IF EXISTS clientes_old CASCADE;

-- Luego continúa con el Paso 2
```

**Opción B - Limpiar todo y empezar de cero**:
```powershell
# En PowerShell, copia el script de limpieza
Get-Content .\supabase\LIMPIAR-MODULO-CLIENTES.sql | Set-Clipboard

# Pega en Supabase y ejecuta
# Luego ejecuta Paso 1, 2 y 3 de nuevo
```

**Opción C - Diagnosticar primero**:
```powershell
# Copia el script de diagnóstico
Get-Content .\supabase\DIAGNOSTICO.sql | Set-Clipboard

# Ejecuta en Supabase para ver qué tienes
# Te dirá exactamente qué hacer
```

### Error: "column X does not exist"
**Causa**: Intentaste ejecutar Paso 2 antes que Paso 1
**Solución**: Ejecuta los pasos en orden

### Error: "relation already exists"
**Causa**: Ya ejecutaste el script antes
**Solución**:
```sql
-- Eliminar tabla y volver a ejecutar
DROP TABLE IF EXISTS nombre_tabla CASCADE;
```

### Error: "permission denied"
**Causa**: No estás autenticado o no tienes permisos
**Solución**: Verifica que estés logueado en Supabase Dashboard

### Error en la app: "relation does not exist"
**Causa**: No regeneraste los tipos TypeScript
**Solución**: Ejecuta `npx supabase gen types...`

### Error: "violates foreign key constraint"
**Causa**: Intentas eliminar una tabla referenciada por otras
**Solución**: Usa `CASCADE` al eliminar:
```sql
DROP TABLE nombre_tabla CASCADE;
```

---

## 📞 ¿Necesitas Ayuda?

Si algo falla:
1. **Copia el mensaje de error completo**
2. **Copia el SQL que estabas ejecutando**
3. **Toma captura del error en Supabase**
4. **Comparte conmigo** y te ayudo a solucionarlo

---

**🎯 Después de esto, el módulo de clientes estará 100% funcional!**
