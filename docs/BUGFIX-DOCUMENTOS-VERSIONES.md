# 🐛 BUGFIX: Documentos de Vivienda - Versiones

**Fecha**: 7 de noviembre, 2025
**Estado**: ✅ **RESUELTO**

---

## 📋 Resumen de Bugs Encontrados

Este documento cubre **3 bugs críticos** en el sistema de versionado:

1. **Blur del modal mal posicionado** - Sidebar visible por detrás del overlay
2. **Lista mostrando datos obsoletos** - Caché no invalidado después de restaurar
3. **Título incorrecto en TODAS las nuevas versiones** - Sistema usaba título del documento padre en vez del archivo nuevo

**Documentación detallada del Bug #3**: Ver `BUGFIX-TITULO-VERSION-RESTAURADA.md`

---

## �🔴 Problemas Detectados

### **Bug #1: Blur del modal mal posicionado**
**Síntoma**: Al abrir el modal de "Historial de Versiones", el overlay con blur se mostraba **detrás** del contenido de la página, permitiendo ver elementos que deberían estar completamente ocultos.

**Causa Raíz**:
- Modal principal tenía `z-index: 50` (z-50)
- Modal de confirmación de motivo tenía `z-index: 60` (z-[60])
- Contenido de la página tenía elementos con z-index entre 40-90
- Resultado: El blur quedaba entre capas, mostrando contenido por debajo

**Evidencia**:
```
Captura de pantalla muestra:
- Modal de Historial de Versiones abierto
- Contenido visible por detrás del blur (verde de header, elementos de UI)
- Modal de motivo correctamente sobre todo
```

---

### **Bug #2: Versión actual muestra título incorrecto en lista**
**Síntoma**: Después de restaurar una versión (ej: versión 3), el historial muestra correctamente la nueva versión 6 como actual, PERO la lista principal de documentos sigue mostrando el **título de la versión antigua** (versión 4 - Agosto 2024) en vez del nuevo (versión 6 - Octubre 2025).

**Causa Raíz**:
- Cuando se restaura una versión, se crea una **nueva versión** (no se modifica la existente)
- La nueva versión se marca correctamente como `es_version_actual = true` en DB
- El hook `useDocumentoVersiones` llama a `onVersionRestaurada?.()` callback
- PERO el callback NO invalidaba el caché de React Query
- React Query seguía mostrando datos antiguos en caché (staleTime: 5 minutos)

**Evidencia**:
```
Historial de Versiones (correcto):
✅ Versión 6 - OCTUBRE 10 DE 2025 (✓ Actual)
  Versión 5 - [RESTAURACIÓN] ... versión 3
  Versión 4 - AGOSTO 24 DE 2024
  Versión 3 - ...

Lista de Documentos (INCORRECTO antes del fix):
❌ MAT. INM. CASA A7 - AGOSTO 24 DE 2024  ← versión 4 (antigua)
   Debería mostrar: OCTUBRE 10 DE 2025  ← versión 6 (actual)
```

---

## ✅ Soluciones Implementadas

### **Fix #1: Z-Index del Modal + Portal de React**

**Problema Real Detectado**:
El z-index aumentado a 100 NO fue suficiente porque el **sidebar tiene z-50 pero se renderiza DESPUÉS del modal en el DOM**. En CSS, cuando dos elementos tienen posición `fixed`, el que aparece **último en el HTML** se muestra encima, independientemente del z-index (si el z-index no es suficientemente diferente).

**Archivos modificados**:
1. `documento-versiones-modal.styles.ts`
2. `documento-versiones-modal-vivienda.tsx` ✅ **SOLUCIÓN DEFINITIVA**
3. `documento-nueva-version-modal.tsx` ✅ **APLICADO TAMBIÉN**

**Solución Definitiva - Portal de React**:

```typescript
// ✅ PASO 1: Importar createPortal
import { createPortal } from 'react-dom'

// ✅ PASO 2: Envolver contenido del modal
export function DocumentoVersionesModalVivienda({ ... }) {
  // ... hooks y lógica ...

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div className={styles.overlay}>  {/* z-[100] */}
        <motion.div className={styles.container}>
          {/* Contenido del modal */}
        </motion.div>
      </div>
    </AnimatePresence>
  )

  // ✅ PASO 3: Renderizar en document.body usando Portal
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
```

**¿Qué hace el Portal?**
- `createPortal(modalContent, document.body)` renderiza el modal **directamente en document.body**
- Esto garantiza que el modal esté en el **nivel más alto del DOM**
- Ya no importa el orden de renderizado ni z-index del sidebar
- El modal SIEMPRE estará sobre el sidebar y cualquier otro elemento

**Cambios en código**:

1. **documento-versiones-modal.styles.ts** (z-index ya estaba correcto):
```typescript
// ✅ YA IMPLEMENTADO
overlay: 'fixed inset-0 z-[100] flex items-center...'
modalMotivo.overlay: 'fixed inset-0 z-[110] flex items-center...'
```

2. **documento-versiones-modal-vivienda.tsx** (+ Portal):
```diff
+ import { createPortal } from 'react-dom'

  export function DocumentoVersionesModalVivienda({ ... }) {
    // ... código existente ...

    if (!isOpen) return null

-   return (
+   const modalContent = (
      <AnimatePresence>
        <div className={styles.overlay}>
          {/* ... contenido ... */}
        </div>
      </AnimatePresence>
    )

+   return typeof window !== 'undefined'
+     ? createPortal(modalContent, document.body)
+     : null
  }
```

3. **documento-nueva-version-modal.tsx** (+ Portal):
```diff
+ import { createPortal } from 'react-dom'

  export function DocumentoNuevaVersionModal({ ... }) {
    // ... código existente ...

    if (!isOpen) return null

-   return (
+   const modalContent = (
      <AnimatePresence>
-       <div className="fixed inset-0 z-50 flex items-center...">
+       <div className="fixed inset-0 z-[100] flex items-center...">
          {/* ... contenido ... */}
        </div>
      </AnimatePresence>
    )

+   return typeof window !== 'undefined'
+     ? createPortal(modalContent, document.body)
+     : null
  }
```

**Resultado**:
- ✅ Modal renderizado en `document.body` (nivel más alto)
- ✅ Sidebar completamente cubierto por el blur
- ✅ No se ve NADA por detrás del modal
- ✅ Z-index garantizado sin conflictos de orden de renderizado

---

### **Fix #2: Invalidación de Caché de React Query**

**Archivos**:
- `useDocumentoVersiones.ts` (restaurar/eliminar versión)
- `documento-nueva-version-modal.tsx` (subir nueva versión) ✅ **EXTENDIDO**

**Cambios en `useDocumentoVersiones.ts`**:

1. **Import de QueryClient**:
```typescript
// ✅ NUEVO
import { useQueryClient } from '@tanstack/react-query'

export function useDocumentoVersiones(...) {
  const queryClient = useQueryClient() // ← Hook de React Query
  // ...
}
```

2. **Invalidar caché después de restaurar**:
```typescript
const handleRestaurar = async (versionId: string) => {
  // ... código existente ...

  await service.restaurarVersion(versionId, user.id, motivoRestauracion.trim())
  toast.success('Versión restaurada correctamente')

  // ✅ NUEVO: Invalidar caché para forzar recarga de documentos
  const docActual = versiones.find(v => v.id === versionId)
  if (docActual) {
    queryClient.invalidateQueries({
      queryKey: ['documentos-vivienda', docActual.vivienda_id],
    })
  }

  await cargarVersiones()
  onVersionRestaurada?.() // ← Este callback ya no necesita hacer nada
  // ...
}
```

3. **Invalidar caché después de eliminar** (bonus):
```typescript
const handleEliminar = async (versionId: string, versionNumero: number) => {
  // ... código existente ...

  await service.eliminarVersion(versionId, user.id, motivo)
  toast.success('Versión eliminada correctamente')

  // ✅ NUEVO: Invalidar caché también al eliminar
  const docActual = versiones.find(v => v.id === versionId)
  if (docActual) {
    queryClient.invalidateQueries({
      queryKey: ['documentos-vivienda', docActual.vivienda_id],
    })
  }

  await cargarVersiones()
  // ...
}
```

**Cambios en `documento-nueva-version-modal.tsx`** ✅ **NUEVO - 7 NOV 2025**:

1. **Import de QueryClient**:
```typescript
import { useQueryClient } from '@tanstack/react-query'

export function DocumentoNuevaVersionModal(...) {
  const queryClient = useQueryClient() // ✅ NUEVO
  // ...
}
```

2. **Invalidar caché después de subir nueva versión**:
```typescript
const handleSubmit = async (e: FormEvent) => {
  // ... validaciones ...

  try {
    const nuevaVersion = await service.crearNuevaVersion(
      documentoId,
      archivo,
      user.id,
      cambios || undefined
    )

    // ✅ NUEVO: Invalidar caché de React Query para actualizar la lista
    if (nuevaVersion?.vivienda_id) {
      queryClient.invalidateQueries({
        queryKey: ['documentos-vivienda', nuevaVersion.vivienda_id],
      })
    }

    toast.success('Nueva versión creada exitosamente')
    onSuccess?.()
    onClose()
  } catch (error) {
    // ...
  }
}
```

**Razón**:
- `queryClient.invalidateQueries()` marca los datos como "obsoletos"
- React Query automáticamente **refresca** los datos desde el servidor
- La lista de documentos se actualiza **instantáneamente** con la nueva versión actual
- Funciona tanto para **subidas manuales** como para **restauraciones**
- No dependemos de callbacks externos (más robusto)

**Resultado**:
- ✅ Después de restaurar versión 3 → nueva versión 6 creada
- ✅ Lista de documentos muestra **inmediatamente** "OCTUBRE 10 DE 2025"
- ✅ Título, fecha y datos coinciden con la versión actual en DB
- ✅ No más datos antiguos en caché

---

## 🧪 Casos de Prueba

### Test #1: Z-Index del Modal
1. Abrir modal de "Historial de Versiones"
2. **Verificar**: Overlay con blur cubre **completamente** el contenido
3. **Verificar**: No se ve ningún elemento de la página por detrás
4. Click en "Restaurar" de una versión antigua
5. **Verificar**: Modal de motivo aparece **sobre** el modal principal
6. **Verificar**: Ambos overlays se superponen correctamente

**Resultado esperado**: ✅ Blur completo, sin elementos visibles por detrás

---

### Test #2: Actualización de Lista después de Restaurar
1. Abrir vivienda con documento versionado
2. Anotar título actual en lista (ej: "AGOSTO 24 DE 2024")
3. Abrir "Historial de Versiones" del documento
4. Restaurar versión antigua (ej: versión 3)
5. Proporcionar motivo: "Prueba de restauración"
6. **Verificar**: Modal muestra nueva versión 6 como actual
7. Cerrar modal de historial
8. **Verificar**: Lista principal ahora muestra "OCTUBRE 10 DE 2025"
9. **Verificar**: Título, fecha y datos coinciden con nueva versión

**Resultado esperado**: ✅ Lista se actualiza instantáneamente con datos correctos

---

### Test #3: Eliminar Versión
1. Abrir "Historial de Versiones"
2. Eliminar versión no actual (ej: versión 4)
3. Proporcionar motivo de eliminación
4. **Verificar**: Versión desaparece del historial
5. Cerrar modal
6. **Verificar**: Lista principal NO cambia (versión actual no fue eliminada)
7. Reabrir historial
8. **Verificar**: Versión eliminada ya no aparece

**Resultado esperado**: ✅ Eliminación correcta sin afectar versión actual

---

## 📊 Antes vs Después

### Antes del Fix

**Problema 1 - Z-Index**:
```
┌─────────────────────────────────────┐
│  [Página visible por detrás] 🚫     │
│    ┌─────────────────────────┐      │
│    │ [Modal con blur parcial] │     │
│    │ Historial de Versiones   │     │
│    │ [Contenido verde visible]│     │
│    └─────────────────────────┘      │
└─────────────────────────────────────┘
```

**Problema 2 - Caché obsoleto**:
```
Historial:        Lista Principal:
✅ V6 (Actual)    ❌ AGOSTO 24 DE 2024 (V4 antigua)
  V5
  V4 ← antigua
  V3
```

---

### Después del Fix

**Fix 1 - Z-Index correcto**:
```
┌─────────────────────────────────────┐
│  [Blur completo cubriendo todo] ✅   │
│    ┌─────────────────────────┐      │
│    │ Modal - z-index: 100    │      │
│    │ Historial de Versiones   │     │
│    │                          │     │
│    │  ┌────────────────┐      │     │
│    │  │ Motivo z-110   │      │     │
│    │  └────────────────┘      │     │
│    └─────────────────────────┘      │
└─────────────────────────────────────┘
```

**Fix 2 - Datos actualizados**:
```
Historial:        Lista Principal:
✅ V6 (Actual)    ✅ OCTUBRE 10 DE 2025 (V6 actual) ← Sincronizado
  V5
  V4
  V3
```

---

## 🎯 Impacto

### Bug #1 (Z-Index)
- **Severidad**: Media (UX negativa, no funcional)
- **Frecuencia**: 100% (siempre ocurría)
- **Usuarios afectados**: Todos
- **Impacto en producción**: Confusión visual, apariencia no profesional

### Bug #2 (Caché)
- **Severidad**: Alta (datos incorrectos mostrados)
- **Frecuencia**: 100% (en restauraciones Y subidas manuales) ✅ **EXTENDIDO 7 NOV**
- **Usuarios afectados**: Todos
- **Impacto en producción**: Datos erróneos en pantalla, confusión sobre versión actual
- **Fix completo**: Ver `BUGFIX-CACHE-NUEVA-VERSION.md` para detalle de extensión

---

## 📝 Lecciones Aprendidas

### 1. **Z-Index debe ser jerárquico y alto**
- Modales deben usar z-index > 100 para garantizar superposición
- Modales anidados deben incrementar en 10+ unidades
- Documentar jerarquía de z-index en comentarios

### 2. **Invalidación de caché es CRÍTICA**
- Cualquier mutación que cambie datos mostrados DEBE invalidar queries
- No depender de callbacks externos para sincronización
- Usar `queryClient.invalidateQueries()` directamente en el hook que hace la mutación

### 3. **Versionado requiere sincronización cuidadosa**
- Sistema de versiones crea NUEVOS registros (no modifica existentes)
- Caché puede mostrar versiones antiguas si no se invalida
- Siempre verificar que `es_version_actual = true` se refleje en UI

---

## ✅ Checklist de Verificación

### Código
- [x] Z-index de overlay aumentado a 100
- [x] Z-index de modal motivo aumentado a 110
- [x] Import de `useQueryClient` en hook
- [x] Invalidación de caché en `handleRestaurar`
- [x] Invalidación de caché en `handleEliminar`
- [x] No errores de compilación TypeScript
- [x] Comentarios explicativos agregados

### Testing
- [x] Modal de historial cubre completamente contenido
- [x] Modal de motivo aparece sobre modal principal
- [x] Lista se actualiza después de restaurar versión
- [x] Lista se actualiza después de eliminar versión
- [x] Lista se actualiza después de subir nueva versión ✅ **NUEVO 7 NOV**
- [x] Datos mostrados coinciden con versión actual en DB

### Documentación
- [x] Documento de bugfix creado
- [x] Causa raíz documentada
- [x] Solución documentada con código
- [x] Casos de prueba definidos
- [x] Impacto medido y documentado

---

## 🚀 Deployment

**Estado**: ✅ Listo para producción

**Archivos modificados**:
1. `src/modules/viviendas/components/documentos/documento-versiones-modal.styles.ts` (2 líneas - z-index)
2. `src/modules/viviendas/components/documentos/documento-versiones-modal-vivienda.tsx` (15 líneas - Portal)
3. `src/modules/viviendas/components/documentos/documento-nueva-version-modal.tsx` (20 líneas - Portal + invalidación caché) ✅ **BUG #2 TAMBIÉN**
4. `src/modules/viviendas/hooks/useDocumentoVersiones.ts` (25 líneas - invalidación caché en restaurar/eliminar)
5. `src/modules/viviendas/services/documentos-vivienda.service.ts` (15 líneas - tituloOverride) ✅ **BUG #3**

**Sin breaking changes**: ✅
**Backward compatible**: ✅
**Requiere migración**: ❌

**Instrucciones**:
1. Hacer pull del código
2. Recargar navegador (Ctrl+Shift+R para limpiar caché)
3. Verificar que modal de versiones cubre completamente contenido
4. Probar restaurar una versión y verificar actualización de lista

---

## 🐛 Issues Relacionados

**Reportado por**: Usuario (capturas de pantalla)
**Fecha de reporte**: 7 de noviembre, 2025
**Fecha de resolución**: 7 de noviembre, 2025
**Tiempo de resolución**: < 1 hora

---

**Resumen**: Tres bugs críticos en sistema de versionado resueltos:

1. **Blur del modal mal posicionado** - Sidebar visible por detrás del overlay. Causa: Sidebar renderizado después del modal en el DOM, z-index insuficiente. Solución: Portal de React (`createPortal`) para renderizar modal en `document.body` (nivel más alto del DOM), garantizando overlay sobre TODOS los elementos.

2. **Lista mostrando datos obsoletos** - Versión actual correcta en DB pero lista mostraba datos de versión antigua. Causa: Falta de invalidación de caché de React Query después de restaurar versión O subir nueva versión. Solución: Usar `queryClient.invalidateQueries()` directamente en hook de versiones Y en modal de nueva versión para forzar recarga inmediata de datos. ✅ **EXTENDIDO** a subidas manuales (7 NOV) - Ver `BUGFIX-CACHE-NUEVA-VERSION.md`

3. **Título incorrecto en TODAS las nuevas versiones** - Sistema usaba título del documento padre en vez del archivo nuevo, afectando 100% de versiones (manuales Y restauraciones). Causa: `crearNuevaVersion()` SIEMPRE usaba `docOriginal.titulo` (padre) en vez de `archivo.name` (nuevo). Solución: Cambiar comportamiento por defecto para SIEMPRE extraer título del archivo nuevo, con parámetro `tituloOverride` opcional para casos especiales. Ver `BUGFIX-TITULO-VERSION-RESTAURADA.md` para análisis completo.

3. **Título incorrecto después de restaurar** - Nueva versión con título del documento padre en vez del archivo restaurado. Causa: `crearNuevaVersion()` usaba `docOriginal.titulo` sin importar qué versión se restauraba. Solución: Parámetro opcional `tituloOverride` para especificar título exacto extraído del `nombre_original` de la versión origen. **Ver documentación completa**: `BUGFIX-TITULO-VERSION-RESTAURADA.md`

Todos los problemas resueltos con cambios mínimos, sin breaking changes, backward compatible.
