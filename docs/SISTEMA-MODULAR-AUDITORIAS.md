# Sistema Modular de Auditorías - Guía de Renderers

## 🎯 Objetivo

Sistema escalable y mantenible para mostrar detalles de auditoría con componentes reutilizables y renderers específicos por módulo/acción.

---

## 📐 Arquitectura

### Principios SOLID aplicados:

1. **S - Responsabilidad Única**: Cada componente tiene una sola responsabilidad
2. **O - Abierto/Cerrado**: Fácil agregar nuevos renderers sin modificar código existente
3. **L - Sustitución de Liskov**: Todos los renderers implementan la misma interfaz
4. **I - Segregación de Interfaces**: Props específicas por tipo de renderer
5. **D - Inversión de Dependencias**: Factory pattern para gestión de renderers

---

## 📂 Estructura de Carpetas

```
src/modules/auditorias/components/
├── sections/                    # Componentes reutilizables (cards, badges)
│   ├── AuditoriaHeader.tsx     # Header con usuario, fecha, acción
│   ├── AuditoriaProyecto.tsx   # Card de info de proyecto
│   ├── AuditoriaManzanas.tsx   # Grid de manzanas
│   ├── AuditoriaEstado.tsx     # Badge de estado con colores
│   ├── AuditoriaMetadata.tsx   # Info técnica (IP, navegador)
│   └── index.ts                # Barrel export
├── renderers/                   # Renderers específicos por módulo
│   ├── proyectos/
│   │   ├── CreacionProyectoRenderer.tsx
│   │   ├── ActualizacionProyectoRenderer.tsx
│   │   └── index.ts
│   ├── viviendas/
│   │   └── index.ts (TODO)
│   ├── clientes/
│   │   └── index.ts (TODO)
│   ├── shared/
│   │   └── RendererGenerico.tsx  # Fallback para acciones sin renderer
│   └── index.ts                  # Factory pattern
└── DetalleAuditoriaModal.tsx    # Modal contenedor (EXISTENTE)
```

---

## 🔧 Componentes Reutilizables (Sections)

### 1. AuditoriaHeader

**Propósito**: Header consistente para todos los detalles de auditoría

**Props**:
```typescript
interface AuditoriaHeaderProps {
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'archivado' | 'restaurado'
  usuario: {
    nombre: string
    email: string
    rol?: string
  }
  fecha: string
  modulo: string
}
```

**Características**:
- Badge de acción con colores (CREATE=verde, UPDATE=azul, DELETE=rojo)
- Avatar y datos de usuario
- Timestamp formateado
- Gradiente de fondo con pattern
- Responsive y dark mode

**Ejemplo de uso**:
```tsx
<AuditoriaHeader
  accion="CREATE"
  usuario={{ nombre: "Juan Pérez", email: "juan@ryr.com", rol: "Admin" }}
  fecha="2025-01-15T10:30:00Z"
  modulo="proyectos"
/>
```

---

### 2. AuditoriaProyecto

**Propósito**: Mostrar información básica de un proyecto

**Props**:
```typescript
interface AuditoriaProyectoProps {
  nombre: string
  ubicacion?: string
  descripcion?: string
}
```

**Características**:
- Card con glassmorphism (fondo azul)
- Icono MapPin para ubicación
- Tipografía clara y legible
- Opcional: descripción puede ser larga

**Ejemplo de uso**:
```tsx
<AuditoriaProyecto
  nombre="Urbanización Los Pinos"
  ubicacion="Calle 123 #45-67, Bogotá"
  descripcion="Proyecto residencial de 50 viviendas"
/>
```

---

### 3. AuditoriaManzanas

**Propósito**: Mostrar grid de manzanas con estadísticas

**Props**:
```typescript
interface AuditoriaManzanasProps {
  manzanas: Array<{
    nombre: string
    cantidad_viviendas: number
  }>
  totalViviendas: number
}
```

**Características**:
- Badges de resumen (total manzanas, total viviendas)
- Grid responsivo de manzanas
- Cada manzana con color y cantidad de viviendas
- Gradiente esmeralda/teal

**Ejemplo de uso**:
```tsx
<AuditoriaManzanas
  manzanas={[
    { nombre: 'A', cantidad_viviendas: 10 },
    { nombre: 'B', cantidad_viviendas: 12 }
  ]}
  totalViviendas={22}
/>
```

---

### 4. AuditoriaEstado

**Propósito**: Badge dinámico para mostrar estados con colores

**Props**:
```typescript
interface AuditoriaEstadoProps {
  estado: string  // "en_proceso", "completado", etc.
}
```

**Características**:
- Config centralizada de colores por estado
- Icono específico por estado
- Punto animado pulsante
- Gradiente según tipo de estado

**Estados soportados**:
- `en_proceso` → Azul
- `completado` → Verde
- `pausado` → Gris
- `en_planificacion` → Morado
- `en_construccion` → Naranja

**Ejemplo de uso**:
```tsx
<AuditoriaEstado estado="completado" />
```

---

### 5. AuditoriaMetadata

**Propósito**: Mostrar información técnica de sesión

**Props**:
```typescript
interface AuditoriaMetadataProps {
  navegador?: string
  registroId?: string
  ip?: string
}
```

**Características**:
- Renderizado condicional (solo si hay datos)
- Fuente monospace para datos técnicos
- Diseño compacto
- Border sutil

**Ejemplo de uso**:
```tsx
<AuditoriaMetadata
  navegador="Chrome 120.0"
  registroId="abc123def456"
  ip="192.168.1.100"
/>
```

---

## 🎨 Renderers Específicos

### ¿Qué es un Renderer?

Un renderer es un componente que **compone** múltiples sections para mostrar los detalles específicos de una acción en un módulo.

**Interfaz común**:
```typescript
interface RendererProps {
  metadata?: any           // Datos extra de la acción
  datosNuevos?: any       // Datos nuevos (CREATE, UPDATE)
  datosAnteriores?: any   // Datos anteriores (UPDATE, DELETE)
}
```

---

### Renderer: CreacionProyectoRenderer

**Archivo**: `renderers/proyectos/CreacionProyectoRenderer.tsx`

**Propósito**: Mostrar detalles de creación de proyecto

**Composición**:
```tsx
<div>
  <AuditoriaProyecto {...datosProyecto} />
  <AuditoriaEstado estado={metadata.estado} />
  <AuditoriaManzanas manzanas={metadata.manzanas} />
</div>
```

**Cuándo se usa**: `proyectos` + `CREATE`

---

### Renderer: ActualizacionProyectoRenderer

**Archivo**: `renderers/proyectos/ActualizacionProyectoRenderer.tsx`

**Propósito**: Mostrar diferencias campo por campo en actualizaciones

**Características**:
- Detecta campos modificados automáticamente
- Muestra valor anterior (rojo, tachado)
- Muestra valor nuevo (verde, bold)
- Secciones especiales para manzanas agregadas/eliminadas
- Badge de resumen de cambios

**Composición**:
```tsx
<div>
  {/* Resumen de cambios */}
  <Badge>X campos modificados</Badge>

  {/* Campos modificados */}
  {camposModificados.map(cambio => (
    <CampoModificadoCard
      anterior={cambio.anterior}
      nuevo={cambio.nuevo}
    />
  ))}

  {/* Manzanas agregadas/eliminadas */}
  <ManzanasAgregadas />
  <ManzanasEliminadas />
</div>
```

**Cuándo se usa**: `proyectos` + `UPDATE`

---

### Renderer: RendererGenerico (Fallback)

**Archivo**: `renderers/shared/RendererGenerico.tsx`

**Propósito**: Mostrar JSON raw cuando no hay renderer específico

**Características**:
- Mensaje informativo sobre vista genérica
- Muestra metadata como key-value pairs
- Muestra datosNuevos y datosAnteriores como JSON formateado
- Colores: azul (info), verde (nuevos), naranja (anteriores)

**Cuándo se usa**: Cualquier módulo/acción sin renderer específico

---

## ⚙️ Sistema de Factory Pattern

### Archivo: `renderers/index.ts`

**Propósito**: Seleccionar inteligentemente el renderer apropiado

### Mapa de Renderers

```typescript
const RENDERERS_MAP: Record<string, Record<string, RendererComponent>> = {
  proyectos: {
    CREATE: CreacionProyectoRenderer,
    UPDATE: ActualizacionProyectoRenderer,
  },
  viviendas: {
    // TODO: Agregar renderers
  },
  clientes: {
    // TODO: Agregar renderers
  },
}
```

### Función: getAuditoriaRenderer()

```typescript
export function getAuditoriaRenderer(
  modulo: string,
  accion: string
): RendererComponent {
  const moduloRenderers = RENDERERS_MAP[modulo]

  if (!moduloRenderers) {
    console.warn(`No hay renderers para: ${modulo}`)
    return RendererGenerico
  }

  const renderer = moduloRenderers[accion]

  if (!renderer) {
    console.warn(`No hay renderer para: ${modulo}/${accion}`)
    return RendererGenerico
  }

  return renderer
}
```

**Ventajas**:
- ✅ Un punto centralizado de configuración
- ✅ Warnings en desarrollo cuando falta renderer
- ✅ Fallback automático a renderer genérico
- ✅ Type-safe con TypeScript

---

## 🚀 Cómo Agregar un Nuevo Renderer

### Paso 1: Crear el componente

**Ubicación**: `src/modules/auditorias/components/renderers/[modulo]/[Accion]Renderer.tsx`

**Plantilla**:
```tsx
'use client'

import { AuditoriaProyecto, AuditoriaEstado } from '../sections'

interface MiRendererProps {
  metadata?: any
  datosNuevos?: any
  datosAnteriores?: any
}

export function MiRenderer({ metadata, datosNuevos }: MiRendererProps) {
  return (
    <div className="space-y-4 p-6">
      {/* Usar sections reutilizables */}
      <AuditoriaProyecto {...datosNuevos} />
      <AuditoriaEstado estado={metadata.estado} />

      {/* Lógica específica del renderer */}
      {metadata.customField && (
        <div className="p-4 rounded-lg bg-blue-50">
          {metadata.customField}
        </div>
      )}
    </div>
  )
}
```

---

### Paso 2: Exportar en barrel file

**Archivo**: `renderers/[modulo]/index.ts`

```typescript
export { MiRenderer } from './MiRenderer'
```

---

### Paso 3: Registrar en Factory

**Archivo**: `renderers/index.ts`

```typescript
import { MiRenderer } from './mimodulo'

const RENDERERS_MAP = {
  mimodulo: {
    CREATE: MiRenderer,
  },
}
```

---

### Paso 4: ¡Listo! Ya funciona automáticamente

Cuando `DetalleAuditoriaModal` reciba un registro con:
```typescript
{
  modulo: 'mimodulo',
  accion: 'CREATE',
  // ...
}
```

El factory **automáticamente** seleccionará `MiRenderer`.

---

## 📊 Ejemplo Completo: Crear Renderer de Viviendas

### 1. Crear componente

**Archivo**: `renderers/viviendas/CreacionViviendaRenderer.tsx`

```tsx
'use client'

import { Home, MapPin, DollarSign } from 'lucide-react'
import { AuditoriaEstado } from '../sections'

interface CreacionViviendaRendererProps {
  metadata?: any
  datosNuevos?: any
}

export function CreacionViviendaRenderer({ metadata, datosNuevos }: CreacionViviendaRendererProps) {
  const vivienda = datosNuevos?.vivienda || {}
  const manzana = datosNuevos?.manzana || {}

  return (
    <div className="space-y-4 p-6">
      {/* Info de Vivienda */}
      <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-4 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {vivienda.nombre}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manzana {manzana.nombre}
            </p>
          </div>
        </div>

        {/* Valor */}
        {vivienda.valor_base && (
          <div className="flex items-center gap-2 mt-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-lg font-semibold text-green-600">
              ${vivienda.valor_base.toLocaleString()}
            </span>
          </div>
        )}

        {/* Estado */}
        <div className="mt-3">
          <AuditoriaEstado estado={vivienda.estado} />
        </div>
      </div>
    </div>
  )
}
```

---

### 2. Exportar

**Archivo**: `renderers/viviendas/index.ts`

```typescript
export { CreacionViviendaRenderer } from './CreacionViviendaRenderer'
```

---

### 3. Registrar

**Archivo**: `renderers/index.ts`

```typescript
import { CreacionViviendaRenderer } from './viviendas'

const RENDERERS_MAP = {
  // ...proyectos,
  viviendas: {
    CREATE: CreacionViviendaRenderer,
  },
}
```

---

## 🎨 Guía de Estilos

### Colores por Módulo

| Módulo        | Gradiente                                              |
|---------------|--------------------------------------------------------|
| Proyectos     | `from-green-500/10 to-emerald-500/10`                 |
| Viviendas     | `from-orange-500/10 to-amber-500/10`                  |
| Clientes      | `from-cyan-500/10 to-blue-500/10`                     |
| Negociaciones | `from-pink-500/10 to-purple-500/10`                   |
| Documentos    | `from-red-500/10 to-rose-500/10`                      |

---

### Colores por Acción

| Acción       | Badge Color   | Gradiente                          |
|--------------|---------------|------------------------------------|
| CREATE       | Verde         | `from-green-600 to-emerald-700`   |
| UPDATE       | Azul          | `from-blue-600 to-indigo-700`     |
| DELETE       | Rojo          | `from-red-600 to-rose-700`        |
| archivado    | Ámbar         | `from-amber-600 to-yellow-700`    |
| restaurado   | Verde claro   | `from-green-500 to-emerald-600`   |

---

### Tamaños Estándar

```typescript
// Cards
padding: 'p-4'
borderRadius: 'rounded-xl'
border: 'border-2'

// Icons
size: 'w-5 h-5'  // Estándar
size: 'w-10 h-10' // Contenedores de icon

// Typography
title: 'text-xl font-bold'
subtitle: 'text-sm text-gray-600'
label: 'text-xs font-medium'

// Spacing
gap: 'gap-3'  // Entre elementos relacionados
space: 'space-y-4'  // Entre secciones
```

---

## 🧪 Testing

### Verificar Renderer

```typescript
// En desarrollo, abrir consola y verificar:
getAuditoriaRenderer('proyectos', 'CREATE')
// → Debe retornar CreacionProyectoRenderer

getAuditoriaRenderer('moduloInexistente', 'CREATE')
// → Warning en consola + retorna RendererGenerico
```

---

### Test Manual

1. Crear acción en módulo (ej: crear proyecto)
2. Abrir modal de detalle de auditoría
3. Verificar que muestra el renderer correcto
4. Verificar colores, spacing, datos correctos
5. Probar en dark mode
6. Probar responsive (móvil, tablet, desktop)

---

## 📋 Checklist: Nuevo Renderer

- [ ] Crear componente en `renderers/[modulo]/[Accion]Renderer.tsx`
- [ ] Usar sections reutilizables cuando sea posible
- [ ] Seguir guía de colores y estilos
- [ ] Agregar tipos TypeScript para props
- [ ] Exportar en `renderers/[modulo]/index.ts`
- [ ] Registrar en `RENDERERS_MAP` del factory
- [ ] Probar en desarrollo
- [ ] Verificar warnings en consola
- [ ] Probar dark mode
- [ ] Probar responsive

---

## 🚨 Errores Comunes

### ❌ "No se muestra mi renderer"

**Solución**: Verificar que está registrado en `RENDERERS_MAP` con el módulo y acción **exactos**

```typescript
// ❌ Incorrecto
RENDERERS_MAP = {
  Proyectos: { ... }  // Mayúscula
}

// ✅ Correcto
RENDERERS_MAP = {
  proyectos: { ... }  // Minúscula
}
```

---

### ❌ "Import error en sections"

**Solución**: Usar barrel export

```typescript
// ❌ Incorrecto
import { AuditoriaHeader } from '../sections/AuditoriaHeader'

// ✅ Correcto
import { AuditoriaHeader } from '../sections'
```

---

### ❌ "Props undefined"

**Solución**: Verificar estructura de datos en auditoría

```typescript
// Siempre validar datos antes de usar
const proyecto = datosNuevos?.proyecto || {}
const nombre = proyecto.nombre || 'Sin nombre'
```

---

## 🎯 Próximos Pasos

### Renderers Pendientes

**Proyectos**:
- [ ] EliminacionProyectoRenderer

**Viviendas**:
- [ ] CreacionViviendaRenderer
- [ ] ActualizacionViviendaRenderer
- [ ] EliminacionViviendaRenderer

**Clientes**:
- [ ] CreacionClienteRenderer
- [ ] ActualizacionClienteRenderer
- [ ] EliminacionClienteRenderer

**Negociaciones**:
- [ ] CreacionNegociacionRenderer
- [ ] ActualizacionNegociacionRenderer
- [ ] FinalizacionNegociacionRenderer

**Documentos**:
- [ ] SubidaDocumentoRenderer
- [ ] ReemplazoDocumentoRenderer
- [ ] EliminacionDocumentoRenderer

---

## 📖 Recursos

- **Documentación de referencia**: `docs/SISTEMA-MODULAR-AUDITORIAS.md`
- **Ejemplos de código**: Ver `renderers/proyectos/`
- **Componentes base**: Ver `sections/`
- **Factory pattern**: Ver `renderers/index.ts`

---

## ✅ Ventajas del Sistema

1. **DRY**: No duplicar código, reutilizar sections
2. **Escalable**: Agregar renderer = 1 archivo + 2 líneas de config
3. **Mantenible**: Cambiar diseño de card = afecta todos los módulos
4. **Consistente**: Mismo UX en todos los módulos
5. **Type-safe**: TypeScript detecta errores en tiempo de desarrollo
6. **Performante**: Lazy loading de renderers según necesidad
7. **Documentado**: Código autodocumentado con interfaces claras
8. **Testeable**: Fácil hacer unit tests de cada renderer

---

**🎉 Sistema listo para escalar infinitamente sin código duplicado**
