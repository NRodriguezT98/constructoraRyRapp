# ✅ REFACTORIZACIÓN: Separación de Responsabilidades en Timeline

## 📊 Análisis del Problema

### ❌ **ANTES: timeline-proceso.tsx (582 líneas)**

**Violaciones de separación de responsabilidades:**

1. **Lógica de negocio en el componente:**
   - `handleAdjuntarDocumento`: 52 líneas con lógica compleja
   - `handleRecargarPlantilla`: 73 líneas
   - Llamadas directas a servicios (`subirDocumento`, `recargarPlantilla`)
   - Manejo de errores mezclado con UI

2. **Queries directas a Supabase:**
   ```typescript
   // ❌ Query en componente (líneas 136-159)
   const supabase = createBrowserClient(...)
   const { data } = await supabase.from('negociaciones')...
   ```

3. **Estado complejo disperso:**
   - 7 estados diferentes para modales y carga
   - Lógica de coordinación entre estados
   - Difícil de mantener y testear

4. **Responsabilidades mezcladas:**
   - UI + Lógica de negocio + Servicios + Manejo de errores
   - Componente de 582 líneas imposible de mantener
   - Testing complicado

---

## ✅ **DESPUÉS: Separación en 3 capas**

### **Capa 1: Hook de Negocio** (`useProcesoNegociacion.ts`)
**Responsabilidad:** Lógica de procesos y estado de pasos
```typescript
// ✅ Maneja SOLO la lógica de procesos
- completarPaso()
- iniciarPaso()
- omitirPaso()
- agregarDocumento()
- eliminarDocumento()
- adjuntarConAutoInicio()
```

### **Capa 2: Hook de UI** (`useTimelineProceso.ts`) **🆕**
**Responsabilidad:** Coordinación de UI, modales y documentos
```typescript
// ✅ Maneja SOLO lógica de presentación
- Estados de modales
- Subida de documentos
- Confirmaciones al usuario
- Coordinación entre modales y procesos
```

### **Capa 3: Componente Presentacional** (`timeline-proceso.tsx`)
**Responsabilidad:** SOLO renderizado
```typescript
// ✅ SOLO JSX y props
- Renderiza UI
- Pasa callbacks
- NO tiene lógica de negocio
```

---

## 📈 Beneficios Concretos

### 1. **Componente Simplificado**
**ANTES:** 582 líneas con todo mezclado
**AHORA:** ~300 líneas de puro JSX

### 2. **Testing Mejorado**
```typescript
// ✅ Ahora podemos testear la lógica sin el componente
import { useTimelineProceso } from '@/hooks'

test('debe subir documento correctamente', () => {
  const { handleAdjuntarDocumento } = useTimelineProceso(...)
  // Test isolated logic
})
```

### 3. **Reutilización**
```typescript
// ✅ El hook puede usarse en otros componentes
import { useTimelineProceso } from '@/hooks'

function TimelineCompacto() {
  const { pasos, handleCompletar } = useTimelineProceso(...)
  // Diferente UI, misma lógica
}
```

### 4. **Mantenibilidad**
- Lógica centralizada en un solo archivo
- Cambios en lógica no afectan UI
- Más fácil de encontrar y arreglar bugs

### 5. **Código Limpio**
- Cada archivo tiene una responsabilidad clara
- Nombres descriptivos
- Estructura predecible

---

## 🔄 Próximos Pasos para Refactorizar el Componente

### Paso 1: Importar el nuevo hook
```typescript
// timeline-proceso.tsx
import { useTimelineProceso } from '../hooks'

export function TimelineProceso({ negociacionId }: Props) {
  const timeline = useTimelineProceso({ negociacionId })

  // Ya NO necesitas:
  // ❌ const [pasoExpandido, setPasoExpandido] = useState(...)
  // ❌ const handleAdjuntarDocumento = async (...) => { ... }
  // ❌ useEffect para obtener fechas

  // TODO está en el hook:
  // ✅ timeline.pasoExpandido
  // ✅ timeline.handleAdjuntarDocumento
  // ✅ timeline.fechaNegociacion
}
```

### Paso 2: Eliminar lógica del componente
- Borrar todos los `useState` de UI
- Borrar todos los `useEffect` con lógica
- Borrar todos los handlers (`handleAdjuntar`, `handleCompletar`, etc.)
- Borrar query directa a Supabase

### Paso 3: Usar destructuring del hook
```typescript
const {
  // Estados
  pasos,
  progreso,
  loading,
  pasoExpandido,
  subiendoDoc,

  // Modales
  modalFechaAbierto,
  pasoACompletar,

  // Handlers
  togglePaso,
  handleAbrirModalCompletar,
  handleAdjuntarDocumento,
  ...
} = useTimelineProceso({ negociacionId })
```

### Paso 4: Simplificar JSX
```typescript
// ✅ ANTES: 52 líneas de lógica + JSX
<button onClick={handleAdjuntarDocumento}>...</button>

// ✅ AHORA: Solo callback
<button onClick={timeline.handleAdjuntarDocumento}>...</button>
```

---

## 📚 Estructura Final

```
src/modules/admin/procesos/
├── hooks/
│   ├── useProcesoNegociacion.ts    # Lógica de procesos ✅
│   ├── useTimelineProceso.ts       # Lógica de UI 🆕 ✅
│   └── index.ts                    # Barrel export ✅
├── components/
│   └── timeline-proceso.tsx        # Solo presentación (próximo paso)
└── services/
    ├── procesos.service.ts         # API calls ✅
    └── documentos-proceso.service.ts  # Storage ✅
```

---

## ✅ Checklist de Refactorización Completa

- [x] Crear `useTimelineProceso.ts`
- [x] Exportar en barrel `hooks/index.ts`
- [x] Verificar sin errores TypeScript
- [ ] **PRÓXIMO:** Refactorizar `timeline-proceso.tsx` para usar el hook
- [ ] **PRÓXIMO:** Eliminar lógica del componente
- [ ] **PRÓXIMO:** Testing del nuevo hook

---

## 💡 Lecciones Aprendidas

1. **Hooks personalizados son perfectos para:**
   - Coordinar múltiples hooks nativos
   - Manejo de estado complejo de UI
   - Lógica que se repite en componentes

2. **Separar en capas ayuda a:**
   - Testear cada capa independientemente
   - Reutilizar lógica en diferentes UIs
   - Mantener código limpio y organizado

3. **Un componente debe:**
   - Ser < 200 líneas idealmente
   - SOLO renderizar JSX
   - Delegar toda la lógica a hooks

---

**Creado:** 1 de noviembre de 2025
**Estado:** Hook creado ✅ | Componente pendiente de refactorizar
