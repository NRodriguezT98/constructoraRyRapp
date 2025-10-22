# 🔧 Fix: Campos Inexistentes en Tabla `clientes`

**Fecha**: 2025-10-21
**Módulo**: Abonos
**Severidad**: 🔴 CRÍTICA

---

## ❌ Problema

Error al cargar lista de negociaciones activas:

```
Error: column clientes_1.profesion does not exist
```

**Causa raíz**:
- Intentamos consultar campos (`profesion`, `estado_civil`, `direccion`) que **NO existen en la tabla `clientes`** de la base de datos
- La documentación (`DATABASE-SCHEMA-REFERENCE.md`) mostraba estos campos, pero **no están implementados en la DB real**

---

## ✅ Solución Aplicada

### 1. **Servicio** (`src/modules/abonos/services/abonos.service.ts`)

**ANTES:**
```typescript
clientes(id, nombres, apellidos, numero_documento,
         telefono, email, ciudad, profesion, estado_civil, direccion)
```

**DESPUÉS:**
```typescript
clientes(id, nombres, apellidos, numero_documento,
         telefono, email, ciudad)
```

### 2. **Tipos** (`src/modules/abonos/types/index.ts`)

**ANTES:**
```typescript
export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  profesion?: string;        // ❌ NO EXISTE
  estado_civil?: string;     // ❌ NO EXISTE
  direccion?: string;        // ❌ NO EXISTE
}
```

**DESPUÉS:**
```typescript
export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  numero_documento: string;
  telefono?: string;
  email?: string;
  ciudad?: string;           // ✅ Solo campos verificados
}
```

### 3. **UI** (`src/app/abonos/[clienteId]/page.tsx`)

**CAMBIOS:**
- ✅ Removida tercera columna "Datos Adicionales"
- ✅ Vuelto a diseño de **2 columnas** (Contacto | Vivienda)
- ✅ Grid cambiado de `md:grid-cols-3` a `md:grid-cols-2`

---

## 📚 Lecciones Aprendidas

### 🚨 REGLA CRÍTICA

**NUNCA confiar en la documentación sin verificar en la DB real**

### ✅ Proceso Correcto:

1. **EJECUTAR SQL** en Supabase:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'clientes' AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

2. **VERIFICAR** qué columnas realmente existen

3. **USAR** solo los nombres exactos del resultado

4. **ACTUALIZAR** `DATABASE-SCHEMA-REFERENCE.md` con la verdad

---

## 🔍 Campos Verificados en `clientes`

**Campos que SÍ existen:**
- ✅ `id`
- ✅ `nombres`
- ✅ `apellidos`
- ✅ `numero_documento`
- ✅ `telefono`
- ✅ `email`
- ✅ `ciudad`

**Campos que NO existen (pero estaban en la documentación):**
- ❌ `profesion`
- ❌ `estado_civil`
- ❌ `direccion`
- ❌ `fecha_nacimiento`
- ❌ `empresa`
- ❌ `cargo`
- ❌ `ingresos_mensuales`

---

## 🎯 Estado Actual

✅ **Sin errores de TypeScript**
✅ **Sin errores de compilación**
✅ **Aplicación funcionando correctamente**
✅ **Solo campos verificados en uso**

---

## 📝 Próximos Pasos (Opcional)

Si en el futuro se necesitan estos campos:

1. **Crear migración SQL** para agregar las columnas:
   ```sql
   ALTER TABLE clientes
   ADD COLUMN profesion TEXT,
   ADD COLUMN estado_civil TEXT,
   ADD COLUMN direccion TEXT;
   ```

2. **Ejecutar migración** en Supabase

3. **Verificar con SQL** que se crearon correctamente

4. **Actualizar** tipos e interfaces en el código

5. **Restaurar** la tercera columna en la UI

---

## 🔗 Archivos Modificados

- `src/modules/abonos/services/abonos.service.ts`
- `src/modules/abonos/types/index.ts`
- `src/app/abonos/[clienteId]/page.tsx`

---

**✅ Fix Completado - 2025-10-21**
