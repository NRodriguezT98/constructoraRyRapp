# 🎨 Sistema de Theming por Módulo

## 📌 Resumen

Sistema centralizado de colores que permite **reutilizar componentes** en diferentes módulos con paletas de colores distintas. Soluciona el problema de **hardcodear colores** en cada componente.

---

## ✅ Beneficios

✅ **DRY Principle** → Un solo componente, múltiples temas
✅ **Type-safe** → TypeScript valida nombres de módulos
✅ **Mantenible** → Cambios centralizados en un archivo
✅ **Escalable** → Agregar módulos sin duplicar código
✅ **Consistente** → Paletas definidas por diseño

---

## 🚀 Uso Básico

### 1. Importar el sistema

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'
```

### 2. Obtener tema del módulo

```tsx
const theme = moduleThemes.proyectos // Verde
const theme = moduleThemes.clientes   // Cyan/Azul
const theme = moduleThemes.viviendas  // Naranja/Ámbar
```

### 3. Usar clases pre-construidas

```tsx
<button className={theme.classes.button.primary}>
  Guardar
</button>

<div className={`border ${theme.classes.border.light}`}>
  Contenido
</div>
```

---

## 🔧 Ejemplo Completo: Tab de Documentos

### ❌ ANTES (hardcodeado)

```tsx
interface DocumentosTabProps {
  proyecto: Proyecto
}

export function DocumentosTab({ proyecto }: DocumentosTabProps) {
  return (
    <div className='border border-green-200 dark:border-green-800'>
      <button className='bg-gradient-to-r from-green-600 to-emerald-600'>
        Subir Documento
      </button>
    </div>
  )
}
```

**Problemas:**
- Si se usa en Clientes, necesita ser `cyan` en vez de `green`
- Habría que crear `documentos-tab-clientes.tsx` duplicado
- O usar condicionales complejos: `if (module === 'proyectos') ...`

---

### ✅ DESPUÉS (con theming)

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface DocumentosTabProps {
  proyecto: Proyecto
  moduleName?: ModuleName // 👈 Nuevo: tema dinámico
}

export function DocumentosTab({
  proyecto,
  moduleName = 'proyectos'
}: DocumentosTabProps) {
  const theme = moduleThemes[moduleName] // 👈 Obtiene tema dinámicamente

  return (
    <div className={`border ${theme.classes.border.light}`}>
      <button className={theme.classes.button.primary}>
        Subir Documento
      </button>
    </div>
  )
}
```

**Uso en diferentes módulos:**

```tsx
// En Proyectos (verde)
<DocumentosTab proyecto={proyecto} moduleName="proyectos" />

// En Clientes (cyan/azul)
<DocumentosTab cliente={cliente} moduleName="clientes" />

// En Viviendas (naranja/ámbar)
<DocumentosTab vivienda={vivienda} moduleName="viviendas" />
```

---

## 📚 API Reference

### `ModuleTheme` Type

```typescript
interface ModuleTheme {
  name: string

  colors: {
    primary: string    // ej: "green"
    secondary: string  // ej: "emerald"
    tertiary: string   // ej: "teal"
    light: string      // ej: "green-50"
    dark: string       // ej: "green-900"
  }

  classes: {
    gradient: {
      primary: string        // from-X to-Y
      triple: string         // from-X via-Y to-Z
      background: string     // Light mode bg
      backgroundDark: string // Dark mode bg
    }

    button: {
      primary: string    // Botón principal con gradiente
      secondary: string  // Botón outline
      hover: string      // Estado hover
    }

    border: {
      light: string // border-X-200 dark:border-X-800
      dark: string  // border-X-800
      hover: string // hover:border-X-400
    }

    bg: {
      light: string // bg-X-50 dark:bg-X-900/20
      dark: string  // bg-X-900/20
      hover: string // hover:bg-X-50
    }

    focus: {
      ring: string     // focus:ring-2 focus:ring-X-500
      ringDark: string // dark:focus:ring-X-400
    }

    text: {
      primary: string   // text-X-600 dark:text-X-400
      secondary: string // text-X-700 dark:text-X-300
      dark: string      // dark:text-X-400
    }
  }
}
```

---

## 🎨 Paletas de Colores Disponibles

### 🏗️ Proyectos (Verde/Esmeralda/Teal)
```tsx
moduleThemes.proyectos
// primary: green-600
// secondary: emerald-600
// tertiary: teal-600
```

### 👥 Clientes (Cyan/Azul/Índigo)
```tsx
moduleThemes.clientes
// primary: cyan-600
// secondary: blue-600
// tertiary: indigo-600
```

### 🏠 Viviendas (Naranja/Ámbar/Amarillo)
```tsx
moduleThemes.viviendas
// primary: orange-600
// secondary: amber-600
// tertiary: yellow-600
```

### 📊 Auditorías (Azul/Índigo/Púrpura)
```tsx
moduleThemes.auditorias
// primary: blue-600
// secondary: indigo-600
// tertiary: purple-600
```

### 💰 Negociaciones (Rosa/Púrpura/Índigo)
```tsx
moduleThemes.negociaciones
// primary: pink-600
// secondary: purple-600
// tertiary: indigo-600
```

### 💳 Abonos (Azul/Índigo)
```tsx
moduleThemes.abonos
// primary: blue-600
// secondary: indigo-600
```

### 📄 Documentos (Rojo/Rosa/Pink)
```tsx
moduleThemes.documentos
// primary: red-600
// secondary: rose-600
// tertiary: pink-600
```

---

## 💡 Casos de Uso

### 1. Componente con prop de tema

```tsx
interface MiComponenteProps {
  moduleName: ModuleName
}

export function MiComponente({ moduleName }: MiComponenteProps) {
  const theme = moduleThemes[moduleName]

  return (
    <div className={theme.classes.bg.light}>
      <h1 className={theme.classes.text.primary}>Título</h1>
    </div>
  )
}
```

### 2. Hook personalizado para tema

```tsx
function useModuleTheme(moduleName: ModuleName) {
  return moduleThemes[moduleName]
}

// En componente
function MiComponente({ moduleName }: { moduleName: ModuleName }) {
  const theme = useModuleTheme(moduleName)
  // ...
}
```

### 3. Construcción dinámica de clases

```tsx
// Ejemplo: bordes con hover
const borderClasses = `border ${theme.classes.border.light} ${theme.classes.border.hover}`

<div className={borderClasses}>
  Contenido con bordes dinámicos
</div>
```

### 4. Botones con variantes

```tsx
// Botón primario
<button className={theme.classes.button.primary}>
  Guardar
</button>

// Botón secundario
<button className={theme.classes.button.secondary}>
  Cancelar
</button>
```

---

## 📋 Checklist de Migración

Al refactorizar componente existente:

- [ ] Agregar prop `moduleName?: ModuleName`
- [ ] Importar `moduleThemes` y `ModuleName`
- [ ] Obtener tema: `const theme = moduleThemes[moduleName]`
- [ ] Reemplazar colores hardcodeados:
  - [ ] `border-green-200` → `${theme.classes.border.light}`
  - [ ] `bg-green-50` → `${theme.classes.bg.light}`
  - [ ] `from-green-600 to-emerald-600` → `${theme.classes.gradient.primary}`
  - [ ] `focus:ring-green-500` → `${theme.classes.focus.ring}`
  - [ ] `text-green-700` → `${theme.classes.text.secondary}`
- [ ] Validar en modo claro y oscuro
- [ ] Probar con diferentes módulos

---

## 🚀 Agregar Nuevo Módulo

1. **Editar** `src/shared/config/module-themes.ts`
2. **Agregar** tipo en `ModuleName`:

```typescript
export type ModuleName =
  | 'proyectos'
  | 'clientes'
  | 'nuevo-modulo' // 👈 Agregar aquí
```

3. **Agregar** configuración en `moduleThemes`:

```typescript
export const moduleThemes: Record<ModuleName, ModuleTheme> = {
  // ...módulos existentes

  'nuevo-modulo': {
    name: 'Nuevo Módulo',
    colors: {
      primary: 'violet',
      secondary: 'purple',
      tertiary: 'fuchsia',
      light: 'violet-50',
      dark: 'violet-900',
    },
    classes: {
      gradient: {
        primary: 'from-violet-600 to-purple-600',
        triple: 'from-violet-600 via-purple-600 to-fuchsia-600',
        background: 'from-violet-50 to-purple-50',
        backgroundDark: 'from-violet-900/20 to-purple-900/20',
      },
      button: {
        primary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary: 'border border-violet-300 bg-white text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:bg-gray-700 dark:text-violet-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
      },
      border: {
        light: 'border-violet-200 dark:border-violet-800',
        dark: 'border-violet-800',
        hover: 'hover:border-violet-400 dark:hover:border-violet-500',
      },
      bg: {
        light: 'bg-violet-50 dark:bg-violet-900/20',
        dark: 'bg-violet-900/20',
        hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-violet-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-violet-400',
      },
      text: {
        primary: 'text-violet-600 dark:text-violet-400',
        secondary: 'text-violet-700 dark:text-violet-300',
        dark: 'dark:text-violet-400',
      },
    },
  },
}
```

4. **Usar** en componentes:

```tsx
<MiComponente moduleName="nuevo-modulo" />
```

---

## ⚠️ Limitaciones

1. **Tailwind Purging**: Las clases deben existir completas en el código
   - ✅ `className={theme.classes.button.primary}` → OK
   - ❌ `className={`bg-${color}-500`}` → NO funciona (Tailwind no detecta)

2. **IntelliSense**: Menor autocompletado en strings dinámicos
   - Solución: Usar clases pre-construidas en `classes`

3. **Clases no cubiertas**: Si necesitas una clase específica no incluida
   - Solución: Agregar en `ModuleTheme.classes`

---

## 📖 Recursos

- **Archivo principal**: `src/shared/config/module-themes.ts`
- **Ejemplo de uso**: `src/app/proyectos/[id]/tabs/documentos-tab.tsx`
- **Referencia de diseño**: `docs/ESTANDAR-DISENO-VISUAL-MODULOS.md`
- **Paleta Tailwind**: https://tailwindcss.com/docs/customizing-colors

---

## 🎯 Regla de Oro

> **NUNCA hardcodear colores en componentes reutilizables**
> **SIEMPRE usar `moduleThemes` con prop `moduleName`**

Esto asegura que el componente funcione en **cualquier módulo** con su paleta de colores correcta.
