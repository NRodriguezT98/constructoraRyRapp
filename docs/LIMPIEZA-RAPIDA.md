# 🧹 LIMPIEZA COMPLETA - INSTRUCCIONES RÁPIDAS

## ⚡ Inicio Rápido (3 minutos)

### 1️⃣ Verificar qué se eliminará (OPCIONAL)
```powershell
# Abrir Supabase SQL Editor
# https://supabase.com/dashboard/project/jqfbnggglbdiqbqtkubu/sql/new

# Copiar y ejecutar:
# supabase/migrations/VERIFICACION-ANTES-LIMPIEZA.sql
```

### 2️⃣ Ejecutar limpieza completa
```powershell
cd d:\constructoraRyRapp
.\limpiar-sistema-completo.ps1
```

### 3️⃣ Confirmar
- Primera confirmación: `SI ELIMINAR TODO`
- Segunda confirmación: `constructoraRyRapp`

### 4️⃣ Ejecutar SQL
1. Se abrirá Supabase SQL Editor automáticamente
2. Copiar TODO el archivo: `supabase/migrations/LIMPIEZA_COMPLETA_BASE_DATOS.sql`
3. Pegar en el editor
4. Click "Run"

### 5️⃣ ✅ Listo!
El sistema quedará completamente limpio y listo para empezar de cero.

---

## 📋 Archivos Disponibles

| Archivo | Propósito | Cuándo usar |
|---------|-----------|-------------|
| `limpiar-sistema-completo.ps1` | **Script maestro** | Limpieza completa guiada |
| `limpiar-storage-completo.ps1` | Solo Storage | Limpiar solo archivos |
| `LIMPIEZA_COMPLETA_BASE_DATOS.sql` | Solo Base de Datos | Limpiar solo registros |
| `VERIFICACION-ANTES-LIMPIEZA.sql` | Ver datos actuales | Antes de decidir |

---

## ⚠️ Recordatorios

- ❌ **NO** hay función de deshacer
- ❌ **NO** se crean backups automáticos
- ✅ **SÍ** se mantiene la estructura
- ✅ **SÍ** se mantienen los usuarios
- ✅ **SÍ** se mantienen las **plantillas de proceso** 🛡️
- ✅ **SÍ** funciona en producción (pero NO deberías)

---

## 🛡️ Archivos Protegidos (NO se eliminan)

El script automáticamente protege:
- 📁 Carpeta completa: `procesos/plantillas/`
- 📄 Archivos que empiezan con: `plantilla-`
- 📄 Templates: archivos `template*` en bucket `procesos`

**Tus plantillas están seguras** ✅

---

## 🆘 Problemas Comunes

### Error: "cannot be loaded because running scripts is disabled"
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Error: "401 Unauthorized" en Storage
Verificar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
```

### Error: "permission denied" en SQL
Tu usuario necesita permisos de administrador en Supabase.

---

## 📚 Documentación Completa

Ver: `docs/GUIA-LIMPIEZA-COMPLETA-SISTEMA.md`

---

**¿Listo para empezar?**
```powershell
.\limpiar-sistema-completo.ps1
```
