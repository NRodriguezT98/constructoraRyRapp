# 🚨 SOLUCIÓN RÁPIDA AL ERROR: "relation clientes_old does not exist"

## ✅ SOLUCIÓN EN 3 PASOS

### **PASO 1: Verificar Estado Actual** 🔍

```powershell
# En PowerShell, ejecuta:
.\copiar-sql.ps1

# Selecciona: [0] Verificar Estado
```

O copia manualmente:
```powershell
Get-Content .\supabase\VERIFICAR-ESTADO-CLIENTES.sql | Set-Clipboard
```

Luego:
1. Ve a Supabase → SQL Editor → New Query
2. Pega (Ctrl+V)
3. Click "Run"
4. **Lee el resultado** para saber qué hacer

---

### **PASO 2: Ejecutar Migración Segura** ✅

Este script verifica automáticamente qué existe y hace lo correcto:

```powershell
# En PowerShell:
.\copiar-sql.ps1

# Selecciona: [1] Paso 1: Migración de Clientes (Segura)
```

O copia manualmente:
```powershell
Get-Content .\supabase\migracion-clientes-segura.sql | Set-Clipboard
```

Luego:
1. Supabase → SQL Editor → New Query
2. Pega
3. Click "Run"
4. **¡Debería funcionar sin errores!** ✅

---

### **PASO 3: Continuar con Negociaciones** 🚀

```powershell
# En PowerShell:
.\copiar-sql.ps1

# Selecciona: [2] Paso 2: Crear Negociaciones
```

---

## 🎯 ALTERNATIVA: Empezar de Cero (Si nada funciona)

Si los scripts de arriba no funcionan, limpia todo y empieza fresco:

```powershell
# 1. Copiar script de limpieza
.\copiar-sql.ps1
# Selecciona: [L] Limpiar Todo

# 2. Ejecutar en Supabase
# Esto elimina: clientes, clientes_old, negociaciones, etc.

# 3. Ejecutar migración segura
.\copiar-sql.ps1
# Selecciona: [1] Migración Segura

# 4. Ejecutar negociaciones
# Selecciona: [2] Negociaciones

# 5. Ejecutar RLS
# Selecciona: [3] RLS
```

---

## 📊 DIAGNÓSTICO DETALLADO (Opcional)

Si quieres ver un reporte completo de tu BD:

```powershell
.\copiar-sql.ps1
# Selecciona: [D] Diagnóstico Completo
```

---

## 🛠️ COMANDOS RÁPIDOS DE POWERSHELL

```powershell
# Verificar estado
Get-Content .\supabase\VERIFICAR-ESTADO-CLIENTES.sql | Set-Clipboard

# Migración segura
Get-Content .\supabase\migracion-clientes-segura.sql | Set-Clipboard

# Limpiar todo
Get-Content .\supabase\LIMPIAR-MODULO-CLIENTES.sql | Set-Clipboard

# Diagnóstico
Get-Content .\supabase\DIAGNOSTICO.sql | Set-Clipboard

# Negociaciones
Get-Content .\supabase\negociaciones-schema.sql | Set-Clipboard

# RLS
Get-Content .\supabase\clientes-negociaciones-rls.sql | Set-Clipboard
```

---

## ✅ CHECKLIST DESPUÉS DE CADA PASO

### Después del Paso 1 (Migración):
```sql
-- Verificar que funcionó:
SELECT COUNT(*) FROM clientes;
SELECT column_name FROM information_schema.columns WHERE table_name = 'clientes' AND column_name = 'nombres';
-- Si devuelve 'nombres', ¡éxito! ✅
```

### Después del Paso 2 (Negociaciones):
```sql
-- Verificar tablas creadas:
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('negociaciones', 'fuentes_pago', 'procesos_negociacion', 'plantillas_proceso');
-- Deberías ver las 4 tablas ✅
```

### Después del Paso 3 (RLS):
```sql
-- Verificar políticas:
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clientes';
-- Debería devolver 4 ✅
```

---

## 🎉 AL TERMINAR TODO

```powershell
# Regenerar tipos TypeScript
# (Necesitas tu Project ID de Supabase)
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/supabase/database.types.ts

# Reiniciar servidor
npm run dev

# Probar en navegador
# http://localhost:3000/clientes
```

---

## 📞 ¿SIGUE SIN FUNCIONAR?

Si después de ejecutar `migracion-clientes-segura.sql` sigues con errores:

1. **Copia el error COMPLETO** que ves en Supabase
2. **Ejecuta el diagnóstico** y copia el resultado
3. **Comparte ambos conmigo** y te ayudo específicamente

---

**💡 TIP**: El script `migracion-clientes-segura.sql` es inteligente y detecta qué existe antes de hacer cambios. Es seguro ejecutarlo múltiples veces.

**🚀 RECOMENDACIÓN**: Siempre ejecuta primero `[0] Verificar Estado` para saber exactamente qué tienes.
