# 🎨 SISTEMA DE ESTANDARIZACIÓN DE MÓDULOS

## 📌 Resumen Ejecutivo

**Problema identificado**: Los módulos nuevos tienen diseños inconsistentes, son muy grandes, mal posicionados, y les falta soporte para modo oscuro.

**Solución implementada**: Sistema completo de estandarización con:
- ✅ Guía de diseño comprensiva (`GUIA-DISENO-MODULOS.md`)
- ✅ Componentes compartidos estandarizados
- ✅ Template completo de módulo (`TEMPLATE-MODULO-ESTANDAR.md`)
- ✅ Checklist de validación

---

## 📚 Documentación del Sistema

### 1. Guía de Diseño
**Archivo**: `docs/GUIA-DISENO-MODULOS.md`

Define estándares para:
- Dimensiones y espaciado
- Sistema de colores (light/dark)
- Componentes base
- Tipografía
- Badges y etiquetas
- Tablas
- Inputs y formularios
- Responsividad
- Estados (loading, empty, error)
- Checklist de validación
- Prohibiciones

### 2. Template de Módulo
**Archivo**: `docs/TEMPLATE-MODULO-ESTANDAR.md`

Incluye ejemplos completos de:
- Estructura de carpetas
- Componente principal
- Hook personalizado
- Servicio
- Tipos TypeScript
- Página
- Checklist de validación
- Errores comunes

---

## 🧩 Componentes Estandarizados

**Ubicación**: `src/shared/components/layout/`

### ModuleContainer
Contenedor principal para todos los módulos.

```typescript
<ModuleContainer maxWidth="2xl">
  {children}
</ModuleContainer>
```

**Props**:
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' (default: 'full')
- `className`: string adicional

**Características**:
- Padding responsivo: `p-4 md:p-6 lg:p-8`
- Fondo degradado con dark mode
- Min height: `min-h-screen`

---

### ModuleHeader
Encabezado estandarizado con título, descripción, icono y acciones.

```typescript
<ModuleHeader
  title="Gestión de Proyectos"
  description="Administra todos los proyectos de construcción"
  icon={<Building2 size={32} />}
  actions={
    <Button variant="primary">
      Crear Proyecto
    </Button>
  }
/>
```

**Props**:
- `title`: string (required)
- `description`: string (optional)
- `icon`: ReactNode (optional)
- `actions`: ReactNode (optional)
- `className`: string (optional)

**Características**:
- Título responsivo: `text-2xl md:text-3xl`
- Layout flex responsive
- Dark mode completo

---

### Card
Tarjeta para secciones de contenido.

```typescript
<Card padding="md">
  {content}
</Card>
```

**Props**:
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string (optional)

**Características**:
- Bordes redondeados: `rounded-xl`
- Sombra sutil: `shadow-sm`
- Border con dark mode
- Background con dark mode

---

### Button
Botón estandarizado con variantes y estados.

```typescript
<Button
  variant="primary"
  size="md"
  icon={<Plus size={20} />}
  iconPosition="left"
  loading={isLoading}
  onClick={handleClick}
>
  Crear
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)
- `icon`: ReactNode (optional)
- `iconPosition`: 'left' | 'right' (default: 'left')
- `fullWidth`: boolean (default: false)
- Plus all HTMLButtonElement props

**Características**:
- Animaciones hover/active
- Spinner de loading
- Estados disabled
- Dark mode completo

---

### Badge
Etiqueta para estados y categorías.

```typescript
<Badge variant="success" size="md">
  Activo
</Badge>
```

**Props**:
- `variant`: 'create' | 'update' | 'delete' | 'info' | 'success' | 'warning' | 'danger' | 'neutral' (default: 'neutral')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string (optional)

**Variantes semánticas**:
- `create`: Verde (acciones de creación)
- `update`: Azul (acciones de actualización)
- `delete`: Rojo (acciones de eliminación)
- `success`: Verde (estados exitosos)
- `warning`: Amarillo (advertencias)
- `danger`: Rojo (errores/peligros)
- `neutral`: Gris (neutral)

---

### LoadingState
Estado de carga estandarizado.

```typescript
<LoadingState
  message="Cargando proyectos..."
  size="md"
/>
```

**Props**:
- `message`: string (default: 'Cargando...')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string (optional)

**Características**:
- Spinner animado
- Centrado vertical y horizontal
- Padding consistente

---

### EmptyState
Estado vacío estandarizado.

```typescript
<EmptyState
  icon={<Inbox size={48} />}
  title="No hay proyectos"
  description="Crea tu primer proyecto para comenzar"
  action={
    <Button variant="primary" onClick={onCreate}>
      Crear Proyecto
    </Button>
  }
/>
```

**Props**:
- `icon`: ReactNode (optional)
- `title`: string (required)
- `description`: string (optional)
- `action`: ReactNode (optional)
- `className`: string (optional)

---

### ErrorState
Estado de error estandarizado.

```typescript
<ErrorState
  title="Error al cargar"
  message="No se pudieron cargar los proyectos"
  onRetry={handleRetry}
  retryLabel="Reintentar"
/>
```

**Props**:
- `title`: string (default: 'Error')
- `message`: string (required)
- `onRetry`: () => void (optional)
- `retryLabel`: string (default: 'Reintentar')
- `className`: string (optional)

**Características**:
- Icono de error (AlertCircle)
- Botón de retry opcional
- Colores de error (red)

---

## 🎯 Guía de Uso Rápida

### 1. Crear Nuevo Módulo

```bash
# Copiar estructura
src/modules/[nombre-modulo]/
├── components/
│   └── [Nombre]View.tsx
├── hooks/
│   └── use[Nombre].ts
├── services/
│   └── [nombre].service.ts
├── types/
│   └── index.ts
```

### 2. Implementar Componente Principal

```typescript
'use client'

import {
  ModuleContainer,
  ModuleHeader,
  Card,
  Button,
  LoadingState,
  EmptyState,
  ErrorState,
} from '@/shared/components/layout'
import { use[Nombre] } from '../hooks'

export function [Nombre]View() {
  const { items, loading, error } = use[Nombre]()

  if (loading) return (
    <ModuleContainer>
      <LoadingState />
    </ModuleContainer>
  )

  if (error) return (
    <ModuleContainer>
      <ErrorState message={error} />
    </ModuleContainer>
  )

  return (
    <ModuleContainer maxWidth="2xl">
      <ModuleHeader
        title="Título"
        description="Descripción"
        icon={<Icon />}
        actions={<Button>Acción</Button>}
      />
      <Card>
        {/* Contenido */}
      </Card>
    </ModuleContainer>
  )
}
```

### 3. Implementar Hook

```typescript
'use client'

import { useState, useEffect } from 'react'
import { [nombre]Service } from '../services/[nombre].service'

export function use[Nombre]() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await [nombre]Service.obtener[Nombre]s()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { items, loading, error, recargar: cargarDatos }
}
```

### 4. Implementar Servicio

```typescript
import { supabase } from '@/lib/supabase/client'
import { auditService } from '@/services/audit.service'

class [Nombre]Service {
  private tableName = '[tabla]' // ✅ Verificar en DATABASE-SCHEMA-REFERENCE.md

  async obtener[Nombre]s() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')

    if (error) throw error
    return data
  }

  async crear[Nombre](datos) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(datos)
      .select()
      .single()

    if (error) throw error

    // Auditoría
    await auditService.auditarCreacion(this.tableName, data.id, data)

    return data
  }
}

export const [nombre]Service = new [Nombre]Service()
```

### 5. Crear Página

```typescript
import { RequireView } from '@/components/permissions/RequireView'
import { [Nombre]View } from '@/modules/[nombre]/components'

export default function [Nombre]Page() {
  return (
    <RequireView modulo="[nombre]">
      <[Nombre]View />
    </RequireView>
  )
}
```

---

## ✅ Checklist Rápido

Antes de considerar un módulo completo:

### Estructura
- [ ] Usa `ModuleContainer` como contenedor
- [ ] Usa `ModuleHeader` para encabezado
- [ ] Usa `Card` para secciones
- [ ] Usa `Button` para acciones
- [ ] Usa `Badge` para etiquetas
- [ ] Usa `LoadingState` / `EmptyState` / `ErrorState`

### Diseño
- [ ] Modo oscuro en TODOS los elementos
- [ ] Responsive (móvil, tablet, desktop)
- [ ] Padding consistente
- [ ] Bordes redondeados
- [ ] Transiciones suaves

### Lógica
- [ ] Hook separado con lógica
- [ ] Componente solo UI
- [ ] 'use client' donde corresponde

### Base de Datos
- [ ] Nombres verificados en `DATABASE-SCHEMA-REFERENCE.md`
- [ ] Auditoría implementada

### Permisos
- [ ] RequireView en página
- [ ] Permisos configurados

---

## 🚀 Aplicar a Módulo Existente

Para estandarizar un módulo ya existente:

1. **Instalar componentes**:
   ```typescript
   import {
     ModuleContainer,
     ModuleHeader,
     Card,
     Button,
     LoadingState,
     EmptyState,
     ErrorState,
   } from '@/shared/components/layout'
   ```

2. **Reemplazar container**:
   ```typescript
   // Antes
   <div className="min-h-screen bg-gradient-to-br from-slate-50...">

   // Después
   <ModuleContainer maxWidth="2xl">
   ```

3. **Reemplazar header**:
   ```typescript
   // Antes
   <div className="mb-8">
     <h1 className="text-3xl font-bold...">Título</h1>
   </div>

   // Después
   <ModuleHeader
     title="Título"
     description="Descripción"
     icon={<Icon />}
     actions={<Button>Acción</Button>}
   />
   ```

4. **Reemplazar cards**:
   ```typescript
   // Antes
   <div className="bg-white dark:bg-slate-800 rounded-xl p-6...">

   // Después
   <Card padding="md">
   ```

5. **Reemplazar botones**:
   ```typescript
   // Antes
   <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2...">

   // Después
   <Button variant="primary" size="md">
   ```

6. **Agregar estados**:
   ```typescript
   if (loading) return <LoadingState />
   if (error) return <ErrorState message={error} />
   if (items.length === 0) return <EmptyState title="No hay datos" />
   ```

---

## 📊 Beneficios del Sistema

### Consistencia
- ✅ Diseño uniforme en todos los módulos
- ✅ Mismo UX en toda la aplicación
- ✅ Fácil navegación para usuarios

### Mantenibilidad
- ✅ Cambios centralizados en componentes
- ✅ Código más limpio y legible
- ✅ Menos duplicación

### Desarrollo
- ✅ Template listo para copiar
- ✅ Componentes reutilizables
- ✅ Menos decisiones de diseño
- ✅ Desarrollo más rápido

### Calidad
- ✅ Dark mode garantizado
- ✅ Responsive garantizado
- ✅ Accesibilidad mejorada
- ✅ Performance optimizada

---

## 🔄 Próximos Pasos

1. **Aplicar a módulo Auditorías** (recién creado)
   - Refactorizar usando componentes estandarizados
   - Validar checklist completo
   - Documentar como ejemplo

2. **Refactorizar módulos existentes** (orden sugerido):
   - Proyectos (ya está bien estructurado, solo agregar componentes)
   - Viviendas
   - Clientes
   - Negociaciones
   - Abonos

3. **Crear script de validación**:
   - Verificar uso de componentes estandarizados
   - Validar dark mode
   - Validar responsive
   - Generar reporte de cumplimiento

4. **Documentar casos especiales**:
   - Módulos con tabs
   - Módulos con múltiples vistas
   - Módulos con formularios complejos

---

## 📖 Referencias

- **Guía completa**: `docs/GUIA-DISENO-MODULOS.md`
- **Template completo**: `docs/TEMPLATE-MODULO-ESTANDAR.md`
- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md`
- **Checklist desarrollo**: `docs/DESARROLLO-CHECKLIST.md`
- **Componentes**: `src/shared/components/layout/`

---

## 💡 Consejos

1. **Siempre consultar** el template antes de crear un módulo nuevo
2. **Verificar nombres** en `DATABASE-SCHEMA-REFERENCE.md` ANTES de escribir código
3. **Usar componentes estandarizados** - no reinventar la rueda
4. **Probar en modo oscuro** durante el desarrollo, no al final
5. **Probar responsive** en móvil, tablet y desktop
6. **Seguir el checklist** - no saltarse pasos
7. **Pedir ayuda** si algo no está claro en la documentación

---

**Fecha creación**: 2024-01-XX
**Última actualización**: 2024-01-XX
**Estado**: ✅ Implementado
