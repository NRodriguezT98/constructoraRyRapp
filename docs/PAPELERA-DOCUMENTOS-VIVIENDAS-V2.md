# 🗑️ Sistema de Papelera con Selección de Versiones - Documentos Viviendas V2

## 📋 Descripción

Nuevo sistema de papelera mejorado que permite seleccionar versiones específicas de documentos para restaurar o eliminar permanentemente.

---

## 🎯 Características

### ✅ Lo que puedes hacer:

1. **Ver documentos eliminados** organizados jerárquicamente (raíz + versiones)
2. **Seleccionar versiones individuales** con checkboxes
3. **Seleccionar todo el documento** (checkbox maestro)
4. **Restaurar versiones seleccionadas**
5. **Eliminar permanentemente versiones seleccionadas**
6. **Expandir/colapsar versiones** para ver detalles

---

## 🔧 Implementación

### 1. Hook: `useDocumentosPapeleraV2`

```typescript
import { useDocumentosPapeleraV2 } from '@/modules/viviendas/hooks/useDocumentosPapelera.v2'

function MiComponente({ viviendaId }: { viviendaId: string }) {
  const {
    // Data
    documentosEliminados, // Array jerárquico con raíz + versiones
    isLoading,
    cantidadEliminados,

    // Selección
    versionesSeleccionadas, // Record<string, Set<string>>
    toggleVersionSeleccionada, // (raizId, versionId) => void
    toggleTodasVersiones, // (raizId, documento) => void
    limpiarSeleccion, // (raizId) => void

    // Actions
    handleRestaurar, // (id, titulo, esRaiz) => Promise<void>
    handleEliminarSeleccionadas, // (raizId, titulo) => Promise<void>

    // States
    isRestaurando,
    isEliminandoPermanente,
  } = useDocumentosPapeleraV2({ viviendaId })

  // Tu código...
}
```

### 2. Estructura de datos

```typescript
interface DocumentoEliminadoJerarquico {
  id: string
  titulo: string
  version: number
  documento_padre_id: string | null
  metadata: any
  fecha_creacion: string
  versiones: DocumentoEliminadoJerarquico[] // Versiones hijas
  total_versiones: number // Total incluyendo hijas (raíz + versiones)
}
```

### 3. Ejemplo de UI completo

```tsx
import { useState } from 'react'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PapeleraDocumentosV2({ viviendaId }: { viviendaId: string }) {
  const {
    documentosEliminados,
    isLoading,
    versionesSeleccionadas,
    toggleVersionSeleccionada,
    toggleTodasVersiones,
    handleRestaurar,
    handleEliminarSeleccionadas,
    isRestaurando,
    isEliminandoPermanente,
  } = useDocumentosPapeleraV2({ viviendaId })

  const [documentosExpandidos, setDocumentosExpandidos] = useState<Set<string>>(new Set())

  const toggleExpansion = (id: string) => {
    setDocumentosExpandidos(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(id)) {
        nuevo.delete(id)
      } else {
        nuevo.add(id)
      }
      return nuevo
    })
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (documentosEliminados.length === 0) {
    return (
      <div className="text-center py-12">
        <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">No hay documentos eliminados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documentosEliminados.map((doc) => {
        const estaExpandido = documentosExpandidos.has(doc.id)
        const seleccionadas = versionesSeleccionadas[doc.id] || new Set()
        const todasSeleccionadas =
          seleccionadas.size > 0 &&
          seleccionadas.size === doc.total_versiones
        const algunasSeleccionadas =
          seleccionadas.size > 0 &&
          seleccionadas.size < doc.total_versiones

        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-900/50 shadow-sm"
          >
            {/* Card principal (documento raíz) */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Checkbox maestro */}
                <input
                  type="checkbox"
                  checked={todasSeleccionadas}
                  ref={el => {
                    if (el) el.indeterminate = algunasSeleccionadas
                  }}
                  onChange={() => toggleTodasVersiones(doc.id, doc)}
                  className="w-5 h-5 mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />

                {/* Botón expandir/colapsar */}
                {doc.versiones.length > 0 && (
                  <button
                    onClick={() => toggleExpansion(doc.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {estaExpandido ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Info del documento */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {doc.titulo}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Eliminado por:</span>{' '}
                      {doc.metadata?.eliminado_por || 'Desconocido'}
                    </p>
                    <p>
                      <span className="font-medium">Fecha:</span>{' '}
                      {new Date(doc.metadata?.fecha_eliminacion || doc.fecha_creacion).toLocaleString('es-CO')}
                    </p>
                    <p>
                      <span className="font-medium">Versiones:</span> {doc.total_versiones}
                    </p>
                    {seleccionadas.size > 0 && (
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        {seleccionadas.size} seleccionada(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleRestaurar(doc.id, doc.titulo, true)}
                    disabled={isRestaurando}
                    className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    ↩️ Restaurar Todo
                  </button>

                  {seleccionadas.size > 0 && (
                    <button
                      onClick={() => handleEliminarSeleccionadas(doc.id, doc.titulo)}
                      disabled={isEliminandoPermanente}
                      className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      🔥 Eliminar {seleccionadas.size}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de versiones expandible */}
            <AnimatePresence>
              {estaExpandido && doc.versiones.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-red-200 dark:border-red-900/50 overflow-hidden"
                >
                  <div className="p-4 bg-red-50/30 dark:bg-red-900/10">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Versiones anteriores:
                    </h4>
                    <div className="space-y-2">
                      {doc.versiones.map((version) => (
                        <div
                          key={version.id}
                          className="flex items-center gap-3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={seleccionadas.has(version.id)}
                            onChange={() => toggleVersionSeleccionada(doc.id, version.id)}
                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              Versión {version.version}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(version.fecha_creacion).toLocaleString('es-CO')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRestaurar(version.id, `${doc.titulo} (v${version.version})`, false)}
                            disabled={isRestaurando}
                            className="px-2 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                          >
                            ↩️ Restaurar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
```

---

## 🎨 Funcionalidades clave de la UI

### 1. **Checkbox Maestro (raíz)**
- ✅ **Checked**: Todas las versiones seleccionadas
- 🔵 **Indeterminate**: Algunas versiones seleccionadas
- ❌ **Unchecked**: Ninguna seleccionada

### 2. **Checkboxes individuales (versiones)**
- Seleccionar/deseleccionar versión específica
- Estado independiente de otras versiones

### 3. **Botón de expansión**
- Solo visible si hay versiones (`doc.versiones.length > 0`)
- Chevron cambia según estado (Down/Right)

### 4. **Acciones disponibles**
- **"Restaurar Todo"**: Siempre visible, restaura documento completo
- **"Eliminar X"**: Solo si hay seleccionadas, elimina solo las marcadas

---

## 🔥 Flujo de eliminación permanente

```typescript
// 1. Usuario selecciona versiones con checkboxes
toggleVersionSeleccionada(raizId, versionId) // Individual
toggleTodasVersiones(raizId, documento) // Todas

// 2. Clic en "Eliminar X"
handleEliminarSeleccionadas(raizId, titulo)

// 3. Triple confirmación:
//    a) Advertencia de irreversibilidad
//    b) Solicitar motivo (mín 20 chars)
//    c) Confirmación final con motivo

// 4. Eliminación en paralelo de todas las seleccionadas
Promise.all(ids.map(id => service.eliminarPermanente(...)))

// 5. Actualización de cache y limpiar selección
```

---

## ⚡ Ventajas del sistema V2

1. ✅ **Flexibilidad total**: Elimina 1 versión, varias, o todas
2. ✅ **UX clara**: Checkbox + contador de seleccionadas
3. ✅ **Seguridad**: Triple confirmación + motivo obligatorio
4. ✅ **Performance**: Promise.all para eliminaciones paralelas
5. ✅ **Estado local**: No afecta otros documentos
6. ✅ **Visual feedback**: Checkbox indeterminate, contador

---

## 📝 Notas importantes

- **Admin Only**: Solo Administradores ven la papelera
- **Restauración**: Restaurar raíz = restaurar todas las versiones automáticamente
- **Eliminación**: Se eliminan PERMANENTEMENTE de DB + Storage
- **Motivo obligatorio**: Mínimo 20 caracteres para auditoria
- **No undo**: Eliminación permanente NO se puede deshacer

---

## 🚀 Implementación en proyecto

### Paso 1: Importar hook V2
```typescript
import { useDocumentosPapeleraV2 } from '@/modules/viviendas/hooks/useDocumentosPapelera.v2'
```

### Paso 2: Reemplazar en componente `DocumentosListaVivienda`
```typescript
// Antes
const {...} = useDocumentosPapelera({ viviendaId })

// Ahora
const {...} = useDocumentosPapeleraV2({ viviendaId })
```

### Paso 3: Actualizar UI con checkboxes y expansión
Ver ejemplo completo arriba ☝️

---

## ✅ Checklist de migración

- [ ] Instalar dependencias (Framer Motion ya está)
- [ ] Importar hook V2
- [ ] Crear estado `documentosExpandidos`
- [ ] Agregar checkboxes (maestro + individuales)
- [ ] Implementar botón expandir/colapsar
- [ ] Agregar AnimatePresence para versiones
- [ ] Actualizar handlers de acciones
- [ ] Probar flujo completo de selección/eliminación
- [ ] Verificar triple confirmación funciona
- [ ] Validar que eliminación afecta solo seleccionadas

---

**Fecha creación**: 2025-11-08
**Versión**: 2.0
**Autor**: Sistema RyR - Papelera Avanzada
