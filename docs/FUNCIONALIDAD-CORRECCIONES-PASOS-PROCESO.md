# 🔧 Funcionalidad de Correcciones en Pasos del Proceso

**Fecha de implementación**: 3 de noviembre de 2025
**Ubicación**: Pestaña "Actividad/Proceso" en Detalle de Cliente
**Permisos**: Solo Administradores

---

## 📋 Resumen

Sistema que permite a los Administradores corregir **fechas de completado** y **documentos** de pasos ya completados en el proceso de negociación, con validaciones robustas y advertencias especiales.

---

## ✅ COMPLETADO

### 1. **Integración de Botones en Timeline** ✅

**Archivos modificados**:
- `src/modules/admin/procesos/hooks/useTimelineProceso.ts`
- `src/modules/admin/procesos/components/timeline-proceso.tsx`
- `src/modules/admin/procesos/components/paso-item.tsx`
- `src/modules/admin/procesos/components/acciones-paso.tsx`

**Cambios realizados**:

#### A. Hook `useTimelineProceso.ts`:
```typescript
// ✅ Agregado: Estados para modales de corrección
const [modalCorregirFechaAbierto, setModalCorregirFechaAbierto] = useState(false)
const [pasoACorregirFecha, setPasoACorregirFecha] = useState<ProcesoNegociacion | null>(null)
const [modalCorregirDocAbierto, setModalCorregirDocAbierto] = useState(false)
const [pasoACorregirDoc, setPasoACorregirDoc] = useState<ProcesoNegociacion | null>(null)

// ✅ Agregado: Validación de rol (CORREGIDO: perfil.rol en lugar de user.role)
const esAdministrador = perfil?.rol === 'Administrador'

// ✅ Agregado: Handlers para abrir/cerrar modales
const handleAbrirModalCorregirFecha = useCallback((paso) => { ... }, [])
const handleCerrarModalCorregirFecha = useCallback(() => { ... }, [])
const handleSuccessCorregirFecha = useCallback(async () => {
  setModalCorregirFechaAbierto(false)
  setPasoACorregirFecha(null)
  await procesoHook.refrescar() // ✅ CORRECTO: refrescar() en lugar de cargarPasos()
}, [procesoHook])

// Igual para documentos...
```

#### B. Componente `timeline-proceso.tsx`:
```typescript
// ✅ Agregado: Imports de modales
import { ModalCorregirFecha } from '@/modules/procesos/components/ModalCorregirFecha'
import { ModalCorregirDocumentos } from '@/modules/procesos/components/ModalCorregirDocumentos'

// ✅ Agregado: Props a PasoItem
<PasoItem
  onCorregirFecha={() => timeline.handleAbrirModalCorregirFecha(paso)}
  onCorregirDocumento={() => timeline.handleAbrirModalCorregirDoc(paso)}
  esAdministrador={timeline.esAdministrador}
/>

// ✅ Agregado: Renderizado condicional de modales (solo si esAdministrador)
{timeline.esAdministrador && (
  <>
    <ModalCorregirFecha
      paso={{ id, nombre, fecha_completado }}
      open={modalCorregirFechaAbierto}
      onClose={handleCerrarModalCorregirFecha}
      onSuccess={handleSuccessCorregirFecha}
    />
    <ModalCorregirDocumentos
      paso={{ id, nombre }}
      documentos={pasoACorregirDoc?.documentosRequeridos?.map(...) || []}
      open={modalCorregirDocAbierto}
      onClose={handleCerrarModalCorregirDoc}
      onSuccess={handleSuccessCorregirDoc}
    />
  </>
)}
```

#### C. Componente `acciones-paso.tsx`:
```typescript
// ✅ Agregado: Props para correcciones
interface AccionesPasoProps {
  // ... props existentes
  isCompletado?: boolean
  esAdministrador?: boolean
  onCorregirFecha?: () => void
  onCorregirDocumento?: () => void
}

// ✅ Agregado: Botones de corrección (solo Admin en pasos COMPLETADOS)
{isCompletado && esAdministrador && (
  <>
    <button onClick={onCorregirFecha} className="bg-amber-500/10 border-amber-500/20">
      <Calendar /> Corregir Fecha
    </button>
    <button onClick={onCorregirDocumento} className="bg-blue-500/10 border-blue-500/20">
      <FileEdit /> Corregir Documento
    </button>
  </>
)}
```

---

### 2. **Mejoras en Validaciones y Modales** ✅

**Archivos modificados**:
- `src/modules/procesos/services/correcciones.service.ts`
- `src/modules/procesos/components/ModalCorregirFecha.tsx`
- `src/modules/procesos/components/ModalCorregirDocumentos.tsx`

**Cambios realizados**:

#### A. Servicio `correcciones.service.ts`:
```typescript
// ✅ Agregado: Flags para advertencias de Administrador
export interface ValidacionFechaResult {
  valida: boolean
  errores: string[]
  fechaMinima?: Date
  fechaMaxima?: Date
  requiereConfirmacionAdmin?: boolean  // ✅ NUEVO
  advertenciaAdmin?: string             // ✅ NUEVO
}

// ✅ Modificado: Validación de pasos posteriores (ahora permite a Admins)
if (pasosPosteriores && pasosPosteriores.length > 0) {
  if (esAdmin) {
    return {
      permitido: true,
      razon: `⚠️ ADVERTENCIA: Hay ${pasosPosteriores.length} paso(s) posterior(es) completado(s). La corrección podría afectar la cronología del proceso.`,
      requiereConfirmacionAdmin: true // ✅ Flag para mostrar advertencia especial
    }
  }
  return {
    permitido: false,
    razon: 'No puedes modificar este paso porque hay pasos posteriores completados. Contacta a un administrador.'
  }
}

// ✅ Agregado: Detección de pasos posteriores en validarCorreccionFecha
const { data: pasosPosterioresCompletados } = await supabase
  .from('procesos_negociacion')
  .select('id, nombre, orden')
  .eq('negociacion_id', paso.negociacion_id)
  .gt('orden', paso.orden)
  .eq('estado', 'Completado')

const hayPasosPosteriores = pasosPosterioresCompletados && pasosPosterioresCompletados.length > 0

return {
  valida: errores.length === 0,
  errores,
  fechaMinima,
  fechaMaxima: fechaMaxima || ahora,
  requiereConfirmacionAdmin: hayPasosPosteriores,
  advertenciaAdmin: hayPasosPosteriores
    ? `⚠️ ADVERTENCIA: Hay ${pasosPosterioresCompletados.length} paso(s) posterior(es) completado(s). La corrección podría afectar la cronología del proceso.`
    : undefined
}
```

#### B. Modal `ModalCorregirFecha.tsx`:
```typescript
// ✅ Agregado: Advertencia AMBAR para Administradores
{validacion?.requiereConfirmacionAdmin && validacion.advertenciaAdmin && (
  <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-900 mb-1">
          Confirmación de Administrador Requerida
        </p>
        <p className="text-sm text-amber-800">
          {validacion.advertenciaAdmin}
        </p>
      </div>
    </div>
  </div>
)}
```

#### C. Modal `ModalCorregirDocumentos.tsx`:
```typescript
// ✅ Agregado: Validación de permisos al abrir modal
const [permisos, setPermisos] = useState<PermisosCorreccion | null>(null)

useEffect(() => {
  if (open && paso.id) {
    puedeCorregirDocumentos(paso.id, true) // true = esAdmin
      .then(setPermisos)
      .catch(err => console.error('Error al validar permisos:', err))
  }
}, [open, paso.id])

// ✅ ELIMINADO: Sección de "Validaciones aplicadas" (48 horas, etc.)
// Ya no se muestra porque no aplica para Administradores

// ✅ Agregado: Advertencia AMBAR solo cuando hay pasos posteriores
{permisos?.requiereConfirmacionAdmin && permisos.razon && (
  <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-amber-900 mb-1">
          Confirmación de Administrador Requerida
        </h4>
        <p className="text-sm text-amber-800">
          {permisos.razon}
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 3. **Validaciones Implementadas en el Servicio** ✅

**Archivo**: `src/modules/procesos/services/correcciones.service.ts`
**Función**: `validarCorreccionFecha(pasoId: string, nuevaFecha: Date)`

#### Validaciones en Orden de Ejecución:

```typescript
// 1️⃣ VALIDACIÓN: Paso existe y tiene negociación válida
const { data: paso, error } = await supabase
  .from('procesos_negociacion')
  .select(`
    *,
    negociaciones (
      id,
      estado,
      fecha_negociacion  // ⭐ Campo para validación de fecha mínima
    )
  `)
  .eq('id', pasoId)
  .single()

// 2️⃣ VALIDACIÓN: Proceso no está finalizado
if (['Completado', 'Cancelado'].includes(paso.negociaciones.estado)) {
  errores.push('No se puede corregir fecha de proceso finalizado')
}

// 3️⃣ VALIDACIÓN: No puede ser fecha futura
const ahora = new Date()
if (nuevaFecha > ahora) {
  errores.push('La fecha no puede ser futura')
}

// 4️⃣ VALIDACIÓN CRÍTICA: No puede ser anterior a inicio de negociación ⭐
if (paso.negociaciones.fecha_negociacion) {
  const fechaInicioNegociacion = new Date(paso.negociaciones.fecha_negociacion)

  if (nuevaFecha < fechaInicioNegociacion) {
    errores.push(
      `La fecha no puede ser anterior a la fecha de inicio de la negociación (${formatDate(fechaInicioNegociacion)})`
    )
  }
}

// 5️⃣ VALIDACIÓN: No puede ser anterior al paso previo
const { data: pasoAnterior } = await supabase
  .from('procesos_negociacion')
  .select('fecha_completado, estado, nombre')
  .eq('negociacion_id', paso.negociacion_id)
  .eq('orden', paso.orden - 1)
  .maybeSingle()

if (pasoAnterior?.estado === 'Completado' && pasoAnterior.fecha_completado) {
  const fechaAnterior = new Date(pasoAnterior.fecha_completado)
  if (nuevaFecha < fechaAnterior) {
    errores.push(
      `La fecha debe ser posterior al paso anterior: ${pasoAnterior.nombre} (${formatDate(fechaAnterior)})`
    )
  }
  fechaMinima = fechaAnterior
}

// 6️⃣ VALIDACIÓN: No puede ser posterior al paso siguiente (si está completado)
const { data: pasoSiguiente } = await supabase
  .from('procesos_negociacion')
  .select('fecha_completado, estado, nombre')
  .eq('negociacion_id', paso.negociacion_id)
  .eq('orden', paso.orden + 1)
  .maybeSingle()

if (pasoSiguiente?.estado === 'Completado' && pasoSiguiente.fecha_completado) {
  const fechaSiguiente = new Date(pasoSiguiente.fecha_completado)
  if (nuevaFecha > fechaSiguiente) {
    errores.push(
      `La fecha debe ser anterior al paso siguiente: ${pasoSiguiente.nombre} (${formatDate(fechaSiguiente)})`
    )
  }
  fechaMaxima = fechaSiguiente
}

// 7️⃣ ADVERTENCIA ADMIN: Detección de pasos posteriores
const { data: pasosPosterioresCompletados } = await supabase
  .from('procesos_negociacion')
  .select('id, nombre, orden')
  .eq('negociacion_id', paso.negociacion_id)
  .gt('orden', paso.orden)
  .eq('estado', 'Completado')

const hayPasosPosteriores = pasosPosterioresCompletados && pasosPosterioresCompletados.length > 0

// ⭐ Retorna resultado con flags especiales para Admins
return {
  valida: errores.length === 0,
  errores,
  fechaMinima,
  fechaMaxima: fechaMaxima || ahora,
  requiereConfirmacionAdmin: hayPasosPosteriores,
  advertenciaAdmin: hayPasosPosteriores
    ? `⚠️ ADVERTENCIA: Hay ${pasosPosterioresCompletados.length} paso(s) posterior(es) completado(s). La corrección podría afectar la cronología del proceso.`
    : undefined
}
```

**Orden de prioridad de validaciones**:
1. ✅ Paso existe
2. ✅ Proceso no finalizado
3. ✅ No futuro
4. ⭐ **No antes de fecha_negociacion** (CRÍTICO - agregado 4/nov/2025)
5. ✅ No antes de paso anterior
6. ✅ No después de paso siguiente
7. ⚠️ Advertencia si hay pasos posteriores

**Referencias**:
- 📚 `docs/06-testing/VALIDACION-FECHA-INICIO-NEGOCIACION.md` - Documentación completa de validación #4
- 📚 `docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md` - Schema de tabla negociaciones

---

### 4. **Correcciones de Bugs** ✅

#### Bug #1: Rol de usuario incorrecto
**Problema**: `user.role` retornaba `'authenticated'` en lugar del rol real
**Solución**: Cambiar a `perfil.rol` que obtiene el valor correcto de la tabla `usuarios`

```typescript
// ❌ ANTES (incorrecto)
const esAdministrador = user?.role === 'Administrador'

// ✅ AHORA (correcto)
const { user, perfil } = useAuth()
const esAdministrador = perfil?.rol === 'Administrador'
```

#### Bug #2: Método de recarga incorrecto
**Problema**: Se llamaba a `procesoHook.cargarPasos()` que no existe
**Solución**: Usar `procesoHook.refrescar()` que es el método correcto

```typescript
// ❌ ANTES (error)
await procesoHook.cargarPasos()

// ✅ AHORA (correcto)
await procesoHook.refrescar()
```

#### Bug #3: Prop faltante en ModalCorregirDocumentos
**Problema**: Modal requería prop `documentos` que no se estaba pasando
**Solución**: Mapear documentosRequeridos del paso

```typescript
// ✅ Agregado mapeo correcto
<ModalCorregirDocumentos
  documentos={pasoACorregirDoc?.documentosRequeridos?.map(doc => ({
    id: doc.id,
    nombre_archivo: doc.nombre,
    fecha_subida: doc.fechaSubida || new Date().toISOString(),
    categoria_id: doc.categoriaId || '',
    url_storage: doc.url || ''
  })) || []}
/>
```

#### Bug #4: Import conflict con icono Info
**Problema**: Conflicto de nombre con variable local
**Solución**: Renombrar import

```typescript
// ✅ Renombrado para evitar conflicto
import { AlertCircle, FileEdit, FileText, Info as InfoIcon, Upload, X } from 'lucide-react'
```

---

## ⏳ PENDIENTE

### 1. **Testing Completo de Funcionalidad** 🔴

**Tareas pendientes**:

#### A. Probar Modal "Corregir Fecha":
- [ ] Abrir modal desde botón en paso COMPLETADO
- [ ] Verificar que muestre fecha actual del paso
- [ ] Verificar restricciones (fecha mínima/máxima según pasos anterior/siguiente)
- [ ] **CASO CRÍTICO**: Probar corrección de PASO 2 cuando PASO 3 ya está completado
  - Debe mostrar advertencia AMBAR
  - Debe permitir continuar a pesar de la advertencia
- [ ] Validar campo "Motivo" (mínimo 10 caracteres)
- [ ] Intentar guardar corrección
- [ ] Verificar que timeline se recargue después de corrección exitosa
- [ ] Verificar que se registre en auditoría (si tabla existe)

#### B. Probar Modal "Corregir Documento":
- [ ] Abrir modal desde botón en paso COMPLETADO
- [ ] Verificar que NO muestre sección de "Validaciones aplicadas"
- [ ] **CASO CRÍTICO**: Si hay pasos posteriores, verificar advertencia AMBAR
- [ ] Click en "Habilitar Correcciones"
- [ ] Verificar que muestre lista de documentos del paso
- [ ] Seleccionar nuevo archivo para reemplazar documento
- [ ] Escribir motivo de corrección (mínimo 10 caracteres)
- [ ] Intentar guardar corrección
- [ ] Verificar que timeline se recargue después de corrección exitosa

#### C. Verificar Permisos:
- [ ] Login como **Administrador** → Botones deben aparecer ✅
- [ ] Login como **Gerente** → Botones NO deben aparecer ❌
- [ ] Login como **Vendedor** → Botones NO deben aparecer ❌

---

### 2. **Funcionalidad Backend Pendiente** 🟡

**NOTA**: Los siguientes elementos tienen errores TypeScript porque las **tablas/funciones RPC aún NO existen en la base de datos**. Esto es normal y **NO afecta** la funcionalidad actual de correcciones.

**Errores conocidos en `correcciones.service.ts`**:

```typescript
// ⚠️ PENDIENTE: Crear tabla en Supabase
.from('documentos_procesos_historial')  // Tabla no existe

// ⚠️ PENDIENTE: Crear función RPC en Supabase
.rpc('registrar_correccion_paso')       // Función no existe
.rpc('marcar_documento_reemplazado')    // Función no existe

// ⚠️ PENDIENTE: Crear vista en Supabase
.from('vista_auditoria_correcciones')   // Vista no existe
.from('vista_documentos_reemplazados')  // Vista no existe
```

**Estas funciones se implementarán cuando se necesite**:
- `obtenerHistorialCorrecciones()` - Requiere vista `vista_auditoria_correcciones`
- `obtenerDocumentosReemplazados()` - Requiere vista `vista_documentos_reemplazados`
- Auditoría completa de correcciones - Requiere RPCs y tablas de historial

---

## 🎯 Arquitectura Final Implementada

```
Usuario Admin expande paso COMPLETADO
  ↓
Botones "Corregir Fecha" y "Corregir Documento" aparecen
  (solo visible para rol: Administrador)
  ↓
Click en botón → useTimelineProceso.handleAbrirModal...()
  ↓
Modal se abre con validación en tiempo real
  ├─ ModalCorregirFecha
  │   ├─ Muestra fecha actual
  │   ├─ Valida restricciones cronológicas
  │   ├─ Detecta pasos posteriores completados
  │   └─ Muestra ADVERTENCIA AMBAR si aplica
  │
  └─ ModalCorregirDocumentos
      ├─ Valida permisos con puedeCorregirDocumentos()
      ├─ Muestra lista de documentos subidos
      ├─ Detecta pasos posteriores completados
      └─ Muestra ADVERTENCIA AMBAR si aplica
  ↓
Admin confirma y guarda corrección
  ↓
Servicio ejecuta:
  ├─ Validaciones en correcciones.service.ts
  ├─ Actualización de fecha o documento
  └─ Registro de auditoría (pendiente tablas)
  ↓
onSuccess() → procesoHook.refrescar()
  ↓
Timeline se recarga con datos actualizados
```

---

## 📝 Notas Importantes

1. **Permisos**: Solo Administradores pueden ver y usar botones de corrección
2. **Validación de Rol**: Se usa `perfil.rol` (NO `user.role`)
3. **Advertencias Especiales**: Los Admins ven advertencia AMBAR cuando hay pasos posteriores completados, pero pueden continuar
4. **Sin restricción de 48 horas**: Eliminado porque no es útil para Administradores
5. **Auditoría Completa**: Implementada en servicio pero requiere tablas de BD (pendiente)
6. ⭐ **Validación Crítica**: Fechas no pueden ser anteriores a `fecha_negociacion` (inicio de negociación)

---

## 🔍 Cómo Retomar Mañana

**Prompt para retomar**:
```
"Retomemos el trabajo de corregir documentos y corregir fechas en la pestaña Actividad"
```

**Entonces buscar**: Este archivo (`FUNCIONALIDAD-CORRECCIONES-PASOS-PROCESO.md`)

**Próximos pasos**:
1. Completar testing manual de ambos modales
2. Verificar que advertencias AMBAR aparezcan correctamente
3. ⭐ **Probar validación de fecha_negociacion** (caso crítico agregado hoy)
4. Corregir cualquier bug que se encuentre durante testing
5. Marcar TODO como completado
6. (Opcional) Implementar tablas de auditoría si se requiere historial completo

**Archivos de referencia para testing**:
- 📋 `docs/06-testing/TODO-TESTING-CORRECCIONES-PROCESO.md` - Checklist completo
- ⭐ `docs/06-testing/VALIDACION-FECHA-INICIO-NEGOCIACION.md` - Validación crítica

---

**Última actualización**: 4 de noviembre de 2025
**Estado**: Implementación completa + validación crítica agregada, pendiente testing manual
