si por # RyR Constructora - Sistema de Gestión Administrativa

## 🎯 PRINCIPIOS FUNDAMENTALES (APLICAR SIEMPRE)

### 🚨 REGLA CRÍTICA #-12: VERIFICACIÓN COMPLETA OBLIGATORIA ANTES DE DECLARAR TAREA TERMINADA

**⚠️ DESPUÉS de CUALQUIER cambio de código (nuevo feature, bugfix, refactor, migración de roles, etc.):**

**EL ÚNICO COMANDO DE VERIFICACIÓN VÁLIDO ES:**

```bash
npm run check-all
```

**Qué verifica internamente (en orden):**

| #   | Herramienta          | Detecta                                                                          |
| --- | -------------------- | -------------------------------------------------------------------------------- |
| 1   | `tsc --noEmit`       | Errores TypeScript, `any` implícito, referencias inválidas a tipos/enums         |
| 2   | `next lint` (ESLint) | `no-console`, `no-explicit-any`, `no-unused-vars`, `import/order`, `react-hooks` |
| 3   | `prettier --check`   | Formato inconsistente en cualquier archivo                                       |
| 4   | `vitest run`         | Tests unitarios (regresiones en lógica de negocio)                               |

**REGLAS ABSOLUTAS:**

1. **NUNCA** declarar una tarea terminada sin que `npm run check-all` haya pasado con **exit code 0**
2. **NUNCA** ignorar warnings de ESLint (`--max-warnings=0` está configurado — cualquier warning es fallo)
3. **SIEMPRE** corregir los errores detectados, en este orden de prioridad: TypeScript → ESLint → Prettier → Tests
4. **NUNCA** usar `eslint-disable` para silenciar errores en código de negocio — corregir el código
5. **NUNCA** usar `// @ts-ignore` o `// @ts-expect-error` para ocultar errores TypeScript

**Referencia rápida de comandos individuales (solo para diagnóstico):**

```bash
npm run type-check        # Solo TypeScript
npm run lint              # Solo ESLint
npm run lint:fix          # ESLint con auto-corrección
npm run format            # Prettier auto-corrección
npm run test              # Solo Vitest
npm run check:full        # check-all + next build (usar antes de deploy)
```

**Errores comunes detectados por check-all que NO repetir:**

- ❌ Renombrar roles en TypeScript pero no actualizar objetos de estilos → `TS7053`
- ❌ Agregar `useEffect`/`useCallback` sin incluir todas las dependencias → `react-hooks/exhaustive-deps`
- ❌ Importar módulos en orden incorrecto → `import/order`
- ❌ `console.log` olvidado en código de producción → `no-console`
- ❌ Dejar archivos sin formatear con Prettier → `format:check` falla

---

### 🚨 REGLA CRÍTICA #-11: EDICIÓN EN PÁGINA PROPIA, NO EN MODAL (OBLIGATORIO)

**⚠️ AL implementar o revisar flujos de EDICIÓN en CUALQUIER módulo:**

1. **NUNCA** → Modal de edición (`editar-xxx-modal.tsx`) para datos complejos multi-paso
2. **SIEMPRE** → Página dedicada `/[modulo]/[id]/editar/page.tsx` con `AccordionWizardLayout`
3. **PATRÓN** → Idéntico a Crear pero con datos precargados vía `useQuery`
4. **RECORDAR** → Si alguien menciona editar en modal en viviendas/clientes/proyectos, señalar inmediatamente esta regla

**Estructura OBLIGATORIA para edición:**

```
src/app/[modulo]/[id]/editar/page.tsx          ← Server Component (permisos + slug resolver)
src/modules/[modulo]/components/Editar[Modulo]AccordionView.tsx  ← Componente presentacional
src/modules/[modulo]/hooks/useEditar[Modulo]Accordion.ts         ← Toda la lógica
```

**Módulos que YA usan la página propia (referencia):**

- ✅ `proyectos` → `/proyectos/[id]/editar` → `EditarProyectoView` + `useEditarProyecto`

**Módulos PENDIENTES de migrar (recordar siempre):**

- ⚠️ `viviendas` → Tiene `editar-vivienda-modal.tsx` DEPRECADA → migrar a `/viviendas/[slug]/editar`
- ⚠️ `clientes` → Aún sin flujo de edición propio → crear `/clientes/[id]/editar`

**Navegación desde listas/detalle:**

```typescript
// ✅ CORRECTO: Navegar a página de edición
const url = construirURLVivienda(vivienda, manzana, proyecto)
router.push(`${url}/editar`)

// ❌ INCORRECTO: Abrir modal de edición
setModalEditar(true)
setViviendaEditar(vivienda)
```

**Ventajas del patrón página propia:**

- ✅ URL propia → el usuario puede compartir el link de edición
- ✅ Browser back/forward funciona correctamente
- ✅ No hay race conditions con React Query al cerrar modal
- ✅ Más espacio para wizard multi-paso
- ✅ Consistencia total entre módulos
- ✅ La página de Crear y Editar comparten los mismos componentes de paso

**⚡ ACCIÓN INMEDIATA si detectas `editar-*-modal` en PR/código nuevo:**
Recordar al usuario: _"Recuerda: la política del proyecto es editar en página propia (`/editar`), no en modal. Ver REGLA #-11."_

---

### 🚨 REGLA CRÍTICA #-10: FUENTES DE PAGO DINÁMICAS (OBLIGATORIO)

**⚠️ AL trabajar con fuentes de pago en CUALQUIER módulo:**

1. **NUNCA HARDCODEAR** → Array de fuentes en código
2. **SIEMPRE CARGAR** → Desde `tipos_fuentes_pago` con `activo = true`
3. **USAR SERVICE** → `cargarTiposFuentesPagoActivas()` de `tipos-fuentes-pago.service.ts`
4. **EXPONER CARGA** → Estado `cargandoTipos` en UI con spinner
5. **RENDERIZAR DINÁMICO** → `fuentes.map()` sin array hardcodeado

**Service correcto:**

```typescript
import { cargarTiposFuentesPagoActivas } from '@/modules/clientes/services/tipos-fuentes-pago.service'

// ✅ CORRECTO: Carga dinámica
const { data, error } = await cargarTiposFuentesPagoActivas()
// Retorna: [{ id, nombre, descripcion, activo, orden, ... }]

// ❌ INCORRECTO: Hardcodeado
const fuentes = ['Cuota Inicial', 'Crédito Hipotecario', ...]
```

**Hook con carga dinámica:**

```typescript
const [cargandoTipos, setCargandoTipos] = useState(true)
const [tiposFuentesDisponibles, setTiposFuentesDisponibles] = useState<
  string[]
>([])
const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([])

useEffect(() => {
  const cargarTipos = async () => {
    const { data, error } = await cargarTiposFuentesPagoActivas()
    if (data) {
      setTiposFuentesDisponibles(data.map(f => f.nombre))
    }
    setCargandoTipos(false)
  }
  cargarTipos()
}, [])

useEffect(() => {
  if (!cargandoTipos && tiposFuentesDisponibles.length > 0) {
    const fuentesIniciales = tiposFuentesDisponibles.map(nombre => ({
      tipo: nombre as TipoFuentePago,
      enabled: false,
      config: null,
    }))
    setFuentes(fuentesIniciales)
  }
}, [cargandoTipos, tiposFuentesDisponibles])
```

**UI con estado de carga:**

```tsx
{
  cargandoTipos && (
    <div className='...'>
      <div className='border-3 h-5 w-5 animate-spin rounded-full border-cyan-500 border-t-transparent' />
      <p>Cargando fuentes de pago activas desde el sistema...</p>
    </div>
  )
}

{
  !cargandoTipos && fuentes.length === 0 && (
    <div className='...'>⚠️ No hay fuentes de pago activas configuradas.</div>
  )
}

{
  !cargandoTipos && fuentes.length > 0 && (
    <div className='space-y-3'>
      {fuentes.map(fuente => (
        <FuentePagoCard key={fuente.tipo} {...props} />
      ))}
    </div>
  )
}
```

**Ventajas del sistema:**

- ✅ Configuración sin deploy (admin puede agregar/quitar fuentes)
- ✅ Activar/desactivar fuentes en tiempo real
- ✅ Escalable (ej: agregar "Crédito Constructor" sin código)
- ✅ Orden personalizable desde BD

**Documentación completa:** `docs/SISTEMA-FUENTES-PAGO-DINAMICAS.md` ⭐

---

### 🚨 REGLA CRÍTICA #-9: SISTEMA DE DOCUMENTOS PENDIENTES POR FUENTE (OBLIGATORIO)

**⚠️ AL trabajar con documentos pendientes de fuentes de pago:**

1. **USAR VISTA SQL** → `vista_documentos_pendientes_fuentes` (NO tabla `documentos_pendientes`)
2. **ESTADOS DE FUENTES** → Solo `'Activa'` | `'Inactiva'` (NO más 'Pendiente', 'En Proceso', 'Completada')
3. **ALCANCE DE DOCUMENTOS** → `'ESPECIFICO_FUENTE'` (uno por fuente) vs `'COMPARTIDO_CLIENTE'` (uno por cliente)
4. **NO HARDCODEAR** → Fuentes de pago siempre consultar desde `tipos_fuentes_pago`

**Vista en tiempo real:**

```typescript
// ✅ CORRECTO: Query a vista (calcula pendientes automáticamente)
const { data: pendientes } = await supabase
  .from('vista_documentos_pendientes_fuentes')
  .select('*')
  .eq('cliente_id', clienteId)

// ❌ INCORRECTO: Tabla obsoleta
const { data } = await supabase.from('documentos_pendientes') // ← NO USAR
```

**Estados válidos de fuentes:**

```typescript
// ✅ CORRECTO (después de migración)
type EstadoFuente = 'Activa' | 'Inactiva'

// ❌ OBSOLETO (ya no existe)
type EstadoFuenteViejo = 'Pendiente' | 'En Proceso' | 'Completada'
```

**Alcance de documentos:**

```typescript
// ✅ Documento específico: uno por cada fuente
alcance: 'ESPECIFICO_FUENTE'
// Ejemplo: Carta de Aprobación (cada entidad emite la suya)

// ✅ Documento compartido: uno para el cliente
alcance: 'COMPARTIDO_CLIENTE'
// Ejemplo: Boleta de Registro (válida para todas las fuentes)
```

**Componente UI:**

```typescript
import { SeccionDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'

<SeccionDocumentosPendientes
  clienteId={cliente.id}
  onSubirDocumento={(metadata) => {
    // Abrir modal con metadata pre-llenado
  }}
/>
```

**Ventajas del sistema:**

- ✅ Datos siempre actualizados (vista calcula en tiempo real)
- ✅ No hay "stale data" ni sincronización manual
- ✅ Documentos compartidos aparecen solo UNA VEZ
- ✅ Escalable: agregar fuente → solo configurar requisitos

**Documentación completa:** `docs/SISTEMA-DOCUMENTOS-PENDIENTES-FUENTES-UNIFICADO.md` ⭐

---

### 🚨 REGLA CRÍTICA #-8: SISTEMA DE SANITIZACIÓN DE DATOS (OBLIGATORIO)

**⚠️ AL guardar CUALQUIER dato en la base de datos:**

1. **USAR** → Funciones de sanitización antes de insert/update
2. **IMPORTAR** → `sanitize*.utils.ts` del módulo correspondiente
3. **VALIDAR** → Enums, strings vacíos, fechas inválidas
4. **NO** → Enviar strings vacíos `''` a campos opcionales (usar `null`)

**Funciones disponibles:**

```typescript
// Genéricas (src/lib/utils/sanitize.utils.ts)
import {
  sanitizeString,
  sanitizeDate,
  sanitizeEnum,
} from '@/lib/utils/sanitize.utils'

// Específicas por Módulo
import {
  sanitizeCrearClienteDTO,
  sanitizeActualizarClienteDTO,
} from '@/modules/clientes/utils/sanitize-cliente.utils'
import {
  sanitizeProyectoFormData,
  sanitizeProyectoUpdate,
} from '@/modules/proyectos/utils/sanitize-proyecto.utils'
import {
  sanitizeViviendaFormData,
  sanitizeViviendaUpdate,
} from '@/modules/viviendas/utils/sanitize-vivienda.utils'
```

**Ejemplo correcto:**

```typescript
// ✅ ANTES de insertar/actualizar
const datosSanitizados = sanitizeCrearClienteDTO(datos)
await supabase.from('clientes').insert(datosSanitizados)

// ✅ Proyectos
const proyectoSanitizado = sanitizeProyectoFormData(datos)
await supabase.from('proyectos').insert(proyectoSanitizado)

// ✅ Viviendas
const viviendaSanitizada = sanitizeViviendaFormData(datos)
await supabase.from('viviendas').insert(viviendaSanitizada)
```

**Errores CRÍTICOS que NO repetir:**

- ❌ Enviar `estado_civil: ''` → ✅ Sanitizar: `estado_civil: null`
- ❌ Enviar `fecha_nacimiento: ''` → ✅ Sanitizar: `fecha_nacimiento: null`
- ❌ No validar enums → ✅ `sanitizeEnum(value, validValues)`
- ❌ Lógica de sanitización duplicada → ✅ Función centralizada

**Documentación completa:** `docs/SISTEMA-SANITIZACION-DATOS-CLIENTES.md` ⭐

---

### 🚨 REGLA CRÍTICA #-7: VERIFICAR NOMBRES DE COLUMNAS/TABLAS (OBLIGATORIO)

**⚠️ ANTES de escribir CUALQUIER consulta SQL o usar nombres de tablas/columnas:**

1. **ABRIR** → `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` ⭐
2. **BUSCAR** → Ctrl+F con el nombre de la tabla que necesitas
3. **COPIAR** → Nombre EXACTO de la columna (NO asumir)
4. **VERIFICAR** → Tipo de dato y si acepta NULL

**Errores CRÍTICOS que NO repetir:**

- ❌ Asumir que existe `url` → ✅ Verificar: es `url_storage`
- ❌ Usar `ruta_archivo` → ✅ Correcto: `url_storage`
- ❌ Asumir `entidad_id` → ✅ Verificar: es `cliente_id`
- ❌ Inventar nombres "lógicos" → ✅ Consultar schema SIEMPRE

**Regenerar schema actualizado:**

```bash
node generar-schema-simple.js
```

**Documentación completa:** `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` ⭐

---

### 🚨 REGLA CRÍTICA #-6: MANEJO PROFESIONAL DE FECHAS (OBLIGATORIO)

**⚠️ AL trabajar con CUALQUIER fecha en la aplicación:**

1. **IMPORTAR** → Funciones de `@/lib/utils/date.utils` (NUNCA usar `new Date()` directo)
2. **MOSTRAR** → `formatDateCompact(fecha)` para formato dd-MMM-yyyy (ESTÁNDAR UNIFICADO)
3. **INPUT** → `formatDateForInput(fecha)` para cargar en `<input type="date" />`
4. **GUARDAR** → `formatDateForDB(inputValue)` antes de guardar en PostgreSQL
5. **HOY** → `getTodayDateString()` en lugar de `new Date().toISOString().split('T')[0]`

**Funciones disponibles:**

```typescript
import {
  formatDateCompact, // dd-MMM-yyyy (RECOMENDADO: "16-feb-2023")
  formatDateShort, // dd/MM/yyyy (legacy)
  formatDateForDisplay, // "23 de octubre de 2025"
  formatDateForInput, // YYYY-MM-DD para inputs
  formatDateForDB, // Guardar con T12:00:00
  getTodayDateString, // Fecha actual sin timezone shift
  formatDateTimeForDisplay, // Fecha + hora
} from '@/lib/utils/date.utils'
```

**Ejemplos correctos:**

```typescript
// ✅ Mostrar en card/tabla (ESTÁNDAR UNIFICADO)
{formatDateCompact(documento.fecha_documento)}  // → "16-feb-2023"

// ✅ Cargar en input
<input value={formatDateForInput(documento.fecha_documento)} />

// ✅ Guardar en DB
const data = {
  fecha_documento: formatDateForDB(inputValue)  // → "2025-10-26T12:00:00"
}

// ✅ Fecha actual
const hoy = getTodayDateString()  // → "2025-10-26"
```

**Errores CRÍTICOS que NO repetir:**

- ❌ `new Date("2025-10-26")` causa timezone shift (muestra día anterior)
- ❌ `format(new Date(fecha), "dd/MM/yyyy")` cambia fecha en UTC-5
- ❌ `fecha.toISOString().split('T')[0]` suma/resta días por timezone
- ❌ Guardar input directo sin `formatDateForDB()` → hora 00:00:00 problemática

**Documentación completa:** `docs/GUIA-MANEJO-FECHAS-PROFESIONAL.md` ⭐

---

### 🚨 REGLA CRÍTICA #-5.8: SISTEMA DE DOCUMENTOS PENDIENTES (OBLIGATORIO)

**⚠️ AL implementar funcionalidades que requieren documentación posterior:**

1. **NUNCA BLOQUEAR** → Permitir guardar datos sin documentos obligatorios
2. **CREAR PENDIENTE** → Sistema automático de documentos_pendientes
3. **NOTIFICAR** → Banner visible en pestaña Documentos
4. **VINCULAR AUTO** → Detección inteligente por metadata al subir
5. **AUDITAR** → Registrar vinculación automática en audit_log

**Casos de uso:**

- ✅ Agregar fuente de pago sin carta de aprobación
- ✅ Crear negociación sin documentos del cliente
- ✅ Asignar vivienda pendiente de escrituras
- ✅ Registrar abono sin comprobante escaneado

**Componentes disponibles:**

```typescript
import { BannerDocumentosPendientes } from '@/modules/clientes/components/documentos-pendientes'

<BannerDocumentosPendientes
  clienteId={cliente.id}
  onSubirDocumento={(pendienteId, tipoDocumento) => {
    // Abrir modal de upload
  }}
/>
```

**Sistema automático:**

1. Trigger crea `documentos_pendientes` al guardar sin documento
2. Banner alerta en UI con prioridad visual
3. Usuario sube documento normal
4. Trigger detecta coincidencia por metadata
5. Vincula automáticamente y elimina pendiente
6. Auditoría registra vinculación

**Ventajas:**

- ✅ Flujo sin fricción (no bloquear)
- ✅ Rastreabilidad completa
- ✅ Vinculación inteligente
- ✅ Tiempo real con Supabase
- ✅ Extensible a notificaciones/recordatorios

**Documentación completa:** `docs/SISTEMA-DOCUMENTOS-PENDIENTES.md` ⭐

---

### 🚨 REGLA CRÍTICA #-5.7: MODALES GENÉRICOS CON THEMING DINÁMICO (OBLIGATORIO)

**⚠️ AL crear CUALQUIER modal reutilizable en múltiples módulos:**

#### 📐 Patrón OBLIGATORIO: Función de Estilos + Prop ModuleName

**Arquitectura correcta:**

```typescript
// 1. ARCHIVO DE ESTILOS (*.styles.ts)
import { type ModuleName } from '@/shared/config/module-themes'

const THEME_COLORS = {
  proyectos: {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    // ... más variantes
  },
  viviendas: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    text: 'text-orange-600 dark:text-orange-400',
    // ...
  },
  // ... resto de módulos
}

// ✅ FUNCIÓN que acepta moduleName
export const getMiModalStyles = (moduleName: ModuleName = 'proyectos') => {
  const colors = THEME_COLORS[moduleName] || THEME_COLORS.proyectos

  return {
    header: {
      container: `bg-gradient-to-r ${colors.gradient} px-4 py-3`,
      title: 'text-white font-bold',
    },
    content: {
      border: colors.border,
      text: colors.text,
    },
    // ... resto de estilos dinámicos
  } as const
}
```

```typescript
// 2. COMPONENTE MODAL (*.tsx)
import { type ModuleName } from '@/shared/config/module-themes'
import { getMiModalStyles } from './MiModal.styles'

interface MiModalProps {
  isOpen: boolean
  moduleName?: ModuleName  // ← OBLIGATORIO para modales genéricos
  onClose: () => void
}

export function MiModal({ isOpen, moduleName = 'proyectos', onClose }: MiModalProps) {
  // ✅ Generar estilos dinámicos
  const styles = getMiModalStyles(moduleName)

  return (
    <div className={styles.header.container}>
      {/* ... */}
    </div>
  )
}
```

```typescript
// 3. USO EN MÓDULOS
// Proyectos (verde)
<MiModal moduleName="proyectos" {...props} />

// Viviendas (naranja)
<MiModal moduleName="viviendas" {...props} />

// Clientes (cyan)
<MiModal moduleName="clientes" {...props} />
```

---

#### ✅ ELEMENTOS QUE DEBEN SER DINÁMICOS

**OBLIGATORIO cambiar por tema:**

- ✅ Gradientes de header/footer
- ✅ Colores de bordes
- ✅ Fondos de advertencias/alertas
- ✅ Colores de íconos
- ✅ Focus states (border, ring)
- ✅ Barras de progreso
- ✅ Botones primarios
- ✅ Links/hover states

**NO cambiar (mantener neutral):**

- ⚪ Textos en negro/gris (contenido)
- ⚪ Fondos blancos/grises (contenedores)
- ⚪ Botones secundarios (cancelar, cerrar)
- ⚪ Overlays/backdrops

---

#### 🚫 ERRORES COMUNES QUE NO REPETIR

**❌ INCORRECTO: Objeto estático con colores hardcoded**

```typescript
// ❌ NO HACER ESTO
export const miModalStyles = {
  header: 'bg-gradient-to-r from-orange-600 to-red-600', // ← Hardcoded
  icon: 'text-orange-600', // ← No es reutilizable
}
```

**✅ CORRECTO: Función con theming dinámico**

```typescript
// ✅ HACER ESTO
export const getMiModalStyles = (moduleName: ModuleName) => {
  const colors = THEME_COLORS[moduleName]
  return {
    header: `bg-gradient-to-r ${colors.gradient}`, // ← Dinámico
    icon: colors.text, // ← Reutilizable
  }
}
```

---

#### 🎨 CONFIGURACIÓN DE COLORES ESTÁNDAR

```typescript
const THEME_COLORS = {
  proyectos: {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    bg: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    textDark: 'text-green-900 dark:text-green-300',
    focusBorder: 'focus:border-green-500',
    focusRing: 'focus:ring-green-500/20',
    hover: 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
  },
  viviendas: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    // ... mismo patrón
  },
  clientes: {
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    // ... mismo patrón
  },
  negociaciones: {
    gradient: 'from-pink-600 via-purple-600 to-indigo-600',
    // ... mismo patrón
  },
  abonos: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    // ... mismo patrón
  },
  documentos: {
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    // ... mismo patrón
  },
  auditorias: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    // ... mismo patrón
  },
}
```

**Propiedades OBLIGATORIAS por módulo:**

- `gradient`: Gradiente de 3 colores para headers/botones
- `bg`: Color sólido de fondo
- `text`: Color de texto (con dark mode)
- `border`: Color de bordes (con dark mode)
- `bgLight`: Fondo claro para alertas/warnings
- `textDark`: Texto oscuro para títulos
- `focusBorder`: Border en focus de inputs
- `focusRing`: Ring en focus de inputs
- `hover`: Gradiente hover para botones

---

#### ✅ CHECKLIST DE VALIDACIÓN

Antes de aprobar un modal genérico:

- [ ] **Archivo de estilos usa función** `getXXXStyles(moduleName: ModuleName)`
- [ ] **Componente acepta prop** `moduleName?: ModuleName`
- [ ] **Todos los colores vienen de** `THEME_COLORS[moduleName]`
- [ ] **Dark mode incluido** en todos los colores dinámicos
- [ ] **Fallback a 'proyectos'** si moduleName no existe
- [ ] **Type-safe** con TypeScript (autocomplete funciona)
- [ ] **Probado visualmente** en al menos 3 módulos diferentes
- [ ] **Documentación creada** con ejemplos de uso

---

#### 📚 EJEMPLO COMPLETO DE REFERENCIA

**Modal de Reemplazo de Archivos:**

- Ubicación: `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.tsx`
- Estilos: `src/modules/documentos/components/modals/DocumentoReemplazarArchivoModal.styles.ts`
- Guía: `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md`
- Refactor: `docs/REFACTOR-MODAL-REEMPLAZO-THEMING.md`

**Beneficios logrados:**

- ✅ Un componente → 7 módulos soportados
- ✅ Reducción de código: 56% (800 → 350 líneas)
- ✅ Theming automático por módulo
- ✅ Type-safe con autocomplete
- ✅ Dark mode completo

**Documentación completa:** `docs/MODAL-REEMPLAZO-GENERICO-GUIA.md` ⭐

---

### 🚨 REGLA CRÍTICA #-5.5: SISTEMA MODULAR DE AUDITORÍAS (OBLIGATORIO)

**⚠️ AL implementar auditoría para CUALQUIER módulo o acción:**

#### 📐 Arquitectura del Sistema (Factory Pattern + Componentes Reutilizables)

```
src/modules/auditorias/components/
├── sections/                    # ✅ Componentes reutilizables
│   ├── AuditoriaHeader.tsx
│   ├── AuditoriaEstado.tsx
│   └── AuditoriaMetadata.tsx
├── renderers/                   # ✅ Renderers específicos
│   ├── proyectos/
│   │   ├── CreacionProyectoRenderer.tsx
│   │   ├── ActualizacionProyectoRenderer.tsx
│   │   └── index.ts
│   ├── [modulo]/               # ← CREAR AQUÍ nuevos renderers
│   ├── shared/
│   │   └── RendererGenerico.tsx
│   └── index.ts                # ← REGISTRAR en factory
└── DetalleAuditoriaModal.tsx
```

---

#### ✅ PROCESO PARA AGREGAR AUDITORÍA (15 min - 3 pasos)

**Paso 1: Crear Renderer**

```bash
# Ubicación
src/modules/auditorias/components/renderers/[modulo]/[Accion][Modulo]Renderer.tsx
```

**Plantilla OBLIGATORIA**:

```typescript
'use client'

import { Building2, MapPin, FileText, TrendingUp } from 'lucide-react'

interface [Accion][Modulo]RendererProps {
  metadata: any
  datosNuevos?: any
  datosAnteriores?: any
}

export function [Accion][Modulo]Renderer({ metadata, datosNuevos }: [Accion][Modulo]RendererProps) {
  const datos = {
    campo1: metadata.campo1 || datosNuevos?.campo1,
    campo2: metadata.campo2 || datosNuevos?.campo2,
  }

  return (
    <div className="space-y-3 px-4 py-3">
      <div className="space-y-2">
        {/* Campo 1 - SIEMPRE con label claro */}
        <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre del Campo:</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{datos.campo1}</p>
          </div>
        </div>

        {/* Campo condicional - Usar ternario con null */}
        {datos.campo2 ? (
          <div className="flex items-start gap-2 py-1.5 border-b border-gray-200 dark:border-gray-700">
            <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ubicación:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{datos.campo2}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
```

**Paso 2: Exportar**

```typescript
// renderers/[modulo]/index.ts
export { Creacion[Modulo]Renderer } from './Creacion[Modulo]Renderer'
```

**Paso 3: Registrar en Factory**

```typescript
// renderers/index.ts
import { Creacion[Modulo]Renderer } from './[modulo]'

const RENDERERS_MAP = {
  [modulo]: {
    CREATE: Creacion[Modulo]Renderer,
  },
}
```

---

#### 🎨 REGLAS DE DISEÑO UX (OBLIGATORIAS)

**Labels Claros (como formulario)**:

```typescript
// ✅ CORRECTO
<p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Nombre del Proyecto:</p>
<p className="text-sm font-bold text-gray-900 dark:text-white">{proyecto.nombre}</p>

// ❌ INCORRECTO - Sin label
<p>{proyecto.nombre}</p>
```

**Diseño Compacto Vertical**:

- ✅ Padding: `px-4 py-3`
- ✅ Spacing: `space-y-2`
- ✅ Iconos: `w-4 h-4` a la izquierda
- ✅ Sin scroll innecesario

**Renderizado Condicional**:

```typescript
// ✅ CORRECTO - Ternario con null
{campo ? <div>...</div> : null}

// ❌ INCORRECTO - && puede mostrar 0 o false
{campo && <div>...</div>}
```

**Iconos por Tipo**:

```typescript
Building2 // Nombre principal
MapPin // Ubicación
FileText // Descripción
TrendingUp // Estado
DollarSign // Dinero
User // Persona
Phone // Teléfono
Mail // Email
Home // Viviendas
```

---

#### 📊 UPDATE Renderer (Diff Visual)

Para actualizaciones, mostrar anterior → nuevo:

```typescript
export function Actualizacion[Modulo]Renderer({ datosNuevos, datosAnteriores }) {
  const camposModificados = []

  if (datosNuevos.campo !== datosAnteriores.campo) {
    camposModificados.push({
      campo: 'Nombre del Campo',
      anterior: datosAnteriores.campo,
      nuevo: datosNuevos.campo,
    })
  }

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Resumen */}
      <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          {camposModificados.length} campo(s) modificado(s)
        </p>
      </div>

      {/* Diff por campo */}
      {camposModificados.map((cambio, i) => (
        <div key={i} className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">{cambio.campo}:</p>

          {/* Anterior (rojo) */}
          <div className="px-2 py-1 rounded bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">Anterior:</p>
            <p className="text-sm text-red-900 dark:text-red-100 line-through">{cambio.anterior}</p>
          </div>

          {/* Nuevo (verde) */}
          <div className="px-2 py-1 rounded bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400">Nuevo:</p>
            <p className="text-sm text-green-900 dark:text-green-100 font-semibold">{cambio.nuevo}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

#### 🚫 PROHIBIDO / ✅ REQUERIDO

**PROHIBIDO:**

- ❌ Omitir labels en campos
- ❌ Usar && para renderizado condicional
- ❌ Componentes pesados que generen scroll
- ❌ Grids complejos
- ❌ Hardcodear colores sin dark mode
- ❌ Animaciones en renderers

**REQUERIDO:**

- ✅ Labels claros tipo formulario
- ✅ Diseño compacto vertical (lista)
- ✅ Dark mode en TODOS los elementos
- ✅ Iconos pequeños (w-4 h-4)
- ✅ Ternario con null para condicionales
- ✅ Truncate en textos largos

---

#### ✅ CHECKLIST

- [ ] Renderer en `renderers/[modulo]/[Accion]Renderer.tsx`
- [ ] Labels claros en todos los campos
- [ ] Diseño compacto (px-4 py-3, space-y-2)
- [ ] Iconos apropiados (w-4 h-4)
- [ ] Dark mode completo
- [ ] Ternario para condicionales
- [ ] Exportado en barrel file
- [ ] Registrado en factory
- [ ] Probado con datos reales
- [ ] Validado dark mode y responsive

**Documentación**: `docs/SISTEMA-MODULAR-AUDITORIAS.md` ⭐
**Ejemplo**: `src/modules/auditorias/components/renderers/proyectos/CreacionProyectoRenderer.tsx`

---

### 🚨 REGLA CRÍTICA #-5: SINCRONIZACIÓN AUTOMÁTICA DE TIPOS DB (OBLIGATORIO)

**⚠️ DESPUÉS de CUALQUIER cambio en la base de datos (migración, nueva tabla, nueva columna):**

1. **EJECUTAR** → `npm run types:generate` (regenera tipos TypeScript desde schema real)
2. **VERIFICAR** → `npm run type-check` (valida que no haya errores)
3. **NUNCA** → Hardcodear nombres de tablas/campos sin verificar tipos
4. **NUNCA** → Usar `any` para evitar errores de tipos
5. **SIEMPRE** → Confiar en autocomplete de TypeScript para nombres exactos

**Workflow correcto:**

```bash
# 1. Ejecutar migración SQL
npm run db:exec supabase/migrations/nueva-tabla.sql

# 2. Sincronizar tipos TypeScript (OBLIGATORIO)
npm run types:generate

# 3. Verificar que no haya errores
npm run type-check
```

**Ventajas del sistema:**

- ✅ Tipos generados automáticamente desde schema real de Supabase
- ✅ Detecta nombres exactos de tablas y columnas (no asumir)
- ✅ Autocomplete completo en VS Code
- ✅ Previene errores de referencia (`documentos` vs `documentos_proyecto`)
- ✅ Sincronización BD ↔ TypeScript ↔ Código

**Errores CRÍTICOS que NO repetir:**

- ❌ Usar nombres incorrectos: `documentos` → ✅ Verificar: `documentos_proyecto`
- ❌ Asumir `fecha_emision` → ✅ Consultar schema: `fecha_documento`
- ❌ Olvidar regenerar tipos después de migración → ✅ `npm run types:generate`
- ❌ Editar manualmente `database.types.ts` → ✅ Siempre regenerar con script

**Documentación completa:** `docs/SISTEMA-SINCRONIZACION-SCHEMA-DB.md` ⭐

**Scripts disponibles:**

```bash
npm run types:generate     # Genera tipos desde Supabase
npm run db:sync           # Genera tipos + valida TypeScript
npm run type-check        # Verifica errores de compilación
```

---

### 🚨 REGLA CRÍTICA #-4: PROYECTOS COMO PLANTILLA ESTÁNDAR (OBLIGATORIO)

**⚠️ AL crear CUALQUIER módulo nuevo (Clientes, Viviendas, Contratos, etc.):**

1. **USAR** → Módulo de Proyectos como plantilla base OBLIGATORIA
2. **COPIAR** → Estructura, tamaños, fuentes, espaciado, animaciones EXACTAS
3. **PERSONALIZAR** → SOLO colores (usando `moduleThemes`) y contenido de cards
4. **NUNCA** → Inventar nuevos tamaños, padding o distribución
5. **VALIDAR** → Con checklist de `docs/PLANTILLA-ESTANDAR-MODULOS.md`

**Plantilla de referencia:**

```
src/modules/proyectos/
├── proyectos-page-main.tsx      # ⭐ Orquestador (copiar estructura)
├── ProyectosHeaderPremium.tsx   # ⭐ Header (p-6, rounded-2xl, text-2xl)
├── ProyectosMetricasPremium.tsx # ⭐ 4 métricas (p-4, gap-3, hover scale)
├── ProyectosFiltrosPremium.tsx  # ⭐ Filtros (sticky, flex horizontal, py-2)
└── proyectos-card.tsx           # ⭐ Card (p-4, rounded-xl, hover y: -2)
```

**Lo que NO cambia:** Tamaños, padding, fuentes, distribución, animaciones
**Lo que SÍ cambia:** Colores (con `moduleThemes[moduleName]`) y estructura interna de cards

**Documentación completa:** `docs/PLANTILLA-ESTANDAR-MODULOS.md` ⭐

**Errores comunes que NO repetir:**

- ❌ Usar `p-8` en header → ✅ Usar `p-6` (estándar de Proyectos)
- ❌ Título `text-3xl` → ✅ Título `text-2xl` (estándar compacto)
- ❌ Grid layout en filtros → ✅ Flex horizontal (estándar sticky)
- ❌ Crear componente desde cero → ✅ Copiar de Proyectos y adaptar

---

### 🚨 REGLA CRÍTICA #-3: SISTEMA DE THEMING MODULAR (OBLIGATORIO)

**⚠️ AL crear CUALQUIER componente reutilizable en diferentes módulos:**

1. **NUNCA** → Hardcodear colores (`border-green-200`, `bg-blue-500`)
2. **SIEMPRE** → Usar sistema de theming con prop `moduleName`
3. **IMPORTAR** → `moduleThemes` desde `@/shared/config/module-themes`

**Patrón OBLIGATORIO:**

```tsx
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface MiComponenteProps {
  moduleName?: ModuleName // 👈 OBLIGATORIO para componentes compartidos
}

export function MiComponente({ moduleName = 'proyectos' }: MiComponenteProps) {
  const theme = moduleThemes[moduleName] // 👈 Tema dinámico

  return (
    <div className={theme.classes.bg.light}>
      <button className={theme.classes.button.primary}>Acción</button>
    </div>
  )
}
```

**Uso en diferentes módulos:**

```tsx
// En Proyectos (verde/esmeralda)
<MiComponente moduleName="proyectos" />

// En Clientes (cyan/azul)
<MiComponente moduleName="clientes" />

// En Viviendas (naranja/ámbar)
<MiComponente moduleName="viviendas" />
```

**Ventajas:**

- ✅ Un componente, múltiples temas
- ✅ Type-safe con TypeScript
- ✅ Cambios centralizados
- ✅ No duplicar código
- ✅ Fácil agregar módulos nuevos

**Documentación completa:** `docs/SISTEMA-THEMING-MODULAR.md` ⭐

**Errores comunes que NO repetir:**

- ❌ `className="bg-green-500"` → ✅ `className={theme.classes.bg.light}`
- ❌ Duplicar componente para cada módulo → ✅ Usar prop `moduleName`
- ❌ Condicionales de color → ✅ Sistema de theming automático

---

### 🚨 REGLA CRÍTICA #-2: EJECUCIÓN DE SQL EN SUPABASE (NUNCA COPIAR/PEGAR)

**⚠️ CUANDO necesites ejecutar CUALQUIER script SQL en Supabase:**

1. **NUNCA** → Copiar/pegar manualmente en Supabase SQL Editor
2. **SIEMPRE** → Usar script automatizado desde terminal
3. **COMANDO** → `npm run db:exec <archivo.sql>` o `node ejecutar-sql.js <archivo.sql>`

**Métodos disponibles (en orden de preferencia):**

```bash
# Método 1: NPM Script (RECOMENDADO) ⭐
npm run db:exec supabase/storage/mi-archivo.sql
npm run db:exec:storage-viviendas  # Alias predefinido

# Método 2: Node.js directo
node ejecutar-sql.js supabase/migrations/mi-migracion.sql

# Método 3: PowerShell (requiere psql)
.\ejecutar-sql.ps1 -SqlFile "supabase\policies\mi-policy.sql"
```

**Ventajas del script automatizado:**

- ✅ Ejecución en 1 comando
- ✅ Logs detallados con tiempo de ejecución
- ✅ Manejo de errores robusto
- ✅ No requiere abrir navegador
- ✅ Reproducible y auditable
- ✅ Integrable en CI/CD

**Casos de uso:**

```bash
# Políticas RLS de Storage
npm run db:exec supabase/storage/storage-documentos-viviendas.sql

# Migraciones
node ejecutar-sql.js supabase/migrations/001_crear_tabla.sql

# Seeds de datos
node ejecutar-sql.js supabase/seeds/categorias-sistema.sql

# Verificaciones
node ejecutar-sql.js supabase/verification/DIAGNOSTICO.sql
```

**Documentación completa:** `docs/EJECUTAR-SQL-DIRECTAMENTE.md`

**Error común que NO repetir:**

- ❌ "Copia este SQL y pégalo en Supabase SQL Editor"
- ✅ "Ejecuta: `npm run db:exec supabase/storage/mi-archivo.sql`"

---

### 🚨 REGLA CRÍTICA #-1: UBICACIÓN DE RUTAS NEXT.JS (VERIFICAR PRIMERO)

**⚠️ ANTES de crear CUALQUIER archivo de ruta/página (`page.tsx`, `layout.tsx`):**

1. **CONSULTAR** → `.github/PROYECTO-ESTRUCTURA.md` (ubicación correcta de App Directory) ⭐
2. **VERIFICAR** → App Directory está en `src/app/` (NO en `app/` raíz)
3. **CREAR** → Rutas SIEMPRE en `src/app/[modulo]/[subruta]/page.tsx`
4. **NUNCA** → Crear carpeta `app/` en raíz del proyecto
5. **VALIDAR** → Después de crear, verificar que NO exista `app/` en raíz

**Error común que NO repetir:**

- ❌ `app/viviendas/nueva/page.tsx` → ✅ `src/app/viviendas/nueva/page.tsx`
- ❌ Crear `app/` en raíz → ✅ Solo usar `src/app/`
- ❌ Asumir ubicación sin verificar → ✅ Consultar PROYECTO-ESTRUCTURA.md

**Comando de verificación obligatorio:**

```powershell
# Antes de crear ruta, verificar que app/ NO existe en raíz
if (Test-Path "app/") { Write-Host "ERROR: app/ existe en raíz" }
```

---

### �� REGLA CRÍTICA #0: SEPARACIÓN DE RESPONSABILIDADES (INVIOLABLE)

**⚠️ ESTA REGLA ES ABSOLUTA Y NO NEGOCIABLE ⚠️**

**TODA implementación, módulo, componente o funcionalidad DEBE cumplir CON:**

#### 📐 **ARQUITECTURA OBLIGATORIA (PATRÓN ESTRICTO):**

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [Componente].tsx              # ← SOLO UI PRESENTACIONAL (< 150 líneas)
│   ├── [Componente].styles.ts        # ← SOLO estilos centralizados
│   └── index.ts
├── hooks/
│   ├── use[Componente].ts            # ← SOLO LÓGICA DE NEGOCIO
│   └── index.ts
├── services/
│   └── [nombre].service.ts           # ← SOLO llamadas API/DB
├── types/
│   └── index.ts                      # ← SOLO tipos TypeScript
└── utils/
    └── [helpers].ts                  # ← SOLO funciones puras
```

#### 🚫 **PROHIBICIONES ABSOLUTAS:**

```typescript
// ❌ PROHIBIDO: Lógica en componentes
export function MiComponente() {
  const [data, setData] = useState([])

  useEffect(() => {
    // ❌ NUNCA: fetch, cálculos complejos, transformaciones
    fetch('/api/data').then(setData)
  }, [])

  const valorCalculado = data.reduce((acc, item) => acc + item.valor, 0) // ❌ NUNCA

  return <div>{valorCalculado}</div>
}

// ❌ PROHIBIDO: Estilos inline extensos
<div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300">
  {/* ❌ NUNCA: strings de Tailwind > 80 caracteres */}
</div>

// ❌ PROHIBIDO: Servicios en componentes
export function MiComponente() {
  const handleSubmit = async () => {
    await supabase.from('tabla').insert(data) // ❌ NUNCA: llamadas directas a DB
  }
}
```

#### ✅ **IMPLEMENTACIÓN CORRECTA (OBLIGATORIA):**

```typescript
// ✅ 1. HOOK CON LÓGICA (hooks/useMiComponente.ts)
export function useMiComponente() {
  const [data, setData] = useState([])
  const { fetchData } = useMiComponenteService() // ← Service separado

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  const valorCalculado = useMemo(() =>
    data.reduce((acc, item) => acc + item.valor, 0),
    [data]
  )

  return { data, valorCalculado }
}

// ✅ 2. COMPONENTE PRESENTACIONAL (components/MiComponente.tsx)
export function MiComponente() {
  const { data, valorCalculado } = useMiComponente() // ← Hook con lógica

  return (
    <div className={styles.container}> {/* ← Estilos centralizados */}
      <span className={styles.valor}>{valorCalculado}</span>
    </div>
  )
}

// ✅ 3. ESTILOS CENTRALIZADOS (components/MiComponente.styles.ts)
export const miComponenteStyles = {
  container: 'flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30',
  valor: 'text-xl font-bold text-blue-600 dark:text-blue-400'
}

// ✅ 4. SERVICE CON API/DB (services/miComponente.service.ts)
export class MiComponenteService {
  async fetchData() {
    const { data } = await supabase.from('tabla').select('*')
    return data
  }
}
```

#### 📏 **LÍMITES ESTRICTOS:**

- **Componente `.tsx`**: Dos niveles según responsabilidad:
  - **Componente hoja** (card, badge, input, field, botón) → renderiza una sola unidad de UI → ≤ **150 líneas**
  - **Componente orquestador** (tab, page, layout, modal complejo con formulario) → compone sub-componentes + modales + estados loading/empty/error → ≤ **400 líneas**
  - **Diagnóstico rápido**: Si el componente tiene `useState`/`useEffect` con lógica de negocio → mover a hook. Si tiene sub-componentes inline (funciones de componente definidas dentro del mismo archivo) → extraer a archivos separados
- **Hook `use*.ts`**: Dos niveles según tipo:
  - **Hook de feature / leaf** (`useManzanasEditables`, `useDetectarCambios`, etc.) → hace **una sola cosa** → ≤ **200 líneas**
  - **Hook orquestador de flujo/página** (`useEditarProyecto`, `useNuevoProyecto`, etc.) → solo compone sub-hooks y gestiona estado de wizard → ≤ **600 líneas**
  - **Diagnóstico rápido**: Si el hook contiene llamadas a DB directas (`supabase`) o lógica de negocio no delegada → dividir, sin importar el tamaño
- **Service `.service.ts`**: Máximo **500 líneas** (si excede → dividir por dominio, ej: `negociaciones-crud.service.ts` + `negociaciones-financiero.service.ts`)
- **Estilos `.styles.ts`**: Sin límite (pero organizados por secciones)
- **String de Tailwind inline**: Máximo **80 caracteres** (si excede → extraer a `.styles.ts`)

#### 🔍 **CHECKLIST DE VALIDACIÓN (antes de commit):**

- [ ] ¿El componente tiene useState/useEffect con lógica compleja? → ❌ **Mover a hook**
- [ ] ¿El componente tiene fetch/axios/supabase? → ❌ **Mover a service**
- [ ] ¿El componente tiene cálculos/transformaciones? → ❌ **Mover a hook con useMemo**
- [ ] ¿El componente tiene strings de Tailwind > 80 chars? → ❌ **Mover a .styles.ts**
- [ ] ¿El componente hoja tiene > 150 líneas? → ❌ **Refactorizar**
- [ ] ¿El componente orquestador tiene > 400 líneas? → ❌ **Extraer sub-componentes o modales**
- [ ] ¿El componente tiene sub-componentes definidos inline? → ❌ **Extraer a archivos separados**
- [ ] ¿Hay código duplicado entre componentes? → ❌ **Extraer a shared/utils**

#### 🎯 **BENEFICIOS INNEGOCIABLES:**

1. **Mantenibilidad**: Cambios localizados, bajo riesgo
2. **Testabilidad**: Hooks y services testeables independientemente
3. **Reusabilidad**: Lógica compartible entre componentes
4. **Escalabilidad**: Crecimiento ordenado sin "spaghetti code"
5. **Legibilidad**: Código limpio y autodocumentado

#### ⚡ **CONSECUENCIAS DE VIOLACIÓN:**

- ❌ **Code review rechazado**
- ❌ **Refactorización obligatoria antes de merge**
- ❌ **Deuda técnica que bloquea nuevas features**

**📌 REGLA DE ORO:** Si te preguntas "¿Esto va en el componente o en el hook?" → **SIEMPRE en el hook**

---

### 🚨 REGLA CRÍTICA #1: VALIDACIÓN DE NOMBRES DE CAMPOS

**⚠️ ANTES de escribir CUALQUIER código que interactúe con la base de datos:**

1. **EJECUTAR** → `npm run types:generate` si hubo cambios recientes en BD ⭐
2. **USAR AUTOCOMPLETE** → TypeScript sugerirá nombres exactos de tablas/columnas
3. **CONSULTAR** → `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` (fuente única de verdad)
4. **VERIFICAR** → Nombres EXACTOS en tipos TypeScript generados
5. **CONFIRMAR** → Estados permitidos en sección de ENUMS
6. **NUNCA ASUMIR** → Siempre verificar, nunca inventar nombres

**Workflow correcto:**

```typescript
// 1. Regenerar tipos si es necesario
// npm run types:generate

// 2. Usar autocomplete de TypeScript
const { data } = await supabase
  .from('documentos_proyecto') // ← TypeScript autocompleta nombre correcto
  .update({
    fecha_documento: '2025-01-01', // ← TypeScript sugiere campos reales
    titulo: 'Nuevo título',
  })

// 3. TypeScript detectará errores inmediatamente
// ❌ .from('documentos') → Error: tabla no existe
// ❌ fecha_emision → Error: campo no existe
```

**Errores comunes que NO repetir:**

- ❌ `from('documentos')` → ✅ `from('documentos_proyecto')` (verificar con autocomplete)
- ❌ `fecha_emision` → ✅ `fecha_documento` (verificar en schema)
- ❌ `estado = 'En Proceso'` → ✅ `estado = 'Activa'` (negociaciones)
- ❌ `estado = 'reservada'` → ✅ `estado = 'Asignada'` (viviendas)
- ❌ `vivienda_precio` → ✅ `vivienda.valor_base`
- ❌ `cliente.nombre` → ✅ `cliente.nombres`

**📋 Consultar checklist**: `docs/DESARROLLO-CHECKLIST.md`

---

### ⚠️ REGLA DE ORO: SEPARACIÓN DE RESPONSABILIDADES

**NUNCA mezclar lógica con UI. SIEMPRE separar en:**

1. **Hooks** (`use*.ts`) → Lógica de negocio
2. **Componentes** (`*.tsx`) → UI presentacional pura
3. **Estilos** (`*.styles.ts`) → Clases de Tailwind centralizadas
4. **Servicios** (`*.service.ts`) → Lógica de API/DB
5. **Stores** (`*.store.ts`) → Estado global

---

### 🎨 REGLA CRÍTICA #2: DISEÑO VISUAL ESTANDARIZADO (COMPACTO)

**⚠️ AL crear CUALQUIER módulo de UI:**

1. **CONSULTAR** → `docs/ESTANDAR-DISENO-VISUAL-MODULOS.md` (referencia de diseño) ⭐
2. **COPIAR** → Estructura exacta de módulo de Viviendas como base (referencia compacta)
3. **PERSONALIZAR** → Solo colores según paleta del módulo
4. **VALIDAR** → Header, métricas y filtros idénticos en tamaño/distribución
5. **VERIFICAR** → Glassmorphism, animaciones y dark mode completos

**Elementos OBLIGATORIOS** (copiar estándar compacto):

```typescript
// 1. HEADER HERO (rounded-2xl, p-6, gradiente de 3 colores - COMPACTO)
<motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 dark:from-[COLOR]-700 dark:via-[COLOR]-700 dark:to-[COLOR]-800 p-6 shadow-2xl shadow-[COLOR]-500/20">
  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]" />
  <div className="relative z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-white">Título</h1>
          <p className="text-[COLOR]-100 dark:text-[COLOR]-200 text-xs">Descripción • Contexto</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium">
          <Icon className="w-3.5 h-3.5" />
          {count} Items
        </span>
        <motion.button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg">
          <Plus className="w-4 h-4" />
          Acción
        </motion.button>
      </div>
    </div>
  </div>
</motion.div>

// 2. MÉTRICAS (4 cards, grid gap-3, p-4 - COMPACTO)
<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[COLOR]-500/20 to-[COLOR]-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[COLOR]-500 to-[COLOR]-600 flex items-center justify-center shadow-lg shadow-[COLOR]-500/50">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xl font-bold bg-gradient-to-br from-[COLOR]-600 via-[COLOR]-600 to-[COLOR]-600 bg-clip-text text-transparent">
          {value}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium">Label</p>
      </div>
    </div>
  </motion.div>
</motion.div>

// 3. FILTROS (sticky, p-3, horizontal flex - COMPACTO)
<motion.div className="sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-[COLOR]-500/10">
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <label className="sr-only">Buscar</label>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm placeholder:text-gray-400" placeholder="Buscar..." />
    </div>
    <select className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-[COLOR]-500 focus:ring-2 focus:ring-[COLOR]-500/20 transition-all text-sm min-w-[180px]">
      <option>Todos</option>
    </select>
  </div>
  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{count} resultados</p>
  </div>
</motion.div>
```

**Archivo de estilos** (`styles/[modulo].styles.ts`):

```typescript
export const moduloStyles = {
  container: { page: '...', content: 'py-6 space-y-4' }, // Compacto
  header: { container: 'p-6 rounded-2xl', ... },          // Compacto
  metricas: { grid: 'gap-3', card: 'p-4 rounded-xl', ... }, // Compacto
  filtros: { container: 'p-3 rounded-xl', grid: 'flex gap-2', ... }, // Compacto
}
```

**Paleta de colores por módulo**:

- **Viviendas**: Naranja/Ámbar (`from-orange-600 via-amber-600 to-yellow-600`) - ⭐ REFERENCIA COMPACTA
- **Auditorías**: Azul/Índigo/Púrpura (`from-blue-600 via-indigo-600 to-purple-600`)
- **Proyectos**: Verde/Esmeralda (`from-green-600 via-emerald-600 to-teal-600`)
- **Clientes**: Cyan/Azul (`from-cyan-600 via-blue-600 to-indigo-600`)
- **Negociaciones**: Rosa/Púrpura (`from-pink-600 via-purple-600 to-indigo-600`)
- **Abonos**: Azul/Índigo (`from-blue-600 via-indigo-600 to-purple-600`)
- **Documentos**: Rojo/Rosa (`from-red-600 via-rose-600 to-pink-600`)

**Dimensiones CRÍTICAS (estándar compacto)**:

- Header: `p-6 rounded-2xl`, título `text-2xl`, icon `w-10 h-10`, badge `px-3 py-1.5`
- Métricas: `p-4 rounded-xl gap-3`, icon `w-10 h-10`, valor `text-xl`
- Filtros: `p-3 rounded-xl`, layout `flex gap-2`, inputs `py-2`, labels `sr-only`
- Espaciado: `py-6 space-y-4` (30% menos espacio vertical)

**Errores comunes que NO repetir:**

- ❌ Usar dimensiones antiguas (p-8, text-3xl) → ✅ Usar estándar compacto
- ❌ Grid de filtros → ✅ Flex horizontal con gap-2
- ❌ Labels visibles en filtros → ✅ Labels sr-only (accesibilidad)
- ❌ No usar glassmorphism (`backdrop-blur-xl`) → ✅ Aplicar en todos los cards
- ❌ Olvidar animaciones hover → ✅ `whileHover={{ scale: 1.02, y: -4 }}`
- ❌ No usar gradientes de 3 colores → ✅ `from-[COLOR] via-[COLOR] to-[COLOR]`
- ❌ Olvidar pattern overlay → ✅ `bg-grid-white/10`

---

## 📁 Estructura OBLIGATORIA de Módulos

Al crear cualquier módulo nuevo, SEGUIR esta estructura:

```
src/modules/[nombre-modulo]/
├── components/
│   ├── [componente].tsx              # UI presentacional
│   ├── [componente].styles.ts        # Estilos centralizados
│   ├── tabs/                         # Si usa tabs
│   │   ├── [nombre]-tab.tsx
│   │   └── index.ts                  # Barrel export
│   └── index.ts                      # Barrel export
├── hooks/
│   ├── use[Modulo].ts                # Hook principal
│   ├── use[Componente].ts            # Hook por componente
│   └── index.ts                      # Barrel export
├── services/
│   └── [nombre].service.ts           # API/DB logic
├── store/
│   └── [nombre].store.ts             # Zustand store
├── types/
│   └── index.ts                      # TypeScript types
├── styles/
│   ├── classes.ts                    # Shared styles
│   ├── animations.ts                 # Framer Motion
│   └── index.ts                      # Barrel export
└── README.md                         # Módulo docs
```

**Referencia**: Ver `src/modules/proyectos/` como ejemplo perfecto

---

## ✅ Checklist OBLIGATORIO por Componente

### ANTES de empezar:

### ANTES de empezar:

- [ ] **Ejecuté** `npm run types:generate` si hubo cambios en BD recientemente
- [ ] **Consulté** `docs/DATABASE-SCHEMA-REFERENCE.md` para nombres de campos
- [ ] **Verifiqué** nombres exactos de columnas y tablas con autocomplete TypeScript
- [ ] **Confirmé** formato de estados/enums
- [ ] **Revisé** `docs/TEMPLATE-MODULO-ESTANDAR.md` para estructura
- [ ] **Importé** componentes de `@/shared/components/layout`
- [ ] **Revisé** checklist completo en `docs/DESARROLLO-CHECKLIST.md`

### Durante desarrollo:

- [ ] **Usar ModuleContainer** como contenedor principal
- [ ] **Usar ModuleHeader** para encabezado
- [ ] **Usar Card** para secciones de contenido
- [ ] **Usar Button** para acciones (NO crear botones custom)
- [ ] **Usar Badge** para etiquetas
- [ ] **Usar LoadingState/EmptyState/ErrorState** para estados de UI
- [ ] Lógica en hook separado (`use*.ts`)
- [ ] Componente hoja < 150 líneas, orquestador < 400 líneas
- [ ] `useMemo` para valores calculados
- [ ] `useCallback` para funciones como props
- [ ] Tipos TypeScript estrictos (no `any`)
- [ ] Imports organizados (React → Next → External → Shared → Local → Hooks → Services → Types)
- [ ] Barrel export (`index.ts`) en carpeta
- [ ] Console.log para debugging de errores
- [ ] **Modo oscuro verificado** en todos los elementos custom
- [ ] **Responsive verificado** (móvil, tablet, desktop)
- [ ] **Autocomplete TypeScript usado** para nombres de tablas/campos

---

### 🚨 REGLA CRÍTICA #3: CLIENTE SUPABASE — IMPORT ÚNICO (OBLIGATORIO)

**⚠️ AL importar el cliente de Supabase en CUALQUIER archivo:**

1. **SIEMPRE** → `import { supabase } from '@/lib/supabase/client'`
2. **NUNCA** → `import { createClient } from '@supabase/supabase-js'` (rompe SSR)
3. **NUNCA** → Crear instancias nuevas de supabase en código de negocio
4. **SERVER** → Para Server Components/API Routes usar `createServerClient` de `@/lib/supabase/server`

**Correcto:**

```typescript
// ✅ Client-side (services, hooks, componentes 'use client')
import { supabase } from '@/lib/supabase/client'

// ✅ Server-side (Server Components, API Routes, middleware)
import { createServerClient } from '@/lib/supabase/server'
```

**Incorrecto:**

```typescript
// ❌ NUNCA importar directo del paquete
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key) // ← NO HACER

// ❌ NUNCA crear instancias sueltas
const client = createBrowserClient(url, key) // ← NO HACER
```

---

### 🚨 REGLA CRÍTICA #4: MANEJO DE ERRORES — PATRÓN SERVICE → HOOK → TOAST (OBLIGATORIO)

**⚠️ AL implementar error handling en CUALQUIER flujo:**

#### 📐 Flujo ESTÁNDAR de errores (3 capas):

```
Service (.service.ts)  →  Hook (use*.ts)  →  UI (.tsx)
   logger.error()         try/catch           toast.error()
   throw Error            mutación RQ         mensaje al usuario
```

#### 1. SERVICE: Loguear + Lanzar

```typescript
// ✅ CORRECTO: Service loguea y lanza
async function crearCliente(datos: CrearClienteDTO) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(datos)
    .select()
    .single()

  if (error) {
    logger.error('❌ Error creando cliente:', error)
    throw new Error(`Error al crear cliente: ${error.message}`)
  }

  return data
}
```

**Reglas del Service:**

- ✅ Loguear con `logger.error()` ANTES de lanzar (para debugging)
- ✅ `throw new Error()` con mensaje descriptivo (para el usuario)
- ❌ NO mostrar toast (no es responsabilidad del service)
- ❌ NO retornar `null` silenciosamente (oculta errores)

#### 2. HOOK: Capturar con React Query

```typescript
// ✅ CORRECTO: Hook maneja con useMutation
const crearMutation = useMutation({
  mutationFn: (datos: CrearClienteDTO) => clienteService.crearCliente(datos),
  onSuccess: () => {
    toast.success('Cliente creado exitosamente')
    queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
  },
  onError: (error: Error) => {
    toast.error('Error al crear cliente', {
      description: error.message,
    })
  },
})
```

**Reglas del Hook:**

- ✅ `onSuccess` → `toast.success()` + invalidar cache
- ✅ `onError` → `toast.error()` con `error.message`
- ❌ NO hacer try/catch manual alrededor de `mutateAsync` (React Query lo maneja)
- ❌ NO duplicar `logger.error()` (el service ya logueó)

#### 3. UI: Solo llamar al hook

```typescript
// ✅ CORRECTO: Componente solo invoca
<Button onClick={() => crearMutation.mutate(datos)}>
  Crear
</Button>
```

**Toast library:** `import { toast } from 'sonner'` (ÚNICA librería de notificaciones)

#### ⚠️ Excepción: Funciones que NO deben bloquear

```typescript
// ✅ Para queries que retornan datos o null (no bloquean flujo)
async function obtenerCliente(id: string): Promise<Cliente | null> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Cliente
  } catch (error) {
    logger.error('Error obteniendo cliente:', error)
    return null // ← OK en queries de lectura
  }
}
```

---

### 🚨 REGLA CRÍTICA #5: REACT QUERY — CONVENCIONES (OBLIGATORIO)

**⚠️ AL trabajar con React Query (TanStack Query) en CUALQUIER módulo:**

#### 1. Query Keys — Factory Pattern OBLIGATORIO

```typescript
// ✅ CORRECTO: Factory en useXxxQuery.ts
export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (filtros?: Record<string, unknown>) =>
    [...clientesKeys.lists(), { filtros }] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientesKeys.details(), id] as const,
}

// ❌ INCORRECTO: Strings sueltos
queryKey: ['clientes']
queryKey: ['clientes-lista']
queryKey: `clientes-${id}`
```

#### 2. Ubicación — Archivo separado `use[Modulo]Query.ts`

```
src/modules/[modulo]/hooks/
├── use[Modulo]Query.ts       # ← Queries + Mutations + Keys (React Query)
├── use[Modulo]List.ts        # ← Lógica UI de lista (filtros, modales, selección)
├── use[Modulo]Detail.ts      # ← Lógica UI de detalle
└── index.ts                  # ← Barrel export
```

**Reglas:**

- ✅ `use[Modulo]Query.ts` → SOLO `useQuery`, `useMutation`, query keys
- ✅ `use[Modulo]List.ts` → Lógica de UI que CONSUME los queries
- ❌ NO mezclar queries con lógica de UI (modales, filtros, estados)

#### 3. Invalidación de Cache

```typescript
// ✅ CORRECTO: Invalidar con factory keys
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: clientesKeys.lists() })
  // Si afecta otro módulo:
  queryClient.invalidateQueries({ queryKey: viviendasKeys.lists() })
}

// ❌ INCORRECTO: Strings hardcodeados
queryClient.invalidateQueries({ queryKey: ['clientes'] })
queryClient.invalidateQueries(['lista-clientes'])
```

#### 4. Módulos con factory keys ya definidas (referencia)

```typescript
// Ya existen — USAR estos:
import { abonosKeys } from '@/modules/abonos/hooks/useAbonosQuery'
import { clientesKeys } from '@/modules/clientes/hooks/useClientesQuery'
import { documentosKeys } from '@/modules/documentos/hooks/useDocumentosQuery'
import { proyectosKeys } from '@/modules/proyectos/hooks/useProyectosQuery'
import { viviendasKeys } from '@/modules/viviendas/hooks/useViviendasQuery'
import { renunciasKeys } from '@/modules/renuncias/hooks/useRenunciasQuery'
```

---

### 🚨 REGLA CRÍTICA #6: `eslint-disable` — POLÍTICA DE USO (OBLIGATORIO)

**⚠️ AL considerar usar `eslint-disable` en CUALQUIER archivo:**

#### ✅ PERMITIDO (infraestructura):

```typescript
// ✅ Archivos de logger (necesitan console.* por definición)
// src/lib/utils/logger.ts
/* eslint-disable no-console, no-restricted-syntax */

// ✅ Scripts de Node.js (ya excluidos por ESLint config)
// scripts/**/*
```

#### ❌ PROHIBIDO (código de negocio):

```typescript
// ❌ NUNCA en services
/* eslint-disable @typescript-eslint/no-explicit-any */ // ← TIPAR CORRECTAMENTE

// ❌ NUNCA en hooks
// eslint-disable-next-line no-console
console.error('Error:', error) // ← USAR logger.error()

// ❌ NUNCA en componentes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = result as any // ← CREAR TYPE CORRECTO
```

#### 🔧 Alternativas en vez de `eslint-disable`:

| En vez de esto...                | Hacer esto                                            |
| -------------------------------- | ----------------------------------------------------- |
| `eslint-disable no-console`      | `import { logger } from '@/lib/utils/logger'`         |
| `eslint-disable no-explicit-any` | Crear interface/type correcto                         |
| `as any` en supabase.rpc         | `npm run types:generate` (regenerar tipos)            |
| `as any` en .insert()            | Crear tipo `InsertData` separado de campos computados |
| `as any` en joins                | Usar `satisfies` o type assertion específica          |

**Regla de oro:** Si necesitas `eslint-disable` en código de negocio, el problema está en el código, no en ESLint.

---

## 🚫 PROHIBIDO

❌ **USAR `new Date()` DIRECTO** para parsear/formatear fechas (usar funciones de `date.utils.ts`)
❌ **`fecha.toISOString().split('T')[0]`** para fecha actual (usar `getTodayDateString()`)
❌ **`format(new Date(fecha), "dd/MM/yyyy")`** con date-fns (usar `formatDateShort(fecha)`)
❌ **Guardar input directo sin `formatDateForDB()`** → causa timezone shift
❌ **HARDCODEAR COLORES en componentes compartidos** (usar `moduleThemes` con prop `moduleName`)
❌ **COPIAR/PEGAR SQL en Supabase SQL Editor** (usar `npm run db:exec <archivo.sql>`)
❌ **OLVIDAR SINCRONIZAR TIPOS** después de migración (ejecutar `npm run types:generate`)
❌ **EDITAR MANUALMENTE database.types.ts** (siempre regenerar con script oficial)
❌ **VIOLAR SEPARACIÓN DE RESPONSABILIDADES** (lógica/vista/estilos mezclados)
❌ **Componentes hoja > 150 líneas o componentes orquestador > 400 líneas** sin refactorizar
❌ **Lógica de negocio en componentes** (useState, useEffect con lógica compleja)
❌ **Llamadas a API/DB directas en componentes** (usar services)
❌ **Strings de Tailwind > 80 caracteres inline** (extraer a .styles.ts)
❌ **Código duplicado entre componentes** (extraer a shared/utils)
❌ **ASUMIR nombres de campos sin verificar** con autocomplete TypeScript
❌ **Copiar nombres de otros archivos** sin validar en tipos generados
❌ **Inventar nombres "lógicos"** sin confirmar en schema
❌ **Crear componentes de UI sin usar los estandarizados** (ModuleContainer, Card, Button, etc.)
❌ **Olvidar modo oscuro** (dark:\* en elementos personalizados)
❌ **No usar estados de UI** (LoadingState, EmptyState, ErrorState)
❌ **Usar `any` en TypeScript** (siempre tipar correctamente)
❌ **Usar `console.log/error/warn` directo** → usar `import { logger } from '@/lib/utils/logger'`
❌ **Importar supabase de `@supabase/supabase-js` directo** → usar `@/lib/supabase/client`
❌ **Crear instancias nuevas de supabase** en código de negocio
❌ **Mostrar toast desde services** → toast solo en hooks (onError/onSuccess de React Query)
❌ **Retornar null silenciosamente** en services que modifican datos (throw Error)
❌ **Query keys como strings sueltos** → usar factory pattern (`clientesKeys.detail(id)`)
❌ **Mezclar queries React Query con lógica UI** en el mismo hook
❌ **`eslint-disable` en código de negocio** → corregir el código, no silenciar el linter

---

## ✅ REQUERIDO

✅ **SANITIZACIÓN DE DATOS** → `sanitize*.utils.ts` antes de insert/update (strings vacíos → null)
✅ **LOGGER CENTRALIZADO** → `import { logger } from '@/lib/utils/logger'` — NUNCA `console.*` directo (ESLint lo bloquea). Usar `logger.error()`, `logger.warn()`, `logger.info()`, `logger.debug()`. Para auth/middleware usar `errorLog()`, `debugLog()` del mismo archivo.
✅ **SUPABASE CLIENT** → `import { supabase } from '@/lib/supabase/client'` (client-side) o `createServerClient` de `@/lib/supabase/server` (server-side)
✅ **ERROR HANDLING** → Service: `logger.error()` + `throw` → Hook: `onError: toast.error()` → UI: solo llama al hook
✅ **TOAST** → `import { toast } from 'sonner'` (única librería de notificaciones, solo en hooks/callbacks de React Query)
✅ **REACT QUERY KEYS** → Factory pattern en `use[Modulo]Query.ts` (ej: `clientesKeys.detail(id)`)
✅ **REACT QUERY FILES** → Queries en `use[Modulo]Query.ts` separado de lógica UI en `use[Modulo]List.ts`
✅ **FUNCIONES DE FECHAS** → Importar de `@/lib/utils/date.utils` (formatDateShort, formatDateForInput, formatDateForDB, getTodayDateString)
✅ **MOSTRAR FECHAS** → `formatDateShort(fecha)` para dd/MM/yyyy
✅ **CARGAR EN INPUTS** → `formatDateForInput(fecha)` para <input type="date" />
✅ **GUARDAR EN BD** → `formatDateForDB(inputValue)` con hora del mediodía
✅ **FECHA ACTUAL** → `getTodayDateString()` sin timezone shift
✅ **SINCRONIZAR TIPOS DB** → `npm run types:generate` después de migraciones
✅ **USAR AUTOCOMPLETE TypeScript** → Nombres exactos de tablas/campos
✅ **SISTEMA DE THEMING** → `moduleThemes[moduleName]` en componentes reutilizables
✅ **EJECUTAR SQL con script automatizado** (`npm run db:exec <archivo.sql>`)
✅ **SEPARACIÓN ESTRICTA: Hooks (lógica) + Componentes (UI) + Estilos (centralizados)**
✅ **Hook personalizado por componente** con toda la lógica
✅ **Service por módulo** para llamadas API/DB
✅ **Archivo `.styles.ts`** para strings de Tailwind > 80 caracteres
✅ **Componentes presentacionales puros** (hoja < 150, orquestador < 400 líneas)
✅ **useMemo/useCallback** para optimización
✅ **Barrel exports (`index.ts`)** en cada carpeta
✅ **Tipos TypeScript estrictos** (sin any)
✅ **Usar componentes estandarizados de `@/shared/components/layout`**
✅ **Consultar TEMPLATE-MODULO-ESTANDAR.md antes de crear módulo**
✅ **Validar con checklist de GUIA-DISENO-MODULOS.md**
✅ **Modo oscuro en TODOS los elementos**
✅ **Estados de UI (loading, empty, error)**
✅ **Imports organizados** (React → Next → External → Shared → Local → Hooks → Services → Types)

---

## 📚 Documentación Completa

### 🔴 CRÍTICA (consultar SIEMPRE):

- **Sistema de sanitización**: `docs/SISTEMA-SANITIZACION-DATOS-CLIENTES.md` ⭐ **NO MÁS STRINGS VACÍOS**
- **Manejo profesional de fechas**: `docs/GUIA-MANEJO-FECHAS-PROFESIONAL.md` ⭐ **NO MÁS TIMEZONE ISSUES**
- **Sistema de documentos pendientes**: `docs/SISTEMA-DOCUMENTOS-PENDIENTES.md` ⭐ **VINCULACIÓN AUTOMÁTICA**
- **Sincronización de tipos DB**: `docs/SISTEMA-SINCRONIZACION-SCHEMA-DB.md` ⭐ **TIPOS AUTOMÁTICOS**
- **Plantilla estándar módulos**: `docs/PLANTILLA-ESTANDAR-MODULOS.md` ⭐ **PROYECTOS COMO REFERENCIA**
- **Sistema de theming**: `docs/SISTEMA-THEMING-MODULAR.md` ⭐ **NO HARDCODEAR COLORES**
- **Ejecutar SQL automático**: `docs/EJECUTAR-SQL-DIRECTAMENTE.md` ⭐ **NO MÁS COPY/PASTE**
- **Separación de responsabilidades**: `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md` ⭐ **PATRÓN INVIOLABLE**
- **Schema DB**: `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` ⭐ **FUENTE ÚNICA DE VERDAD**
- **Checklist desarrollo**: `docs/DESARROLLO-CHECKLIST.md` ⭐ **OBLIGATORIO**
- **Sistema de estandarización**: `docs/SISTEMA-ESTANDARIZACION-MODULOS.md` ⭐ **DISEÑO CONSISTENTE**
- **Política de eliminación (Admin Only)**: `docs/POLITICA-ELIMINACION-DOCUMENTOS-ADMIN-ONLY.md` ⭐ **SEGURIDAD Y ROL**
- **Política de eliminación de versiones**: `docs/POLITICA-ELIMINACION-VERSIONES.md` ⭐ **INTEGRIDAD DE DATOS**

### 📘 Desarrollo:

- **Demo visual theming**: `docs/THEMING-DEMO-VISUAL.md`
- **Guía de diseño**: `docs/GUIA-DISENO-MODULOS.md`
- **Template de módulo**: `docs/TEMPLATE-MODULO-ESTANDAR.md`
- **Componentes compartidos**: `src/shared/components/layout/`
- **Arquitectura**: `ARCHITECTURE.md`

---

## Descripción del Proyecto

Aplicación web moderna para la gestión administrativa de la constructora RyR, desarrollada con Next.js 15, TypeScript, Supabase y Tailwind CSS.

## Funcionalidades Principales

- Gestión de proyectos de construcción
- Sistema de documentos con categorías personalizables
- Administración de viviendas
- Gestión de clientes
- Sistema de abonos y pagos
- Manejo de renuncias
- Panel de administración completo
- Sistema de auditoría y reportes
- Versionado de documentos
- Sincronización de datos en tiempo real

## Stack Tecnológico

- **Frontend**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5.9
- **Styling**: Tailwind CSS 3
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: Radix UI + shadcn/ui
- **Animaciones**: Framer Motion
- **Formularios**: React Hook Form + Zod
- **Estado**: Zustand
- **Validación**: Zod

## Estructura del Proyecto (Actualizada)

```
constructoraRyR-app/
├── app/                    # Next.js App Router
├── src/
│   ├── modules/           # Módulos separados por dominio
│   │   ├── proyectos/    # ✅ REFACTORIZADO (ejemplo perfecto)
│   │   └── documentos/   # ✅ Sistema completo
│   ├── shared/            # Recursos compartidos
│   ├── components/        # Componentes globales
│   ├── contexts/          # Contextos React
│   ├── services/          # Servicios globales
│   └── lib/              # Utilidades y configuraciones
├── docs/                  # Documentación
└── supabase/              # SQL scripts
```

## Características de Desarrollo

- Interfaz responsiva y moderna
- Navegación instantánea entre módulos
- Animaciones fluidas con Framer Motion
- Sincronización en tiempo real con Supabase
- Sistema de versionado para auditoría
- Carga optimizada de datos
- **Separación estricta de responsabilidades**
- **Código limpio y mantenible**
- **Hooks personalizados por componente**
- **Estilos centralizados**
