# ✅ CHECKLIST: Implementación Sistema de Diseño UX

> **Guía paso a paso para aplicar jerarquía visual consistente**

---

## 🎯 OBJETIVO

Transformar diseños con **"demasiados estilos, ninguno protagonista"** en interfaces **claras, escaneables y funcionales**.

---

## 📋 FASE 1: PREPARACIÓN (30 minutos)

### **A. Leer Documentación Base**

- [ ] Leer completo: `SISTEMA-DISENO-UX-JERARQUIA-VISUAL.md`
- [ ] Leer completo: `REFACTOR-CLIENTE-HEADER-EJEMPLO-CODIGO.md`
- [ ] Leer completo: `REFACTOR-DOCUMENTOS-TAB-EJEMPLO-CODIGO.md`
- [ ] Identificar módulos a refactorizar (Clientes, Proyectos, Viviendas, etc.)

### **B. Crear Archivo de Estilos Base**

```bash
# Crear archivo de estilos compartidos
New-Item -Path "src\shared\styles\design-system.styles.ts" -ItemType File
```

**Contenido** (`src/shared/styles/design-system.styles.ts`):
```typescript
// ============================================
// SISTEMA DE DISEÑO: Estilos Base
// ============================================

// Tipografía (Jerarquía de 3 niveles)
export const typography = {
  // NIVEL 1: Información CRÍTICA
  hero: 'text-3xl font-bold',              // 30px - Títulos principales
  title: 'text-2xl font-bold',             // 24px - Subtítulos importantes

  // NIVEL 2: Información IMPORTANTE
  heading: 'text-lg font-semibold',        // 18px - Headers de secciones
  body: 'text-base font-medium',           // 16px - Datos críticos

  // NIVEL 3: Información CONTEXTUAL
  label: 'text-sm font-medium',            // 14px - Labels
  caption: 'text-xs',                      // 12px - Metadatos
  tiny: 'text-[10px]',                     // 10px - Badges
}

// Colores Semánticos (Funcionales)
export const colors = {
  // Estados
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    accent: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    accent: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    accent: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    accent: 'bg-blue-500',
  },

  // Texto (Jerarquía)
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
  },

  // Módulos (solo para CTAs y bordes)
  modules: {
    clientes: 'purple',
    proyectos: 'green',
    viviendas: 'orange',
    negociaciones: 'pink',
    auditorias: 'blue',
  },
}

// Espaciado (Escala de 4px)
export const spacing = {
  xs: 'gap-1',      // 4px
  sm: 'gap-2',      // 8px
  md: 'gap-4',      // 16px
  lg: 'gap-6',      // 24px
  xl: 'gap-8',      // 32px
  '2xl': 'gap-12',  // 48px
}

// Botones (Sistema Consistente)
export const buttons = {
  primary: `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    bg-MODULE_COLOR-600 text-white hover:bg-MODULE_COLOR-700
    text-sm font-medium shadow-sm hover:shadow-md
    transition-all
  `,
  outline: `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700
    text-sm font-medium transition-colors
  `,
  icon: `
    inline-flex items-center px-3 py-2 rounded-lg
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700
    transition-colors
  `,
  danger: `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    bg-red-600 text-white hover:bg-red-700
    text-sm font-medium shadow-sm hover:shadow-md
    transition-all
  `,
}

// Cards (Headers con borde de color)
export const cards = {
  headerBordered: (color: string) => `
    border-l-4 border-${color}-600
    bg-white dark:bg-gray-800
    rounded-lg p-6 shadow-sm
  `,
  simple: `
    bg-white dark:bg-gray-800 rounded-lg
    border border-gray-200 dark:border-gray-800
    p-4
  `,
}

// Warnings/Alerts (Sutiles con borde izquierdo)
export const alerts = {
  warning: `
    border-l-4 border-amber-500
    bg-amber-50/50 dark:bg-amber-900/10
    rounded-lg p-4
  `,
  error: `
    border-l-4 border-red-500
    bg-red-50/50 dark:bg-red-900/10
    rounded-lg p-4
  `,
  success: `
    border-l-4 border-green-500
    bg-green-50/50 dark:bg-green-900/10
    rounded-lg p-4
  `,
}
```

- [ ] Archivo creado y verificado
- [ ] Tipos TypeScript válidos
- [ ] Exportaciones funcionando

---

## 📋 FASE 2: REFACTORIZACIÓN DE CLIENTES (2-3 horas)

### **A. Header Cliente (CRÍTICO)**

**Archivo**: `src/app/clientes/[id]/cliente-detalle-client.tsx`

#### **Cambios a realizar:**

- [ ] **Eliminar gradiente decorativo** del header
  ```tsx
  // ❌ Eliminar esto:
  <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-pink-600">

  // ✅ Reemplazar por:
  <div className="border-l-4 border-purple-600 bg-white dark:bg-gray-800 rounded-lg p-6">
  ```

- [ ] **Aplicar jerarquía tipográfica** al nombre
  ```tsx
  // ❌ Cambiar:
  <h1 className="text-2xl font-bold">

  // ✅ Por:
  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
  ```

- [ ] **Agregar chips de datos críticos** (documento, teléfono, email)
  ```tsx
  <div className="flex flex-wrap items-center gap-6 mb-4">
    <DataChip icon={FileText} label="Documento" value={cliente.numero_documento} />
    <DataChip icon={Phone} label="Teléfono" value={cliente.telefono} />
    <DataChip icon={Mail} label="Email" value={cliente.email} />
  </div>
  ```

- [ ] **Mover ProgresoProcesoBadge** abajo del nombre (no al lado)
  ```tsx
  // ❌ Quitar de al lado del título
  // ✅ Poner abajo de los chips de datos
  <div className="mt-4">
    <ProgresoProcesoBadge clienteId={clienteUUID} variant="compact" />
  </div>
  ```

- [ ] **Convertir acciones secundarias** en DropdownMenu
  ```tsx
  // ❌ Eliminar botones "Editar" y "Eliminar" individuales
  // ✅ Agrupar en menú dropdown
  <DropdownMenu>
    <DropdownMenuTrigger>⋮ Más</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={handleEditar}>Editar</DropdownMenuItem>
      <DropdownMenuItem onClick={handleEliminar}>Eliminar</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  ```

- [ ] **Verificar responsive** (mobile, tablet, desktop)
- [ ] **Verificar modo oscuro** (dark mode)
- [ ] **Testing de accesibilidad** (ARIA labels)

---

### **B. Tab Documentos (CRÍTICO)**

**Archivo**: `src/app/clientes/[id]/tabs/documentos-tab.tsx`

#### **Cambios a realizar:**

- [ ] **Eliminar gradiente del header** de tab
  ```tsx
  // ❌ Eliminar:
  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-4">

  // ✅ Reemplazar por:
  <div className="border-l-4 border-purple-600 bg-white dark:bg-gray-800 rounded-lg p-4">
  ```

- [ ] **Unificar estilos de botones** (primary + outline)
  ```tsx
  // Solo 1 botón PRIMARY (color de fondo)
  <button className="bg-purple-600 text-white">Subir Documento</button>

  // Resto OUTLINE (borde)
  <button className="border border-gray-300 bg-white text-gray-700">Categorías</button>
  ```

- [ ] **Simplificar warning card** de cédula
  ```tsx
  // ❌ Eliminar border-2 y bg intenso
  // ✅ Usar border-l-4 y bg sutil
  <div className="border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4">
  ```

- [ ] **Aplicar jerarquía tipográfica**
  ```tsx
  <h2 className="text-lg font-semibold">Documentos del Cliente</h2>  {/* 18px */}
  <p className="text-sm text-gray-600">3 archivos almacenados</p>  {/* 14px */}
  ```

- [ ] **Verificar responsive**
- [ ] **Verificar modo oscuro**

---

### **C. Tab General (Información Personal)**

**Archivo**: `src/app/clientes/[id]/tabs/general-tab.tsx`

#### **Cambios a realizar:**

- [ ] **Eliminar gradientes de headers** de cards
  ```tsx
  // ❌ Eliminar:
  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5">

  // ✅ Reemplazar por:
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
  ```

- [ ] **Simplificar cards** (sin decoraciones)
  ```tsx
  // Usar solo:
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
  ```

- [ ] **Layout vertical** (no grid 2 columnas)
  ```tsx
  // ❌ Eliminar grid-cols-2
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

  // ✅ Usar lista vertical
  <div className="space-y-2">
    <DataRow label="Nombres" value={cliente.nombres} />
    <DataRow label="Apellidos" value={cliente.apellidos} />
  </div>
  ```

- [ ] **Verificar responsive**
- [ ] **Verificar modo oscuro**

---

## 📋 FASE 3: ACTUALIZAR ESTILOS GLOBALES (1 hora)

**Archivo**: `src/app/clientes/[id]/cliente-detalle.styles.ts`

### **Cambios a realizar:**

- [ ] **Actualizar headerClasses**
  ```typescript
  export const headerClasses = {
    container: `
      border-l-4 border-purple-600
      bg-white dark:bg-gray-800
      rounded-lg p-6 shadow-sm
    `,
    title: 'text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3',
    datosContainer: 'flex flex-wrap items-center gap-6 mb-4',
    // ... (copiar de REFACTOR-CLIENTE-HEADER-EJEMPLO-CODIGO.md)
  }
  ```

- [ ] **Actualizar infoCardClasses**
  ```typescript
  export const infoCardClasses = {
    card: `
      bg-white dark:bg-gray-800 rounded-lg
      border border-gray-200 dark:border-gray-800
      p-4
    `,
    header: 'flex items-center gap-3 mb-3',
    iconContainer: `
      flex h-10 w-10 items-center justify-center rounded-lg
      bg-purple-100 dark:bg-purple-900/30
    `,
    // ... (sin gradientes)
  }
  ```

- [ ] **Eliminar gradients export** (ya no se usan)
  ```typescript
  // ❌ Eliminar:
  export const gradients = {
    personal: 'from-purple-500 to-pink-600',
    // ...
  }
  ```

- [ ] **Verificar que todos los componentes usen nuevos estilos**

---

## 📋 FASE 4: APLICAR A OTROS MÓDULOS (3-4 horas)

### **A. Módulo Proyectos**

**Archivo**: `src/app/proyectos/[id]/proyecto-detalle-client.tsx`

- [ ] Aplicar mismo patrón de header (borde en lugar de gradiente)
- [ ] Unificar botones (primary + outline)
- [ ] Jerarquía tipográfica (text-3xl → text-lg → text-sm)
- [ ] Verificar responsive y dark mode

### **B. Módulo Viviendas**

**Archivo**: `src/app/viviendas/[id]/vivienda-detalle-client.tsx`

- [ ] Aplicar mismo patrón de header
- [ ] Unificar botones
- [ ] Jerarquía tipográfica
- [ ] Verificar responsive y dark mode

### **C. Módulo Negociaciones**

**Archivos**: `src/modules/negociaciones/components/*`

- [ ] Aplicar mismo patrón de header
- [ ] Unificar botones
- [ ] Jerarquía tipográfica
- [ ] Verificar responsive y dark mode

---

## 📋 FASE 5: VALIDACIÓN Y TESTING (1-2 horas)

### **A. Checklist Visual**

- [ ] ¿Hay 1 solo elemento "hero" por vista? (nombre, título)
- [ ] ¿Los datos importantes (documento, teléfono) son nivel 2 (text-lg)?
- [ ] ¿Los colores tienen función semántica? (no decoración)
- [ ] ¿El espaciado sigue la escala (gap-2, gap-4, gap-6)?
- [ ] ¿El layout es vertical y escaneable?
- [ ] ¿Los iconos aportan comprensión o solo decoran?
- [ ] ¿Hay máximo 1 botón "primary" con color por sección?
- [ ] ¿El texto es legible? (contraste suficiente)
- [ ] ¿Las cards tienen fondo neutro? (no gradientes)
- [ ] ¿Los borders de color reemplazan backgrounds?

### **B. Testing de Funcionalidad**

- [ ] **Navegación**: Links y botones funcionan
- [ ] **Responsive**: Mobile, tablet, desktop OK
- [ ] **Dark mode**: Contraste adecuado en modo oscuro
- [ ] **Accesibilidad**: ARIA labels, keyboard navigation
- [ ] **Performance**: No hay re-renders innecesarios

### **C. Cross-browser Testing**

- [ ] Chrome/Edge (Windows/Mac)
- [ ] Firefox
- [ ] Safari (Mac/iOS)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

---

## 📋 FASE 6: DOCUMENTACIÓN (30 minutos)

### **Crear/Actualizar Docs**

- [ ] Actualizar `copilot-instructions.md` con nuevas reglas de diseño
- [ ] Crear `CHANGELOG-DISENO.md` documentando cambios
- [ ] Actualizar `DESARROLLO-CHECKLIST.md` con validaciones de diseño
- [ ] Crear screenshots ANTES/DESPUÉS para referencia

---

## 🎯 RESULTADO ESPERADO

### **ANTES:**
```
❌ Gradientes decorativos por todos lados
❌ Todo tiene el mismo peso visual
❌ Colores sin propósito claro
❌ Múltiples botones compitiendo por atención
❌ Datos importantes ocultos o sin énfasis
❌ Espaciado inconsistente
```

### **DESPUÉS:**
```
✅ Jerarquía visual clara (3 niveles)
✅ Color solo con propósito (CTAs, estados)
✅ 1 elemento hero por vista
✅ Datos críticos visibles y enfatizados
✅ Botones consistentes (primary + outline)
✅ Espaciado siguiendo escala de 4px
✅ Layout escaneable (patrón F)
✅ Contraste adecuado (accesibilidad)
```

---

## 📊 MÉTRICAS DE ÉXITO

- [ ] **Tiempo de escaneo**: Usuario identifica dato crítico en < 3 segundos
- [ ] **Claridad de jerarquía**: 9/10 usuarios identifican elemento más importante
- [ ] **Consistencia**: 100% de módulos siguen mismas reglas
- [ ] **Accesibilidad**: WCAG 2.1 AA compliance
- [ ] **Performance**: Sin degradación en Lighthouse scores

---

## 🚀 SIGUIENTES PASOS

1. ✅ Completar Fase 1-2 (Clientes)
2. ✅ Validar con usuarios reales
3. ✅ Aplicar learnings a Fases 3-4
4. ✅ Iterar basado en feedback
5. ✅ Documentar best practices

---

## 📚 RECURSOS DE APOYO

- **Docs de referencia**:
  - `SISTEMA-DISENO-UX-JERARQUIA-VISUAL.md` (Teoría)
  - `REFACTOR-CLIENTE-HEADER-EJEMPLO-CODIGO.md` (Código header)
  - `REFACTOR-DOCUMENTOS-TAB-EJEMPLO-CODIGO.md` (Código tab)

- **Herramientas útiles**:
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) (Accesibilidad)
  - [Tailwind Play](https://play.tailwindcss.com/) (Probar estilos)
  - [Figma](https://www.figma.com/) (Mockups)

---

**Última actualización**: 2024-11-07
**Tiempo estimado total**: 8-12 horas
**Prioridad**: 🔴 CRÍTICA (mejora experiencia de usuario significativamente)
