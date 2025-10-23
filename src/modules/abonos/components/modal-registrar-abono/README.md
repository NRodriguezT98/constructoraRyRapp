# Modal Registrar Abono - Arquitectura Limpia

## 📁 Estructura Modular

```
modal-registrar-abono/
├── index.ts                        # Barrel export
├── useModalRegistrarAbono.ts       # ✅ Business Logic Hook
├── styles.ts                       # ✅ Centralized Styles (Dark Mode + Mobile)
├── ModalHeader.tsx                 # ✅ Premium Header Component
├── CampoMonto.tsx                  # ✅ Amount Field Component (Dual Mode)
└── MetodosPagoSelector.tsx         # ✅ Payment Methods Selector
```

---

## 🎯 Principios Aplicados

### ✅ Separación de Responsabilidades

- **Hook (`useModalRegistrarAbono.ts`)** → TODA la lógica de negocio
- **Componentes (`.tsx`)** → UI presentacional PURA
- **Estilos (`styles.ts`)** → Clases centralizadas con dark mode

### ✅ Dark Mode Completo

- **Todos** los elementos tienen variante `dark:`
- Gradientes, fondos, bordes, textos con soporte oscuro
- Pattern: `bg-white dark:bg-gray-800`, `text-gray-900 dark:text-white`

### ✅ Mobile First

- Tamaños base para móvil
- Breakpoint `sm:` para desktop
- Ejemplo: `px-3 sm:px-4`, `text-base sm:text-lg`

---

## 🧩 Componentes

### 1. **useModalRegistrarAbono** (Hook de Lógica)

**Responsabilidades:**
- Gestión de estado del formulario
- Validación según tipo de fuente de pago
- Detección automática de "desembolso completo"
- Comunicación con API
- Formateo de moneda

**Retorna:**
```typescript
{
  // State
  formData, errors, loading, metodoSeleccionado,
  esDesembolsoCompleto, montoAutomatico, saldoPendiente, montoIngresado,

  // Handlers
  handleSubmit, updateField, selectMetodo,

  // Utils
  formatCurrency
}
```

**Lógica Clave:**
- **Cuota Inicial** → Input manual con validación contra saldo
- **Crédito/Subsidio** → Monto automático (valor completo aprobado)

---

### 2. **styles.ts** (Estilos Centralizados)

**Exports:**
- `modalStyles`: Objeto con secciones (header, form, metodos, footer)
- `colorSchemes`: Gradientes por tipo de fuente de pago
- `metodoPagoConfig`: Configuración visual de métodos de pago

**Features:**
- ✅ Dark mode en TODOS los elementos
- ✅ Responsive con breakpoints `sm:`
- ✅ Clases reutilizables
- ✅ Sin magic strings en componentes

---

### 3. **ModalHeader** (Header Premium)

**Props:**
```typescript
{
  fuente: FuentePagoConAbonos
  esDesembolso: boolean
  montoAprobado: number
  saldoPendiente: number
  formatCurrency: (value: number) => string
}
```

**Features:**
- Gradiente dinámico según tipo de fuente
- Pattern background + efectos de luz
- Texto dinámico: **"Valor Total Pactado"** (Cuota Inicial) vs **"Monto Aprobado"** (Otros)
- Info card con montos
- Animaciones con Framer Motion

---

### 4. **CampoMonto** (Campo de Monto Dual)

**Props:**
```typescript
{
  esDesembolso: boolean
  fuente: FuentePagoConAbonos
  monto: string
  montoAutomatico: number | null
  saldoPendiente: number
  montoIngresado: number
  error?: string
  onChange: (value: string) => void
  formatCurrency: (value: number) => string
}
```

**Modos:**

1. **Desembolso Completo** (Crédito/Subsidio)
   - Card con monto bloqueado
   - Icono TrendingUp
   - Texto: "Monto del Desembolso"

2. **Manual** (Cuota Inicial)
   - Input numérico con prefijo $
   - Validación en tiempo real
   - Preview de nuevo saldo
   - Mensaje de error animado

---

### 5. **MetodosPagoSelector** (Selector de Métodos)

**Props:**
```typescript
{
  metodoSeleccionado: string
  onSelect: (metodo: string) => void
}
```

**Métodos:**
- ✅ **Efectivo** (Banknote, verde)
- ✅ **Transferencia** (CreditCard, azul)
- ✅ **Cheque** (FileText, morado)

**Features:**
- Grid de 3 columnas
- Animación stagger de entrada
- Hover scale + tap effect
- Checkmark cuando seleccionado
- Gradiente en método activo

---

## 🚀 Uso del Modal

```tsx
import { ModalRegistrarAbono } from '@/modules/abonos/components/modal-registrar-abono'

<ModalRegistrarAbono
  open={open}
  onClose={() => setOpen(false)}
  negociacionId="uuid"
  fuentesPago={fuentesPago}
  fuenteInicial={fuenteSeleccionada} // Opcional: pre-seleccionar fuente
  onSuccess={() => {
    // Callback después de registrar abono
    refreshData()
    toast.success('Abono registrado')
  }}
/>
```

---

## 🎨 Color Schemes por Tipo

```typescript
'Cuota Inicial': {
  gradient: 'from-blue-500 to-cyan-500',
  text: 'text-blue-600 dark:text-blue-400',
  bg: 'bg-blue-50 dark:bg-blue-900/20',
  border: 'border-blue-200 dark:border-blue-800'
}

'Crédito Hipotecario': {
  gradient: 'from-purple-500 to-pink-500',
  // ...
}

'Subsidio Mi Casa Ya': {
  gradient: 'from-green-500 to-emerald-500',
  // ...
}

'Subsidio Caja Compensación': {
  gradient: 'from-orange-500 to-amber-500',
  // ...
}
```

---

## ✅ Checklist de Calidad

- [x] Lógica separada en hook
- [x] Componentes < 150 líneas
- [x] Estilos centralizados
- [x] Dark mode completo
- [x] Mobile responsive
- [x] Animaciones con Framer Motion
- [x] Validación según tipo
- [x] Terminología correcta ("Valor Total Pactado")
- [x] Scroll configurado (header/footer fijos)
- [x] TypeScript estricto
- [x] Barrel exports

---

## 🐛 Troubleshooting

### Scroll no funciona
- Verificar clase `max-h-[60vh] sm:max-h-[70vh] overflow-y-auto` en container del form
- DialogContent debe tener `overflow-hidden`

### Dark mode incompleto
- Revisar que TODOS los elementos en `styles.ts` tengan `dark:`
- Verificar imports de `colorSchemes` en componentes

### Mobile desproporcionado
- Confirmar uso de tamaños base pequeños (`text-base`, `px-3`, `py-2`)
- Breakpoint `sm:` para tamaños desktop

---

## 📚 Referencias

- **Patrón de arquitectura**: `src/modules/proyectos/` (ejemplo completo)
- **Checklist desarrollo**: `docs/DESARROLLO-CHECKLIST.md`
- **Guía de estilos**: `docs/GUIA-ESTILOS.md`
