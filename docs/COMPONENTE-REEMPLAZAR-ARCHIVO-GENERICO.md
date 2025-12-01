# 🔄 Componente Genérico: ReemplazarArchivoModal

## 📋 Descripción

Componente modal reutilizable para reemplazar archivos de documentos en **cualquier módulo** (proyectos, viviendas, clientes) con:

- ✅ **Servicio genérico único** (sin duplicación de código)
- ✅ **Diseño compacto** (sin scroll necesario)
- ✅ **Theming dinámico** por módulo
- ✅ **Separación de responsabilidades** estricta
- ✅ **Rollback automático** en caso de error
- ✅ **Backup verificado** antes de proceder

---

## 🎯 Uso en Diferentes Módulos

### **1. Proyectos (Verde/Esmeralda)**

```typescript
import { ReemplazarArchivoModal } from '@/shared/components'

function DocumentosProyecto() {
  const [modalOpen, setModalOpen] = useState(false)
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null)

  return (
    <>
      <button onClick={() => {
        setDocumentoSeleccionado(documento)
        setModalOpen(true)
      }}>
        Reemplazar archivo
      </button>

      <ReemplazarArchivoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        documentoId={documentoSeleccionado?.id}
        nombreArchivoActual={documentoSeleccionado?.nombre_archivo}
        tipoEntidad="proyecto" // ← TIPO DE ENTIDAD
        moduleName="proyectos" // ← TEMA VERDE
        onSuccess={() => {
          // Invalidar queries
          queryClient.invalidateQueries(['documentos-proyecto'])
          setModalOpen(false)
        }}
      />
    </>
  )
}
```

### **2. Viviendas (Naranja/Ámbar)**

```typescript
import { ReemplazarArchivoModal } from '@/shared/components'

function DocumentosVivienda() {
  return (
    <ReemplazarArchivoModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      documentoId={documento.id}
      nombreArchivoActual={documento.nombre_archivo}
      tipoEntidad="vivienda" // ← TIPO DE ENTIDAD
      moduleName="viviendas" // ← TEMA NARANJA
      onSuccess={() => {
        queryClient.invalidateQueries(['documentos-vivienda'])
      }}
    />
  )
}
```

### **3. Clientes (Cyan/Azul)**

```typescript
import { ReemplazarArchivoModal } from '@/shared/components'

function DocumentosCliente() {
  return (
    <ReemplazarArchivoModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      documentoId={documento.id}
      nombreArchivoActual={documento.nombre_archivo}
      tipoEntidad="cliente" // ← TIPO DE ENTIDAD
      moduleName="clientes" // ← TEMA CYAN
      onSuccess={() => {
        queryClient.invalidateQueries(['documentos-cliente'])
      }}
    />
  )
}
```

---

## 🎨 Props del Componente

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `isOpen` | `boolean` | ✅ | Estado de apertura del modal |
| `onClose` | `() => void` | ✅ | Callback al cerrar |
| `documentoId` | `string` | ✅ | ID del documento a reemplazar |
| `nombreArchivoActual` | `string` | ✅ | Nombre del archivo actual (muestra en UI) |
| `tipoEntidad` | `'proyecto' \| 'vivienda' \| 'cliente'` | ✅ | Tipo de entidad (determina tabla/bucket) |
| `moduleName` | `ModuleName` | ❌ | Tema visual (default: `'proyectos'`) |
| `onSuccess` | `() => void` | ❌ | Callback al completar exitosamente |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│          COMPONENTE UI (COMPARTIDO)                     │
│   ReemplazarArchivoModal.tsx                            │
│   - Presentacional puro (< 150 líneas)                  │
│   - Theming dinámico con moduleThemes                   │
│   - Diseño compacto (sin scroll)                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          SERVICIO GENÉRICO (LÓGICA)                     │
│   documentos-reemplazo.service.ts                       │
│   - Validación de admin + contraseña                    │
│   - Backup verificado                                   │
│   - Reemplazo en storage                                │
│   - Update en BD                                        │
│   - Rollback automático si falla                        │
│   - Auditoría completa                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│     CONFIGURACIÓN DINÁMICA (TYPES)                      │
│   entidad.types.ts                                      │
│   - obtenerConfiguracionEntidad(tipoEntidad)            │
│   - Retorna: { tabla, bucket, campoEntidad }            │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Características del Diseño

### **Compacto (Sin Scroll)**
- Modal: `max-w-lg` (en lugar de `max-w-2xl`)
- Header: `p-4` (en lugar de `p-6`)
- Content: `p-4 space-y-3` (en lugar de `p-6 space-y-6`)
- Labels: `text-xs` (en lugar de `text-sm`)
- Textarea: `rows={2}` (en lugar de `rows={3}`)
- Iconos: `w-4 h-4` (en lugar de `w-5 h-5`)

### **Responsivo y Accesible**
- ✅ Responsive (mobile-first)
- ✅ Dark mode completo
- ✅ Estados disabled durante submit
- ✅ Validación inline (contador de caracteres)
- ✅ Feedback visual con toast
- ✅ Animaciones suaves (Framer Motion)

### **UX Mejorado**
- ✅ Archivo seleccionado muestra nombre + tamaño
- ✅ Botón de eliminar archivo seleccionado
- ✅ Contador de caracteres en tiempo real
- ✅ Validación: motivo mínimo 10 caracteres
- ✅ Spinner durante procesamiento
- ✅ Deshabilitado inteligente (no permite cerrar durante submit)

---

## 🔐 Seguridad

1. **Validación de Rol:** Solo administradores pueden reemplazar archivos
2. **Contraseña Requerida:** Validación en backend con RPC function
3. **Backup Verificado:** Se verifica que el backup existe antes de reemplazar
4. **Rollback Automático:** Si falla el update, restaura el archivo original
5. **Auditoría Completa:** Registra todo en `audit_log` con metadata enriquecida

---

## 🚀 Ventajas vs Implementación Anterior

| Aspecto | Anterior | Actual |
|---------|----------|--------|
| **Código duplicado** | 3 servicios × 254 líneas = 762 líneas | 1 servicio genérico = 350 líneas ✅ |
| **Mantenibilidad** | Cambios en 3 lugares | 1 solo lugar ✅ |
| **Escalabilidad** | Crear nuevo módulo = copiar todo | Agregar 5 líneas en config ✅ |
| **Diseño** | No estandarizado | Compacto y consistente ✅ |
| **Theming** | Hardcodeado | Dinámico por módulo ✅ |
| **Rollback** | ❌ No existía | ✅ Automático |
| **Verificación backup** | ❌ No verificaba | ✅ Verifica antes de proceder |

---

## 📦 Archivos del Sistema

```
src/
├── shared/
│   └── components/
│       ├── documentos/
│       │   ├── ReemplazarArchivoModal.tsx  ← COMPONENTE UI
│       │   └── index.ts
│       └── index.ts
│
├── modules/
│   └── documentos/
│       ├── services/
│       │   └── documentos-reemplazo.service.ts  ← SERVICIO GENÉRICO
│       └── types/
│           └── entidad.types.ts  ← CONFIGURACIÓN
│
└── shared/
    └── config/
        └── module-themes.ts  ← THEMING
```

---

## 🎯 Ejemplo Completo con Hook

```typescript
import { useState } from 'react'
import { ReemplazarArchivoModal } from '@/shared/components'
import { useQueryClient } from '@tanstack/react-query'

export function DocumentosTab({ proyectoId }: { proyectoId: string }) {
  const queryClient = useQueryClient()
  const [modalReemplazar, setModalReemplazar] = useState({
    isOpen: false,
    documento: null as any
  })

  const handleReemplazar = (documento: any) => {
    setModalReemplazar({
      isOpen: true,
      documento
    })
  }

  const handleReemplazarSuccess = () => {
    // Invalidar caché de documentos
    queryClient.invalidateQueries(['documentos-proyecto', proyectoId])

    // Cerrar modal
    setModalReemplazar({ isOpen: false, documento: null })

    // Opcional: mostrar toast adicional
    toast.success('Documento actualizado en la lista')
  }

  return (
    <>
      {/* Lista de documentos */}
      {documentos.map(doc => (
        <div key={doc.id}>
          <button onClick={() => handleReemplazar(doc)}>
            Reemplazar
          </button>
        </div>
      ))}

      {/* Modal genérico */}
      <ReemplazarArchivoModal
        isOpen={modalReemplazar.isOpen}
        onClose={() => setModalReemplazar({ isOpen: false, documento: null })}
        documentoId={modalReemplazar.documento?.id}
        nombreArchivoActual={modalReemplazar.documento?.nombre_archivo}
        tipoEntidad="proyecto"
        moduleName="proyectos"
        onSuccess={handleReemplazarSuccess}
      />
    </>
  )
}
```

---

## ✅ Checklist de Uso

Antes de implementar en tu módulo, verifica:

- [ ] Importar desde `@/shared/components`
- [ ] Pasar `tipoEntidad` correcto (`'proyecto'`, `'vivienda'`, `'cliente'`)
- [ ] Pasar `moduleName` para theming apropiado
- [ ] Implementar `onSuccess` con invalidación de queries
- [ ] Validar que el usuario tenga permisos de admin
- [ ] Probar con archivos grandes (> 10MB)
- [ ] Probar dark mode
- [ ] Probar responsive (mobile)

---

## 📚 Documentación Relacionada

- **Servicio genérico:** `docs/MEJORAS-ESCALABILIDAD-ARQUITECTURA.md`
- **Sistema de theming:** `docs/SISTEMA-THEMING-MODULAR.md`
- **Separación de responsabilidades:** `docs/ARQUITECTURA-SEPARACION-RESPONSABILIDADES.md`
- **Guía de diseño:** `docs/GUIA-DISENO-MODULOS.md`

---

**Última actualización:** 1 de Diciembre de 2025
**Estado:** ✅ Implementado y listo para usar
