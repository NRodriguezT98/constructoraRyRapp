# 🎨 Demostración Visual: Sistema de Theming

## Componente: DocumentosTab

### 📄 Código del Componente (Refactorizado)

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface DocumentosTabProps {
  proyecto: Proyecto
  moduleName?: ModuleName // 👈 Prop para tema dinámico
}

export function DocumentosTab({
  proyecto,
  moduleName = 'proyectos'
}: DocumentosTabProps) {
  const theme = moduleThemes[moduleName] // 👈 Obtiene tema

  return (
    <div className={`border ${theme.classes.border.light}`}>
      <button className={theme.classes.button.primary}>
        Subir Documento
      </button>
    </div>
  )
}
```

---

## 🌈 Visualización por Módulo

### 🏗️ Proyectos (Verde/Esmeralda)

```tsx
<DocumentosTab proyecto={proyecto} moduleName="proyectos" />
```

**Resultado:**
```css
/* Borde */
border-green-200 dark:border-green-800

/* Botón */
bg-gradient-to-r from-green-600 to-emerald-600
hover:from-green-700 hover:to-emerald-700
text-white shadow-md hover:shadow-lg
```

**Colores hexadecimales:**
- `green-600`: #16a34a
- `emerald-600`: #059669
- `teal-600`: #0d9488

---

### 👥 Clientes (Cyan/Azul)

```tsx
<DocumentosTab cliente={cliente} moduleName="clientes" />
```

**Resultado:**
```css
/* Borde */
border-cyan-200 dark:border-cyan-800

/* Botón */
bg-gradient-to-r from-cyan-600 to-blue-600
hover:from-cyan-700 hover:to-blue-700
text-white shadow-md hover:shadow-lg
```

**Colores hexadecimales:**
- `cyan-600`: #0891b2
- `blue-600`: #2563eb
- `indigo-600`: #4f46e5

---

### 🏠 Viviendas (Naranja/Ámbar)

```tsx
<DocumentosTab vivienda={vivienda} moduleName="viviendas" />
```

**Resultado:**
```css
/* Borde */
border-orange-200 dark:border-orange-800

/* Botón */
bg-gradient-to-r from-orange-600 to-amber-600
hover:from-orange-700 hover:to-amber-700
text-white shadow-md hover:shadow-lg
```

**Colores hexadecimales:**
- `orange-600`: #ea580c
- `amber-600`: #d97706
- `yellow-600`: #ca8a04

---

### 📊 Auditorías (Azul/Índigo/Púrpura)

```tsx
<DocumentosTab auditoria={auditoria} moduleName="auditorias" />
```

**Resultado:**
```css
/* Borde */
border-blue-200 dark:border-blue-800

/* Botón */
bg-gradient-to-r from-blue-600 to-indigo-600
hover:from-blue-700 hover:to-indigo-700
text-white shadow-md hover:shadow-lg
```

**Colores hexadecimales:**
- `blue-600`: #2563eb
- `indigo-600`: #4f46e5
- `purple-600`: #9333ea

---

### 💰 Negociaciones (Rosa/Púrpura)

```tsx
<DocumentosTab negociacion={negociacion} moduleName="negociaciones" />
```

**Resultado:**
```css
/* Borde */
border-pink-200 dark:border-pink-800

/* Botón */
bg-gradient-to-r from-pink-600 to-purple-600
hover:from-pink-700 hover:to-purple-700
text-white shadow-md hover:shadow-lg
```

**Colores hexadecimales:**
- `pink-600`: #db2777
- `purple-600`: #9333ea
- `indigo-600`: #4f46e5

---

## 📊 Comparativa de Paletas

| Módulo | Primario | Secundario | Terciario |
|--------|----------|------------|-----------|
| Proyectos | 🟢 Verde (#16a34a) | 🟢 Esmeralda (#059669) | 🔵 Teal (#0d9488) |
| Clientes | 🔵 Cyan (#0891b2) | 🔵 Azul (#2563eb) | 🟣 Índigo (#4f46e5) |
| Viviendas | 🟠 Naranja (#ea580c) | 🟡 Ámbar (#d97706) | 🟡 Amarillo (#ca8a04) |
| Auditorías | 🔵 Azul (#2563eb) | 🟣 Índigo (#4f46e5) | 🟣 Púrpura (#9333ea) |
| Negociaciones | 🌸 Rosa (#db2777) | 🟣 Púrpura (#9333ea) | 🟣 Índigo (#4f46e5) |
| Abonos | 🔵 Azul (#2563eb) | 🟣 Índigo (#4f46e5) | 🟣 Púrpura (#9333ea) |
| Documentos | 🔴 Rojo (#dc2626) | 🌸 Rosa (#f43f5e) | 🌸 Pink (#ec4899) |

---

## 🎯 Ventajas del Sistema

### 1. **Un componente, múltiples colores**
```tsx
// ❌ ANTES: 3 componentes duplicados
DocumentosTabProyectos.tsx  // Verde hardcodeado
DocumentosTabClientes.tsx   // Cyan hardcodeado
DocumentosTabViviendas.tsx  // Naranja hardcodeado

// ✅ DESPUÉS: 1 componente reutilizable
DocumentosTab.tsx           // Colores dinámicos con prop
```

### 2. **Cambios centralizados**
```typescript
// Cambiar paleta de Proyectos en UN solo lugar:
// src/shared/config/module-themes.ts

proyectos: {
  colors: {
-   primary: 'green',
+   primary: 'lime',
    // Afecta todos los componentes automáticamente
  }
}
```

### 3. **Type-safe con autocomplete**
```tsx
// TypeScript valida el nombre del módulo
<DocumentosTab moduleName="proyectos" /> // ✅ OK
<DocumentosTab moduleName="clientes" />  // ✅ OK
<DocumentosTab moduleName="inventario" /> // ❌ Error: no existe
```

---

## 📝 Ejemplo Completo: Botones

```tsx
const theme = moduleThemes[moduleName]

// Botón primario (gradiente)
<button className={theme.classes.button.primary}>
  Guardar
</button>

// Botón secundario (outline)
<button className={theme.classes.button.secondary}>
  Cancelar
</button>

// Input con focus ring
<input className={theme.classes.focus.ring} />

// Badge con fondo
<span className={theme.classes.bg.light}>
  Nueva
</span>
```

**Resultado en Proyectos (verde):**
- Botón primario: Verde gradiente
- Botón secundario: Borde verde, texto verde
- Input focus: Ring verde
- Badge: Fondo verde claro

**Resultado en Clientes (cyan):**
- Botón primario: Cyan gradiente
- Botón secundario: Borde cyan, texto cyan
- Input focus: Ring cyan
- Badge: Fondo cyan claro

---

## 🔧 Clases Disponibles por Categoría

### Gradientes
```typescript
theme.classes.gradient.primary        // from-X to-Y
theme.classes.gradient.triple         // from-X via-Y to-Z
theme.classes.gradient.background     // Light mode
theme.classes.gradient.backgroundDark // Dark mode
```

### Botones
```typescript
theme.classes.button.primary   // Gradiente principal
theme.classes.button.secondary // Outline
theme.classes.button.hover     // Estado hover
```

### Bordes
```typescript
theme.classes.border.light // border-X-200 dark:border-X-800
theme.classes.border.dark  // border-X-800
theme.classes.border.hover // hover:border-X-400
```

### Backgrounds
```typescript
theme.classes.bg.light // bg-X-50 dark:bg-X-900/20
theme.classes.bg.dark  // bg-X-900/20
theme.classes.bg.hover // hover:bg-X-50
```

### Focus Rings
```typescript
theme.classes.focus.ring     // focus:ring-2 focus:ring-X-500
theme.classes.focus.ringDark // dark:focus:ring-X-400
```

### Texto
```typescript
theme.classes.text.primary   // text-X-600 dark:text-X-400
theme.classes.text.secondary // text-X-700 dark:text-X-300
theme.classes.text.dark      // dark:text-X-400
```

---

## 🎨 Mockup Visual

```
┌──────────────────────────────────────────────────────────┐
│  PROYECTOS (Verde)                                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📄 Documentos del Proyecto        [Subir] ←verde │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  CLIENTES (Cyan)                                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📄 Documentos del Cliente         [Subir] ←cyan  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  VIVIENDAS (Naranja)                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📄 Documentos de la Vivienda      [Subir] ←naranja│ │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Mismo componente, diferentes colores automáticamente** 🎉
