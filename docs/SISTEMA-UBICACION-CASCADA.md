# 📍 Sistema de Selección de Ubicación en Cascada (Departamento → Ciudad)

## 🎯 Objetivo

Implementar una selección inteligente de departamento y ciudad en formularios, donde:
1. **Departamento** es un select con todos los departamentos de Colombia
2. **Ciudad** se habilita SOLO cuando se selecciona un departamento
3. **Ciudad** muestra únicamente las ciudades del departamento seleccionado
4. Mejora UX y previene errores de datos inconsistentes

---

## 📐 Arquitectura (Separación de Responsabilidades)

```
src/
├── shared/
│   ├── data/
│   │   ├── colombia-locations.ts          ✅ DATOS estáticos (32 departamentos + ciudades)
│   │   └── index.ts                       ✅ Barrel export
│   └── hooks/
│       ├── useLocationSelector.ts         ✅ LÓGICA de cascada
│       └── index.ts                       ✅ Barrel export (actualizado)
└── modules/clientes/components/
    └── formulario-cliente-modern.tsx      ✅ UI presentacional
```

---

## 📦 Archivos Creados

### 1. `colombia-locations.ts` - Datos de Colombia

**Ubicación:** `src/shared/data/colombia-locations.ts`

**Contenido:**
- 32 departamentos de Colombia
- Ciudades principales por departamento (municipios)
- Helpers: `getDepartamentos()`, `getCiudadesPorDepartamento()`, `validarCiudadDepartamento()`

**Ejemplo de uso:**
```typescript
import { getDepartamentos, getCiudadesPorDepartamento } from '@/shared/data/colombia-locations'

const departamentos = getDepartamentos() // ['Amazonas', 'Antioquia', ...]
const ciudades = getCiudadesPorDepartamento('Valle del Cauca') // ['Cali', 'Palmira', 'Buenaventura', ...]
```

**Ventajas:**
- ✅ Datos estáticos (no requiere BD)
- ✅ Actualizable fácilmente
- ✅ Type-safe con TypeScript
- ✅ Extensible (puede agregar códigos DANE)

---

### 2. `useLocationSelector.ts` - Hook de Lógica

**Ubicación:** `src/shared/hooks/useLocationSelector.ts`

**Responsabilidades:**
- Manejar estado de departamento/ciudad seleccionados
- Cargar ciudades cuando cambia departamento
- Resetear ciudad si no pertenece al nuevo departamento
- Sincronizar con valores externos (modo edición)
- Deshabilitar ciudad si no hay departamento

**API del Hook:**
```typescript
const {
  // Datos
  departamentos,              // string[] - Lista de todos los departamentos
  departamentoSeleccionado,   // string - Departamento actual
  ciudadesDisponibles,        // string[] - Ciudades del depto seleccionado
  ciudadSeleccionada,         // string - Ciudad actual

  // Handlers
  handleDepartamentoChange,   // (dept: string) => void
  handleCiudadChange,         // (ciudad: string) => void
  resetSeleccion,             // () => void

  // Estado
  ciudadDeshabilitada,        // boolean - Si ciudad debe estar disabled
} = useLocationSelector({
  departamentoInicial: formData.departamento,
  ciudadInicial: formData.ciudad,
  onDepartamentoChange: (dept) => onChange('departamento', dept),
  onCiudadChange: (ciudad) => onChange('ciudad', ciudad),
})
```

**Flujo Interno:**
1. Usuario selecciona departamento → `handleDepartamentoChange()`
2. useEffect detecta cambio → carga ciudades con `getCiudadesPorDepartamento()`
3. Si ciudad actual no pertenece al nuevo departamento → resetea ciudad
4. Notifica al padre vía callbacks `onDepartamentoChange`/`onCiudadChange`

---

## 🎨 Implementación en Formulario

### Antes (inputs libres):
```tsx
<ModernInput
  label='Ciudad'
  value={formData.ciudad}
  onChange={(e) => onChange('ciudad', e.target.value)}
  placeholder='Ej: Cali'
/>

<ModernInput
  label='Departamento'
  value={formData.departamento}
  onChange={(e) => onChange('departamento', e.target.value)}
  placeholder='Ej: Valle del Cauca'
/>
```

**Problemas:**
- ❌ Usuario puede escribir cualquier cosa
- ❌ Datos inconsistentes (ciudad de un depto, nombre de otro)
- ❌ Dificulta búsquedas y filtros
- ❌ Errores ortográficos

---

### Después (selects en cascada):
```tsx
// 1. Importar hook
import { useLocationSelector } from '@/shared/hooks/useLocationSelector'

// 2. Usar hook en componente
const {
  departamentos,
  departamentoSeleccionado,
  ciudadesDisponibles,
  ciudadSeleccionada,
  handleDepartamentoChange,
  handleCiudadChange,
  ciudadDeshabilitada,
} = useLocationSelector({
  departamentoInicial: formData.departamento || '',
  ciudadInicial: formData.ciudad || '',
  onDepartamentoChange: (departamento) => onChange('departamento', departamento),
  onCiudadChange: (ciudad) => onChange('ciudad', ciudad),
})

// 3. Render con selects
<ModernSelect
  icon={Home}
  label='Departamento'
  value={departamentoSeleccionado}
  onChange={(e) => handleDepartamentoChange(e.target.value)}
  required
>
  <option value=''>Seleccione un departamento</option>
  {departamentos.map((dept) => (
    <option key={dept} value={dept}>{dept}</option>
  ))}
</ModernSelect>

<ModernSelect
  icon={Building2}
  label='Ciudad'
  value={ciudadSeleccionada}
  onChange={(e) => handleCiudadChange(e.target.value)}
  disabled={ciudadDeshabilitada}  // ← Deshabilitado hasta elegir depto
  required
>
  <option value=''>
    {!departamentoSeleccionado
      ? 'Primero selecciona un departamento'
      : 'Seleccione una ciudad'}
  </option>
  {ciudadesDisponibles.map((ciudad) => (
    <option key={ciudad} value={ciudad}>{ciudad}</option>
  ))}
</ModernSelect>
```

**Ventajas:**
- ✅ Datos consistentes (ciudad siempre pertenece al depto)
- ✅ UX intuitiva (cascada)
- ✅ Sin errores ortográficos
- ✅ Filtros y búsquedas precisas
- ✅ Escalable a otros formularios

---

## 🚀 Uso en Otros Módulos

El sistema es **reutilizable** en cualquier formulario que necesite ubicación:

### Módulo de Proyectos:
```typescript
import { useLocationSelector } from '@/shared/hooks'

const ProyectoForm = () => {
  const {
    departamentos,
    departamentoSeleccionado,
    ciudadesDisponibles,
    handleDepartamentoChange,
    handleCiudadChange,
  } = useLocationSelector({
    onDepartamentoChange: (dept) => setValue('departamento', dept),
    onCiudadChange: (ciudad) => setValue('ciudad', ciudad),
  })

  return (
    <select onChange={(e) => handleDepartamentoChange(e.target.value)}>
      {departamentos.map((d) => <option key={d}>{d}</option>)}
    </select>
  )
}
```

### Módulo de Viviendas:
```typescript
// Misma implementación, solo cambiar los callbacks
useLocationSelector({
  departamentoInicial: vivienda.departamento,
  ciudadInicial: vivienda.ciudad,
  onDepartamentoChange: (dept) => updateVivienda({ departamento: dept }),
  onCiudadChange: (ciudad) => updateVivienda({ ciudad }),
})
```

---

## 🧪 Casos de Uso

### 1. Crear Cliente Nuevo
```
1. Usuario abre modal de crear cliente
2. Departamento/Ciudad están vacíos
3. Usuario selecciona "Valle del Cauca"
4. Ciudad se habilita, muestra: Cali, Palmira, Buenaventura...
5. Usuario selecciona "Cali"
6. Guarda cliente con datos consistentes
```

### 2. Editar Cliente Existente
```
1. Cliente tiene: departamento="Valle del Cauca", ciudad="Cali"
2. Hook carga datos iniciales correctamente
3. Usuario cambia departamento a "Antioquia"
4. Ciudad se resetea automáticamente (Cali no está en Antioquia)
5. Usuario selecciona "Medellín"
6. Actualiza cliente con nuevos datos consistentes
```

### 3. Validación Automática
```
// El hook previene estados inconsistentes:
// ❌ departamento="Valle del Cauca" + ciudad="Medellín" → IMPOSIBLE
// ✅ Ciudad se resetea automáticamente al cambiar departamento
```

---

## 📊 Datos Incluidos

### Departamentos (32):
- Amazonas, Antioquia, Arauca, Atlántico, Bogotá D.C., Bolívar, Boyacá, Caldas, Caquetá, Casanare, Cauca, Cesar, Chocó, Córdoba, Cundinamarca, Guainía, Guaviare, Huila, La Guajira, Magdalena, Meta, Nariño, Norte de Santander, Putumayo, Quindío, Risaralda, San Andrés y Providencia, Santander, Sucre, Tolima, Valle del Cauca, Vaupés, Vichada

### Ciudades Principales por Departamento:
- **Valle del Cauca:** Cali, Palmira, Buenaventura, Tuluá, Cartago, Buga, Jamundí, Yumbo, Candelaria, Florida, Pradera, Sevilla, Zarzal, Roldanillo, La Unión
- **Antioquia:** Medellín, Bello, Itagüí, Envigado, Apartadó, Turbo, Rionegro, Caucasia, Sabaneta, La Estrella, Caldas, Copacabana, Girardota, Barbosa, Carmen de Viboral, etc.
- *... (ver archivo completo)*

---

## 🔧 Mantenimiento

### Agregar Ciudad a un Departamento:
```typescript
// colombia-locations.ts
{
  nombre: 'Valle del Cauca',
  ciudades: [
    'Cali',
    'Palmira',
    'Nueva Ciudad', // ← Agregar aquí
    // ...
  ],
}
```

### Agregar Nuevo Departamento:
```typescript
export const DEPARTAMENTOS_COLOMBIA: Departamento[] = [
  // ...
  {
    nombre: 'Nuevo Departamento',
    ciudades: ['Ciudad 1', 'Ciudad 2'],
  },
]
```

---

## ✅ Beneficios del Sistema

### UX:
- ✅ Flujo intuitivo (cascada natural)
- ✅ Sin errores de escritura
- ✅ Feedback visual claro (disabled states)
- ✅ Validación automática de consistencia

### Data Quality:
- ✅ Datos normalizados
- ✅ Sin inconsistencias
- ✅ Filtros y búsquedas precisas
- ✅ Reportes confiables

### Desarrollo:
- ✅ Código reutilizable
- ✅ Separación de responsabilidades
- ✅ Type-safe con TypeScript
- ✅ Fácil de mantener y extender

### Performance:
- ✅ Datos estáticos (sin llamadas BD)
- ✅ useMemo en helpers
- ✅ Re-renders optimizados

---

## 📚 Referencias

- **Hook**: `src/shared/hooks/useLocationSelector.ts`
- **Datos**: `src/shared/data/colombia-locations.ts`
- **Implementación**: `src/modules/clientes/components/formulario-cliente-modern.tsx` (líneas ~505-545)
- **Patrón**: Separation of Concerns (Data → Logic → UI)

---

## 🎯 Checklist de Implementación

- [x] Crear archivo de datos de Colombia
- [x] Crear hook de lógica en cascada
- [x] Actualizar barrel exports de shared
- [x] Modificar formulario de clientes (orden + selects)
- [x] Verificar TypeScript sin errores
- [x] Documentar sistema completo

**Estado:** ✅ **IMPLEMENTADO Y LISTO PARA USAR**
