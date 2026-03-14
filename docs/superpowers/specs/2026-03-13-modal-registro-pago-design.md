# Spec: Modal Registro de Pago (Abono / Desembolso)

**Fecha:** 2026-03-13
**Estado:** Aprobado — listo para implementar
**Autor:** Brainstorming Copilot
**Módulo:** `src/modules/abonos/`

---

## 1. Contexto y motivación

El modal actual (`modal-registrar-abono.tsx`) trata de forma idéntica dos flujos que son conceptualmente distintos:

| Fuente | Flujo real | Nombre correcto |
|--------|-----------|-----------------|
| Cuota Inicial | El cliente paga parcialmente | **Abono** |
| Crédito Hipotecario | El banco desembolsa el total aprobado | **Desembolso** |
| Subsidio Mi Casa Ya | El gobierno transfiere el subsidio | **Desembolso** |
| Subsidio Caja Compensación | La caja transfiere el subsidio | **Desembolso** |

Las diferencias concretas entre ambos flujos son:

1. **Monto** — Los abonos son editables (importe parcial). Los desembolsos tienen monto fijo igual al `monto_aprobado` de la fuente (el banco gira exactamente lo aprobado).
2. **Métodos de pago** — Los abonos aceptan Efectivo, Transferencia y Cheque. Los desembolsos **no admiten Efectivo** (solo Transferencia o Cheque bancario).
3. **Labels e íconos** — En desembolso todo el texto cambia para reflejar terminología bancaria formal.

---

## 2. Decisión de diseño

**Opción elegida: B — reemplazo completo.**

- Se **elimina** el directorio `src/modules/abonos/components/modal-registrar-abono/` completo junto con el archivo `modal-registrar-abono.tsx`.
- Se **crea** el directorio `src/modules/abonos/components/modal-registro-pago/` con todos los nuevos archivos.
- El punto de entrada público sigue siendo un componente `ModalRegistroPago` exportado como barrel.
- El call-site en `src/app/abonos/[clienteId]/page.tsx` se actualiza al nuevo import y nueva prop `modo`.

---

## 3. Cambios de tipos

**Archivo:** `src/modules/abonos/types/index.ts`

Agregar al final del bloque de tipos existentes:

```typescript
/**
 * Modo de registro de pago:
 * - 'abono': El cliente realiza un pago parcial de su Cuota Inicial
 * - 'desembolso': Una entidad bancaria/gobierno transfiere el monto total aprobado
 */
export type ModoRegistro = 'abono' | 'desembolso'

/**
 * Determina el modo de registro a partir de la fuente de pago.
 *
 * REGLA #-10 COMPLIANT: NO hardcodea nombres de fuentes.
 * Usa el flag `permite_multiples_abonos` de la BD (tabla `fuentes_pago`):
 * - true  → 'abono'      (Cuota Inicial — pagos parciales múltiples)
 * - false → 'desembolso' (Crédito Hipotecario, Subsidios — giro único total)
 */
export function getModoRegistro(fuente: Pick<FuentePago, 'permite_multiples_abonos'>): ModoRegistro {
  return fuente.permite_multiples_abonos ? 'abono' : 'desembolso'
}
```

> **Por qué `permite_multiples_abonos`:** La tabla `tipos_fuentes_pago` (y por herencia `fuentes_pago`) ya tiene este campo booleano. Semánticamente es exacto: si se permiten múltiples abonos, el flujo es "abono"; si no, el flujo es "desembolso único". No se necesita migración ni array hardcodeado.

---

## 4. Archivos a eliminar

```
src/modules/abonos/components/modal-registrar-abono.tsx          ← ELIMINAR
src/modules/abonos/components/modal-registrar-abono/
  ├── AlertaValidacionDesembolso.tsx                              ← ELIMINAR
  ├── CampoComprobante.tsx                                        ← ELIMINAR
  ├── CampoMonto.tsx                                              ← ELIMINAR
  ├── index.ts                                                    ← ELIMINAR
  ├── MetodosPagoSelector.tsx                                     ← ELIMINAR
  ├── ModalHeader.tsx                                             ← ELIMINAR
  ├── README.md                                                   ← ELIMINAR
  ├── styles.ts                                                   ← ELIMINAR
  └── useModalRegistrarAbono.ts                                   ← ELIMINAR
```

---

## 5. Archivos a crear

```
src/modules/abonos/components/modal-registro-pago/
  ├── index.ts                    ← barrel export
  ├── ModalRegistroPago.tsx       ← componente principal (orquestador) [< 150 líneas]
  ├── ModalRegistroPago.styles.ts ← TODOS los strings de Tailwind
  ├── useModalRegistroPago.ts     ← hook con toda la lógica
  ├── HeaderPago.tsx              ← sub-componente: header con ícono y badges
  ├── CampoMontoPago.tsx          ← sub-componente: monto editable o readonly
  ├── MetodosPago.tsx             ← sub-componente: cards de métodos filtradas
  └── ComprobantePago.tsx         ← sub-componente: uploader de comprobante
```

---

## 6. Interfaz pública del modal

```typescript
// modal-registro-pago/index.ts
export { ModalRegistroPago } from './ModalRegistroPago'
export type { ModalRegistroPagoProps } from './ModalRegistroPago'
```

```typescript
// ModalRegistroPago.tsx
export interface ModalRegistroPagoProps {
  open: boolean
  onClose: () => void
  negociacionId: string
  clienteId: string
  fechaMinima?: string           // YYYY-MM-DD — mismo que antes
  fuentesPago: FuentePago[]      // todas las fuentes de la negociación
  fuenteInicial: FuentePago      // fuente preseleccionada al abrir
  onSuccess: () => void
}
```

El `modo` **no es una prop pública** — se computa internamente desde `fuenteSeleccionada.permite_multiples_abonos` usando `getModoRegistro`:

```typescript
// useModalRegistroPago.ts (interno)
const modo: ModoRegistro = getModoRegistro(fuenteSeleccionada)
const esDesembolso = modo === 'desembolso'
```

> **Decisión:** El parent (`page.tsx`) no necesita conocer el modo. Lo calcula el hook a partir de la fuente actualmente seleccionada. Esto mantiene la API pública del modal idéntica a la anterior.

---

## 7. Spec detallado por sub-componente

### 7.1 `useModalRegistroPago.ts`

Responsabilidades (mismas que el hook anterior + modo):

- Estado de fuente seleccionada, monto, método de pago, referencia, notas, fecha abono, archivo comprobante
- `modo` derivado: `getModoRegistro(fuenteSeleccionada)` (usa `permite_multiples_abonos`)
- `esDesembolso`: boolean derivado de `modo`
- **Reset de estado al abrir:** `useEffect([open])` — cuando `open` pasa a `true`, resetear todos los campos y preseleccionar `fuenteInicial`. **No usar `key` prop en el parent** — el reset es responsabilidad del hook.
- Cuando cambia `fuenteSeleccionada`:
  - Si `esDesembolso === true` → auto-set monto a `fuenteSeleccionada.monto_aprobado ?? 0`
  - Si nuevo modo es `'desembolso'` y método actual es `'Efectivo'` → auto-reset método a `'Transferencia'`
- `metodosDisponibles`: array filtrado según modo:
  ```typescript
  const metodosDisponibles: MetodoPago[] = esDesembolso
    ? ['Transferencia', 'Cheque']
    : ['Efectivo', 'Transferencia', 'Cheque']
  ```
- `colorScheme`: objeto derivado de `fuenteSeleccionada.tipo` **— EXPUESTO en return del hook** para que el componente lo use al generar estilos:
  ```typescript
  // Hook retorna:
  return {
    ...,
    modo,
    esDesembolso,
    colorScheme,  // ← necesario para getModalStyles()
    metodosDisponibles,
    handleSubmit,
    isSubmitting,
    errorSubmit,   // string | null — error visible al usuario
  }
  ```
- `handleSubmit`: misma lógica de subida de comprobante a Supabase Storage y registro en BD que el hook anterior. Muestra `errorSubmit` si falla. **Eliminar `uploadProgress`** — no hay UI que lo consuma; basta el spinner en el botón.
- Validación: monto > 0, método seleccionado, fecha abono presente, monto ≤ saldo_pendiente. En caso de error: setear `errorSubmit` (mensaje descriptivo) — no toast externo.
- **`fechaAbono` default:** `getTodayDateString()` al montar / al resetear.
- **Extraer sub-hook si supera 200 líneas:** `useSubmitPago.ts` para la lógica de submit + storage.

### 7.2 `HeaderPago.tsx`

Props recibidas: `fuente: FuentePago`, `modo: ModoRegistro`, `fuentesPago: FuentePago[]`, `fuenteSeleccionada: FuentePago`, `onFuenteChange: (f: FuentePago) => void`, `colorScheme: ColorScheme`

> **Nota:** Todos los sub-componentes reciben `modo: ModoRegistro` (no `esDesembolso: boolean`) para consistencia. El componente derivará `esDesembolso = modo === 'desembolso'` localmente donde lo necesite.

**Layout:**

```
┌─────────────────────────────────────────────┐
│ [ícono] Registrar [Abono|Desembolso]         │
│         [fuente.tipo] · [badge modo]         │
├─────────────────────────────────────────────┤ (solo si hay > 1 fuente)
│ Selector de fuente: [FuenteA] [FuenteB] ... │
├─────────────────────────────────────────────┤
│ 💰 Valor total: $X,XXX,XXX  |  🔄 Saldo: $Y │
└─────────────────────────────────────────────┘
```

**Íconos:**
- Abono → `Wallet` (lucide-react)
- Desembolso → `Landmark` (lucide-react)

**Badges:**
- Abono → `"💰 Abono parcial"` — fondo `bg-white/20 border-white/30`
- Desembolso → `"🏦 Desembolso único · No editable"` — fondo `bg-purple-900/40 border-purple-400/40`

**Gradiente de fondo del header** — usa el color de la fuente, igual que el modal anterior (reutilizar lógica de `colorSchemes` de styles.ts pero renombrándola en el nuevo styles).

### 7.3 `CampoMontoPago.tsx`

Props: `modo: ModoRegistro`, `monto: number`, `onMontoChange: (v: number) => void`, `saldoPendiente: number`, `montoAprobado: number | null`, `colorScheme: ColorScheme`

**Modo abono (editable):**
```
┌──────────────────────────────────┐
│ $ [         2,500,000          ] │  ← input numérico con $ prefix
│   Saldo disponible: $X,XXX,XXX   │  ← verde si monto ≤ saldo, rojo si excede
└──────────────────────────────────┘
```
- Input con `border-2`, focus ring del color de la fuente (clases estáticas del `colorScheme`)
- Debajo del input: `"Saldo disponible: $X,XXX,XXX"` en `text-emerald-600` (o `text-red-500` si monto > saldo)

**Modo desembolso (readonly):**
```
┌──────────────────────────────────────────────┐
│ [lock icon]    Monto del desembolso           │
│                                               │
│    $XX,XXX,XXX  (o "Pendiente de aprobación")│  ← text-3xl font-black
│    Desembolso total aprobado · No modificable │  ← text-xs text-muted
└──────────────────────────────────────────────┘
```
- Si `montoAprobado === null || montoAprobado === 0`: mostrar texto `"Pendiente de aprobación"` en lugar del monto.
- Fondo con gradiente del color de la fuente al 20% de opacidad (clases estáticas)
- `Lock` icon (lucide-react) top-right
- Sin input, sin `onChange`

### 7.4 `MetodosPago.tsx`

Props: `metodosDisponibles: MetodoPago[]`, `metodoPago: MetodoPago | null`, `onMetodoChange: (m: MetodoPago) => void`, `modo: ModoRegistro`, `colorScheme: ColorScheme`

**Cards de métodos:**

| Método | Ícono | Solo abono |
|--------|-------|-----------|
| Efectivo | `Banknote` | ✅ Solo aparece en abono |
| Transferencia | `ArrowRightLeft` | No — aparece en ambos |
| Cheque | `FileCheck` | No — aparece en ambos |

Renderizar solo los métodos en `metodosDisponibles` (el parent ya filtra).

**Cards seleccionadas:** borde de 2px del color de la fuente + fondo light del color.

**Nota informativa** (mostrar SOLO si `modo === 'desembolso'`):
```tsx
<p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
  <Info className="w-3.5 h-3.5 flex-shrink-0" />
  Los desembolsos bancarios no admiten pagos en efectivo
</p>
```

### 7.5 `ComprobantePago.tsx`

Responsabilidad: zona de drop + preview de comprobante. Reutiliza **exactamente la misma lógica** del `CampoComprobante.tsx` anterior (que ya fue depurada), pero con un label dinámico:

- Abono → `"Comprobante de pago"` + `"Adjunta el recibo o comprobante (opcional)"`
- Desembolso → `"Comprobante de desembolso bancario"` + `"Adjunta el comprobante emitido por la entidad (obligatorio recomendado)"`

Props: `modo: ModoRegistro`, `archivo: File | null`, `onArchivoChange: (f: File | null) => void`

**Patrón de trigger OBLIGATORIO** (no romper Radix FocusTrap):
```tsx
// ✅ label htmlFor — no usa inputRef.click()
<label htmlFor="comprobante-pago-input" className="...cursor-pointer">...</label>
<input
  id="comprobante-pago-input"
  type="file"
  accept="image/*,application/pdf"
  className="sr-only absolute"
  onChange={handleFileChange}
/>
```

### 7.6 `ModalRegistroPago.tsx` (orquestador)

Responsabilidad: solo composición de sub-componentes + Dialog de Radix. **El footer es inline aquí — no es un componente separado.**

Accesibilidad obligatoria de Radix: incluir `<DialogTitle>` y `<DialogDescription>` (pueden ser `sr-only` si el diseño visual los reemplaza).

```tsx
export function ModalRegistroPago(props: ModalRegistroPagoProps) {
  const {
    fuenteSeleccionada, setFuenteSeleccionada,
    modo, esDesembolso,
    colorScheme,
    monto, setMonto,
    metodoPago, setMetodoPago, metodosDisponibles,
    referencia, setReferencia,
    notas, setNotas,
    fechaAbono, setFechaAbono,
    archivo, setArchivo,
    errorSubmit,
    isSubmitting, handleSubmit,
    saldoPendiente,
  } = useModalRegistroPago(props)

  const styles = getModalStyles(colorScheme, modo)

  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className={styles.dialogContent}>
        <DialogTitle className="sr-only">Registrar {modo === 'abono' ? 'Abono' : 'Desembolso'}</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario para registrar un {modo === 'abono' ? 'abono parcial' : 'desembolso'} para la fuente {fuenteSeleccionada.tipo}
        </DialogDescription>

        <HeaderPago {...} colorScheme={colorScheme} />
        <div className={styles.body}>
          <CampoMontoPago {...} colorScheme={colorScheme} />
          <MetodosPago {...} colorScheme={colorScheme} />
          {/* Campo fecha — input type="date" con formatDateForInput/formatDateForDB */}
          {/* Campo referencia */}
          {/* Campo notas */}
          <ComprobantePago {...} />
          {/* Error de submit — banner rojo inline */}
          {errorSubmit ? (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-300">{errorSubmit}</p>
            </div>
          ) : null}
        </div>
        {/* Footer inline */}
        <div className={styles.footer.container}>
          <button onClick={props.onClose} className={styles.footer.cancelButton} disabled={isSubmitting}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className={styles.footer.submitButton} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {modo === 'abono' ? 'Guardando abono...' : 'Guardando desembolso...'}</>
            ) : modo === 'abono' ? (
              <><CheckCircle2 className="w-4 h-4" /> Confirmar Abono</>
            ) : (
              <><Landmark className="w-4 h-4" /> Registrar Desembolso</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**< 150 líneas** — toda la lógica en el hook.

### 7.7 Footer (inline en `ModalRegistroPago.tsx`)

El footer es parte del orquestador (ya incluido en §7.6). Gradientes estáticos pre-definidos en `ModalRegistroPago.styles.ts`:

**Abono:**
```typescript
// En styles — clave estática
submitAbono: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white ...',
```

**Desembolso:**
```typescript
// En styles — clave estática
submitDesembolso: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white ...',
```

`getModalStyles(colorScheme, modo)` selecciona la clase correcta según `modo`:
```typescript
footer: {
  submitButton: modo === 'abono' ? styles.submitAbono : styles.submitDesembolso,
}
```

---

## 8. Cambios en el call-site

**Archivo modificado:** `src/app/abonos/[clienteId]/page.tsx`

**Cambio del import:**
```typescript
// ANTES
import { ModalRegistrarAbono } from '@/modules/abonos/components/modal-registrar-abono'

// DESPUÉS
import { ModalRegistroPago } from '@/modules/abonos/components/modal-registro-pago'
```

**Cambio del JSX** (la prop API es idéntica):
```tsx
// ANTES
<ModalRegistrarAbono
  open={modalAbonoOpen}
  onClose={handleCerrarModal}
  negociacionId={negociacion.id}
  clienteId={clienteId}
  fechaMinima={...}
  fuentesPago={negociacion.fuentes_pago}
  fuenteInicial={fuenteSeleccionada}
  onSuccess={handleAbonoRegistrado}
/>

// DESPUÉS (mismas props, solo nombre del componente cambia)
<ModalRegistroPago
  open={modalAbonoOpen}
  onClose={handleCerrarModal}
  negociacionId={negociacion.id}
  clienteId={clienteId}
  fechaMinima={...}
  fuentesPago={negociacion.fuentes_pago}
  fuenteInicial={fuenteSeleccionada}
  onSuccess={handleAbonoRegistrado}
/>
```

---

## 9. Dark mode — obligatorio en todos los elementos

| Elemento | Light | Dark |
|---------|-------|------|
| Fondo body | `bg-white` | `dark:bg-gray-900` |
| Bordes | `border-gray-200` | `dark:border-gray-700` |
| Texto principal | `text-gray-900` | `dark:text-white` |
| Texto secundario | `text-gray-500` | `dark:text-gray-400` |
| Input bg | `bg-gray-50` | `dark:bg-gray-800` |
| Card métodos | `bg-white border-gray-200` | `dark:bg-gray-800 dark:border-gray-700` |
| Card selected | `bg-[color]/10 border-[color]` | mismo patrón |

---

## 10. Archivos de estilos — `.styles.ts`

Todo string de Tailwind > 80 caracteres va en `ModalRegistroPago.styles.ts`.

### 🚨 CRÍTICO: Clases Tailwind deben ser literales estáticas

Tailwind JIT purga cualquier clase que no aparezca como string literal en el código. Las clases **NO pueden construirse dinámicamente en runtime** con template literals.

```typescript
// ❌ INCORRECTO — purgeado en producción
`border-${scheme.color}-500`
`focus-within:ring-${scheme.color}/20`

// ✅ CORRECTO — strings literales en el objeto ColorScheme
type ColorScheme = {
  gradient: string            // 'from-blue-600 via-cyan-600 to-teal-600'
  gradientHover: string       // 'hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700'
  bgLight: string             // 'bg-blue-500/10'
  borderSelected: string      // 'border-blue-500'
  borderSelectedHover: string // 'hover:border-blue-500'
  focusBorder: string         // 'focus:border-blue-500' / 'focus-within:border-blue-500'
  focusRing: string           // 'focus:ring-blue-500/20'
  textAccent: string          // 'text-blue-600 dark:text-blue-400'
  headerBadgeAbono: string    // 'bg-white/20 border border-white/30 text-white'
  headerBadgeDesembolso: string  // 'bg-purple-900/40 border border-purple-400/40 text-white/90'
}
```

**`colorSchemes` mapeado desde `fuente.tipo` (strings literales completos):**
```typescript
const COLOR_SCHEMES: Record<string, ColorScheme> = {
  'Cuota Inicial': {
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    gradientHover: 'hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700',
    bgLight: 'bg-blue-500/10',
    borderSelected: 'border-blue-500',
    focusBorder: 'focus-within:border-blue-500',
    focusRing: 'focus-within:ring-blue-500/20',
    textAccent: 'text-blue-600 dark:text-blue-400',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso: 'bg-purple-900/40 border border-purple-400/40 text-white/90',
  },
  'Crédito Hipotecario': {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    // ... idem
  },
  'Subsidio Mi Casa Ya': {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    // ... idem
  },
  'Subsidio Caja Compensación': {
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    // ... idem
  },
}

const DEFAULT_SCHEME: ColorScheme = COLOR_SCHEMES['Cuota Inicial']

export function getColorScheme(tipo: string): ColorScheme {
  return COLOR_SCHEMES[tipo] ?? DEFAULT_SCHEME
}
```

**`getModalStyles` exportada:**
```typescript
export function getModalStyles(scheme: ColorScheme, modo: ModoRegistro) {
  return {
    dialogContent: 'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none',
    header: {
      container: `bg-gradient-to-br ${scheme.gradient} px-5 py-4 rounded-t-2xl`,
      badge: modo === 'desembolso' ? scheme.headerBadgeDesembolso : scheme.headerBadgeAbono,
    },
    body: 'px-5 py-4 space-y-5',
    montoReadonly: `rounded-xl border-2 ${scheme.borderSelected} bg-white/10 dark:bg-black/10 p-4`,
    footer: {
      container: 'px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end',
      cancelButton: 'px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      submitButton: modo === 'abono'
        ? `inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all`
        : `inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all`,
    },
  } as const
}
```

---

## 11. Notas de implementación

1. **No cambiar la API de Storage ni la de BD** — el hook nuevo llama exactamente las mismas funciones del service.
2. **`colorSchemes` desde `ModalRegistroPago.styles.ts`** — el hook llama `getColorScheme(fuenteSeleccionada.tipo)` y expone el resultado.
3. **`AlertaValidacionDesembolso.tsx`** se elimina — su funcionalidad se integra como nota informativa simple en `MetodosPago.tsx`.
4. **Fechas correctas:**
   - `fechaAbono` default: `getTodayDateString()` al resetear
   - Cargar en input: `formatDateForInput(fechaAbono)`
   - Guardar en BD: `formatDateForDB(fechaAbonoInput)`
5. **Validación UX:** errores mostrados como banner rojo inline sobre el footer (no toast). El botón de submit también se deshabilita.
6. **Tests manuales requeridos:** abrir modal con Cuota Inicial (`permite_multiples_abonos = true`), abrir con Crédito Hipotecario (`permite_multiples_abonos = false`), cambiar fuente dentro del modal de Cuota Inicial a Crédito Hipotecario → verificar reset de método si era Efectivo.
7. **No agregar campos nuevos** — solo refactorizar los existentes. La BD no cambia.
8. **Orden de campos en el body:**
   - CampoMontoPago
   - MetodosPago
   - Input Fecha (con `formatDateForInput` y `formatDateForDB`)
   - Input Referencia (número de transferencia/cheque)
   - Input Notas
   - ComprobantePago (al fondo, opcional en abono)
   - Banner de error (si `errorSubmit !== null`)

---

## 12. Checklist de aceptación

- [ ] Abrir modal con fuente `permite_multiples_abonos = true` (ej: Cuota Inicial) → header "Abono parcial", monto editable, 3 métodos
- [ ] Abrir modal con fuente `permite_multiples_abonos = false` (ej: Crédito Hipotecario) → header "Desembolso único · No editable", monto readonly, 2 métodos, nota informativa visible
- [ ] Fuente desembolso con `monto_aprobado = null` → muestra "Pendiente de aprobación" en lugar de monto
- [ ] Cambiar fuente de abono a desembolso con método Efectivo activo → método auto-reset a Transferencia
- [ ] Cambiar fuente de desembolso a abono → monto se convierte en editable
- [ ] Cerrar y reabrir con fuente diferente → estado completamente limpio (monto, método, referencia, notas, archivo, fecha = hoy)
- [ ] `fechaAbono` default = `getTodayDateString()` al abrir / reiniciar
- [ ] Fecha se guarda con `formatDateForDB()` antes del insert (hora mediodía, no medianoche)
- [ ] Subir comprobante — drop zone funciona, preview se muestra, no colapsa layout
- [ ] Trigger de uploader NO usa `.click()` programático (usa `label htmlFor`, no rompe FocusTrap de Radix)
- [ ] `DialogTitle` y `DialogDescription` de Radix presentes (aunque sean `sr-only`)
- [ ] Error de validación visible como banner rojo inline + botón deshabilitado
- [ ] Error en submit → modal permanece abierto + banner de error visible
- [ ] Dark mode completo en todas las secciones
- [ ] Submit registra abono/desembolso correctamente en BD
- [ ] `onSuccess` se llama tras registro exitoso → lista se actualiza
- [ ] TypeScript sin errores (`npm run type-check`)
- [ ] Componente principal < 150 líneas
- [ ] Hook < 200 líneas (o extraído a `useSubmitPago.ts` si supera)
- [ ] Clases Tailwind en `ColorScheme` son strings estáticos literales (no template literals con vars JS)
- [ ] `permite_multiples_abonos` del objeto `FuentePago` es el único discriminador de modo (sin array hardcodeado)
