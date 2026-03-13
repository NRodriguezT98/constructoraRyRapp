# 🔧 PLAN DE REFACTOR: Módulo Admin/Procesos

## 🎯 Objetivos

1. ✅ **Cargar categorías correctas**: Módulo "clientes" con `modulos_permitidos`
2. ✅ **Diseño compacto estándar**: Aplicar plantilla de Viviendas (p-6, text-2xl, rounded-2xl)
3. ✅ **Modernizar componentes**: Header, métricas, filtros, cards
4. ✅ **Theming consistente**: Azul/Índigo/Púrpura (admin)

---

## 📋 Archivos a Modificar

### 1. **Carga de Categorías**
- `src/modules/admin/procesos/components/paso-plantilla-item.tsx`
  - ❌ Actual: `.eq('es_global', true)`
  - ✅ Nuevo: `WHERE 'clientes' = ANY(modulos_permitidos) OR es_sistema = true`

### 2. **Header Principal**
- `src/modules/admin/procesos/components/header-lista-plantillas.tsx`
  - ❌ Actual: `p-8`, `text-4xl`
  - ✅ Nuevo: `p-6`, `text-2xl` (estándar compacto)

### 3. **Métricas**
- Agregar: `src/modules/admin/procesos/components/procesos-metricas-premium.tsx`
  - 4 cards compactos (p-4, gap-3)
  - Total plantillas, Predeterminada, Total pasos, Promedio pasos

### 4. **Filtros**
- Agregar: `src/modules/admin/procesos/components/procesos-filtros-premium.tsx`
  - Sticky, horizontal flex (py-2)
  - Búsqueda + Estado (Todas/Activas/Inactivas)

### 5. **Cards de Plantillas**
- `src/modules/admin/procesos/components/plantilla-card.tsx`
  - ❌ Actual: padding grande, diseño complejo
  - ✅ Nuevo: `p-4`, `rounded-xl`, hover `y: -2`

### 6. **Estilos Centralizados**
- `src/modules/admin/procesos/styles/procesos.styles.ts`
  - Reemplazar con estándar compacto
  - Paleta: `from-blue-600 via-indigo-600 to-purple-600`

---

## 🎨 Dimensiones Estándar (OBLIGATORIO)

### Header
```tsx
p-6  // NO p-8
rounded-2xl
text-2xl  // NO text-3xl o text-4xl
icon: w-10 h-10  // NO w-14 h-14
badge: px-3 py-1.5  // NO px-4 py-2
```

### Métricas
```tsx
grid gap-3  // NO gap-6
p-4  // NO p-6
icon: w-10 h-10
value: text-xl  // NO text-2xl
```

### Filtros
```tsx
sticky top-4
p-3  // NO p-4
flex gap-2  // horizontal
input: py-2  // NO py-3
```

### Cards
```tsx
p-4  // NO p-6
rounded-xl  // NO rounded-2xl
hover: y: -2  // NO y: -4
title: text-lg  // NO text-xl
```

---

## 🚀 Orden de Implementación

1. ✅ **Paso 1**: Arreglar carga de categorías (crítico)
2. ✅ **Paso 2**: Crear componentes nuevos (métricas, filtros)
3. ✅ **Paso 3**: Refactorizar header
4. ✅ **Paso 4**: Refactorizar cards
5. ✅ **Paso 5**: Actualizar estilos centralizados
6. ✅ **Paso 6**: Integrar todo en lista-plantillas.tsx

---

## 📦 Componentes Nuevos a Crear

### `ProcesosMetricasPremium.tsx`
```tsx
<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  {/* Total Plantillas */}
  {/* Plantilla Predeterminada */}
  {/* Total Pasos */}
  {/* Promedio Pasos/Plantilla */}
</motion.div>
```

### `ProcesosFiltrosPremium.tsx`
```tsx
<motion.div className="sticky top-4 p-3 flex gap-2">
  <Search input />
  <select Estado />
  <p>X resultados</p>
</motion.div>
```

---

## ✅ Checklist de Validación

- [ ] Categorías cargan correctamente del módulo "clientes"
- [ ] Header usa `p-6`, `text-2xl`
- [ ] Métricas con 4 cards compactos
- [ ] Filtros sticky horizontal
- [ ] Cards con `p-4`, `rounded-xl`
- [ ] Dark mode funciona en todo
- [ ] Responsive verificado
- [ ] Paleta azul/índigo/púrpura consistente

---

**Fecha**: 4 de diciembre de 2025
**Módulo**: Admin → Procesos
**Referencia**: Viviendas (módulo compacto estándar)
