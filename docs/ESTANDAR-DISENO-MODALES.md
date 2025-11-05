# 🎨 Estándar de Diseño de Modales - RyR Constructora

## 📐 PRINCIPIOS FUNDAMENTALES

### ⚠️ REGLA CRÍTICA: Consistencia Visual Total

**TODAS las modales del sistema DEBEN seguir este estándar exacto.**

---

## 🎯 Anatomía de un Modal Premium

```
┌─────────────────────────────────────────────┐
│ [Borde superior gradiente: 2px]            │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ [Ícono] Título Principal            [X] │ │
│ │ Descripción breve del modal             │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ BODY (scroll si es necesario)               │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │ Contenido del modal                     │ │
│ │ - Formularios                           │ │
│ │ - Información                           │ │
│ │ - Confirmaciones                        │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
│ ┌─────────────────────────────────────────┐ │
│ │              [Cancelar] [Guardar]       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🎨 DISEÑO VISUAL

### **1. OVERLAY (Fondo)**
```tsx
className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
```
- ✅ Fondo negro 50% opacidad
- ✅ Backdrop blur para efecto glassmorphism
- ✅ z-index: 50

### **2. CONTAINER**
```tsx
className="fixed inset-0 z-50 flex items-center justify-center p-4"
```
- ✅ Centrado perfecto vertical y horizontal
- ✅ Padding 16px en móvil
- ✅ z-index: 50 (mismo que overlay)

### **3. MODAL BOX**
```tsx
className="relative w-full max-w-[tamaño] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
```

**Tamaños disponibles:**
- `sm`: max-w-md (448px) - Confirmaciones
- `md`: max-w-2xl (672px) - Formularios simples
- `lg`: max-w-4xl (896px) - Formularios complejos
- `xl`: max-w-6xl (1152px) - Formularios extensos
- `full`: max-w-[95vw] - Vistas completas

**Estilos:**
- ✅ Border radius: 16px (rounded-2xl)
- ✅ Shadow: 2xl (muy pronunciada)
- ✅ Border sutil con transparencia

### **4. BORDE SUPERIOR GRADIENTE**
```tsx
<div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[color1] via-[color2] to-[color3]" />
```

**Paleta por módulo:**
- **Proyectos:** `from-orange-500 via-amber-500 to-yellow-500`
- **Viviendas:** `from-green-500 via-emerald-500 to-teal-500`
- **Clientes:** `from-cyan-500 via-blue-500 to-indigo-500`
- **Negociaciones:** `from-pink-500 via-purple-500 to-indigo-500`
- **Auditorías:** `from-blue-500 via-indigo-500 to-purple-500`
- **Genérico:** `from-blue-500 via-purple-500 to-pink-500`

---

## 📦 HEADER (Encabezado)

### **Estructura:**
```tsx
<div className="relative px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/30">
  <div className="flex items-start gap-4">
    {/* Ícono */}
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[color1] to-[color2] flex items-center justify-center shadow-lg shadow-[color]/30">
      <Icon className="w-6 h-6 text-white" />
    </div>

    {/* Títulos */}
    <div className="flex-1 min-w-0">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Título Principal
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Descripción breve del modal
      </p>
    </div>

    {/* Botón cerrar */}
    <button className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </button>
  </div>
</div>
```

**Elementos obligatorios:**
- ✅ **Ícono:** 48x48px con gradiente del módulo
- ✅ **Título:** text-2xl font-bold
- ✅ **Descripción:** text-sm con color secundario
- ✅ **Botón X:** 40x40px con hover suave
- ✅ **Fondo:** Gradiente sutil de arriba a transparente

---

## 📄 BODY (Contenido)

### **Estructura:**
```tsx
<div className="p-6 max-h-[calc(90vh-240px)] overflow-y-auto custom-scrollbar">
  {/* Contenido del modal */}
</div>
```

**Reglas:**
- ✅ Padding: 24px (p-6)
- ✅ Max height: 90vh - 240px (header + footer)
- ✅ Scroll vertical personalizado (`custom-scrollbar`)
- ✅ Espaciado interno: space-y-4 entre secciones

### **Secciones de Formulario:**
```tsx
<div className="space-y-4">
  {/* Sección 1 */}
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      Label del Campo
      <span className="text-red-500 ml-1">*</span>
    </label>
    <input className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
    {/* Error */}
    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
      Mensaje de error
    </p>
  </div>
</div>
```

**Estilos de campos:**
- ✅ **Labels:** font-semibold, text-sm
- ✅ **Inputs:** py-2.5, border-2, rounded-lg
- ✅ **Focus:** border-blue-500 + ring-2
- ✅ **Asterisco:** text-red-500 para obligatorios
- ✅ **Errores:** text-xs, text-red-600

---

## 🦶 FOOTER (Pie)

### **Estructura:**
```tsx
<div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-end gap-3">
  {/* Botón secundario */}
  <button className="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    Cancelar
  </button>

  {/* Botón primario */}
  <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[color1] to-[color2] text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      Guardar Cambios
    </span>
  </button>
</div>
```

**Reglas de botones:**
- ✅ **Altura:** py-2.5 (40px total)
- ✅ **Padding horizontal:** px-5
- ✅ **Border radius:** rounded-lg
- ✅ **Secundario:** border-2 + bg-white
- ✅ **Primario:** gradiente del módulo + shadow-lg
- ✅ **Orden:** Cancelar (izq) → Guardar (der)
- ✅ **Loading:** spinner + texto "Guardando..."

---

## 🎭 ANIMACIONES

### **Entrada/Salida del Modal:**
```tsx
// Framer Motion
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 20 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

### **Overlay:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
>
```

**Tiempos:**
- ✅ Modal: 200ms
- ✅ Overlay: 150ms
- ✅ Ease: easeOut

---

## 🌙 MODO OSCURO

### **Reglas de contraste:**
- ✅ **Backgrounds:**
  - Claro: `bg-white`, `bg-gray-50`
  - Oscuro: `dark:bg-gray-900`, `dark:bg-gray-800`
- ✅ **Textos:**
  - Títulos: `text-gray-900 dark:text-white`
  - Descripciones: `text-gray-600 dark:text-gray-400`
  - Labels: `text-gray-700 dark:text-gray-300`
- ✅ **Bordes:**
  - Claro: `border-gray-200`
  - Oscuro: `dark:border-gray-700`
- ✅ **Inputs:**
  - Claro: `bg-gray-50 border-gray-200`
  - Oscuro: `dark:bg-gray-900/50 dark:border-gray-700`

---

## 📱 RESPONSIVE

### **Breakpoints:**
```tsx
// Móvil (< 640px)
- padding: p-3
- títulos: text-xl
- botones: flex-col (vertical)

// Tablet (≥ 640px)
- padding: p-4
- títulos: text-2xl
- botones: flex-row (horizontal)

// Desktop (≥ 1024px)
- padding: p-6
- títulos: text-2xl
- botones: flex-row con justify-end
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Antes de considerar un modal completo, verificar:

- [ ] ✅ Borde superior con gradiente del módulo
- [ ] ✅ Header con ícono + título + descripción + botón X
- [ ] ✅ Ícono 48x48px con gradiente y shadow
- [ ] ✅ Body con padding p-6 y scroll personalizado
- [ ] ✅ Footer con fondo sutil y botones alineados derecha
- [ ] ✅ Botón secundario con border-2
- [ ] ✅ Botón primario con gradiente y shadow
- [ ] ✅ Labels con font-semibold y asterisco rojo
- [ ] ✅ Inputs con border-2 y focus ring
- [ ] ✅ Mensajes de error en text-xs text-red-600
- [ ] ✅ Animaciones Framer Motion implementadas
- [ ] ✅ Modo oscuro completo en todos los elementos
- [ ] ✅ Responsive móvil/tablet/desktop
- [ ] ✅ Estado loading con spinner y texto

---

## 🎨 PALETA DE COLORES POR MÓDULO

```typescript
export const modalGradients = {
  proyectos: {
    border: 'from-orange-500 via-amber-500 to-yellow-500',
    icon: 'from-orange-500 to-amber-600',
    button: 'from-orange-600 to-amber-600',
    shadow: 'shadow-orange-500/30'
  },
  viviendas: {
    border: 'from-green-500 via-emerald-500 to-teal-500',
    icon: 'from-green-500 to-emerald-600',
    button: 'from-green-600 to-emerald-600',
    shadow: 'shadow-green-500/30'
  },
  clientes: {
    border: 'from-cyan-500 via-blue-500 to-indigo-500',
    icon: 'from-cyan-500 to-blue-600',
    button: 'from-cyan-600 to-blue-600',
    shadow: 'shadow-cyan-500/30'
  },
  negociaciones: {
    border: 'from-pink-500 via-purple-500 to-indigo-500',
    icon: 'from-pink-500 to-purple-600',
    button: 'from-pink-600 to-purple-600',
    shadow: 'shadow-pink-500/30'
  },
  auditorias: {
    border: 'from-blue-500 via-indigo-500 to-purple-500',
    icon: 'from-blue-500 to-indigo-600',
    button: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/30'
  },
  generic: {
    border: 'from-blue-500 via-purple-500 to-pink-500',
    icon: 'from-blue-500 to-purple-600',
    button: 'from-blue-600 to-purple-600',
    shadow: 'shadow-blue-500/30'
  }
}
```

---

## 🚀 EJEMPLO COMPLETO

Ver implementación de referencia en:
- `src/modules/proyectos/components/proyectos-form.tsx`
- `src/modules/proyectos/components/ConfirmarCambiosModal.tsx`

---

## 📌 REGLAS DE ORO

1. **NUNCA** usar modales sin el gradiente superior
2. **SIEMPRE** incluir ícono en el header
3. **OBLIGATORIO** modo oscuro en todos los elementos
4. **CONSISTENCIA** total entre módulos (solo cambia el color)
5. **RESPONSIVE** desde el primer momento
6. **ANIMACIONES** suaves y profesionales
7. **ACCESIBILIDAD** con aria-labels y keyboard navigation

---

## ✨ Beneficios del Estándar

- ✅ **UX Consistente:** Usuario reconoce patrones
- ✅ **Desarrollo Rápido:** Copy-paste estructura base
- ✅ **Mantenimiento Fácil:** Un cambio afecta a todos
- ✅ **Aspecto Premium:** Diseño profesional unificado
- ✅ **Escalabilidad:** Agregar módulos es trivial
