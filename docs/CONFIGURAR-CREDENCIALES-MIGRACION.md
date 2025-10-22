# 🔐 Configurar Credenciales para Migraciones desde VS Code

## 📋 Credenciales Necesarias

Para ejecutar migraciones SQL desde VS Code necesitas 2 credenciales adicionales:

1. **Service Role Key** (permisos de administrador)
2. **Database URL** (conexión directa a PostgreSQL)

---

## 🚀 Paso 1: Obtener Service Role Key

### Ve al Dashboard de Supabase:
1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto: **swyjhwgvkfcfdtemkyad**
3. Ve a: **Settings** (⚙️ lateral izquierdo)
4. Click en: **API**
5. Busca la sección: **Project API keys**
6. Encuentra: **service_role** (⚠️ No confundir con `anon`)
7. Click en el ícono de **ojo** para ver la key
8. Click en **Copy** para copiar

### ⚠️ IMPORTANTE:
- Esta key es **SECRETA** (no compartir, no subir a Git)
- Da **acceso total** a la base de datos
- Solo usar en servidor/local, NUNCA en frontend

---

## 🗄️ Paso 2: Obtener Database URL

### Opción A: Connection Pooler (Recomendado)
1. En el Dashboard de Supabase
2. Ve a: **Settings** → **Database**
3. Busca: **Connection string**
4. Selecciona pestaña: **URI**
5. Copia la URL que se ve así:
   ```
   postgresql://postgres.swyjhwgvkfcfdtemkyad:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Reemplaza** `[YOUR-PASSWORD]` con tu contraseña de base de datos

### Opción B: Direct Connection (Alternativa)
Si necesitas conexión directa:
```
postgresql://postgres:[YOUR-PASSWORD]@db.swyjhwgvkfcfdtemkyad.supabase.co:5432/postgres
```

### 🔑 ¿Cuál es mi contraseña?
- Si la recuerdas, úsala
- Si no, puedes cambiarla en: **Settings** → **Database** → **Reset Database Password**

---

## 📝 Paso 3: Agregar al .env.local

Abre el archivo `.env.local` en la raíz del proyecto y agrega:

```bash
# 🔧 SUPABASE ADMIN (Para migraciones y operaciones administrativas)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tu key aquí)

# 🗃️ DATABASE DIRECT CONNECTION (Para psql y migraciones CLI)
DATABASE_URL=postgresql://postgres.swyjhwgvkfcfdtemkyad:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Ejemplo completo:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eWpod2d2a2ZjZmR0ZW1reWFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ1NTg4NCwiZXhwIjoyMDc2MDMxODg0fQ.abc123def456...

DATABASE_URL=postgresql://postgres.swyjhwgvkfcfdtemkyad:MiPassword123!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

## ✅ Paso 4: Verificar Configuración

Una vez agregadas las credenciales, ejecuta este comando para verificar:

```powershell
# Verificar que las variables están cargadas
$env:DATABASE_URL
$env:SUPABASE_SERVICE_ROLE_KEY
```

Si ves las credenciales, ¡estás listo! 🎉

---

## 🚀 Métodos de Ejecución Disponibles

### Método 1: PowerShell Script (Automatizado) ⭐ RECOMENDADO

Ejecuta:
```powershell
.\ejecutar-migraciones.ps1
```

### Método 2: psql Directo (Manual)

```powershell
# Ejecutar cada migración individualmente
psql $env:DATABASE_URL -f supabase/migrations/001_actualizar_estados_clientes.sql
psql $env:DATABASE_URL -f supabase/migrations/002_actualizar_estados_viviendas.sql
# ... etc
```

### Método 3: Supabase Dashboard (Sin credenciales)

Si prefieres NO configurar credenciales locales:
1. Copia el contenido de cada archivo .sql
2. Ve a: Dashboard → SQL Editor
3. Pega y ejecuta uno por uno

---

## 🛡️ Seguridad

### ✅ HACER:
- Mantener `.env.local` en `.gitignore`
- Usar variables de entorno en producción
- Rotar keys periódicamente

### ❌ NO HACER:
- Subir `.env.local` a Git
- Compartir Service Role Key públicamente
- Usar Service Role Key en frontend
- Hardcodear credenciales en código

---

## 🔧 Troubleshooting

### Error: "psql: command not found"
**Solución**: Instalar PostgreSQL Client:
```powershell
winget install PostgreSQL.PostgreSQL
```
Luego reinicia PowerShell.

### Error: "FATAL: password authentication failed"
**Solución**: Verificar que:
1. La contraseña en DATABASE_URL sea correcta
2. No haya espacios extra en la URL
3. El formato sea: `postgresql://postgres.PROJECT:PASSWORD@...`

### Error: "connection refused"
**Solución**:
1. Verificar que el proyecto esté activo en Supabase
2. Comprobar la URL del pooler en Dashboard
3. Intentar con Direct Connection en lugar de Pooler

---

## 📚 Recursos

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Supabase Database Settings](https://supabase.com/dashboard/project/_/settings/database)

---

## 📞 Siguiente Paso

Una vez configuradas las credenciales:

```powershell
# Ver el script de ejecución automática
cat supabase/migrations/README-MIGRACIONES.md

# O ejecutar directamente:
.\ejecutar-migraciones.ps1
```
