# ⚡ Optimización Modo Desarrollo - Next.js

## 🎯 Problema Identificado

**Síntoma**: `npm run dev` es lento comparado con `npm run build` + `npm start`

**Causa**: Next.js en desarrollo hace recompilación en tiempo real (HMR), source maps detallados, y sin optimizaciones de bundle.

---

## ✅ Optimizaciones Implementadas

### 1. **Configuración de `next.config.js`**

✅ **SWC Minify** (17x más rápido que Babel)
✅ **Webpack Filesystem Cache** (compila solo lo que cambia)
✅ **Optimización de imports** (librerías grandes como `lucide-react`)
✅ **Cacheo de imágenes** con TTL de 60 segundos
✅ **React Strict Mode** para detectar problemas de renderizado
✅ **Telemetría deshabilitada** (privacidad + velocidad)

---

## 🚀 Optimizaciones Adicionales Recomendadas

### 2. **Usar Turbopack (Next.js 14+)**

Turbopack es el **nuevo bundler** de Next.js, hasta **700x más rápido** que Webpack.

**Activar Turbopack:**
```bash
# En lugar de:
npm run dev

# Usar:
next dev --turbo
```

**Actualizar `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:fast": "next dev --turbo",
    "dev:webpack": "next dev"
  }
}
```

---

### 3. **Optimizar Imports de Librerías**

**❌ ANTES (imports completos):**
```typescript
import { Button, Dialog, Select } from '@radix-ui/react-*'
import * as Icons from 'lucide-react'
```

**✅ DESPUÉS (tree-shaking optimizado):**
```typescript
// Ya está optimizado en next.config.js con optimizePackageImports
import { Home, User, Settings } from 'lucide-react'
```

**Librerías optimizadas automáticamente:**
- `lucide-react` (iconos)
- `framer-motion` (animaciones)
- `@radix-ui/*` (componentes UI)
- `react-hook-form`
- `zod`

---

### 4. **Reducir Componentes Pesados**

**Cargar componentes bajo demanda con `dynamic`:**

```typescript
import dynamic from 'next/dynamic'

// ❌ ANTES: Carga todo de una vez
import { DetalleAuditoriaModal } from './components/DetalleAuditoriaModal'

// ✅ DESPUÉS: Carga solo cuando se necesita
const DetalleAuditoriaModal = dynamic(
  () => import('./components/DetalleAuditoriaModal').then(mod => ({ default: mod.DetalleAuditoriaModal })),
  {
    loading: () => <LoadingState />,
    ssr: false // No renderizar en servidor si no es necesario
  }
)
```

**Aplicar a:**
- Modales grandes (`DetalleAuditoriaModal`)
- Tablas complejas con muchos datos
- Gráficos y visualizaciones
- Componentes de solo cliente (`"use client"`)

---

### 5. **Configurar Variables de Entorno**

Crear `.env.local` con optimizaciones:

```bash
# ⚡ OPTIMIZACIONES DE DESARROLLO
NODE_ENV=development

# Aumentar memoria de Node.js (si tienes RAM suficiente)
NODE_OPTIONS=--max-old-space-size=4096

# Deshabilitar telemetría de Next.js
NEXT_TELEMETRY_DISABLED=1

# Habilitar Fast Refresh optimizado
FAST_REFRESH=true

# Reducir logging (opcional)
NEXT_PUBLIC_VERBOSE_LOGGING=false
```

**Actualizar `package.json`:**
```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo",
    "dev:fast": "cross-env NODE_OPTIONS='--max-old-space-size=4096' NEXT_TELEMETRY_DISABLED=1 next dev --turbo"
  }
}
```

**Instalar `cross-env` para compatibilidad Windows:**
```bash
npm install -D cross-env
```

---

### 6. **Optimizar Queries de Supabase**

**Cachear queries que no cambian frecuentemente:**

```typescript
// ❌ ANTES: Query en cada render
const { data: categorias } = await supabase
  .from('categorias_documento')
  .select('*')

// ✅ DESPUÉS: Cachear con React Query o SWR
import useSWR from 'swr'

const { data: categorias } = useSWR(
  'categorias',
  async () => {
    const { data } = await supabase.from('categorias_documento').select('*')
    return data
  },
  {
    revalidateOnFocus: false, // No revalidar al hacer focus
    dedupingInterval: 60000, // Cache de 1 minuto
  }
)
```

**Instalar SWR:**
```bash
npm install swr
```

---

### 7. **Reducir Re-renderizados Innecesarios**

**Usar `React.memo` en componentes pesados:**

```typescript
// ❌ ANTES: Se re-renderiza en cada cambio del padre
export function AuditoriaCard({ registro }) {
  // Componente pesado
}

// ✅ DESPUÉS: Solo re-renderiza si cambió el registro
export const AuditoriaCard = React.memo(function AuditoriaCard({ registro }) {
  // Componente pesado
})
```

**Usar `useMemo` para cálculos pesados:**

```typescript
// ❌ ANTES: Calcula en cada render
const viviendasFiltradas = viviendas.filter(v => v.estado === filtro)

// ✅ DESPUÉS: Calcula solo cuando cambia viviendas o filtro
const viviendasFiltradas = useMemo(
  () => viviendas.filter(v => v.estado === filtro),
  [viviendas, filtro]
)
```

---

### 8. **Desactivar Source Maps en Desarrollo (si no debuggeas)**

Si no estás debuggeando activamente, puedes desactivar source maps:

**Actualizar `next.config.js`:**
```javascript
const nextConfig = {
  // ...otras configuraciones

  productionBrowserSourceMaps: false, // Ya estaba

  // Solo en desarrollo
  webpack: (config, { dev }) => {
    if (dev) {
      // Desactivar source maps pesados
      config.devtool = 'eval-cheap-module-source-map' // Más rápido que 'source-map'

      // O desactivar completamente (no recomendado si debuggeas)
      // config.devtool = false
    }
    return config
  },
}
```

---

### 9. **Limitar Navegadores Antiguos (si no los necesitas)**

Si solo usas navegadores modernos, puedes desactivar polyfills:

**Crear `.browserslistrc`:**
```
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not IE 11
```

Esto reduce el bundle y la compilación.

---

### 10. **Limpiar Caché Regularmente**

```bash
# Limpiar caché de Next.js
npm run clean

# O manualmente:
rm -rf .next
rm -rf node_modules/.cache
```

**Agregar script en `package.json`:**
```json
{
  "scripts": {
    "clean": "rm -rf .next node_modules/.cache",
    "clean:all": "rm -rf .next node_modules/.cache node_modules && npm install"
  }
}
```

---

## 📊 Comparación de Velocidades

| Optimización | Mejora Estimada | Esfuerzo |
|--------------|-----------------|----------|
| **Turbopack** | 🚀🚀🚀 +700% | ⭐ Bajo (solo cambiar comando) |
| **SWC Minify** | 🚀🚀 +500% | ⭐ Bajo (ya aplicado) |
| **Webpack Cache** | 🚀🚀 +300% | ⭐ Bajo (ya aplicado) |
| **Dynamic Imports** | 🚀 +50-100% | ⭐⭐ Medio |
| **React.memo** | 🚀 +20-50% | ⭐⭐ Medio |
| **SWR/React Query** | 🚀 +30-60% | ⭐⭐⭐ Alto |
| **Source Maps** | 🚀 +20-40% | ⭐ Bajo |

---

## 🎯 Plan de Acción Inmediato

### **Paso 1: Activar Turbopack (2 minutos)**

Actualizar `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

Ejecutar:
```bash
npm run dev
```

---

### **Paso 2: Aumentar Memoria de Node.js (2 minutos)**

Instalar `cross-env`:
```bash
npm install -D cross-env
```

Actualizar `package.json`:
```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--max-old-space-size=4096' next dev --turbo"
  }
}
```

---

### **Paso 3: Verificar Mejoras**

1. Ejecutar `npm run dev`
2. Abrir navegador en `http://localhost:3000`
3. Navegar entre módulos (Proyectos, Viviendas, Auditorías)
4. Comparar con velocidad anterior

**Deberías notar:**
- ✅ Inicio de servidor ~50% más rápido
- ✅ Hot reload ~3-5x más rápido
- ✅ Navegación ~2x más fluida
- ✅ Compilación incremental ~10x más rápida

---

## 🔧 Troubleshooting

### **Problema: Turbopack no funciona**

**Solución:**
```bash
# Verificar versión de Next.js (debe ser 13.4+)
npm list next

# Actualizar Next.js si es necesario
npm install next@latest
```

---

### **Problema: Errores de memoria (FATAL ERROR: Ineffective mark-compacts)**

**Solución:**
```bash
# Aumentar límite de memoria
cross-env NODE_OPTIONS='--max-old-space-size=8192' npm run dev
```

---

### **Problema: Caché corrupto**

**Solución:**
```bash
# Limpiar todo
rm -rf .next node_modules/.cache
npm run dev
```

---

## 📚 Referencias

- [Next.js Turbopack](https://nextjs.org/docs/architecture/turbopack)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Webpack Caching](https://webpack.js.org/configuration/cache/)
- [SWR Data Fetching](https://swr.vercel.app/)

---

## ✅ Checklist de Optimizaciones

- [x] **next.config.js optimizado** (SWC, Webpack Cache, optimizePackageImports)
- [ ] **Turbopack activado** (`next dev --turbo`)
- [ ] **Memoria de Node.js aumentada** (`NODE_OPTIONS`)
- [ ] **Dynamic imports en modales** (DetalleAuditoriaModal, etc.)
- [ ] **React.memo en componentes pesados** (Cards de auditoría/viviendas)
- [ ] **SWR/React Query para cacheo** (categorías, proyectos)
- [ ] **Source maps optimizados** (`eval-cheap-module-source-map`)
- [ ] **Browserslist configurado** (solo navegadores modernos)

---

🚀 **Con estas optimizaciones, tu `npm run dev` debería sentirse casi tan fluido como producción!**
