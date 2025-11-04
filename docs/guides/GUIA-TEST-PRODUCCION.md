# 🚀 Guía: Probar Aplicación en Modo Producción

## 📋 ¿Por Qué Probar en Producción?

### Diferencias Clave: Dev vs Producción

| Característica | Dev Mode (`npm run dev`) | Production Mode (`npm run build + start`) |
|---------------|-------------------------|------------------------------------------|
| **Compilación** | On-demand (cuando visitas ruta) | Pre-compilado (todas las rutas) |
| **Optimización** | ❌ Ninguna | ✅ Minificación, tree-shaking, code splitting |
| **Bundle size** | ~10-20 MB | ~2-5 MB (optimizado) |
| **Performance** | 🟡 Lento (hot reload, source maps) | ✅ Rápido (código optimizado) |
| **Caché** | Limitado | Agresivo (Router Cache, Data Cache) |
| **Source maps** | ✅ Completos | ❌ Deshabilitados |
| **React DevTools** | ✅ Activo | ❌ Deshabilitado |
| **HMR** | ✅ Hot Module Replacement | ❌ No disponible |

**En producción, tu app será 2-3x más rápida** ⚡

---

## 🎯 Método 1: Build Local (Recomendado)

### Paso 1: Ejecutar Script Automático

```powershell
# Ejecuta esto en terminal de PowerShell
.\test-production.ps1
```

Este script hace:
1. ✅ Limpia builds anteriores
2. ✅ Crea build optimizado (`npm run build`)
3. ✅ Inicia servidor de producción (`npm run start`)

**Tiempo estimado**: 2-3 minutos para build

---

### Paso 2 (Alternativo): Manual

Si prefieres hacerlo paso a paso:

```powershell
# 1. Limpiar caché
Remove-Item -Recurse -Force .next

# 2. Crear build
npm run build

# 3. Iniciar servidor de producción
npm run start
```

---

### Paso 3: Probar Performance

1. **Abrir navegador**: http://localhost:3000

2. **Limpiar caché del navegador**:
   - Ctrl+Shift+F5 (hard refresh)
   - O F12 → Network → Disable cache

3. **Abrir consola** (F12):
   ```javascript
   clearMetrics()
   ```

4. **Navegar entre módulos**:
   - Clientes → Proyectos → Viviendas → Abonos

5. **Exportar métricas**:
   ```javascript
   exportMetricsReport()
   ```

---

## 📊 Métricas Esperadas

### Dev Mode (Actual)
```json
{
  "metrics": [
    { "route": "/clientes", "totalTime": 238 },
    { "route": "/proyectos", "totalTime": 316 },
    { "route": "/viviendas", "totalTime": 563 },
    { "route": "/abonos", "totalTime": 362 }
  ],
  "summary": {
    "averageTime": 370
  }
}
```

### Production Mode (Esperado)
```json
{
  "metrics": [
    { "route": "/clientes", "totalTime": 120 },  // ← 50% más rápido
    { "route": "/proyectos", "totalTime": 150 }, // ← 52% más rápido
    { "route": "/viviendas", "totalTime": 280 }, // ← 50% más rápido
    { "route": "/abonos", "totalTime": 180 }     // ← 50% más rápido
  ],
  "summary": {
    "averageTime": 182                          // ← 51% más rápido
  }
}
```

**Mejora esperada**: **-50% en tiempos** ⚡

---

## 🎯 Método 2: Vercel Preview Deploy

Si quieres probar en un entorno real (no local):

### Opción A: Vercel CLI

```powershell
# 1. Instalar Vercel CLI (primera vez)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy preview
vercel

# 4. Seguir instrucciones
# Presiona Enter en todo (usa defaults)
```

Te dará un URL como: `https://tu-app-abc123.vercel.app`

---

### Opción B: Vercel Dashboard (Sin CLI)

1. **Ir a**: https://vercel.com/new

2. **Importar proyecto**:
   - Connect GitHub
   - Seleccionar repositorio `constructoraRyRapp`

3. **Configurar**:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-key
   ```

5. **Deploy**:
   - Click "Deploy"
   - Espera 2-3 minutos

6. **Probar**:
   - Abre el URL generado
   - Prueba performance

**Ventajas**:
- ✅ Entorno real de producción
- ✅ CDN global (más rápido)
- ✅ HTTPS automático
- ✅ Sin configuración de servidor

---

## 🔍 Qué Observar en Producción

### 1. Bundle Size (Lighthouse)

```
F12 → Lighthouse → Performance
```

**Métricas importantes**:
- First Contentful Paint (FCP): <1.8s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.8s
- Total Blocking Time (TBT): <200ms

---

### 2. Network Waterfall

```
F12 → Network → Reload
```

**Observa**:
- ✅ JavaScript bundles minificados (.js)
- ✅ CSS optimizado (.css)
- ✅ Imágenes optimizadas (WebP)
- ✅ Caché headers (Cache-Control)

---

### 3. React Profiler (Producción)

En producción, React DevTools NO estará disponible, pero puedes:

```javascript
// Agregar esto temporalmente para debug
if (typeof window !== 'undefined') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    inject: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
  }
}
```

---

## ⚡ Optimizaciones Adicionales de Producción

Next.js aplica automáticamente:

### 1. **Code Splitting**
```javascript
// Cada ruta es un bundle separado
/clientes → clientes.js (150 KB)
/proyectos → proyectos.js (180 KB)
/viviendas → viviendas.js (200 KB)
/abonos → abonos.js (220 KB)

// En vez de un solo bundle de 750 KB
```

### 2. **Tree Shaking**
```javascript
// Dev: Importa toda la librería
import { Button } from 'library' // 500 KB

// Prod: Solo importa lo usado
import { Button } from 'library' // 50 KB
```

### 3. **Minificación**
```javascript
// Dev (legible)
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Prod (minificado)
function c(i){return i.reduce((s,t)=>s+t.p,0)}
```

### 4. **Static Optimization**
```javascript
// Rutas sin data fetching → HTML estático
/login → login.html (generado en build)
/about → about.html (generado en build)

// Rutas con data → SSR
/clientes → SSR (cada request)
```

---

## 🐛 Troubleshooting

### Error: "Module not found"

**Causa**: Imports case-sensitive en producción

**Solución**:
```typescript
// ❌ Mal (funciona en dev, falla en prod)
import { Button } from './Button'  // archivo: button.tsx

// ✅ Bien
import { Button } from './button'  // match exacto
```

---

### Error: "Environment variables undefined"

**Causa**: Variables no tienen prefijo `NEXT_PUBLIC_`

**Solución**:
```bash
# ❌ No disponible en cliente
SUPABASE_URL=...

# ✅ Disponible en cliente
NEXT_PUBLIC_SUPABASE_URL=...
```

---

### Performance Worse in Production

**Causas posibles**:
1. Caché deshabilitado en navegador
2. Network throttling activo
3. Extensions de Chrome interfiriendo

**Solución**:
1. Ctrl+Shift+F5 (hard refresh)
2. Probar en modo incógnito
3. Deshabilitar extensions

---

## 📊 Comparación Final

### Local Dev (Optimizado)
```
Promedio: 370ms
Navegación: Fluida
Bundle: 15 MB
Compilación: On-demand
```

### Local Production
```
Promedio: ~185ms  ← 50% más rápido
Navegación: Instantánea
Bundle: 3 MB     ← 80% más pequeño
Compilación: Pre-compilado
```

### Vercel Production
```
Promedio: ~120ms  ← 68% más rápido
Navegación: Instantánea
Bundle: 3 MB (con CDN)
Compilación: Edge Network
```

---

## ✅ Checklist de Producción

Antes de deploy real:

- [ ] Build local exitoso (`npm run build`)
- [ ] Performance test local (< 200ms promedio)
- [ ] Lighthouse score > 90
- [ ] No console.errors en producción
- [ ] Variables de entorno configuradas
- [ ] Supabase RLS policies activas
- [ ] Analytics configurado (opcional)
- [ ] Error tracking (Sentry/similar) configurado (opcional)

---

## 🚀 Próximos Pasos

1. **Ahora**: Ejecuta `.\test-production.ps1`
2. **Prueba**: Navega y exporta métricas
3. **Compara**: Dev vs Producción
4. **Decide**: ¿Listo para deploy en Vercel?

---

**Última actualización**: 2025-10-24
**Versión**: 1.0
