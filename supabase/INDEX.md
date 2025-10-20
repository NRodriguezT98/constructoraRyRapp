# 🗄️ Índice SQL - Supabase

> **Scripts SQL organizados por categoría**

## 📁 Estructura de Carpetas

```
supabase/
├── migrations/        # ⭐ Migraciones versionadas (NO TOCAR)
├── schemas/          # Definiciones de tablas y esquemas
├── policies/         # Row Level Security (RLS)
├── functions/        # Funciones y triggers
├── storage/          # Configuración de storage
├── verification/     # Scripts de verificación
└── archive/          # SQL obsoletos
```

---

## 📂 migrations/ (NO MODIFICAR)

**⚠️ IMPORTANTE**: Estas migraciones ya se ejecutaron. NO modificar ni re-ejecutar.

- `README.md` - Instrucciones de migraciones
- `PARTE-0-obtener-id-laura.sql`
- `PARTE-1-agregar-campo.sql`
- `PARTE-2-crear-indice.sql`
- `PARTE-3-migrar-cedula-laura.sql`
- `20250120_add_es_documento_identidad.sql`

---

## 📂 schemas/ (Definiciones de Tablas)

### Principal
- **`schema.sql`** ⭐ - Schema completo de la base de datos

### Módulos Específicos
- `clientes-negociaciones-schema.sql` - Negociaciones de clientes
- `cliente-intereses-schema.sql` - Intereses de clientes
- `documentos-cliente-schema.sql` - Documentos por cliente
- `negociaciones-schema.sql` - Tabla de negociaciones
- `viviendas-extended-schema.sql` - Viviendas extendido
- `viviendas-asignacion-cliente.sql` - Asignación de viviendas

### Categorías
- `categorias-tipo-entidad.sql` - Categorías por tipo
- `categorias-modulos-flexibles.sql` - Sistema flexible de categorías
- `categorias-modulos-flexibles-LIMPIO.sql` - Versión limpia

---

## 📂 policies/ (Row Level Security)

### Políticas Principales
- **`rls-policies.sql`** ⭐ - Todas las políticas RLS

### Políticas Específicas
- `clientes-negociaciones-rls.sql` - RLS de negociaciones
- `fix-rls-negociaciones.sql` - Corrección de RLS
- `storage-policies.sql` - Políticas de storage

---

## 📂 functions/ (Funciones SQL)

- `funcion-convertir-interes.sql` - Convertir intereses
- `audit-log-seguridad.sql` - Logs de auditoría

---

## 📂 storage/ (Almacenamiento)

- `storage-setup.sql` - Setup inicial de storage
- `storage-clientes.sql` - Storage para clientes
- `create-storage-bucket.sql` - Crear bucket

---

## 📂 verification/ (Scripts de Verificación)

### Verificación General
- `DIAGNOSTICO.sql` - Diagnóstico completo
- `QUERIES-VERIFICACION.sql` - Queries de verificación

### Verificación de Tablas
- `verificar-estructura-actual.sql` - Estructura actual
- `verificar-columnas-clientes.sql` - Columnas de clientes
- `verificar-tabla-intereses.sql` - Tabla de intereses
- `verificar-cliente-intereses.sql` - Intereses de cliente
- `VERIFICAR-ESTADO-CLIENTES.sql` - Estado de clientes
- `VERIFICAR-SIMPLE.sql` - Verificación simple

### Listados
- `listar-tablas-intereses.sql` - Listar tablas relacionadas

---

## 📂 archive/ (SQL Obsoletos)

Scripts que ya no se usan pero se mantienen por referencia:

- `migracion-clientes.sql` - Migración antigua
- `migracion-clientes-segura.sql` - Migración segura
- `mejorar-cliente-intereses.sql` - Mejoras antiguas
- `LIMPIAR-MODULO-CLIENTES.sql` - Script de limpieza
- `limpiar-categorias-prueba.sql` - Limpiar categorías de prueba
- `crear-tabla-intereses.sql` - Creación antigua
- `EJECUTAR-MEJORAR-INTERESES.sql` - Script de ejecución
- `EJECUTAR-ESTE-SQL-AHORA.sql` - Script urgente antiguo
- `actualizar-vista-intereses.sql` - Actualización de vista

---

## 🎯 Guías de Uso

### ✅ Para Crear Nuevas Tablas:
1. Crear archivo en `schemas/nombre-tabla-schema.sql`
2. Definir la tabla con comentarios
3. Ejecutar en Supabase SQL Editor
4. Crear políticas RLS en `policies/nombre-tabla-rls.sql`

### ✅ Para Modificar Tablas Existentes:
1. **NO modificar** archivos en `migrations/`
2. Crear nueva migración en `migrations/YYYYMMDD_descripcion.sql`
3. Seguir formato de migraciones existentes
4. Ejecutar y probar

### ✅ Para Agregar RLS:
1. Crear/editar archivo en `policies/`
2. Definir políticas SELECT, INSERT, UPDATE, DELETE
3. Probar con diferentes usuarios
4. Verificar con scripts en `verification/`

### ✅ Para Verificar Estado:
1. Usar scripts en `verification/`
2. Ejecutar `DIAGNOSTICO.sql` para ver todo
3. Usar `QUERIES-VERIFICACION.sql` para queries útiles

---

## 🚨 Reglas Importantes

### ❌ NO HACER:
- ❌ Modificar archivos en `migrations/` ya ejecutados
- ❌ Eliminar políticas RLS sin reemplazarlas
- ❌ Ejecutar scripts de `archive/` en producción
- ❌ Modificar `schema.sql` sin respaldo

### ✅ SÍ HACER:
- ✅ Crear nuevas migraciones para cambios
- ✅ Probar en desarrollo antes de producción
- ✅ Documentar cambios en comentarios SQL
- ✅ Verificar con scripts de `verification/`
- ✅ Mantener políticas RLS actualizadas

---

## 📖 Convenciones de Nombres

### Archivos:
```
[modulo]-[tipo].sql           # Ej: clientes-schema.sql
[accion]-[objetivo].sql       # Ej: crear-tabla-intereses.sql
VERIFICAR-[que].sql          # Ej: VERIFICAR-ESTADO-CLIENTES.sql
fix-[problema].sql           # Ej: fix-rls-negociaciones.sql
```

### Migraciones:
```
YYYYMMDD_descripcion.sql     # Ej: 20250120_add_es_documento_identidad.sql
PARTE-N-descripcion.sql      # Ej: PARTE-1-agregar-campo.sql
```

---

## 🔄 Flujo de Trabajo SQL

### 1️⃣ Desarrollo Local
```sql
-- Crear en schemas/ o policies/
-- Probar en Supabase local o dev
-- Verificar con verification/
```

### 2️⃣ Crear Migración
```sql
-- Si es cambio estructural
-- Crear en migrations/YYYYMMDD_descripcion.sql
-- Incluir rollback si es posible
```

### 3️⃣ Ejecutar en Producción
```sql
-- Ejecutar migración
-- Verificar con scripts de verification/
-- Probar funcionalidad
```

### 4️⃣ Documentar
```sql
-- Actualizar este INDEX.md
-- Agregar comentarios en el SQL
-- Documentar en docs/ si es necesario
```

---

## 📞 Referencia Rápida

| Necesito... | Usar... |
|-------------|---------|
| Ver schema completo | `schemas/schema.sql` |
| Verificar tablas | `verification/DIAGNOSTICO.sql` |
| Agregar RLS | `policies/` |
| Crear función | `functions/` |
| Configurar storage | `storage/` |
| Migración nueva | `migrations/` |

---

**Última actualización**: Octubre 20, 2025
**Mantenido por**: Equipo de desarrollo RyR
