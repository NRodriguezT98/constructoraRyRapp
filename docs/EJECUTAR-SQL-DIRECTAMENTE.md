# 🚀 Ejecutar SQL Directamente en Supabase

## 📋 PROBLEMA RESUELTO

**Antes:** Copiar/Pegar SQL manualmente en Supabase SQL Editor
**Ahora:** Ejecutar SQL directamente desde terminal ✅

---

## 🎯 USO RÁPIDO

### Método 1: NPM Script (Recomendado)

```bash
# Ejecutar cualquier archivo SQL
npm run db:exec supabase/storage/storage-documentos-viviendas.sql

# Alias predefinido para storage de viviendas
npm run db:exec:storage-viviendas
```

### Método 2: Node.js Directo

```bash
node ejecutar-sql.js supabase/storage/storage-documentos-viviendas.sql
node ejecutar-sql.js supabase/migrations/mi-migracion.sql
node ejecutar-sql.js cualquier-archivo.sql
```

### Método 3: PowerShell (Con psql instalado)

```powershell
.\ejecutar-sql.ps1 -SqlFile "supabase\storage\storage-documentos-viviendas.sql"
.\ejecutar-sql.ps1 -SqlFile "supabase\storage\storage-documentos-viviendas.sql" -ShowSql
```

---

## 📦 REQUISITOS

### ✅ Ya instalado:
- ✅ Node.js
- ✅ npm
- ✅ Paquete `pg` (instalado automáticamente)

### ⚙️ Configuración:
- ✅ `.env.local` con `DATABASE_URL` configurado

---

## 🔧 CONFIGURACIÓN INICIAL

Si es la primera vez, verifica que `.env.local` tenga:

```bash
# Obtener en: Supabase Dashboard > Settings > Database > Connection String > URI
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxxx.supabase.co:5432/postgres
```

---

## 📖 EJEMPLOS DE USO

### Ejemplo 1: Ejecutar políticas de Storage

```bash
node ejecutar-sql.js supabase/storage/storage-documentos-viviendas.sql
```

**Salida esperada:**
```
=======================================================
   🗄️  EJECUTAR SQL EN SUPABASE
=======================================================

→ Validando archivo SQL...
✓ Archivo: supabase\storage\storage-documentos-viviendas.sql
✓ Líneas: 139

→ Cargando configuración...
✓ Conectando a: db.xxxx.supabase.co:5432/postgres

→ Estableciendo conexión...
✓ Conexión establecida

→ Ejecutando SQL...

=======================================================
   ✅ SQL EJECUTADO EXITOSAMENTE
=======================================================

Tiempo de ejecución: 312ms
```

### Ejemplo 2: Ejecutar migración

```bash
node ejecutar-sql.js supabase/migrations/20250106000001_sistema_documentos_viviendas.sql
```

### Ejemplo 3: Ejecutar verificación

```bash
node ejecutar-sql.js supabase/verification/verificar-esquema-documentos.sql
```

---

## 🛠️ SCRIPTS DISPONIBLES

### `ejecutar-sql.js` (Node.js - RECOMENDADO ✅)
- ✅ **Ventajas:**
  - No requiere psql instalado
  - Funciona en Windows, Mac, Linux
  - Salida formateada y coloreada
  - Manejo de errores detallado
  - Muestra tiempo de ejecución
  - Compatible con SSL de Supabase

- ⚙️ **Requisitos:**
  - Node.js (ya instalado)
  - Paquete `pg` (instalado)
  - `.env.local` con `DATABASE_URL`

### `ejecutar-sql.ps1` (PowerShell con psql)
- ✅ **Ventajas:**
  - Soporte nativo de PostgreSQL
  - Ideal para scripts complejos
  - Parámetro `-ShowSql` para previsualizar

- ⚠️ **Requisitos:**
  - PostgreSQL instalado: `winget install PostgreSQL.PostgreSQL`
  - `.env.local` con `DATABASE_URL`

### `ejecutar-sql-simple.ps1` (PowerShell sin psql)
- ℹ️ Solo copia al portapapeles
- Útil como fallback

---

## 📚 CASOS DE USO

### 1. Crear políticas RLS de Storage
```bash
npm run db:exec:storage-viviendas
```

### 2. Ejecutar migraciones manualmente
```bash
node ejecutar-sql.js supabase/migrations/001_crear_tabla_xxx.sql
```

### 3. Insertar datos de prueba
```bash
node ejecutar-sql.js supabase/seeds/datos-prueba.sql
```

### 4. Verificar estructura
```bash
node ejecutar-sql.js supabase/verification/DIAGNOSTICO.sql
```

### 5. Limpiar base de datos
```bash
node ejecutar-sql.js supabase/maintenance/limpieza-bd-27oct2025.sql
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "DATABASE_URL no encontrado"

**Solución:**
```bash
# Agregar en .env.local:
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
```

Obtener en: **Supabase Dashboard → Settings → Database → Connection String → URI**

---

### Error: "ECONNREFUSED" o "Connection timeout"

**Causas:**
- Firewall bloqueando puerto 5432
- IP no permitida en Supabase

**Solución:**
1. Ve a **Supabase Dashboard → Settings → Database → Connection Pooling**
2. Agrega tu IP a la whitelist
3. O desactiva "SSL enforcement" temporalmente

---

### Error: "permission denied for schema storage"

**Causa:** Intentando crear objetos en schema `storage` sin permisos

**Solución:**
- Usa el Service Role Key en `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

### SQL ejecutado pero no hay cambios

**Verificar:**
```bash
# Ver resultado en Supabase Dashboard:
# Storage > Buckets (para buckets)
# Database > Policies (para RLS)
# SQL Editor > "History" (para ver queries ejecutadas)
```

---

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

✅ **Automatización:** No más copy/paste manual
✅ **Versionado:** SQL en Git, ejecutable en cualquier momento
✅ **Reproducible:** Mismo resultado en dev/staging/prod
✅ **Auditable:** Log de ejecución con timestamps
✅ **Rápido:** Ejecución directa sin abrir navegador
✅ **CI/CD Ready:** Integrable en pipelines de deployment

---

## 📝 SCRIPTS NPM AGREGADOS

```json
{
  "scripts": {
    "db:exec": "node ejecutar-sql.js",
    "db:exec:storage-viviendas": "node ejecutar-sql.js supabase/storage/storage-documentos-viviendas.sql"
  }
}
```

**Agregar más según necesites:**
```json
{
  "db:exec:rls-clientes": "node ejecutar-sql.js supabase/policies/clientes-negociaciones-rls.sql",
  "db:exec:seed": "node ejecutar-sql.js supabase/seeds/datos-iniciales.sql"
}
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Ejecutar storage de viviendas:
   ```bash
   npm run db:exec:storage-viviendas
   ```

2. ✅ Probar en navegador (ver + descargar documentos)

3. ✅ Crear más scripts en `package.json` según necesites

---

## 📌 NOTAS IMPORTANTES

- ⚠️ **Producción:** Usa migraciones versionadas, no ejecutes SQL directo
- 🔒 **Seguridad:** Nunca subas `.env.local` a Git
- 📝 **Logs:** El script muestra tiempo de ejecución y filas afectadas
- 🔄 **Idempotencia:** Asegúrate que tus SQL sean re-ejecutables (`IF NOT EXISTS`, `DROP IF EXISTS`)

---

**Autor:** Sistema automatizado RyR
**Fecha:** 2025-11-07
**Versión:** 1.0
