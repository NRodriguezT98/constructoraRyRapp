# ✅ Fix: Hydration Mismatch en Toggle de Vista

## 🐛 **Problema**

Error de hidratación de React en `ProyectosFiltrosPremium.tsx`:

```
A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties.
```

### **Causa Raíz:**

El toggle de vista (Cards/Tabla) usa `useVistaPreference` que lee de `localStorage`:

1. **Servidor (SSR):** `localStorage` no existe → Vista default: `'cards'`
2. **Cliente (Hydration):** `localStorage` existe → Vista puede ser `'tabla'`
3. **Resultado:** Clases CSS diferentes entre servidor y cliente

```tsx
// SERVIDOR renderiza:
<button className="... text-gray-600 ...">Cards</button>  // ← Vista: cards

// CLIENTE hidrata con:
<button className="... bg-white text-orange-600 ...">Tabla</button>  // ← Vista: tabla (de localStorage)
```

---

## ✅ **Solución Implementada**

Prevenir renderizado del toggle hasta que el componente esté montado en el cliente:

### **1. Agregar Estado de Montaje**

```tsx
import { useEffect, useState } from 'react'

export function ProyectosFiltrosPremium({ ... }) {
  // ✅ FIX HYDRATION: Evitar mismatch entre servidor y cliente
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ... resto del código
}
```

### **2. Renderizado Condicional del Toggle**

```tsx
{/* Footer con toggle de vista, contador y limpiar */}
<div className={styles.filtros.footer}>
  {/* ✅ Solo renderizar después de montar para evitar hydration mismatch */}
  {mounted && (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => onCambiarVista('cards')}
        className={cn(
          'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
          vista === 'cards'
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        )}
        title="Vista de cards"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Cards</span>
      </button>
      <button
        onClick={() => onCambiarVista('tabla')}
        className={cn(
          'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
          vista === 'tabla'
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        )}
        title="Vista de tabla"
      >
        <Table className="w-3.5 h-3.5" />
        <span>Tabla</span>
      </button>
    </div>
  )}

  {/* Contador y limpiar filtros siguen igual */}
  <p className={styles.filtros.resultCount}>...</p>
  ...
</div>
```

---

## 🔍 **Cómo Funciona**

### **Flujo de Renderizado:**

1. **Primera Renderización (Servidor):**
   - `mounted = false`
   - Toggle NO se renderiza
   - HTML enviado sin botones de vista

2. **Hidratación (Cliente):**
   - `mounted = false` (inicialmente)
   - HTML del servidor coincide ✅
   - No hay mismatch

3. **useEffect Ejecuta (Cliente):**
   - `setMounted(true)`
   - Toggle se renderiza con valor correcto de `localStorage`
   - Ahora sí muestra la vista guardada

### **Resultado:**
- ✅ No hay mismatch de hidratación
- ✅ Toggle aparece después de montar (imperceptible para el usuario)
- ✅ Preferencia de vista se respeta desde `localStorage`

---

## 📊 **Comparación: Antes vs Ahora**

| Aspecto | ❌ Antes | ✅ Ahora |
|---------|---------|---------|
| **Servidor renderiza** | Toggle con vista default | Toggle NO renderizado |
| **Cliente hidrata** | Toggle con vista localStorage | Toggle NO renderizado |
| **Mismatch** | ❌ Sí (classes diferentes) | ✅ No (ambos sin toggle) |
| **useEffect ejecuta** | N/A | Toggle renderizado con localStorage |
| **UX** | Error en consola | Sin errores |
| **Performance** | Mismo | Mismo (solo 1 frame) |

---

## 🎯 **Por Qué Esta Solución**

### **Alternativas Consideradas:**

1. **❌ SSR del valor de localStorage:**
   - Imposible (localStorage no existe en servidor)

2. **❌ Deshabilitar SSR del componente:**
   - `dynamic import` con `ssr: false`
   - Afecta todo el componente (innecesario)

3. **❌ Suprimir warning con `suppressHydrationWarning`:**
   - Oculta el problema, no lo resuelve
   - Mala práctica

4. **✅ Renderizado condicional post-mount:**
   - Solución limpia y estándar
   - Solo afecta el toggle problemático
   - Imperceptible para el usuario (1 frame)

---

## 🔧 **Patrón Reutilizable**

Este patrón se puede aplicar a **cualquier componente que use localStorage/sessionStorage**:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ComponenteConLocalStorage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Leer de localStorage
  const value = mounted ? localStorage.getItem('key') : null

  return (
    <div>
      {/* Renderizar condicionalmente elementos que dependen de localStorage */}
      {mounted && <ElementoQueUsaLocalStorage value={value} />}

      {/* Elementos estáticos pueden renderizarse siempre */}
      <ElementoEstatico />
    </div>
  )
}
```

---

## 📝 **Casos de Uso Similares**

Este fix se aplica a:

- ✅ Toggle de tema (dark/light) con preferencia guardada
- ✅ Toggle de vista (cards/tabla/grid)
- ✅ Preferencias de usuario (idioma, timezone, etc.)
- ✅ Estados de UI guardados (sidebar colapsado, etc.)
- ✅ Valores de formularios guardados temporalmente

---

## ⚠️ **Errores Comunes a Evitar**

### **1. Leer localStorage en render inicial**
```tsx
// ❌ MAL
const [vista, setVista] = useState(localStorage.getItem('vista') || 'cards')

// ✅ BIEN
const [vista, setVista] = useState('cards') // Default SSR-safe
useEffect(() => {
  const saved = localStorage.getItem('vista')
  if (saved) setVista(saved)
}, [])
```

### **2. No usar `mounted` para renderizado condicional**
```tsx
// ❌ MAL: Sigue causando mismatch
return (
  <button className={vista === 'cards' ? 'active' : ''}>
    Cards
  </button>
)

// ✅ BIEN: Solo renderizar después de montar
return mounted ? (
  <button className={vista === 'cards' ? 'active' : ''}>
    Cards
  </button>
) : null
```

### **3. Usar `suppressHydrationWarning` indiscriminadamente**
```tsx
// ❌ MAL: Oculta el problema
<div suppressHydrationWarning>
  {/* Código con mismatch */}
</div>

// ✅ BIEN: Resolver la causa raíz con mounted
{mounted && <div>{/* Código correcto */}</div>}
```

---

## 🧪 **Testing**

### **Verificar que el error desapareció:**

1. Abrir DevTools (F12)
2. Navegar a `/proyectos`
3. Verificar que **NO aparece** el warning:
   ```
   A tree hydrated but some attributes of the server
   rendered HTML didn't match the client properties
   ```

### **Verificar funcionalidad:**

1. ✅ Toggle de vista funciona correctamente
2. ✅ Preferencia se guarda en localStorage
3. ✅ Al recargar, se muestra la vista guardada
4. ✅ No hay flash de contenido (FOUC)

---

## 📚 **Referencias**

- [React Hydration Docs](https://react.dev/link/hydration-mismatch)
- [Next.js Hydration Guide](https://nextjs.org/docs/messages/react-hydration-error)
- [Common Hydration Fixes](https://nextjs.org/docs/messages/react-hydration-error#solution-1-using-useeffect-to-run-on-the-client-only)

---

**Archivo modificado:** `src/modules/proyectos/components/ProyectosFiltrosPremium.tsx`
**Líneas cambiadas:** +8
**Estado:** ✅ Resuelto
**Fecha:** 13 de noviembre de 2025
