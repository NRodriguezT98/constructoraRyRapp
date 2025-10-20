# 🚀 GUÍA ULTRA-RÁPIDA: 3 Comandos y Listo

## 📋 PASO 1: Verificar qué tienes

```powershell
# En PowerShell:
Get-Content .\supabase\VERIFICAR-SIMPLE.sql | Set-Clipboard
```

Luego:
1. Ve a **Supabase** → SQL Editor → New Query
2. **Pega** (Ctrl+V)
3. **Run** ▶️
4. **Lee el resultado**

---

## ✅ PASO 2: Ejecutar según resultado

### SI dice "ESTRUCTURA NUEVA" ✅
```powershell
# ¡Ya está migrado! Continúa con negociaciones:
Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard
```

### SI dice "ESTRUCTURA ANTIGUA" ⚠️
```powershell
# Necesita migración:
Get-Content .\supabase\migracion-clientes-segura.sql | Set-Clipboard
```

### SI dice "No existe tabla clientes" ❌
```powershell
# Crear estructura base primero:
Get-Content .\supabase\schema.sql | Set-Clipboard
```

Luego en **cada caso**:
1. Pega en Supabase
2. Run ▶️
3. Espera a que termine

---

## 🎯 PASO 3: Continuar con el resto

Después de la migración, ejecuta en orden:

```powershell
# 1. Negociaciones (si no lo hiciste en Paso 2)
Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard

# 2. Políticas RLS
Get-Content .\supabase\clientes-negociaciones-rls.sql | Set-Clipboard
```

---

## 🔧 REGENERAR TIPOS

Al final de todo:

```powershell
# Encuentra tu Project ID en: Supabase → Settings → General → Reference ID
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/supabase/database.types.ts

# Reinicia servidor
npm run dev
```

---

## ✅ VERIFICACIÓN FINAL

```sql
-- Ejecuta esto en Supabase para verificar todo:
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('clientes', 'negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso')
ORDER BY table_name;

-- Deberías ver 5 tablas ✅
```

---

## 🎉 ¡LISTO!

Navega a: `http://localhost:3000/clientes`

**¡Deberías ver el módulo funcionando!** 🚀

---

## 📞 Si algo falla

1. Copia el error COMPLETO
2. Ejecuta el verificador simple de nuevo
3. Comparte ambos resultados conmigo
