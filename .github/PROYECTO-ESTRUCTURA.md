# 🏗️ ESTRUCTURA DEL PROYECTO - REFERENCIA CRÍTICA

**⚠️ LEER ANTES DE CREAR CUALQUIER ARCHIVO DE RUTA/PÁGINA ⚠️**

---

## 📁 **UBICACIÓN DEL APP DIRECTORY (NEXT.JS)**

### ✅ **UBICACIÓN CORRECTA** (ÚNICA Y VÁLIDA):

```
d:\constructoraRyRapp\src\app\
```

**Ejemplo de rutas válidas:**

```
src/app/page.tsx                     → /
src/app/layout.tsx                   → Layout raíz
src/app/viviendas/page.tsx          → /viviendas
src/app/viviendas/nueva/page.tsx    → /viviendas/nueva
src/app/proyectos/page.tsx          → /proyectos
```

---

## ❌ **UBICACIONES INCORRECTAS** (NUNCA USAR):

```
❌ app/                           → NO EXISTE, Next.js la ignora
❌ app/viviendas/page.tsx         → ERROR 404
❌ d:\constructoraRyRapp\app\     → CARPETA FANTASMA
```

---

## 📂 **CARPETAS EXISTENTES Y SU PROPÓSITO**

### **Carpetas Activas:**

```
src/app/              ✅ App Router de Next.js (ÚNICA VÁLIDA)
src/modules/          ✅ Módulos de negocio (components, hooks, services)
src/shared/           ✅ Componentes compartidos
src/lib/              ✅ Utilidades y configuraciones
public/               ✅ Archivos estáticos
docs/                 ✅ Documentación
supabase/             ✅ Migraciones SQL
```

### **Carpetas Eliminadas:**

```
app.OLD/              🗑️ ELIMINADA (5 Nov 2025) - Ya no existe
```

---

## 🚨 **REGLA DE ORO AL CREAR RUTAS**

**ANTES de crear cualquier archivo `page.tsx` o `layout.tsx`:**

1. **Verificar**: ¿La ruta ya existe en `src/app/`?

   ```bash
   ls src/app/[modulo]/
   ```

2. **Crear SIEMPRE en**: `src/app/[modulo]/[subruta]/page.tsx`

   ```bash
   # ✅ CORRECTO
   New-Item -Path "src/app/viviendas/nueva/page.tsx" -Force

   # ❌ INCORRECTO
   New-Item -Path "app/viviendas/nueva/page.tsx" -Force
   ```

3. **Nunca crear**: `app/` en la raíz del proyecto

---

## 🔍 **CÓMO VERIFICAR LA UBICACIÓN CORRECTA**

### **Método 1: Buscar archivos existentes**

```bash
ls src/app/
# Salida esperada: (dashboard)/, abonos/, admin/, api/, auditorias/, etc.
```

### **Método 2: Verificar que `app/` NO exista en raíz**

```bash
Test-Path "app/"
# Debe retornar: False
```

### **Método 3: Confirmar estructura en `next.config.js`**

```javascript
// Next.js busca automáticamente en:
// 1. ./app/ (si existe)
// 2. ./src/app/ (si ./app/ no existe) ← NUESTRO CASO
```

---

## 📋 **CHECKLIST ANTES DE CREAR RUTA**

- [ ] ✅ **Confirmar**: `src/app/` es la carpeta correcta
- [ ] ✅ **Verificar**: La ruta NO existe ya
- [ ] ✅ **Usar**: Ruta completa `src/app/[modulo]/[subruta]/page.tsx`
- [ ] ❌ **NO crear**: `app/` en raíz del proyecto
- [ ] ❌ **NO usar**: Rutas de `app.OLD/`

---

## 🛠️ **COMANDOS SEGUROS PARA CREAR RUTAS**

### **Crear nueva ruta en módulo existente:**

```powershell
# Ejemplo: /viviendas/nueva
New-Item -Path "src/app/viviendas/nueva/page.tsx" -ItemType File -Force
```

### **Crear nuevo módulo completo:**

```powershell
# Ejemplo: nuevo módulo "contratos"
New-Item -Path "src/app/contratos" -ItemType Directory -Force
New-Item -Path "src/app/contratos/page.tsx" -ItemType File -Force
New-Item -Path "src/app/contratos/layout.tsx" -ItemType File -Force
```

### **Verificar que NO existe `app/` en raíz:**

```powershell
if (Test-Path "app/") {
    Write-Host "⚠️ ERROR: Carpeta 'app/' existe en raíz (debe estar en src/app/)" -ForegroundColor Red
    Remove-Item "app/" -Recurse -Force
    Write-Host "✅ Carpeta incorrecta eliminada" -ForegroundColor Green
}
```

---

## 📌 **RESUMEN EJECUTIVO**

| Aspecto                | Valor                                 |
| ---------------------- | ------------------------------------- |
| **App Directory**      | `src/app/`                            |
| **Crear rutas en**     | `src/app/[modulo]/[subruta]/page.tsx` |
| **NUNCA crear**        | `app/` en raíz                        |
| **Carpetas obsoletas** | `app.OLD/` (ignorar)                  |

---

## 🔄 **QUÉ HACER SI SE REPITE EL ERROR**

1. **Detener servidor**: `Ctrl+C`
2. **Eliminar `app/` de raíz**: `Remove-Item "app/" -Recurse -Force`
3. **Mover archivos a `src/app/`**:
   ```powershell
   Move-Item "app/[modulo]/*" "src/app/[modulo]/" -Force
   ```
4. **Reiniciar servidor**: `npm run dev`

---

**Última actualización**: 5 de Noviembre 2025
**Propósito**: Evitar errores recurrentes de ubicación de rutas en Next.js
