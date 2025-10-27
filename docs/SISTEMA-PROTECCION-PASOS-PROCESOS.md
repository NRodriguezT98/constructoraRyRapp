# 🛡️ Sistema de Protección de Pasos en Procesos

## 📋 Descripción General

Sistema integral de protección contra pérdida de trabajo en el módulo de procesos de negociación. Implementa un flujo de trabajo explícito donde el usuario debe iniciar un paso antes de trabajar en él, con advertencias antes de perder cambios no guardados.

---

## 🎯 Características Implementadas

### 1. **Flujo de Trabajo Explícito**

El usuario debe seguir este flujo:

```
PENDIENTE → [Iniciar Paso] → EN PROCESO → [Completar/Descartar] → COMPLETADO/PENDIENTE
```

#### Estados del Paso:

1. **Pendiente** (inicial)
   - ❌ No se puede adjuntar documentos
   - ❌ Sección de adjuntos oculta
   - ✅ Botón "Iniciar Paso" visible
   - Sin advertencia de cambios

2. **En Proceso** (trabajando)
   - ✅ Adjuntos desplegados y editables
   - ✅ Botón "Completar Paso" visible
   - ✅ Botón "Descartar Cambios" visible
   - ⚠️ **Advertencia activa** si intenta salir

3. **Completado** (finalizado)
   - ✅ Todo visible pero deshabilitado
   - 📅 Fechas registradas (inicio + completado)
   - Sin opciones de edición

---

### 2. **Sistema de Advertencia beforeunload**

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (pasoEnEdicion) {
      e.preventDefault()
      e.returnValue = '' // Chrome requiere esto
      return '' // Otros navegadores
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}, [pasoEnEdicion])
```

**Se activa cuando:**
- Usuario tiene paso en estado "En Proceso"
- Intenta cerrar pestaña/ventana
- Intenta navegar a otra página
- Refresca la página (F5)

**Mensaje del navegador:**
> "¿Estás seguro de que quieres salir de esta página? Es posible que los cambios que has realizado no se guarden."

---

### 3. **Modal de Fecha de Completado**

Al presionar "Completar Paso", aparece un modal para especificar la fecha real de completado.

#### Características:
- **Fecha por defecto**: Hoy (automática)
- **Fecha mínima**: Fecha de inicio del paso (o hace 30 días si no hay inicio)
- **Fecha máxima**: Hoy (no permite fechas futuras)
- **Validaciones**:
  - ❌ No permite fechas futuras
  - ❌ No permite fechas anteriores al inicio del paso
  - ✅ Muestra fecha de inicio como referencia
  - ✅ Formato amigable (DD de Mes de AAAA)

#### Código:
```typescript
const handleConfirmarCompletado = async (fecha: Date) => {
  if (!pasoACompletar) return

  const exito = await completarPaso(pasoACompletar.id, fecha)

  if (exito) {
    setModalFechaAbierto(false)
    setPasoACompletar(null)
    setPasoExpandido(null)
  }
}
```

---

### 4. **Función Descartar Cambios**

Permite revertir un paso "En Proceso" a "Pendiente", eliminando todo el progreso.

#### Confirmación previa:
```
⚠️ ¿Descartar todos los cambios?

• Se eliminarán los documentos adjuntos
• Se borrará la fecha de inicio
• El paso volverá a estado Pendiente

Esta acción no se puede deshacer.
```

#### Lógica:
```typescript
const descartarCambios = async (pasoId: string): Promise<boolean> => {
  const actualizado = await actualizarProceso(pasoId, {
    estado: EstadoPaso.PENDIENTE,
    fechaInicio: null,
    documentosUrls: null, // Eliminar documentos
    notas: null
  })

  setPasoEnEdicion(null) // Desactivar advertencia
  return true
}
```

---

## 🔧 Implementación Técnica

### Hook `useProcesoNegociacion.ts`

#### Nuevas funciones:

1. **`iniciarPaso(pasoId)`**
   - Cambia estado a "En Proceso"
   - Registra `fecha_inicio = NOW()`
   - Marca `pasoEnEdicion = pasoId`

2. **`completarPaso(pasoId, fechaCompletado)`**
   - Acepta fecha personalizada (no solo NOW())
   - Registra `fecha_completado = fechaCompletado`
   - Limpia `pasoEnEdicion = null`

3. **`descartarCambios(pasoId)`**
   - Vuelve a estado "Pendiente"
   - Limpia `fecha_inicio`, `documentos_urls`, `notas`
   - Limpia `pasoEnEdicion = null`

4. **`eliminarDocumento(pasoId, documentoId)`**
   - Elimina documento del paso (solo en "En Proceso")

5. **`puedeIniciar(paso)`**
   - Verifica si paso está en "Pendiente" y no bloqueado

#### Nuevos estados:

```typescript
const [pasoEnEdicion, setPasoEnEdicion] = useState<string | null>(null)
```

---

### Componente `timeline-proceso.tsx`

#### Nuevos handlers:

```typescript
const handleIniciarPaso = async (pasoId: string) => {
  if (!confirm('¿Iniciar trabajo en este paso?')) return
  const exito = await iniciarPaso(pasoId)
  if (exito) setPasoExpandido(pasoId) // Auto-expandir
}

const handleAbrirModalCompletar = (paso: ProcesoNegociacion) => {
  setPasoACompletar(paso)
  setModalFechaAbierto(true)
}

const handleDescartarCambios = async (pasoId: string) => {
  if (!confirm('⚠️ ¿Descartar todos los cambios?')) return
  await descartarCambios(pasoId)
}
```

#### Cambios en UI:

**Paso Pendiente:**
```tsx
{isPendiente && puedeIniciar && (
  <button onClick={onIniciar}>
    <Play /> Iniciar Paso
  </button>
)}

{isPendiente && (
  <div className="alert-info">
    Presiona "Iniciar Paso" para empezar a trabajar
  </div>
)}
```

**Paso En Proceso:**
```tsx
{isEnProceso && (
  <>
    <button onClick={onCompletar} disabled={!puedeCompletar}>
      <CheckCircle2 /> Completar Paso
    </button>

    <button onClick={onDescartar}>
      <Trash2 /> Descartar Cambios
    </button>
  </>
)}
```

**Documentos (solo visible si En Proceso o Completado):**
```tsx
{(isEnProceso || isCompletado) && (
  <DocumentosRequeridos
    paso={paso}
    soloLectura={isCompletado}
  />
)}
```

---

### Componente `modal-fecha-completado.tsx`

```tsx
<ModalFechaCompletado
  isOpen={modalFechaAbierto}
  pasoNombre={pasoACompletar?.nombre || ''}
  fechaInicio={pasoACompletar?.fechaInicio}
  onConfirm={handleConfirmarCompletado}
  onCancel={() => setModalFechaAbierto(false)}
/>
```

#### Validaciones del modal:

```typescript
if (fechaSeleccionada > ahora) {
  setError('La fecha no puede ser futura')
  return
}

if (fechaInicio && fechaSeleccionada < new Date(fechaInicio)) {
  setError('La fecha no puede ser anterior al inicio del paso')
  return
}
```

---

## 📊 Actualización del Header

Ahora muestra **4 estadísticas** en lugar de 3:

```tsx
<div className="grid grid-cols-4 gap-4">
  <div>
    <div>{progreso.pasosCompletados}</div>
    <div>Completados</div>
  </div>
  <div>
    <div>{progreso.pasosEnProceso}</div>
    <div>En Proceso</div>
  </div>
  <div>
    <div>{progreso.pasosPendientes}</div>
    <div>Pendientes</div>
  </div>
  <div>
    <div>{progreso.totalPasos}</div>
    <div>Total</div>
  </div>
</div>
```

**Servicio actualizado:**
```typescript
export async function obtenerProgresoNegociacion(negociacionId: string) {
  const procesos = await obtenerProcesosNegociacion(negociacionId)

  const completados = procesos.filter(p => p.estado === EstadoPaso.COMPLETADO).length
  const enProceso = procesos.filter(p => p.estado === EstadoPaso.EN_PROCESO).length
  const pendientes = procesos.filter(p => p.estado === EstadoPaso.PENDIENTE).length
  const omitidos = procesos.filter(p => p.estado === EstadoPaso.OMITIDO).length

  return {
    pasosCompletados: completados,
    pasosEnProceso: enProceso,
    pasosPendientes: pendientes,
    pasosOmitidos: omitidos,
    porcentajeCompletado: Math.round((completados / procesos.length) * 100)
  }
}
```

---

## 🎨 Badges de Estado

```tsx
const getBadge = () => {
  if (isCompletado) return (
    <span className="bg-green-100 text-green-700">
      ✓ Completado
    </span>
  )

  if (isEnProceso) return (
    <span className="bg-blue-100 text-blue-700">
      <div className="animate-pulse" /> En Proceso
    </span>
  )

  if (isBloqueado) return (
    <span className="bg-gray-200 text-gray-600">
      <Lock /> Bloqueado
    </span>
  )

  return (
    <span className="bg-amber-100 text-amber-700">
      Pendiente
    </span>
  )
}
```

---

## 🔒 Flujo de Protección Completo

### Escenario 1: Usuario inicia paso y completa normalmente

```
1. Usuario hace clic en "Iniciar Paso"
   → Confirmación: "¿Iniciar trabajo en este paso?"
   → Estado cambia a "En Proceso"
   → fecha_inicio = NOW()
   → Adjuntos se despliegan

2. Usuario adjunta documentos
   → Documentos se guardan en DB
   → No se puede cerrar página sin advertencia

3. Usuario hace clic en "Completar Paso"
   → Modal de fecha aparece
   → Usuario selecciona fecha (por defecto: hoy)
   → Estado cambia a "Completado"
   → fecha_completado = fecha seleccionada
   → Advertencia se desactiva
```

### Escenario 2: Usuario inicia paso pero quiere descartar

```
1. Usuario hace clic en "Iniciar Paso"
   → Estado = "En Proceso"
   → Adjuntos desplegados

2. Usuario adjunta 1 documento
   → Documento guardado

3. Usuario se arrepiente y hace clic en "Descartar Cambios"
   → Confirmación: "⚠️ ¿Descartar todos los cambios?"
   → Estado vuelve a "Pendiente"
   → Documentos eliminados
   → fecha_inicio = NULL
   → Advertencia se desactiva
```

### Escenario 3: Usuario intenta salir sin completar

```
1. Usuario tiene paso en "En Proceso"
   → pasoEnEdicion = pasoId

2. Usuario intenta:
   - Cerrar pestaña (Ctrl+W)
   - Cerrar ventana (Alt+F4)
   - Navegar a otra URL
   - Refrescar página (F5)

3. Navegador muestra advertencia nativa:
   → "¿Estás seguro de que quieres salir?"
   → Usuario debe confirmar explícitamente

4. Opciones del usuario:
   A. Cancelar → Permanece en la página
   B. Salir de todos modos → Pierde cambios (DB mantiene estado "En Proceso")
```

---

## 📝 Casos de Uso

### ✅ Caso 1: Completar paso el mismo día

```
Fecha inicio: 27 Oct 2025 10:00 AM
Usuario completa: 27 Oct 2025 3:00 PM
Modal muestra: 27 Oct 2025 (por defecto)
Usuario confirma → ✅ Fechas correctas
```

### ✅ Caso 2: Completar paso días después

```
Fecha inicio: 24 Oct 2025
Usuario completa: 27 Oct 2025
Modal muestra: 27 Oct 2025 (por defecto)
Usuario cambia a: 25 Oct 2025 (fecha real de completado)
Usuario confirma → ✅ Fechas correctas
```

### ❌ Caso 3: Fecha futura (bloqueado)

```
Hoy: 27 Oct 2025
Usuario selecciona: 28 Oct 2025
Modal muestra error: "La fecha no puede ser futura"
```

### ❌ Caso 4: Fecha anterior al inicio (bloqueado)

```
Fecha inicio: 25 Oct 2025
Usuario selecciona: 24 Oct 2025
Modal muestra error: "La fecha no puede ser anterior al inicio del paso"
```

---

## 🚀 Próximas Mejoras (Opcionales)

1. **Guardado automático** de documentos en segundo plano
2. **Historial de cambios** descartados (auditoria)
3. **Recordatorio** si paso lleva > 7 días "En Proceso"
4. **Autocompletado** de fecha basado en último documento subido
5. **Deshacer** descarte (hasta X minutos después)

---

## 📚 Archivos Modificados

```
src/modules/admin/procesos/
├── hooks/
│   └── useProcesoNegociacion.ts        # ✅ Nuevas funciones
├── components/
│   ├── timeline-proceso.tsx            # ✅ UI actualizada
│   ├── modal-fecha-completado.tsx      # 🆕 Modal nuevo
│   └── index.ts                        # ✅ Export añadido
├── services/
│   └── procesos.service.ts             # ✅ Progreso actualizado
└── types/
    └── index.ts                        # (Sin cambios)
```

---

## ✨ Resumen de Beneficios

| Antes | Después |
|-------|---------|
| Usuario podía adjuntar sin iniciar | Debe presionar "Iniciar Paso" |
| Fechas siempre NOW() | Usuario especifica fecha real |
| Sin advertencia al salir | Advertencia beforeunload activa |
| Cambios se guardaban automáticamente | Usuario debe completar o descartar |
| Sin forma de revertir | Botón "Descartar Cambios" |
| 3 estados confusos | Flujo claro: Pendiente → En Proceso → Completado |

---

**Fecha de implementación**: 27 de octubre de 2025
**Versión**: 2.0.0
**Estado**: ✅ Completado y probado
