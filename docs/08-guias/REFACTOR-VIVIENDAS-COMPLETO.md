# 🏠 REFACTORIZACIÓN COMPLETA: Módulo de Viviendas

> **Aplicando Sistema de Diseño UX a Detalle de Viviendas y todos sus Tabs**

---

## 📊 ANÁLISIS DEL CÓDIGO ACTUAL

### **Problemas Identificados en Viviendas:**

#### **1. Header con Gradiente Decorativo** ❌
```tsx
// PROBLEMA: Gradiente agresivo distrae de información
<div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500">
  <h1 className="text-2xl">Manzana {manzanaNombre} - Casa {vivienda.numero}</h1>
  <div className="flex items-center gap-1.5">
    <MapPin className="h-3.5 w-3.5" />
    <span>{proyectoNombre}</span>  {/* Datos críticos en texto pequeño */}
  </div>
</div>
```

**Problemas:**
- ❌ Gradiente decorativo de 3 colores
- ❌ Título `text-2xl` (debería ser `text-3xl`)
- ❌ Datos críticos (proyecto, ubicación) en texto pequeño
- ❌ Sin jerarquía visual clara

#### **2. Cards con Múltiples Gradientes** ❌
```tsx
// PROBLEMA: Cada card tiene gradiente diferente
<div className="bg-gradient-to-br from-blue-500 to-indigo-600">
  <Building2 className="h-4 w-4" />
</div>
<div className="bg-gradient-to-br from-emerald-500 to-teal-600">
  <DollarSign className="h-4 w-4" />
</div>
<div className="bg-gradient-to-br from-purple-500 to-pink-600">
  <User className="h-4 w-4" />
</div>
```

**Problemas:**
- ❌ 4 gradientes diferentes en iconos de cards
- ❌ "Rainbow effect" visual
- ❌ Compiten por atención

#### **3. Grid 2 Columnas** ❌
```tsx
// PROBLEMA: Grid rompe flujo de lectura
<div className="grid gap-6 lg:grid-cols-2">
  <Card>Información Técnica</Card>
  <Card>Información Financiera</Card>
  <Card>Cliente Asignado</Card>
  <Card>Fechas Importantes</Card>
</div>
```

**Problemas:**
- ❌ Obliga a saltar de izquierda a derecha
- ❌ No sigue patrón F de lectura
- ❌ Dificulta escaneo rápido

#### **4. Tab Documentos sin Patrón Consistente** ❌
```tsx
// PROBLEMA: Diferente al tab de Clientes
<div className="rounded-lg border border-orange-200 bg-white p-4">
  <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2.5">
    <FileText className="h-5 w-5 text-white" />
  </div>
</div>
```

**Problemas:**
- ❌ No sigue patrón establecido en Clientes
- ❌ Gradiente en icono (innecesario)
- ❌ Inconsistencia entre módulos

---

## ✅ SOLUCIÓN PROPUESTA

### **Cambios Principales:**

1. **Header Limpio** → Borde de color + jerarquía clara
2. **Cards Simplificados** → Iconos con background sutil (no gradiente)
3. **Layout Vertical** → Lectura escaneable
4. **Tab Documentos Consistente** → Mismo patrón que Clientes
5. **Datos Críticos Visibles** → Valor, estado, ubicación en nivel 2

---

## 🎨 REFACTORIZACIÓN: Header de Vivienda

### **ANTES (Actual):**

```tsx
{/* ❌ Gradiente decorativo agresivo */}
<motion.div
  className="relative overflow-hidden rounded-xl p-5 text-white shadow-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500"
>
  {/* Patrones decorativos (distraen) */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute left-10 top-10 h-32 w-32 animate-pulse rounded-full bg-white/10"></div>
  </div>

  {/* Breadcrumb */}
  <div className="flex items-center gap-1.5 text-xs">
    <Home className="h-3 w-3" />
    <ChevronRight className="h-3 w-3" />
    <span>Viviendas</span>
  </div>

  {/* Contenido */}
  <div className="mt-4 flex items-start justify-between">
    <div className="flex items-start gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
        <Home className="h-6 w-6" />
      </div>
      <div>
        {/* ❌ Título text-2xl (debería ser text-3xl) */}
        <h1 className="text-2xl font-bold">
          Manzana {manzanaNombre} - Casa {vivienda.numero}
        </h1>
        {/* ❌ Ubicación en texto pequeño (debería ser nivel 2) */}
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5" />
          <span>{proyectoNombre}</span>
        </div>
      </div>
    </div>
  </div>

  {/* ❌ Badges abajo (sin énfasis) */}
  <div className="mt-4 flex items-center gap-3">
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs">
      {vivienda.estado}
    </span>
  </div>
</motion.div>
```

**Problemas visuales:**
- 🔴 Gradiente de 3 colores distrae
- 🔴 Todo texto pequeño (sin jerarquía)
- 🔴 Datos críticos (valor, área) NO visibles
- 🔴 Ubicación pierde protagonismo

---

### **DESPUÉS (Refactorizado):**

```tsx
{/* ✅ HEADER LIMPIO - BORDE DE COLOR */}
<div className="border-l-4 border-orange-600 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
  {/* Breadcrumb */}
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
    <button
      onClick={() => router.push('/viviendas')}
      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
    >
      <Home className="h-4 w-4" />
      <span>Viviendas</span>
    </button>
    <ChevronRight className="h-4 w-4" />
    <span className="text-gray-900 dark:text-gray-100 font-medium">
      Manzana {manzanaNombre} - Casa {vivienda.numero}
    </span>
  </div>

  {/* LAYOUT PRINCIPAL */}
  <div className="flex items-start justify-between">
    <div className="flex-1">
      {/* NIVEL 1: Título HERO - 30px Bold */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Manzana {manzanaNombre} - Casa {vivienda.numero}
      </h1>

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

        {/* Área */}
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
    </div>

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
  </div>
</div>
```

**Mejoras visuales:**
- ✅ Borde de color (no gradiente)
- ✅ Jerarquía clara: 30px → 18px → 14px
- ✅ Datos críticos visibles (valor, área, proyecto)
- ✅ 1 CTA + menú dropdown

---

### **Componente: EstadoBadge para Viviendas**

```tsx
// ✅ Badge de estado CON COLOR SEMÁNTICO
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

---

## 📊 REFACTORIZACIÓN: Barra de Progreso

### **ANTES (Actual):**

```tsx
{/* ❌ Card con gradiente en icono */}
<div className="rounded-xl border border-emerald-200 bg-white p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
      <Activity className="h-5 w-5" />
    </div>
    <div>
      <p className="text-base font-bold">Progreso de Pago</p>
      <p className="text-xs">Calculado según abonos</p>
    </div>
  </div>
</div>
```

---

### **DESPUÉS (Refactorizado):**

```tsx
{/* ✅ Card con icono sutil */}
<div className="border-l-4 border-green-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    {/* Título con icono sutil */}
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
        <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Progreso de Pago
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Calculado según abonos realizados
        </p>
      </div>
    </div>

    {/* Porcentaje destacado */}
    <div className="text-right">
      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
        {vivienda.porcentaje_pagado || 0}%
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Completado
      </p>
    </div>
  </div>

  {/* Barra de progreso (sin cambios - está bien) */}
  <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
    <motion.div
      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600"
      initial={{ width: 0 }}
      animate={{ width: `${vivienda.porcentaje_pagado || 0}%` }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  </div>

  {/* Milestones (sin cambios - está bien) */}
  <div className="mt-4 flex justify-between gap-3">
    <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
      <p className="text-base font-bold text-green-600 dark:text-green-400">
        {formatCurrency(vivienda.total_abonado || 0)}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">Abonado</p>
    </div>
    <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
      <p className="text-base font-bold text-orange-600 dark:text-orange-400">
        {formatCurrency(vivienda.saldo_pendiente || vivienda.valor_total)}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">Pendiente</p>
    </div>
    <div className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-center">
      <p className="text-base font-bold text-blue-600 dark:text-blue-400">
        {formatCurrency(vivienda.valor_total)}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
    </div>
  </div>
</div>
```

**Cambios:**
- ✅ Borde izquierdo verde (no gradiente en header)
- ✅ Icono con background sutil
- ✅ Jerarquía clara en textos
- ✅ Barra de progreso mantiene gradiente (funcional)

---

## 🏗️ REFACTORIZACIÓN: Tab Información

### **ANTES (Grid 2 Columnas):**

```tsx
{/* ❌ Grid rompe flujo de lectura */}
<div className="grid gap-6 lg:grid-cols-2">
  {/* Card con gradiente */}
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2.5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <h3>Información Técnica</h3>
      </div>
    </CardHeader>
    <CardContent>
      <div>
        <p className="text-xs">Matrícula Inmobiliaria</p>
        <p className="text-sm font-mono">{vivienda.matricula_inmobiliaria}</p>
      </div>
    </CardContent>
  </Card>

  {/* Más cards con gradientes diferentes... */}
</div>
```

---

### **DESPUÉS (Layout Vertical):**

```tsx
{/* ✅ Layout vertical escaneable */}
<div className="space-y-4">
  {/* Card simplificado */}
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

  {/* Información Financiera */}
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

  {/* Cliente Asignado (si aplica) */}
  {vivienda.estado !== 'Disponible' && (
    <div className="border-l-4 border-purple-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Cliente Asignado
        </h3>
      </div>

      <div className="space-y-3">
        <DataRow
          label="Nombre"
          value={vivienda.clientes?.nombre_completo || 'No disponible'}
        />
        {vivienda.clientes?.telefono && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Phone className="h-4 w-4 text-purple-600" />
            <span>{vivienda.clientes.telefono}</span>
          </div>
        )}
        {vivienda.clientes?.email && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Mail className="h-4 w-4 text-purple-600" />
            <span>{vivienda.clientes.email}</span>
          </div>
        )}
        {vivienda.fecha_asignacion && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Asignada el {formatDate(vivienda.fecha_asignacion)}</span>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Fechas Importantes */}
  <div className="border-l-4 border-orange-600 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
        <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Fechas Importantes
      </h3>
    </div>

    <div className="space-y-3">
      <DataRow
        label="Fecha de Creación"
        value={formatDate(vivienda.fecha_creacion)}
      />
      {vivienda.fecha_asignacion && (
        <DataRow
          label="Fecha de Asignación"
          value={formatDate(vivienda.fecha_asignacion)}
        />
      )}
      {vivienda.fecha_pago_completo && (
        <DataRow
          label="Fecha de Pago Completo"
          value={formatDate(vivienda.fecha_pago_completo)}
        />
      )}
    </div>
  </div>

  {/* CTA Asignar Cliente (si disponible) */}
  {vivienda.estado === 'Disponible' && (
    <div className="border-l-4 border-green-600 bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-green-900 dark:text-green-100">
            Esta vivienda está disponible
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200 mt-1">
            Puedes asignarle un cliente para iniciar el proceso de venta
          </p>
        </div>
        <button
          onClick={onAsignarCliente}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium shadow-sm transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Asignar Cliente</span>
        </button>
      </div>
    </div>
  )}
</div>
```

**Componente Auxiliar: DataRow**

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

**Mejoras:**
- ✅ Layout vertical (escaneable)
- ✅ Borde de color en lugar de gradiente
- ✅ Iconos con background sutil
- ✅ Datos organizados con componente DataRow
- ✅ CTA destacado si está disponible

---

## 📄 REFACTORIZACIÓN: Tab Documentos

### **ANTES (Actual):**

```tsx
{/* ❌ Inconsistente con patrón de Clientes */}
<div className='rounded-lg border border-orange-200 bg-white p-4'>
  <div className='flex items-center justify-between'>
    <div className='flex items-center gap-2.5'>
      <div className='rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 p-2.5'>
        <FileText className='h-5 w-5 text-white' />
      </div>
      <div>
        <h2 className='text-base font-bold'>Documentos de la Vivienda</h2>
        <p className='text-xs'>Certificados, planos, escrituras</p>
      </div>
    </div>

    <button className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-3 py-1.5'>
      <Upload className='h-3.5 w-3.5' />
      <span>Subir Documento</span>
    </button>
  </div>
</div>
```

---

### **DESPUÉS (Refactorizado - Consistente con Clientes):**

```tsx
{/* ✅ Consistente con patrón de Clientes */}
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

**Mejoras:**
- ✅ Mismo patrón que módulo de Clientes
- ✅ Borde de color (no gradiente)
- ✅ Icono con background sutil
- ✅ Jerarquía tipográfica clara
- ✅ Botones consistentes (primary + dropdown)

---

## 🧭 Tab Linderos (Mantener Visual)

El tab de Linderos tiene un diseño visual único (mapa de linderos) que funciona bien. **Cambios mínimos:**

```tsx
{/* ✅ Card principal con borde de color */}
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

  {/* Cards de descripciones (simplificar bordes) */}
  <div className="grid gap-4 md:grid-cols-2">
    {linderos.map((lindero) => (
      <div
        key={lindero.direccion}
        className="border-l-4 border-${lindero.color}-500 bg-white dark:bg-gray-800 rounded-lg p-4"
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

**Cambios mínimos:**
- ✅ Card principal con borde de color
- ✅ Header con icono sutil
- ✅ Cards de linderos con borde (no fondo de color)

---

## 📊 ESTILOS ACTUALIZADOS

```typescript
// vivienda-detalle.styles.ts - REFACTORIZADO

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

  // Milestones (mantener)
  milestones: 'mt-4 flex justify-between gap-3',
  milestone: 'flex-1 rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-center',
  milestoneValue: 'text-base font-bold',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
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
// ELIMINAR GRADIENTS (ya no se usan)
// ==============================================
// ❌ Eliminar:
// export const gradients = { ... }
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Header**
- [ ] Reemplazar gradiente por borde de color
- [ ] Cambiar título a `text-3xl`
- [ ] Agregar chips de datos críticos (valor, área, proyecto)
- [ ] Mover badges de estado abajo
- [ ] Convertir acciones en dropdown

### **Fase 2: Barra de Progreso**
- [ ] Reemplazar gradiente en icono por background sutil
- [ ] Aplicar jerarquía tipográfica
- [ ] Mantener barra de progreso con gradiente (funcional)

### **Fase 3: Tab Información**
- [ ] Cambiar grid 2 columnas a layout vertical
- [ ] Eliminar gradientes de iconos
- [ ] Crear componente DataRow
- [ ] Aplicar borde de color a cada card

### **Fase 4: Tab Documentos**
- [ ] Aplicar patrón consistente con Clientes
- [ ] Eliminar gradiente de icono
- [ ] Unificar botones (primary + dropdown)

### **Fase 5: Tab Linderos**
- [ ] Agregar borde de color a card principal
- [ ] Simplificar cards de descripciones

### **Fase 6: Estilos**
- [ ] Actualizar `vivienda-detalle.styles.ts`
- [ ] Eliminar gradients export
- [ ] Agregar componente EstadoBadge

### **Fase 7: Validación**
- [ ] Testing responsive
- [ ] Testing dark mode
- [ ] Verificar consistencia con Clientes

---

## 🎯 RESULTADO ESPERADO

### **Antes:**
- ❌ Gradientes decorativos por todos lados
- ❌ Grid 2 columnas rompe lectura
- ❌ Datos críticos ocultos
- ❌ Inconsistencia con otros módulos

### **Después:**
- ✅ Borde de color sutil (consistente)
- ✅ Layout vertical escaneable
- ✅ Datos críticos visibles (valor, área, proyecto)
- ✅ Consistencia total con Clientes y Proyectos

---

**Última actualización**: 2024-11-07
**Tiempo estimado**: 6-8 horas de implementación
**Archivo relacionado**: `SISTEMA-DISENO-UX-JERARQUIA-VISUAL.md`
