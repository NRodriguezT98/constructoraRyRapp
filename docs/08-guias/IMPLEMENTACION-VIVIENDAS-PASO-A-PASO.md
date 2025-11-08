# 🏗️ IMPLEMENTACIÓN PASO A PASO: Refactorización de Viviendas

> **Guía práctica para aplicar el sistema de diseño al módulo de Viviendas**

---

## 📊 ANTES DE EMPEZAR

### **Archivos a modificar:**
1. `src/app/viviendas/[id]/vivienda-detalle-client.tsx` (1000+ líneas)
2. `src/app/viviendas/[id]/vivienda-detalle.styles.ts`

### **Tiempo estimado:**
- **Header**: 1.5 horas
- **Barra de Progreso**: 30 minutos
- **Tab Información**: 2 horas
- **Tab Documentos**: 1 hora
- **Tab Linderos**: 30 minutos
- **Estilos**: 1 hora
- **Testing**: 1 hora
- **TOTAL**: 7-8 horas

### **Dependencias:**
```bash
# Verificar que tienes instalado:
- @radix-ui/react-dropdown-menu
- lucide-react
- framer-motion
```

---

## 🎯 PASO 1: REFACTORIZAR HEADER (90 minutos)

### **1.1. Reemplazar Gradiente por Borde**

**BUSCAR (líneas ~90-140):**
```tsx
<motion.div
  className="relative overflow-hidden rounded-xl p-5 text-white shadow-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500"
>
```

**REEMPLAZAR CON:**
```tsx
<div className="border-l-4 border-orange-600 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
```

**Resultado:** Eliminación de gradiente decorativo, borde de color sutil.

---

### **1.2. Actualizar Título a text-3xl**

**BUSCAR:**
```tsx
<h1 className="text-2xl font-bold">
  Manzana {manzanaNombre} - Casa {vivienda.numero}
</h1>
```

**REEMPLAZAR CON:**
```tsx
<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
  Manzana {manzanaNombre} - Casa {vivienda.numero}
</h1>
```

**Resultado:** Título HERO con nivel 1 de jerarquía (30px).

---

### **1.3. Agregar Datos Críticos (NUEVO)**

**INSERTAR DESPUÉS del título:**
```tsx
{/* NIVEL 2: Datos CRÍTICOS - 18px Semibold, Horizontal */}
<div className="flex flex-wrap items-center gap-6 mb-4">
  {/* Valor Total */}
  <div className="flex items-center gap-2">
    <DollarSign className="h-5 w-5 text-orange-600 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Valor Total</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {formatCurrency(vivienda.valor_total)}
      </p>
    </div>
  </div>

  {/* Área Total */}
  <div className="flex items-center gap-2">
    <Building2 className="h-5 w-5 text-orange-600 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Área Total</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {vivienda.area_construida || 'N/A'} m²
      </p>
    </div>
  </div>

  {/* Proyecto/Ubicación */}
  <div className="flex items-center gap-2">
    <MapPin className="h-5 w-5 text-orange-600 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Proyecto</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {proyectoNombre}
      </p>
    </div>
  </div>
</div>
```

**Resultado:** Información crítica visible en nivel 2 (18px).

---

### **1.4. Crear Componente EstadoBadge**

**INSERTAR al inicio del archivo (antes del componente principal):**
```tsx
function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    Disponible: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    Asignada: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    Pagada: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
  }

  const { bg, border, text, dot } = config[estado as keyof typeof config] || config.Disponible

  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
        border ${border} ${bg} ${text}
        text-xs font-medium
      `}
    >
      <span className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />
      <span>{estado}</span>
    </span>
  )
}
```

**USAR en lugar del badge actual:**
```tsx
{/* NIVEL 3: Badges de Estado */}
<div className="flex flex-wrap items-center gap-2">
  <EstadoBadge estado={vivienda.estado} />
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
    {vivienda.tipo_vivienda || 'Regular'}
  </span>
  {vivienda.es_esquinera && (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
      🏘️ Esquinera
    </span>
  )}
</div>
```

**Resultado:** Badges con color semántico, sin gradientes.

---

### **1.5. Convertir Acciones en Dropdown**

**BUSCAR botones de acción (líneas ~180-200):**
```tsx
<button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2">
  <Edit2 className="h-4 w-4" />
  <span>Editar</span>
</button>
```

**REEMPLAZAR CON:**
```tsx
{/* Acciones - Arriba a la derecha */}
<div className="flex items-start gap-2 ml-6">
  {/* CTA Principal (si aplica) */}
  {vivienda.estado === 'Disponible' && (
    <button
      onClick={handleAsignarCliente}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
    >
      <UserPlus className="h-4 w-4" />
      <span>Asignar Cliente</span>
    </button>
  )}

  {/* Menú Secundario */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <MoreVertical className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={handleEditar}>
        <Edit2 className="h-4 w-4 mr-2" />
        Editar Vivienda
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleEliminar} className="text-red-600">
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar Vivienda
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

**Agregar imports:**
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, UserPlus, Edit2, Trash2 } from 'lucide-react'
```

**Resultado:** 1 CTA principal + menú dropdown secundario.

---

## ✅ CHECKPOINT 1: Validar Header

**Verificar:**
- [ ] Borde de color naranja (no gradiente)
- [ ] Título text-3xl (30px)
- [ ] Datos críticos visibles (valor, área, proyecto)
- [ ] Badges de estado con color semántico
- [ ] Botones en dropdown menu
- [ ] Dark mode funcionando

**Comparar con:** `REFACTOR-VIVIENDAS-COMPLETO.md` sección "Header"

---

## 📊 PASO 2: REFACTORIZAR BARRA DE PROGRESO (30 minutos)

### **2.1. Simplificar Icono**

**BUSCAR (líneas ~240-260):**
```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
  <Activity className="h-5 w-5 text-white" />
</div>
```

**REEMPLAZAR CON:**
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
</div>
```

**Resultado:** Icono con background sutil (no gradiente).

---

### **2.2. Agregar Borde de Color**

**BUSCAR contenedor principal:**
```tsx
<div className="rounded-xl border border-emerald-200 bg-white p-4">
```

**REEMPLAZAR CON:**
```tsx
<div className="border-l-4 border-green-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
```

---

### **2.3. Actualizar Jerarquía Tipográfica**

**BUSCAR:**
```tsx
<p className="text-base font-bold">Progreso de Pago</p>
<p className="text-xs">Calculado según abonos</p>
```

**REEMPLAZAR CON:**
```tsx
<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
  Progreso de Pago
</h3>
<p className="text-sm text-gray-600 dark:text-gray-400">
  Calculado según abonos realizados
</p>
```

---

### **2.4. Destacar Porcentaje**

**INSERTAR en header junto al título:**
```tsx
{/* Porcentaje destacado */}
<div className="text-right">
  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
    {vivienda.porcentaje_pagado || 0}%
  </p>
  <p className="text-xs text-gray-600 dark:text-gray-400">
    Completado
  </p>
</div>
```

**Resultado:** Porcentaje visible en nivel 1 (30px).

---

## ✅ CHECKPOINT 2: Validar Barra de Progreso

**Verificar:**
- [ ] Borde verde (no gradiente en container)
- [ ] Icono con background sutil
- [ ] Porcentaje destacado (text-3xl)
- [ ] Barra de progreso mantiene gradiente (funcional)
- [ ] Dark mode funcionando

---

## 📄 PASO 3: REFACTORIZAR TAB INFORMACIÓN (2 horas)

### **3.1. Crear Componente DataRow**

**INSERTAR al inicio del archivo (después de EstadoBadge):**
```tsx
function DataRow({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p
        className={`
          text-sm font-semibold
          ${highlight ? 'text-lg text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-200'}
          ${mono ? 'font-mono' : ''}
        `}
      >
        {value}
      </p>
    </div>
  )
}
```

---

### **3.2. Cambiar Grid a Layout Vertical**

**BUSCAR (líneas ~450-500):**
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**REEMPLAZAR CON:**
```tsx
<div className="space-y-4">
  {/* Cards verticales */}
</div>
```

---

### **3.3. Refactorizar Card de Información Técnica**

**BUSCAR:**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center gap-2.5">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
        <Building2 className="h-4 w-4 text-white" />
      </div>
      <h3>Información Técnica</h3>
    </div>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

**REEMPLAZAR CON:**
```tsx
<div className="border-l-4 border-blue-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
  <div className="flex items-center gap-3 mb-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Información Técnica
    </h3>
  </div>

  {/* Lista vertical de datos */}
  <div className="space-y-3">
    {vivienda.matricula_inmobiliaria && (
      <DataRow
        label="Matrícula Inmobiliaria"
        value={vivienda.matricula_inmobiliaria}
        mono
      />
    )}
    {vivienda.nomenclatura && (
      <DataRow
        label="Nomenclatura Catastral"
        value={vivienda.nomenclatura}
      />
    )}
    <div className="grid grid-cols-2 gap-3">
      <DataRow
        label="Área Construida"
        value={`${vivienda.area_construida || 'N/A'} m²`}
      />
      <DataRow
        label="Área de Lote"
        value={`${vivienda.area_lote || 'N/A'} m²`}
      />
    </div>
  </div>
</div>
```

---

### **3.4. Refactorizar Card de Información Financiera**

**REEMPLAZAR:**
```tsx
<div className="border-l-4 border-green-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
  <div className="flex items-center gap-3 mb-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Información Financiera
    </h3>
  </div>

  <div className="space-y-3">
    <DataRow
      label="Valor Total"
      value={formatCurrency(vivienda.valor_total)}
      highlight
    />
    {vivienda.es_esquinera && (
      <DataRow
        label="Recargo Esquinera"
        value={formatCurrency(vivienda.recargo_esquinera)}
      />
    )}
    <DataRow
      label="Gastos Notariales"
      value={formatCurrency(vivienda.gastos_notariales || 0)}
    />
  </div>
</div>
```

---

### **3.5. Refactorizar Cards de Cliente y Fechas**

**Seguir mismo patrón:**
- Borde de color (`border-l-4`)
- Icono con background sutil
- Título `text-lg`
- Usar `DataRow` para datos

**Ver código completo en:** `REFACTOR-VIVIENDAS-COMPLETO.md` sección "Tab Información"

---

## ✅ CHECKPOINT 3: Validar Tab Información

**Verificar:**
- [ ] Layout vertical (no grid 2 columnas)
- [ ] Borde de color en cada card
- [ ] Iconos con background sutil
- [ ] Componente DataRow funcionando
- [ ] Jerarquía tipográfica clara
- [ ] Dark mode funcionando

---

## 📑 PASO 4: REFACTORIZAR TAB DOCUMENTOS (1 hora)

### **4.1. Aplicar Patrón Consistente**

**BUSCAR (líneas ~700-750):**
```tsx
<div className='rounded-lg border border-orange-200 bg-white p-4'>
  <div className='flex items-center gap-2.5'>
    <div className='rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 p-2.5'>
      <FileText className='h-5 w-5 text-white' />
    </div>
    <h2>Documentos de la Vivienda</h2>
  </div>
</div>
```

**REEMPLAZAR CON:**
```tsx
<div className="border-l-4 border-orange-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
  <div className="flex items-start justify-between">
    {/* Información del tab */}
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Documentos de la Vivienda
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Certificados, planos, escrituras y más
        </p>
      </div>
    </div>

    {/* Acciones - Sistema consistente */}
    <div className="flex gap-2">
      {/* CTA Principal */}
      <button
        onClick={() => setShowUpload(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium shadow-sm hover:shadow-md transition-all"
      >
        <Upload className="h-4 w-4" />
        <span>Subir Documento</span>
      </button>

      {/* Menú Adicional (si necesario) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="h-4 w-4 mr-2" />
            Ver Todos
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4 mr-2" />
            Descargar ZIP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</div>
```

**Resultado:** Tab de Documentos consistente con módulo de Clientes.

---

## ✅ CHECKPOINT 4: Validar Tab Documentos

**Verificar:**
- [ ] Mismo patrón que Clientes
- [ ] Borde de color (no gradiente)
- [ ] Botones consistentes (primary + dropdown)
- [ ] Dark mode funcionando

---

## 🧭 PASO 5: REFACTORIZAR TAB LINDEROS (30 minutos)

### **5.1. Simplificar Card Principal**

**BUSCAR (líneas ~850-900):**
```tsx
<Card className="p-6">
  <CardHeader>
    <div className="flex items-center gap-2.5">
      <Compass className="h-5 w-5 text-blue-600" />
      <h2 className="text-lg font-bold">Linderos de la Vivienda</h2>
    </div>
  </CardHeader>
</Card>
```

**REEMPLAZAR CON:**
```tsx
<div className="border-l-4 border-blue-600 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
  <div className="flex items-center gap-3 mb-6">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
      <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Linderos de la Vivienda
    </h2>
  </div>

  {/* Mapa visual (mantener sin cambios - funciona bien) */}
  <div className="relative mx-auto mb-8 aspect-square max-w-md">
    {/* ... (código actual del mapa visual) ... */}
  </div>

  {/* Cards de descripciones (simplificar) */}
  <div className="grid gap-4 md:grid-cols-2">
    {linderos.map((lindero) => (
      <div
        key={lindero.direccion}
        className="border-l-4 border-blue-500 bg-white dark:bg-gray-800 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{lindero.icon}</span>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {lindero.direccion}
          </h4>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {lindero.descripcion || 'No especificado'}
        </p>
      </div>
    ))}
  </div>
</div>
```

**Resultado:** Card principal con borde de color, mapa visual preservado.

---

## ✅ CHECKPOINT 5: Validar Tab Linderos

**Verificar:**
- [ ] Borde de color en card principal
- [ ] Mapa visual preservado (funciona bien)
- [ ] Cards de descripciones simplificados
- [ ] Dark mode funcionando

---

## 🎨 PASO 6: ACTUALIZAR ESTILOS (1 hora)

### **6.1. Abrir archivo de estilos**

```bash
# Abrir en editor:
src/app/viviendas/[id]/vivienda-detalle.styles.ts
```

---

### **6.2. REEMPLAZAR contenido completo:**

```typescript
// vivienda-detalle.styles.ts - REFACTORIZADO ✅

// ==============================================
// HEADER STYLES - REFACTORIZADO ✅
// ==============================================
export const headerClasses = {
  container: `
    border-l-4 border-orange-600
    bg-white dark:bg-gray-800
    rounded-lg p-6 shadow-sm
  `,

  breadcrumb: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4',
  breadcrumbLink: 'flex items-center gap-1 hover:text-orange-600 transition-colors',
  breadcrumbCurrent: 'text-gray-900 dark:text-gray-100 font-medium',

  contentWrapper: 'flex items-start justify-between',
  leftSection: 'flex-1',

  // NIVEL 1: Título HERO
  title: 'text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3',

  // NIVEL 2: Datos críticos
  datosContainer: 'flex flex-wrap items-center gap-6 mb-4',
  datoItem: 'flex items-center gap-2',
  datoIcon: 'h-5 w-5 text-orange-600 flex-shrink-0',
  datoLabel: 'text-xs text-gray-500 dark:text-gray-400',
  datoValue: 'text-lg font-semibold text-gray-900 dark:text-gray-100',

  // NIVEL 3: Badges
  badgesContainer: 'flex flex-wrap items-center gap-2',

  actionsSection: 'flex items-start gap-2 ml-6',
}

// ==============================================
// PROGRESS BAR STYLES - REFACTORIZADO ✅
// ==============================================
export const progressClasses = {
  container: `
    border-l-4 border-green-600
    bg-white dark:bg-gray-800
    rounded-lg p-4 shadow-sm
  `,

  header: 'flex items-center justify-between mb-4',
  leftSection: 'flex items-center gap-3',

  iconContainer: `
    flex h-10 w-10 items-center justify-center rounded-lg
    bg-green-100 dark:bg-green-900/30
  `,
  icon: 'h-5 w-5 text-green-600 dark:text-green-400',

  title: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400',

  percentage: 'text-3xl font-bold text-green-600 dark:text-green-400',
  percentageLabel: 'text-xs text-gray-600 dark:text-gray-400',

  // Barra (mantener - funciona bien)
  bar: 'relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill: `
    absolute left-0 top-0 h-full rounded-full
    bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600
    transition-all duration-1000
  `,

  // Milestones
  milestones: 'mt-4 flex justify-between gap-3',
  milestone: 'flex-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-center',
  milestoneValue: 'text-base font-bold',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// ==============================================
// TABS STYLES - REFACTORIZADO ✅
// ==============================================
export const tabsClasses = {
  container: 'mt-6',

  list: `
    border-b border-gray-200 dark:border-gray-700
    flex gap-6 overflow-x-auto
  `,

  trigger: `
    relative px-4 py-3
    text-sm font-medium
    text-gray-600 dark:text-gray-400
    hover:text-gray-900 dark:hover:text-gray-100
    transition-colors
    data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400
    data-[state=active]:border-b-2 data-[state=active]:border-orange-600
  `,

  content: 'pt-6',
}

// ==============================================
// INFO CARDS STYLES - REFACTORIZADO ✅
// ==============================================
export const infoCardClasses = {
  card: `
    border-l-4
    bg-white dark:bg-gray-800
    rounded-lg p-4 shadow-sm
  `,

  header: 'flex items-center gap-3 mb-4',

  iconContainer: `
    flex h-10 w-10 items-center justify-center rounded-lg
  `,
  icon: 'h-5 w-5',

  title: 'text-lg font-semibold text-gray-900 dark:text-gray-100',

  content: 'space-y-3',
}

// ==============================================
// COLORES POR TIPO DE CARD
// ==============================================
export const cardColors = {
  tecnica: {
    border: 'border-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  financiera: {
    border: 'border-green-600',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  cliente: {
    border: 'border-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  fechas: {
    border: 'border-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
}

// ==============================================
// DOCUMENTOS TAB STYLES
// ==============================================
export const documentosClasses = {
  container: `
    border-l-4 border-orange-600
    bg-white dark:bg-gray-800
    rounded-lg p-4 shadow-sm
  `,

  header: 'flex items-start justify-between',
  leftSection: 'flex items-center gap-3',

  iconContainer: `
    flex h-10 w-10 items-center justify-center rounded-lg
    bg-orange-100 dark:bg-orange-900/30
  `,
  icon: 'h-5 w-5 text-orange-600 dark:text-orange-400',

  title: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  subtitle: 'text-sm text-gray-600 dark:text-gray-400',

  actionsSection: 'flex gap-2',
}

// ==============================================
// LINDEROS TAB STYLES
// ==============================================
export const linderosClasses = {
  container: `
    border-l-4 border-blue-600
    bg-white dark:bg-gray-800
    rounded-lg p-6 shadow-sm
  `,

  header: 'flex items-center gap-3 mb-6',

  iconContainer: `
    flex h-10 w-10 items-center justify-center rounded-lg
    bg-blue-100 dark:bg-blue-900/30
  `,
  icon: 'h-5 w-5 text-blue-600 dark:text-blue-400',

  title: 'text-lg font-semibold text-gray-900 dark:text-gray-100',

  mapContainer: 'relative mx-auto mb-8 aspect-square max-w-md',

  linderosGrid: 'grid gap-4 md:grid-cols-2',

  linderoCard: `
    border-l-4 border-blue-500
    bg-white dark:bg-gray-800
    rounded-lg p-4
  `,
}
```

---

### **6.3. Eliminar exports antiguos**

**ELIMINAR (si existen):**
```typescript
// ❌ Eliminar:
export const gradients = { ... }
export const estadoColors = { ... }
```

**Resultado:** Estilos centralizados, sin gradientes decorativos.

---

## ✅ CHECKPOINT 6: Validar Estilos

**Verificar:**
- [ ] Archivo actualizado sin errores de compilación
- [ ] No hay imports rotos
- [ ] Gradients eliminados
- [ ] Clases organizadas por sección

---

## 🧪 PASO 7: TESTING COMPLETO (1 hora)

### **7.1. Testing Responsive**

**Probar en:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1280px)

**Validar:**
- [ ] Header se adapta correctamente
- [ ] Datos críticos wrappean bien en mobile
- [ ] Cards verticales funcionan en todos los tamaños
- [ ] Botones se adaptan (stack en mobile)

---

### **7.2. Testing Dark Mode**

**Probar:**
- [ ] Toggle dark mode
- [ ] Todos los textos legibles
- [ ] Bordes de color visibles
- [ ] Backgrounds sutiles funcionan
- [ ] Iconos con colores correctos

---

### **7.3. Testing Interacciones**

**Validar:**
- [ ] Dropdown menu funciona
- [ ] Botones hover funcionan
- [ ] Tabs cambian correctamente
- [ ] Animaciones suaves (no lag)

---

### **7.4. Testing de Datos**

**Probar con:**
- [ ] Vivienda Disponible (mostrar CTA "Asignar Cliente")
- [ ] Vivienda Asignada (mostrar datos de cliente)
- [ ] Vivienda Pagada (mostrar progreso 100%)
- [ ] Vivienda sin datos opcionales (matricula, nomenclatura)

---

## ✅ CHECKPOINT FINAL: Validación Completa

### **Checklist de Implementación:**

#### **Header:**
- [ ] Borde de color naranja (no gradiente)
- [ ] Título text-3xl (30px)
- [ ] Datos críticos visibles (valor, área, proyecto)
- [ ] Badges de estado con color semántico
- [ ] Botones en dropdown menu
- [ ] Dark mode funcionando

#### **Barra de Progreso:**
- [ ] Borde verde (no gradiente en container)
- [ ] Icono con background sutil
- [ ] Porcentaje destacado (text-3xl)
- [ ] Barra de progreso mantiene gradiente (funcional)
- [ ] Dark mode funcionando

#### **Tab Información:**
- [ ] Layout vertical (no grid 2 columnas)
- [ ] Borde de color en cada card
- [ ] Iconos con background sutil
- [ ] Componente DataRow funcionando
- [ ] Jerarquía tipográfica clara
- [ ] Dark mode funcionando

#### **Tab Documentos:**
- [ ] Mismo patrón que Clientes
- [ ] Borde de color (no gradiente)
- [ ] Botones consistentes (primary + dropdown)
- [ ] Dark mode funcionando

#### **Tab Linderos:**
- [ ] Borde de color en card principal
- [ ] Mapa visual preservado
- [ ] Cards de descripciones simplificados
- [ ] Dark mode funcionando

#### **Estilos:**
- [ ] Archivo actualizado
- [ ] Gradients eliminados
- [ ] Clases organizadas
- [ ] No hay errores de compilación

#### **Testing:**
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark mode completo
- [ ] Interacciones funcionando
- [ ] Datos diversos probados

---

## 🎯 COMPARACIÓN ANTES/DESPUÉS

### **ANTES:**
- ❌ Gradientes decorativos por todos lados
- ❌ Grid 2 columnas rompe lectura
- ❌ Datos críticos ocultos
- ❌ Inconsistencia con otros módulos
- ❌ Header text-2xl
- ❌ 4 gradientes diferentes en cards

### **DESPUÉS:**
- ✅ Borde de color sutil (consistente)
- ✅ Layout vertical escaneable
- ✅ Datos críticos visibles (valor, área, proyecto)
- ✅ Consistencia total con Clientes y Proyectos
- ✅ Header text-3xl
- ✅ Iconos con background sutil

---

## 📚 ARCHIVOS DE REFERENCIA

- **Guía completa**: `REFACTOR-VIVIENDAS-COMPLETO.md`
- **Sistema de diseño**: `SISTEMA-DISENO-UX-JERARQUIA-VISUAL.md`
- **Ejemplo Clientes**: `REFACTOR-CLIENTE-HEADER-EJEMPLO-CODIGO.md`
- **Checklist general**: `CHECKLIST-IMPLEMENTACION-SISTEMA-DISENO.md`

---

## 🆘 PROBLEMAS COMUNES

### **Problema 1: Imports rotos**
**Error**: `Cannot find module '@/components/ui/dropdown-menu'`
**Solución**: Instalar shadcn/ui dropdown: `npx shadcn-ui@latest add dropdown-menu`

### **Problema 2: Tipos TypeScript**
**Error**: `Property 'vivienda' does not exist`
**Solución**: Verificar tipos en `src/types/viviendas.ts`

### **Problema 3: Dark mode no funciona**
**Error**: Colores no cambian en dark mode
**Solución**: Verificar que todas las clases tienen variante `dark:`

### **Problema 4: Layout roto en mobile**
**Error**: Elementos se sobreponen en mobile
**Solución**: Agregar `flex-wrap` en contenedores horizontales

---

**Última actualización**: 2024-11-07
**Tiempo total**: 7-8 horas
**Módulo**: Viviendas
**Archivo relacionado**: `REFACTOR-VIVIENDAS-COMPLETO.md`
