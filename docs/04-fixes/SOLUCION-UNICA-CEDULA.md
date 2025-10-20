# ✅ Solución Final: Gestión Única de Cédula del Cliente

## 🎯 PRINCIPIO FUNDAMENTAL

**"1 documento = 1 lugar para subirlo = 1 lugar para validarlo"**

---

## ✅ **DECISIÓN FINAL: OPCIÓN A + TAB DOCUMENTOS**

### Combinación perfecta:
- ✅ **Campo directo** en `clientes.documento_identidad_url` (validación rápida)
- ✅ **UN SOLO LUGAR** para gestionar: **Tab "Documentos"** del cliente
- ✅ **Sección especial** "Documentos de Identidad" (separada de otros docs)
- ✅ **Validación única** desde ese campo

---

## 📍 **EL ÚNICO LUGAR: Tab Documentos**

### Estructura del Tab:

```
┌─────────────────────────────────────────────────────────────┐
│  TAB: DOCUMENTOS                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  📋 DOCUMENTOS DE IDENTIDAD (REQUERIDOS)             ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🆔 Cédula de Ciudadanía                            │   │
│  │                                                      │   │
│  │  [ SI NO ESTÁ SUBIDA ]                              │   │
│  │  ⚠️ Requerido para iniciar negociaciones            │   │
│  │                                                      │   │
│  │  [📤 Subir Cédula de Ciudadanía]  ← ÚNICO BOTÓN    │   │
│  │                                                      │   │
│  │  [ SI YA ESTÁ SUBIDA ]                              │   │
│  │  ✅ Documento cargado                               │   │
│  │  📄 cedula-1234567890.pdf                          │   │
│  │  📅 Subido: 15/10/2024                             │   │
│  │                                                      │   │
│  │  [👁️ Ver]  [🔄 Reemplazar]  [🗑️ Eliminar]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  📁 OTROS DOCUMENTOS                                 ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                              │
│  [+ Agregar Documento]                                      │
│                                                              │
│  📄 Promesa de compraventa                                  │
│  📄 Carta de intención                                      │
│  📄 Extracto bancario                                       │
│  ...                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUJO COMPLETO UNIFICADO**

### **PASO 1: Usuario crea cliente**
```
Formulario Crear Cliente
├── Nombres ✅
├── Apellidos ✅
├── Número documento ✅
├── Email ✅
└── [Crear Cliente] → Cliente creado SIN cédula
```
**NO se pide cédula aquí.**

---

### **PASO 2: Usuario entra a detalle del cliente**
```
Cliente Detalle Page
├── Tab "Información" (activo por defecto)
├── Tab "Viviendas"
├── Tab "Negociaciones"  ← Banner: "⚠️ Cédula requerida"
└── Tab "Documentos"      ← EL ÚNICO LUGAR
```

Si NO tiene cédula:
- ✅ **Banner sutil** en Tab "Negociaciones":
  ```
  ⚠️ Para crear negociaciones, primero sube la cédula en la pestaña "Documentos"
  ```
- ✅ Botón "Crear Negociación" **deshabilitado**

---

### **PASO 3: Usuario va a Tab "Documentos"** ⭐
```
Tab Documentos
├── Sección: "DOCUMENTOS DE IDENTIDAD (REQUERIDOS)"
│   └── Card: Cédula de Ciudadanía
│       ├── Estado: ⚠️ NO SUBIDA
│       └── [📤 Subir Cédula de Ciudadanía]  ← ÚNICO LUGAR
└── Sección: "OTROS DOCUMENTOS"
    └── Lista de documentos generales...
```

Usuario click **"Subir Cédula de Ciudadanía"** → Abre `ModalSubirCedula`

---

### **PASO 4: Modal de subida**
```
┌──────────────────────────────────────┐
│  Subir Cédula de Ciudadanía         │
│  Juan Pérez - CC 1234567890          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  📤 Arrastra o click aquí      │ │
│  │  PDF, JPG, PNG (máx. 5MB)      │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Cancelar]  [Subir Documento]      │
└──────────────────────────────────────┘
```

Al subir:
1. Archivo → Supabase Storage
2. URL → `clientes.documento_identidad_url`
3. UI actualiza → Muestra archivo cargado
4. **Tab "Negociaciones"** → Banner desaparece + Botón habilitado

---

### **PASO 5: Usuario vuelve a Tab "Documentos"**
```
Tab Documentos
├── Sección: "DOCUMENTOS DE IDENTIDAD (REQUERIDOS)"
│   └── Card: Cédula de Ciudadanía
│       ├── Estado: ✅ CARGADA
│       ├── 📄 cedula-1234567890.pdf
│       ├── 📅 Subido: 15/10/2024
│       └── [👁️ Ver]  [🔄 Reemplazar]  [🗑️ Eliminar]
```

---

### **PASO 6: Usuario va a Tab "Negociaciones"**
```
Tab Negociaciones
├── Lista de negociaciones (si hay)
└── [➕ Crear Negociación]  ← AHORA HABILITADO ✅
```

Click "Crear Negociación":
1. **Validación automática**: `if (!cliente.documento_identidad_url)`
2. Si falta → Modal de error (aunque no debería pasar):
   ```
   ⚠️ Cédula Requerida
   Debes subir la cédula en la pestaña "Documentos"
   [Ir a Documentos]  [Cancelar]
   ```
3. Si tiene → Wizard abre normalmente ✅

---

## 🎨 **IMPLEMENTACIÓN: 1 Solo Componente Clave**

### **Archivo: SeccionDocumentosIdentidad.tsx**

```typescript
// src/modules/clientes/components/documentos/seccion-documentos-identidad.tsx

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Eye, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ModalSubirCedula from '../modals/modal-subir-cedula';

interface SeccionDocumentosIdentidadProps {
  clienteId: string;
  clienteNombre: string;
  numeroDocumento: string;
  documentoIdentidadUrl: string | null;
  onActualizar: (url: string) => void;
}

export default function SeccionDocumentosIdentidad({
  clienteId,
  clienteNombre,
  numeroDocumento,
  documentoIdentidadUrl,
  onActualizar
}: SeccionDocumentosIdentidadProps) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  const tieneCedula = !!documentoIdentidadUrl;

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar la cédula? Esto bloqueará la creación de negociaciones.')) {
      return;
    }

    setCargando(true);
    try {
      // Eliminar de Storage (opcional)
      // ...

      // Limpiar campo en cliente
      const { error } = await supabase
        .from('clientes')
        .update({ documento_identidad_url: null })
        .eq('id', clienteId);

      if (error) throw error;

      onActualizar(null);
      toast.success('Cédula eliminada');
    } catch (error: any) {
      console.error('Error eliminando cédula:', error);
      toast.error('Error al eliminar cédula');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentos de Identidad (Requeridos)
          </h3>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              La cédula de ciudadanía es requerida para iniciar procesos de negociación.
            </p>
          </div>
        </div>

        {/* Card de Cédula */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-xl p-6 ${
            tieneCedula
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
              : 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
          }`}
        >
          <div className="flex items-start justify-between">
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-5 h-5 ${
                  tieneCedula ? 'text-green-600' : 'text-orange-600'
                }`} />
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Cédula de Ciudadanía
                </h4>
                {tieneCedula ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>

              {tieneCedula ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ✅ Documento cargado
                  </p>
                  <p className="text-xs text-gray-500">
                    📄 {documentoIdentidadUrl.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    📅 Archivo disponible
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                    ⚠️ No subida
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Requerido para iniciar negociaciones
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {tieneCedula ? (
                <>
                  <button
                    onClick={() => window.open(documentoIdentidadUrl, '_blank')}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Ver documento"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMostrarModal(true)}
                    className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                    title="Reemplazar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={cargando}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMostrarModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Subir Cédula de Ciudadanía
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Subida */}
      {mostrarModal && (
        <ModalSubirCedula
          clienteId={clienteId}
          clienteNombre={clienteNombre}
          numeroDocumento={numeroDocumento}
          onSuccess={(url) => {
            onActualizar(url);
            setMostrarModal(false);
          }}
          onCancel={() => setMostrarModal(false)}
        />
      )}
    </>
  );
}
```

---

## 🔒 **VALIDACIÓN ÚNICA**

### En Tab "Negociaciones":

```typescript
// negociaciones-tab.tsx

export default function NegociacionesTab({ cliente, negociaciones }) {
  const tieneCedula = !!cliente.documento_identidad_url;

  return (
    <div>
      {/* Banner de advertencia si NO tiene cédula */}
      {!tieneCedula && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                Cédula de ciudadanía requerida
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Para crear negociaciones, primero debes subir la cédula del cliente en la pestaña "Documentos".
              </p>
              <button
                onClick={() => cambiarTab('documentos')}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 underline mt-2"
              >
                Ir a Documentos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de negociaciones */}
      <div className="space-y-4 mb-6">
        {negociaciones.map(neg => (
          <NegociacionCard key={neg.id} negociacion={neg} />
        ))}
      </div>

      {/* Botón crear (deshabilitado si no tiene cédula) */}
      <button
        onClick={iniciarCreacion}
        disabled={!tieneCedula}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          tieneCedula
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Plus className="w-4 h-4" />
        Crear Negociación
        {!tieneCedula && <Lock className="w-4 h-4 ml-2" />}
      </button>
    </div>
  );
}
```

---

## 📋 **RESUMEN EJECUTIVO**

### ✅ **1 SOLO LUGAR para subir**:
- **Tab "Documentos"** → Sección "Documentos de Identidad"
- Componente: `SeccionDocumentosIdentidad`
- Botón: "Subir Cédula de Ciudadanía"

### ✅ **1 SOLO LUGAR para validar**:
- Campo: `clientes.documento_identidad_url`
- Validación: `if (!cliente.documento_identidad_url)`
- Punto de bloqueo: Tab "Negociaciones" (botón deshabilitado + banner)

### ✅ **1 FLUJO claro**:
```
1. Crear cliente (sin cédula)
   ↓
2. Ver detalle → Tab "Documentos"
   ↓
3. Sección "Documentos de Identidad" → Subir cédula
   ↓
4. Tab "Negociaciones" → Botón habilitado ✅
   ↓
5. Crear negociación (validación automática)
```

### ✅ **Sin duplicación**:
- ❌ NO hay banner en página principal
- ❌ NO hay modal al abrir detalle
- ❌ NO hay múltiples lugares de subida
- ✅ TODO centralizado en Tab "Documentos"

---

## 🚀 **IMPLEMENTACIÓN - Archivos a Crear/Modificar**

### Crear (NUEVO):
1. `modal-subir-cedula.tsx` (250 líneas)
2. `seccion-documentos-identidad.tsx` (200 líneas)

### Modificar (EXISTENTE):
1. `documentos-tab.tsx` → Agregar `<SeccionDocumentosIdentidad />` al inicio
2. `negociaciones-tab.tsx` → Agregar banner + deshabilitar botón si no hay cédula
3. `useCrearNegociacion.ts` → Mantener validación (doble check)

**Total: ~2 horas de desarrollo** ⏱️

---

## ✅ **¿Procedo con esta implementación?**

Este enfoque cumple 100% tu requerimiento:
- **1 lugar** para gestionar (Tab Documentos)
- **1 campo** para validar (documento_identidad_url)
- **Flujo claro** y sin confusión
- **Sin duplicación** de controles
