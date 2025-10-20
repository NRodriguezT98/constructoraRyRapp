# 🎯 Resumen Ejecutivo: Ejecutar SQL en Supabase

## 📋 ¿Qué vas a hacer?

Ejecutar 3 scripts SQL en Supabase para activar el módulo de clientes:

1. **Migrar clientes** (actualizar estructura existente)
2. **Crear negociaciones** (nuevas tablas)
3. **Aplicar seguridad** (políticas RLS)

**Tiempo estimado**: 15 minutos

---

## 🚀 Método Rápido (Con Scripts)

### Opción 1: Usar el Script de PowerShell

```powershell
# En la terminal, ejecuta:
.\copiar-sql.ps1

# Sigue el menú interactivo:
# 1 → Copia Paso 1 al portapapeles
# 2 → Copia Paso 2 al portapapeles
# 3 → Copia Paso 3 al portapapeles
# V → Copia queries de verificación
```

Luego en Supabase:
1. SQL Editor → New Query
2. Pega (Ctrl+V)
3. Run

### Opción 2: Copiar Manualmente con PowerShell

```powershell
# PASO 1: Copiar migración de clientes
Get-Content .\supabase\migracion-clientes.sql | Set-Clipboard

# PASO 2: Copiar negociaciones
Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard

# PASO 3: Copiar políticas RLS
Get-Content .\supabase\clientes-negociaciones-rls.sql | Set-Clipboard

# VERIFICACIÓN: Copiar queries de verificación
Get-Content .\supabase\QUERIES-VERIFICACION.sql | Set-Clipboard
```

---

## 📖 Guías Disponibles

### 1. **EJECUTAR-SQL-PASO-A-PASO.md** ⭐ MÁS DETALLADA
Guía completa con:
- ✅ Instrucciones paso a paso
- ✅ SQL incluido en el documento
- ✅ Queries de verificación
- ✅ Solución de problemas
- ✅ Checklist final

**Abre con**:
```powershell
code .\EJECUTAR-SQL-PASO-A-PASO.md
```

### 2. **INSTRUCCIONES-EJECUCION.md**
Guía original con referencias a archivos SQL

**Abre con**:
```powershell
code .\supabase\INSTRUCCIONES-EJECUCION.md
```

### 3. **QUERIES-VERIFICACION.sql**
Queries para verificar que todo funcionó

**Abre con**:
```powershell
code .\supabase\QUERIES-VERIFICACION.sql
```

---

## ✅ Checklist Rápido

Sigue este orden:

### Antes de Empezar
- [ ] Abre Supabase Dashboard (https://app.supabase.com)
- [ ] Selecciona tu proyecto
- [ ] Ve a SQL Editor

### Ejecución
- [ ] **Paso 1**: Ejecuta `migracion-clientes.sql`
  - Verifica: `SELECT COUNT(*) FROM clientes;`

- [ ] **Paso 2**: Ejecuta `negociaciones-schema.sql`
  - Verifica: Ver que existan las 4 tablas nuevas

- [ ] **Paso 3**: Ejecuta `clientes-negociaciones-rls.sql`
  - Verifica: Ver que existan políticas RLS

### Después
- [ ] Elimina tabla antigua: `DROP TABLE clientes_old CASCADE;`
- [ ] Regenera tipos TypeScript
- [ ] Reinicia servidor: `npm run dev`
- [ ] Prueba navegando a `/clientes`

---

## 🎯 Queries de Verificación Esenciales

### Verificar Migración de Clientes
```sql
SELECT COUNT(*) as clientes FROM clientes;
SELECT * FROM clientes LIMIT 3;
```

### Verificar Tablas Creadas
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso');
```

### Verificar Vista de Resumen
```sql
SELECT * FROM vista_clientes_resumen LIMIT 3;
```

### Verificar Políticas RLS
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('clientes', 'negociaciones', 'fuentes_pago')
LIMIT 10;
```

---

## 🐛 Problemas Comunes

### "column X does not exist"
- **Causa**: Ejecutaste pasos fuera de orden
- **Solución**: Ejecuta Paso 1 primero

### "relation already exists"
- **Causa**: Ya ejecutaste el script antes
- **Solución**: Elimina la tabla y vuelve a ejecutar
  ```sql
  DROP TABLE IF EXISTS nombre_tabla CASCADE;
  ```

### "permission denied"
- **Causa**: No estás logueado o rol incorrecto
- **Solución**: Verifica que estés en tu proyecto correcto

---

## 🔧 Regenerar Tipos TypeScript

Después de ejecutar todo el SQL:

```powershell
# Encuentra tu Project ID en: Settings → General → Reference ID

# Opción 1: Con Supabase CLI
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/supabase/database.types.ts

# Opción 2: Manual desde Dashboard
# Settings → API → Generate Types → Copiar código → Pegar en database.types.ts
```

---

## 📞 ¿Necesitas Ayuda?

Si algo falla:
1. Copia el error completo
2. Copia el SQL que ejecutaste
3. Toma captura de pantalla
4. Pregúntame y te ayudo

---

## 📁 Archivos Clave

```
constructoraRyRapp/
├── EJECUTAR-SQL-PASO-A-PASO.md     ⭐ GUÍA PRINCIPAL
├── copiar-sql.ps1                   🔧 Script helper
├── supabase/
│   ├── INSTRUCCIONES-EJECUCION.md   📖 Guía original
│   ├── QUERIES-VERIFICACION.sql     ✅ Verificación
│   ├── migracion-clientes.sql       1️⃣ PASO 1
│   ├── negociaciones-schema.sql     2️⃣ PASO 2
│   └── clientes-negociaciones-rls.sql 3️⃣ PASO 3
```

---

## 🎉 Al Terminar

Verás funcionando:
- ✅ Módulo de clientes con datos migrados
- ✅ Vista de estadísticas
- ✅ Grid de clientes
- ✅ Sin errores en consola
- ✅ Todo el CRUD funcional

---

**💡 CONSEJO**: Usa `EJECUTAR-SQL-PASO-A-PASO.md` para instrucciones detalladas.

**🚀 ¡Adelante! Todo está listo para ejecutar.**
