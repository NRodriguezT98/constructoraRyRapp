# 🔐 Flujo Completo - Cédula de Cliente

## 📋 ORDEN Y FLUJO DETALLADO

### ✅ **OPCIÓN RECOMENDADA: Cédula Opcional con Controles Estrictos**

---

## 🔄 FLUJO PASO A PASO

### **PASO 1: Creación de Cliente** (Sin cédula)
```
Usuario → Formulario Crear Cliente
├── Campos obligatorios:
│   ├── Nombres ✅
│   ├── Apellidos ✅
│   ├── Tipo documento ✅
│   ├── Número documento ✅
│   ├── Email ✅
│   └── Teléfono ✅
└── Campo OPCIONAL:
    └── Archivo cédula (documento_identidad_url) ⚠️
```

**Resultado**: Cliente creado SIN cédula → `documento_identidad_url = null`

---

### **PASO 2: Vista de Cliente Creado** (Banner de alerta)
```
Usuario → Lista de Clientes → Click en cliente
├── Cliente Detail Page se abre
└── SI documento_identidad_url === null:
    ├── 🚨 Banner SUPERIOR (ROJO/NARANJA):
    │   "⚠️ Este cliente no tiene cargada su cédula de ciudadanía.
    │    [Subir Cédula Ahora] [Recordar después]"
    └── Badge en Tab "Información":
        "⚠️ Cédula Pendiente" (color naranja)
```

**Dónde**: `src/modules/clientes/components/cliente-detalle-client.tsx`

---

### **PASO 3: Subir Cédula** (2 puntos de entrada)

#### **3A. Desde Banner (Recomendado)**
```
Usuario → Click "Subir Cédula Ahora"
└── Modal: ModalSubirCedula
    ├── Título: "Subir Cédula de Ciudadanía"
    ├── Subtitle: "{cliente.nombres} - CC {cliente.numero_documento}"
    ├── Input: Drag & Drop o Click para seleccionar
    ├── Validaciones:
    │   ├── Solo PDF, JPG, PNG
    │   ├── Max 5MB
    │   └── Nombre archivo visible
    └── Botones:
        ├── [Cancelar] → Cierra modal
        └── [Subir Documento] → Ejecuta upload
```

**Lógica**:
```typescript
async function subirCedula(file: File) {
  // 1. Upload a Supabase Storage
  const filePath = `clientes/${clienteId}/cedula-${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('documentos-clientes')
    .upload(filePath, file);

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('documentos-clientes')
    .getPublicUrl(filePath);

  // 3. Actualizar cliente
  await supabase
    .from('clientes')
    .update({ documento_identidad_url: publicUrl })
    .eq('id', clienteId);

  // 4. Actualizar UI
  setCliente(prev => ({ ...prev, documento_identidad_url: publicUrl }));

  // 5. Banner desaparece automáticamente
  toast.success('Cédula subida exitosamente');
}
```

#### **3B. Desde Tab "Documentos"** (Alternativa)
```
Usuario → Tab "Documentos" → Sección "Documentos de Identidad"
└── Card: "Cédula de Ciudadanía"
    ├── SI tiene: Thumbnail + [Ver] [Cambiar]
    └── SI NO tiene: [Subir Cédula] → Abre mismo modal
```

---

### **PASO 4: Intentar Crear Negociación** (Validación estricta)

#### **4A. Sin Cédula Subida** ❌
```
Usuario → Tab "Negociaciones" → Click "Crear Negociación"
└── ANTES de abrir wizard:
    ├── Hook: useCrearNegociacion → validarDocumentoIdentidad()
    └── IF documento_identidad_url === null:
        ├── ❌ NO abre wizard
        ├── Toast error: "No se puede crear negociación sin cédula"
        └── Modal alternativo:
            ├── Título: "Cédula Requerida"
            ├── Mensaje: "Para crear una negociación, primero debes subir
            │            la cédula de ciudadanía del cliente."
            └── Botones:
                ├── [Subir Ahora] → Abre ModalSubirCedula
                └── [Cancelar] → Cierra modal
```

**Código**:
```typescript
// useCrearNegociacion.ts
const validarDocumentoIdentidad = () => {
  if (!cliente?.documento_identidad_url) {
    toast.error('El cliente debe tener cargada su cédula de ciudadanía');
    setMostrarModalCedulaRequerida(true); // Nuevo estado
    return false;
  }
  return true;
};

const iniciarCreacion = () => {
  if (!validarDocumentoIdentidad()) return; // 🚫 BLOQUEA AQUÍ
  setMostrarWizard(true); // Solo si tiene cédula
};
```

#### **4B. Con Cédula Subida** ✅
```
Usuario → Click "Crear Negociación"
├── Validación pasa ✅
└── Wizard se abre normalmente
    └── Paso 1: Seleccionar Vivienda
        └── ... continúa flujo normal
```

---

## 🗂️ ARQUITECTURA DE ARCHIVOS

### **Nuevos Componentes a Crear**

#### **1. ModalSubirCedula.tsx** (Compartido)
```
src/modules/clientes/components/modals/
└── modal-subir-cedula.tsx (250 líneas)
    ├── Props: clienteId, onSuccess, onCancel
    ├── Estados: archivo, subiendo, progreso
    ├── Funciones: handleFileSelect, subirCedula
    └── UI: Drag & Drop zone + botones
```

#### **2. ModalCedulaRequerida.tsx** (Validación)
```
src/modules/clientes/components/modals/
└── modal-cedula-requerida.tsx (150 líneas)
    ├── Props: clienteId, onSubirAhora, onCancelar
    ├── UI: Warning icon + mensaje + botones
    └── Abre ModalSubirCedula al click "Subir Ahora"
```

#### **3. BannerCedulaPendiente.tsx** (Alert)
```
src/modules/clientes/components/
└── banner-cedula-pendiente.tsx (100 líneas)
    ├── Props: clienteId, onSubido
    ├── Muestra solo si documento_identidad_url === null
    └── Botones: [Subir Ahora] [Recordar Después]
```

### **Modificaciones en Archivos Existentes**

#### **cliente-detalle-client.tsx**
```typescript
// Agregar al inicio del componente
{!cliente.documento_identidad_url && (
  <BannerCedulaPendiente
    clienteId={clienteId}
    onSubido={(url) => {
      setCliente(prev => ({ ...prev, documento_identidad_url: url }));
    }}
  />
)}
```

#### **useCrearNegociacion.ts**
```typescript
// Ya existe validarDocumentoIdentidad()
// Solo agregar estado para modal de bloqueo
const [mostrarModalCedulaRequerida, setMostrarModalCedulaRequerida] = useState(false);
```

#### **documentos-tab.tsx** (Tab Documentos)
```typescript
// Agregar sección "Documentos de Identidad"
<SeccionDocumentosIdentidad
  clienteId={clienteId}
  documentoIdentidadUrl={cliente.documento_identidad_url}
  onActualizar={(url) => actualizarCliente({ documento_identidad_url: url })}
/>
```

---

## 🎯 PUNTOS DE CONTROL VISUAL

### **1. Lista de Clientes** (Vista general)
```
┌─────────────────────────────────────┐
│ Cliente: Juan Pérez                 │
│ CC: 1234567890                      │
│ ⚠️ Cédula pendiente                 │ ← Badge naranja
└─────────────────────────────────────┘
```

### **2. Detalle de Cliente** (Banner superior)
```
┌─────────────────────────────────────────────────┐
│ 🚨 ALERTA: Cédula de Ciudadanía Pendiente      │
│ Este cliente no tiene cargada su cédula.        │
│ [Subir Ahora] [Recordar Después]               │
└─────────────────────────────────────────────────┘
```

### **3. Tab Información** (Badge en título)
```
Información General  ⚠️ Cédula Pendiente
```

### **4. Tab Negociaciones** (Botón deshabilitado)
```
[➕ Crear Negociación] ← Habilitado solo si tiene cédula
```

### **5. Modal de Validación** (Al intentar crear sin cédula)
```
┌─────────────────────────────────────┐
│ ⚠️  Cédula Requerida                │
│                                     │
│ Para crear una negociación, primero │
│ debes subir la cédula de ciudadanía │
│ del cliente.                        │
│                                     │
│    [Subir Ahora]  [Cancelar]       │
└─────────────────────────────────────┘
```

---

## 📊 DIAGRAMA DE FLUJO VISUAL

```
┌──────────────────────────────────────────────────────────────┐
│                     INICIO: Crear Cliente                     │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ ¿Subió cédula en el  │
                  │   formulario?        │
                  └──────┬─────────┬─────┘
                         │         │
                    SÍ   │         │  NO
                         ▼         ▼
              ┌──────────────┐  ┌──────────────────┐
              │ Cliente      │  │ Cliente creado   │
              │ completado   │  │ SIN cédula       │
              └──────┬───────┘  └────────┬─────────┘
                     │                   │
                     │                   ▼
                     │         ┌──────────────────────┐
                     │         │ BANNER ROJO aparece  │
                     │         │ en detalle           │
                     │         └────────┬─────────────┘
                     │                  │
                     │                  ▼
                     │         ┌──────────────────────┐
                     │         │ Usuario puede:       │
                     │         │ 1. Subir desde banner│
                     │         │ 2. Subir desde docs  │
                     │         │ 3. Ignorar (⚠️)     │
                     │         └────────┬─────────────┘
                     │                  │
                     │                  ▼
                     │         ┌──────────────────────┐
                     │         │ Click "Crear         │
                     │         │  Negociación"        │
                     │         └────────┬─────────────┘
                     │                  │
                     │                  ▼
                     │         ┌──────────────────────┐
                     │         │ VALIDACIÓN:          │
                     │         │ ¿Tiene cédula?       │
                     │         └──────┬─────────┬─────┘
                     │                │         │
                     │           NO   │         │  SÍ
                     │                ▼         │
                     │      ┌──────────────┐    │
                     │      │ ❌ BLOQUEO   │    │
                     │      │ Modal error  │    │
                     │      │ [Subir Ahora]│    │
                     │      └──────────────┘    │
                     │                          │
                     └──────────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ ✅ Wizard abre   │
                          │ normalmente      │
                          └──────────────────┘
```

---

## 🚀 IMPLEMENTACIÓN - ORDEN DE DESARROLLO

### **Fase 1: Infraestructura (30 min)**
1. Crear `ModalSubirCedula.tsx` (componente reutilizable)
2. Crear servicio `subirDocumentoIdentidad()` en `clientes.service.ts`
3. Agregar método `actualizarDocumentoIdentidad()` al servicio

### **Fase 2: Alertas Visuales (45 min)**
4. Crear `BannerCedulaPendiente.tsx`
5. Integrar banner en `cliente-detalle-client.tsx`
6. Agregar badge "Cédula Pendiente" en Tab Información
7. Agregar badge en lista de clientes (opcional)

### **Fase 3: Validación Estricta (30 min)**
8. Crear `ModalCedulaRequerida.tsx`
9. Modificar `useCrearNegociacion.ts` para agregar estado del modal
10. Integrar validación en botón "Crear Negociación"

### **Fase 4: Puntos de Subida Alternativos (30 min)**
11. Agregar sección "Documentos de Identidad" en `documentos-tab.tsx`
12. Permitir subir/cambiar cédula desde ahí

### **Fase 5: Testing (30 min)**
13. Probar flujo completo con cliente SIN cédula
14. Probar flujo completo con cliente CON cédula
15. Validar todos los puntos de control

**TOTAL: ~2.5 horas**

---

## 🎨 CÓDIGO DE EJEMPLO - ModalSubirCedula

```typescript
// src/modules/clientes/components/modals/modal-subir-cedula.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface ModalSubirCedulaProps {
  clienteId: string;
  clienteNombre: string;
  numeroDocumento: string;
  onSuccess: (url: string) => void;
  onCancel: () => void;
}

export default function ModalSubirCedula({
  clienteId,
  clienteNombre,
  numeroDocumento,
  onSuccess,
  onCancel
}: ModalSubirCedulaProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !extensionesPermitidas.includes(extension)) {
      toast.error('Solo se permiten archivos PDF, JPG o PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('El archivo no puede superar los 5MB');
      return;
    }

    setArchivo(file);
  };

  const subirCedula = async () => {
    if (!archivo) return;

    setSubiendo(true);
    setProgreso(0);

    try {
      // 1. Upload a Storage
      const extension = archivo.name.split('.').pop();
      const filePath = `clientes/${clienteId}/cedula-${Date.now()}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-clientes')
        .upload(filePath, archivo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setProgreso(50);

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-clientes')
        .getPublicUrl(filePath);

      setProgreso(75);

      // 3. Actualizar registro de cliente
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ documento_identidad_url: publicUrl })
        .eq('id', clienteId);

      if (updateError) throw updateError;

      setProgreso(100);

      toast.success('Cédula subida exitosamente');
      onSuccess(publicUrl);

    } catch (error: any) {
      console.error('Error subiendo cédula:', error);
      toast.error(error.message || 'Error al subir cédula');
    } finally {
      setSubiendo(false);
      setProgreso(0);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subir Cédula de Ciudadanía
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {clienteNombre} - CC {numeroDocumento}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload Zone */}
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              {archivo ? (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {archivo.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click para seleccionar o arrastra aquí
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 5MB)
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                disabled={subiendo}
              />
            </label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                La cédula es requerida para crear negociaciones.
                Asegúrate de que sea legible y esté completa.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {subiendo && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-center mt-1">
                Subiendo... {progreso}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={subiendo}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={subirCedula}
              disabled={!archivo || subiendo}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subiendo ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

---

## 📌 RESUMEN EJECUTIVO

### ✅ **DÓNDE se sube**:
1. **Al crear cliente** (opcional) → Formulario inicial
2. **Desde banner** (recomendado) → Modal dedicado en detalle
3. **Desde tab Documentos** (alternativo) → Sección específica

### ✅ **DÓNDE se valida**:
1. **Antes de abrir wizard** → Hook `useCrearNegociacion`
2. **En botón "Crear Negociación"** → Modal de bloqueo si falta

### ✅ **ORDEN del flujo**:
1. Crear cliente (con/sin cédula)
2. Ver detalle → Banner si falta
3. Subir desde banner/docs
4. Crear negociación → Validación estricta
5. Si falta → Modal bloqueo + opción subir
6. Si tiene → Wizard abre normal

### ✅ **Controles visuales**:
- 🚨 Banner rojo en detalle
- ⚠️ Badge en lista y tabs
- 🔒 Validación antes de wizard
- 📄 Sección dedicada en Documentos

---

## ✅ **¿Apruebas este flujo?**

Si estás de acuerdo, procedo a implementar en este orden:
1. **ModalSubirCedula** (30 min)
2. **BannerCedulaPendiente** (20 min)
3. **Validación en useCrearNegociacion** (15 min)
4. **Integrar todo** (20 min)

**Total: ~1.5 horas** ⏱️
