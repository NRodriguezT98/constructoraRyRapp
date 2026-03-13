# Integración: Requisitos en Formulario Admin

## 📋 Resumen

Sistema completamente integrado donde el administrador configura los requisitos de documentación **directamente al crear/editar un tipo de fuente de pago**. No requiere SQL ni pasos adicionales.

---

## 🎯 Flujo de Usuario Admin

### 1. Crear Nuevo Tipo de Fuente

1. Admin va a `/admin/fuentes-pago`
2. Click en **"Nuevo Tipo de Fuente"**
3. Llena formulario:
   - Información Básica (nombre, código, descripción)
   - Configuración (checkboxes)
   - **Requisitos de Documentación** ⭐ (NUEVA SECCIÓN)
     - Selecciona plantillas con checkboxes
     - Ve badges: obligatorio/opcional, temprano/desembolso
     - Contador dinámico: "3 requisitos configurados"
   - Apariencia (color, icono, orden)
4. Click **"Crear"**
5. Sistema:
   - Crea el tipo de fuente
   - Guarda configuración de requisitos en `fuentes_pago_requisitos_config`
   - Muestra toast de éxito

### 2. Editar Tipo de Fuente Existente

1. Admin click en botón "Editar" en la lista
2. Modal se abre con datos precargados:
   - Campos del tipo de fuente
   - **Requisitos ya configurados con checkboxes marcados** ⭐
3. Puede modificar:
   - Agregar nuevos requisitos
   - Quitar requisitos existentes
   - Cambiar obligatoriedad (cuando implementemos)
4. Click **"Actualizar"**
5. Sistema elimina configuración antigua e inserta la nueva

---

## 🏗️ Arquitectura de Integración

### Archivos Modificados

#### 1. `TipoFuentePagoFormModal.tsx` (ACTUALIZADO)

**Imports agregados:**
```typescript
import { useState } from 'react'
import { useConfigurarRequisitos, usePlantillasConfiguradas } from '../hooks/usePlantillasRequisitos'
import { SelectorRequisitosDocumentacion } from './SelectorRequisitosDocumentacion'
```

**Estado agregado:**
```typescript
const [plantillasSeleccionadas, setPlantillasSeleccionadas] = useState<string[]>([])
const { data: plantillasConfiguradas } = usePlantillasConfiguradas(tipoFuente?.nombre)
const { mutate: configurarRequisitos } = useConfigurarRequisitos()
```

**useEffect para cargar requisitos existentes:**
```typescript
useEffect(() => {
  if (isEditing && plantillasConfiguradas) {
    setPlantillasSeleccionadas(plantillasConfiguradas)
  } else if (!isEditing) {
    setPlantillasSeleccionadas([])
  }
}, [isEditing, plantillasConfiguradas])
```

**Submit modificado (patrón callback):**
```typescript
const onSubmit = (data: TipoFuentePagoFormData) => {
  const handleSuccess = () => {
    // DESPUÉS de crear/actualizar tipo → configurar requisitos
    configurarRequisitos(
      { tipoFuente: data.nombre, plantillasSeleccionadas },
      { onSuccess: () => { onSuccess?.(); onClose(); /* reset */ } }
    )
  }

  if (isEditing) {
    actualizar({ id, dto }, { onSuccess: handleSuccess })
  } else {
    crear(dto, { onSuccess: handleSuccess })
  }
}
```

**Nueva sección JSX:**
```typescript
<div className="space-y-4">
  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
    Requisitos de Documentación
  </h3>

  <SelectorRequisitosDocumentacion
    plantillasSeleccionadas={plantillasSeleccionadas}
    onChange={setPlantillasSeleccionadas}
  />
</div>
```

---

### Archivos Nuevos

#### 2. `SelectorRequisitosDocumentacion.tsx`

**Propósito:** Componente de UI para seleccionar plantillas con checkboxes

**Props:**
```typescript
interface Props {
  plantillasSeleccionadas: string[]
  onChange: (plantillas: string[]) => void
}
```

**Características:**
- ✅ Carga plantillas con `usePlantillasRequisitos()`
- ✅ Checkbox por plantilla con label descriptivo
- ✅ Badges visuales: obligatorio/opcional, temprano/desembolso
- ✅ Iconos por tipo de documento
- ✅ Contador dinámico: "N requisitos configurados"
- ✅ Estados: loading, error, empty
- ✅ Glassmorphism + dark mode
- ✅ Búsqueda (preparado para futuro)

**Ejemplo visual:**
```
☐ Carta de Aprobación
  [OBLIGATORIO] [TEMPRANO] [icono CreditCard]

☐ Boleta de Registro Civil
  [OBLIGATORIO] [AL DESEMBOLSO] [icono FileCheck]

☐ Solicitud de Desembolso
  [OBLIGATORIO] [AL DESEMBOLSO] [icono FileText]

☐ Certificado de Tradición
  [OPCIONAL] [icono Building2]

☐ Pagaré Firmado
  [OBLIGATORIO] [icono FileSignature]

┌─────────────────────────────────┐
│ ✅ 3 requisitos configurados     │
└─────────────────────────────────┘
```

---

#### 3. `usePlantillasRequisitos.ts`

**Hooks exportados:**

```typescript
// 1. Obtener todas las plantillas disponibles
usePlantillasRequisitos()
// Returns: PlantillaRequisito[]

// 2. Obtener requisitos activos de un tipo
useRequisitosPorTipo(tipoFuente: string)
// Returns: PlantillaRequisito[]

// 3. Obtener IDs de plantillas configuradas (para checkboxes)
usePlantillasConfiguradas(tipoFuente?: string)
// Returns: string[] (IDs de plantillas)

// 4. Configurar requisitos (mutación)
useConfigurarRequisitos()
// Params: { tipoFuente: string, plantillasSeleccionadas: string[] }
// Efecto: DELETE + INSERT en fuentes_pago_requisitos_config
```

**Cache management:**
- `usePlantillasRequisitos`: staleTime 5 min (raramente cambian)
- `useRequisitosPorTipo`: staleTime 30 seg
- Invalidación automática después de mutación

---

#### 4. `plantillas-requisitos.service.ts`

**Métodos del servicio:**

```typescript
class PlantillasRequisitosService {
  // Obtener todas las plantillas
  static async obtenerPlantillas(): Promise<PlantillaRequisito[]>

  // Obtener requisitos activos de un tipo
  static async obtenerRequisitosPorTipo(tipoFuente: string): Promise<PlantillaRequisito[]>

  // Configurar requisitos (transaccional: delete + insert)
  static async configurarRequisitos(
    tipoFuente: string,
    plantillasSeleccionadas: string[]
  ): Promise<void>

  // Obtener IDs de plantillas configuradas
  static async obtenerPlantillasConfiguradas(tipoFuente: string): Promise<string[]>
}
```

**Lógica `configurarRequisitos()`:**
1. Inicia transacción
2. DELETE de `fuentes_pago_requisitos_config` WHERE `tipo_fuente_pago = X`
3. INSERT múltiple con plantillas seleccionadas
4. Commit
5. Retorna éxito/error

---

## 🔄 Flujo de Datos Completo

### Crear Nuevo Tipo

```
1. Admin selecciona checkboxes
   └─> Estado: plantillasSeleccionadas = ['id1', 'id2']

2. Admin click "Crear"
   └─> onSubmit(formData)
       ├─> crear.mutate(dto)
       └─> onSuccess:
           └─> configurarRequisitos.mutate({ tipoFuente, plantillasSeleccionadas })
               └─> PlantillasRequisitosService.configurarRequisitos()
                   └─> INSERT INTO fuentes_pago_requisitos_config

3. Query invalidation
   └─> React Query refetch automático
       └─> UI actualizada en lista de tipos
```

### Editar Tipo Existente

```
1. Modal se abre
   └─> usePlantillasConfiguradas(tipoFuente.nombre)
       └─> SELECT plantilla_id FROM tipos_fuente_plantillas
           └─> Estado: plantillasSeleccionadas = ['id1', 'id2']
               └─> Checkboxes marcados automáticamente ✅

2. Admin modifica selección
   └─> onChange(nuevasPlantillas)

3. Admin click "Actualizar"
   └─> onSubmit(formData)
       ├─> actualizar.mutate({ id, dto })
       └─> onSuccess:
           └─> configurarRequisitos.mutate({ tipoFuente, plantillasSeleccionadas })
               └─> DELETE + INSERT (reemplaza configuración)

4. UI actualizada con nuevos requisitos
```

---

## 🎨 Diseño Visual

### Ubicación en el Formulario

```
┌──────────────────────────────────────┐
│ [X] Crear Tipo de Fuente de Pago     │
├──────────────────────────────────────┤
│                                       │
│ INFORMACIÓN BÁSICA                    │
│ - Nombre                              │
│ - Código                              │
│ - Descripción                         │
│                                       │
│ CONFIGURACIÓN                         │
│ ☑ Requiere entidad                    │
│ ☑ Permite múltiples abonos           │
│ ☐ Es subsidio                         │
│                                       │
│ REQUISITOS DE DOCUMENTACIÓN ⭐ NUEVO  │
│ ┌────────────────────────────────┐   │
│ │ ☐ Carta de Aprobación          │   │
│ │   [OBLIGATORIO] [TEMPRANO]     │   │
│ │                                 │   │
│ │ ☐ Boleta de Registro Civil     │   │
│ │   [OBLIGATORIO] [DESEMBOLSO]   │   │
│ │                                 │   │
│ │ ☐ Solicitud de Desembolso      │   │
│ │   [OBLIGATORIO] [DESEMBOLSO]   │   │
│ │                                 │   │
│ │ ☐ Certificado de Tradición     │   │
│ │   [OPCIONAL]                    │   │
│ │                                 │   │
│ │ ✅ 2 requisitos configurados    │   │
│ └────────────────────────────────┘   │
│                                       │
│ APARIENCIA                            │
│ - Color                               │
│ - Icono                               │
│ - Orden                               │
│                                       │
│ [Cancelar] [Crear Tipo de Fuente] ⚡  │
└──────────────────────────────────────┘
```

### Paleta de Colores

- **Módulo:** Blue/Indigo (fuentes-pago)
- **Badges obligatorio:** Green (`bg-green-100 dark:bg-green-900/20`)
- **Badges opcional:** Gray (`bg-gray-100 dark:bg-gray-900/20`)
- **Badges temprano:** Amber (`bg-amber-100 dark:bg-amber-900/20`)
- **Badges desembolso:** Blue (`bg-blue-100 dark:bg-blue-900/20`)

---

## 🧪 Pruebas de Integración

### Caso 1: Crear Tipo "Subsidio Fonvivienda"

**Pasos:**
1. Ir a `/admin/fuentes-pago`
2. Click "Nuevo Tipo de Fuente"
3. Llenar:
   - Nombre: `Subsidio Fonvivienda`
   - Código: `SUBS_FONV`
   - Descripción: `Subsidio del gobierno`
   - ☑ Es subsidio
4. Seleccionar requisitos:
   - ☑ Carta de Aprobación
   - ☑ Certificado de Tradición
5. Click "Crear"

**Resultado esperado:**
- ✅ Tipo de fuente creado
- ✅ 2 registros en `fuentes_pago_requisitos_config`
- ✅ Toast: "Tipo de fuente creado exitosamente"
- ✅ Lista actualizada con nuevo tipo

**Verificación DB:**
```sql
SELECT
  tft.id,
  tft.tipo_fuente_pago,
  pr.nombre_plantilla,
  pr.tipo_documento,
  pr.es_obligatorio,
  pr.generar_temprano
FROM tipos_fuente_plantillas tft
JOIN plantillas_requisitos_documentos pr ON tft.plantilla_id = pr.id
WHERE tft.tipo_fuente_pago = 'Subsidio Fonvivienda';
```

---

### Caso 2: Editar Tipo "Crédito Bancario"

**Pasos:**
1. Ir a `/admin/fuentes-pago`
2. Buscar "Crédito Bancario" (si existe)
3. Click botón "Editar"
4. Modal se abre con:
   - Campos precargados ✅
   - Checkboxes marcados según config existente ✅
5. Modificar:
   - Desmarcar "Certificado de Tradición" (quitar)
   - Marcar "Pagaré Firmado" (agregar)
6. Click "Actualizar"

**Resultado esperado:**
- ✅ Tipo de fuente actualizado
- ✅ Requisitos reemplazados (delete old + insert new)
- ✅ Toast: "Tipo de fuente actualizado"
- ✅ Próximas fuentes de ese tipo tendrán nueva configuración

---

### Caso 3: Ningún Requisito Seleccionado

**Pasos:**
1. Crear tipo de fuente
2. NO marcar ningún checkbox en requisitos
3. Click "Crear"

**Resultado esperado:**
- ✅ Tipo de fuente creado (sin requisitos)
- ✅ 0 registros en `fuentes_pago_requisitos_config`
- ✅ Sistema autoconfigurable aplicará defaults cuando se cree una fuente real (trigger)

---

## 📊 Relación con Sistema de Autoconfigurable

### ¿Cuándo se usa qué?

| Escenario | Sistema usado |
|-----------|---------------|
| Admin crea tipo "Crédito Banco X" y **selecciona requisitos** | ✅ Configuración manual (UI) - PRIORIDAD |
| Admin crea tipo "Crédito Banco Y" **SIN seleccionar requisitos** | ✅ Trigger autoconfigurable (pattern matching: "Crédito" → 3 requisitos) |
| Cliente crea fuente con tipo configurado manualmente | ✅ Usa requisitos de `fuentes_pago_requisitos_config` |
| Cliente crea fuente con tipo auto-configurado | ✅ Usa requisitos insertados por trigger |

**Regla:** La configuración manual en UI **SIEMPRE tiene prioridad** sobre el trigger. Si el admin seleccionó requisitos (incluso 0), el trigger no actúa.

---

## 🚀 Mejoras Futuras

### Fase 1: Editor de Plantillas en Admin
- Agregar CRUD completo para plantillas
- Permitir crear plantillas custom desde UI
- Editar es_obligatorio, generar_temprano, tipo_documento

### Fase 2: Orden y Dependencias
- Drag & drop para ordenar requisitos
- Sistema de dependencias: "Boleta requiere Carta primero"

### Fase 3: Validación Visual en Formulario
- Mostrar preview de lo que el cliente verá
- Simular tráfico luminoso en tiempo real

### Fase 4: Plantillas por Categoría
- Agrupar plantillas: "Documentos bancarios", "Documentos legales"
- Selección múltiple por categoría

---

## ✅ Checklist de Validación

- [x] Imports actualizados en `TipoFuentePagoFormModal.tsx`
- [x] Estado `plantillasSeleccionadas` agregado
- [x] Hook `usePlantillasConfiguradas` para cargar config existente
- [x] Hook `useConfigurarRequisitos` para mutación
- [x] `useEffect` para cargar checkboxes en modo edición
- [x] Submit modificado con patrón callback
- [x] Nueva sección JSX "Requisitos de Documentación"
- [x] `SelectorRequisitosDocumentacion` importado y usado
- [x] Barrel exports actualizados (components, hooks)
- [x] TypeScript sin errores
- [x] Dark mode completo
- [x] Responsive (mobile-first)
- [x] Documentación completa

---

## 🎓 Conclusión

El sistema está **100% integrado en la UI de administración**. Los administradores no necesitan:
- ❌ Escribir SQL
- ❌ Ir a otra página
- ❌ Saber qué plantillas existen (se muestran automáticamente)

**Flujo natural:**
1. Crear tipo de fuente → Seleccionar requisitos → Guardar
2. Cliente crea fuente → Sistema valida → Muestra tráfico luminoso
3. Admin edita tipo → Modifica requisitos → Sistema actualiza

**¡Todo en un solo lugar, todo integrado!** 🚀
