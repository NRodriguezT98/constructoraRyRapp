# Modal Crear Negociación - Refactorizado ✨

## 📊 Resumen de la Refactorización

**Antes:**
- ❌ 1,035 líneas en un solo archivo monolítico
- ❌ Lógica mezclada con UI
- ❌ 15+ useState en componente
- ❌ Funciones de carga de datos en UI
- ❌ Sin separación de responsabilidades

**Después:**
- ✅ 202 líneas en index.tsx principal
- ✅ Lógica separada en 3 hooks especializados
- ✅ 3 componentes de pasos independientes
- ✅ Estilos centralizados
- ✅ Tipos en archivo separado
- ✅ **Mejora: 80.5% reducción en archivo principal**

---

## 📁 Estructura del Módulo

```
modal-crear-negociacion/
├── index.tsx                      # 202 líneas - UI principal
├── types/
│   └── index.ts                   # Tipos TypeScript
├── styles.ts                      # Estilos centralizados
├── hooks/
│   ├── index.ts                   # Barrel export
│   ├── useProyectosViviendas.ts   # Lógica de proyectos/viviendas
│   ├── useFuentesPago.ts          # Lógica de fuentes de pago
│   └── useModalNegociacion.ts     # Hook orquestador principal
├── components/
│   ├── index.ts                   # Barrel export
│   ├── paso-1-info-basica.tsx     # Paso 1: Info Cliente/Vivienda
│   ├── paso-2-fuentes-pago.tsx    # Paso 2: Configurar Financiamiento
│   └── paso-3-revision.tsx        # Paso 3: Revisar y Confirmar
└── README.md                      # Este archivo
```

**Total:** 11 archivos organizados vs 1 archivo monolítico

---

## 🔧 Hooks Especializados

### 1. `useProyectosViviendas`
**Responsabilidad:** Cargar y gestionar proyectos y viviendas

```typescript
const {
  proyectos,
  viviendas,
  proyectoSeleccionado,
  viviendaId,
  valorNegociado,
  cargandoProyectos,
  cargandoViviendas,
  cargarProyectos,
  cargarViviendas,
  setProyectoSeleccionado,
  setViviendaId,
  setValorNegociado,
  resetear
} = useProyectosViviendas({ viviendaIdInicial, valorViviendaInicial })
```

**Características:**
- Auto-carga de viviendas cuando cambia proyecto
- Auto-llenado de valor cuando se selecciona vivienda
- JOIN con tabla manzanas para mostrar "Manzana A - Casa 1"
- Estado de carga independiente

---

### 2. `useFuentesPago`
**Responsabilidad:** Gestionar fuentes de pago y validaciones

```typescript
const {
  fuentes,
  fuentesActivas,
  totalFuentes,
  diferencia,
  sumaCierra,
  paso2Valido,
  handleFuenteEnabledChange,
  handleFuenteConfigChange,
  obtenerFuentesParaCrear,
  resetear
} = useFuentesPago({ valorTotal })
```

**Características:**
- Validación en tiempo real (suma = valor total)
- Cuota Inicial siempre habilitada
- Conversión automática a `CrearFuentePagoDTO`
- Cálculo de diferencia y porcentaje

---

### 3. `useModalNegociacion`
**Responsabilidad:** Orquestar todo el modal (hook principal)

```typescript
const modal = useModalNegociacion({
  isOpen,
  clienteId,
  viviendaId,
  valorVivienda,
  onSuccess,
  onClose
})
```

**Características:**
- Integra `useProyectosViviendas` + `useFuentesPago`
- Gestiona navegación entre pasos (stepper)
- Validación por paso (paso1Valido, paso2Valido)
- Submit transaccional con manejo de errores
- Reseteo completo al cerrar

---

## 🎨 Componentes Separados

### `Paso1InfoBasica`
- Selección de proyecto/vivienda
- Valor auto-llenado desde vivienda
- Descuento opcional
- Cálculo de valor total en tiempo real
- Notas opcionales

### `Paso2FuentesPago`
- Card por cada tipo de fuente
- Validación visual (verde/rojo)
- Diferencia en tiempo real
- Mensaje de error descriptivo

### `Paso3Revision`
- Resumen de información básica
- Lista de fuentes configuradas con porcentajes
- Advertencia antes de confirmar

---

## 🎨 Estilos Centralizados

Todas las clases de Tailwind están en `styles.ts`:

```typescript
import { modalStyles, animations } from './styles'

// En componentes:
<div className={modalStyles.modal}>
<button className={modalStyles.button.primary}>
<div className={modalStyles.card.success}>
```

**Ventajas:**
- No más strings de 100+ caracteres inline
- Reutilización de estilos
- Fácil actualización de diseño
- Consistencia visual

---

## 📝 Tipos TypeScript

Todos los tipos en `types/index.ts`:

```typescript
export interface ModalCrearNegociacionProps { ... }
export interface FuentePagoConfig { ... }
export interface FuentePagoConfiguracion { ... }
export interface ProyectoBasico { ... }
export interface ViviendaDetalle { ... }
export interface FormDataNegociacion { ... }
export type StepNumber = 1 | 2 | 3
```

---

## ✅ Beneficios de la Refactorización

### 📦 Mantenibilidad
- ✅ Cada archivo tiene una responsabilidad clara
- ✅ Fácil ubicar y modificar lógica específica
- ✅ Tests unitarios por hook/componente

### 🔍 Legibilidad
- ✅ Componente principal de 202 líneas vs 1,035
- ✅ Nombres descriptivos de archivos
- ✅ Separación UI vs lógica clara

### 🚀 Reusabilidad
- ✅ Hooks pueden usarse en otros modales
- ✅ Componentes de pasos reutilizables
- ✅ Estilos compartidos

### 🧪 Testabilidad
- ✅ Hooks independientes → unit tests
- ✅ Componentes puros → snapshot tests
- ✅ Lógica de negocio aislada

### 🎯 Escalabilidad
- ✅ Agregar nuevos pasos: crear componente en `/components`
- ✅ Modificar validaciones: editar hook específico
- ✅ Cambiar estilos: actualizar `styles.ts`

---

## 🔄 Flujo de Datos

```
index.tsx (UI)
    ↓
useModalNegociacion (Orquestador)
    ↓
    ├─→ useProyectosViviendas (Proyectos/Viviendas)
    │       ↓
    │   proyectosService.obtenerProyectos()
    │   supabase.from('viviendas').select(...)
    │
    └─→ useFuentesPago (Fuentes)
            ↓
        validarSumaTotal()
        obtenerFuentesParaCrear()
            ↓
        useCrearNegociacion (API)
            ↓
        negociacionesService.crearNegociacionConFuentes()
```

---

## 🎯 Uso

```tsx
import { ModalCrearNegociacion } from '@/modules/clientes/components/modals'

<ModalCrearNegociacion
  isOpen={isOpen}
  onClose={onClose}
  clienteId="uuid"
  clienteNombre="Juan Pérez"
  viviendaId="uuid" // Opcional
  valorVivienda={150000000} // Opcional
  onSuccess={(negociacionId) => {
    console.log('Negociación creada:', negociacionId)
  }}
/>
```

---

## 📚 Referencias

- **Patrón:** Custom Hooks + Componentes Presentacionales
- **Inspiración:** Arquitectura de `src/modules/proyectos`
- **Guía:** `docs/GUIA-ESTILOS.md`
- **Checklist:** `docs/DESARROLLO-CHECKLIST.md`

---

## 🎉 Resultado Final

De **1 archivo monolítico de 1,035 líneas** a **11 archivos organizados con separación perfecta de responsabilidades.**

**¡Código limpio, mantenible y escalable!** ✨
