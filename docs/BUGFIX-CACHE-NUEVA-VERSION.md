# 🐛 BUGFIX: Caché no se actualiza al subir nueva versión

**Fecha**: 7 de noviembre, 2025
**Estado**: ✅ **RESUELTO**
**Relacionado**: BUGFIX-DOCUMENTOS-VERSIONES.md (Bug #2 - extensión)

---

## 🔴 Problema

### **Síntoma**
Al subir una **nueva versión** de un documento:
1. ✅ La notificación "Nueva versión creada exitosamente" aparece correctamente
2. ✅ El modal se cierra
3. ❌ El nombre del documento **NO se actualiza** en la lista principal
4. ❌ El nombre del documento **NO se actualiza** en "Recientes"
5. ❌ El nombre del documento **NO se actualiza** en "Por Categoría"
6. ✅ Solo después de **refrescar la página** se ve el nuevo nombre

### **Evidencia**
```
Usuario sube nueva versión "NOVIEMBRE 6 DE 2025.pdf"
↓
Sistema crea versión correctamente en DB
↓
Lista sigue mostrando: "AGOSTO 24 DE 2024" ❌ (versión anterior en caché)
↓
Usuario refresca página (Ctrl+R)
↓
Lista ahora muestra: "NOVIEMBRE 6 DE 2025" ✅
```

---

## 🔍 Análisis de Causa Raíz

### **Flujo del Bug**

```typescript
// documento-nueva-version-modal.tsx (ANTES del fix)

const handleSubmit = async (e: FormEvent) => {
  // ... validaciones ...

  try {
    await service.crearNuevaVersion(
      documentoId,
      archivo,
      user.id,
      cambios || undefined
    )

    toast.success('Nueva versión creada exitosamente')
    onSuccess?.()  // ❌ Callback NO invalida caché
    onClose()
  } catch (error) {
    // ...
  }
}
```

### **Problema Fundamental**

1. **Documento se crea correctamente en DB** ✅
2. **React Query mantiene caché de 5 minutos** (configurado en `useDocumentosVivienda`)
3. **Modal llama a `onSuccess?.()` callback** → pero este callback NO invalida el caché
4. **Lista sigue mostrando datos antiguos** del caché de React Query
5. **Solo refresco manual** (`staleTime` expirado) actualiza la lista

### **Comparación con Restauración**

| Acción | Caché Invalidado | Resultado |
|--------|-----------------|-----------|
| **Restaurar versión** | ✅ Sí (fix previo) | Lista se actualiza instantáneamente ✅ |
| **Subir nueva versión** | ❌ No (bug reportado) | Lista NO se actualiza ❌ |

---

## ✅ Solución Implementada

### **Estrategia**: Invalidar caché de React Query en modal de nueva versión

**Archivo modificado**: `documento-nueva-version-modal.tsx`

### **Paso 1: Import de QueryClient**

```diff
  import { useAuth } from '@/contexts/auth-context'
+ import { useQueryClient } from '@tanstack/react-query'
  import { AnimatePresence, motion } from 'framer-motion'
  // ...
```

### **Paso 2: Hook de QueryClient**

```diff
  export function DocumentoNuevaVersionModal({ ... }) {
    const { user } = useAuth()
+   const queryClient = useQueryClient() // ✅ NUEVO
    const [archivo, setArchivo] = useState<File | null>(null)
    // ...
  }
```

### **Paso 3: Invalidar caché después de crear versión**

```diff
  const handleSubmit = async (e: FormEvent) => {
    // ... validaciones ...

    try {
-     await service.crearNuevaVersion(
+     const nuevaVersion = await service.crearNuevaVersion(
        documentoId,
        archivo,
        user.id,
        cambios || undefined
      )

+     // ✅ NUEVO: Invalidar caché de React Query para actualizar la lista
+     if (nuevaVersion?.vivienda_id) {
+       queryClient.invalidateQueries({
+         queryKey: ['documentos-vivienda', nuevaVersion.vivienda_id],
+       })
+     }

      toast.success('Nueva versión creada exitosamente')
      onSuccess?.()
      onClose()
    } catch (error) {
      // ...
    }
  }
```

---

## 📊 Antes vs Después

### **Antes del Fix**

```
Usuario sube "NOVIEMBRE 6 DE 2025.pdf"
↓
Modal: crearNuevaVersion() → DB actualizada ✅
↓
Modal: onSuccess?.() → callback vacío ❌
↓
Modal: onClose() → modal se cierra
↓
Lista: React Query retorna caché (5 min staleTime)
↓
Lista muestra: "AGOSTO 24 DE 2024" ❌ (versión anterior)
↓
Usuario: F5 (refrescar página)
↓
Lista muestra: "NOVIEMBRE 6 DE 2025" ✅
```

### **Después del Fix**

```
Usuario sube "NOVIEMBRE 6 DE 2025.pdf"
↓
Modal: crearNuevaVersion() → DB actualizada ✅
↓
Modal: queryClient.invalidateQueries() → marca caché como obsoleto ✅
↓
Modal: onClose() → modal se cierra
↓
Lista: React Query detecta caché obsoleto
↓
Lista: Refresca datos desde DB automáticamente
↓
Lista muestra: "NOVIEMBRE 6 DE 2025" ✅ (INSTANTÁNEO, sin F5)
```

---

## 🧪 Casos de Prueba

### **Test #1: Subir nueva versión manualmente**

**Pasos**:
1. Documento actual: "VERSION 1.pdf"
2. Clic en "Nueva Versión"
3. Subir archivo "VERSION 2.pdf"
4. Clic en "Subir"
5. **NO refrescar página**
6. Verificar lista principal

**Resultado esperado**:
- ✅ Notificación "Nueva versión creada exitosamente"
- ✅ Modal se cierra automáticamente
- ✅ Lista principal muestra "VERSION 2" INSTANTÁNEAMENTE (sin F5)
- ✅ Sección "Recientes" muestra "VERSION 2"
- ✅ Sección "Por Categoría" muestra "VERSION 2"

---

### **Test #2: Subir versión con título diferente**

**Pasos**:
1. Documento actual: "AGOSTO 24 DE 2024.pdf" (versión 1)
2. Subir nueva versión "NOVIEMBRE 6 DE 2025.pdf" (versión 2)
3. Verificar actualización SIN refrescar

**Resultado esperado**:
- ✅ Lista cambia de "AGOSTO 24 DE 2024" → "NOVIEMBRE 6 DE 2025" INSTANTÁNEAMENTE
- ✅ Sin necesidad de Ctrl+R / F5

---

### **Test #3: Subir versión → Restaurar versión anterior → Subir otra**

**Pasos**:
1. Documento actual: "V1.pdf"
2. Subir "V2.pdf" → verificar lista
3. Restaurar V1 → verificar lista
4. Subir "V3.pdf" → verificar lista
5. **NO refrescar en ningún paso**

**Resultado esperado**:
- ✅ Cada acción actualiza la lista INSTANTÁNEAMENTE
- ✅ No se requiere refrescar página en ningún momento
- ✅ Lista siempre muestra la versión actual correcta

---

## 🎯 Impacto

### **Antes del Fix**
- **Severidad**: Media-Alta
- **Frecuencia**: 100% (en todas las subidas de nueva versión)
- **UX**: Confusa - usuario no ve cambios sin refrescar
- **Workaround**: Refrescar página manualmente (F5)

### **Después del Fix**
- ✅ Actualización instantánea sin refrescar
- ✅ UX fluida y predecible
- ✅ Consistencia entre subidas manuales y restauraciones
- ✅ React Query maneja caché automáticamente

---

## 📝 Notas Técnicas

### **¿Por qué funciona?**

1. **React Query** mantiene caché de queries basado en `queryKey`
2. `queryClient.invalidateQueries()` marca esa query como "stale" (obsoleta)
3. React Query **automáticamente refresca** datos de queries "stale" activas
4. Como el componente está renderizado, React Query hace refetch inmediato
5. Lista se actualiza sin intervención del usuario

### **Alternativas consideradas**

| Solución | Ventaja | Desventaja | Elegida |
|----------|---------|------------|---------|
| `queryClient.invalidateQueries()` | Automático, robusto | Requiere query activa | ✅ Sí |
| `queryClient.setQueryData()` | Actualización instantánea | Requiere duplicar lógica de transformación | ❌ No |
| Callback `onSuccess` manual | Simple | Frágil, depende de implementación externa | ❌ No |
| Polling (refetch cada X segundos) | Siempre actualizado | Consumo de red excesivo | ❌ No |

### **Patrón aplicado**

Este fix aplica el **mismo patrón** usado en:
- ✅ Restaurar versión (`useDocumentoVersiones.ts`)
- ✅ Eliminar versión (`useDocumentoVersiones.ts`)
- ✅ Subir nueva versión (`documento-nueva-version-modal.tsx`) ← **NUEVO**

**Consistencia**: Todas las operaciones de versiones invalidan caché de la misma manera.

---

## 🚀 Deployment

**Estado**: ✅ Listo para producción

**Archivo modificado**:
- `src/modules/viviendas/components/documentos/documento-nueva-version-modal.tsx` (10 líneas)

**Sin breaking changes**: ✅
**Backward compatible**: ✅
**Requiere migración**: ❌

**Instrucciones de prueba**:
1. Hacer pull del código
2. Recargar navegador (Ctrl+Shift+R)
3. Subir nueva versión de documento
4. Verificar que lista se actualiza SIN refrescar página

---

## 🔗 Relacionado

- **BUGFIX-DOCUMENTOS-VERSIONES.md** - Bug #2 (restauración) - mismo patrón
- **BUGFIX-TITULO-VERSION-RESTAURADA.md** - Bug #3 (títulos) - misma funcionalidad
- **useDocumentosVivienda.ts** - Query con caché de 5 minutos

---

**Resumen**: Subir nueva versión ahora invalida el caché de React Query, causando actualización instantánea de la lista de documentos sin necesidad de refrescar la página. Aplica el mismo patrón usado en restauraciones y eliminaciones de versiones.
