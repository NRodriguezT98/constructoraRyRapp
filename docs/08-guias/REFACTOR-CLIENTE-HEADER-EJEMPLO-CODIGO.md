# 🎨 REFACTORIZACIÓN: Header Cliente - Ejemplo de Código

> **Aplicando Sistema de Diseño: Jerarquía Visual Clara**

---

## 📊 COMPARACIÓN VISUAL

### **ANTES (Actual):**
```
┌──────────────────────────────────────────────────────────┐
│ 🎨🎨🎨 GRADIENTE PÚRPURA-ROSA (distrae) 🎨🎨🎨          │
│                                                          │
│ [🟣] Laura Duque                                         │
│      📄 Cédula - 1234567                                 │
│      🟢 [Proceso Badge - compite con título]             │
│                                                          │
│                          [Crear] [Editar] [Eliminar]     │
└──────────────────────────────────────────────────────────┘

Problemas:
❌ Gradiente decorativo (no aporta función)
❌ Badge "Progreso" compite con nombre
❌ Datos críticos (teléfono, email) no visibles
❌ Todo el mismo tamaño de fuente
```

### **DESPUÉS (Propuesta):**
```
┌──────────────────────────────────────────────────────────┐
│ │ (borde púrpura sutil - no gradiente)                   │
│ │                                                         │
│ │ Laura Duque  ← 30px HERO                  [Estado]     │
│ │ 📄 CC 1234567  📞 +57 312...  ✉ laura@...  ← 18px     │
│ │                                                         │
│ │ 🟢 Proceso: Negociación Activa (3/5)  ← 14px abajo    │
│ │                                                         │
│ │                 [Crear Negociación] [Editar] [⋮ Más]   │
└──────────────────────────────────────────────────────────┘

Soluciones:
✅ Jerarquía clara: Nombre > Documento/Tel/Email > Progreso
✅ Borde de color (no background)
✅ Datos críticos visibles en segunda línea
✅ Progreso abajo (no compite)
```

---

## 📝 CÓDIGO REFACTORIZADO

### **1. Header Hero - Limpio y Jerárquico**

```tsx
{/* ============================================ */}
{/* HEADER HERO - REFACTORIZADO ✅ */}
{/* ============================================ */}
<div className="relative border-l-4 border-purple-600 bg-white dark:bg-gray-800 rounded-lg p-6">
  {/* Breadcrumb - Arriba a la izquierda */}
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
    <button
      onClick={() => router.push('/clientes')}
      className="flex items-center gap-1 hover:text-purple-600 transition-colors"
    >
      <User className="h-4 w-4" />
      <span>Clientes</span>
    </button>
    <ChevronRight className="h-4 w-4" />
    <span className="text-gray-900 dark:text-gray-100 font-medium">
      {cliente.nombre_completo}
    </span>
  </div>

  {/* NIVEL 1: Nombre HERO - 30px, Bold */}
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        {cliente.nombre_completo}
      </h1>

      {/* NIVEL 2: Datos CRÍTICOS - 18px, Semibold, Horizontal */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        {/* Documento */}
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Documento</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {TIPOS_DOCUMENTO[cliente.tipo_documento]} {cliente.numero_documento}
            </p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {cliente.telefono || 'No registrado'}
            </p>
          </div>
        </div>

        {/* Email */}
        {cliente.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {cliente.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* NIVEL 3: Progreso del Proceso - Abajo (no compite) */}
      <div className="inline-flex">
        <ProgresoProcesoBadge clienteId={clienteUUID} variant="compact" />
      </div>
    </div>

    {/* Acciones - Arriba a la derecha */}
    <div className="flex items-start gap-2 ml-6">
      {/* Estado Badge */}
      <EstadoBadge estado={cliente.estado} />

      {/* CTA Principal */}
      <Tooltip
        content={
          !cliente.documento_identidad_url
            ? '⚠️ Sube la cédula primero (tab Documentos)'
            : 'Crear nueva negociación'
        }
      >
        <motion.button
          onClick={handleCrearNegociacion}
          disabled={!cliente.documento_identidad_url}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            shadow-sm transition-all
            ${
              cliente.documento_identidad_url
                ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            }
          `}
          whileHover={cliente.documento_identidad_url ? { scale: 1.02, y: -1 } : {}}
          whileTap={cliente.documento_identidad_url ? { scale: 0.98 } : {}}
        >
          {cliente.documento_identidad_url ? (
            <Handshake className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          <span>Crear Negociación</span>
        </motion.button>
      </Tooltip>

      {/* Acciones Secundarias - Menú Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditar}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar Cliente
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEliminar} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Cliente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</div>
```

---

## 🎨 COMPONENTE: EstadoBadge Mejorado

```tsx
// ✅ Badge de estado SIN gradientes, solo color semántico
function EstadoBadge({ estado }: { estado: string }) {
  const config = {
    Activo: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    Interesado: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    Inactivo: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      dot: 'bg-gray-500',
    },
  }

  const { bg, border, text, dot } = config[estado as keyof typeof config] || config.Interesado

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

## 📐 ESTILOS ACTUALIZADOS (cliente-detalle.styles.ts)

```typescript
// ============================================
// HEADER STYLES - REFACTORIZADO ✅
// ============================================
export const headerClasses = {
  // Container principal - Borde de color (no gradiente)
  container: `
    relative border-l-4 border-purple-600
    bg-white dark:bg-gray-800
    rounded-lg p-6 shadow-sm
  `,

  // Breadcrumb
  breadcrumb: 'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4',
  breadcrumbIcon: 'h-4 w-4',
  breadcrumbLink: 'flex items-center gap-1 hover:text-purple-600 transition-colors',
  breadcrumbCurrent: 'text-gray-900 dark:text-gray-100 font-medium',

  // Layout principal
  contentWrapper: 'flex items-start justify-between',
  leftSection: 'flex-1',
  actionsSection: 'flex items-start gap-2 ml-6',

  // NIVEL 1: Título HERO (30px, bold)
  title: 'text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3',

  // NIVEL 2: Datos críticos (18px, semibold)
  datosContainer: 'flex flex-wrap items-center gap-6 mb-4',
  datoItem: 'flex items-center gap-2',
  datoIcon: 'h-5 w-5 text-purple-600 flex-shrink-0',
  datoLabel: 'text-xs text-gray-500 dark:text-gray-400',
  datoValue: 'text-lg font-semibold text-gray-900 dark:text-gray-100',

  // NIVEL 3: Progreso
  progressContainer: 'inline-flex',

  // Botones
  ctaPrimary: `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    bg-purple-600 text-white hover:bg-purple-700
    text-sm font-medium shadow-sm hover:shadow-md
    transition-all
  `,
  ctaDisabled: `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg
    bg-gray-200 text-gray-500 cursor-not-allowed
    dark:bg-gray-700 dark:text-gray-400
    text-sm font-medium
  `,
  actionMenu: `
    inline-flex items-center gap-2 px-3 py-2 rounded-lg
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700
    text-sm font-medium transition-colors
  `,
}
```

---

## 🎯 CAMBIOS CLAVE

### **1. Eliminación de Gradientes Decorativos**
```tsx
// ❌ ANTES: Gradiente distractivo
<div className="bg-gradient-to-br from-purple-600 via-purple-600 to-pink-600 p-5 text-white">

// ✅ DESPUÉS: Borde de color limpio
<div className="border-l-4 border-purple-600 bg-white dark:bg-gray-800 p-6">
```

### **2. Jerarquía Tipográfica Clara**
```tsx
// ❌ ANTES: Todo text-2xl (sin jerarquía)
<h1 className="text-2xl">{cliente.nombre_completo}</h1>
<p className="text-sm">{cliente.numero_documento}</p>

// ✅ DESPUÉS: 3 niveles claros
<h1 className="text-3xl font-bold">{cliente.nombre_completo}</h1>  {/* NIVEL 1 */}
<p className="text-lg font-semibold">{cliente.numero_documento}</p>  {/* NIVEL 2 */}
<span className="text-xs text-gray-500">Última actividad</span>     {/* NIVEL 3 */}
```

### **3. Datos Críticos Visibles**
```tsx
// ❌ ANTES: Solo documento en header
<p className="flex items-center gap-1.5">
  <FileText className="h-3.5 w-3.5" />
  {TIPOS_DOCUMENTO[cliente.tipo_documento]} - {cliente.numero_documento}
</p>

// ✅ DESPUÉS: Documento + Teléfono + Email visibles
<div className="flex items-center gap-6">
  <DataChip icon={FileText} label="Documento" value={cliente.numero_documento} />
  <DataChip icon={Phone} label="Teléfono" value={cliente.telefono} />
  <DataChip icon={Mail} label="Email" value={cliente.email} />
</div>
```

### **4. Progreso NO Compite con Título**
```tsx
// ❌ ANTES: Badge al lado del título (compite)
<div className="flex items-center gap-3">
  <h1>{cliente.nombre_completo}</h1>
  <ProgresoProcesoBadge />  {/* Distrae */}
</div>

// ✅ DESPUÉS: Badge abajo (no compite)
<h1 className="mb-3">{cliente.nombre_completo}</h1>
<div className="flex gap-6">
  <DataChip ... />  {/* Datos críticos primero */}
</div>
<div className="mt-4">
  <ProgresoProcesoBadge />  {/* Progreso abajo */}
</div>
```

### **5. CTA Principal Destacado**
```tsx
// ❌ ANTES: Múltiples botones con igual peso
<button className="bg-white/20">Crear Negociación</button>
<button className="bg-white/20">Editar</button>
<button className="bg-red-500/80">Eliminar</button>

// ✅ DESPUÉS: 1 CTA principal + menú secundario
<button className="bg-purple-600 text-white">Crear Negociación</button>  {/* PRIMARY */}
<DropdownMenu>
  <DropdownMenuTrigger>⋮ Más</DropdownMenuTrigger>  {/* SECONDARY */}
  <DropdownMenuContent>
    <DropdownMenuItem>Editar</DropdownMenuItem>
    <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🚀 RESULTADO FINAL

### **Antes** (Problemas):
- ❌ Gradiente distrae de información
- ❌ Todo el mismo peso visual
- ❌ Datos críticos ocultos
- ❌ 3 botones compiten por atención

### **Después** (Solución):
- ✅ Borde de color sutil
- ✅ Jerarquía clara (Nombre → Datos → Progreso)
- ✅ Documento + Teléfono + Email visibles
- ✅ 1 CTA principal + menú secundario

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Reemplazar gradiente por borde de color (`border-l-4`)
- [ ] Cambiar título a `text-3xl font-bold`
- [ ] Agregar chips de datos críticos (documento, teléfono, email)
- [ ] Mover ProgresoBadge abajo del título
- [ ] Convertir acciones secundarias en DropdownMenu
- [ ] Validar contraste en modo oscuro
- [ ] Verificar responsive (mobile, tablet, desktop)
- [ ] Testing de accesibilidad (ARIA labels)

---

**Última actualización**: 2024-11-07
**Archivo relacionado**: `SISTEMA-DISENO-UX-JERARQUIA-VISUAL.md`
