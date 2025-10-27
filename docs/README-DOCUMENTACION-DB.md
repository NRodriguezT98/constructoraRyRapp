# 📚 Sistema de Documentación de Base de Datos

## 🎯 Objetivo

Eliminar completamente los errores causados por:
- ❌ Asumir nombres de campos que no existen
- ❌ Usar nombres incorrectos de columnas
- ❌ Documentación desactualizada
- ❌ Copiar código sin verificar

## � NUEVO: Script Automatizado (Recomendado)

**Ejecuta desde la raíz del proyecto:**

```powershell
.\scripts\actualizar-docs-db-simple.ps1
```

✅ **Extrae automáticamente:**
- Todas las tablas y columnas
- Tipos de datos
- Campos requeridos/opcionales
- Valores por defecto
- ENUMs (tipos personalizados)
- Foreign Keys (relaciones)

✅ **Genera:** `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`

**Requisitos:**
- PostgreSQL instalado (`psql` en PATH)
- `.env.local` configurado con `DATABASE_URL`

---

## �🔄 Proceso Completo

### 1️⃣ Generar Documentación (Cuando cambies la DB)

**OPCIÓN A: Script Automatizado (Recomendado)**
```powershell
# Ejecutar script automatizado
.\scripts\actualizar-docs-db-simple.ps1
```

**OPCIÓN B: Manual (Alternativa)**

```powershell
# Ejecutar script automatizado
.\actualizar-docs-db.ps1
```

**O manualmente:**

1. Abre Supabase SQL Editor
2. Ejecuta: `supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql`
3. Copia todos los resultados
4. Actualiza `docs/DATABASE-SCHEMA-REFERENCE.md`
5. Actualiza la fecha de última modificación

### 2️⃣ Consultar Antes de Desarrollar (SIEMPRE)

```powershell
# Abrir documentación
code "docs/DATABASE-SCHEMA-REFERENCE.md"
```

**Antes de escribir código:**
- ✅ Verificar nombres exactos de tablas
- ✅ Verificar nombres exactos de columnas
- ✅ Verificar tipos de datos
- ✅ Verificar campos obligatorios vs opcionales
- ✅ Verificar valores de enums

### 3️⃣ Desarrollar con Confianza

```typescript
// ✅ CORRECTO - Nombres verificados en la documentación
const { data } = await supabase
  .from('clientes')
  .select('id, nombres, apellidos, numero_documento, telefono, email')
```

```typescript
// ❌ INCORRECTO - Nombres asumidos sin verificar
const { data } = await supabase
  .from('clientes')
  .select('id, nombre, apellido, cedula, telefono, email')  // Error!
```

## 📁 Archivos del Sistema

### 🔧 Scripts

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `supabase/migrations/GENERAR-DOCUMENTACION-COMPLETA-DB.sql` | Genera info completa de DB | Después de modificar esquema |
| `actualizar-docs-db.ps1` | Automatiza el proceso | Cada vez que cambies DB |

### 📖 Documentación

| Archivo | Propósito | Cuándo Consultar |
|---------|-----------|------------------|
| `docs/DATABASE-SCHEMA-REFERENCE.md` | Fuente única de verdad | SIEMPRE antes de desarrollar |
| `docs/DATABASE-SCHEMA-REFERENCE-TEMPLATE.md` | Template para actualizar | Al generar nueva documentación |
| `docs/GUIA-DOCUMENTACION-DB.md` | Guía completa del proceso | Primera vez o para recordar |
| `docs/DESARROLLO-CHECKLIST.md` | Checklist de desarrollo | Antes de cada tarea |

## ⚡ Atajos Rápidos

### Verificar una tabla específica:

```sql
-- En Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'nombre_tabla'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Abrir todos los archivos necesarios:

```powershell
# PowerShell
code "docs/DATABASE-SCHEMA-REFERENCE.md"
code "docs/GUIA-DOCUMENTACION-DB.md"
code "docs/DESARROLLO-CHECKLIST.md"
```

## 🚨 Reglas Críticas

### ❌ NUNCA:
- Asumir nombres de campos sin verificar
- Copiar nombres de código antiguo sin validar
- Usar documentación con >7 días de antigüedad sin verificar
- Inventar nombres "lógicos" sin confirmar

### ✅ SIEMPRE:
- Consultar `DATABASE-SCHEMA-REFERENCE.md` antes de desarrollar
- Actualizar la documentación después de cambiar el esquema
- Copiar nombres exactos desde la documentación
- Verificar en Supabase si hay alguna duda

## 📊 Ejemplos de Uso

### Caso 1: Crear un nuevo servicio

```typescript
// PASO 1: Consultar DATABASE-SCHEMA-REFERENCE.md
// PASO 2: Copiar nombres exactos

export async function obtenerClientes() {
  // ✅ Nombres verificados en la documentación
  const { data, error } = await supabase
    .from('clientes')  // ✅ Tabla verificada
    .select(`
      id,
      nombres,              // ✅ Campo verificado (plural)
      apellidos,            // ✅ Campo verificado (plural)
      numero_documento,     // ✅ Campo verificado (NO "cedula")
      telefono,
      email,
      ciudad
    `);

  return data;
}
```

### Caso 2: Usar relaciones (Foreign Keys)

```typescript
// PASO 1: Consultar sección de relaciones en la documentación
// PASO 2: Verificar estructura: viviendas → manzanas → proyectos

const { data } = await supabase
  .from('viviendas')
  .select(`
    *,
    manzana:manzanas(     // ✅ Relación verificada
      id,
      nombre,
      proyecto:proyectos(  // ✅ Relación verificada
        id,
        nombre
      )
    )
  `)
```

### Caso 3: Verificar valores de enum

```typescript
// PASO 1: Consultar sección de enums en la documentación
// PASO 2: Usar valores exactos

// ✅ Valores verificados en DATABASE-SCHEMA-REFERENCE.md
type EstadoNegociacion =
  | 'En Proceso'
  | 'Cierre Financiero'
  | 'Activa'
  | 'Completada'
  | 'Cancelada'
  | 'Renuncia';
```

## 🔄 Flujo de Trabajo Recomendado

```
┌─────────────────────────────────────┐
│  Modificar esquema de DB            │
│  (agregar/cambiar tabla/columna)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Ejecutar .\actualizar-docs-db.ps1  │
│  o manual en Supabase               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Actualizar                         │
│  DATABASE-SCHEMA-REFERENCE.md       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Commit documentación               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Desarrollar código usando          │
│  nombres verificados                │
└─────────────────────────────────────┘
```

## 📈 Métricas de Éxito

Con este sistema, deberías lograr:

- ✅ **0 errores** de "column does not exist"
- ✅ **0 errores** de nombres de campos incorrectos
- ✅ **100% confianza** en los nombres que usas
- ✅ **Documentación siempre actualizada**

## 🆘 Solución de Problemas

### Error: "column does not exist"

1. ✅ Abre `DATABASE-SCHEMA-REFERENCE.md`
2. ✅ Busca la tabla mencionada en el error
3. ✅ Verifica si el campo existe realmente
4. ✅ Si no existe en la documentación: ejecuta query de verificación
5. ✅ Actualiza la documentación si es necesario

### Documentación parece desactualizada

1. ✅ Ejecuta `.\actualizar-docs-db.ps1`
2. ✅ Sigue las instrucciones del script
3. ✅ Actualiza `DATABASE-SCHEMA-REFERENCE.md`
4. ✅ Commit los cambios

### No estoy seguro de un nombre de campo

1. ✅ **NO ASUMAS**
2. ✅ Abre Supabase SQL Editor
3. ✅ Ejecuta query de verificación:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'tu_tabla' AND table_schema = 'public';
   ```
4. ✅ Usa el nombre exacto que devuelve el query
5. ✅ Actualiza la documentación

## 🎓 Capacitación

Para nuevos desarrolladores:

1. Lee `docs/GUIA-DOCUMENTACION-DB.md`
2. Ejecuta `.\actualizar-docs-db.ps1` una vez para familiarizarte
3. Revisa `docs/DESARROLLO-CHECKLIST.md`
4. Practica consultando `DATABASE-SCHEMA-REFERENCE.md` antes de cada tarea

## 📞 Soporte

Si tienes dudas sobre el proceso:
1. Consulta `docs/GUIA-DOCUMENTACION-DB.md`
2. Revisa los ejemplos en este README
3. Verifica los archivos de ejemplo en el proyecto

---

**✅ Siguiendo este sistema, los errores de nombres de campos serán cosa del pasado**
