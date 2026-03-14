# Spec: Nuevo Formulario "Asignar Vivienda" — Accordion Progresivo

**Fecha:** 2026-03-14  
**Estado:** Aprobado por usuario  
**Reemplaza:** `src/modules/clientes/pages/asignar-vivienda/` (formulario actual de 3 pasos con sidebar)  
**Ruta destino:** `src/modules/clientes/pages/asignar-vivienda-v2/` (nuevo módulo, no reutiliza código del actual)

---

## 1. Contexto y Motivación

El formulario actual de asignación de vivienda presenta tres problemas de UX:

1. **Gigantismo visual** — campos y cards demasiado grandes que hacen cada paso agobiante
2. **Sidebar invasivo** — el panel de resumen lateral ocupa ~30% del ancho permanentemente
3. **Peso visual acumulado** — glassmorphism pesado, gradientes de 3 colores y sombras excesivas en cada elemento

El nuevo formulario mantiene **exactamente la misma funcionalidad y campos** pero con una arquitectura visual radicalmente diferente: acordeones progresivos, paleta monocromática zinc/cyan, tipografía fintech y sin sidebar.

---

## 2. Principios de Diseño (frontend-design skill)

### Dirección estética: "Refined Instrument"

Inspiración: interfaz fintech + documento notarial. Como si Bloomberg y una notaría de lujo diseñaran un formulario juntos.

### Tipografía

- **Headings de sección:** `Plus Jakarta Sans` — carácter sin ser excéntrico
- **Valores monetarios:** `DM Mono` — los números se alinean solos y se leen sin esfuerzo
- **Labels:** `text-[11px] uppercase tracking-widest text-zinc-400` — etiqueta de documento legal

### Paleta de color

```
Base:        zinc-950 / zinc-900  (fondos)
Superficie:  zinc-800 / zinc-800/50
Acento:      cyan-400  — único color activo en toda la pantalla
Éxito:       emerald-400 — solo cuando suma cierra exacta
Error:       rose-400 — solo cuando hay diferencia pendiente
Texto:       zinc-100 (principal) / zinc-400 (secundario)
```

> **Restricción deliberada:** Sin glassmorphism. Sin gradientes de 3 colores. Sin sombras XXL. La profundidad se logra con bordes finos `border-zinc-700/800` y variación de fondo entre superficies.

### Animaciones

- Framer Motion para expand/collapse de acordeones: `height: 'auto'`, `duration: 0.25`, `ease: easeInOut`
  - **⚠️ Footgun crítico de Framer Motion:** `height: 'auto'` **requiere** que el contenedor wrapper tenga `style={{ overflow: 'hidden' }}` (o `className="overflow-hidden"`). Sin esto el contenido no se recorta al colapsar y la animación rompe el layout.
  - Patrón correcto:
    ```tsx
    <motion.div
      animate={{ height: isOpen ? 'auto' : 0 }}
      style={{ overflow: 'hidden' }} // ← OBLIGATORIO
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* contenido del acordeón */}
    </motion.div>
    ```
- Barra de progreso de monto: `animate={{ width }}`, `duration: 0.35`, `ease: easeOut`
- Transición de barra lateral izquierda de color (bloqueado→activo→completado): `transition-colors duration-200`
- **Sin** animaciones `whileHover: scale` en inputs ni cards de contenido

---

## 3. Layout Global

```
[Header compacto — breadcrumb + H1 + nombre cliente + badge paso]
────────────────────────────────────────────────────────────────
[Acordeón ① — Vivienda & Valores]
[Acordeón ② — Fuentes de Pago]
[Acordeón ③ — Revisión & Confirmación]
────────────────────────────────────────────────────────────────
[Status Bar sticky inferior — siempre visible en pasos 1 y 2]
```

**Ancho máximo:** `max-w-2xl mx-auto` — sin grid de dos columnas, sin sidebar.  
**Padding:** `px-4 py-6` (móvil) / `px-6 py-8` (md+)  
**Gap entre acordeones:** `space-y-2`

---

## 4. Header

### Estructura

```
← Clientes / [Nombre Cliente]               (breadcrumb)

Asignar Vivienda                            (H1, Plus Jakarta Sans, text-2xl)
[Nombre completo del cliente]               (subtítulo, text-zinc-400 text-sm)
                                 ● Paso 1 de 3   (badge top-right)
─────────────────────────────────────────────
```

### Especificaciones

- Sin hero card, sin gradiente de fondo, sin icono grande
- Breadcrumbs: `text-zinc-500 text-xs` con separador `/`
- Badge "Paso X de 3": `bg-zinc-800 border border-zinc-700 text-cyan-400 text-xs font-mono px-2 py-0.5 rounded-full`
- Línea divisora: `border-b border-zinc-700 mb-6`

---

## 5. Anatomía del Acordeón

Cada sección comparte la misma estructura base:

### Estado: Expandido (activo)

```
┌─[barra 2px cyan-400]──────────────────────────────────────┐
│  01  VIVIENDA & VALORES                            [▲]    │
│  ─────────────────────────────────────────────────────    │
│  ...contenido...                                          │
└───────────────────────────────────────────────────────────┘
```

- Borde izquierdo: `border-l-2 border-cyan-400`
- Fondo: `bg-zinc-900`
- Número de sección: `text-cyan-400 font-mono text-xs mr-2`
- Título: `text-zinc-100 text-sm font-semibold uppercase tracking-wider`

### Estado: Completado (colapsado, clickeable)

```
┌─[barra 2px emerald-400]───────────────────────────────────┐
│  ✓ 01  VIVIENDA & VALORES                                 │
│        Casa A3 · Los Pinos · $185.500.000 · -$5M desc.   │
└───────────────────────────────────────────────────────────┘
```

- Borde izquierdo: `border-l-2 border-emerald-400`
- Resumen: `text-zinc-400 text-xs font-mono` — una línea
- Checkmark: `text-emerald-400`
- Hover: `hover:bg-zinc-800 cursor-pointer` — abre para editar

**Ejemplos de línea de resumen por sección:**

- Sección ①: `Casa A3 · Los Pinos · $185.500.000 · -$5M desc.`
- Sección ②: `Cuota Inicial · Crédito Hipotecario — $185.500.000 cubierto`
  - Formato: nombres de fuentes activas separados por `·`, luego ` — $X cubierto`
  - Si `sumaCierra === true` el total se muestra en `text-emerald-400`; si no, en `text-rose-400`

### Estado: Bloqueado (pendiente)

```
┌─[barra 2px zinc-600]──────────────────────────────────────┐
│     02  FUENTES DE PAGO                           [🔒]    │
└───────────────────────────────────────────────────────────┘
```

- Borde izquierdo: `border-l-2 border-zinc-600`
- Opacidad: `opacity-50`
- Sin hover, sin cursor pointer
- Ícono candado: `text-zinc-600 w-3.5 h-3.5`

---

## 6. Sección ① — Vivienda & Valores

### Campos (en orden de aparición)

#### Cliente (readonly)

- Chip `bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2`
- Label: `CLIENTE` (11px uppercase tracking-widest zinc-400)
- Valor: nombre completo en `text-zinc-100 text-sm font-medium`

#### Fila: Proyecto + Vivienda

- Grid `grid-cols-2 gap-3`
- **Proyecto:** Select estándar, label `PROYECTO`, placeholder "Seleccionar proyecto"
- **Vivienda:** Combobox con búsqueda, label `VIVIENDA`, placeholder `Busca: A3, B12...`
- Ambos con borde `border-zinc-700` focus `border-cyan-400 ring-1 ring-cyan-400/20`

#### Chips de valores de vivienda (aparecen al seleccionar vivienda)

- Animación: `AnimatePresence` fade-in
- Tres chips en fila `grid-cols-3 gap-2`:
  - `VALOR BASE` / `GASTOS NOTARIALES` / `RECARGO ESQ.`
  - Cada uno: `bg-zinc-800 border border-zinc-700 rounded-md p-2`
  - Valor: `DM Mono text-sm text-zinc-100`
- Línea separadora `border-t border-zinc-700 mt-3 pt-3`
- **Total a cubrir:** `TOTAL A CUBRIR` label + `$185.500.000` en `DM Mono text-xl text-cyan-400 font-bold`

#### Toggle: ¿Aplicar descuento?

- Row: `flex items-center justify-between py-3 border-t border-zinc-800`
- Label: `text-zinc-300 text-sm` + hint `text-zinc-500 text-xs`
- Switch: `w-10 h-5 rounded-full` — `bg-zinc-700` OFF, `bg-cyan-400` ON
- **Sin card de gradiente naranja**

#### Sub-sección descuento (expandible con AnimatePresence)

Aparece debajo del toggle cuando está ON:

- `grid grid-cols-2 gap-3` para Monto + Tipo
- **Monto:** Input numérico con `$` prefijo, `DM Mono`
- **Tipo:** Select con 7 opciones (Trabajador Empresa, Cliente VIP, Promoción Especial, Pronto Pago, Negociación Comercial, Liquidación, Otro)
- **Motivo:** Textarea `rows-2`, contador `0/500 (mín 10)` en `text-zinc-500 text-[10px]`
- **Línea de resumen del descuento** (1 sola línea):  
  `$185.500.000` con `line-through text-zinc-500` + `→` + `$180.500.000` en `text-emerald-400 font-bold DM Mono`
  - porcentaje `(-2.7%)` en `text-zinc-400 text-xs`

#### Valor en Escritura Pública

- Row `border-t border-zinc-800 pt-3 mt-3`
- Label: `VALOR EN ESCRITURA PÚBLICA` + badge `DATO LEGAL` (`text-[10px] tracking-widest border border-zinc-600 text-zinc-500 px-1.5 py-0.5 rounded`)
- Hint `text-zinc-500 text-[10px]`: "Solo para efectos legales y bancarios. No afecta el plan financiero."
- Input: prefijo `$`, default `128.000.000`, `DM Mono`
- Diferencia: `text-zinc-500 text-[10px]` debajo del input

#### Notas adicionales

- Label: `NOTAS (OPCIONAL)`
- Textarea `rows-2 bg-zinc-900 border-zinc-700`

---

## 7. Sección ② — Fuentes de Pago

### Barra de progreso de cobertura (sticky top de sección)

```
Por cubrir: $185.500.000          $0 cubierto (0%)
████████░░░░░░░░░░ 45%
```

- Barra: `h-1 bg-zinc-800 rounded-full` con fill `bg-cyan-400`, `animate={{ width }}`
- Texto encima: `flex justify-between text-[11px]`
  - Izquierda: "Por cubrir: $185.500.000" en `DM Mono text-zinc-400`
  - Derecha: "$XX cubierto (XX%)" en `DM Mono text-cyan-400`
- Cuando completo: fill `bg-emerald-400`, texto derecha `text-emerald-400` "✓ Cubierto exactamente"

### Estado de carga

- Solo un spinner `w-4 h-4 border-cyan-400 border-t-transparent animate-spin` + texto `text-zinc-400 text-xs`
- No card grande

### Lista de fuentes (dinámica desde BD)

Cada fuente es una **row expandible**:

**Toggle OFF (colapsada):**

```
○  CUOTA INICIAL                                —
```

- `flex items-center gap-3 py-2.5 border-b border-zinc-800`
- Switch OFF `bg-zinc-700`, nombre en `text-zinc-400 text-sm`

**Toggle ON (expandida con campos):**

```
●  CRÉDITO HIPOTECARIO                $120.000.000
   ─────────────────────────────────────────────
   ENTIDAD           [input text]
   NÚMERO REFERENCIA  [input text]   ← requerido para fuentes no-Cuota Inicial
   MONTO             $ [input DM Mono]
   [campos dinámicos adicionales desde BD si aplica]
   [toggle] Permite múltiples abonos    (default: OFF)
```

- Switch ON `bg-cyan-400`, nombre `text-zinc-100 text-sm font-medium`
- Monto calculado a la derecha en `DM Mono text-cyan-400 text-sm`
- Campos internos en `pl-7` (alineados con el texto del título)
- Para fuente "Cuota Inicial": omitir `ENTIDAD` y `NÚMERO REFERENCIA` del UI (no requeridos según schema)
- `permite_multiples_abonos`: toggle discreto al final de los campos, sin label prominente
- Animación: `height: 'auto'` con `overflow: hidden` (ver §2 Animaciones)

### Panel totales (fixed al fondo de la sección)

```
─────────────────────────────────────────────────
Total fuentes     $120.000.000
Diferencia        $65.500.000    ← rose-400 si falta
─────────────────────────────────────────────────
Falta cubrir $65.500.000        ← o "✓ Cubierto exactamente"
```

- Fondo `bg-zinc-800/50 rounded-lg p-3 mt-3`
- Números en `DM Mono`
- Estado OK: mensaje `✓ Puedes continuar` en `text-emerald-400 text-xs`
- Estado ERROR: mensaje en `text-rose-400 text-xs`

---

## 8. Sección ③ — Revisión & Confirmación

No colapsa. Es el estado final de revisión antes de guardar.

### Resumen información básica

```
CLIENTE           Pedro Ramírez Gómez
PROYECTO          Los Pinos
VIVIENDA          Manzana A · Casa 3
```

- Grid `grid-cols-2 gap-2`
- Labels `text-[11px] uppercase tracking-widest text-zinc-500`
- Valores `text-zinc-100 text-sm`

### Resumen financiero

```
Valor base + notariales    $185.500.000
Descuento aplicado         -$5.000.000   (2.7%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL A PAGAR              $180.500.000
```

- Separador doble `border-t-2 border-zinc-600`
- Total: `DM Mono text-xl text-cyan-400 font-bold`
- Descuento: `text-amber-400` con prefijo `−` — no usar `rose-400` (reservado para errores)

### Resumen fuentes

```
● Cuota Inicial            $60.500.000
● Crédito Hipotecario      $120.000.000    Bancolombia
```

- Dots `w-2 h-2 rounded-full bg-cyan-400`
- Entidad en `text-zinc-500 text-xs`

### Acciones

- `[Editar ①]` `[Editar ②]` — `text-zinc-400 text-xs underline-offset-2 hover:text-cyan-400 transition-colors`
- `[↓ Descargar PDF]` — `border border-zinc-600 text-zinc-300 hover:border-zinc-400 rounded-lg px-4 py-2 text-sm w-full`
  - **⚠️ Fuera de alcance en V1.** El botón se renderiza visualmente pero está desactivado: `opacity-50 cursor-not-allowed` y sin `onClick`. No hay generación de PDF en esta versión. El form anterior tampoco lo tenía como core — si se necesita en el futuro es una historia separada.

---

## 9. Status Bar Sticky Inferior

Visible en pasos 1 y 2. Oculta en paso 3 (reemplazada por botón "Asignar Vivienda" en la propia sección).

```
┌──────────────────────────────────────────────────────────┐
│  [barra progreso 3px]                                    │
│  $0 cubierto de $185.500.000          [Continuar →]     │
└──────────────────────────────────────────────────────────┘
```

- `fixed bottom-0 left-0 right-0 z-50`
- Fondo: `bg-zinc-950 border-t border-zinc-800`
- Padding: `px-4 py-3 md:px-6`
- Barra progreso (solo en paso 2): `h-[3px] bg-zinc-800` + fill `bg-cyan-400`, justo arriba del texto
- Texto izquierda: `DM Mono text-sm text-zinc-400`
- Botón "Continuar": `bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-5 py-2 rounded-lg transition-colors`
  - Negro sobre cyan — mayor contraste y más impactante que blanco
- Botón "Cancelar" (paso 1): `text-zinc-500 text-sm hover:text-zinc-300` — discreto, no botón prominente

---

## 10. Arquitectura de Componentes (nueva, desde cero)

```
src/modules/clientes/pages/asignar-vivienda-v2/
├── index.tsx                          # AsignarViviendaV2Page (orquestador)
├── styles.ts                          # Clases centralizadas
├── hooks/
│   ├── useAsignarViviendaV2.ts        # Hook principal — orquestra estado global
│   ├── index.ts
├── components/
│   ├── AsignarViviendaHeader.tsx      # Header compacto
│   ├── AccordionSection.tsx           # Shell reutilizable del acordeón
│   ├── StatusBar.tsx                  # Barra sticky inferior
│   ├── sections/
│   │   ├── SeccionViviendaValores.tsx # Contenido sección ①
│   │   ├── SeccionFuentesPago.tsx     # Contenido sección ②
│   │   ├── SeccionRevision.tsx        # Contenido sección ③
│   │   └── index.ts
│   └── index.ts
```

### 10.1 Interfaz de `useAsignarViviendaV2`

El hook es el orquestador central. Delega a sub-hooks existentes y expone esta interfaz a los componentes hijos:

```typescript
interface UseAsignarViviendaV2Return {
  // Navegación entre secciones
  pasoActivo: 1 | 2 | 3
  pasosCompletados: number[] // [1, 2] cuando ambos están validados
  irAPaso: (paso: 1 | 2 | 3) => void

  // React Hook Form (de useAsignarViviendaForm existente)
  register: UseFormRegister<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  touchedFields: Partial<Record<keyof AsignarViviendaFormData, boolean>>
  setValue: UseFormSetValue<AsignarViviendaFormData>
  watch: UseFormWatch<AsignarViviendaFormData>

  // Datos de proyecto y vivienda (de useProyectosViviendas existente)
  proyectos: Proyecto[]
  viviendas: Vivienda[]
  cargandoProyectos: boolean
  cargandoViviendas: boolean
  proyectoSeleccionado: string
  viviendaSeleccionada: Vivienda | null
  setProyectoSeleccionado: (id: string) => void

  // Valores calculados de la sección ①
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number // = valor_negociado guardado en BD

  // Fuentes de pago (de useFuentesPago + cargarTiposFuentesPagoActivas)
  cargandoTipos: boolean
  fuentes: FuentePagoConfiguracion[] // { tipo, enabled, config: FuentePagoConfig | null }
  totalFuentes: number
  diferencia: number // valorTotal - totalFuentes
  sumaCierra: boolean // diferencia === 0

  // Validación de fuentes
  erroresFuentes: Record<string, string> // clave = fuente.tipo (nombre string, ej. "Cuota Inicial")
  mostrarErroresFuentes: boolean

  // Manejadores de fuentes
  handleFuenteEnabledChange: (tipo: string, enabled: boolean) => void
  handleFuenteConfigChange: (
    tipo: string,
    config: Partial<FuentePagoConfig>
  ) => void

  // Validación por sección
  paso1Valido: boolean
  paso2Valido: boolean

  // Guardado
  handleContinuar: () => Promise<void> // navegación + guardado final en paso 3
  handleCancelar: () => void // navega back a perfil del cliente
  creando: boolean // spinner durante guardado
  errorApi: string | null // mensaje de error de API para banner
}
```

---

### Reutilización permitida (desde módulos existentes)

- `ViviendaCombobox` — el combobox de búsqueda ya funciona correctamente
- `FuentePagoCard` — el sistema de campos dinámicos por fuente; **solo cambia su wrapper visual** (fondo `zinc-900` en lugar del actual)
- `useCrearNegociacion` hook — la lógica de guardado no cambia
- `useProyectosViviendas`, `useFuentesPago`, `useAsignarViviendaForm` hooks — reutilizables
- `cargarTiposFuentesPagoActivas` service — sin cambios

### NO reutilizar

- `AsignarViviendaPage` (componente orquestador actual)
- `HeaderAsignarVivienda`, `FooterAsignarVivienda`, `SidebarResumen` — reemplazados totalmente
- `Paso1InfoBasicaRefactored`, `Paso2FuentesPago`, `Paso3Revision` — reemplazados por las secciones nuevas
- `StepperAsignarVivienda` — eliminado, reemplazado por el sistema de acordeones
- `pageStyles` / `styles.ts` actual — nuevo archivo de estilos desde cero

---

## 11. Comportamiento de Validación y Errores

### Validación por paso

- **Paso ①:** Válido cuando `proyecto_id` y `vivienda_id` están seleccionados. Si descuento activo: también `descuento_aplicado > 0`, `tipo_descuento` y `motivo_descuento` (≥10 chars). Implementar con `trigger(['proyecto_id', 'vivienda_id', ...])` al hacer click en "Continuar".
- **Paso ②:** Válido cuando `sumaCierra === true` (total fuentes === valorTotal). Para fuentes activas no-"Cuota Inicial": `entidad` y `numero_referencia` son obligatorios. La validación se hace manualmente en el hook antes de navegar, NO con `fuentePagoValidadaSchema` — ese schema no existe todavía y no debe crearse. Patrón:
  ```typescript
  const errores: Record<string, string> = {}
  fuentes
    .filter(f => f.enabled && f.tipo !== 'Cuota Inicial')
    .forEach(f => {
      if (!f.config?.entidad) errores[f.tipo] = 'Entidad requerida'
      if (!f.config?.numero_referencia)
        errores[f.tipo] = 'Número de referencia requerido'
    })
  if (Object.keys(errores).length > 0) {
    setErroresFuentes(errores)
    return
  }
  ```
- **Errores inline:** Aparecen debajo del campo afectado, `text-rose-400 text-xs flex items-center gap-1`.
- **Transición bloqueado→activo:** Solo cuando el paso anterior está validado — el acordeón bloqueado no tiene hover ni responde a clicks.
- **Editar desde Revisión:** La sección ③ permanece visible; se expande la sección editada. `irAPaso(1)` o `irAPaso(2)` desde los botones de edición.

### Errores de API (guardado)

Cuando `useCrearNegociacion` falla:

- El botón "Asignar Vivienda" vuelve a estado normal (no spinner)
- Se muestra un banner de error encima de la sección ③: `bg-rose-950/50 border border-rose-800 text-rose-300 text-sm p-3 rounded-lg` con el mensaje del error
- El error se limpia cuando el usuario modifica cualquier campo
- Casos específicos a manejar con mensaje explicativo:
  - Vivienda ya asignada (duplicate constraint)
  - Error de red / timeout
  - Error genérico de Supabase

### Campo `valor_negociado` — aclaración

`TOTAL A CUBRIR` que se muestra en la UI **es** el valor que se guarda como `valor_negociado` en BD. Se calcula como:

```
valor_negociado = valor_base + gastos_notariales + recargo_esquinera - descuento_aplicado
```

Este valor se setea automáticamente vía `setValue('valor_negociado', valorTotal)` cuando cambia la vivienda o el descuento. No es un campo editable directo — es el resultado del cálculo mostrado como `TOTAL A CUBRIR`.

### Campo `permite_multiples_abonos`

Boolean en cada fuente configurada. Se muestra como toggle dentro de la fuente expandida en sección ②:

```
[toggle] Permite múltiples abonos    text-zinc-400 text-xs
```

Default: `false`. No requiere validación. Se incluye en el payload de cada fuente al guardar.

---

## 12. Fuentes Web (Google Fonts / Next.js)

Agregar en `layout.tsx` o `globals.css`:

```
Plus Jakarta Sans: weights 400, 500, 600, 700
DM Mono: weights 400, 500
```

Via `next/font/google` para zero-layout-shift.

---

## 13. Ruta y Navegación

- **Ruta nueva:** `/clientes/[id]/asignar-vivienda-v2` (nueva `page.tsx`)
- La ruta actual `/clientes/[id]/asignar-vivienda` permanece hasta que el nuevo formulario esté validado en producción
- Al guardar exitosamente: `router.push(`/clientes/${clienteSlug}`)` — igual que el actual

---

## 14. Criterios de Éxito

- [ ] Todos los campos del formulario actual presentes y funcionales
- [ ] Sin sidebar permanente
- [ ] Acordeones con 3 estados visuales distintos (expandido/completado/bloqueado)
- [ ] Barra de progreso de monto en tiempo real en sección ②
- [ ] Status bar sticky visible en pasos 1 y 2
- [ ] Tipografía `DM Mono` en todos los valores monetarios
- [ ] Paleta monocromática zinc + acento único cyan
- [ ] Dark mode nativo (zinc es dark-first)
- [ ] Responsive: grid `grid-cols-2` colapsa a `grid-cols-1` en `< sm` (640px); status bar apila monto arriba y botón abajo en móvil (`flex-col sm:flex-row`)
- [ ] Lógica de guardado idéntica al formulario actual (mismos hooks/services)
