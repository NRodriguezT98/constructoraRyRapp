# Spec: RequisitoForm — Compact Inline Design

**Date**: 2026-03-13
**Status**: ✅ APPROVED — ready for implementation
**File to change**: `src/modules/requisitos-fuentes/components/RequisitoForm.tsx`

---

## Problem

The current form is ~600px tall with several usability issues:

| Issue | Details |
|---|---|
| **Too tall** | 2 large radio cards + always-visible fuentes grid inflate height |
| **Filled by inertia** | `tipo_documento_sugerido` and `orden` are filled "just because the field exists" |
| **Critical field hidden** | `tipo_documento_sugerido` directly drives document matching — but admin treats it as optional |
| **`orden` redundant** | D&D is the intended mechanism. Admin doesn't need a number input |
| **`paso_identificador` typed manually** | Error-prone; logic can derive it from `titulo` |
| **`instrucciones` / `categoria_documento`** | Rarely used — don't need to occupy permanent vertical space |

---

## Solution

Compact inline form (~320px tall) with:
- 5 always-visible fields
- Auto-generated identifier
- Hidden `tipo_documento_sugerido` (auto-saved = `titulo`)
- Accordion for rarely-used fields
- Conditional fuentes panel (COMPARTIDO only)

---

## Field Changes

| Campo actual | Nuevo comportamiento |
|---|---|
| Alcance (2 radio cards ~120px each) | **Pill toggle**: `[⚡ Específico] [↔ Compartido]` — 1 row |
| Fuentes Aplicables (always visible) | **Conditional**: only shown when alcance = `COMPARTIDO_CLIENTE`. Compact `p-1.5` checkboxes in 2-col grid. Enter/exit animated |
| `paso_identificador` (manual text input) | **Auto-generated** from `titulo` on create (snake_case, no accents). **Readonly** on edit. Never typed manually |
| `tipo_documento_sugerido` (text input) | **Hidden from form**. Auto-saved as `= formData.titulo` in `handleSubmit` |
| `instrucciones` (textarea, always visible) | **Moved to accordion** "Opciones avanzadas ▾", closed by default |
| `orden` (number input) | **Removed from form**. D&D is the only ordering mechanism. Column and DTO field unchanged (sent as `ordenSiguiente` prop) |
| `categoria_documento` (select, always visible) | **Moved to accordion** "Opciones avanzadas ▾" alongside `instrucciones` |
| `titulo` | Unchanged — triggers auto-generation of `paso_identificador` |
| `descripcion` | Unchanged — stays as the main textarea |
| `nivel_validacion` | Unchanged |

---

## Layout Wireframe

```
┌─────────────────────────────────────────────┐
│ ✏️ Editar Requisito                          │
├─────────────────────────────────────────────┤
│ Alcance:  [⚡ Específico] [↔ Compartido]    │
│                                             │
│ ┌ Fuentes (AnimatePresence) ──────────────┐ │  ← solo si COMPARTIDO
│ │ ☑ Crédito Hip.  ☑ Mi Casa Ya           │ │
│ │ ☐ Cuota Inicial ☑ Caja Comp.           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Título *                                    │
│ [Boleta de Registro                      ]  │
│ ↳ ID: boleta_registro (auto)               │
│                                             │
│ Descripción                                 │
│ [Documento expedido por...              ]   │
│                                             │
│ Nivel de Validación *                       │
│ [Documento Obligatorio ▾              ]     │
│                                             │
│ ▾ Opciones avanzadas                        │
│   (accordion, closed by default)            │
│   [Instrucciones textarea]                  │
│   [Categoría select]                        │
├─────────────────────────────────────────────┤
│              [Cancelar]  [💾 Guardar]       │
└─────────────────────────────────────────────┘
```

**Heights:**
- ESPECÍFICO (no fuentes panel): ~320px
- COMPARTIDO (with fuentes panel): ~400px
- Current: ~600px

---

## Auto-Generation Logic

### `paso_identificador` from `titulo` (create mode only)

```typescript
const autoIdentificador = (titulo: string) =>
  titulo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
```

Trigger: `onChange` of `titulo` input, only when `!modoEdicion`.

In edit mode: `paso_identificador` is rendered as a readonly info row (not an input).

### `tipo_documento_sugerido` auto-save

In `handleSubmit`, before calling `onGuardar`:

```typescript
const dataToSave: CrearRequisitoDTO = {
  ...formData,
  tipo_documento_sugerido: formData.titulo, // ← always synced to titulo
} as CrearRequisitoDTO
onGuardar(dataToSave)
```

---

## Pill Toggle Styles

```
Selected:   bg-blue-600 text-white border-blue-600 font-semibold
Unselected: bg-transparent text-gray-600 dark:text-gray-400 border-gray-300
Container:  flex gap-0 rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-900/50 w-fit
```

---

## Accordion State

```typescript
const [opcAvanzadasOpen, setOpcAvanzadasOpen] = useState(false)
```

Animation: `framer-motion` `AnimatePresence` + `motion.div` with `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: 'auto', opacity: 1 }}`.

---

## Fuentes Panel Animation

```tsx
<AnimatePresence>
  {formData.alcance === 'COMPARTIDO_CLIENTE' && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      {/* checkboxes */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Files to Change

| File | Change |
|---|---|
| `src/modules/requisitos-fuentes/components/RequisitoForm.tsx` | Full rewrite of JSX, add accordion state; auto-gen logic in onChange |

**No changes needed to:**
- `types/index.ts` — `orden` stays optional in DTO
- `useRequisitos.ts` — unchanged mutations
- `requisitos.service.ts` — unchanged
- Any page/parent — props interface unchanged

---

## Props Interface (unchanged)

```typescript
interface RequisitoFormProps {
  tipoFuente: string
  ordenSiguiente: number
  requisitoEditar?: RequisitoFuenteConfig
  onGuardar: (datos: CrearRequisitoDTO) => void
  onCancelar: () => void
  tiposFuenteDisponibles: Array<{ value: string; label: string }>
  defaultAlcance?: 'ESPECIFICO_FUENTE' | 'COMPARTIDO_CLIENTE'
}
```
